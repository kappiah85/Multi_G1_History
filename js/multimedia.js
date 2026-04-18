/**
 * Quiz sound feedback: preload short WAV clips (generated in-memory) and play via HTML5 Audio.
 * No external asset files — avoids CORS/hosting issues while keeping latency low.
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
