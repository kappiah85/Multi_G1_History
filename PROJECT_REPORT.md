# Multi G1 — World History Explorer: Technical Report

## 1. Project Overview

**Multi G1 — World History Explorer** is a multi-page, interactive educational web application designed to teach world history through engaging visual interfaces. It combines a 3D rotating globe, an animated timeline, a 2D world map, and a quiz system — all built without a backend, build tools, or npm dependencies.

The project's defining characteristic is its **explicit implementation of computer graphics algorithms from scratch** (DDA, Bresenham line drawing, midpoint circle, quadratic Bézier curves, Cohen–Sutherland clipping, and point-in-polygon ray casting), making it both a functional educational tool and a demonstration of core CG principles.

---

## 2. Application Pages

| Page | File | Purpose |
|------|------|---------|
| Globe | `index.html` | 3D rotating Earth; click a continent to view its history, stats, images, video, and timeline |
| Quiz | `quiz.html` | Multi-choice world history quiz; continent-filtered or global; audio feedback |
| Timeline | `timeline.html` | Animated vertical timeline drawn with raster algorithms, per continent |
| World Map | `map.html` | Canvas-based satellite or political map; GeoJSON country borders; clickable countries |

---

## 3. File Structure and Module Roles

### HTML Pages
- **index.html** — Globe scene container, Three.js import map, continent detail panel (overview, stats, media, timeline canvas)
- **quiz.html** — Quiz layout, question display area, score tracker
- **timeline.html** — Algorithm selector (DDA / Bresenham), timeline canvas, continent filter
- **map.html** — Map canvas, satellite/political toggle, country info panel

### JavaScript Modules

| File | Role |
|------|------|
| `js/app.js` | Three.js scene: globe geometry, lighting, OrbitControls, raycasting for continent click detection |
| `js/data.js` | All content: continent overviews, highlights, stats, images, videos, quiz questions, timeline nodes, lat/lon helper functions |
| `js/algorithms.js` | Core raster primitives: DDA line, Bresenham line, midpoint circle, quadratic Bézier, Cohen–Sutherland clipping, window-to-viewport transform |
| `js/continentTimeline.js` | Animated timeline engine: orchestrates async step-by-step drawing of spine, event circles, and Bézier chord links |
| `js/map.js` | 2D world map: GeoJSON fetch and parse, border rasterization, point-in-polygon picking, satellite image compositing |
| `js/quiz.js` | Quiz UI: one-question-at-a-time flow, shuffle, reveal, auto-advance, score tracking |
| `js/multimedia.js` | Audio: WAV synthesis for quiz tones; Web Speech API narration for continents |
| `js/theme.js` | Dark/light theme toggle: CSS variable swapping, localStorage persistence, canvas/Three.js repaint callbacks |
| `js/ui-controls.js` | Wires globe panel, quiz sounds, map controls, country speech synthesis |
| `js/mobile-nav.js` | Mobile hamburger menu slide-in sheet |
| `js/mapCountryFacts.js` | Static facts and narration text for ~250 countries |
| `js/page-quiz.js` | Quiz page init / module glue |
| `js/page-map.js` | Map page init / module glue |
| `js/page-timeline.js` | Timeline page init / module glue |

### CSS
- **css/styles.css** (~1600 lines) — Full design system using CSS custom properties (variables); dark and light palettes; responsive breakpoints (mobile ≤768px, tablet 768–1024px, desktop >1024px); animation and transition definitions.

---

## 4. Technologies and Libraries

### 3D Rendering
- **Three.js v0.160.0** (loaded from CDN via ES import map)
  - `SphereGeometry` for the Earth mesh
  - `MeshPhongMaterial` with diffuse texture and normal map
  - `PerspectiveCamera` + `WebGLRenderer` (with pixel ratio awareness)
  - `OrbitControls` for mouse/touch drag, zoom, and auto-rotation
  - `Raycaster` for continent click detection via UV coordinate mapping

