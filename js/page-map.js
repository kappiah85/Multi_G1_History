import { initThemeSystem } from './theme.js';
import { initMobileNav } from './mobile-nav.js';
import { initMapUi } from './ui-controls.js';
import { initWorldMap } from './map.js';

initMobileNav();

const canvas = document.getElementById('worldMapCanvas');
const ui = initMapUi();

const mapApi =
  canvas &&
  initWorldMap(canvas, {
    ui,
    lineModeSelect: document.getElementById('mapLineMode'),
    statusEl: document.getElementById('mapLoadStatus'),
  });

initThemeSystem({
  onAfterThemeApply: () => mapApi?.redrawTheme(),
});
