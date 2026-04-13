/**
 * World History Explorer — 2D raster graphics primitives for coursework demonstration.
 * DDA line, Bresenham line, midpoint circle, quadratic Bézier, Cohen–Sutherland clipping,
 * and window-to-viewport mapping (applied before rasterization).
 */

/** Palettes for theme-aware canvases (RGB hex — light mode shifts to higher luminance). */
export const ALGO_PALETTE_DARK = {
  bg: '#0d1118',
  clipStroke: '#3d9cf0',
  lineViolet: '#c8a8ff',
  circle: '#6ae3b0',
  bezier: '#f0a050',
  baseline: '#5a6578',
  label: '#9aa8c4',
};

export const ALGO_PALETTE_LIGHT = {
  bg: '#f0f4fb',
  clipStroke: '#2563eb',
  lineViolet: '#7c3aed',
  circle: '#0d9488',
  bezier: '#ea580c',
  baseline: '#64748b',
  label: '#475569',
};

function putPixel(ctx, x, y, style) {
  ctx.fillStyle = style;
  ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
}

/** Digital Differential Analyzer — line rasterization */
export function lineDDA(ctx, x0, y0, x1, y1, style = '#7ec8ff') {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy)) || 1;
  const xInc = dx / steps;
  const yInc = dy / steps;
  let x = x0;
  let y = y0;
  for (let i = 0; i <= steps; i++) {
    putPixel(ctx, x, y, style);
    x += xInc;
    y += yInc;
  }
}

/**
 * Bresenham line — integer error; alternative to DDA for axis-friendly slopes.
 */
export function lineBresenham(ctx, x0, y0, x1, y1, style = '#9bdc6a') {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0;
  let y = y0;
  while (true) {
    putPixel(ctx, x, y, style);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

/** Point list for stepped DDA animation */
export function collectDDASteps(x0, y0, x1, y1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy)) || 1;
  const out = [];
  for (let i = 0; i <= steps; i++) {
    out.push({ x: x0 + (dx * i) / steps, y: y0 + (dy * i) / steps });
  }
  return out;
}

