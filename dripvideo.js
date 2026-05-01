/* ============================================
   POP'S EXOTIC — DRIP VIDEO OFFSET + SYNC START
   Two <video> tags play the same clip. To make
   the loop seams invisible we run them offset
   by half the clip's duration and crossfade in
   CSS so one is always at full opacity while the
   other is hitting its loop cut.
   Because seeking takes real time, we can't use
   the browser's autoplay — video A would start
   before B finishes seeking and they'd drift
   into near-sync. Instead we:
     1. Keep both videos paused on page load
     2. Wait until both are canplay-ready
     3. Seek B to duration/2
     4. Play both in the same tick
   Periodic drift correction keeps them locked.
   ============================================ */
(function () {
    'use strict';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function setupPair(wrapper) {
        const a = wrapper.querySelector('.drip-a');
        const b = wrapper.querySelector('.drip-b');
        if (!a || !b) return;

        a.pause();
        b.pause();

        let aReady = false, bReady = false, started = false;
        function markReady(v, which) {
            if (isFinite(v.duration) && v.duration > 0 && v.readyState >= 2) {
                if (which === 'a') aReady = true;
                if (which === 'b') bReady = true;
                maybeStart();
            }
        }

        function maybeStart() {
            if (started || !aReady || !bReady) return;
            started = true;
            const dur = a.duration;
            try {
                a.currentTime = 0;
                b.currentTime = dur / 2;
            } catch (e) {}
            // Kick both off in the same JS task so they drift in lockstep.
            a.play().catch(() => {});
            b.play().catch(() => {});

            // Drift watchdog. Browsers pause off-screen videos unevenly;
            // when they resume, one may be slightly ahead. Every 2s we
            // compare B's position to A's (+ offset) and correct if off.
            setInterval(() => {
                if (!isFinite(a.duration)) return;
                const expected = (a.currentTime + dur / 2) % dur;
                const diff = Math.abs(b.currentTime - expected);
                const cycleDiff = Math.min(diff, Math.abs(diff - dur));
                if (cycleDiff > 0.6 && !b.seeking) {
                    try { b.currentTime = expected; } catch (e) {}
                }
            }, 2000);
        }

        ['loadedmetadata', 'durationchange', 'canplay', 'canplaythrough'].forEach(evt => {
            a.addEventListener(evt, () => markReady(a, 'a'));
            b.addEventListener(evt, () => markReady(b, 'b'));
        });
        markReady(a, 'a');
        markReady(b, 'b');
    }

    function init() {
        document.querySelectorAll('.drip-video').forEach(setupPair);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
