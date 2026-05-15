/**
 * Sprinter Scroll Animation — Frame Scrubbing
 * 57 frames → virtual scroll, fully hijacked
 */

const TOTAL_FRAMES = 57;
const SCROLL_MAX   = 3000;
const FRAME_PATH   = (n) => `assets/ezgif-frame-${String(n).padStart(3, '0')}.jpg`;

const canvas = document.getElementById('vanCanvas');
const ctx    = canvas.getContext('2d');
const hint   = document.getElementById('scrollHint');
const fill   = document.getElementById('progressFill');

// ── Preload ──────────────────────────────────────────────
const frames = [];
let loaded = 0;

function onAllLoaded() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('wheel',      onWheel,      { passive: false, capture: true });
  document.addEventListener('touchstart', onTouchStart, { passive: true,  capture: true });
  document.addEventListener('touchmove',  onTouchMove,  { passive: false, capture: true });
  document.addEventListener('keydown',    onKeyDown,    { capture: true });
}

for (let i = 1; i <= TOTAL_FRAMES; i++) {
  const img = new Image();
  img.src = FRAME_PATH(i);
  img.onload = () => { loaded++; fill.style.width = `${(loaded/TOTAL_FRAMES)*100}%`; if (loaded === TOTAL_FRAMES) onAllLoaded(); };
  img.onerror = () => { loaded++; fill.style.width = `${(loaded/TOTAL_FRAMES)*100}%`; if (loaded === TOTAL_FRAMES) onAllLoaded(); };
  frames.push(img);
}

// ── Canvas sizing ───────────────────────────────────────
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = canvas.offsetWidth  * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawFrame(currentFrameIndex());
}

// ── Draw ────────────────────────────────────────────────
function drawFrame(index) {
  const img = frames[index];
  if (!img?.complete || !img.naturalWidth) return;
  const cw = canvas.offsetWidth;
  const ch = canvas.offsetHeight;

  // Cover: Frame füllt den Canvas vollständig, kein Letterbox
  const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const w = img.naturalWidth  * scale;
  const h = img.naturalHeight * scale;
  const x = (cw - w) / 2;
  const y = (ch - h) / 2;

  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, x, y, w, h);
}

// ── Virtual Scroll State ─────────────────────────────────
let vScroll    = 0;
let hintHidden = false;
let ticking    = false;
let touchStartY = 0;

function getProgress() {
  return Math.min(1, Math.max(0, vScroll / SCROLL_MAX));
}

function currentFrameIndex() {
  return Math.min(TOTAL_FRAMES - 1, Math.floor(getProgress() * TOTAL_FRAMES));
}

function update() {
  ticking = false;
  const p = getProgress();
  fill.style.width = `${p * 100}%`;
  drawFrame(currentFrameIndex());
  if (!hintHidden && vScroll > 20) {
    hint.classList.add('hidden');
    hintHidden = true;
  }
}

function nudge(delta) {
  vScroll = Math.min(SCROLL_MAX, Math.max(0, vScroll + delta));
  if (!ticking) { requestAnimationFrame(update); ticking = true; }
}

// ── Event Handlers ───────────────────────────────────────
function onWheel(e) {
  e.preventDefault();
  e.stopPropagation();
  nudge(e.deltaY * 1.2);
}

function onTouchStart(e) {
  touchStartY = e.touches[0].clientY;
}

function onTouchMove(e) {
  e.preventDefault();
  e.stopPropagation();
  const dy = touchStartY - e.touches[0].clientY;
  touchStartY = e.touches[0].clientY;
  nudge(dy * 2.5);
}

function onKeyDown(e) {
  if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); nudge(80); }
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); nudge(-80); }
}
