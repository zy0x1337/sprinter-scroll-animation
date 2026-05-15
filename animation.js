/**
 * Sprinter Scroll Animation
 * ─────────────────
 * Van is visible immediately. Animation starts as soon as the user scrolls.
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

const stage        = document.querySelector('.scroll-stage');
const progressFill = document.getElementById('progressFill');
const scrollHint   = document.getElementById('scrollHint');
const itemEls      = {};

ITEMS.forEach(cfg => {
  const el = document.getElementById(cfg.id);
  el.style.width = cfg.width;
  itemEls[cfg.id] = el;
});

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function lerp(a, b, t) { return a + (b - a) * t; }

let hintHidden = false;

function onScroll() {
  const scrollY     = window.scrollY;
  const vh          = window.innerHeight;
  const stageHeight = stage.offsetHeight;

  // progress: 0 = page top, 1 = end of scroll stage
  const raw      = scrollY / (stageHeight - vh);
  const progress = Math.min(1, Math.max(0, raw));

  // hide scroll hint once user starts scrolling
  if (!hintHidden && scrollY > 20) {
    scrollHint.classList.add('hidden');
    hintHidden = true;
  }

  progressFill.style.width = `${progress * 100}%`;

  ITEMS.forEach(cfg => {
    const el   = itemEls[cfg.id];
    const span = cfg.endProgress - cfg.startProgress;
    const local = (progress - cfg.startProgress) / span;
    const t     = easeInOutCubic(Math.min(1, Math.max(0, local)));

    const vw = window.innerWidth;

    const x   = lerp(cfg.startX * vw,  cfg.endX * vw,  t);
    const y   = lerp(cfg.startY * vh,  cfg.endY * vh,  t);
    const rot = lerp(cfg.startRot, cfg.endRot, t);
    const opacity = t < 0.02 ? 0 : Math.min(1, t * 10);
    const arcY    = y + Math.sin(t * Math.PI) * -40;

    el.style.transform = `translate(${x}px, ${arcY}px) rotate(${rot}deg) scale(${lerp(0.65, 1, t)})`;
    el.style.opacity   = opacity;
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();
