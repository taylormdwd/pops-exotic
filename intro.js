/* ============================================
   POP'S EXOTIC — INTRO OVERLAY (full sequence)
   Total time on screen: ~1.05s — tuned to feel
   snappy on a fast connection without skipping
   the spin or morph.
     Phase 1 — hold + spin     (0   → 400ms)
       Logo sits scaled 3x at viewport center,
       rotates 720deg with a soft ease.
     Phase 2 — morph to nav    (350 → 850ms)
       Logo translates from viewport center to
       the nav slot AND scales 3 → 1 in one
       transition. The 50ms overlap with the
       spin keeps the motion continuous.
     Phase 3 — fade overlay    (850 → 1050ms)
       Logo is restored to its DOM home (no
       visual jump, it's already at the nav
       coordinates). Overlay fades to opacity 0.
     Phase 4 — cleanup         (1050ms)
       Overlay removed; body scroll restored.
   Click/keypress/scroll/touchmove dismisses early
   with a 200ms snap-and-fade.
   prefers-reduced-motion: skip the morph; show
   the centered logo for 700ms, then a soft fade.
   sessionStorage flag means it runs once per tab.
   Pure CSS transitions — no GSAP, no rAF — so it
   stays reliable under tab throttling.
   ============================================ */
(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alreadyShown = sessionStorage.getItem('popsIntroShown');

    function killOverlay() {
        const overlay = document.getElementById('intro-overlay');
        if (overlay) {
            overlay.style.pointerEvents = 'none';
            overlay.style.display = 'none';
            overlay.remove();
        }
        document.body.style.overflow = '';
    }

    // Already shown this session — wipe the overlay before paint
    if (alreadyShown) {
        killOverlay();
        return;
    }

    sessionStorage.setItem('popsIntroShown', '1');

    // Debug timing slowdown — append ?introSlow=4 to the URL to multiply
    // every animation duration by 4. Used only for development/testing.
    // Has no effect in production. Kept tiny.
    const slow = (() => {
        const m = location.search.match(/[?&]introSlow=(\d+)/);
        return m ? Math.max(1, Math.min(10, parseInt(m[1], 10))) : 1;
    })();
    const ms = (n) => n * slow;

    function run() {
        const overlay = document.getElementById('intro-overlay');
        const logo = document.getElementById('brand-logo');
        const wordmark = document.querySelector('.brand-wordmark');

        if (!overlay || !logo) {
            killOverlay();
            return;
        }

        const logoHome = logo.parentNode;
        const logoNextSibling = logo.nextSibling;

        // FLIP: measure the nav slot BEFORE moving the logo so we know where
        // to fly it to. After the move the rect would collapse (empty slot).
        const navRect = logo.getBoundingClientRect();
        const naturalW = navRect.width || 48;
        const naturalH = navRect.height || 48;
        const targetX = navRect.left;
        const targetY = navRect.top;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const startX = vw / 2 - naturalW / 2;
        const startY = vh / 2 - naturalH / 2;

        // Hide wordmark during intro; restored at the end
        if (wordmark) {
            wordmark.style.transition = 'none';
            wordmark.style.opacity = '0';
        }

        // Lock scroll
        document.body.style.overflow = 'hidden';

        // Helper: park the logo back in its DOM home and clear inline styles.
        // Visually unchanged because by the time we call this, the morph has
        // already landed it on the nav coordinates at scale 1.
        function returnLogoHome() {
            if (logoHome) logoHome.insertBefore(logo, logoNextSibling);
            logo.removeAttribute('style');
        }

        // Reduced motion: skip the morph. Center the logo, hold briefly,
        // then fade. Same timing budget, no spinning or flying.
        if (prefersReduced) {
            overlay.appendChild(logo);
            logo.style.cssText = [
                'position: fixed',
                'top: 50%',
                'left: 50%',
                'transform: translate(-50%, -50%)',
                'transition: none'
            ].join(';');
            setTimeout(function () {
                returnLogoHome();
                if (wordmark) {
                    wordmark.style.transition = 'opacity 250ms ease';
                    wordmark.style.opacity = '1';
                }
                overlay.style.pointerEvents = 'none';
                overlay.style.transition = 'opacity 350ms ease';
                overlay.style.opacity = '0';
                setTimeout(killOverlay, 400);
            }, 700);
            return;
        }

        // Move logo into the overlay; pin it to fixed coords so we can FLIP.
        overlay.appendChild(logo);
        logo.style.position = 'fixed';
        logo.style.top = '0';
        logo.style.left = '0';
        logo.style.margin = '0';
        logo.style.transformOrigin = 'center center';
        logo.style.willChange = 'transform';
        // Starting state: at viewport center, scaled 3x, no rotation.
        logo.style.transform =
            'translate3d(' + startX + 'px, ' + startY + 'px, 0) scale(3) rotate(0deg)';
        logo.style.transition = 'none';

        // Early-dismiss: click / keypress / wheel / touchmove.
        // Snaps the logo home and fades the overlay in 200ms.
        let dismissing = false;
        function dismiss() {
            if (dismissing) return;
            dismissing = true;
            overlay.style.pointerEvents = 'none';
            returnLogoHome();
            if (wordmark) {
                wordmark.style.transition = 'opacity 200ms ease';
                wordmark.style.opacity = '1';
            }
            overlay.style.transition = 'opacity 200ms ease';
            overlay.style.opacity = '0';
            setTimeout(killOverlay, 250);
            cleanupListeners();
        }
        function onClick() { dismiss(); }
        function onKey()   { dismiss(); }
        function onWheel() { dismiss(); }
        function cleanupListeners() {
            document.removeEventListener('click', onClick, true);
            document.removeEventListener('keydown', onKey, true);
            window.removeEventListener('wheel', onWheel, true);
            window.removeEventListener('touchmove', onWheel, true);
        }
        document.addEventListener('click', onClick, true);
        document.addEventListener('keydown', onKey, true);
        window.addEventListener('wheel', onWheel, { capture: true, passive: true });
        window.addEventListener('touchmove', onWheel, { capture: true, passive: true });

        // Force reflow so the next style write triggers a transition.
        void logo.offsetWidth;

        // PHASE 1 — spin in place (400ms)
        logo.style.transition = 'transform ' + ms(400) + 'ms cubic-bezier(0.34, 1.4, 0.64, 1)';
        logo.style.transform =
            'translate3d(' + startX + 'px, ' + startY + 'px, 0) scale(3) rotate(720deg)';

        // PHASE 2 — morph to nav: translate + scale down (starts at 350ms,
        // overlaps the last 50ms of the spin so motion is continuous).
        const phase2Start = ms(350);
        const phase2Duration = ms(500);
        setTimeout(function () {
            if (dismissing) return;
            logo.style.transition =
                'transform ' + phase2Duration + 'ms cubic-bezier(0.65, 0, 0.35, 1)';
            logo.style.transform =
                'translate3d(' + targetX + 'px, ' + targetY + 'px, 0) scale(1) rotate(' + (slow > 1 ? 720 : 720) + 'deg)';
        }, phase2Start);

        // PHASE 3 — restore logo to nav DOM + fade overlay
        const phase3Start = phase2Start + phase2Duration;
        setTimeout(function () {
            if (dismissing) return;
            // Logo is already visually at the nav coordinates at scale 1, so
            // moving it back to its DOM home and clearing inline styles is a
            // no-op visually. Overlay fade reveals the page underneath.
            returnLogoHome();
            if (wordmark) {
                wordmark.style.transition = 'opacity 200ms ease';
                wordmark.style.opacity = '1';
            }
            overlay.style.pointerEvents = 'none';
            overlay.style.transition = 'opacity ' + ms(200) + 'ms ease';
            overlay.style.opacity = '0';
        }, phase3Start);

        // PHASE 4 — cleanup
        setTimeout(function () {
            if (dismissing) return;
            killOverlay();
            cleanupListeners();
        }, phase3Start + ms(220));
    }

    function start() {
        if (document.fonts && document.fonts.ready) {
            // 0.4s safety: don't block the intro if fonts hang
            const t = setTimeout(run, 400);
            document.fonts.ready.then(function () {
                clearTimeout(t);
                run();
            });
        } else {
            run();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
