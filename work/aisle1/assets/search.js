/* ===========================================================================
   CES Reporting Hub — Portable Demo · global metrics search
   A header-level search box that lets you look up a metric by keyword and
   get back (a) matching metric cards pulled live from the same synthetic
   data engine as the dashboards, and (b) a templated "AI Strategic
   Guidance" narrative underneath.

   IMPORTANT: there is no real AI/LLM call here — this is a portable,
   zero-backend demo, so "guidance" is a deterministic text generator
   (seeded by the query via CES.rngFor) that reads matched metrics and
   narrates them in plain language. It's presented as AI-style guidance
   for the demo, but it never phones home anywhere.
   =========================================================================== */
(function (global) {
    "use strict";

    // Terms that exist as real hubs in the source app but live in genuinely
    // separate, separately-deployed repos (not ported into this demo) —
    // searching for them should say so honestly rather than fabricate data.
    const EXTERNAL_ONLY_TERMS = {
        "vox": "VOX", "crm": "CRM",
    };

    function matchExternalTerm(query) {
        const q = query.toLowerCase();
        for (const key in EXTERNAL_ONLY_TERMS) {
            if (q.includes(key)) return EXTERNAL_ONLY_TERMS[key];
        }
        return null;
    }

    // Built fresh on every search so values always match whatever the seeded
    // engine currently returns for the "all filters" baseline — no separate
    // hardcoded dataset to keep in sync.
    function metricsCatalog() {
        const ahtKpi = CES.getAhtKpi({});
        const contacts = CES.getContacts({}).rows;
        const totalContacts = contacts.reduce((a, r) => a + r.total_with_outbound, 0);
        const topVertical = CES.getTop5({}).tiles[0].items[0];
        const sprint = CES.getSprintMetrics("all", "all");
        const blockers = CES.getBlockers("all", "all");
        const health = CES.getPortfolioHealth("all", "all");
        const doneCount = (health.find(h => h.status === "Done") || {}).count || 0;
        const vol = CES.getVolumeDistribution("all", "all");
        const totalVolume = vol.series.reduce((a, s) => a + s.data.reduce((x, y) => x + y, 0), 0);
        const ssSeries = vol.series.find(s => s.channel === "Self-Serve");
        const ssTotal = ssSeries ? ssSeries.data.reduce((a, b) => a + b, 0) : 0;
        const containment = totalVolume ? Math.round((ssTotal / totalVolume) * 100) : 0;
        const topIdea = [...CES.getInnovationIdeas()].sort((a, b) => b.votes - a.votes)[0];
        const topPlayer = CES.getLeaderboard()[0];
        const core = CES.getCoreMetricsKpi({});
        const qls = CES.getQlsKpis({});

        return [
            { tags: ["csat", "customer satisfaction"], title: "CSAT", value: `${core.csat}%`, page: "pages/core-metrics.html",
                blurb: `Overall CSAT is sitting at ${core.csat}% against a ${CES.CORE_METRIC_TARGETS.csat}% target.` },
            { tags: ["nps", "net promoter"], title: "NPS", value: core.nps, page: "pages/core-metrics.html",
                blurb: `Net Promoter Score is ${core.nps} against a target of ${CES.CORE_METRIC_TARGETS.nps}.` },
            { tags: ["sla", "service level"], title: "SLA Attainment", value: `${core.sla}%`, page: "pages/core-metrics.html",
                blurb: `SLA attainment is ${core.sla}%, target is ${CES.CORE_METRIC_TARGETS.sla}%.` },
            { tags: ["rcr", "repeat contact rate", "repeat call rate"], title: "Repeat Contact Rate", value: `${core.rcr}%`, page: "pages/core-metrics.html",
                blurb: `Repeat contact rate is ${core.rcr}% (lower is better; target is \u2264${CES.CORE_METRIC_TARGETS.rcr}%).` },
            { tags: ["transfer rate", "transfer"], title: "Transfer Rate", value: `${core.transfer}%`, page: "pages/core-metrics.html",
                blurb: `Transfer rate is ${core.transfer}% (lower is better; target is \u2264${CES.CORE_METRIC_TARGETS.transfer}%).` },
            { tags: ["cpo", "cost per order"], title: "Cost Per Order", value: `$${core.cpo.toFixed(2)}`, page: "pages/core-metrics.html",
                blurb: `Cost per order is $${core.cpo.toFixed(2)} against a $${CES.CORE_METRIC_TARGETS.cpo.toFixed(2)} target.` },
            { tags: ["offered", "ent offered", "wfm"], title: "WISE Offered", value: CES.fmt(qls.offered), page: "pages/wise-queue-summary.html",
                blurb: `WISE Queue Level Summary: ${CES.fmt(qls.offered)} contacts offered against ${CES.fmt(qls.handled)} handled.` },
            { tags: ["wise", "queue level summary", "qls", "queue summary"], title: "WISE SLA%", value: `${qls.sla}%`, page: "pages/wise-queue-summary.html",
                blurb: `WISE Queue Level Summary SLA is ${qls.sla}% (green \u226590, yellow \u226580, red below 80).` },
            { tags: ["abn", "abn%", "abandon rate", "abandoned"], title: "WISE Abandoned", value: CES.fmt(qls.abandoned), page: "pages/wise-queue-summary.html",
                blurb: `${CES.fmt(qls.abandoned)} long abandons this period (${qls.abnPct}% of offered; green \u22643%, yellow \u22645%, red above).` },
            { tags: ["asa", "average speed of answer", "speed of answer"], title: "WISE ASA", value: `${qls.asa}s`, page: "pages/wise-queue-summary.html",
                blurb: `Average speed of answer is ${qls.asa}s per handled contact.` },
            { tags: ["offered%", "offered percent", "locks"], title: "WISE Offered%", value: `${qls.offeredPct}%`, page: "pages/wise-queue-summary.html",
                blurb: `Offered load is running at ${qls.offeredPct}% of originally locked staffing capacity.` },
            { tags: ["queue aht", "wise aht"], title: "WISE AHT", value: `${qls.aht}s`, page: "pages/wise-queue-summary.html",
                blurb: `Queue AHT (average handle time) is ${qls.aht}s per contact in WISE Queue Level Summary.` },
            { tags: ["aht", "average handle time", "handle time"], title: "Overall AHT", value: `${ahtKpi.overall}s`, page: "pages/aht-insights.html",
                blurb: `Overall average handle time is sitting at ${ahtKpi.overall}s (chat ${ahtKpi.chat}s / email ${ahtKpi.email}s / offline ${ahtKpi.offline}s).` },
            { tags: ["chat aht", "chat handle time", "chat"], title: "Chat AHT", value: `${ahtKpi.chat}s`, page: "pages/aht-insights.html",
                blurb: `Chat is the fastest channel at ${ahtKpi.chat}s average handle time.` },
            { tags: ["billable", "billable contacts", "total contacts", "contact volume"], title: "Total Billable Contacts", value: CES.fmt(totalContacts), page: "pages/billable-contacts.html",
                blurb: `${CES.fmt(totalContacts)} total billable contacts across all verticals and queues this period.` },
            { tags: ["top vertical", "vertical", "customer care"], title: `Top Vertical: ${topVertical.vertical}`, value: CES.fmt(topVertical.total), page: "pages/billable-contacts.html",
                blurb: `${topVertical.vertical} leads volume at ${CES.fmt(topVertical.total)} contacts (${CES.fmtPct(topVertical.change_pct)} vs. the prior period).` },
            { tags: ["monthly billable", "monthly report", "monthly"], title: "Monthly Billable Report", value: CES.fmt(totalContacts), page: "pages/monthly-billable.html",
                blurb: `Monthly billable totals track the same ${CES.fmt(totalContacts)}-contact baseline, broken out by vertical and queue.` },
            { tags: ["velocity", "sprint velocity", "sprint"], title: "Sprint Velocity", value: sprint.velocity, page: "pages/sprint-command-center.html",
                blurb: `Current sprint velocity is ${sprint.velocity} points, with ${sprint.completionPct}% of committed work completed so far.` },
            { tags: ["blocker", "blockers", "blocked"], title: "Active Blockers", value: blockers.length, page: "pages/sprint-command-center.html",
                blurb: `${blockers.length} active blockers are being tracked this sprint.` },
            { tags: ["aged issues", "aging", "backlog"], title: "Aged Issues", value: sprint.agedIssues, page: "pages/sprint-command-center.html",
                blurb: `${sprint.agedIssues} issues are aged beyond SLA in the current sprint.` },
            { tags: ["portfolio health", "done", "completed issues"], title: "Portfolio Health - Done", value: doneCount, page: "pages/sprint-command-center.html",
                blurb: `${doneCount} issues are marked Done in the current portfolio health snapshot.` },
            { tags: ["volume distribution", "channel volume", "contact channels"], title: "Total Channel Volume", value: CES.fmt(totalVolume), page: "pages/leadership-insights.html",
                blurb: `${CES.fmt(totalVolume)} contacts distributed across Voice, Chat, Email, and Self-Serve over the last 9 months.` },
            { tags: ["self-serve", "self serve", "containment", "containment rate", "deflection"], title: "Self-Serve Containment Rate", value: `${containment}%`, page: "pages/leadership-insights.html",
                blurb: `Self-serve is containing ${containment}% of total volume without agent intervention.` },
            { tags: ["innovation", "idea", "ideas", "pipeline"], title: "Top Innovation Idea", value: topIdea ? `${topIdea.votes} votes` : "--", page: "pages/innovation-portal.html",
                blurb: topIdea ? `"${topIdea.title}" leads the innovation pipeline with ${topIdea.votes} votes (status: ${topIdea.status}).` : "No ideas submitted yet." },
            { tags: ["legal", "spark driver", "customer feedback", "ticket"], title: "Legal Tickets Lookup", value: "Lookup tool", page: "pages/legal.html",
                blurb: `Spark Driver and Customer Feedback chatbot interactions can be looked up by email in the Legal Tickets tool.` },
            { tags: ["gamification", "trivia", "leaderboard", "points"], title: "Leaderboard Leader", value: topPlayer ? `${CES.fmt(topPlayer.points)} pts` : "--", page: "pages/gamification.html",
                blurb: topPlayer ? `${topPlayer.name} leads the monthly leaderboard with ${CES.fmt(topPlayer.points)} points.` : "No leaderboard data yet." },
        ];
    }

    function search(query) {
        const q = query.trim().toLowerCase();
        if (!q) return { results: [], externalHit: null };
        const results = metricsCatalog().filter(m =>
            m.tags.some(t => t.includes(q) || q.includes(t)) || m.title.toLowerCase().includes(q)
        );
        const externalHit = results.length === 0 ? matchExternalTerm(q) : null;
        return { results, externalHit };
    }

    const OPENERS = [
        "Here's the read on", "Quick strategic take on", "Pulling the thread on", "Looking across the data for",
    ];
    const RECS = [
        "Recommend flagging this to the LOB lead for a deeper dive this week.",
        "Worth adding to the next Sprint Command Center review.",
        "Consider setting an alert threshold so drift here surfaces automatically.",
        "A good candidate for the Innovation Portal if a fix isn't already in flight.",
        "Pair this with the Leadership Insights channel view to see if the trend holds regionally.",
    ];

    function buildGuidance(query, results) {
        if (!query.trim()) {
            return {
                body: 'Search for a metric above (try "AHT", "blockers", "containment", or "innovation") and this panel will synthesize a plain-language read plus a recommended next step.',
                recs: [],
            };
        }
        const external = matchExternalTerm(query);
        if (results.length === 0 && external) {
            return {
                body: `"${query}" (${external}) lives in the ${external} hub, which is deployed as a separate app and isn't ported into this portable demo. Everything searchable here covers this hub's own locally-rendered dashboards instead.`,
                recs: [],
            };
        }
        if (results.length === 0) {
            return {
                body: `No metrics matched "${query}" in this demo. Try CSAT, NPS, SLA, QLS, offered, abandoned, AHT, billable contacts, velocity, blockers, containment, innovation, or leaderboard.`,
                recs: [],
            };
        }
        const rng = CES.rngFor("guidance::" + query.toLowerCase());
        const opener = CES.pick(rng, OPENERS);
        const lead = results[0];
        const tail = results.length > 1 ? ` ${results.length - 1} other related metric${results.length > 2 ? "s" : ""} matched below.` : "";
        const body = `${opener} ${lead.title.toLowerCase()}: ${lead.blurb}${tail}`;
        const recCount = Math.min(2, results.length);
        const recs = Array.from(new Set(Array.from({ length: recCount }, () => CES.pick(rng, RECS))));
        return { body, recs };
    }

    // ── Feedback widget markup + wiring (thumbs up/down + optional written
    // note). Purely cosmetic — nothing here is sent anywhere, it's a demo of
    // the interaction pattern, not a real feedback pipeline. ──────────────────
    function feedbackHtml() {
        return `
            <div class="search-feedback">
                <div class="search-feedback-row">
                    <span class="search-feedback-label">Was this helpful?</span>
                    <button type="button" class="feedback-thumb" data-val="up">\uD83D\uDC4D</button>
                    <button type="button" class="feedback-thumb" data-val="down">\uD83D\uDC4E</button>
                    <button type="button" class="feedback-write-toggle">+ Add written feedback</button>
                </div>
                <div class="search-feedback-write" style="display:none;">
                    <textarea placeholder="Tell us more\u2026 (not sent anywhere \u2014 this is a cosmetic demo control)"></textarea>
                    <button type="button" class="btn btn-primary feedback-submit" style="margin-top:6px;">Submit feedback</button>
                </div>
                <div class="search-feedback-thanks"></div>
            </div>
        `;
    }

    function wireFeedback(root, query) {
        const thumbs = root.querySelectorAll(".feedback-thumb");
        const writeToggle = root.querySelector(".feedback-write-toggle");
        const writeBox = root.querySelector(".search-feedback-write");
        const thanksEl = root.querySelector(".search-feedback-thanks");

        function showThanks(msg) { if (thanksEl) thanksEl.textContent = msg; }

        thumbs.forEach(btn => {
            btn.addEventListener("click", () => {
                thumbs.forEach(b => b.classList.remove("selected", "up", "down"));
                btn.classList.add("selected", btn.dataset.val);
                showThanks(btn.dataset.val === "up"
                    ? "Thanks \u2014 glad that was useful!"
                    : `Thanks for flagging that \u2014 noted for "${query}".`);
            });
        });

        if (writeToggle && writeBox) {
            writeToggle.addEventListener("click", () => {
                const isOpen = writeBox.style.display !== "none";
                writeBox.style.display = isOpen ? "none" : "block";
                writeToggle.textContent = isOpen ? "+ Add written feedback" : "\u2212 Hide feedback box";
            });
            const submitBtn = root.querySelector(".feedback-submit");
            if (submitBtn) {
                submitBtn.addEventListener("click", () => {
                    const text = root.querySelector(".search-feedback-write textarea").value.trim();
                    showThanks(text ? "Feedback received \u2014 thanks for the detail!" : "Thanks for your feedback!");
                    writeBox.style.display = "none";
                    writeToggle.textContent = "+ Add written feedback";
                });
            }
        }
    }

    function renderSearch(container, base) {
        if (!container) return;
        container.className = "search-shell";
        container.innerHTML = `
            <div class="search-shell-title">\uD83D\uDD0D Search Metrics</div>
            <div class="search-bar">
                <input type="text" id="ces-search-input" placeholder="Search metrics\u2026 (try CSAT, AHT, blockers, containment, innovation)" autocomplete="off">
                <button class="btn btn-primary" id="ces-search-btn">Search</button>
            </div>
            <div class="search-results" id="ces-search-results"></div>
        `;
        const input = container.querySelector("#ces-search-input");
        const resultsEl = container.querySelector("#ces-search-results");

        function run() {
            const q = input.value;
            const { results } = search(q);
            const guidance = buildGuidance(q, results);
            resultsEl.classList.toggle("open", !!q.trim());
            if (!q.trim()) { resultsEl.innerHTML = ""; return; }
            resultsEl.innerHTML = `
                <div class="search-matches">
                    <div class="search-section-label">Keyword Matches${results.length ? ` (${results.length})` : ""}</div>
                    ${results.length
                        ? results.map(r => `
                            <a class="search-match-row" href="${base}${r.page}">
                                <span class="search-match-title">${r.title}</span>
                                <span class="search-match-value">${r.value}</span>
                            </a>
                        `).join("")
                        : `<div class="search-empty">No metric cards matched \u2014 check the guidance panel.</div>`}
                </div>
                <div class="search-guidance">
                    <div class="search-section-label">AI Strategic Guidance</div>
                    <p>${guidance.body}</p>
                    ${guidance.recs.length ? `<ul>${guidance.recs.map(r => `<li>${r}</li>`).join("")}</ul>` : ""}
                    ${feedbackHtml()}
                </div>
            `;
            wireFeedback(resultsEl.querySelector(".search-guidance"), q.trim());
        }

        let debounceTimer;
        input.addEventListener("input", () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(run, 180); });
        input.addEventListener("keydown", e => { if (e.key === "Enter") run(); });
        container.querySelector("#ces-search-btn").addEventListener("click", run);
    }

    global.CES_SEARCH = { search, buildGuidance, renderSearch };
})(window);
