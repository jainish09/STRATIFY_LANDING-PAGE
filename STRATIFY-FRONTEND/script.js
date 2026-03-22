/* ════════════════════════════════════════════
   STRATIFY – script.js  (Corrected Stage Order)

   STAGE 1 — 0–33% scroll:
     • FULL "STRATIFY" stays visible
     • S shakes in place (no scale, others untouched)

   STAGE 2 — 33–66% scroll:
     • S grows from 1× → 2.5× (centred scale-up)
     • T,R,A,T,I,F,Y dissolve and exit as S grows

   STAGE 3 — 66–100% scroll:
     • S → WHITE BOOM (scale 60) + white flash → main.html
   ════════════════════════════════════════════ */

'use strict';

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const easeIO = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// ════════════════════════════════════════════
// AMBIENT PARTICLE CANVAS
// ════════════════════════════════════════════
(function ambientCanvas() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  function P() {
    this.reset = function () {
      this.x = Math.random() * W; this.y = Math.random() * H;
      this.vx = (Math.random() - .5) * .15; this.vy = (Math.random() - .5) * .15;
      this.r = Math.random() * 1.2 + .3; this.alpha = Math.random() * .2 + .03;
      this.life = 0; this.maxLife = 220 + Math.random() * 300;
    }; this.reset();
  }
  for (let i = 0; i < 60; i++) { const p = new P(); p.life = Math.random() * p.maxLife; particles.push(p); }
  function drawLines() {
    for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 100) {
        ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(140,80,240,${(1 - d / 100) * .05})`; ctx.lineWidth = .5; ctx.stroke();
      }
    }
  }
  function tick() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.life++;
      const pr = p.life / p.maxLife, fade = pr < .2 ? pr / .2 : pr > .8 ? (1 - pr) / .2 : 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,180,255,${p.alpha * fade})`; ctx.fill();
      if (p.life >= p.maxLife || p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) p.reset();
    });
    drawLines(); requestAnimationFrame(tick);
  }
  resize(); window.addEventListener('resize', resize, { passive: true }); tick();
})();

// ════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════
function goToMain() {
  sessionStorage.setItem('stratify_intro_done', '1');
  window.location.href = 'main.html'; // immediate — no setTimeout delay
}

let boomFired = false;

function triggerBoom(instant) {
  if (boomFired) return;
  boomFired = true;

  const sEl = document.getElementById('letterS');
  const boomFlash = document.getElementById('boomFlash');
  if (!sEl || !boomFlash) return;

  if (instant) {
    boomFlash.classList.add('hold');
    goToMain();
    return;
  }

  // Pre-warm GPU for the transform before it happens
  sEl.style.willChange = 'transform, opacity';

  // Stop shake classes, prep boom transition
  sEl.classList.remove('shake-light', 'shake-heavy');
  sEl.classList.add('boom');
  void sEl.offsetWidth; // flush style changes

  // STEP 1: S scales up fast (22× fills screen — lighter than 60× on GPU)
  sEl.style.transform = 'scale(22)';

  // STEP 2: White flash starts at 50ms (covers S while it's still scaling)
  // This hides any GPU jank from the scale rasterization
  setTimeout(() => {
    boomFlash.style.transition = 'opacity 0.25s ease-out';
    boomFlash.style.opacity = '1';

    // STEP 3: Navigate while screen is fully white (no visible lag)
    setTimeout(goToMain, 280);
  }, 50);
}

// Skip button
document.getElementById('skipBtn')?.addEventListener('click', () => triggerBoom(true));

// ════════════════════════════════════════════
// 3-STAGE ENGINE
// ════════════════════════════════════════════
(function engine() {
  const spacer = document.querySelector('.scroll-spacer');
  const wordmark = document.getElementById('wordmark');
  const sEl = document.getElementById('letterS');
  const scrollHint = document.getElementById('scrollHint');
  if (!spacer || !wordmark || !sEl) return;

  const letters = Array.from(wordmark.querySelectorAll('.wl'));
  // Non-S letters (idx 1-7 = T R A T I F Y)
  const exits = [
    null,
    { tx: -220, ty: -100 }, // T
    { tx: -290, ty: 70 }, // R
    { tx: -100, ty: 155 }, // A
    { tx: 155, ty: -125 }, // T
    { tx: 235, ty: 90 }, // I
    { tx: 280, ty: -70 }, // F
    { tx: 130, ty: 165 }, // Y
  ];

  const S1 = 0.33; // Stage 1: 0 → 33%
  const S2 = 0.66; // Stage 2: 33% → 66%
  // Stage 3: 66% → 100%

  let currentP = 0, targetP = 0;
  const INTRO_END = () => Math.max(spacer.offsetHeight - window.innerHeight, 1);

  function render(p) {

    // Scroll hint — hide after first movement
    if (scrollHint) scrollHint.style.opacity = (1 - clamp(p / .03, 0, 1)).toString();

    // ── STAGE 1 (0 – 33%): S shakes, TRATIFY untouched ──────────────
    if (p <= S1) {
      // Keep ALL letters fully visible
      letters.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = '';
        el.style.filter = '';
      });

      // S shake: starts at 15% into stage 1
      const progress = p / S1;
      sEl.classList.remove('shake-heavy', 'boom');
      if (progress > 0.15) sEl.classList.add('shake-light');
      else sEl.classList.remove('shake-light');

      // S stays at its natural wordmark scale (shake keyframe handles translateX only)
      // Don't override transform here — the keyframe is applied via class
    }

    // ── STAGE 2 (33% – 66%): S slightly bigger (1.15×) + heavy shake, TRATIFY exits ──
    else if (p <= S2 && !boomFired) {
      const s2 = (p - S1) / (S2 - S1);  // 0→1 within stage 2
      const s2e = easeIO(s2);

      // S: apply BOTH heavy shake class (has 1.15× baked in keyframe) — no inline transform override
      sEl.classList.remove('shake-light', 'boom');
      sEl.classList.add('shake-heavy');
      sEl.style.transform = ''; // let keyframe handle it entirely

      // TRATIFY dissolves as stage 2 progresses
      letters.forEach((el, idx) => {
        if (idx === 0) return; // skip S
        const stagger = clamp((s2e - (idx - 1) * .06) / .8, 0, 1);
        const sv = easeIO(stagger);
        const v = exits[idx];
        el.style.opacity = (1 - sv).toString();
        el.style.transform = `translate(${v.tx * sv}px,${v.ty * sv}px) scale(${1 - sv * .3})`;
        el.style.filter = `blur(${sv * 9}px)`;
      });
    }

    // ── STAGE 3 (66%+): BOOM ─────────────────────────────────────────
    else if (p > S2 && !boomFired) {
      triggerBoom(false);
    }
  }

  // RAF loop
  function loop() {
    if (!boomFired) {
      currentP += (targetP - currentP) * 0.05;  /* slower lerp = animation more visible */
      render(currentP);
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener('scroll', () => {
    if (boomFired) return;
    targetP = clamp(window.scrollY / INTRO_END(), 0, 1);
  }, { passive: true });

  if (history.scrollRestoration) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  render(0);
  loop();
})();