/** Point list for stepped Bresenham animation */
export function collectBresenhamSteps(x0, y0, x1, y1) {
  x0 = Math.round(x0);
  y0 = Math.round(y0);
  x1 = Math.round(x1);
  y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  let x = x0;
  let y = y0;
  const out = [];
  while (true) {
    out.push({ x, y });
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
  return out;
}

export function drawRasterLineProgress(ctx, points, endIdx, style) {
  const n = Math.min(endIdx, points.length - 1);
  for (let i = 0; i <= n; i++) {
    putPixel(ctx, points[i].x, points[i].y, style);
  }
}

/** Midpoint circle algorithm */
export function circleMidpoint(ctx, xc, yc, r, style = '#9bdc6a') {
  let x = 0;
  let y = r;
  let d = 1 - r;
  const plot = (px, py) => {
    putPixel(ctx, xc + px, yc + py, style);
    putPixel(ctx, xc - px, yc + py, style);
    putPixel(ctx, xc + px, yc - py, style);
    putPixel(ctx, xc - px, yc - py, style);
    putPixel(ctx, xc + py, yc + px, style);
    putPixel(ctx, xc - py, yc + px, style);
    putPixel(ctx, xc + py, yc - px, style);
    putPixel(ctx, xc - py, yc - px, style);
  };
  plot(x, y);
  while (x < y) {
    if (d < 0) {
      d += 2 * x + 3;
    } else {
      d += 2 * (x - y) + 5;
      y--;
    }
    x++;
    plot(x, y);
  }
}

/** Pixel list from midpoint circle (for progressive draw). */
export function collectMidpointCirclePoints(xc, yc, r) {
  const pts = [];
  const pushPlot = (px, py) => {
    const pairs = [
      [px, py],
      [-px, py],
      [px, -py],
      [-px, -py],
      [py, px],
      [-py, px],
      [py, -px],
      [-py, -px],
    ];
    for (const [a, b] of pairs) pts.push({ x: xc + a, y: yc + b });
  };
  let x = 0;
  let y = r;
  let d = 1 - r;
  pushPlot(x, y);
  while (x < y) {
    if (d < 0) d += 2 * x + 3;
    else {
      d += 2 * (x - y) + 5;
      y--;
    }
    x++;
    pushPlot(x, y);
  }
  return pts;
}

export function drawCirclePointsProgress(ctx, points, count, style) {
  const n = Math.min(count, points.length);
  for (let i = 0; i < n; i++) putPixel(ctx, points[i].x, points[i].y, style);
}

/** Quadratic Bézier chord endpoints for DDA/Bresenham stitching */
export function collectQuadraticBezierSegments(x0, y0, x1, y1, x2, y2, segments = 40) {
  const lines = [];
  for (let i = 0; i < segments; i++) {
    const t0 = i / segments;
    const t1 = (i + 1) / segments;
    const ax = (1 - t0) ** 2 * x0 + 2 * (1 - t0) * t0 * x1 + t0 ** 2 * x2;
    const ay = (1 - t0) ** 2 * y0 + 2 * (1 - t0) * t0 * y1 + t0 ** 2 * y2;
    const bx = (1 - t1) ** 2 * x0 + 2 * (1 - t1) * t1 * x1 + t1 ** 2 * x2;
    const by = (1 - t1) ** 2 * y0 + 2 * (1 - t1) * t1 * y1 + t1 ** 2 * y2;
    lines.push({ x0: ax, y0: ay, x1: bx, y1: by });
  }
  return lines;
}

/** Quadratic Bézier: B(t) = (1-t)²P0 + 2(1-t)tP1 + t²P2 */
export function bezierQuadratic(ctx, x0, y0, x1, y1, x2, y2, segments = 80, style = '#f0a050') {
  for (let i = 0; i < segments; i++) {
    const t0 = i / segments;
    const t1 = (i + 1) / segments;
    const ax = (1 - t0) ** 2 * x0 + 2 * (1 - t0) * t0 * x1 + t0 ** 2 * x2;
    const ay = (1 - t0) ** 2 * y0 + 2 * (1 - t0) * t0 * y1 + t0 ** 2 * y2;
    const bx = (1 - t1) ** 2 * x0 + 2 * (1 - t1) * t1 * x1 + t1 ** 2 * x2;
    const by = (1 - t1) ** 2 * y0 + 2 * (1 - t1) * t1 * y1 + t1 ** 2 * y2;
    lineDDA(ctx, ax, ay, bx, by, style);
  }
}

const INSIDE = 0;
const LEFT = 1;
const RIGHT = 2;
const BOTTOM = 4;
const TOP = 8;

/** Outcodes for canvas coordinates (y increases downward): TOP = above ymin, BOTTOM = below ymax */
function computeCode(x, y, xmin, ymin, xmax, ymax) {
  let code = INSIDE;
  if (x < xmin) code |= LEFT;
  else if (x > xmax) code |= RIGHT;
  if (y < ymin) code |= TOP;
  else if (y > ymax) code |= BOTTOM;
  return code;
}

/** Cohen–Sutherland line clip against axis-aligned rectangle */
export function clipLineCohenSutherland(x0, y0, x1, y1, xmin, ymin, xmax, ymax) {
  let code0 = computeCode(x0, y0, xmin, ymin, xmax, ymax);
  let code1 = computeCode(x1, y1, xmin, ymin, xmax, ymax);
  let accept = false;

  while (true) {
    if (!(code0 | code1)) {
      accept = true;
      break;
    }
    if (code0 & code1) break;

    const codeOut = code0 ? code0 : code1;
    let x = 0;
    let y = 0;

    if (codeOut & TOP) {
      x = x0 + ((x1 - x0) * (ymin - y0)) / (y1 - y0);
      y = ymin;
    } else if (codeOut & BOTTOM) {
      x = x0 + ((x1 - x0) * (ymax - y0)) / (y1 - y0);
      y = ymax;
    } else if (codeOut & RIGHT) {
      y = y0 + ((y1 - y0) * (xmax - x0)) / (x1 - x0);
      x = xmax;
    } else if (codeOut & LEFT) {
      y = y0 + ((y1 - y0) * (xmin - x0)) / (x1 - x0);
      x = xmin;
    }

    if (codeOut === code0) {
      x0 = x;
      y0 = y;
      code0 = computeCode(x0, y0, xmin, ymin, xmax, ymax);
    } else {
      x1 = x;
      y1 = y;
      code1 = computeCode(x1, y1, xmin, ymin, xmax, ymax);
    }
  }

  return accept ? { x0, y0, x1, y1 } : null;
}

/**
 * Map world (window) coordinates to screen (viewport) pixels.
 * sx = vx + (x - wx0) * (vw / ww), sy = vy + (y - wy0) * (vh / wh)
 */
export function windowToViewport(x, y, worldRect, viewportRect) {
  const { wx0, wy0, ww, wh } = worldRect;
  const { vx, vy, vw, vh } = viewportRect;
  const sx = vx + ((x - wx0) * vw) / ww;
  const sy = vy + ((y - wy0) * vh) / wh;
  return { x: sx, y: sy };
}

/** Full demo draw for the main canvas */
export function runAlgorithmDemo(canvas, palette = ALGO_PALETTE_DARK) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, w, h);

  const clip = { xmin: 80, ymin: 50, xmax: w - 80, ymax: h - 90 };
  ctx.strokeStyle = palette.clipStroke;
  ctx.lineWidth = 1;
  ctx.strokeRect(clip.xmin + 0.5, clip.ymin + 0.5, clip.xmax - clip.xmin - 1, clip.ymax - clip.ymin - 1);

  const world = { wx0: -1, wy0: -1, ww: 2, wh: 2 };
  const vp = { vx: clip.xmin, vy: clip.ymin, vw: clip.xmax - clip.xmin, vh: clip.ymax - clip.ymin };

  const linesWorld = [
    { x0: -0.9, y0: -0.2, x1: 0.9, y1: 0.6 },
    { x0: -0.2, y0: -0.95, x1: 0.85, y1: 0.95 },
    { x0: -1.2, y0: 0.3, x1: 0.2, y1: 0.35 },
  ];

  for (const ln of linesWorld) {
    const p0 = windowToViewport(ln.x0, ln.y0, world, vp);
    const p1 = windowToViewport(ln.x1, ln.y1, world, vp);
    const clipped = clipLineCohenSutherland(p0.x, p0.y, p1.x, p1.y, clip.xmin, clip.ymin, clip.xmax, clip.ymax);
    if (clipped) {
      lineDDA(ctx, clipped.x0, clipped.y0, clipped.x1, clipped.y1, palette.lineViolet);
    }
  }

  const cx = w * 0.72;
  const cy = h * 0.38;
  circleMidpoint(ctx, cx, cy, 46, palette.circle);

  bezierQuadratic(ctx, 40, h - 50, w * 0.35, 30, w * 0.55, h - 40, 100, palette.bezier);

  lineDDA(ctx, clip.xmin, clip.ymax + 24, clip.xmax, clip.ymax + 24, palette.baseline);

  ctx.fillStyle = palette.label;
  ctx.font = '12px Segoe UI, sans-serif';
  ctx.fillText('Clipping window (Cohen–Sutherland + window→viewport)', clip.xmin, clip.ymin - 8);
  ctx.fillText('Circle (midpoint)', cx - 52, cy - 54);
  ctx.fillText('Bézier curve (DDA along curve)', 40, h - 58);
}

export function getAlgorithmLegendItems() {
  return [
    'Violet segments: lines mapped from a normalized world window into the blue clip rectangle, then clipped.',
    'Teal ring: midpoint circle rasterization.',
    'Orange stroke: quadratic Bézier sampled into short segments, each drawn with DDA.',
    'Bottom grey line: full DDA segment outside the pedagogical clip region.',
  ];
}
