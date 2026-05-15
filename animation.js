/**
 * Sprinter Scroll Animation — Frame Scrubbing
 * 57 frames → scroll-driven, hijacked during animation
 */

const TOTAL_FRAMES = 57;
const FRAME_PATH   = (n) => `assets/ezgif-frame-${String(n).padStart(3, '0')}.jpg`;

const canvas  = document.getElementById('vanCanvas');
const ctx     = canvas.getContext('2d');
const stage   = document.querySelector('.scroll-stage');
const hint    = document.getElementById('scrollHint');
const fill    = document.getElementById('progressFill');

// ── Preload ──────────────────────────────────────────────
const frames = [];
let  loaded  = 0;

function onAllLoaded() {
  resizeCanvas();
  initScrollHijack();
  window.addEventListener('resize', resizeCanvas);
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

  // Contain: vollständiger Frame sichtbar, zentriert
  const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
  const w = img.naturalWidth  * scale;
  const h = img.naturalHeight * scale;
  const x = (cw - w) / 2;
  const y = (ch - h) / 2;

  // Weiche Kanten: radial gradient mask via compositing
  ctx.save();

  // Clip mit abgerundeten Rändern + soft vignette
  const pad = 32; // soft inset
  ctx.beginPath();
  ctx.roundRect(x + pad, y + pad, w - pad*2, h - pad*2, 0);
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();

  // Vignette über dem Frame
  const vx = x + pad, vy = y + pad, vw = w - pad*2, vh2 = h - pad*2;
  const gTop    = ctx.createLinearGradient(0, vy, 0, vy + vh2 * 0.18);
  gTop.addColorStop(0,   '#f5f3ee');
  gTop.addColorStop(1,   'rgba(245,243,238,0)');
  const gBottom = ctx.createLinearGradient(0, vy + vh2, 0, vy + vh2 * 0.82);
  gBottom.addColorStop(0,   '#f5f3ee');
  gBottom.addColorStop(1,   'rgba(245,243,238,0)');
  const gLeft   = ctx.createLinearGradient(vx, 0, vx + vw * 0.12, 0);
  gLeft.addColorStop(0,   '#f5f3ee');
  gLeft.addColorStop(1,   'rgba(245,243,238,0)');
  const gRight  = ctx.createLinearGradient(vx + vw, 0, vx + vw * 0.88, 0);
  gRight.addColorStop(0,   '#f5f3ee');
  gRight.addColorStop(1,   'rgba(245,243,238,0)');

  ctx.fillStyle = gTop;    ctx.fillRect(vx, vy, vw, vh2 * 0.18);
  ctx.fillStyle = gBottom; ctx.fillRect(vx, vy + vh2 * 0.82, vw, vh2 * 0.18);
  ctx.fillStyle = gLeft;   ctx.fillRect(vx, vy, vw * 0.12, vh2);
  ctx.fillStyle = gRight;  ctx.fillRect(vx + vw * 0.88, vy, vw * 0.12, vh2);
}

// ── Scroll Hijack ─────────────────────────────────────────
// Konvertiert Wheel/Touch in kontrollierten "virtuellen" Scroll
// der nur innerhalb der Stage wirkt — kein echter Page-Scroll
let virtualScroll = 0;
let hintHidden    = false;
let ticking       = false;
let touchStartY   = 0;

function getProgress() {
  const stageH = stage.offsetHeight;
  const vh     = window.innerHeight;
  return Math.min(1, Math.max(0, virtualScroll / (stageH - vh)));
}

function currentFrameIndex() {
  return Math.min(TOTAL_FRAMES - 1, Math.floor(getProgress() * TOTAL_FRAMES));
}

function isInStage() {
  const rect = stage.getBoundingClientRect();
  return rect.top <= 0 && rect.bottom > window.innerHeight;
}

function update() {
  ticking = false;
  const progress = getProgress();
  fill.style.width = `${progress * 100}%`;
  drawFrame(currentFrameIndex());

  if (!hintHidden && virtualScroll > 20) {
    hint.classList.add('hidden');
    hintHidden = true;
  }
}

function nudge(delta) {
  const maxScroll = stage.offsetHeight - window.innerHeight;
  virtualScroll = Math.min(maxScroll, Math.max(0, virtualScroll + delta));
  if (!ticking) { requestAnimationFrame(update); ticking = true; }
}

function initScrollHijack() {
  // Wheel: hijack nur wenn Stage aktiv
  window.addEventListener('wheel', (e) => {
    if (!isInStage()) return;
    e.preventDefault();
    nudge(e.deltaY * 1.2);
  }, { passive: false });

  // Touch
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isInStage()) return;
    e.preventDefault();
    const dy = touchStartY - e.touches[0].clientY;
    touchStartY = e.touches[0].clientY;
    nudge(dy * 2.5);
  }, { passive: false });

  // Keyboard arrows
  window.addEventListener('keydown', (e) => {
    if (!isInStage()) return;
    if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); nudge(80); }
    if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); nudge(-80); }
  });

  // Body: kein echter Scroll mehr
  document.body.style.overflow = 'hidden';

  // Stage-Höhe als echter DOM-Spacer damit die Seite "scrollbar" wirkt
  // aber wir steuern virtualScroll manuell
  update();
}
