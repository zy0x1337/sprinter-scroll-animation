/**
 * Sprinter Scroll Animation — Frame Scrubbing
 * 57 frames from ezgif export → mapped to scroll progress
 */

const TOTAL_FRAMES = 57;
const FRAME_PATH   = (n) => `assets/ezgif-frame-${String(n).padStart(3, '0')}.jpg`;

const canvas  = document.getElementById('vanCanvas');
const ctx     = canvas.getContext('2d');
const stage   = document.querySelector('.scroll-stage');
const hint    = document.getElementById('scrollHint');
const fill    = document.getElementById('progressFill');

// ── Preload all frames ───────────────────────────────────
const frames = [];
let  loaded  = 0;

function onAllLoaded() {
  drawFrame(0);
  window.addEventListener('scroll', onScroll, { passive: true });
}

for (let i = 1; i <= TOTAL_FRAMES; i++) {
  const img = new Image();
  img.src = FRAME_PATH(i);
  img.onload = () => {
    loaded++;
    fill.style.width = `${(loaded / TOTAL_FRAMES) * 100}%`;
    if (loaded === TOTAL_FRAMES) onAllLoaded();
  };
  img.onerror = () => {
    loaded++;
    fill.style.width = `${(loaded / TOTAL_FRAMES) * 100}%`;
    if (loaded === TOTAL_FRAMES) onAllLoaded();
  };
  frames.push(img);
}

// ── Canvas sizing ────────────────────────────────────────
function resizeCanvas() {
  canvas.width  = canvas.offsetWidth  * window.devicePixelRatio;
  canvas.height = canvas.offsetHeight * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  const idx = currentFrameIndex();
  if (frames[idx]?.complete) drawFrame(idx);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ── Draw ─────────────────────────────────────────────────
function drawFrame(index) {
  const img = frames[index];
  if (!img?.complete || !img.naturalWidth) return;
  const cw = canvas.offsetWidth;
  const ch = canvas.offsetHeight;
  // Cover — maintain aspect ratio, center
  const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const w = img.naturalWidth  * scale;
  const h = img.naturalHeight * scale;
  const x = (cw - w) / 2;
  const y = (ch - h) / 2;
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, x, y, w, h);
}

// ── Scroll ───────────────────────────────────────────────
let hintHidden = false;

function currentFrameIndex() {
  const scrollY  = window.scrollY;
  const stageH   = stage.offsetHeight;
  const vh       = window.innerHeight;
  const progress = Math.min(1, Math.max(0, scrollY / (stageH - vh)));
  return Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));
}

function onScroll() {
  if (!hintHidden && window.scrollY > 20) {
    hint.classList.add('hidden');
    hintHidden = true;
  }

  const scrollY  = window.scrollY;
  const stageH   = stage.offsetHeight;
  const vh       = window.innerHeight;
  const progress = Math.min(1, Math.max(0, scrollY / (stageH - vh)));

  fill.style.width = `${progress * 100}%`;
  drawFrame(currentFrameIndex());
}
