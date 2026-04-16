/**
 * Map page UI: country detail panel, load status, optional narration toggle.
 * Keeps DOM updates separate from map rendering (map.js).
 */

import { getFactsForCountry, getNarrationLine } from './mapCountryFacts.js';

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
