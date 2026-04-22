/**
 * Continent timeline — vertical spine + event nodes + Bézier links.
 * All raster work uses algorithms.js (DDA or Bresenham, midpoint circles, Bézier→segment chords).
 * Each continent has a fully unique style: colours, layout, node shape, curve style, and speed.
 */

import {
  collectDDASteps,
  collectBresenhamSteps,
  drawRasterLineProgress,
  collectMidpointCirclePoints,
  drawCirclePointsProgress,
  collectQuadraticBezierSegments,
  clipLineCohenSutherland,
  windowToViewport,
} from './algorithms.js';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export function readTimelinePalette() {
  const s = getComputedStyle(document.documentElement);
  const g = (name, fallback) => {
    const v = s.getPropertyValue(name).trim();
    return v || fallback;
  };
  return {
    bg: g('--timeline-bg', '#0d1118'),
    clipStroke: g('--timeline-clip', '#3d9cf0'),
    spine: g('--timeline-spine', '#7ec8ff'),
    node: g('--timeline-node', '#f0a050'),
    curve: g('--timeline-curve', '#9bdc6a'),
    label: g('--timeline-label', '#e8eef8'),
    labelMuted: g('--timeline-label-muted', '#9aa8c4'),
  };
}

export function clearTimelineCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  const pal = readTimelinePalette();
  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const CONTINENT_STYLES = {
  africa: {
    palette: { spine: '#e8a020', node: '#e05010', curve: '#f0c040', label: '#fff0d0', labelMuted: '#c09050', clipStroke: '#c06020' },
    layout: 'vertical', nodeShape: 'circle', curveOffset: { x: 55, y: -12 }, nodeRadius: 11,
    spineDelay: 4, nodeDelay: 3, curveDelay: 3,
    description: 'vertical spine, circles, warm right-arcing Bézier',
  },
  europe: {
    palette: { spine: '#a0c8f8', node: '#4080e0', curve: '#80b0ff', label: '#e8f0ff', labelMuted: '#8090b0', clipStroke: '#3060c0' },
    layout: 'diagonal', nodeShape: 'square', curveOffset: { x: -48, y: 10 }, nodeRadius: 9,
    spineDelay: 3, nodeDelay: 2, curveDelay: 2,
    description: 'diagonal spine, square nodes, left-arcing Bézier',
  },
  asia: {
    palette: { spine: '#e04040', node: '#20b070', curve: '#ff8040', label: '#fff8e8', labelMuted: '#a07060', clipStroke: '#c03030' },
    layout: 'horizontal', nodeShape: 'diamond', curveOffset: { x: 0, y: -55 }, nodeRadius: 10,
    spineDelay: 2, nodeDelay: 2, curveDelay: 1,
    description: 'horizontal spine, diamond nodes, upward Bézier arcs',
  },
  northAmerica: {
    palette: { spine: '#40e080', node: '#00c8d8', curve: '#80ff80', label: '#e8fff0', labelMuted: '#60a080', clipStroke: '#20a060' },
    layout: 'zigzag', nodeShape: 'triangle', curveOffset: { x: 40, y: 40 }, nodeRadius: 10,
    spineDelay: 2, nodeDelay: 2, curveDelay: 2,
    description: 'zigzag spine, triangle nodes, alternating S-curves',
  },
  southAmerica: {
    palette: { spine: '#c060f0', node: '#40d080', curve: '#e080ff', label: '#f8e8ff', labelMuted: '#9060a0', clipStroke: '#9030d0' },
    layout: 'wave', nodeShape: 'circle', curveOffset: { x: -50, y: -20 }, nodeRadius: 12,
    spineDelay: 5, nodeDelay: 4, curveDelay: 3,
    description: 'wave spine, large circles, wide sweeping Bézier',
  },
  australia: {
    palette: { spine: '#f08030', node: '#f0d040', curve: '#e05020', label: '#fff4e0', labelMuted: '#a07040', clipStroke: '#c05010' },
    layout: 'vertical', nodeShape: 'square', curveOffset: { x: 60, y: 5 }, nodeRadius: 8,
    spineDelay: 6, nodeDelay: 5, curveDelay: 4,
    description: 'vertical spine, square nodes, slow desert pace',
  },
  antarctica: {
    palette: { spine: '#c0e8ff', node: '#ffffff', curve: '#80d0ff', label: '#ffffff', labelMuted: '#90b8d8', clipStroke: '#60a8e0' },
    layout: 'radial', nodeShape: 'circle', curveOffset: { x: 0, y: 0 }, nodeRadius: 7,
    spineDelay: 8, nodeDelay: 6, curveDelay: 5,
    description: 'radial layout, crisp circles, slow icy pace',
  },
};

