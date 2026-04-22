import { requireLogin, injectLogoutButton } from './auth.js';
import { initThemeSystem } from './theme.js';
import { initMobileNav } from './mobile-nav.js';

requireLogin();
import { initMapUi, initMapSatelliteToggle } from './ui-controls.js';
import { initWorldMap } from './map.js';

initMobileNav();
injectLogoutButton();

const canvas = document.getElementById('worldMapCanvas');
const ui = initMapUi();

const mapApi =
  canvas &&
  initWorldMap(canvas, {
    ui,
    lineModeSelect: null,
    statusEl: document.getElementById('mapLoadStatus'),
  });

initMapSatelliteToggle(document.getElementById('btnMapBaseToggle'), mapApi);

initThemeSystem({
  onAfterThemeApply: () => mapApi?.redrawTheme(),
});
