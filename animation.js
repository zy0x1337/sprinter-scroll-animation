/**
 * Sprinter Scroll Animation
 * ─────────────────────────
 * Each item has:
 *   startProgress : scroll% at which the item starts flying in  (0–1)
 *   endProgress   : scroll% at which it has fully landed in van  (0–1)
 *   startX/Y      : off-screen start position (vw/vh units as fractions)
 *   endX/Y        : resting position inside the van opening
 *   startRot      : rotation at launch (deg)
 *   width         : CSS width of the element
 */

const ITEMS = [
  {
    id: 'item-box',
    startProgress: 0.05, endProgress: 0.20,
    startX:  1.3,  startY:  0.1,
    endX:    0.38, endY:    0.42,
    startRot: -20, endRot: -5,
    width: '100px',
  },
  {
    id: 'item-sofa',
    startProgress: 0.18, endProgress: 0.38,
    startX:  1.4,  startY: -0.1,
    endX:    0.44, endY:    0.38,
    startRot: 12, endRot: 2,
    width: '180px',
  },
  {
    id: 'item-lamp',
    startProgress: 0.34, endProgress: 0.50,
    startX:  1.3,  startY:  0.2,
    endX:    0.47, endY:    0.32,
    startRot: 25, endRot: -8,
    width: '70px',
  },
  {
    id: 'item-chair',
    startProgress: 0.46, endProgress: 0.62,
    startX:  1.35, startY: -0.05,
    endX:    0.41, endY:    0.40,
    startRot: -18, endRot: 4,
    width: '110px',
  },
  {
    id: 'item-shelf',
    startProgress: 0.58, endProgress: 0.74,
    startX:  1.4,  startY:  0.15,
    endX:    0.50, endY:    0.35,
    startRot: 10, endRot: -3,
    width: '130px',
  },
  {
    id: 'item-tv',
    startProgress: 0.70, endProgress: 0.88,
    startX:  1.3,  startY:  0.0,
    endX:    0.43, endY:    0.44,
    startRot: -15, endRot: 1,
    width: '120px',
  },
];

// Cache DOM refs
const stage        = document.querySelector('.scroll-stage');
const progressFill = document.getElementById('progressFill');
const itemEls      = {};

ITEMS.forEach(cfg => {
  const el = document.getElementById(cfg.id);
  el.style.width = cfg.width;
  itemEls[cfg.id] = el;
});

// ── Easing ──────────────────────────────────────────────
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a, b, t) { return a + (b - a) * t; }

// ── Scroll handler ───────────────────────────────────────
function onScroll() {
  const stageTop    = stage.offsetTop;
  const stageHeight = stage.offsetHeight;
  const scrollY     = window.scrollY;
  const vh          = window.innerHeight;

  // progress 0 = top of sticky zone, 1 = bottom
  const raw = (scrollY - stageTop) / (stageHeight - vh);
  const progress = Math.min(1, Math.max(0, raw));

  // progress bar
  progressFill.style.width = `${progress * 100}%`;

  // animate each item
  ITEMS.forEach(cfg => {
    const el = itemEls[cfg.id];
    const span = cfg.endProgress - cfg.startProgress;
    const local = (progress - cfg.startProgress) / span;
    const t = easeInOutCubic(Math.min(1, Math.max(0, local)));

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const x   = lerp(cfg.startX * vw,  cfg.endX * vw,  t);
    const y   = lerp(cfg.startY * vh,  cfg.endY * vh,  t);
    const rot = lerp(cfg.startRot, cfg.endRot, t);
    const opacity = t < 0.02 ? 0 : Math.min(1, t * 10);

    // slight arc: items come in from the right and dip into the van
    const arcY = y + Math.sin(t * Math.PI) * -40;

    el.style.transform = `translate(${x}px, ${arcY}px) rotate(${rot}deg) scale(${lerp(0.65, 1, t)})`;
    el.style.opacity   = opacity;
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll(); // initial call
