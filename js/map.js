/**
 * 2D interactive world map (Canvas + GeoJSON).
 *
 * ---------------------------------------------------------------------------
 * LINE DRAWING (algorithms.js)
 * Country borders are NOT drawn with ctx.stroke() or built-in paths.
 * Each edge between consecutive vertices of a ring is rasterized using the
 * same discrete steps as our line algorithms:
 *   - collectBresenhamSteps (integer Bresenham — see lineBresenham in algorithms.js)
 *   - collectDDASteps (Digital Differential Analyzer — see lineDDA)
 * The chosen mode is user-selectable. For every segment we iterate the returned
 * pixel coordinates and write RGBA into an ImageData buffer (putPixel-style).
 * ---------------------------------------------------------------------------
 *
 * ---------------------------------------------------------------------------
 * POINT-IN-POLYGON (click / hover hit test)
 * After projecting lon/lat to canvas (x, y), we test the pointer against each
 * country using ray casting on the projected rings:
 *   Cast a horizontal ray from the point toward +x. Count edge crossings with
 *   the polygon boundary. An odd number of crossings means "inside" (Jordan
 *   curve theorem for simple polygons).
 * For GeoJSON polygons with holes: the point must be inside the outer ring
 * and NOT inside any hole ring.
 * MultiPolygon = several such parts; inside if inside any part.
 * Countries are tested smallest-area-first so small states win over neighbors.
 * ---------------------------------------------------------------------------
 */

import { collectBresenhamSteps, collectDDASteps } from './algorithms.js';

/** Equirectangular Earth imagery (same projection as lon/lat → x,y). CORS-friendly mirrors. */
const SATELLITE_URLS = [
  'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/textures/planets/earth_atmos_2048.jpg',
  'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg',
];

const GEOJSON_URLS = [
  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v4.1.0/geojson/ne_110m_admin_0_countries.geojson',
  'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_110m_admin_0_countries.geojson',
  'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
];

/** Read map colours from CSS theme variables (dark / light). */
function readMapPalette() {
  const s = getComputedStyle(document.documentElement);
  const g = (name, fb) => {
    const v = s.getPropertyValue(name).trim();
    return v || fb;
  };
  const parseRgb = (hex) => {
    const h = hex.replace('#', '');
    if (h.length === 6) {
      return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16),
      ];
    }
    return [13, 17, 24];
  };
  return {
    ocean: parseRgb(g('--map-ocean', '#0a1018')),
    border: parseRgb(g('--map-border', '#e8f4ff')),
    hover: parseRgb(g('--map-hover', '#7ec8ff')),
    selected: parseRgb(g('--map-selected', '#ffd080')),
  };
}

function lonLatToXY(lon, lat, w, h) {
  const x = ((lon + 180) / 360) * w;
  const y = ((90 - lat) / 180) * h;
  return [x, y];
}

/**
 * Ray-casting point-in-polygon on a single closed ring (projected x,y pairs).
 * See module header for the geometric idea.
 */
function pointInRing(px, py, ring) {
  let inside = false;
  const n = ring.length;
  if (n < 3) return false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    if (Math.abs(yj - yi) < 1e-10) continue;
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInParts(px, py, parts) {
  for (const part of parts) {
    if (!pointInRing(px, py, part.outer)) continue;
    let inHole = false;
    for (const hole of part.holes) {
      if (pointInRing(px, py, hole)) {
        inHole = true;
        break;
      }
    }
    if (!inHole) return true;
  }
  return false;
}

function projectParts(geometry, w, h) {
  const projectRing = (ring) => ring.map(([lon, lat]) => lonLatToXY(lon, lat, w, h));

  if (geometry.type === 'Polygon') {
    const c = geometry.coordinates;
    return [
      {
        outer: projectRing(c[0]),
        holes: c.slice(1).map(projectRing),
      },
    ];
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map((poly) => ({
      outer: projectRing(poly[0]),
      holes: poly.slice(1).map(projectRing),
    }));
  }
  return [];
}

function bboxOfParts(parts) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const part of parts) {
    for (const [x, y] of part.outer) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  return { minX, minY, maxX, maxY };
}

function ringArea(ring) {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return Math.abs(a / 2);
}

function partsArea(parts) {
  let s = 0;
  for (const p of parts) s += ringArea(p.outer);
  return s;
}

function setPixel(data, w, h, x, y, r, g, b, a = 255) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  if (ix < 0 || iy < 0 || ix >= w || iy >= h) return;
  const o = (iy * w + ix) * 4;
  data[o] = r;
  data[o + 1] = g;
  data[o + 2] = b;
  data[o + 3] = a;
}

/**
 * Rasterize one segment with Bresenham or DDA step lists from algorithms.js.
 */
function rasterizeSegment(imageData, w, h, x0, y0, x1, y1, rgb, mode) {
  const stepFn = mode === 'bresenham' ? collectBresenhamSteps : collectDDASteps;
  const pts = stepFn(x0, y0, x1, y1);
  const [r, g, b] = rgb;
  for (const p of pts) {
    setPixel(imageData.data, w, h, p.x, p.y, r, g, b, 255);
  }
}

