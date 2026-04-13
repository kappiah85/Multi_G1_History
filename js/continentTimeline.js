/**
 * Continent timeline — vertical spine + event nodes + Bézier links.
 * All raster work uses algorithms.js (DDA or Bresenham, midpoint circles, Bézier→segment chords).
 */

import {
  collectDDASteps,
  collectBresenhamSteps,
  drawRasterLineProgress,
  collectMidpointCirclePoints,
  drawCirclePointsProgress,
  collectQuadraticBezierSegments,
} from './algorithms.js';
import { clipLineCohenSutherland, windowToViewport } from './algorithms.js';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Read canvas colours from CSS variables (updated by light/dark theme). */
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

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ continentId: string, mode: 'dda' | 'bresenham', getEvents: (id: string) => Array<{ wy: number, label: string, era: string }>, statusEl: HTMLElement | null, isCancelled?: () => boolean }} opts
 */
export async function runTimelineAnimation(canvas, opts) {
  const { continentId, mode, getEvents, statusEl, isCancelled } = opts;
  const cancelled = () => isCancelled?.() === true;

  const events = getEvents(continentId) || [];
  const pal = readTimelinePalette();
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

  if (statusEl) {
    statusEl.textContent = `Drawing ${continentId} — spine (${mode.toUpperCase()}), midpoint circles, clipped Bézier chords…`;
  }

  const wxSpine = 0.5;
  const ys = events.map((e) => e.wy);
  const yMin = Math.max(0, Math.min(...ys) - 0.06);
  const yMax = Math.min(1, Math.max(...ys) + 0.06);
  const top = windowToViewport(wxSpine, yMin, world, vp);
  const bot = windowToViewport(wxSpine, yMax, world, vp);
  const spineClip = clipLineCohenSutherland(top.x, top.y, bot.x, bot.y, clip.xmin, clip.ymin, clip.xmax, clip.ymax);

  if (spineClip) {
    const spinePts =
      mode === 'bresenham'
        ? collectBresenhamSteps(spineClip.x0, spineClip.y0, spineClip.x1, spineClip.y1)
        : collectDDASteps(spineClip.x0, spineClip.y0, spineClip.x1, spineClip.y1);
    for (let k = 0; k < spinePts.length; k++) {
      if (cancelled()) return;
      drawRasterLineProgress(ctx, spinePts, k, pal.spine);
      if (k % 3 === 0) await sleep(5);
    }
  }

  const centers = events.map((ev) => {
    const p = windowToViewport(wxSpine, ev.wy, world, vp);
    return { x: p.x, y: p.y, r: 10, meta: ev };
  });

  for (const c of centers) {
    const pts = collectMidpointCirclePoints(c.x, c.y, c.r);
    for (let k = 0; k < pts.length; k++) {
      if (cancelled()) return;
      drawCirclePointsProgress(ctx, pts, k + 1, pal.node);
      if (k % 4 === 0) await sleep(3);
    }
    ctx.fillStyle = pal.label;
    ctx.font = '11px Segoe UI, sans-serif';
    ctx.fillText(c.meta.label, c.x + 14, c.y + 3);
    ctx.fillStyle = pal.labelMuted;
    ctx.font = '10px Segoe UI, sans-serif';
    ctx.fillText(c.meta.era, c.x + 14, c.y + 15);
  }

  const clipSeg = (x0, y0, x1, y1) =>
    clipLineCohenSutherland(x0, y0, x1, y1, clip.xmin, clip.ymin, clip.xmax, clip.ymax);

  for (let i = 0; i < centers.length - 1; i++) {
    const a = centers[i];
    const b = centers[i + 1];
    const cx = (a.x + b.x) / 2 + 42;
    const cy = (a.y + b.y) / 2 - 8;
    const segs = collectQuadraticBezierSegments(a.x, a.y, cx, cy, b.x, b.y, 30);
    for (const seg of segs) {
      if (cancelled()) return;
      const c0 = clipSeg(seg.x0, seg.y0, seg.x1, seg.y1);
      if (!c0) continue;
      const chordPts =
        mode === 'bresenham'
          ? collectBresenhamSteps(c0.x0, c0.y0, c0.x1, c0.y1)
          : collectDDASteps(c0.x0, c0.y0, c0.x1, c0.y1);
      for (let k = 0; k < chordPts.length; k++) {
        if (cancelled()) return;
        drawRasterLineProgress(ctx, chordPts, k, pal.curve);
        if (k % 2 === 0) await sleep(2);
      }
    }
  }

  if (!cancelled() && statusEl) {
    statusEl.textContent = `Done — ${continentId}: ${events.length} events (${mode.toUpperCase()} lines + circles + Bézier).`;
  }
}

/**
 * @param {{ canvas: HTMLCanvasElement, continentSelect: HTMLSelectElement, playBtn: HTMLElement | null, lineModeSelect: HTMLSelectElement | null, statusEl: HTMLElement | null, getEvents: (id: string) => Array<{ wy: number, label: string, era: string }> }} opts
 */
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
    if (statusEl) statusEl.textContent = 'Canvas cleared. Press “Play timeline” to animate with algorithms.';
  }

  continentSelect.addEventListener('change', onContinentChange);
  playBtn?.addEventListener('click', () => {
    play();
  });

  clearTimelineCanvas(canvas);

  return {
    cancel: () => {
      animToken += 1;
    },
    refreshClear: () => {
      animToken += 1;
      clearTimelineCanvas(canvas);
    },
  };
}
