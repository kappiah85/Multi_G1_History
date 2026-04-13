# Multi G1 — World History Explorer

Interactive **3D globe** (Three.js), separate pages for **quiz**, **continent timeline** (raster algorithms), and **Canvas 2D** demos. Dark/light theme is stored in the browser.

## How to run locally

This project uses **ES modules** and loads **Three.js from a CDN**. Opening `index.html` directly as a `file://` URL often breaks module loading. Use a **local HTTP server** from the project folder.

### Option 1: Python (if installed)

```bash
cd path/to/this/folder
python -m http.server 8080
```

Then open **http://localhost:8080/** in your browser. Start at `index.html` or open **http://localhost:8080/index.html**.

### Option 2: Node.js (`npx`)

```bash
cd path/to/this/folder
npx --yes serve -l 8080
```

Open the URL shown in the terminal (usually **http://localhost:8080**).

### Option 3: VS Code / Cursor

Use the **Live Server** extension (or similar), with the project root as the folder to serve.

## Pages

| File | Content |
|------|--------|
| `index.html` | Globe + continent detail panel |
| `quiz.html` | World history quiz |
| `timeline.html` | Animated continent timeline (DDA / Bresenham, etc.) |
| `algorithms.html` | 2D line / circle / Bézier / clipping demo |

## Requirements

- A modern browser with **JavaScript enabled**
- **Network access** the first time (textures and Three.js load from CDNs)

No `npm install` is required for the default setup.
