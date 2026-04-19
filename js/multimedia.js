/**
 * Multimedia helpers:
 * - Quiz: short WAV clips via HTML5 Audio (preload).
 * - Continent panel: optional `narrations/*.mp3` human voice, else Web Speech fallback (no overlap).
 */

const STORAGE_KEY = 'whe-quiz-sounds-enabled';
const SAMPLE_RATE = 22050;
/** Moderate, consistent perceived loudness (browser applies system volume on top). */
const QUIZ_VOLUME = 0.34;

let audioCorrect = /** @type {HTMLAudioElement | null} */ (null);
let audioWrong = /** @type {HTMLAudioElement | null} */ (null);
let blobUrlCorrect = /** @type {string | null} */ (null);
let blobUrlWrong = /** @type {string | null} */ (null);
let preloadDone = false;

export function getQuizSoundsEnabled() {
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === null) return true;
  return v !== '0';
}

export function setQuizSoundsEnabled(on) {
  localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
}

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

/** @param {Int16Array} samples */
function int16ToWavBuffer(samples) {
  const bitsPerSample = 16;
  const blockAlign = 2;
  const byteRate = SAMPLE_RATE * blockAlign;
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++, off += 2) {
    view.setInt16(off, samples[i], true);
  }
  return buffer;
}

/** Short sine burst with Hann envelope (pleasant “ding”). */
function makeSine(freqHz, durationMs, amplitude = 0.26) {
  const n = Math.floor(SAMPLE_RATE * (durationMs / 1000));
  const out = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    const env = 0.5 * (1 - Math.cos((2 * Math.PI * i) / Math.max(1, n - 1)));
    const s =
      Math.sin((2 * Math.PI * freqHz * i) / SAMPLE_RATE) * amplitude * 0x7fff * env;
    out[i] = Math.max(-32768, Math.min(32767, Math.round(s)));
  }
  return out;
}

function silenceMs(ms) {
  const n = Math.floor(SAMPLE_RATE * (ms / 1000));
  return new Int16Array(n);
}

