import { initThemeSystem, isLightTheme } from './theme.js';
import {
  runAlgorithmDemo,
  getAlgorithmLegendItems,
  ALGO_PALETTE_DARK,
  ALGO_PALETTE_LIGHT,
} from './algorithms.js';

function refreshAlgorithmCanvas() {
  const canvas = document.getElementById('algoCanvas');
  if (!canvas) return;
  const palette = isLightTheme() ? ALGO_PALETTE_LIGHT : ALGO_PALETTE_DARK;
  runAlgorithmDemo(canvas, palette);
}

function refreshAlgorithmLegend() {
  const legend = document.getElementById('algoLegend');
  if (!legend) return;
  legend.innerHTML = '';
  for (const item of getAlgorithmLegendItems()) {
    const li = document.createElement('li');
    li.textContent = item;
    legend.appendChild(li);
  }
}

function initAlgorithmsUI() {
  refreshAlgorithmCanvas();
  refreshAlgorithmLegend();
}

initAlgorithmsUI();
initThemeSystem({
  onAfterThemeApply: () => {
    refreshAlgorithmCanvas();
    refreshAlgorithmLegend();
  },
});

const canvas = document.getElementById('algoCanvas');
const wrap = canvas?.closest('.algo-section');
if (canvas && wrap) {
  const ro = new ResizeObserver(() => {
    requestAnimationFrame(() => {
      refreshAlgorithmCanvas();
    });
  });
  ro.observe(wrap);
}