const DEFAULT_STYLE = CONTINENT_STYLES.africa;

async function drawSquareNode(ctx, cx, cy, r, color, cancelled) {
  const corners = [
    [cx - r, cy - r, cx + r, cy - r],
    [cx + r, cy - r, cx + r, cy + r],
    [cx + r, cy + r, cx - r, cy + r],
    [cx - r, cy + r, cx - r, cy - r],
  ];
  for (const [x0, y0, x1, y1] of corners) {
    const pts = collectDDASteps(x0, y0, x1, y1);
    for (let k = 0; k < pts.length; k++) {
      if (cancelled()) return;
      drawRasterLineProgress(ctx, pts, k, color);
      if (k % 3 === 0) await sleep(1);
    }
  }
}

async function drawDiamondNode(ctx, cx, cy, r, color, cancelled) {
  const sides = [
    [cx, cy - r, cx + r, cy],
    [cx + r, cy, cx, cy + r],
    [cx, cy + r, cx - r, cy],
    [cx - r, cy, cx, cy - r],
  ];
  for (const [x0, y0, x1, y1] of sides) {
    const steps = collectDDASteps(x0, y0, x1, y1);
    for (let k = 0; k < steps.length; k++) {
      if (cancelled()) return;
      drawRasterLineProgress(ctx, steps, k, color);
      if (k % 3 === 0) await sleep(1);
    }
  }
}

async function drawTriangleNode(ctx, cx, cy, r, color, cancelled) {
  const top   = [cx,     cy - r];
  const left  = [cx - r, cy + r * 0.7];
  const right = [cx + r, cy + r * 0.7];
  const sides = [
    [...top, ...right],
    [...right, ...left],
    [...left, ...top],
  ];
  for (const [x0, y0, x1, y1] of sides) {
    const steps = collectDDASteps(x0, y0, x1, y1);
    for (let k = 0; k < steps.length; k++) {
      if (cancelled()) return;
      drawRasterLineProgress(ctx, steps, k, color);
      if (k % 3 === 0) await sleep(1);
    }
  }
}

async function drawCircleNode(ctx, cx, cy, r, color, nodeDelay, cancelled) {
  const pts = collectMidpointCirclePoints(cx, cy, r);
  for (let k = 0; k < pts.length; k++) {
    if (cancelled()) return;
    drawCirclePointsProgress(ctx, pts, k + 1, color);
    if (k % 4 === 0) await sleep(nodeDelay);
  }
}

function wrapTextLines(ctx, text, maxWidth) {
  const t = String(text || '').trim();
  if (!t) return [''];
  if (maxWidth <= 10) return [t];
  if (ctx.measureText(t).width <= maxWidth) return [t];

  const words = t.split(/\s+/g);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width <= maxWidth) {
      cur = next;
      continue;
    }
    if (cur) lines.push(cur);
    cur = w;
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [t];
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function drawLabelBlock(ctx, clip, x, y, title, subtitle, pal) {
  const pad = 6;
  const innerLeft = clip.xmin + pad;
  const innerRight = clip.xmax - pad;
  const innerTop = clip.ymin + pad;
  const innerBottom = clip.ymax - pad;

  // Title
  ctx.font = '11px Segoe UI, sans-serif';
  const maxW = Math.max(30, innerRight - x);
  let titleLines = wrapTextLines(ctx, title, maxW);

  // If it still doesn't fit (or maxW is tiny), flip to the left of the anchor.
  const longestTitleW = Math.max(...titleLines.map((l) => ctx.measureText(l).width));
  if (x + longestTitleW > innerRight && x > innerLeft + 40) {
    const flippedMaxW = Math.max(30, x - innerLeft);
    titleLines = wrapTextLines(ctx, title, flippedMaxW);
    const flippedLongest = Math.max(...titleLines.map((l) => ctx.measureText(l).width));
    x = clamp(x - flippedLongest, innerLeft, innerRight - 10);
  } else {
    x = clamp(x, innerLeft, innerRight - 10);
  }

  const titleLineH = 13;
  const subLineH = 12;
  const blockH = titleLines.length * titleLineH + subLineH;
  y = clamp(y, innerTop + titleLineH, innerBottom - blockH + titleLineH);

  ctx.fillStyle = pal.label;
  for (let i = 0; i < titleLines.length; i++) {
    ctx.fillText(titleLines[i], x, y + i * titleLineH);
  }

  ctx.fillStyle = pal.labelMuted;
  ctx.font = '10px Segoe UI, sans-serif';
  ctx.fillText(subtitle, x, y + titleLines.length * titleLineH);
}

