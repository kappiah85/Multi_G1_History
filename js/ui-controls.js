/**
 * Map page UI: country detail panel, load status, optional narration toggle.
 * Keeps DOM updates separate from map rendering (map.js).
 *
 * Quiz page: sound on/off toggle (preference in localStorage via multimedia.js).
 */

import { getFactsForCountry, getNarrationLine } from './mapCountryFacts.js';
import {
  getQuizSoundsEnabled,
  setQuizSoundsEnabled,
  stopContinentNarration,
  pauseContinentNarration,
  resumeContinentNarration,
  speakContinentNarrationFromData,
  getContinentNarratorAuto,
  setContinentNarratorAuto,
  setContinentNarrationUiCallback,
  isContinentNarrationPaused,
} from './multimedia.js';

/** Wire the side panel and status line for the 2D world map page. */
export function initMapUi() {
  const panel = document.getElementById('mapCountryPanel');
  const titleEl = document.getElementById('mapCountryTitle');
  const factsEl = document.getElementById('mapCountryFacts');
  const closeBtn = document.getElementById('mapCountryPanelClose');
  const narrateCheck = document.getElementById('mapNarrateToggle');

  function shouldSpeak() {
    return narrateCheck?.checked === true && typeof window.speechSynthesis !== 'undefined';
  }

  function speakLine(text) {
    if (!shouldSpeak() || !text) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.95;
      window.speechSynthesis.speak(u);
    } catch {
      /* ignore */
    }
  }

  function showCountryForFeature(props) {
    const adm0 = props.adm0A3 || '';
    const adminName = props.adminName || props.name || adm0;
    const { displayName, facts } = getFactsForCountry(adm0, adminName);

    if (titleEl) titleEl.textContent = displayName;
    if (factsEl) {
      factsEl.innerHTML = '';
      for (const line of facts) {
        const li = document.createElement('li');
        li.textContent = line;
        factsEl.appendChild(li);
      }
    }
    if (panel) {
      panel.hidden = false;
      panel.classList.add('map-country-panel--open');
      document.body.classList.add('map-panel-open');
    }

    speakLine(getNarrationLine(adm0, adminName));
  }

  function clearPanel() {
    if (panel) {
      panel.classList.remove('map-country-panel--open');
      panel.hidden = true;
      document.body.classList.remove('map-panel-open');
    }
    if (factsEl) factsEl.innerHTML = '';
    if (titleEl) titleEl.textContent = '';
    window.speechSynthesis?.cancel();
  }

  function setStatus(text) {
    const el = document.getElementById('mapLoadStatus');
    if (el) el.textContent = text;
  }

  closeBtn?.addEventListener('click', () => {
    clearPanel();
    window.dispatchEvent(new CustomEvent('map:closePanel'));
  });

  return {
    showCountryForFeature,
    clearPanel,
    setStatus,
    shouldSpeak,
    speakLine,
  };
}

/** Wire quiz “Sound on / Sound off” control (quiz.html). */
export function initQuizSoundToggle(button) {
  if (!button) return;

  function sync() {
    const on = getQuizSoundsEnabled();
    button.setAttribute('aria-pressed', String(on));
    button.textContent = on ? 'Sound on' : 'Sound off';
    button.setAttribute('aria-label', on ? 'Turn quiz sound effects off' : 'Turn quiz sound effects on');
  }

  sync();
  button.addEventListener('click', () => {
    setQuizSoundsEnabled(!getQuizSoundsEnabled());
    sync();
  });
}

/**
 * Explore Map: toggle flat “map” ocean vs satellite imagery base (see map.js `setBaseLayerSatellite`).
 * @param {HTMLButtonElement | null} button
 * @param {{ getBaseLayerSatellite?: () => boolean, setBaseLayerSatellite?: (on: boolean) => void } | null | undefined} mapApi
 */
export function initMapSatelliteToggle(button, mapApi) {
  if (!button || !mapApi?.getBaseLayerSatellite || !mapApi?.setBaseLayerSatellite) return;

  function sync() {
    const sat = !!mapApi.getBaseLayerSatellite();
    button.setAttribute('aria-pressed', String(sat));
    button.textContent = sat ? 'Satellite view (on)' : 'Map view (on)';
  }

  sync();
  button.addEventListener('click', () => {
    mapApi.setBaseLayerSatellite(!mapApi.getBaseLayerSatellite());
    sync();
  });
}

/* --- Globe (index) continent panel: MP3 narration + TTS fallback (logic in multimedia.js) --- */

const NARRATION_BTN_PLAY = '▶ Play narration';
const NARRATION_BTN_RESUME = '▶ Resume narration';
const NARRATION_BTN_PAUSE = '⏸ Pause';
const NARRATION_BTN_STOP = '⏹ Stop';

/**
 * Wires Narrator auto toggle and Play / Pause / Stop for the globe info panel.
 * Audio load + playback triggers live in `multimedia.js`; selection triggers in `app.js` `openPanel`.
 * @param {() => object | null} getLastContinentPayload last opened continent row (same shape as `CONTINENTS` entries)
 */
export function initGlobeNarrationPanel(getLastContinentPayload) {
  function syncNarrationButtons(phase) {
    const play = document.getElementById('panelNarrationPlay');
    const pause = document.getElementById('panelNarrationPause');
    const stopB = document.getElementById('panelNarrationStop');
    if (!play || !pause || !stopB) return;
    const payload = getLastContinentPayload();
    if (phase === 'speaking') {
      play.disabled = false;
      play.textContent = NARRATION_BTN_PLAY;
      pause.disabled = false;
      pause.textContent = NARRATION_BTN_PAUSE;
      stopB.disabled = false;
      stopB.textContent = NARRATION_BTN_STOP;
    } else if (phase === 'paused') {
      play.disabled = false;
      play.textContent = NARRATION_BTN_RESUME;
      pause.disabled = true;
      pause.textContent = NARRATION_BTN_PAUSE;
      stopB.disabled = false;
      stopB.textContent = NARRATION_BTN_STOP;
    } else {
      play.disabled = !payload;
      play.textContent = NARRATION_BTN_PLAY;
      pause.disabled = true;
      pause.textContent = NARRATION_BTN_PAUSE;
      stopB.disabled = false;
      stopB.textContent = NARRATION_BTN_STOP;
    }
  }

  const auto = document.getElementById('panelNarratorAuto');
  const play = document.getElementById('panelNarrationPlay');
  const pause = document.getElementById('panelNarrationPause');
  const stopB = document.getElementById('panelNarrationStop');
  if (!auto || !play || !pause || !stopB) return;

  setContinentNarrationUiCallback(syncNarrationButtons);
  auto.checked = getContinentNarratorAuto();
  auto.addEventListener('change', () => setContinentNarratorAuto(auto.checked));

  play.addEventListener('click', () => {
    if (isContinentNarrationPaused()) {
      resumeContinentNarration();
      return;
    }
    const payload = getLastContinentPayload();
    if (payload) speakContinentNarrationFromData(payload);
  });
  pause.addEventListener('click', () => pauseContinentNarration());
  stopB.addEventListener('click', () => stopContinentNarration());
  syncNarrationButtons('idle');
}
