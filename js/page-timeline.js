import { initThemeSystem } from './theme.js';
import { initMobileNav } from './mobile-nav.js';
import { CONTINENTS, CONTINENT_TIMELINES } from './data.js';
import { initContinentTimelinePanel } from './continentTimeline.js';

initMobileNav();

const continentSelect = document.getElementById('continentTimelineSelect');
if (continentSelect) {
  for (const c of CONTINENTS) {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.label;
    continentSelect.appendChild(opt);
  }
}

const timelinePanelApi = initContinentTimelinePanel({
  canvas: document.getElementById('continentTimelineCanvas'),
  continentSelect,
  playBtn: document.getElementById('btnContinentTimelinePlay'),
  lineModeSelect: document.getElementById('continentLineMode'),
  statusEl: document.getElementById('continentTimelineStatus'),
  getEvents: (id) => CONTINENT_TIMELINES[id] || [],
});

initThemeSystem({ timelinePanelApi });
