/**
 * Sprinter Scroll Animation — Native Sticky-Scroll Frame Scrubbing
 * 85 frames à 1280×720 (16:9 JPEG)
 * Uses native page scroll (no virtual scroll) so the page can continue below.
 */

const TOTAL_FRAMES = 85;
const FRAME_PATH   = (n) => `assets/ezgif-frame-${String(n).padStart(3, '0')}.jpg`;
const NATIVE_W = 1280;
const NATIVE_H = 720;

const canvas = document.getElementById('vanCanvas');
if (!canvas) throw new Error('No #vanCanvas found');
const ctx  = canvas.getContext('2d');
const hint = document.getElementById('scrollHint');
const fill = document.getElementById('progressFill');

// ── Scene definitions: frame ranges (1-indexed) ────────────────────
const SCENES = [
  { start: 1,  end: 15, id: 'scene-1' },
  { start: 20, end: 38, id: 'scene-2' },
  { start: 42, end: 60, id: 'scene-3' },
  { start: 64, end: 80, id: 'scene-4' },
  { start: 81, end: 85, id: 'scene-5' },
];

// ── Preload ────────────────────────────────────────────────────
const frames = [];
let loaded = 0;

function onAllLoaded() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 650);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('scroll', onScroll,     { passive: true });
  drawFrame(0);
  onScroll(); // sync immediately
}

for (let i = 1; i <= TOTAL_FRAMES; i++) {
  const img = new Image();
  img.src = FRAME_PATH(i);
  img.onload  = () => { loaded++; updateLoadUI(); if (loaded === TOTAL_FRAMES) onAllLoaded(); };
  img.onerror = () => { loaded++; updateLoadUI(); if (loaded === TOTAL_FRAMES) onAllLoaded(); };
  frames.push(img);
}

function updateLoadUI() {
  const pct = loaded / TOTAL_FRAMES;
  const bar = document.getElementById('loadBar');
  const num = document.getElementById('loadPct');
  if (bar) bar.style.width  = `${pct * 100}%`;
  if (num) num.textContent  = `${Math.round(pct * 100)}%`;
  if (fill) fill.style.width = `${pct * 100}%`;
}

// ── Canvas sizing ───────────────────────────────────────────────
function resizeCanvas() {
  const dpr  = window.devicePixelRatio || 1;
  const cssW = canvas.offsetWidth;
  const cssH = canvas.offsetHeight;
  const physW = Math.min(Math.round(cssW * dpr), NATIVE_W);
  const physH = Math.min(Math.round(cssH * dpr), NATIVE_H);
  canvas.width  = physW;
  canvas.height = physH;
  ctx.setTransform(physW / cssW, 0, 0, physH / cssH, 0, 0);
  drawFrame(currentFrameIndex());
}

// ── Draw ─────────────────────────────────────────────────────────
function drawFrame(index) {
  const img = frames[Math.max(0, Math.min(index, frames.length - 1))];
  if (!img?.complete || !img.naturalWidth) return;
  const cw = canvas.offsetWidth;
  const ch = canvas.offsetHeight;
  const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
  const w = img.naturalWidth  * scale;
  const h = img.naturalHeight * scale;
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
}

// ── Get nav height reliably ──────────────────────────────────────
function getNavH() {
  const nav = document.getElementById('siteNav');
  if (nav) return nav.offsetHeight;
  // fallback: parse CSS variable
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--nav-h').trim();
  return parseInt(raw) || 64;
}

// ── Scroll Progress from DOM ──────────────────────────────────
//
// The outer .anim-sticky-outer defines the total scrollable height (500vh).
// The sticky inner sticks from top: navH with height: (100vh - navH).
//
// When scrollY = 0:          outer.getBoundingClientRect().top = navH  (just below nav)
// When animation ends:        outer.top = -(outerH - vh)             (outer bottom at viewport bottom)
//
// trackLen = total scroll distance = outerH - vh
// scrolled  = -(rect.top - navH)   = how far past the start we've gone
//
function getScrollProgress() {
  const outer = document.getElementById('animOuter');
  if (!outer) return 0;
  const rect    = outer.getBoundingClientRect();
  const navH    = getNavH();
  const vh      = window.innerHeight;
  // Total scrollable distance through this section
  const trackLen = outer.offsetHeight - vh;
  // How far we've scrolled into it (rect.top starts at navH when at top of page)
  const scrolled = navH - rect.top;
  return Math.max(0, Math.min(1, scrolled / Math.max(1, trackLen)));
}

function currentFrameIndex() {
  const p = getScrollProgress();
  return Math.min(TOTAL_FRAMES - 1, Math.floor(p * TOTAL_FRAMES));
}

// ── Overlay logic ──────────────────────────────────────────────────
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

// ── Main scroll handler ────────────────────────────────────────────
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const p  = getScrollProgress();
    if (fill) fill.style.width = `${p * 100}%`;
    const fi = currentFrameIndex();
    drawFrame(fi);
    updateOverlays(fi);
    // Hide scroll hint once user starts scrolling
    if (hint && p > 0.01) hint.classList.add('hidden');
  });
}