function rasterizeRing(imageData, w, h, ring, rgb, mode) {
  if (ring.length < 2) return;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    rasterizeSegment(imageData, w, h, x0, y0, x1, y1, rgb, mode);
  }
  const [lx, ly] = ring[ring.length - 1];
  const [fx, fy] = ring[0];
  rasterizeSegment(imageData, w, h, lx, ly, fx, fy, rgb, mode);
}

function rasterizePartsOutline(imageData, w, h, parts, rgb, mode) {
  for (const part of parts) {
    rasterizeRing(imageData, w, h, part.outer, rgb, mode);
    for (const hole of part.holes) {
      rasterizeRing(imageData, w, h, hole, rgb, mode);
    }
  }
}

let cachedSatelliteImg = /** @type {HTMLImageElement | null | undefined} */ (undefined);

function loadImageCors(url) {
  return new Promise((resolve) => {
    const im = new Image();
    im.crossOrigin = 'anonymous';
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = url;
  });
}

/** First successful load is cached; `null` if all URLs fail (ocean fallback). */
async function getSatelliteImage() {
  if (cachedSatelliteImg !== undefined) return cachedSatelliteImg;
  for (const url of SATELLITE_URLS) {
    const im = await loadImageCors(url);
    if (im) {
      cachedSatelliteImg = im;
      return im;
    }
  }
  cachedSatelliteImg = null;
  return null;
}

async function buildBaseImageData(features, w, h, mode) {
  const pal = readMapPalette();
  const tmp = document.createElement('canvas');
  tmp.width = w;
  tmp.height = h;
  const tctx = tmp.getContext('2d', { willReadFrequently: true });
  if (!tctx) {
    const data = new ImageData(w, h);
    for (let i = 0; i < data.data.length; i += 4) {
      data.data[i] = pal.ocean[0];
      data.data[i + 1] = pal.ocean[1];
      data.data[i + 2] = pal.ocean[2];
      data.data[i + 3] = 255;
    }
    for (const f of features) rasterizePartsOutline(data, w, h, f.parts, pal.border, mode);
    return data;
  }

  const sat = await getSatelliteImage();
  if (sat) {
    try {
      tctx.drawImage(sat, 0, 0, w, h);
    } catch {
      tctx.fillStyle = `rgb(${pal.ocean[0]},${pal.ocean[1]},${pal.ocean[2]})`;
      tctx.fillRect(0, 0, w, h);
    }
  } else {
    tctx.fillStyle = `rgb(${pal.ocean[0]},${pal.ocean[1]},${pal.ocean[2]})`;
    tctx.fillRect(0, 0, w, h);
  }

  let data;
  try {
    data = tctx.getImageData(0, 0, w, h);
  } catch {
    data = new ImageData(w, h);
    for (let i = 0; i < data.data.length; i += 4) {
      data.data[i] = pal.ocean[0];
      data.data[i + 1] = pal.ocean[1];
      data.data[i + 2] = pal.ocean[2];
      data.data[i + 3] = 255;
    }
  }

  for (const f of features) {
    rasterizePartsOutline(data, w, h, f.parts, pal.border, mode);
  }
  return data;
}

function compositeOutlineOnTop(baseData, parts, rgb, mode, w, h) {
  const stroke = new ImageData(w, h);
  for (let i = 0; i < stroke.data.length; i++) stroke.data[i] = 0;
  rasterizePartsOutline(stroke, w, h, parts, rgb, mode);
  const merged = new ImageData(new Uint8ClampedArray(baseData.data), w, h);
  for (let i = 0; i < stroke.data.length; i += 4) {
    if (stroke.data[i + 3]) {
      merged.data[i] = stroke.data[i];
      merged.data[i + 1] = stroke.data[i + 1];
      merged.data[i + 2] = stroke.data[i + 2];
      merged.data[i + 3] = 255;
    }
  }
  return merged;
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function canvasToInternal(canvas, clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  const sx = canvas.width / r.width;
  const sy = canvas.height / r.height;
  return {
    x: (clientX - r.left) * sx,
    y: (clientY - r.top) * sy,
  };
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ ui: ReturnType<import('./ui-controls.js').initMapUi>, lineModeSelect: HTMLSelectElement | null, statusEl: HTMLElement | null }} opts
 */
