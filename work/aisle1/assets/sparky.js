/* ===========================================================================
   CES Reporting Hub — Portable Demo · Sparky easter egg
   Vanilla-JS port of the real SparkieHunt.jsx component (AisleOne-WISE
   frontend): a tiny glowing smiley spawns at a random point on the page,
   bobs/glows for up to 10s, and awards +50 points when clicked.

   This demo is a plain multi-page site (no SPA router), so there's no
   "despawn on route change" concept — each page load gets its own fresh
   Sparky spawn cycle, and points persist across pages via sessionStorage
   (see CES_POINTS in nav.js) so the running total survives navigation.
   =========================================================================== */
(function (global) {
    "use strict";

    const SIZE = 30;                 // px — a touch bigger than the real 14px so it's easy to spot/click in a demo
    const VISIBLE_MS = 10000;        // vanishes after 10s if not caught
    const MIN_INTERVAL_MS = 22000;   // min gap between appearances (tuned faster than prod for a short demo session)
    const MAX_INTERVAL_MS = 40000;
    const FIRST_MIN_MS = 6000;       // first appearance comes quicker so it's not missed
    const FIRST_MAX_MS = 14000;
    const CATCH_FLASH_MS = 1100;
    const EDGE_PAD = 60;
    const TOP_PAD = 150;             // clears sticky header + search box
    const BOTTOM_PAD = 60;

    const SPARKY_SVG = `
        <svg width="${SIZE}" height="${SIZE}" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:block;pointer-events:none;">
            <defs>
                <radialGradient id="sparkyBody" cx="38%" cy="32%" r="62%">
                    <stop offset="0%" stop-color="#FFE566" /><stop offset="55%" stop-color="#FFC220" /><stop offset="100%" stop-color="#D4960A" />
                </radialGradient>
                <radialGradient id="sparkyShine" cx="30%" cy="25%" r="35%">
                    <stop offset="0%" stop-color="rgba(255,255,255,.65)" /><stop offset="100%" stop-color="rgba(255,255,255,0)" />
                </radialGradient>
            </defs>
            <circle cx="20" cy="20" r="19" fill="url(#sparkyBody)" />
            <ellipse cx="14" cy="12" rx="7" ry="5" fill="url(#sparkyShine)" />
            <circle cx="14" cy="17" r="2.5" fill="#1a1a1a" /><circle cx="26" cy="17" r="2.5" fill="#1a1a1a" />
            <circle cx="15.2" cy="15.8" r=".9" fill="white" /><circle cx="27.2" cy="15.8" r=".9" fill="white" />
            <path d="M12 24 Q20 31 28 24" stroke="#1a1a1a" stroke-width="2.2" stroke-linecap="round" fill="none" />
            <circle cx="10" cy="22" r="3" fill="rgba(255,120,100,.3)" /><circle cx="30" cy="22" r="3" fill="rgba(255,120,100,.3)" />
        </svg>`;

    let sparkyEl = null;
    let scheduleTimer = null;
    let visibleTimer = null;

    function randBetween(min, max) { return min + Math.floor(Math.random() * (max - min)); }

    function randomPos() {
        const vw = window.innerWidth, vh = window.innerHeight;
        const maxX = vw - SIZE - EDGE_PAD, minX = EDGE_PAD;
        const maxY = vh - SIZE - BOTTOM_PAD, minY = TOP_PAD;
        if (maxX <= minX || maxY <= minY) return null;
        return { x: randBetween(minX, maxX), y: randBetween(minY, maxY) };
    }

    function removeSparky() {
        if (sparkyEl) { sparkyEl.remove(); sparkyEl = null; }
    }

    function showFlash(x, y) {
        const flash = document.createElement("div");
        flash.className = "sparky-pts";
        flash.textContent = "\u26a1 +50";
        flash.style.left = (x - 6) + "px";
        flash.style.top = (y - 10) + "px";
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), CATCH_FLASH_MS);
    }

    function spawn() {
        removeSparky();
        const pos = randomPos();
        if (!pos) { schedule(false); return; }

        const btn = document.createElement("button");
        btn.className = "sparky-bubble sparky-in";
        btn.setAttribute("aria-label", "Catch Sparky for 50 points");
        btn.title = "\uD83D\uDE0A Catch me for 50 points!";
        btn.style.left = pos.x + "px";
        btn.style.top = pos.y + "px";
        btn.style.width = SIZE + "px";
        btn.style.height = SIZE + "px";
        btn.innerHTML = SPARKY_SVG;
        document.body.appendChild(btn);
        sparkyEl = btn;

        let caught = false;
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (caught) return;
            caught = true;
            clearTimeout(visibleTimer);
            btn.classList.remove("sparky-in");
            btn.classList.add("sparky-zap");
            showFlash(pos.x, pos.y);
            if (global.CES_POINTS) global.CES_POINTS.add(50);
            setTimeout(() => { removeSparky(); schedule(false); }, CATCH_FLASH_MS);
        });

        visibleTimer = setTimeout(() => {
            if (caught) return;
            btn.classList.remove("sparky-in");
            btn.classList.add("sparky-out");
            setTimeout(() => { removeSparky(); schedule(false); }, 500);
        }, VISIBLE_MS);
    }

    function schedule(first) {
        clearTimeout(scheduleTimer);
        const delay = first ? randBetween(FIRST_MIN_MS, FIRST_MAX_MS) : randBetween(MIN_INTERVAL_MS, MAX_INTERVAL_MS);
        scheduleTimer = setTimeout(spawn, delay);
    }

    function init() {
        if (global.__cesSparkyInit) return;
        global.__cesSparkyInit = true;
        schedule(true);
    }

    global.CES_SPARKY = { init, spawnNow: spawn };
})(window);