### 2D Graphics
- **Canvas 2D API** — base drawing surface
- **Custom raster algorithms** — all line/curve drawing is done pixel-by-pixel via `ImageData.data[]` manipulation; no `ctx.stroke()` or `ctx.fill()` used for algorithm output
- **ImageData** — direct pixel buffer writes for high-performance country border rasterization and satellite compositing

### Data Formats
- **JSON** — continent metadata (overviews, stats, quiz questions, timeline nodes) defined in `data.js`
- **GeoJSON** — Natural Earth 110m world boundaries (Polygon and MultiPolygon), fetched from CDN with multiple fallback URLs for resilience

### Web APIs
| API | Usage |
|-----|-------|
| Web Speech Synthesis | Continent narration; country name pronunciation |
| Web Audio API | Implied by HTMLAudioElement; WAV blobs generated in code |
| LocalStorage | Persists theme choice, quiz sound preference, map base layer toggle |
| Fetch API | GeoJSON load; optional narration MP3 fetch |
| ResizeObserver | Globe canvas responsive scaling |
| Pointer Events | Unified mouse/touch/pen input; tap-vs-drag discrimination |

### Deployment
- Static files only — no build step, no npm install, no server-side code
- Runs locally with any simple HTTP server (`python -m http.server`, VS Code Live Server, etc.)
- Deployable directly to GitHub Pages or any static host (Render blueprint included)

---

## 5. Key Design Decisions and Rationale

### 5.1 Canvas + Custom Raster Algorithms Instead of SVG or `ctx.stroke()`

**Decision:** All lines, curves, and circles in the timeline and map are drawn pixel-by-pixel using DDA, Bresenham, and midpoint circle algorithms implemented in `algorithms.js`.

**Why:**
- The project's academic goal is to *demonstrate* classical CG algorithms, not just produce a visual result.
- Animating the drawing step-by-step (yielding every few pixels with `await sleep()`) lets users watch the algorithm operate — impossible with `ctx.stroke()` which renders instantly.
- Direct `ImageData` pixel writes are efficient for dense geometry (250+ country borders) and enable runtime theming: colors are read from CSS variables at draw time, so dark/light mode switches update instantly.

### 5.2 Three.js 3D Globe as the Primary Entry Point

**Decision:** The home page is a 3D rotating Earth, not a flat map.

**Why:**
- A rotating globe is visually engaging and more natural for a world history context.
- Three.js raycasting maps click coordinates → UV → lat/lon, enabling continent detection without manual polygon math.
- OrbitControls handles touch, mouse, zoom, and momentum uniformly across devices.
- Mobile users benefit from Three.js's built-in DPI scaling and adaptive resolution.

### 5.3 Separate HTML Pages Instead of a Single-Page Application

**Decision:** Each feature (globe, quiz, timeline, map) is its own HTML page with its own module set.

**Why:**
- Each page loads only the JavaScript it needs (quiz page does not load Three.js; globe page does not load GeoJSON).
- No SPA router complexity; browser back/forward navigation works naturally.
- Cleaner separation of concerns; easier to develop and debug features in isolation.

### 5.4 Window-to-Viewport Transform + Cohen–Sutherland Clipping

**Decision:** All canvas drawing passes through a window-to-viewport coordinate transform and Cohen–Sutherland line clipping (implemented in `algorithms.js`).

**Why:**
- Logical coordinates (normalized [0,1] spine positions, lat/lon map coordinates) need to map to screen pixels correctly at any canvas size.
- Lines can extend beyond drawing area edges (especially Bézier control points); clipping prevents overwriting UI chrome.
- This mirrors the standard CG pipeline: model space → world space → clip → viewport — making the code a direct demonstration of the graphics pipeline.

### 5.5 Async Progressive Drawing with Cancellation Tokens

**Decision:** Timeline animations yield after each batch of pixels using `await sleep(n)`, with a `isCancelled()` guard for early exit.

