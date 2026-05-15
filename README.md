# 🚐 Sprinter Scroll Animation

Scroll-driven animation of a white Sprinter van being loaded with household items (Entrümpelung / Wohnungsauflösung). Items fly smoothly into the open cargo hold as the user scrolls.

## Concept

- **Sticky scroll**: page scrolls but viewport stays fixed
- **Scroll progress** (0–100%) drives the animation timeline
- **Assets**: AI-generated PNGs (transparent background) via Nano Banana 2
- Items "fly" from off-screen into the open rear door of the van

## Assets needed

| File | Description |
|------|-------------|
| `assets/van-base.png` | White Sprinter van, rear view, rear doors open, transparent BG |
| `assets/van-doors-closed.png` | Same van, rear doors closed |
| `assets/item-sofa.png` | Old sofa / couch |
| `assets/item-lamp.png` | Floor lamp |
| `assets/item-box.png` | Cardboard moving box |
| `assets/item-chair.png` | Old wooden chair |
| `assets/item-shelf.png` | Small bookshelf |
| `assets/item-tv.png` | Old CRT or flat TV |

## Project Structure

```
/
├── index.html
├── style.css
├── animation.js
└── assets/
    ├── van-base.png
    ├── item-sofa.png
    ├── item-lamp.png
    ├── item-box.png
    ├── item-chair.png
    ├── item-shelf.png
    └── item-tv.png
```

## Setup

Open `index.html` in a browser – no build step needed.
