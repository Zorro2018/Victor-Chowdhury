// "Book time with me" -- the scheduling section on victorbuildsai.com.
//
// Unlike Talk to Victor (which places a HOLD and waits for Victor's approval),
// this books straight away: the visitor picks a 15/30/45/60-minute slot from
// Victor's live free/busy, and we create a confirmed Google Calendar event with
// a Meet link and both people on it. Google emails the invite to the visitor;
// Victor gets the event on his calendar plus an email with the details.
//
// POST { action: "slots", duration }
// POST { action: "book", duration, start, name, email, company, role, job_link, notes, timezone, website }
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  accessToken, busyBlocks, buildSlots, ctDayKey, describeSlot, DURATIONS, gapi, horizonEnd, OWNER_EMAIL, TZ,
} from "./gcal.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const SITE = "https://www.victorbuildsai.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BOOKINGS_PER_IP_PER_DAY = 3;
const MAX_UPCOMING_PER_EMAIL = 2;

// deno-lint-ignore no-explicit-any
type Supa = any;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const body = await req.json().catch(() => ({}));
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (body.action === "slots") return await handleSlots(supabase, body);
    if (body.action === "book") return await handleBook(supabase, body, ip);
    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("book-time error", e);
    return json({ error: "Something went wrong. Please try again, or email Victor directly." }, 500);
  }
});

function durationOf(v: unknown): number {
  const n = Number(v);
  return DURATIONS.includes(n) ? n : 30;
}

async function computeSlots(supabase: Supa, token: string, duration: number): Promise<string[]> {
  const now = new Date();
  const end = horizonEnd(now);
  const [busy, { data: booked }] = await Promise.all([
    busyBlocks(token, now, end),
    supabase.from("site_bookings").select("start_at").gte("start_at", now.toISOString()).lte("start_at", end.toISOString()),
  ]);
  const perDay: Record<string, number> = {};
  for (const b of booked ?? []) {
    const k = ctDayKey(new Date(b.start_at));
    perDay[k] = (perDay[k] ?? 0) + 1;
  }
  return buildSlots(now, duration, busy, perDay);
}

async function handleSlots(supabase: Supa, body: Record<string, unknown>) {
  const duration = durationOf(body.duration);
  const token = await accessToken(supabase);
  if (!token) return json({ connected: false, slots: [] });
  const slots = await computeSlots(supabase, token, duration);
  return json({ connected: true, timezone: TZ, duration, durations: DURATIONS, slots });
}

