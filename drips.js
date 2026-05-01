/* ============================================
   POP'S EXOTIC — LIQUID DRIP SYSTEM v3
   Six fixes from reference video:
    1. Wavy silhouette restored as top source
    2. Teardrop strands revealed via clipPath
    3. Asymmetric teardrop bulbs (not circles)
    4. Drips render behind content (z-index)
    5. Three-part wobble during hang
    6. Cranked goo filter (stdDev 15, thr 35/-15)
   Each divider builds dynamically from its
   data attrs (data-fill, data-filter-id) on load.
   IntersectionObserver gates CPU. Reduced-motion
   renders the static silhouette only.
   Tune constants at the labeled block below.
   ============================================ */
(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SVG_NS = 'http://www.w3.org/2000/svg';

    // ---- Tuning ----
    const NUM_STRANDS     = 14;
    const VIEW_W          = 1440;
    const BAND_H          = 20;
    const LOBE_Y_MIN      = 80;   // lobe tip y (60 below band)
    const LOBE_Y_MAX      = 120;  // lobe tip y (100 below band)
    const BULB_R_START    = 3;
    const BULB_R_HANG     = 10;
    const BULB_R_SWELL    = 16;
    const WOBBLE_X        = 3;    // ±px
    const WOBBLE_X_SEC    = 0.45; // half-cycle
    const WOBBLE_R_DEG    = 4;    // ±deg
    const WOBBLE_R_SEC    = 0.55; // half-cycle
    const WOBBLE_SX       = 1.08; // scaleX peak
    const WOBBLE_SX_SEC   = 0.35; // half-cycle
    const SHORT_LEN       = [80, 120];
    const MED_LEN         = [140, 180];
    const LONG_LEN        = [220, 260];
    const MIX             = { short: 3, med: 7, long: 4 }; // sums to 14
    const FALL_DIST       = [140, 220];
    const FALL_ROT        = [20, 40];    // ±deg tumble
    const RESET_COOLDOWN  = [2.5, 5.5];
    const INITIAL_STAGGER = 6;
    const PHASE_JITTER    = 0.15;         // ±15% per cycle per phase

    function rand(min, max) { return min + Math.random() * (max - min); }
    function jitter(base) { return base * (1 + rand(-PHASE_JITTER, PHASE_JITTER)); }
    function pick(arr) { return rand(arr[0], arr[1]); }

    // ---- Asymmetric teardrop bulb (wider at bottom, slight neck above) ----
    // Local coords: center at (0,0). Base size, scaled per-bulb via transform.
    function makeBulbPath() {
        return 'M 0 -10 C 5 -10 8 -4 8 2 C 8 8 4 12 0 12 C -4 12 -8 8 -8 2 C -8 -4 -5 -10 0 -10 Z';
    }

    // ---- Organic teardrop strand path (narrows at top anchor, swells
    // midway, tapers to a neck immediately above the bulb attachment) ----
    function makeStrandPath(L) {
        const L3 = L / 3, L2 = L / 2, L23 = L * 2 / 3;
        return 'M 0 0 ' +
               'Q 3 ' + L3 + ' 4 ' + L2 + ' ' +
               'Q 5 ' + L23 + ' 3 ' + L + ' ' +
               'Q 0 ' + (L + 6) + ' -3 ' + L + ' ' +
               'Q -5 ' + L23 + ' -4 ' + L2 + ' ' +
               'Q -3 ' + L3 + ' 0 0 Z';
    }

    // ---- Wavy silhouette hangs from the band, dipping to each anchor ----
    // Returns path d attribute covering (0, BAND_H) → each (anchor.x, anchor.y)
    // as a dip, back up to BAND_H between anchors, closed to start.
    function makeSilhouettePath(anchors) {
        let d = 'M 0,' + BAND_H + ' ';
        let prevEnd = 0;
        anchors.forEach((a, i) => {
            const nextX = (i === anchors.length - 1) ? VIEW_W : (a.x + anchors[i + 1].x) / 2;
            // down to lobe tip
            d += 'C ' + (prevEnd + (a.x - prevEnd) * 0.4) + ',' + a.y + ' '
              + (a.x - (a.x - prevEnd) * 0.4) + ',' + a.y + ' '
              + a.x + ',' + a.y + ' ';
            // back up to band
            d += 'C ' + (a.x + (nextX - a.x) * 0.4) + ',' + a.y + ' '
              + (nextX - (nextX - a.x) * 0.4) + ',' + BAND_H + ' '
              + nextX + ',' + BAND_H + ' ';
            prevEnd = nextX;
        });
        d += 'L ' + VIEW_W + ',' + BAND_H + ' Z';
        return d;
    }

    // ---- Build 14 anchors: uneven spacing, 3 short / 7 med / 4 long mix ----
    function buildAnchors() {
        // Slight x-jitter so spacing is uneven rather than clockwork
        const anchors = [];
        for (let i = 0; i < NUM_STRANDS; i++) {
            const base = (i + 0.5) / NUM_STRANDS * VIEW_W;
            const jx = rand(-VIEW_W / NUM_STRANDS * 0.25, VIEW_W / NUM_STRANDS * 0.25);
            anchors.push({ x: base + jx, y: rand(LOBE_Y_MIN, LOBE_Y_MAX) });
        }
        anchors.sort((a, b) => a.x - b.x);

        // Assign length tiers, shuffled across anchors
        const tiers = [];
        for (let i = 0; i < MIX.short; i++) tiers.push(SHORT_LEN);
        for (let i = 0; i < MIX.med; i++)   tiers.push(MED_LEN);
        for (let i = 0; i < MIX.long; i++)  tiers.push(LONG_LEN);
        for (let i = tiers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tiers[i], tiers[j]] = [tiers[j], tiers[i]];
        }
        tiers.forEach((t, i) => { anchors[i].length = pick(t); });
        return anchors;
    }

    function initDivider(wrapper) {
        const svg = wrapper.querySelector('.drip-divider');
        if (!svg) return;
        const fill = wrapper.dataset.fill;
        const filterId = wrapper.dataset.filterId;
        if (!fill || !filterId) return;

        // Wipe in case of re-init
        while (svg.firstChild) svg.removeChild(svg.firstChild);

        // ---- defs: filter + one clipPath per strand ----
        const defs = document.createElementNS(SVG_NS, 'defs');

        // Gooey filter — stdDev 15, tight threshold, expanded region so blur
        // doesn't clip at SVG boundary
        const filter = document.createElementNS(SVG_NS, 'filter');
        filter.setAttribute('id', filterId);
        filter.setAttribute('x', '-10%');
        filter.setAttribute('y', '-10%');
        filter.setAttribute('width', '120%');
        filter.setAttribute('height', '120%');
        filter.innerHTML =
            '<feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur"/>' +
            '<feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -15" result="goo"/>' +
            '<feBlend in="SourceGraphic" in2="goo"/>';
        defs.appendChild(filter);

        const anchors = buildAnchors();

        // Strand-specific clipPaths — reveal rect height animates top-to-bottom
        const clipIds = [];
        anchors.forEach((a, i) => {
            const clipId = filterId + '-clip-' + i;
            clipIds.push(clipId);
            const clip = document.createElementNS(SVG_NS, 'clipPath');
            clip.setAttribute('id', clipId);
            clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
            const rect = document.createElementNS(SVG_NS, 'rect');
            rect.setAttribute('class', 'reveal-rect');
            rect.setAttribute('x', '-20');
            rect.setAttribute('y', '0');
            rect.setAttribute('width', '40');
            rect.setAttribute('height', '0');
            clip.appendChild(rect);
            a._reveal = rect;
            defs.appendChild(clip);
        });
        svg.appendChild(defs);

        // ---- Layer 1: flat top band (outside filter, sharp edge) ----
        const band = document.createElementNS(SVG_NS, 'rect');
        band.setAttribute('class', 'strand-band');
        band.setAttribute('x', 0);
        band.setAttribute('y', 0);
        band.setAttribute('width', VIEW_W);
        band.setAttribute('height', BAND_H);
        band.setAttribute('fill', fill);
        svg.appendChild(band);

        // ---- Layer 2: goo group (silhouette + strands + detached bulbs) ----
        const gooGroup = document.createElementNS(SVG_NS, 'g');
        gooGroup.setAttribute('filter', 'url(#' + filterId + ')');
        svg.appendChild(gooGroup);

        // Sublayer A: wavy silhouette
        const silhouette = document.createElementNS(SVG_NS, 'path');
        silhouette.setAttribute('class', 'drip-silhouette');
        silhouette.setAttribute('d', makeSilhouettePath(anchors));
        silhouette.setAttribute('fill', fill);
        gooGroup.appendChild(silhouette);

        // Sublayer B: strands — one per anchor
        const strands = anchors.map((a, i) => {
            // Strand root group translated to (anchor.x, anchor.y)
            const root = document.createElementNS(SVG_NS, 'g');
            root.setAttribute('class', 'strand');
            root.setAttribute('data-index', i);
            root.setAttribute('transform', 'translate(' + a.x + ',' + a.y + ')');

            // Full-length teardrop path, revealed via clipPath
            const teardrop = document.createElementNS(SVG_NS, 'path');
            teardrop.setAttribute('class', 'strand-teardrop');
            teardrop.setAttribute('d', makeStrandPath(a.length));
            teardrop.setAttribute('fill', fill);
            teardrop.setAttribute('clip-path', 'url(#' + clipIds[i] + ')');
            root.appendChild(teardrop);

            // Bulb-wrap translates to follow the reveal tip (y = 0 → L)
            const bulbWrap = document.createElementNS(SVG_NS, 'g');
            bulbWrap.setAttribute('class', 'strand-bulb-wrap');

            // Inner transform takes wobble + scale independent of main y-anim
            const bulbInner = document.createElementNS(SVG_NS, 'g');
            bulbInner.setAttribute('class', 'strand-bulb-inner');

            const bulb = document.createElementNS(SVG_NS, 'path');
            bulb.setAttribute('class', 'strand-bulb');
            bulb.setAttribute('d', makeBulbPath());
            bulb.setAttribute('fill', fill);
            // Start at scale 0.3 → ~r=3 equivalent for the 10-unit base path
            bulbInner.appendChild(bulb);
            bulbWrap.appendChild(bulbInner);
            root.appendChild(bulbWrap);

            gooGroup.appendChild(root);

            return { root, teardrop, bulbWrap, bulbInner, bulb, anchor: a, reveal: a._reveal };
        });

        // Sublayer C: detached falling bulbs (populated dynamically, inside filter)
        const detachedLayer = document.createElementNS(SVG_NS, 'g');
        detachedLayer.setAttribute('class', 'detached-bulbs');
        gooGroup.appendChild(detachedLayer);

        // ---- Layer 3: wet highlights OUTSIDE the filter ----
        const highlightLayer = document.createElementNS(SVG_NS, 'g');
        highlightLayer.setAttribute('class', 'highlights');
        svg.appendChild(highlightLayer);

        strands.forEach((s, i) => {
            const hRoot = document.createElementNS(SVG_NS, 'g');
            hRoot.setAttribute('transform', 'translate(' + s.anchor.x + ',' + s.anchor.y + ')');
            const hInner = document.createElementNS(SVG_NS, 'g');
            const ell = document.createElementNS(SVG_NS, 'ellipse');
            ell.setAttribute('cx', -3);
            ell.setAttribute('cy', -4);
            ell.setAttribute('rx', 3);
            ell.setAttribute('ry', 1.5);
            ell.setAttribute('fill', '#ffffff');
            ell.setAttribute('opacity', 0);
            hInner.appendChild(ell);
            hRoot.appendChild(hInner);
            highlightLayer.appendChild(hRoot);
            s.hlRoot = hRoot;
            s.hlInner = hInner;
            s.hlEll = ell;
        });

        // ---- Initial state ----
        strands.forEach(s => {
            if (window.gsap) {
                gsap.set(s.bulbWrap,  { y: 0 });
                gsap.set(s.bulbInner, { scale: 0, x: 0, rotation: 0, scaleX: 1, transformOrigin: '50% 50%' });
                gsap.set(s.hlRoot,    { y: 0 });
                gsap.set(s.hlInner,   { x: 0, transformOrigin: '50% 50%' });
                gsap.set(s.hlEll,     { opacity: 0 });
                gsap.set(s.reveal,    { attr: { height: 0 } });
            }
        });

        if (prefersReduced || !window.gsap) return;
        gsap.registerPlugin && gsap.registerPlugin();

        const state = { paused: true, started: false };

        function runCycle(s) {
            if (state.paused) return;

            const L        = s.anchor.length;
            const tEmerge  = jitter(0.5);
            const tGrow    = jitter(2.3);
            const tSwell   = jitter(1.0);
            const tWobble  = jitter(1.4);
            const tSnap    = 0.15;
            const tFall    = jitter(1.1);
            const fallDist = pick(FALL_DIST);
            const fallRot  = pick(FALL_ROT) * (Math.random() < 0.5 ? -1 : 1);

            // Reset
            gsap.set(s.reveal,    { attr: { height: 0 } });
            gsap.set(s.bulbWrap,  { y: 0 });
            gsap.set(s.bulbInner, { scale: 0, x: 0, rotation: 0, scaleX: 1, opacity: 1, transformOrigin: '50% 50%' });
            gsap.set(s.hlRoot,    { y: 0 });
            gsap.set(s.hlInner,   { x: 0, scale: 1, transformOrigin: '50% 50%' });
            gsap.set(s.hlEll,     { opacity: 0 });

            // Phase 1: EMERGE — bulb fades in at anchor at radius ~3 (scale 0.3)
            const tl = gsap.timeline({
                onComplete: () => {
                    s.currentTimeline = null;
                    if (state.paused) return;
                    s.nextCall = gsap.delayedCall(pick(RESET_COOLDOWN), () => runCycle(s));
                }
            });
            s.currentTimeline = tl;
            s.nextCall = null;

            // Phase 1: EMERGE (bulb pops in at anchor)
            tl.to(s.bulbInner, { scale: BULB_R_START / 10, duration: tEmerge, ease: 'power2.out' }, 0);
            tl.to(s.hlEll,     { opacity: 0.45, duration: tEmerge, ease: 'power2.out' }, 0);

            // Phase 2: GROW — clipPath reveals teardrop top-down, bulb follows tip
            const p2 = tEmerge;
            tl.to(s.reveal,    { attr: { height: L }, duration: tGrow, ease: 'power2.inOut' }, p2);
            tl.to([s.bulbWrap, s.hlRoot], { y: L, duration: tGrow, ease: 'power2.inOut' }, p2);
            tl.to(s.bulbInner, { scale: BULB_R_HANG / 10, duration: tGrow, ease: 'power2.inOut' }, p2);

            // Phase 3: SWELL — bulb grows, strand stretches an extra 8%
            const p3 = p2 + tGrow;
            tl.to(s.bulbInner, { scale: BULB_R_SWELL / 10, duration: tSwell, ease: 'sine.inOut' }, p3);
            tl.to(s.reveal,    { attr: { height: L * 1.08 }, duration: tSwell, ease: 'sine.inOut' }, p3);
            tl.to([s.bulbWrap, s.hlRoot], { y: L * 1.08, duration: tSwell, ease: 'sine.inOut' }, p3);

            // Phase 4: WOBBLE — 3-part loop, killed at snap
            const p4 = p3 + tSwell;
            const wobbles = [];
            tl.call(() => {
                if (state.paused) return;
                wobbles.push(gsap.to([s.bulbInner, s.hlInner], {
                    x: WOBBLE_X, duration: WOBBLE_X_SEC, yoyo: true, repeat: -1, ease: 'sine.inOut'
                }));
                wobbles.push(gsap.to(s.bulbInner, {
                    rotation: WOBBLE_R_DEG, duration: WOBBLE_R_SEC, yoyo: true, repeat: -1, ease: 'sine.inOut'
                }));
                wobbles.push(gsap.to(s.bulbInner, {
                    scaleX: WOBBLE_SX, duration: WOBBLE_SX_SEC, yoyo: true, repeat: -1, ease: 'sine.inOut'
                }));
            }, null, p4);

            // Phase 5: SNAP — clip retracts, bulb detaches
            const p5 = p4 + tWobble;
            tl.call(() => {
                wobbles.forEach(w => w.kill());
                gsap.set(s.bulbInner, { x: 0, rotation: 0, scaleX: 1 });
                gsap.set(s.hlInner, { x: 0 });
            }, null, p5);
            tl.to(s.reveal,  { attr: { height: 0 }, duration: tSnap, ease: 'power4.out' }, p5);
            tl.to(s.hlEll,   { opacity: 0, duration: tSnap, ease: 'power2.out' }, p5);
            // Spawn 1–2 satellite drops at the break point
            tl.call(() => {
                if (state.paused) return;
                spawnSatellites(s, fallDist);
            }, null, p5);

            // Phase 6: FALL — main bulb drops with gravity + tumble
            const p6 = p5 + tSnap;
            tl.to(s.bulbWrap, {
                y: '+=' + fallDist,
                duration: tFall,
                ease: 'power3.in'
            }, p6);
            tl.to(s.bulbInner, {
                rotation: fallRot,
                duration: tFall,
                ease: 'power2.in'
            }, p6);
            // Fade final 40% of fall
            tl.to(s.bulb, {
                opacity: 0,
                duration: tFall * 0.4,
                ease: 'power1.out'
            }, p6 + tFall * 0.6);

            // Phase 7: RESET handled by onComplete above
        }

        // 1–2 small teardrops spawned at the break point, fall faster than main
        function spawnSatellites(s, baseDist) {
            const count = 1 + Math.floor(Math.random() * 2);
            // Main bulb is currently at wrapper y = L*1.08 relative to strand root,
            // which is at (anchor.x, anchor.y). Translate satellites into the
            // detached-bulbs layer at that same visual position.
            const originX = s.anchor.x;
            const originY = s.anchor.y + s.anchor.length * 1.08;
            for (let i = 0; i < count; i++) {
                const sat = document.createElementNS(SVG_NS, 'g');
                sat.setAttribute('transform', 'translate(' + (originX + rand(-4, 4)) + ',' + originY + ')');
                const p = document.createElementNS(SVG_NS, 'path');
                p.setAttribute('d', makeBulbPath());
                p.setAttribute('fill', fill);
                sat.appendChild(p);
                detachedLayer.appendChild(sat);
                gsap.set(sat, { scale: 0.2, transformOrigin: '50% 50%' });
                gsap.to(sat, {
                    y: '+=' + rand(baseDist * 0.9, baseDist * 1.3),
                    rotation: rand(-60, 60),
                    duration: rand(0.6, 0.9),
                    ease: 'power3.in',
                    onComplete: () => sat.remove()
                });
                gsap.to(p, {
                    opacity: 0,
                    duration: 0.3,
                    delay: 0.3,
                    ease: 'power1.out'
                });
            }
        }

        function pauseAll() {
            state.paused = true;
            strands.forEach(s => {
                if (s.currentTimeline) s.currentTimeline.pause();
                if (s.nextCall) s.nextCall.pause();
            });
        }

        function resumeAll() {
            state.paused = false;
            strands.forEach(s => {
                if (s.currentTimeline) s.currentTimeline.resume();
                else if (s.nextCall) s.nextCall.resume();
                else runCycle(s);
            });
        }

        wrapper.addEventListener('drip-resume', () => {
            if (!state.started) {
                state.started = true;
                state.paused = false;
                strands.forEach(s => {
                    s.nextCall = gsap.delayedCall(Math.random() * INITIAL_STAGGER, () => runCycle(s));
                });
            } else {
                resumeAll();
            }
        });
        wrapper.addEventListener('drip-pause', pauseAll);
    }

    function init() {
        // hero→green divider is now a video, not an SVG — skip it here.
        document.querySelectorAll('.divider.drip-green-to-purple, .divider.drip-purple-to-pink, .divider.drip-pink-to-yellow').forEach(initDivider);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                if (entry.isIntersecting) el.dispatchEvent(new CustomEvent('drip-resume'));
                else el.dispatchEvent(new CustomEvent('drip-pause'));
            });
        }, { rootMargin: '100px 0px' });

        document.querySelectorAll('.divider').forEach(el => observer.observe(el));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