function drawLabelBlockCentered(ctx, clip, xCenter, y, maxWidth, title, subtitle, pal) {
  const pad = 6;
  const innerLeft = clip.xmin + pad;
  const innerRight = clip.xmax - pad;
  const innerTop = clip.ymin + pad;
  const innerBottom = clip.ymax - pad;

  const safeMaxWidth = clamp(maxWidth, 40, innerRight - innerLeft);

  ctx.font = '11px Segoe UI, sans-serif';
  let titleLines = wrapTextLines(ctx, title, safeMaxWidth);
  // Hard cap lines so dense layouts stay readable.
  if (titleLines.length > 2) {
    titleLines = [titleLines[0], `${titleLines[1]}…`];
  }

  const titleLineH = 13;
  const subLineH = 12;
  const blockH = titleLines.length * titleLineH + subLineH;

  // Center the longest title line around xCenter.
  const longestTitleW = Math.max(...titleLines.map((l) => ctx.measureText(l).width));
  let x = xCenter - longestTitleW / 2;
  x = clamp(x, innerLeft, innerRight - longestTitleW);

  y = clamp(y, innerTop + titleLineH, innerBottom - blockH + titleLineH);

  ctx.fillStyle = pal.label;
  for (let i = 0; i < titleLines.length; i++) {
    ctx.fillText(titleLines[i], x, y + i * titleLineH);
  }
  ctx.fillStyle = pal.labelMuted;
  ctx.font = '10px Segoe UI, sans-serif';
  ctx.fillText(subtitle, x, y + titleLines.length * titleLineH);
}

function buildNodeCenters(layout, events, clip, vp, world, wxSpine) {
  const w = clip.xmax - clip.xmin;
  const h = clip.ymax - clip.ymin;
  const count = events.length;

  if (layout === 'horizontal') {
    return events.map((ev, i) => {
      const t = count <= 1 ? 0.5 : i / (count - 1);
      return { x: clip.xmin + 20 + t * (w - 40), y: clip.ymin + h / 2, meta: ev };
    });
  }
  if (layout === 'diagonal') {
    return events.map((ev, i) => {
      const t = count <= 1 ? 0.5 : i / (count - 1);
      return { x: clip.xmin + 20 + t * (w - 40), y: clip.ymin + 20 + t * (h - 40), meta: ev };
    });
  }
  if (layout === 'zigzag') {
    return events.map((ev, i) => {
      const t = count <= 1 ? 0.5 : i / (count - 1);
      const side = i % 2 === 0 ? -1 : 1;
      return { x: clip.xmin + w / 2 + side * (w * 0.22), y: clip.ymin + 20 + t * (h - 40), meta: ev };
    });
  }
  if (layout === 'wave') {
    return events.map((ev, i) => {
      const t = count <= 1 ? 0.5 : i / (count - 1);
      const wave = Math.sin(t * Math.PI * 2.5) * (w * 0.18);
      return { x: clip.xmin + w / 2 + wave, y: clip.ymin + 20 + t * (h - 40), meta: ev };
    });
  }
  if (layout === 'radial') {
    const cx = clip.xmin + w / 2;
    const cy = clip.ymin + h / 2;
    const radius = Math.min(w, h) * 0.36;
    return events.map((ev, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius, meta: ev };
    });
  }
  // vertical (default)
  return events.map((ev) => {
    const p = windowToViewport(wxSpine, ev.wy, world, vp);
    return { x: p.x, y: p.y, meta: ev };
  });
}