async function handleBook(supabase: Supa, body: Record<string, unknown>, ip: string) {
  if (clean(body.website, 200)) return json({ ok: true }); // honeypot: quietly drop bots

  const duration = durationOf(body.duration);
  const name = clean(body.name, 120);
  const email = clean(body.email, 200).toLowerCase();
  const company = clean(body.company, 150);
  const role = clean(body.role, 200);
  const jobLink = clean(body.job_link, 500);
  const notes = clean(body.notes, 1500);
  const bookerTz = clean(body.timezone, 60);
  const start = clean(body.start, 40);

  if (!name || !EMAIL_RE.test(email)) return json({ error: "Please add your name and a valid email." }, 400);
  if (jobLink && !/^https?:\/\//i.test(jobLink)) return json({ error: "The job link should start with https://" }, 400);
  if (!start || isNaN(Date.parse(start))) return json({ error: "Please pick a time." }, 400);

  const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
  const [{ count: ipCount }, { count: upcomingForEmail }] = await Promise.all([
    supabase.from("site_bookings").select("id", { count: "exact", head: true }).eq("ip", ip).gte("created_at", dayAgo),
    supabase.from("site_bookings").select("id", { count: "exact", head: true }).eq("email", email).gte("start_at", new Date().toISOString()),
  ]);
  if ((ipCount ?? 0) >= MAX_BOOKINGS_PER_IP_PER_DAY || (upcomingForEmail ?? 0) >= MAX_UPCOMING_PER_EMAIL) {
    return json({ error: "You already have time booked with Victor. Reply to your invite if you need to change it." }, 429);
  }

  const token = await accessToken(supabase);
  if (!token) return json({ error: "Booking is offline right now. Please use the contact form below." }, 503);

  // Re-check against live free/busy so two people can't grab the same slot
  const fresh = await computeSlots(supabase, token, duration);
  if (!fresh.some((s) => Date.parse(s) === Date.parse(start))) {
    return json({ error: "That time was just taken. Please pick another.", slots: fresh }, 409);
  }
  const startD = new Date(start);
  const endD = new Date(startD.getTime() + duration * 60_000);
  const whenCT = describeSlot(startD, endD);
  const whenThem = bookerTz && isTz(bookerTz) ? describeSlot(startD, endD, bookerTz) : whenCT;

  const details = [
    `Who: ${name} <${email}>`,
    company ? `Company: ${company}` : null,
    role ? `Role: ${role}` : null,
    jobLink ? `Job posting: ${jobLink}` : null,
    notes ? `\nNotes from ${name.split(" ")[0]}:\n${notes}` : null,
  ].filter((x) => x !== null).join("\n");

  const ev = await gapi(token, "/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all", {
    method: "POST",
    body: JSON.stringify({
      summary: `Victor Chowdhury <> ${name}${company ? ` (${company})` : ""}`,
      description: [
        `${duration}-minute call booked through victorbuildsai.com.`,
        "",
        details,
        "",
        "Victor Chowdhury | victorchowdhury1988@gmail.com | victorbuildsai.com",
      ].join("\n"),
      start: { dateTime: startD.toISOString(), timeZone: TZ },
      end: { dateTime: endD.toISOString(), timeZone: TZ },
      attendees: [
        { email: OWNER_EMAIL, responseStatus: "accepted" },
        { email, displayName: name },
      ],
      colorId: "2",
      reminders: { useDefault: true },
      guestsCanModify: false,
      extendedProperties: { private: { bookedVia: "victorbuildsai-book-time" } },
      conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } } },
    }),
  });
  const meet: string | null = ev.hangoutLink
    ?? ev.conferenceData?.entryPoints?.find((e: { entryPointType: string }) => e.entryPointType === "video")?.uri ?? null;

  const { error: insErr } = await supabase.from("site_bookings").insert({
    ip, name, email, company: company || null, role: role || null, job_link: jobLink || null, notes: notes || null,
    duration_minutes: duration, start_at: startD.toISOString(), end_at: endD.toISOString(),
    booker_tz: bookerTz || null, event_id: ev.id ?? null, meet_link: meet,
  });
  if (insErr) console.error("site_bookings insert failed (event already created)", insErr);

  // Ping Victor through the existing contact pipeline too (ntfy/WhatsApp + daily digest)
  await supabase.from("contact_submissions").insert({
    name, email, note: `[Booked ${duration} min] ${whenCT}${company ? `\n${role || "Role n/a"} @ ${company}` : ""}`,
  }).then(({ error }: { error: unknown }) => { if (error) console.error("contact insert failed", error); });

  await sendEmail(supabase, OWNER_EMAIL, `Booked: ${name}${company ? ` (${company})` : ""}, ${whenCT}`, [
    `${name} booked a ${duration}-minute call with you on victorbuildsai.com. It's on your calendar and the invite went to them.`,
    "",
    `When: ${whenCT}${whenThem !== whenCT ? ` (${whenThem} for them)` : ""}`,
    meet ? `Google Meet: ${meet}` : null,
    ev.htmlLink ? `Calendar event: ${ev.htmlLink}` : null,
    "",
    details,
    "",
    "Prep tip: drop the job description into your Application Desk for a fit check and interview prep.",
  ].filter((x) => x !== null).join("\n"), email);

  // Confirmation to the visitor. Google's calendar invite is the main one; this
  // is a plain-text backup with the same details (skipped by Resend until the
  // victorbuildsai.com domain is verified there).
  await sendEmail(supabase, email, `Confirmed: call with Victor Chowdhury, ${whenThem}`, [
    `Hi ${name.split(" ")[0]},`,
    "",
    `You're booked for a ${duration}-minute call with Victor Chowdhury on ${whenThem}.`,
    meet ? `Google Meet: ${meet}` : null,
    "",
    "A Google Calendar invite is on its way as well. If you need to change anything, just reply to this email.",
    "",
    "Victor Chowdhury",
    "victorbuildsai.com",
  ].filter((x) => x !== null).join("\n"), OWNER_EMAIL, true);

  return json({ ok: true, start: startD.toISOString(), end: endD.toISOString(), duration, when: whenThem, meet_link: meet });
}

async function sendEmail(supabase: Supa, to: string, subject: string, text: string, replyTo: string, externalOnly = false) {
  try {
    const { data: key } = await supabase.rpc("get_secret", { secret_name: "resend_api_key" });
    if (!key) return;
    const send = (from: string) => fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, text }),
    });
    let resp = await send("Victor Chowdhury <victor@victorbuildsai.com>");
    if (resp.status === 403 && !externalOnly) {
      // Domain not verified yet: Resend's shared sender still reaches Victor's own inbox.
      console.error("Resend domain send refused:", await resp.text());
      resp = await send("Victor's site <onboarding@resend.dev>");
    }
    if (!resp.ok) console.error("Resend failed", to, resp.status, await resp.text());
  } catch (e) { console.error("sendEmail error", e); }
}

function isTz(tz: string) {
  try { new Intl.DateTimeFormat("en-US", { timeZone: tz }); return true; } catch { return false; }
}
function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, (c) => (c === "\n" ? "\n" : " ")).trim().slice(0, max) : "";
}
function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}
