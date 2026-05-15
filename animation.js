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
const outro  = document.getElementById('outro');

// ── Preload ──────────────────────────────────────────────
const frames = [];
let loaded = 0;

function onAllLoaded() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Alle Scroll-Events auf document abfangen, passive:false = preventDefault möglich
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

  ctx.clearRect(0, 0, cw, ch);

  const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
  const w = img.naturalWidth  * scale;
  const h = img.naturalHeight * scale;
  const x = (cw - w) / 2;
  const y = (ch - h) / 2;

  const pad = 32;
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x + pad, y + pad, w - pad*2, h - pad*2, 0);
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();

  const vx = x + pad, vy = y + pad, vw = w - pad*2, vh = h - pad*2;
  const bg0 = '#f5f3ee', bg1 = 'rgba(245,243,238,0)';
  const gT = ctx.createLinearGradient(0, vy,       0, vy + vh*0.2);    gT.addColorStop(0, bg0); gT.addColorStop(1, bg1);
  const gB = ctx.createLinearGradient(0, vy + vh,  0, vy + vh*0.8);    gB.addColorStop(0, bg0); gB.addColorStop(1, bg1);
  const gL = ctx.createLinearGradient(vx,      0,  vx + vw*0.15, 0);   gL.addColorStop(0, bg0); gL.addColorStop(1, bg1);
  const gR = ctx.createLinearGradient(vx + vw, 0,  vx + vw*0.85, 0);   gR.addColorStop(0, bg0); gR.addColorStop(1, bg1);
  ctx.fillStyle = gT; ctx.fillRect(vx, vy,           vw, vh*0.2);
  ctx.fillStyle = gB; ctx.fillRect(vx, vy + vh*0.8,  vw, vh*0.2);
  ctx.fillStyle = gL; ctx.fillRect(vx, vy,            vw*0.15, vh);
  ctx.fillStyle = gR; ctx.fillRect(vx + vw*0.85, vy,  vw*0.15, vh);
}

// ── Virtual Scroll State ─────────────────────────────────
let vScroll     = 0;
let hintHidden  = false;
let outroShown  = false;
let ticking     = false;
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

  if (p >= 1 && !outroShown) {
    outroShown = true;
    outro.style.display = 'flex';
    requestAnimationFrame(() => outro.classList.add('visible'));
  } else if (p < 0.98 && outroShown) {
    outroShown = false;
    outro.classList.remove('visible');
    setTimeout(() => { if (!outroShown) outro.style.display = 'none'; }, 600);
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
