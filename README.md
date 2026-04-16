# Multi G1 — World History Explorer

Interactive **3D globe** (Three.js), separate pages for **quiz**, **continent timeline** (raster algorithms), and a **satellite-style 2D map**. Dark/light theme is stored in the browser.

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
| `map.html` | Satellite-style world map with selectable borders |

## Requirements

- A modern browser with **JavaScript enabled**
- **Network access** the first time (textures and Three.js load from CDNs)

No `npm install` is required for the default setup.

## Publish to GitHub (maintainers)

If the remote repository does not exist yet, create an **empty** repo named `Multi_G1_History` under the GitHub account (no README/license/gitignore added by GitHub, or you will need to pull and merge first). Then from this project folder:

```bash
git remote add origin https://github.com/Totn11/Multi_G1_History.git
git branch -M main
git push -u origin main
```

Use **GitHub login** or a **personal access token** when Git asks for credentials. After the first successful push, the site is available on GitHub; for a public demo, enable **GitHub Pages** (Settings → Pages) and set the source to the `main` branch and `/ (root)`.