**Why:**
- Step-by-step rendering lets users see the algorithm progressing — the educational core of the timeline page.
- `sleep()` yields to the browser event loop, preventing tab freezing during large draw operations.
- Cancellation tokens allow a new animation to immediately interrupt a running one when the user switches continents or algorithms, preventing stale draws from overwriting fresh ones.

### 5.6 Point-in-Polygon via Ray Casting (Jordan Curve Theorem)

**Decision:** Country click detection on the map uses horizontal ray casting — casting a ray from the click point toward +x and counting how many polygon edges it crosses.

**Why:**
- Robust for arbitrary convex and concave polygons, MultiPolygons, and polygons with holes (holes are detected as inner rings where the point must *not* fall).
- Numerically stable for projected geographic coordinates.
- Aligned with classical computational geometry; a standard algorithm taught in CG courses.
- No external spatial index or library needed.

### 5.7 GeoJSON with Multiple Fallback CDN URLs

**Decision:** The map tries up to four CDN URLs to load the GeoJSON world boundaries.

**Why:**
- CDN availability varies by region and time; a single URL is a single point of failure.
- Falls back gracefully to a flat ocean color if all sources fail, so the map page still loads.
- Equirectangular projection of the GeoJSON aligns naturally with the canvas lon→x, lat→y mapping.

### 5.8 Quiz Audio Synthesized in JavaScript (Not Pre-recorded Files)

**Decision:** Correct (880 Hz + 1174 Hz chord) and wrong (196 Hz) quiz tones are generated at runtime as WAV blobs using `Int16Array` with Hann-window sine envelopes.

**Why:**
- No external audio files to host, load, or cache-bust.
- Instant playback on first use (no network round-trip).
- Precise control over frequency, duration, and envelope shape.
- Small enough to regenerate each page load without perceptible delay.

### 5.9 Web Speech API for Narration (with MP3 Fallback)

**Decision:** Continent narration prefers a local `narrations/{id}.mp3` file and falls back to `SpeechSynthesisUtterance`.

**Why:**
- Human-recorded MP3s provide higher quality when available.
- Web Speech API is built into all modern browsers; zero hosting cost.
- Narration enhances accessibility and educational engagement without adding mandatory audio assets.

### 5.10 CSS Custom Properties for Theming

**Decision:** All colors are defined as CSS variables in `:root` (dark) and `[data-theme='light']`; JavaScript reads these at draw time when painting canvases.

**Why:**
- A single source of truth for color: change a variable and both HTML elements and canvas drawings update consistently.
- Zero-cost runtime theme switching — no re-loading assets.
- Separates design from logic; the CSS file owns all visual identity decisions.

---

## 6. Data Architecture

### Continent Data (`data.js` → `CONTINENTS` array)
Each of the 7 continents + a Middle East region is an object with:
- `id`, `label` — machine key and display name
- `overview` — ~200-word historical summary (rendered in the globe panel)
- `highlights` — 4–6 events with `when`, `title`, `text` (accordion items)
- `stats` — 4–5 key/value pairs (area, population, languages, eras)
- `images` — 3 Wikimedia Commons image URLs with alt text
- `video` / `youtubeId` — optional media
- `quiz` — 4 multiple-choice questions, each with `question`, `options[]`, `answer` (index), `explanation`

### Timeline Data (`data.js` → `CONTINENT_TIMELINES`)
Maps each continent ID to 5–7 timeline node objects:
- `wy` — normalized Y position on spine (0 = top / oldest, 1 = bottom / newest)
- `label` — event name
- `era` — era descriptor (e.g., "3000 BCE", "1800s")

### Helper Functions
- `latLonFromUV(u, v)` — maps Three.js UV texture coordinates to (lat, lon)
- `continentFromLatLon(lat, lon)` — returns continent ID using bounding-box + ordered exclusion tests
- `getQuizPool(continentId)` — returns filtered or global quiz question array

---

## 7. Computer Graphics Algorithms Implemented

