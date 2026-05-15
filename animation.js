/**
 * Sprinter Scroll Animation — v2
 * ─────────────────────────────────────────────────────────
 * Fixes:
 *  1. mix-blend-mode:multiply auf Items + Van → weißer Hintergrund weg
 *  2. Dual-Layer Van: van-open → van-closed Crossfade bei progress > 0.90
 *  3. Items faden am Ziel aus ("fliegen in die Tür")
 *  4. Endkoordinaten auf Türöffnung kalibriert
 */

const ITEMS = [
  {
    id: 'item-box',
    startProgress: 0.05, endProgress: 0.20,
    startX:  1.30,  startY:  0.08,
    endX:    0.535, endY:    0.485,
    startRot: -20,  endRot: -3,
    width: '100px',
  },
  {
    id: 'item-sofa',
    startProgress: 0.18, endProgress: 0.36,
    startX:  1.40,  startY: -0.10,
    endX:    0.520, endY:    0.470,
    startRot: 12,   endRot: 2,
    width: '170px',
  },
  {
    id: 'item-lamp',
    startProgress: 0.33, endProgress: 0.50,
    startX:  1.30,  startY:  0.20,
    endX:    0.545, endY:    0.440,
    startRot: 25,   endRot: -8,
    width: '68px',
  },
  {
    id: 'item-chair',
    startProgress: 0.46, endProgress: 0.62,
    startX:  1.35,  startY: -0.05,
    endX:    0.528, endY:    0.475,
    startRot: -18,  endRot: 4,
    width: '108px',
  },
  {
    id: 'item-shelf',
    startProgress: 0.58, endProgress: 0.74,
    startX:  1.40,  startY:  0.12,
    endX:    0.538, endY:    0.455,
    startRot: 10,   endRot: -3,
    width: '128px',
  },
  {
    id: 'item-tv',
    startProgress: 0.70, endProgress: 0.87,
    startX:  1.30,  startY:  0.00,
    endX:    0.530, endY:    0.480,
    startRot: -15,  endRot: 1,
    width: '118px',
  },
];

// Tür schließt sich nach letztem Item (progress > 0.90)
const DOOR_CLOSE_PROGRESS = 0.90;

const stage        = document.querySelector('.scroll-stage');
const progressFill = document.getElementById('progressFill');
const scrollHint   = document.getElementById('scrollHint');
const vanOpen      = document.getElementById('vanOpen');
const vanClosed    = document.getElementById('vanClosed');
const itemEls      = {};

let hintHidden = false;

ITEMS.forEach(cfg => {
  const el = document.getElementById(cfg.id);
  el.style.width = cfg.width;
  itemEls[cfg.id] = el;
});

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function lerp(a, b, t) { return a + (b - a) * t; }

function onScroll() {
  const scrollY     = window.scrollY;
  const vh          = window.innerHeight;
  const stageHeight = stage.offsetHeight;

  const raw      = scrollY / (stageHeight - vh);
  const progress = Math.min(1, Math.max(0, raw));

  if (!hintHidden && scrollY > 20) {
    scrollHint.classList.add('hidden');
    hintHidden = true;
  }

  progressFill.style.width = `${progress * 100}%`;

  // ── Tür-Crossfade ─────────────────────────────────────────
  if (progress >= DOOR_CLOSE_PROGRESS) {
    const doorT = (progress - DOOR_CLOSE_PROGRESS) / (1.0 - DOOR_CLOSE_PROGRESS);
    const dT    = Math.min(1, Math.max(0, doorT));
    vanOpen.style.opacity   = 1 - dT;
    vanClosed.style.opacity = dT;
  } else {
    vanOpen.style.opacity   = 1;
    vanClosed.style.opacity = 0;
  }

  // ── Items animieren ────────────────────────────────────────
  ITEMS.forEach(cfg => {
    const el    = itemEls[cfg.id];
    const span  = cfg.endProgress - cfg.startProgress;
    const local = (progress - cfg.startProgress) / span;
    const t     = easeInOutCubic(Math.min(1, Math.max(0, local)));

    const vw = window.innerWidth;

    const x     = lerp(cfg.startX * vw,  cfg.endX * vw,  t);
    const y     = lerp(cfg.startY * vh,  cfg.endY * vh,  t);
    const rot   = lerp(cfg.startRot, cfg.endRot, t);
    // Bogenflugkurve via Sinus
    const arcY  = y + Math.sin(t * Math.PI) * -55;
    const scale = lerp(0.62, 1.0, t);

    // Schnell einblenden, am Ziel ausblenden ("in die Tür verschwinden")
    let opacity;
    if (t < 0.04)       opacity = t * 25;
    else if (t > 0.88)  opacity = 1 - (t - 0.88) / 0.12;
    else                opacity = 1;

    el.style.transform = `translate(${x}px, ${arcY}px) rotate(${rot}deg) scale(${scale})`;
    el.style.opacity   = Math.max(0, Math.min(1, opacity));
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();
