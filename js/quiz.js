/**
 * Quiz UI: one question at a time, immediate feedback, optional reveal, sound via multimedia.js.
 */

import { playQuizAnswerSound } from './multimedia.js';

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Build a step-by-step quiz: one MCQ visible; correct → confirm + sound + next; wrong → retry and/or show answer.
 *
 * @param {{ q: string, options: string[], correct: number }[]} questions
 * @param {string} namePrefix unique per render (e.g. continent id + 'panel')
 */
export function buildQuizForm(questions, namePrefix) {
  const wrap = document.createElement('div');
  wrap.className = 'quiz-form quiz-form--sequential';

  /* Visual progress bar */
  const progressBar = document.createElement('div');
  progressBar.className = 'quiz-progress';
  progressBar.setAttribute('role', 'progressbar');
  progressBar.setAttribute('aria-valuemin', '0');
  progressBar.setAttribute('aria-valuemax', String(questions.length));
  progressBar.setAttribute('aria-valuenow', '1');
  const progressFill = document.createElement('div');
  progressFill.className = 'quiz-progress__fill';
  progressBar.appendChild(progressFill);

  const progress = document.createElement('p');
  progress.className = 'quiz-step-progress';
  progress.setAttribute('aria-live', 'polite');

  const card = document.createElement('div');
  card.className = 'quiz-step-card';

  const feedback = document.createElement('p');
  feedback.className = 'quiz-step-feedback';
  feedback.setAttribute('role', 'status');
  feedback.hidden = true;

  const actionsRow = document.createElement('div');
  actionsRow.className = 'quiz-actions quiz-actions--sequential';

  const revealBtn = document.createElement('button');
  revealBtn.type = 'button';
  revealBtn.className = 'btn';
  revealBtn.textContent = 'Show answer';
  revealBtn.hidden = true;

  const nextAfterRevealBtn = document.createElement('button');
  nextAfterRevealBtn.type = 'button';
  nextAfterRevealBtn.className = 'btn btn--primary';
  nextAfterRevealBtn.textContent = 'Next question';
  nextAfterRevealBtn.hidden = true;

  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'btn';
  reset.textContent = 'Start over';

  const summary = document.createElement('p');
  summary.className = 'quiz-result';
  summary.setAttribute('role', 'status');
  summary.hidden = true;

  wrap.appendChild(progressBar);
  wrap.appendChild(progress);
  wrap.appendChild(card);
  wrap.appendChild(feedback);
  wrap.appendChild(actionsRow);
  actionsRow.appendChild(revealBtn);
  actionsRow.appendChild(nextAfterRevealBtn);
  actionsRow.appendChild(reset);

  wrap.appendChild(summary);

  let index = 0;
  let correctCount = 0;
  /** Block new picks while auto-advancing after correct, or after reveal until Next. */
  let locked = false;
  let revealed = false;
  let advanceTimer = /** @type {ReturnType<typeof setTimeout> | null} */ (null);

  function clearAdvanceTimer() {
    if (advanceTimer) {
      clearTimeout(advanceTimer);
      advanceTimer = null;
    }
  }

  function setFeedback(text, variant) {
    feedback.hidden = false;
    feedback.textContent = text;
    feedback.classList.remove('is-correct', 'is-incorrect', 'is-neutral');
    if (variant === 'correct') feedback.classList.add('is-correct');
    else if (variant === 'incorrect') feedback.classList.add('is-incorrect');
    else feedback.classList.add('is-neutral');
  }

  function clearRadiosInCard() {
    card.querySelectorAll('input[type="radio"]').forEach((r) => {
      r.checked = false;
    });
    card.querySelectorAll('.quiz-opt').forEach((lab) => {
      lab.classList.remove('quiz-opt--correct', 'quiz-opt--wrong');
    });
  }

  function disableRadiosInCard(disable) {
    card.querySelectorAll('input[type="radio"]').forEach((r) => {
      r.disabled = disable;
    });
  }

  function showSummary() {
    clearAdvanceTimer();
    progress.textContent = 'Quiz complete';
    progressFill.style.width = '100%';
    progressBar.setAttribute('aria-valuenow', String(questions.length));
    card.innerHTML = '';
    revealBtn.hidden = true;
    nextAfterRevealBtn.hidden = true;
    locked = true;
    summary.hidden = false;
    summary.textContent = `Score: ${correctCount} / ${questions.length} correct.`;
  }

  function goNext() {
    clearAdvanceTimer();
    revealed = false;
    locked = false;
    revealBtn.hidden = true;
    nextAfterRevealBtn.hidden = true;
    feedback.hidden = true;
    feedback.textContent = '';
    feedback.classList.remove('is-correct', 'is-incorrect', 'is-neutral');

    index += 1;
    if (index >= questions.length) {
      showSummary();
    } else {
      renderQuestion();
    }
  }

  function renderQuestion() {
    clearAdvanceTimer();
    clearRadiosInCard();
    locked = false;
    revealed = false;
    revealBtn.hidden = true;
    nextAfterRevealBtn.hidden = true;
    feedback.hidden = true;
    feedback.textContent = '';
    feedback.classList.remove('is-correct', 'is-incorrect', 'is-neutral');
    summary.hidden = true;
    disableRadiosInCard(false);

    const item = questions[index];
    progress.textContent = `Question ${index + 1} of ${questions.length}`;
    const pct = ((index + 1) / questions.length) * 100;
    progressFill.style.width = `${pct}%`;
    progressBar.setAttribute('aria-valuenow', String(index + 1));

    card.innerHTML = '';
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'quiz-q';
    const leg = document.createElement('legend');
    leg.className = 'quiz-q__legend';
    leg.textContent = item.q;
    fieldset.appendChild(leg);

    const opts = document.createElement('div');
    opts.className = 'quiz-q__opts';
    const groupName = `${namePrefix}-q${index}`;

    item.options.forEach((label, oi) => {
      const id = `${groupName}-o${oi}`;
      const row = document.createElement('label');
      row.className = 'quiz-opt';
      row.htmlFor = id;
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = groupName;
      input.value = String(oi);
      input.id = id;

      input.addEventListener('change', () => {
        if (locked) return;
        const selected = parseInt(input.value, 10);

        if (selected === item.correct) {
          // Correct: sound + short praise, then advance (no next until resolved).
          playQuizAnswerSound(true);
          setFeedback('Correct! ✅', 'correct');
          correctCount += 1;
          locked = true;
          disableRadiosInCard(true);
          revealBtn.hidden = true;
          clearAdvanceTimer();
          advanceTimer = setTimeout(() => {
            advanceTimer = null;
            goNext();
          }, 850);
        } else {
          // Incorrect: sound + retry; stay on this question until correct or reveal → Next.
          playQuizAnswerSound(false);
          setFeedback('Incorrect ❌ Try again.', 'incorrect');
          revealBtn.hidden = false;
          queueMicrotask(() => clearRadiosInCard());
        }
      });

      const span = document.createElement('span');
      span.textContent = label;
      row.appendChild(input);
      row.appendChild(span);
      opts.appendChild(row);
    });

    fieldset.appendChild(opts);
    card.appendChild(fieldset);
  }

  revealBtn.addEventListener('click', () => {
    const item = questions[index];
    revealed = true;
    setFeedback(`The correct answer is: ${item.options[item.correct]}`, 'neutral');
    card.querySelectorAll('.quiz-opt').forEach((lab, labIdx) => {
      lab.classList.remove('quiz-opt--correct', 'quiz-opt--wrong');
      if (labIdx === item.correct) lab.classList.add('quiz-opt--correct');
    });
    disableRadiosInCard(true);
    revealBtn.hidden = true;
    nextAfterRevealBtn.hidden = false;
    locked = true;
  });

  nextAfterRevealBtn.addEventListener('click', () => {
    if (!revealed) return;
    goNext();
  });

  reset.addEventListener('click', () => {
    clearAdvanceTimer();
    index = 0;
    correctCount = 0;
    locked = false;
    revealed = false;
    summary.hidden = true;
    renderQuestion();
  });

  renderQuestion();
  return wrap;
}

export function pickRandomQuestions(pool, count) {
  const copy = [...pool];
  shuffleInPlace(copy);
  return copy.slice(0, Math.min(count, copy.length));
}