| Algorithm | File | Use |
|-----------|------|-----|
| DDA Line | `algorithms.js` | Timeline spine; map borders (floating-point incremental steps) |
| Bresenham Line | `algorithms.js` | Timeline spine; map borders (integer-only, fewer operations) |
| Midpoint Circle | `algorithms.js` | Timeline event circles (8-way symmetry, pixel-level) |
| Quadratic Bézier | `algorithms.js` | Timeline chord links between adjacent events |
| Cohen–Sutherland Clip | `algorithms.js` | Clip lines to canvas viewport before pixel plotting |
| Window-to-Viewport | `algorithms.js` | Map logical coordinates → screen pixel coordinates |
| Point-in-Polygon (Ray Cast) | `map.js` | Determine which country was clicked |

---

## 8. Responsive and Accessibility Design

### Breakpoints
- **Mobile ≤768px**: Hamburger nav sheet; bottom-sheet panels for globe detail and map country info; single-column layouts; 44px minimum touch targets
- **Tablet 768–1024px**: Adjusted globe height and font scaling
- **Desktop >1024px**: Two-column layouts (globe + panel side-by-side; timeline with right sidebar)

### Accessibility Features
- ARIA labels on all interactive elements (buttons, canvas regions, panels)
- `aria-pressed` on toggle buttons (theme, satellite mode, algorithm selector)
- `aria-live` regions for quiz feedback and status messages
- Keyboard-navigable controls throughout
- Visually-hidden text for screen reader context (e.g., "Selected continent: Africa")
- `prefers-reduced-motion` media query disables animations for users who prefer it

---

## 9. Performance Considerations

| Concern | Approach |
|---------|---------|
| Globe geometry complexity | Mobile: 56 sphere segments; Desktop: 96 segments |
| Pixel ratio | `devicePixelRatio` capped at 2× on both mobile and desktop |
| Map base layer | Cached after first render; only overlays recomposited on hover/selection |
| GeoJSON resolution | Natural Earth 110m (coarse) — sufficient detail without large file size |
| Image loading | `loading="lazy"` and `decoding="async"` on continent panel images |
| Animation cancellation | Stale draw loops exit early via cancellation token, preventing wasted GPU time |

---

## 10. Technology Stack Summary

| Layer | Technology / Approach |
|-------|----------------------|
| 3D Rendering | Three.js v0.160.0, WebGL, OrbitControls |
| 2D Canvas | Canvas 2D API, ImageData, custom raster algorithms |
| Geographic Data | GeoJSON (Natural Earth 110m) via CDN with fallbacks |
| Content Data | Inline JSON (data.js) |
| Styling | CSS3 — Grid, Flexbox, CSS Custom Properties, keyframe animations |
| Audio | WAV synthesis (Int16Array), HTMLAudioElement, Web Speech Synthesis |
| Markup | Semantic HTML5 with ARIA |
| Modules | ES Modules with import map (Three.js CDN alias) |
| Storage | localStorage (theme, preferences) |
| Build | None — static files, no npm, no bundler |
| Hosting | GitHub Pages / Render (static blueprint included) |

---

## 11. Summary

Multi G1 — World History Explorer is a browser-based educational application that achieves three goals simultaneously:

1. **Pedagogical content**: Rich continent history, statistics, images, videos, and quiz questions covering all seven continents.
2. **Computer graphics education**: Every line, circle, and curve rendered algorithmically from scratch, demonstrating DDA, Bresenham, midpoint circle, quadratic Bézier, Cohen–Sutherland clipping, and point-in-polygon — directly visible to the user through step-by-step animation.
3. **Production-quality UX**: Responsive layout, dark/light theming, audio feedback, text-to-speech narration, full keyboard/touch/screen-reader accessibility, and multi-CDN resilience — all without a build step or backend server.

The deliberate choice to implement graphics primitives from scratch rather than using browser drawing APIs is the central architectural decision. It transforms the application from a simple history website into a living demonstration of the algorithms taught in a computer graphics course.
