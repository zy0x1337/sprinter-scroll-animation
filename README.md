# 🚐 Sprinter Scroll Animation

Scroll-driven animation of a white Sprinter van being loaded with household items (Entrümpelung / Wohnungsauflösung). Items fly smoothly into the open cargo hold as the user scrolls.

## Concept

- **Sticky scroll**: page scrolls but viewport stays fixed
- **Scroll progress** (0–100%) drives the animation timeline
- **Frame scrubbing**: 57 JPEG frames extracted from video → mapped to scroll position via Canvas
- Smooth cover-fit rendering, progress bar, scroll hint

## Project Structure

```
/
├── index.html
├── style.css
├── animation.js
├── vercel.json
└── assets/
    └── ezgif-frame-001.jpg … ezgif-frame-057.jpg
```

## Setup

Open `index.html` in a browser – no build step needed.
