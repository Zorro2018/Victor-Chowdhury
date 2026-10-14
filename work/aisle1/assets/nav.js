/* ===========================================================================
   CES Reporting Hub — Portable Demo · shared chrome
   Header (hamburger + title + theme toggle), off-canvas nav drawer, a
   session-persisted breadcrumb "trail" so a user who wanders deep into the
   hub can always see (and click back through) the path they took, and the
   shared filter-bar builder used by every dashboard page.
   =========================================================================== */
(function (global) {
    "use strict";

    // ── Shared points store (trivia correct-answers + Sparky catches both feed
    // this single running total) ── backed by sessionStorage so it survives
    // navigation across this plain multi-page site, reset when the tab closes.
    const POINTS_KEY = "ces_points_total";
    function getPoints() { return parseInt(sessionStorage.getItem(POINTS_KEY) || "0", 10); }
    function addPoints(n) {
        const total = getPoints() + n;
        sessionStorage.setItem(POINTS_KEY, String(total));
        document.dispatchEvent(new CustomEvent("ces-points-changed", { detail: { total } }));
        return total;
    }
    global.CES_POINTS = { get: getPoints, add: addPoints };

    const SPARK_SVG = `<svg class="spark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0l1.8 7.2L21 9l-7.2 1.8L12 18l-1.8-7.2L3 9l7.2-1.8z"/>
    </svg>`;

    // href is always root-relative (matches how it's reached from index.html).
    // `base` (passed per-page) turns it into a working link from wherever we are.
    const PAGES = [
        { href: "index.html",                       label: "Home" },
        { href: "pages/core-metrics.html",           label: "Core Metrics" },
        { href: "pages/wise-queue-summary.html",      label: "WISE - Queue Level Summary" },
        { href: "pages/billable-contacts.html",      label: "Billable Contacts" },
        { href: "pages/aht-insights.html",           label: "AHT Insights" },
        { href: "pages/monthly-billable.html",       label: "Monthly Billable" },
        { href: "pages/sprint-command-center.html",  label: "Sprint Command Center" },
        { href: "pages/leadership-insights.html",    label: "Leadership Insights" },
        { href: "pages/legal.html",                  label: "Legal Tickets" },
        { href: "pages/innovation-portal.html",      label: "Innovation Portal" },
        { href: "pages/gamification.html",           label: "Gamification" },
    ];

    function pageMeta(href) {
        return PAGES.find(p => p.href === href) || { href, label: document.title || href };
    }
    function resolveHref(href, base) {
        return href === "index.html" ? `${base}index.html` : `${base}${href}`;
    }

    // ── Theme toggle (persisted across pages) ────────────────────────────────
    function initTheme() {
        const saved = localStorage.getItem("ces-demo-theme");
        if (saved === "dark") document.documentElement.classList.add("dark");
        document.querySelectorAll("[data-theme-toggle]").forEach(btn => {
            const sync = () => { btn.textContent = document.documentElement.classList.contains("dark") ? "Light" : "Dark"; };
            btn.addEventListener("click", () => {
                document.documentElement.classList.toggle("dark");
                localStorage.setItem("ces-demo-theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
                sync();
            });
            sync();
        });
    }

    // ── Breadcrumb trail (sessionStorage) ─────────────────────────────────────
    // Landing on Home resets the trail (a fresh "start of the journey" point).
    // Every other page appends itself unless it's already the last entry
    // (avoids a duplicate crumb on a plain refresh).
    const TRAIL_KEY = "ces-demo-trail";

    function loadTrail() {
        try { return JSON.parse(sessionStorage.getItem(TRAIL_KEY)) || []; } catch (e) { return []; }
    }
    function saveTrail(trail) {
        try { sessionStorage.setItem(TRAIL_KEY, JSON.stringify(trail)); } catch (e) { /* ignore */ }
    }
    function updateTrail(activeHref, label) {
        if (activeHref === "index.html") {
            const trail = [{ href: "index.html", label: "Home" }];
            saveTrail(trail);
            return trail;
        }
        let trail = loadTrail();
        if (!trail.length) trail = [{ href: "index.html", label: "Home" }];
        const last = trail[trail.length - 1];
        if (!last || last.href !== activeHref) trail.push({ href: activeHref, label });
        saveTrail(trail);
        return trail;
    }
    function resetTrail(activeHref, label) {
        const trail = activeHref === "index.html"
            ? [{ href: "index.html", label: "Home" }]
            : [{ href: "index.html", label: "Home" }, { href: activeHref, label }];
        saveTrail(trail);
        return trail;
    }
    function renderTrail(container, trail, base) {
        if (!container) return;
        container.innerHTML = trail.map((t, i) => {
            const isLast = i === trail.length - 1;
            if (isLast) return `<span class="crumb-current">${t.label}</span>`;
            return `<a href="${resolveHref(t.href, base)}">${t.label}</a><span class="crumb-sep">\u203a</span>`;
        }).join("");
    }

    // ── Off-canvas nav drawer (hidden by default, opened via hamburger) ──────
    function renderDrawer(activeHref, base) {
        const drawer = document.getElementById("app-sidebar");
        if (!drawer) return;
        drawer.className = "nav-drawer";
        drawer.innerHTML = `
            <div class="nav-drawer-head">
                <span>Navigate</span>
                <button class="drawer-close-btn" data-drawer-close aria-label="Close navigation menu">&times;</button>
            </div>
            <nav class="nav-drawer-links">
                ${PAGES.map(p => `<a href="${resolveHref(p.href, base)}" class="${activeHref === p.href ? "active" : ""}">${p.label}</a>`).join("")}
            </nav>
        `;

        let backdrop = document.getElementById("app-sidebar-backdrop");
        if (!backdrop) {
            backdrop = document.createElement("div");
            backdrop.id = "app-sidebar-backdrop";
            backdrop.className = "nav-backdrop";
            document.body.appendChild(backdrop);
        }

        function closeDrawer() {
            drawer.classList.remove("open");
            backdrop.classList.remove("open");
            document.body.classList.remove("drawer-lock");
        }
        function openDrawer() {
            drawer.classList.add("open");
            backdrop.classList.add("open");
            document.body.classList.add("drawer-lock");
        }

        backdrop.addEventListener("click", closeDrawer);
        drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", closeDrawer));
        const closeBtn = drawer.querySelector("[data-drawer-close]");
        if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
        document.addEventListener("keydown", e => { if (e.key === "Escape") closeDrawer(); });
        document.querySelectorAll("[data-hamburger]").forEach(btn => {
            btn.addEventListener("click", () => {
                if (drawer.classList.contains("open")) closeDrawer(); else openDrawer();
            });
        });
    }

    // ── Header: hamburger + spark + title + theme toggle, trail bar below ────
    // base: "" when called from index.html (root), "../" when called from pages/*.html
    function renderHeader({ activeHref, title, subtitle = "Walmart \u00b7 Customer Engagement Services", base = "../", liveBadge = false }) {
        const el = document.getElementById("app-header");
        if (!el) return;
        const meta = pageMeta(activeHref);
        const trail = updateTrail(activeHref, meta.label);

        el.innerHTML = `
            <div class="title-band">
                <div class="title-left">
                    <button class="hamburger-btn" data-hamburger aria-label="Open navigation menu" aria-haspopup="true">
                        <span></span><span></span><span></span>
                    </button>
                    ${SPARK_SVG}
                    <div>
                        <h1>${title}</h1>
                        <div class="subtitle">${subtitle}</div>
                    </div>
                </div>
                <div class="title-right">
                    <span class="points-badge" id="points-badge" title="Points earned this session (trivia + Sparky catches)">⭐ <span id="points-badge-value">0</span></span>
                    <button class="theme-toggle" data-theme-toggle>Dark</button>
                </div>
            </div>
            <div class="crumb-bar">
                <div class="trail-strip" id="trail-strip"></div>
                <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
                    ${trail.length > 1 ? `<button class="btn" id="reset-trail-btn">Reset Trail</button>` : ""}
                    ${liveBadge ? `<span class="data-badge"><span class="dot"></span>DEMO DATA</span>` : ""}
                </div>
            </div>
            <div id="ces-search-wrap"></div>
        `;
        renderTrail(document.getElementById("trail-strip"), trail, base);
        const resetBtn = document.getElementById("reset-trail-btn");
        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                const fresh = resetTrail(activeHref, meta.label);
                renderTrail(document.getElementById("trail-strip"), fresh, base);
                resetBtn.remove();
            });
        }

        initTheme();
        renderDrawer(activeHref, base);
        if (global.CES_SEARCH) global.CES_SEARCH.renderSearch(document.getElementById("ces-search-wrap"), base);

        // Points badge: reflect the shared session total immediately, then stay
        // live as trivia answers / Sparky catches add to it on any page.
        const badgeVal = document.getElementById("points-badge-value");
        if (badgeVal) badgeVal.textContent = CES_POINTS.get();
        document.addEventListener("ces-points-changed", (e) => {
            if (badgeVal) badgeVal.textContent = e.detail.total;
        });

        loadSparky(base);
    }

    // Auto-load the Sparky engagement easter-egg on every page that renders a
    // header — avoids hand-adding a <script> tag to every single HTML file.
    function loadSparky(base) {
        if (document.getElementById("ces-sparky-script")) return;
        const s = document.createElement("script");
        s.id = "ces-sparky-script";
        s.src = base + "assets/sparky.js";
        s.onload = function () { if (global.CES_SPARKY) global.CES_SPARKY.init(); };
        document.head.appendChild(s);
    }

    function renderFooter() {
        const el = document.getElementById("app-footer");
        if (!el) return;
        el.innerHTML = `<footer class="site-footer">AISLE One Portable Demo \u00b7 Synthetic data for presentation only \u00b7 Not connected to any Walmart system</footer>`;
    }

    // Lightweight filter-bar builder. defs: [{id,label,value,options:[{value,label}]}]
    // onChange(id, value) is called whenever a select changes.
    function renderFilterBar(container, defs, onChange, onClear, extraButtonsHtml = "") {
        container.className = "filter-bar";
        container.innerHTML = defs.map(d => `
            <div class="filter-group">
                <label>${d.label}</label>
                <select class="filter-select" data-filter="${d.id}">
                    ${d.options.map(o => `<option value="${o.value}" ${o.value === d.value ? "selected" : ""}>${o.label}</option>`).join("")}
                </select>
            </div>
        `).join("") + `<div class="filter-actions"><button class="btn" data-clear>Clear</button>${extraButtonsHtml}</div>`;
        container.querySelectorAll("select[data-filter]").forEach(sel => {
            sel.addEventListener("change", () => onChange(sel.dataset.filter, sel.value));
        });
        const clearBtn = container.querySelector("[data-clear]");
        if (clearBtn && onClear) clearBtn.addEventListener("click", onClear);
    }

    global.CES_NAV = { PAGES, SPARK_SVG, initTheme, renderHeader, renderFooter, renderFilterBar };
})(window);