export function initWorldMap(canvas, opts) {
  const { ui, lineModeSelect, statusEl } = opts;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { rebuildBaseLayer: () => {}, redrawTheme: () => {}, destroy: () => {} };

  const W = (canvas.width = 900);
  const H = (canvas.height = 450);

  let features = [];
  let baseImageData = null;
  let mode = lineModeSelect?.value === 'bresenham' ? 'bresenham' : 'dda';

  let hoverIndex = -1;
  let selectedIndex = -1;
  let selectionAnimStart = 0;
  let selectionAnimActive = false;
  let rafId = 0;

  function setStatus(t) {
    ui?.setStatus?.(t);
    if (statusEl) statusEl.textContent = t;
  }

  function getLineMode() {
    return lineModeSelect?.value === 'bresenham' ? 'bresenham' : 'dda';
  }

  function pickFeatureIndex(px, py) {
    for (let i = 0; i < features.length; i++) {
      const f = features[i];
      const b = f.bbox;
      if (px < b.minX || px > b.maxX || py < b.minY || py > b.maxY) continue;
      if (pointInParts(px, py, f.parts)) return i;
    }
    return -1;
  }

  function renderFrame() {
    mode = getLineMode();
    if (!baseImageData) return;
    const pal = readMapPalette();
    let frame = new ImageData(new Uint8ClampedArray(baseImageData.data), W, H);

    const hi = hoverIndex >= 0 && hoverIndex !== selectedIndex ? hoverIndex : -1;
    if (hi >= 0) {
      frame = compositeOutlineOnTop(frame, features[hi].parts, pal.hover, mode, W, H);
    }
    if (selectedIndex >= 0) {
      const elapsed = performance.now() - selectionAnimStart;
      let t = 1;
      const animMs = window.matchMedia('(max-width: 768px)').matches ? 240 : 420;
      if (selectionAnimActive) {
        t = easeOutCubic(Math.min(1, elapsed / animMs));
        if (elapsed >= animMs) selectionAnimActive = false;
      }
      const blend = 0.45 + 0.55 * t;
      const sr = Math.round(pal.selected[0] * blend + pal.border[0] * (1 - blend));
      const sg = Math.round(pal.selected[1] * blend + pal.border[1] * (1 - blend));
      const sb = Math.round(pal.selected[2] * blend + pal.border[2] * (1 - blend));
      frame = compositeOutlineOnTop(frame, features[selectedIndex].parts, [sr, sg, sb], mode, W, H);
    }

    ctx.putImageData(frame, 0, 0);

    if (selectionAnimActive) {
      rafId = requestAnimationFrame(renderFrame);
    }
  }

  function scheduleDraw() {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(renderFrame);
  }

  async function rebuildBaseLayer() {
    mode = getLineMode();
    if (!features.length) return;
    setStatus('Loading satellite imagery…');
    try {
      baseImageData = await buildBaseImageData(features, W, H, mode);
      setStatus(
        `${features.length} countries · satellite base · ${mode.toUpperCase()} borders · hover / tap`
      );
    } catch {
      setStatus('Could not build map layer.');
    }
    scheduleDraw();
  }

  function onMove(ev) {
    if (ev.pointerType !== 'mouse') return;
    const { x, y } = canvasToInternal(canvas, ev.clientX, ev.clientY);
    const idx = pickFeatureIndex(x, y);
    if (idx !== hoverIndex) {
      hoverIndex = idx;
      canvas.style.cursor = idx >= 0 ? 'pointer' : 'crosshair';
      scheduleDraw();
    }
  }

  function onClick(ev) {
    const { x, y } = canvasToInternal(canvas, ev.clientX, ev.clientY);
    const idx = pickFeatureIndex(x, y);
    if (idx < 0) {
      selectedIndex = -1;
      ui.clearPanel();
      scheduleDraw();
      return;
    }
    selectedIndex = idx;
    selectionAnimStart = performance.now();
    selectionAnimActive = true;
    const props = features[idx].props;
    ui.showCountryForFeature(props);
    scheduleDraw();
  }

  function onLeave() {
    hoverIndex = -1;
    canvas.style.cursor = 'crosshair';
    scheduleDraw();
  }

  window.addEventListener('map:closePanel', () => {
    selectedIndex = -1;
    selectionAnimActive = false;
    scheduleDraw();
  });

  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onClick);
  canvas.addEventListener('pointerleave', onLeave);

  lineModeSelect?.addEventListener('change', () => void rebuildBaseLayer());

  async function loadGeoJson() {
    setStatus('Loading country GeoJSON…');
    let text = null;
    for (const url of GEOJSON_URLS) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          text = await res.text();
          break;
        }
      } catch {
        /* try next */
      }
    }
    if (!text) {
      setStatus('Could not load map data (network). Check connection or try later.');
      return;
    }
    const geo = JSON.parse(text);
    const list = [];
    for (const f of geo.features || []) {
      const p = f.properties || {};
      const adm = p.ADM0_A3 || p.ISO_A3 || p.adm0_a3 || '';
      if (adm === 'ATA') continue;
      const parts = projectParts(f.geometry, W, H);
      if (!parts.length) continue;
      const bbox = bboxOfParts(parts);
      const area = partsArea(parts);
      list.push({
        parts,
        bbox,
        area,
        props: {
          adm0A3: adm,
          adminName: p.ADMIN || p.NAME || adm,
          name: p.NAME || p.ADMIN || adm,
        },
      });
    }
    list.sort((a, b) => a.area - b.area);
    features = list;
    void rebuildBaseLayer();
  }

  loadGeoJson();

  return {
    rebuildBaseLayer,
    redrawTheme() {
      void rebuildBaseLayer();
    },
    destroy() {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onClick);
      canvas.removeEventListener('pointerleave', onLeave);
    },
  };
}
