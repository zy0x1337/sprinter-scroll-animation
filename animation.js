/**
 * Sprinter Scroll Animation — Frame Scrubbing
 * 85 frames à 1280×720 (16:9 JPEG)
 * Canvas is capped at native resolution to avoid upscale blur.
 */

const TOTAL_FRAMES = 85;
const SCROLL_MAX   = 5000;
const FRAME_PATH   = (n) => `assets/ezgif-frame-${String(n).padStart(3, '0')}.jpg`;

const canvas = document.getElementById('vanCanvas');
const ctx    = canvas.getContext('2d');
const hint   = document.getElementById('scrollHint');
const fill   = document.getElementById('progressFill');

const NATIVE_W = 1280;
const NATIVE_H = 720;

// ── Scene definitions: frame ranges (1-indexed) ──────────────
const SCENES = [
  { start: 1,  end: 15,  id: 'scene-1' },
  { start: 20, end: 38,  id: 'scene-2' },
  { start: 42, end: 60,  id: 'scene-3' },
  { start: 64, end: 80,  id: 'scene-4' },
  { start: 81, end: 85,  id: 'scene-5' },
];

// ── Preload ───────────────────────────────────────────────
const frames = [];
let loaded = 0;

function onAllLoaded() {
  const loadingEl = document.getElementById('loadingOverlay');
  if (loadingEl) {
    loadingEl.style.opacity = '0';
    setTimeout(() => loadingEl.remove(), 600);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('wheel',      onWheel,      { passive: false, capture: true });
  document.addEventListener('touchstart', onTouchStart, { passive: true,  capture: true });
  document.addEventListener('touchmove',  onTouchMove,  { passive: false, capture: true });
  document.addEventListener('keydown',    onKeyDown,    { capture: true });
  drawFrame(0);
}

for (let i = 1; i <= TOTAL_FRAMES; i++) {
  const img = new Image();
  img.src = FRAME_PATH(i);
  img.onload = () => {
    loaded++;
    const pct = loaded / TOTAL_FRAMES;
    fill.style.width = `${pct * 100}%`;
    const loadBar = document.getElementById('loadBar');
    if (loadBar) loadBar.style.width = `${pct * 100}%`;
    const loadPct = document.getElementById('loadPct');
    if (loadPct) loadPct.textContent = `${Math.round(pct * 100)}%`;
    if (loaded === TOTAL_FRAMES) onAllLoaded();
  };
  img.onerror = () => { loaded++; if (loaded === TOTAL_FRAMES) onAllLoaded(); };
  frames.push(img);
}

// ── Canvas sizing ────────────────────────────────────────
/*
 * We draw at the DISPLAY size of the canvas element (CSS pixels),
 * but multiply by devicePixelRatio only up to the native frame size.
 * This avoids retina upscaling beyond 1280×720.
 */
function resizeCanvas() {
  const dpr      = window.devicePixelRatio || 1;
  const cssW     = canvas.offsetWidth;
  const cssH     = canvas.offsetHeight;

  // Physical pixels requested, capped at native frame resolution
  const physW    = Math.min(Math.round(cssW * dpr), NATIVE_W);
  const physH    = Math.min(Math.round(cssH * dpr), NATIVE_H);

  canvas.width   = physW;
  canvas.height  = physH;

  // Transform: map CSS pixels to physical pixels (capped scale)
  const scaleX = physW / cssW;
  const scaleY = physH / cssH;
  ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);

  drawFrame(currentFrameIndex());
}

// ── Draw ────────────────────────────────────────────────
function drawFrame(index) {
  const img = frames[index];
  if (!img?.complete || !img.naturalWidth) return;
  const cw = canvas.offsetWidth;
  const ch = canvas.offsetHeight;

  // Object-fit: contain — show full frame, no cropping
  // The canvas aspect already matches 16:9 so this is effectively fill
  const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
  const w = img.naturalWidth  * scale;
  const h = img.naturalHeight * scale;
  const x = (cw - w) / 2;
  const y = (ch - h) / 2;

  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, x, y, w, h);
}

// ── Virtual Scroll State ────────────────────────────────
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

// ── Overlay logic ───────────────────────────────────────
function updateOverlays(frameIndex) {
  const frame1 = frameIndex + 1;
  let activeScene = null;
  for (const s of SCENES) {
    if (frame1 >= s.start && frame1 <= s.end) { activeScene = s; break; }
  }
  SCENES.forEach(s => {
    const el = document.getElementById(s.id);
    if (!el) return;
    el.classList.toggle('visible', !!(activeScene && activeScene.id === s.id));
  });
  const cta = document.getElementById('cta-block');
  if (cta) cta.classList.toggle('visible', !!(activeScene && activeScene.id === 'scene-5'));
}

function update() {
  ticking = false;
  const p  = getProgress();
  fill.style.width = `${p * 100}%`;
  const fi = currentFrameIndex();
  drawFrame(fi);
  updateOverlays(fi);
  if (!hintHidden && vScroll > 20) {
    hint.classList.add('hidden');
    hintHidden = true;
  }
}

function nudge(delta) {
  vScroll = Math.min(SCROLL_MAX, Math.max(0, vScroll + delta));
  if (!ticking) { requestAnimationFrame(update); ticking = true; }
}

// ── Event Handlers ──────────────────────────────────────
function onWheel(e) {
  e.preventDefault();
  e.stopPropagation();
  nudge(e.deltaY * 1.2);
}
function onTouchStart(e) { touchStartY = e.touches[0].clientY; }
function onTouchMove(e) {
  e.preventDefault();
  e.stopPropagation();
  const dy = touchStartY - e.touches[0].clientY;
  touchStartY = e.touches[0].clientY;
  nudge(dy * 2.5);
}
function onKeyDown(e) {
  if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); nudge(100); }
  if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); nudge(-100); }
}
