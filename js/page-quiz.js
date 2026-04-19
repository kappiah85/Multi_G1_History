import { requireLogin, injectLogoutButton } from './auth.js';
import { initThemeSystem } from './theme.js';
import { initMobileNav } from './mobile-nav.js';

requireLogin();
import { preloadQuizSounds } from './multimedia.js';
import { initQuizSoundToggle } from './ui-controls.js';
import { CONTINENTS, getQuizPool } from './data.js';
import { buildQuizForm, pickRandomQuestions } from './quiz.js';

function initWorldQuizHub() {
  const scope = document.getElementById('worldQuizScope');
  const area = document.getElementById('worldQuizArea');
  const start = document.getElementById('worldQuizStart');
  if (!scope || !area || !start) return;

  for (const c of CONTINENTS) {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.label;
    scope.appendChild(opt);
  }

  start.addEventListener('click', () => {
    const filterId = scope.value || null;
    const pool = getQuizPool(filterId);
    if (!pool.length) return;

    const picked = pickRandomQuestions(pool, 5);
    const questions = picked.map((q) => ({
      q: filterId ? q.q : `[${q.continentLabel}] ${q.q}`,
      options: q.options,
      correct: q.correct,
    }));

    area.innerHTML = '';
    const prefix = `world-${Date.now().toString(36)}`;
    area.appendChild(buildQuizForm(questions, prefix));
    area.hidden = false;
  });
}

initMobileNav();
injectLogoutButton();
preloadQuizSounds();
initQuizSoundToggle(document.getElementById('btnQuizSoundToggle'));
initWorldQuizHub();
initThemeSystem({});