export async function runTimelineAnimation(canvas, opts) {
  const { continentId, mode, getEvents, statusEl, isCancelled } = opts;
  const cancelled = () => isCancelled?.() === true;

  const events = getEvents(continentId) || [];
  const basePal = readTimelinePalette();
  const style = CONTINENT_STYLES[continentId] || DEFAULT_STYLE;
  const pal = { ...basePal, ...style.palette };

  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = pal.bg;
  ctx.fillRect(0, 0, w, h);

  const pad = 22;
  const clip = { xmin: pad, ymin: pad + 20, xmax: w - pad, ymax: h - pad };

  ctx.strokeStyle = pal.clipStroke;
  ctx.lineWidth = 1;
  ctx.strokeRect(clip.xmin + 0.5, clip.ymin + 0.5, clip.xmax - clip.xmin - 1, clip.ymax - clip.ymin - 1);

  const world = { wx0: 0, wy0: 0, ww: 1, wh: 1 };
  const vp = { vx: clip.xmin, vy: clip.ymin, vw: clip.xmax - clip.xmin, vh: clip.ymax - clip.ymin };

  if (!events.length) {
    if (statusEl) statusEl.textContent = 'No timeline entries for this region.';
    return;
  }

  if (statusEl) statusEl.textContent = `Drawing ${continentId} — ${style.description}…`;

  const wxSpine = 0.5;
  const centers = buildNodeCenters(style.layout, events, clip, vp, world, wxSpine);
  const clipSeg = (x0, y0, x1, y1) =>
    clipLineCohenSutherland(x0, y0, x1, y1, clip.xmin, clip.ymin, clip.xmax, clip.ymax);

  // ── Spine ──
  if (style.layout === 'vertical' || style.layout === 'diagonal' || style.layout === 'horizontal') {
    const s = centers[0], e2 = centers[centers.length - 1];
    let sx = s.x, sy = s.y, ex = e2.x, ey = e2.y;
    if (style.layout === 'vertical') {
      const ys = events.map((e) => e.wy);
      const top = windowToViewport(wxSpine, Math.max(0, Math.min(...ys) - 0.06), world, vp);
      const bot = windowToViewport(wxSpine, Math.min(1, Math.max(...ys) + 0.06), world, vp);
      sx = top.x; sy = top.y; ex = bot.x; ey = bot.y;
    }
    const sc = clipSeg(sx, sy, ex, ey);
    if (sc) {
      const pts = mode === 'bresenham'
        ? collectBresenhamSteps(sc.x0, sc.y0, sc.x1, sc.y1)
        : collectDDASteps(sc.x0, sc.y0, sc.x1, sc.y1);
      for (let k = 0; k < pts.length; k++) {
        if (cancelled()) return;
        drawRasterLineProgress(ctx, pts, k, pal.spine);
        if (k % 3 === 0) await sleep(style.spineDelay);
      }
    }
  }

  if (style.layout === 'zigzag' || style.layout === 'wave') {
    for (let i = 0; i < centers.length - 1; i++) {
      const a = centers[i], b = centers[i + 1];
      const sc = clipSeg(a.x, a.y, b.x, b.y);
      if (sc) {
        const pts = mode === 'bresenham'
          ? collectBresenhamSteps(sc.x0, sc.y0, sc.x1, sc.y1)
          : collectDDASteps(sc.x0, sc.y0, sc.x1, sc.y1);
        for (let k = 0; k < pts.length; k++) {
          if (cancelled()) return;
          drawRasterLineProgress(ctx, pts, k, pal.spine);
          if (k % 3 === 0) await sleep(style.spineDelay);
        }
      }
    }
  }

  if (style.layout === 'radial') {
    const cx = clip.xmin + (clip.xmax - clip.xmin) / 2;
    const cy = clip.ymin + (clip.ymax - clip.ymin) / 2;
    for (const c of centers) {
      const sc = clipSeg(cx, cy, c.x, c.y);
      if (sc) {
        const pts = mode === 'bresenham'
          ? collectBresenhamSteps(sc.x0, sc.y0, sc.x1, sc.y1)
          : collectDDASteps(sc.x0, sc.y0, sc.x1, sc.y1);
        for (let k = 0; k < pts.length; k++) {
          if (cancelled()) return;
          drawRasterLineProgress(ctx, pts, k, pal.spine);
          if (k % 4 === 0) await sleep(style.spineDelay);
        }
      }
    }
  }

  // ── Nodes ──
  for (let idx = 0; idx < centers.length; idx++) {
    const c = centers[idx];
    if (cancelled()) return;
    const r = style.nodeRadius;
    if (style.nodeShape === 'square')        await drawSquareNode(ctx, c.x, c.y, r, pal.node, cancelled);
    else if (style.nodeShape === 'diamond')  await drawDiamondNode(ctx, c.x, c.y, r, pal.node, cancelled);
    else if (style.nodeShape === 'triangle') await drawTriangleNode(ctx, c.x, c.y, r, pal.node, cancelled);
    else                                     await drawCircleNode(ctx, c.x, c.y, r, pal.node, style.nodeDelay, cancelled);
    if (cancelled()) return;

    let labelX = style.layout === 'horizontal' ? c.x - 10 : c.x + r + 6;
    let labelY = style.layout === 'horizontal' ? c.y + r + 14 : c.y + 4;
    // For radial layouts, push labels slightly outward from center.
    if (style.layout === 'radial') {
      const cx = clip.xmin + (clip.xmax - clip.xmin) / 2;
      const cy = clip.ymin + (clip.ymax - clip.ymin) / 2;
      const dx = c.x - cx;
      const dy = c.y - cy;
      const mag = Math.hypot(dx, dy) || 1;
      labelX = c.x + (dx / mag) * (r + 10);
      labelY = c.y + (dy / mag) * (r + 6);
    }
    if (style.layout === 'horizontal') {
      // Horizontal layouts are dense: center labels and alternate above/below to avoid overlap.
      const prev = centers[idx - 1];
      const next = centers[idx + 1];
      const leftBound = prev ? (prev.x + c.x) / 2 : clip.xmin;
      const rightBound = next ? (next.x + c.x) / 2 : clip.xmax;
      const maxW = Math.max(60, (rightBound - leftBound) - 14);
      const above = idx % 2 === 1;
      const y = above ? c.y - r - 22 : c.y + r + 18;
      drawLabelBlockCentered(ctx, clip, c.x, y, maxW, c.meta.label, c.meta.era, pal);
    } else {
      drawLabelBlock(ctx, clip, labelX, labelY, c.meta.label, c.meta.era, pal);
    }
  }

  // ── Bézier curves ──
  for (let i = 0; i < centers.length - 1; i++) {
    if (cancelled()) return;
    const a = centers[i];
    const b = centers[i + 1];
    const flip = (style.layout === 'zigzag' && i % 2 === 0) ? -1 : 1;
    const cx2 = (a.x + b.x) / 2 + style.curveOffset.x * flip;
    const cy2 = (a.y + b.y) / 2 + style.curveOffset.y * flip;
    const segs = collectQuadraticBezierSegments(a.x, a.y, cx2, cy2, b.x, b.y, 30);
    for (const seg of segs) {
      if (cancelled()) return;
      const c0 = clipSeg(seg.x0, seg.y0, seg.x1, seg.y1);
      if (!c0) continue;
      const chordPts = mode === 'bresenham'
        ? collectBresenhamSteps(c0.x0, c0.y0, c0.x1, c0.y1)
        : collectDDASteps(c0.x0, c0.y0, c0.x1, c0.y1);
      for (let k = 0; k < chordPts.length; k++) {
        if (cancelled()) return;
        drawRasterLineProgress(ctx, chordPts, k, pal.curve);
        if (k % 2 === 0) await sleep(style.curveDelay);
      }
    }
  }

  if (!cancelled() && statusEl) {
    statusEl.textContent = `Done — ${continentId}: ${events.length} events (${mode.toUpperCase()} · ${style.description}).`;
  }
}

export function initContinentTimelinePanel(opts) {
  const { canvas, continentSelect, playBtn, lineModeSelect, statusEl, getEvents } = opts;
  if (!canvas || !continentSelect) return { cancel: () => {}, refreshClear: () => {} };

  let animToken = 0;

  async function play() {
    const my = ++animToken;
    const mode = lineModeSelect?.value === 'bresenham' ? 'bresenham' : 'dda';
    await runTimelineAnimation(canvas, {
      continentId: continentSelect.value,
      mode,
      getEvents,
      statusEl,
      isCancelled: () => my !== animToken,
    });
  }

  function onContinentChange() {
    animToken += 1;
    clearTimelineCanvas(canvas);
    if (statusEl) statusEl.textContent = 'Canvas cleared. Press "Play timeline" to animate with algorithms.';
  }

  continentSelect.addEventListener('change', onContinentChange);
  playBtn?.addEventListener('click', () => { play(); });
  clearTimelineCanvas(canvas);

  return {
    cancel: () => { animToken += 1; },
    refreshClear: () => { animToken += 1; clearTimelineCanvas(canvas); },
  };
}