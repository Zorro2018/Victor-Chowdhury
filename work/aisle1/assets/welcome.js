/* ===========================================================================
   CES Reporting Hub — Portable Demo · Apple-style welcome reveal
   "Aisle1" handwrites itself on screen, then the banner tears in half and
   flies apart to expose the hub underneath. Pure CSS/SVG/JS, no dependencies.

   NOTE: this intentionally does NOT persist a "seen" flag anywhere. This is
   a presentation demo — it should play every time index.html loads, full
   stop. (An earlier version used localStorage to only show it once, which
   meant a single test load silently burned the only playback forever.)
   Respects prefers-reduced-motion. The overlay is hidden (not removed) when
   finished, so CES_REPLAY_WELCOME() can always bring it back for a demo.
   =========================================================================== */
(function () {
    "use strict";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Timing is spelled out explicitly so the "hold the finished banner" window
    // is easy to tune without hunting for a magic number buried in a timeout call.
    const DRAW_MS = 1700;        // stroke-dashoffset pen-trace duration
    const FILL_DELAY_MS = 1000;  // ink fill-in starts partway through the draw
    const FILL_DURATION_MS = 1100;
    const FULL_BANNER_AT_MS = Math.max(DRAW_MS, FILL_DELAY_MS + FILL_DURATION_MS); // banner fully inked
    const HOLD_MS = 2000;        // how long to show the complete banner before tearing
    const AUTO_TEAR_MS = FULL_BANNER_AT_MS + HOLD_MS;

    function buildInnerHtml() {
        return `
            <svg class="welcome-svg" viewBox="0 0 640 220" preserveAspectRatio="xMidYMid meet">
                <text x="320" y="140" text-anchor="middle" class="welcome-text">Aisle1</text>
            </svg>
            <div class="welcome-sub">CES Reporting Hub</div>
        `;
    }

    function animateHandwriting(overlay) {
        const texts = overlay.querySelectorAll(".welcome-text");
        texts.forEach(t => {
            const len = (typeof t.getComputedTextLength === "function" && t.getComputedTextLength()) || 900;
            t.style.transition = "none";
            t.style.strokeDasharray = len;
            t.style.strokeDashoffset = len;
            t.style.fillOpacity = "0";
            // Force reflow so the starting dashoffset is committed before the transition starts.
            void t.getBoundingClientRect();
            t.style.transition = `stroke-dashoffset ${DRAW_MS / 1000}s cubic-bezier(.3,.6,.25,1), fill-opacity ${FILL_DURATION_MS / 1000}s ease-in ${FILL_DELAY_MS / 1000}s`;
            t.style.strokeDashoffset = "0";
            t.style.fillOpacity = "1";
        });
    }

    function tearApart(overlay, onDone) {
        const left = overlay.querySelector(".tear-left");
        const right = overlay.querySelector(".tear-right");
        overlay.classList.add("torn");
        if (left) {
            left.addEventListener("transitionend", function handler() {
                left.removeEventListener("transitionend", handler);
                onDone();
            }, { once: true });
        }
        // Safety fallback in case transitionend never fires (e.g. display:none mid-transition).
        setTimeout(onDone, 1600);
        void right; // right half animates via the same CSS class, no separate listener needed
    }

    function finish(overlay) {
        if (!overlay) return;
        // Hide, don't remove — keeps the element around so Replay always works.
        overlay.style.display = "none";
        document.body.classList.remove("welcome-lock");
    }

    function runWelcome() {
        const overlay = document.getElementById("welcome-overlay");
        if (!overlay) return;

        if (reduceMotion) {
            overlay.style.display = "none";
            document.body.classList.remove("welcome-lock");
            return;
        }

        try {
            overlay.style.display = "flex";
            overlay.classList.remove("torn");
            document.body.classList.add("welcome-lock");

            const leftInner = overlay.querySelector(".tear-left .inner");
            const rightInner = overlay.querySelector(".tear-right .inner");
            if (!leftInner || !rightInner) throw new Error("welcome overlay markup is missing .tear-left/.tear-right .inner");
            const innerHtml = buildInnerHtml();
            leftInner.innerHTML = innerHtml;
            rightInner.innerHTML = innerHtml;

            let settled = false;
            function skipAhead() {
                if (settled) return;
                settled = true;
                tearApart(overlay, () => finish(overlay));
            }

            requestAnimationFrame(() => {
                try { animateHandwriting(overlay); } catch (err) { skipAhead(); }
            });
            const autoTimer = setTimeout(skipAhead, AUTO_TEAR_MS);

            overlay.addEventListener("click", () => { clearTimeout(autoTimer); skipAhead(); });
            document.addEventListener("keydown", function keyHandler() {
                document.removeEventListener("keydown", keyHandler);
                clearTimeout(autoTimer); skipAhead();
            }, { once: true });
        } catch (err) {
            // Any unexpected failure should never leave the visitor staring at a frozen overlay.
            finish(overlay);
        }
    }

    document.addEventListener("DOMContentLoaded", runWelcome);
    window.CES_REPLAY_WELCOME = runWelcome;
})();
