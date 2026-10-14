/* ===========================================================================
   CES Reporting Hub — Portable Demo · shared fake-data engine
   Everything here is procedurally generated from a seeded PRNG so filters
   produce different (but deterministic/stable) numbers without shipping a
   giant pile of hardcoded JSON. No real Walmart data anywhere in this file.
   =========================================================================== */
(function (global) {
    "use strict";

    // ── Seeded PRNG (mulberry32) — same seed always gives same sequence ──────
    function mulberry32(seed) {
        return function () {
            seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    function hashStr(s) {
        let h = 2166136261;
        for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
        return h >>> 0;
    }
    function rngFor(key) { return mulberry32(hashStr(String(key))); }
    function randInt(rng, min, max) { return Math.floor(rng() * (max - min + 1)) + min; }
    function randFloat(rng, min, max, decimals) {
        const v = rng() * (max - min) + min;
        return decimals != null ? +v.toFixed(decimals) : v;
    }
    function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

    // ── Shared lookups ────────────────────────────────────────────────────────
    const FISCAL_YEARS = ["FY2027", "FY2026", "FY2025"];
    const VERTICALS = ["Customer Care", "Financial Services", "Health & Wellness", "Pharmacy", "Auto Care"];
    const SUBLOBS = ["Chat", "Email", "Phone"];
    const DEPARTMENTS = ["Inbound", "Outbound", "Digital"];
    const VENDORS = ["HQ Bentonville", "Partner A", "Partner B", "Partner C"];
    const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const VERTICAL_COLORS = {
        "Customer Care": "#0071CE", "Financial Services": "#FFC220", "Pharmacy": "#00A3E0",
        "Health & Wellness": "#007DC6", "Auto Care": "#004F9F",
    };
    const QUEUES = {
        "Customer Care": ["Chat Support", "Email Support"],
        "Financial Services": ["Billing Support", "Credit Services"],
        "Health & Wellness": ["Wellness Support"],
        "Pharmacy": ["Rx Refills"],
        "Auto Care": ["Tire & Lube"],
    };

    const FILTER_OPTIONS = {
        fiscal_years: FISCAL_YEARS, verticals: VERTICALS, sublobs: SUBLOBS,
        departments: DEPARTMENTS, vendors: VENDORS, months: MONTHS,
    };

    // ── Contacts table (Billable Contacts / Monthly Billable) ───────────────
    // Base volumes per vertical/queue, scaled by a deterministic multiplier
    // derived from the active filter combination.
    const BASE_ROWS = [
        { group: "Customer Care",      queue: "Chat Support",    chatBase: 11000, emailBase: 3200,  offBase: 900  },
        { group: "Customer Care",      queue: "Email Support",   chatBase: 500,   emailBase: 9600,  offBase: 300  },
        { group: "Financial Services", queue: "Billing Support", chatBase: 2200,  emailBase: 1400,  offBase: 600  },
        { group: "Financial Services", queue: "Credit Services", chatBase: 850,   emailBase: 520,   offBase: 200  },
        { group: "Health & Wellness",  queue: "Wellness Support",chatBase: 1400,  emailBase: 2200,  offBase: 280  },
        { group: "Pharmacy",           queue: "Rx Refills",      chatBase: 580,   emailBase: 3600,  offBase: 1050 },
        { group: "Auto Care",          queue: "Tire & Lube",     chatBase: 300,   emailBase: 850,   offBase: 220  },
    ];

    function filterKey(filters) {
        return ["fy", "month", "vertical", "sublob", "dept", "vendor"].map(k => filters?.[k] ?? "all").join("|");
    }

    function getContacts(filters) {
        const key = filterKey(filters || {});
        const rng = rngFor("contacts::" + key);
        // One scale factor per key so every filter change visibly moves the needle.
        const scale = randFloat(rng, 0.78, 1.28, 3);
        let rows = BASE_ROWS.map(r => {
            const jitter = randFloat(rng, 0.9, 1.12, 3);
            const chat = Math.round(r.chatBase * scale * jitter);
            const email = Math.round(r.emailBase * scale * jitter * randFloat(rng, 0.92, 1.08, 3));
            const offline = Math.round(r.offBase * scale * jitter);
            const inbound = chat + email + offline;
            const outbound = Math.round(inbound * randFloat(rng, 0, 0.22, 3));
            return {
                group: r.group, queue: r.queue, chat, email, offline, inbound, outbound,
                total_with_outbound: inbound + outbound,
                total_without_outbound: inbound,
                aht: randInt(rng, 260, 540),
            };
        });
        if (filters?.vertical && filters.vertical !== "all") rows = rows.filter(r => r.group === filters.vertical);
        return { rows, group_colors: VERTICAL_COLORS };
    }

    function getTop5(filters) {
        const key = filterKey(filters || {});
        const rng = rngFor("top5::" + key);
        function buildTile(label, badge) {
            const items = VERTICALS.map((v, i) => ({
                rank: i + 1, vertical: v, color: VERTICAL_COLORS[v],
                total: randInt(rng, 5000, 95000 - i * 12000),
                change_pct: randFloat(rng, -9, 11, 1),
            })).sort((a, b) => b.total - a.total).map((item, i) => ({ ...item, rank: i + 1 }));
            return { label, badge_type: badge, items };
        }
        return {
            tiles: [
                buildTile("Top Verticals — Last 30 Days", "past"),
                buildTile("Top Verticals — Next 30 Days", "future"),
                buildTile("Top Verticals — Last 90 Days", "past"),
                buildTile("Top Verticals — Next 90 Days", "future"),
            ],
        };
    }

    // ── AHT Insights ──────────────────────────────────────────────────────────
    function getAhtKpi(filters) {
        const rng = rngFor("aht-kpi::" + filterKey(filters || {}));
        const overall = randInt(rng, 330, 420);
        return {
            overall,
            chat: overall - randInt(rng, 20, 60),
            email: overall + randInt(rng, 60, 130),
            offline: overall + randInt(rng, 90, 170),
        };
    }
    function getAhtTrend(filters) {
        const rng = rngFor("aht-trend::" + filterKey(filters || {}));
        const base = randInt(rng, 340, 410);
        return MONTHS.slice(0, 12).map((m, i) => ({
            month: m.slice(0, 3),
            aht: Math.round(base + Math.sin(i / 2) * 18 + randFloat(rng, -14, 14, 1)),
        }));
    }

    // Weekly, multi-series AHT view ("AHT Trend — Weekly" in the real app).
    // mode: "channel" (series = Chat/Email/Offline) or "vertical" (series = one
    // line per vertical). Channel colors/labels match the real app's
    // data_loader.py CH_COLORS/CH_LABELS exactly.
    const AHT_WEEKS_COUNT = 26;
    const AHT_CHANNEL_DEFS = [
        ["chat", "Chat", "#FFC220", 330],
        ["email", "Email", "#16A34A", 470],
        ["offline", "Offline", "#E06C00", 540],
    ];
    function buildAhtWeeks() {
        const today = new Date();
        return Array.from({ length: AHT_WEEKS_COUNT }, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - (AHT_WEEKS_COUNT - 1 - i) * 7);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        });
    }
    function getAhtWeeklySeries(mode, vertical, channel) {
        const weeks = buildAhtWeeks();
        const rng = rngFor("aht-weekly::" + mode + "::" + (vertical || "all") + "::" + (channel || "all"));
        function seriesFor(label, color, base) {
            const phase = hashStr(label) % 7;
            return { label, color, data: weeks.map((_, i) => Math.max(120, Math.round(base + Math.sin((i + phase) / 3) * 22 + randFloat(rng, -14, 14, 1)))) };
        }
        if (mode === "vertical") {
            const verts = vertical && vertical !== "all" ? [vertical] : VERTICALS;
            return { weeks, series: verts.map(v => seriesFor(v, VERTICAL_COLORS[v], randInt(rng, 320, 460))) };
        }
        const defs = AHT_CHANNEL_DEFS.filter(([id]) => !channel || channel === "all" || channel === id);
        return { weeks, series: defs.map(([id, label, color, base]) => seriesFor(label, color, base)) };
    }

    // ── Sprint Command Center (condensed Executive Recap) ───────────────────
    const TEAMS = ["Core Metrics", "Legal Tools", "Portfolio Health", "Innovation Portal", "WISE Integration"];
    const SPRINTS = ["Sprint 41", "Sprint 42", "Sprint 43"];
    const STATUSES = ["Done", "In Progress", "Blocked", "Backlog"];
    const STATUS_COLOR = { Done: "#1E8E3E", "In Progress": "#0071CE", Blocked: "#C5221F", Backlog: "#94A3B8" };

    function sprintKey(team, sprint) { return `${team || "all"}::${sprint || "all"}`; }

    function getSprintMetrics(team, sprint) {
        const rng = rngFor("sprint-kpi::" + sprintKey(team, sprint));
        const committed = randInt(rng, 38, 72);
        const completed = Math.round(committed * randFloat(rng, 0.62, 0.95, 2));
        return {
            committed, completed,
            velocity: randInt(rng, 28, 58),
            blockers: randInt(rng, 0, 6),
            agedIssues: randInt(rng, 2, 19),
            completionPct: Math.round((completed / committed) * 100),
        };
    }
    function getPortfolioHealth(team, sprint) {
        const rng = rngFor("portfolio::" + sprintKey(team, sprint));
        const counts = STATUSES.map(s => ({ status: s, count: randInt(rng, 3, s === "Done" ? 48 : 22), color: STATUS_COLOR[s] }));
        return counts;
    }
    function getBlockers(team, sprint) {
        const rng = rngFor("blockers::" + sprintKey(team, sprint));
        const n = randInt(rng, 3, 7);
        const titles = [
            "BigQuery credential rotation pending", "Awaiting design review sign-off",
            "Upstream API contract change", "Flaky E2E test blocking merge",
            "Akeyless secret mount delayed", "Dependency CVE patch in review",
            "Waiting on AD group approval", "Shared namespace resource limit",
        ];
        return Array.from({ length: n }, (_, i) => ({
            id: `CES-${randInt(rng, 1000, 9999)}`,
            title: pick(rng, titles),
            team: team && team !== "all" ? team : pick(rng, TEAMS),
            age_days: randInt(rng, 1, 21),
            severity: pick(rng, ["High", "Medium", "Low"]),
        }));
    }

    // ── Leadership Insights — Volume Distribution ────────────────────────────
    const CHANNELS = ["Voice", "Chat", "Email", "Self-Serve"];
    const CHANNEL_COLOR = { Voice: "#0071CE", Chat: "#FFC220", Email: "#00A3E0", "Self-Serve": "#1E8E3E" };

    function getVolumeDistribution(channel, region) {
        const rng = rngFor("volume::" + (channel || "all") + "::" + (region || "all"));
        const months = MONTHS.slice(0, 9);
        const series = (channel && channel !== "all" ? [channel] : CHANNELS).map(ch => ({
            channel: ch, color: CHANNEL_COLOR[ch],
            data: months.map((_, i) => randInt(rng, 8000, 42000) + i * randInt(rng, 200, 900)),
        }));
        return { months, series };
    }

    const REGIONS = ["US", "Canada", "Mexico"];

    // ── Legal Tickets demo lookup ─────────────────────────────────────────────
    const FEEDBACK_CATEGORIES = ["Delivery Delay", "App Bug", "Billing Question", "Driver Conduct", "Order Accuracy"];
    function getLegalResults(kind, email) {
        const rng = rngFor("legal::" + kind + "::" + (email || "demo"));
        const n = randInt(rng, 4, 11);
        if (kind === "spark-driver") {
            const columns = ["Date", "Driver Email", "Interaction Type", "Resolution", "Duration (s)"];
            const records = Array.from({ length: n }, () => ({
                Date: `2026-${String(randInt(rng, 1, 10)).padStart(2, "0")}-${String(randInt(rng, 1, 28)).padStart(2, "0")}`,
                "Driver Email": email,
                "Interaction Type": pick(rng, ["Delivery Issue", "Pay Question", "App Error", "Route Question"]),
                Resolution: pick(rng, ["Resolved", "Escalated", "Pending"]),
                "Duration (s)": randInt(rng, 60, 540),
            }));
            return { total_records: n, columns, records, date_range_min: records.at(-1).Date, date_range_max: records[0].Date };
        }
        const columns = ["Date", "Category", "Sentiment", "Summary"];
        const records = Array.from({ length: n }, () => {
            const cat = pick(rng, FEEDBACK_CATEGORIES);
            return {
                Date: `2026-${String(randInt(rng, 1, 10)).padStart(2, "0")}-${String(randInt(rng, 1, 28)).padStart(2, "0")}`,
                Category: cat, Sentiment: pick(rng, ["Positive", "Neutral", "Negative"]),
                Summary: `${cat} reported via chatbot — auto-summarized for demo.`,
            };
        });
        const catCounts = {};
        records.forEach(r => { catCounts[r.Category] = (catCounts[r.Category] || 0) + 1; });
        const level1_categories = Object.entries(catCounts).map(([label, count]) => ({ label, count }));
        return {
            total_records: n, unique_drivers: randInt(rng, 2, n),
            columns, records, level1_categories,
            date_range_min: records.at(-1).Date, date_range_max: records[0].Date,
        };
    }

    // ── Innovation Portal ─────────────────────────────────────────────────────
    const INNO_STATUSES = ["Submitted", "Under Review", "Approved", "In Pilot", "Shipped"];
    const INNO_CATEGORIES = ["Automation", "Agent Experience", "Customer Self-Serve", "Data & Reporting"];
    function getInnovationIdeas() {
        const rng = rngFor("innovation::seed");
        const titles = [
            "Auto-summarize chat transcripts for QA", "Proactive SLA breach alerts in Slack",
            "One-click AD group self-service requests", "Predictive staffing nudges for peak season",
            "Unified search across all CES hubs", "Dark-mode-first dashboard redesign",
            "Smart routing for billing disputes", "Auto-tag feedback sentiment at ingest",
        ];
        return titles.map((title, i) => ({
            id: i + 1, title,
            status: pick(rng, INNO_STATUSES),
            category: pick(rng, INNO_CATEGORIES),
            votes: randInt(rng, 3, 58),
            submitted_by: pick(rng, ["A. Rivera", "J. Okafor", "M. Chen", "S. Patel", "D. Kowalski"]),
        }));
    }

    // ── Gamification ──────────────────────────────────────────────────────────
    function getLeaderboard() {
        const rng = rngFor("leaderboard::seed");
        const names = ["A. Rivera", "J. Okafor", "M. Chen", "S. Patel", "D. Kowalski", "L. Nguyen", "R. Gomez"];
        return names.map(name => ({ name, points: randInt(rng, 400, 3200) }))
            .sort((a, b) => b.points - a.points)
            .map((r, i) => ({ ...r, rank: i + 1 }));
    }
    const TRIVIA_QUESTIONS = [
        { q: "What year was Walmart founded?", options: ["1952", "1962", "1971", "1980"], answer: 1 },
        { q: "What is the Walmart Spark logo meant to represent?", options: ["A compass", "A burst of savings", "A sunflower", "A gear"], answer: 1 },
        { q: "Which color is paired with Bentonville Blue in the brand palette?", options: ["Forest Green", "Walmart Yellow", "Slate Gray", "Crimson"], answer: 1 },
    ];

    // ── Core Metrics (CSAT / NPS / SLA / Repeat Contact Rate / Transfer Rate / CPO) ──
    // Previously called out on the home page as "external - not included"; now
    // ported in as a real synthetic-data dashboard like everything else here.
    const CORE_METRIC_TARGETS = { csat: 90, nps: 40, sla: 95, rcr: 12, transfer: 8, cpo: 4.5 };

    function getCoreMetricsKpi(filters) {
        const rng = rngFor("core-kpi::" + filterKey(filters || {}));
        return {
            csat: randFloat(rng, 84, 96, 1),
            nps: randInt(rng, 18, 58),
            sla: randFloat(rng, 88, 98, 1),
            rcr: randFloat(rng, 6, 16, 1),
            transfer: randFloat(rng, 4, 13, 1),
            cpo: randFloat(rng, 3.2, 6.1, 2),
        };
    }

    function getCoreMetricsTrend(filters) {
        const rng = rngFor("core-trend::" + filterKey(filters || {}));
        const baseCsat = randFloat(rng, 86, 93, 1);
        const baseNps = randInt(rng, 25, 48);
        return MONTHS.slice(0, 12).map((m, i) => ({
            month: m.slice(0, 3),
            csat: +(baseCsat + Math.sin(i / 2) * 2.4 + randFloat(rng, -1.2, 1.2, 1)).toFixed(1),
            nps: Math.round(baseNps + Math.cos(i / 3) * 6 + randFloat(rng, -4, 4, 1)),
        }));
    }

    function getCoreMetricsByVertical(filters) {
        const rng = rngFor("core-vertical::" + filterKey(filters || {}));
        const verticals = filters?.vertical && filters.vertical !== "all" ? [filters.vertical] : VERTICALS;
        return verticals.map(v => ({
            vertical: v, color: VERTICAL_COLORS[v],
            csat: randFloat(rng, 82, 97, 1),
            nps: randInt(rng, 10, 62),
            sla: randFloat(rng, 85, 99, 1),
            rcr: randFloat(rng, 5, 18, 1),
            transfer: randFloat(rng, 3, 15, 1),
            cpo: randFloat(rng, 2.9, 6.6, 2),
        }));
    }

    // ── WISE ─ Queue Level Summary (QLS) ───────────────────────────
    // Unlike other "external" tiles, we were handed the real WISE frontend +
    // backend source. The 8-KPI list, formulas (sum-then-ratio, never average
    // child percentages), SLA%/ABN% tone thresholds, and channel taxonomy
    // below are transcribed from the real app's
    // services/queue_summary/builders/{kpis,shared,comparison}.py and
    // pages/queueSummaryFormat.js — this is the one hub in the demo that's a
    // genuine (sanitized) port, not an approximation. What's deliberately
    // NOT reproduced: the real warehouse project/dataset/table names and the
    // production BigQuery SQL shown in its "Definitions & SQL" dialog —
    // those are internal infra identifiers that don't belong in a portable,
    // shareable demo, so the Definitions panel here is metric text only.
    const QLS_CHANNELS = ["Voice", "Chat", "Email", "Outbound", "Offline", "Self Service"];
    const QLS_CHANNEL_COLOR = {
        Voice: "#0071CE", Chat: "#FFC220", Email: "#00A3E0",
        Outbound: "#004F9F", Offline: "#94A3B8", "Self Service": "#1E8E3E",
    };
    const QLS_KPI_DEFINITIONS = [
        ["Offered", "Total contacts offered to the queue."],
        ["Handled", "Total contacts handled (short + long)."],
        ["SLA%", "Share of contacts answered within the service level target. Channels with no SLA target are excluded."],
        ["Offered%", "Offered load against originally locked staffing capacity."],
        ["AHT (s)", "Average handle time per contact, in seconds."],
        ["Abandoned", "Long abandons only — short abandons are not counted."],
        ["ABN%", "Long abandons against offered."],
        ["ASA (s)", "Average speed of answer per handled contact."],
    ];
    // Thresholds transcribed verbatim from the real queueSummaryFormat.js.
    function qlsSlaTone(v) { return v == null ? null : v >= 90 ? "good" : v >= 80 ? "warn" : "bad"; }
    function qlsAbnTone(v) { return v == null ? null : v <= 3 ? "good" : v <= 5 ? "warn" : "bad"; }

    function qlsKey(filters) {
        return ["fy", "vertical", "department", "channel"].map(k => filters?.[k] ?? "all").join("|");
    }

    function getQlsKpis(filters) {
        const rng = rngFor("qls-kpi::" + qlsKey(filters || {}));
        const offered = randInt(rng, 38000, 96000);
        const handled = Math.round(offered * randFloat(rng, 0.88, 0.99, 3));
        const abandoned = Math.max(0, offered - handled - randInt(rng, 0, 400));
        return {
            offered, handled, abandoned,
            sla: randFloat(rng, 74, 97, 1),
            offeredPct: randFloat(rng, 82, 118, 1),
            aht: randInt(rng, 260, 540),
            asa: randInt(rng, 8, 95),
            abnPct: +((abandoned / offered) * 100).toFixed(1),
        };
    }

    // Daily Trend — bars (Offered/Handled) + SLA% line, last 14 days.
    function getQlsDailyTrend(filters) {
        const rng = rngFor("qls-trend::" + qlsKey(filters || {}));
        const days = 14;
        const baseOffered = randInt(rng, 2200, 4200);
        const today = new Date();
        return Array.from({ length: days }, (_, i) => {
            const d = new Date(today); d.setDate(today.getDate() - (days - 1 - i));
            const offered = Math.round(baseOffered * randFloat(rng, 0.8, 1.25, 3));
            const handled = Math.round(offered * randFloat(rng, 0.85, 0.99, 3));
            return { date: `${d.getMonth() + 1}/${d.getDate()}`, offered, handled, sla_pct: randFloat(rng, 72, 97, 1) };
        });
    }

    // Queue Detail table. view: "sublob" (default, queues grouped under their
    // vertical) | "vertical" | "channel" — mirrors the real app's three views.
    function getQlsTable(filters, view) {
        const rng = rngFor("qls-table::" + view + "::" + qlsKey(filters || {}));
        function metricsFor(label, vertical) {
            const origLocks = randInt(rng, 400, 9000);
            const revLocks = Math.round(origLocks * randFloat(rng, 0.9, 1.15, 3));
            const offered = Math.round(revLocks * randFloat(rng, 0.8, 1.3, 3));
            const handled = Math.round(offered * randFloat(rng, 0.85, 0.99, 3));
            const abandoned = Math.max(0, offered - handled - randInt(rng, 0, 80));
            return {
                label, vertical,
                orig_locks: origLocks, rev_locks: revLocks,
                ent_offered: offered, ent_offered_pct: +((offered / origLocks) * 100).toFixed(1),
                rev_ent_offered_pct: +((offered / revLocks) * 100).toFixed(1),
                ent_sla_pct: randFloat(rng, 70, 98, 1),
                handled, handled_pct: +((handled / revLocks) * 100).toFixed(1),
                aht: randInt(rng, 240, 560), abandoned,
                abn_pct: +((abandoned / offered) * 100).toFixed(1),
                asa: randInt(rng, 5, 110),
            };
        }
        if (view === "channel") return QLS_CHANNELS.map(ch => metricsFor(ch, null));
        const verts = filters?.vertical && filters.vertical !== "all" ? [filters.vertical] : VERTICALS;
        if (view === "vertical") return verts.map(v => metricsFor(v, v));
        // sublob (default): flatten each vertical's queues, same hierarchy QUEUES already models.
        const rows = [];
        verts.forEach(v => (QUEUES[v] || []).forEach(q => rows.push(metricsFor(q, v))));
        return rows;
    }

    // Period Comparison. Presets + "lower is better" flags mirror the real
    // app's comparison.py exactly (abandoned/aht/asa are lower-is-better).
    const QLS_CMP_PRESETS_A = [["today", "Today"], ["yesterday", "Yesterday"], ["last-week", "Last Week"], ["last-month", "Last Month"]];
    const QLS_CMP_PRESETS_B = [["yesterday", "Yesterday"], ["last-week", "Last Week"], ["last-month", "Last Month"], ["last-year", "Last Year"]];
    const QLS_CMP_METRICS = [
        { key: "ent_offered", label: "Total Offered", lowerBetter: false, unit: "" },
        { key: "handled", label: "Total Handled", lowerBetter: false, unit: "" },
        { key: "ent_sla_pct", label: "SLA %", lowerBetter: false, unit: "%" },
        { key: "aht", label: "AHT", lowerBetter: true, unit: "s" },
        { key: "asa", label: "ASA", lowerBetter: true, unit: "s" },
        { key: "abandoned", label: "Abandoned", lowerBetter: true, unit: "" },
    ];
    const QLS_CMP_SCALE = { today: 0.15, yesterday: 1, "last-week": 6.5, "last-month": 28, "last-year": 340 };

    function getQlsComparison(periodAId, periodBId, filters) {
        const rng = rngFor("qls-cmp::" + periodAId + "::" + periodBId + "::" + qlsKey(filters || {}));
        function valuesFor(periodId) {
            const scale = QLS_CMP_SCALE[periodId] ?? 1;
            const offered = Math.round(randInt(rng, 2800, 4600) * scale);
            const handled = Math.round(offered * randFloat(rng, 0.85, 0.99, 3));
            const abandoned = Math.max(0, offered - handled - Math.round(randInt(rng, 0, 40) * scale));
            return { ent_offered: offered, handled, ent_sla_pct: randFloat(rng, 72, 97, 1), aht: randInt(rng, 260, 520), asa: randInt(rng, 8, 90), abandoned };
        }
        const a = valuesFor(periodAId), b = valuesFor(periodBId);
        return QLS_CMP_METRICS.map(m => {
            const av = a[m.key], bv = b[m.key];
            const change = +(av - bv).toFixed(1);
            const changePct = bv ? +(((av - bv) / bv) * 100).toFixed(1) : 0;
            const color = av === bv ? "flat" : (m.lowerBetter ? (av < bv ? "good" : "bad") : (av > bv ? "good" : "bad"));
            const trend = av === bv ? "flat" : (av > bv ? "up" : "down");
            return { ...m, a: av, b: bv, change, changePct, color, trend };
        });
    }

    // ── Numbers / formatting helpers ─────────────────────────────────────────
    function fmt(n) { return n == null ? "—" : Number(n).toLocaleString(); }
    function fmtPct(n) { return n == null ? "—" : `${n > 0 ? "+" : ""}${n}%`; }

    global.CES = {
        FILTER_OPTIONS, VERTICALS, SUBLOBS, DEPARTMENTS, VENDORS, MONTHS, FISCAL_YEARS,
        VERTICAL_COLORS, QUEUES, CHANNELS, CHANNEL_COLOR, REGIONS, TEAMS, SPRINTS, STATUSES, STATUS_COLOR,
        FEEDBACK_CATEGORIES, INNO_STATUSES, INNO_CATEGORIES, TRIVIA_QUESTIONS, CORE_METRIC_TARGETS,
        QLS_CHANNELS, QLS_CHANNEL_COLOR, QLS_KPI_DEFINITIONS, QLS_CMP_PRESETS_A, QLS_CMP_PRESETS_B,
        getContacts, getTop5, getAhtKpi, getAhtTrend, getAhtWeeklySeries,
        getSprintMetrics, getPortfolioHealth, getBlockers,
        getVolumeDistribution, getLegalResults, getInnovationIdeas, getLeaderboard,
        getCoreMetricsKpi, getCoreMetricsTrend, getCoreMetricsByVertical,
        getQlsKpis, getQlsDailyTrend, getQlsTable, getQlsComparison, qlsSlaTone, qlsAbnTone,
        fmt, fmtPct, rngFor, randInt, randFloat, pick,
    };
})(window);
