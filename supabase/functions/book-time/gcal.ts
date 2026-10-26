// Google Calendar helpers for "Book time with me" (victorbuildsai.com).
// Same Google credentials as talk-to-victor: OAuth client + Victor's refresh
// token in Supabase Vault, read through the get_secret RPC.

export const TZ = "America/Chicago";
export const OWNER_EMAIL = "victorchowdhury1988@gmail.com";
export const DURATIONS = [15, 30, 45, 60];
export const DAY_START_HOUR = 8;     // 8:00 AM CT
export const DAY_END_HOUR = 18;      // 6:00 PM CT (meetings end by then)
export const BUFFER_MINUTES = 15;    // kept clear around existing events
export const MIN_NOTICE_HOURS = 12;
export const HORIZON_BUSINESS_DAYS = 15; // about 3 weeks
export const MAX_SITE_BOOKINGS_PER_DAY = 3;

// Calendars whose events block time (primary + both Family calendars)
const BUSY_CALENDARS = [
  "primary",
  "family15191325215158083386@group.calendar.google.com",
  "family11735910387151523864@group.calendar.google.com",
];

// deno-lint-ignore no-explicit-any
type Supa = any;

let cachedToken: { value: string; exp: number } | null = null;

export async function accessToken(supabase: Supa): Promise<string | null> {
  if (cachedToken && cachedToken.exp > Date.now() + 60_000) return cachedToken.value;
  const get = async (n: string) => (await supabase.rpc("get_secret", { secret_name: n })).data as string | null;
  const [cid, secret, refresh] = await Promise.all([
    get("google_client_id"), get("google_client_secret"), get("google_refresh_token"),
  ]);
  if (!cid || !secret || !refresh) return null;
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: cid, client_secret: secret, refresh_token: refresh, grant_type: "refresh_token" }),
  });
  if (!resp.ok) { console.error("Token refresh failed", resp.status, await resp.text()); return null; }
  const data = await resp.json();
  cachedToken = { value: data.access_token, exp: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return cachedToken.value;
}

export async function gapi(token: string, path: string, init: RequestInit = {}) {
  const resp = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const text = await resp.text();
  if (!resp.ok) throw new Error(`Google Calendar ${resp.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

// ---- time-zone helpers (DST-safe, no external libs) ----
function offsetMinutes(at: Date, tz = TZ): number {
  const s = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" })
    .formatToParts(at).find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const m = s.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!m) return 0;
  return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0));
}
/** Wall-clock time in Chicago -> UTC instant */
export function ctToUtc(y: number, mo: number, d: number, h: number, mi: number): Date {
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  let utc = guess - offsetMinutes(new Date(guess)) * 60_000;
  utc = guess - offsetMinutes(new Date(utc)) * 60_000;
  return new Date(utc);
}
/** UTC instant -> Chicago calendar parts */
export function ctParts(at: Date) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, year: "numeric", month: "numeric", day: "numeric", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23",
  }).formatToParts(at).map((x) => [x.type, x.value]));
  return { y: +p.year, mo: +p.month, d: +p.day, wd: p.weekday as string, h: +p.hour, mi: +p.minute };
}
export function ctDayKey(at: Date) {
  const p = ctParts(at);
  return `${p.y}-${String(p.mo).padStart(2, "0")}-${String(p.d).padStart(2, "0")}`;
}
export function fmtCT(at: Date, opts: Intl.DateTimeFormatOptions = {}) {
  return at.toLocaleString("en-US", { timeZone: TZ, ...opts });
}
export function describeSlot(start: Date, end: Date, tz = TZ) {
  const f = (o: Intl.DateTimeFormatOptions) => (x: Date) => x.toLocaleString("en-US", { timeZone: tz, ...o });
  const day = f({ weekday: "short", month: "short", day: "numeric" })(start);
  const t = f({ hour: "numeric", minute: "2-digit" });
  const zone = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
    .formatToParts(start).find((p) => p.type === "timeZoneName")?.value ?? tz;
  return `${day}, ${t(start)}–${t(end)} ${zone}`;
}

export type BusyBlock = { start: number; end: number };

/** Free/busy for every blocking calendar over [from, to]. */
export async function busyBlocks(token: string, from: Date, to: Date): Promise<BusyBlock[]> {
  const fb = await gapi(token, "/freeBusy", {
    method: "POST",
    body: JSON.stringify({
      timeMin: from.toISOString(), timeMax: to.toISOString(), timeZone: TZ,
      items: BUSY_CALENDARS.map((id) => ({ id })),
    }),
  });
  const busy: BusyBlock[] = [];
  for (const cal of Object.values(fb.calendars ?? {}) as { busy?: { start: string; end: string }[] }[]) {
    for (const b of cal.busy ?? []) busy.push({ start: Date.parse(b.start), end: Date.parse(b.end) });
  }
  return busy;
}

/**
 * Pure slot builder (no network): weekday start times between DAY_START_HOUR and
 * DAY_END_HOUR CT, at least MIN_NOTICE_HOURS out, clear of busy blocks padded by
 * BUFFER_MINUTES, skipping days that already hit MAX_SITE_BOOKINGS_PER_DAY.
 */
export function buildSlots(now: Date, duration: number, busy: BusyBlock[], bookingsPerDay: Record<string, number>): string[] {
  const step = duration <= 15 ? 15 : 30;
  const earliest = now.getTime() + MIN_NOTICE_HOURS * 3600_000;
  const pad = BUFFER_MINUTES * 60_000;
  const durMs = duration * 60_000;
  const today = ctParts(now);
  const out: string[] = [];
  let businessDays = 0;
  for (let i = 0; i < 31 && businessDays < HORIZON_BUSINESS_DAYS; i++) {
    const noon = ctToUtc(today.y, today.mo, today.d, 12, 0);
    const dayAt = new Date(noon.getTime() + i * 86_400_000);
    const day = ctParts(dayAt);
    if (day.wd === "Sat" || day.wd === "Sun") continue;
    businessDays++;
    if ((bookingsPerDay[ctDayKey(dayAt)] ?? 0) >= MAX_SITE_BOOKINGS_PER_DAY) continue;
    for (let m = DAY_START_HOUR * 60; m + duration <= DAY_END_HOUR * 60; m += step) {
      const s = ctToUtc(day.y, day.mo, day.d, Math.floor(m / 60), m % 60).getTime();
      if (s < earliest) continue;
      const e = s + durMs;
      if (busy.some((b) => s < b.end + pad && e > b.start - pad)) continue;
      out.push(new Date(s).toISOString());
    }
  }
  return out;
}

export function horizonEnd(now: Date): Date {
  return new Date(now.getTime() + 32 * 86_400_000);
}