function concatInt16(...parts) {
  let len = 0;
  for (const p of parts) len += p.length;
  const out = new Int16Array(len);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/** Two-tone chime: correct answer feedback. */
function buildCorrectSamples() {
  return concatInt16(makeSine(880, 52, 0.24), silenceMs(18), makeSine(1174, 72, 0.2));
}

/** Low short tone: incorrect answer feedback (non-harsh). */
function buildWrongSamples() {
  return makeSine(196, 135, 0.3);
}

function revokeIf(url) {
  if (url) URL.revokeObjectURL(url);
}

/** Create / refresh Audio elements and `preload` buffers (call once on quiz page load). */
export function preloadQuizSounds() {
  if (preloadDone) return;
  revokeIf(blobUrlCorrect);
  revokeIf(blobUrlWrong);

  const bufOk = int16ToWavBuffer(buildCorrectSamples());
  const bufBad = int16ToWavBuffer(buildWrongSamples());
  blobUrlCorrect = URL.createObjectURL(new Blob([bufOk], { type: 'audio/wav' }));
  blobUrlWrong = URL.createObjectURL(new Blob([bufBad], { type: 'audio/wav' }));

  audioCorrect = new Audio(blobUrlCorrect);
  audioWrong = new Audio(blobUrlWrong);
  audioCorrect.preload = 'auto';
  audioWrong.preload = 'auto';
  audioCorrect.volume = QUIZ_VOLUME;
  audioWrong.volume = QUIZ_VOLUME;
  audioCorrect.load();
  audioWrong.load();
  preloadDone = true;
}

/** Stop any quiz SFX so a new answer never stacks on the previous clip. */
function stopQuizAnswerSounds() {
  for (const a of [audioCorrect, audioWrong]) {
    if (!a) continue;
    a.pause();
    a.currentTime = 0;
  }
}

/**
 * Play feedback for the option the learner just chose.
 * Triggered from quiz UI when a radio `change` fires (see quiz.js).
 */
export function playQuizAnswerSound(isCorrect) {
  if (!getQuizSoundsEnabled() || !preloadDone) return;
  stopQuizAnswerSounds();
  const clip = isCorrect ? audioCorrect : audioWrong;
  if (!clip) return;
  clip.currentTime = 0;
  clip.play().catch(() => {
    /* Autoplay policy or missing decode — ignore */
  });
}

/* -------------------------------------------------------------------------- */
/* Continent info panel — pre-recorded MP3 in /narrations/ + TTS fallback       */
/* -------------------------------------------------------------------------- */

const NARRATOR_AUTO_KEY = 'whe-continent-narrator-auto';

/** Relative to site root (served beside index.html). */
const NARRATION_FOLDER = 'narrations';

/** Map app continent `id` → MP3 filename stem (see /narrations/INFO.txt). */
const NARRATION_STEM_BY_CONTINENT_ID = {
  africa: 'africa',
  europe: 'europe',
  asia: 'asia',
  northAmerica: 'north_america',
  southAmerica: 'south_america',
  australia: 'australia',
  antarctica: 'antarctica',
};

/** @typedef {{ id?: string, label: string, overview: string, stats?: [string, string][], highlights?: { when: string, title: string, text: string }[] }} ContinentNarrationShape */

export function getContinentNarratorAuto() {
  return localStorage.getItem(NARRATOR_AUTO_KEY) === '1';
}

export function setContinentNarratorAuto(on) {
  localStorage.setItem(NARRATOR_AUTO_KEY, on ? '1' : '0');
}

/** @type {((phase: 'idle' | 'speaking' | 'paused') => void) | null} */
let continentNarrationUiCallback = null;

/** Lets the globe panel sync Play / Pause button states. */
export function setContinentNarrationUiCallback(fn) {
  continentNarrationUiCallback = fn;
}

function notifyContinentNarration(phase) {
  continentNarrationUiCallback?.(phase);
}

/** Reusable HTML5 element for continent MP3s (only one clip at a time). */
let continentNarrationAudioEl = /** @type {HTMLAudioElement | null} */ (null);
/** True while the current clip is expected to be file-based (not TTS). */
let continentNarrationUsingFile = false;

function ensureContinentNarrationAudio() {
  if (!continentNarrationAudioEl) {
    continentNarrationAudioEl = new Audio();
    continentNarrationAudioEl.preload = 'auto';
    continentNarrationAudioEl.volume = 1;
  }
  return continentNarrationAudioEl;
}

/** Stops MP3 playback and clears the element (no notify). */
function stopContinentNarrationFile() {
  continentNarrationUsingFile = false;
  const el = continentNarrationAudioEl;
  if (!el) return;
  el.onended = null;
  el.onerror = null;
  el.onplay = null;
  el.onpause = null;
  el.pause();
  el.currentTime = 0;
  el.removeAttribute('src');
  try {
    el.load();
  } catch {
    /* ignore */
  }
}

/** Build a concise script for TTS fallback (educational, not the full long page). */
export function buildContinentNarrationText(/** @type {ContinentNarrationShape} */ data) {
  if (!data) return '';
  const chunks = [];
  chunks.push(`${data.label}.`);
  let ov = (data.overview || '').replace(/\s+/g, ' ').trim();
  if (ov.length > 520) ov = `${ov.slice(0, 517)}…`;
  chunks.push(ov);
  for (const [k, v] of (data.stats || []).slice(0, 5)) {
    chunks.push(`${k}: ${v}.`);
  }
  for (const ev of (data.highlights || []).slice(0, 3)) {
    const bit = (ev.text || '').replace(/\s+/g, ' ').trim();
    const short = bit.length > 160 ? `${bit.slice(0, 157)}…` : bit;
    chunks.push(`${ev.when}. ${ev.title}. ${short}`);
  }
  return chunks.join(' ');
}

/** Stop MP3 + cancel any speech; call when switching continents or closing the panel. */
export function stopContinentNarration() {
  stopContinentNarrationFile();
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
  notifyContinentNarration('idle');
}

export function pauseContinentNarration() {
  if (continentNarrationUsingFile && continentNarrationAudioEl) {
    continentNarrationAudioEl.pause();
    notifyContinentNarration('paused');
    return;
  }
  try {
    window.speechSynthesis?.pause();
    notifyContinentNarration('paused');
  } catch {
    /* ignore */
  }
}

export function resumeContinentNarration() {
  if (continentNarrationUsingFile && continentNarrationAudioEl) {
    continentNarrationAudioEl
      .play()
      .then(() => notifyContinentNarration('speaking'))
      .catch(() => notifyContinentNarration('idle'));
    return;
  }
  try {
    window.speechSynthesis?.resume();
    notifyContinentNarration('speaking');
  } catch {
    /* ignore */
  }
}

export function isContinentNarrationPaused() {
  if (continentNarrationUsingFile && continentNarrationAudioEl) {
    const a = continentNarrationAudioEl;
    return a.paused && !a.ended && !!a.src && a.currentTime > 0;
  }
  const s = window.speechSynthesis;
  return !!(s && s.speaking && s.paused);
}

/** Prefer voices that usually sound more natural (varies by OS/browser). */
let cachedNarrationVoice = /** @type {SpeechSynthesisVoice | null} */ (null);
let narrationVoicesListenerAttached = false;

function narrVoiceScore(/** @type {SpeechSynthesisVoice} */ v) {
  const n = (v.name || '').toLowerCase();
  let s = 0;
  if (/google uk english|google us english|google english/i.test(n)) s += 22;
  if (/premium|natural|neural|enhanced|wavenet/i.test(n)) s += 18;
  if (/google/i.test(n) && /english/i.test(n)) s += 14;
  if (/siri|samantha|daniel|karen|moira|fiona|aaron|thomas|serena|victoria|alex/i.test(n)) s += 8;
  if (v.localService) s += 1;
  if (/microsoft\s+(david|zira|mark|hazel|susan)/i.test(n) && !/natural|neural/i.test(n)) s -= 10;
  if (/compact|basic|legacy/i.test(n)) s -= 6;
  return s;
}

function pickNarrationVoice() {
  const syn = window.speechSynthesis;
  if (!syn) return null;
  const voices = syn.getVoices();
  if (!voices.length) return null;
  const en = voices.filter((v) => /^en(-|$)/i.test((v.lang || '').trim()));
  const pool = en.length ? en : voices;
  const sorted = [...pool].sort((a, b) => narrVoiceScore(b) - narrVoiceScore(a));
  return sorted[0] || null;
}

function ensureNarrationVoicesListener() {
  if (narrationVoicesListenerAttached) return;
  const syn = window.speechSynthesis;
  if (!syn) return;
  narrationVoicesListenerAttached = true;
  const refresh = () => {
    const next = pickNarrationVoice();
    if (next) cachedNarrationVoice = next;
  };
  syn.addEventListener('voiceschanged', refresh);
  refresh();
}

/**
 * TTS fallback when no MP3 mapping, load error, or decode failure.
 * (Playback trigger for file path is `tryPlayContinentNarrationFile` below.)
 */
function speakContinentNarrationTtsOnly(/** @type {ContinentNarrationShape} */ data) {
  continentNarrationUsingFile = false;
  const syn = window.speechSynthesis;
  if (!syn || !data) {
    notifyContinentNarration('idle');
    return;
  }

  const text = buildContinentNarrationText(data);
  if (!text) {
    notifyContinentNarration('idle');
    return;
  }

  ensureNarrationVoicesListener();
  if (!cachedNarrationVoice) cachedNarrationVoice = pickNarrationVoice();

  const u = new SpeechSynthesisUtterance(text);
  if (cachedNarrationVoice) {
    u.voice = cachedNarrationVoice;
    u.lang = cachedNarrationVoice.lang || 'en-US';
  } else {
    u.lang = 'en-US';
  }
  u.rate = 0.87;
  u.pitch = 1.08;
  u.volume = 1;
  u.onend = () => notifyContinentNarration('idle');
  u.onerror = () => notifyContinentNarration('idle');

  syn.speak(u);
  notifyContinentNarration('speaking');
}

/**
 * Load `narrations/{stem}.mp3` (HTML5 Audio). On success plays; on error falls back to TTS.
 * Audio is loaded here — `src` set relative to current page origin.
 */
function tryPlayContinentNarrationFile(/** @type {ContinentNarrationShape} */ data, stem) {
  const el = ensureContinentNarrationAudio();
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
  stopContinentNarrationFile();

  const url = `${NARRATION_FOLDER}/${stem}.mp3`;
  el.src = url;
  continentNarrationUsingFile = true;

  el.onplay = () => notifyContinentNarration('speaking');
  el.onended = () => {
    continentNarrationUsingFile = false;
    notifyContinentNarration('idle');
  };
  el.onerror = () => {
    continentNarrationUsingFile = false;
    stopContinentNarrationFile();
    speakContinentNarrationTtsOnly(data);
  };
  el.onpause = () => {
    if (!el.ended && el.currentTime > 0) notifyContinentNarration('paused');
  };

  el.play().catch(() => {
    continentNarrationUsingFile = false;
    stopContinentNarrationFile();
    speakContinentNarrationTtsOnly(data);
  });
}

/**
 * Entry: stop any prior clip, then prefer MP3 for this continent id, else TTS.
 * Triggered from globe panel (see app.js) when user presses Play or auto-narrator is on.
 */
export function speakContinentNarrationFromData(/** @type {ContinentNarrationShape} */ data) {
  stopContinentNarration();
  if (!data) return;

  const id = data.id;
  const stem = id ? NARRATION_STEM_BY_CONTINENT_ID[id] : undefined;
  if (stem) {
    tryPlayContinentNarrationFile(data, stem);
    return;
  }

  speakContinentNarrationTtsOnly(data);
}
