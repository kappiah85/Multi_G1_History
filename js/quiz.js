/**
 * Shared quiz UI: radio groups, scoring, and feedback for panel + world quiz hub.
 */

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * @param {{ q: string, options: string[], correct: number }[]} questions
 * @param {string} namePrefix unique per render (e.g. continent id + 'panel')
 */
export function buildQuizForm(questions, namePrefix) {
  const wrap = document.createElement('div');
  wrap.className = 'quiz-form';

  questions.forEach((item, qi) => {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'quiz-q';
    const leg = document.createElement('legend');
    leg.className = 'quiz-q__legend';
    leg.textContent = `${qi + 1}. ${item.q}`;
    fieldset.appendChild(leg);

    const opts = document.createElement('div');
    opts.className = 'quiz-q__opts';
    const groupName = `${namePrefix}-q${qi}`;
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
      const span = document.createElement('span');
      span.textContent = label;
      row.appendChild(input);
      row.appendChild(span);
      opts.appendChild(row);
    });
    fieldset.appendChild(opts);
    wrap.appendChild(fieldset);
  });

  const actions = document.createElement('div');
  actions.className = 'quiz-actions';
  const check = document.createElement('button');
  check.type = 'button';
  check.className = 'btn btn--primary';
  check.textContent = 'Check answers';
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'btn';
  reset.textContent = 'Reset';
  actions.appendChild(check);
  actions.appendChild(reset);
  wrap.appendChild(actions);

  const result = document.createElement('p');
  result.className = 'quiz-result';
  result.setAttribute('role', 'status');
  result.hidden = true;
  wrap.appendChild(result);

  check.addEventListener('click', () => {
    let correct = 0;
    questions.forEach((item, qi) => {
      const groupName = `${namePrefix}-q${qi}`;
      const picked = wrap.querySelector(`input[name="${groupName}"]:checked`);
      const fieldset = wrap.querySelectorAll('fieldset.quiz-q')[qi];
      fieldset?.querySelectorAll('.quiz-opt').forEach((lab, oi) => {
        lab.classList.remove('quiz-opt--correct', 'quiz-opt--wrong', 'quiz-opt--missed');
        if (oi === item.correct) lab.classList.add('quiz-opt--correct');
      });
      if (picked) {
        const idx = parseInt(picked.value, 10);
        if (idx === item.correct) {
          correct += 1;
        } else {
          const wrongLab = fieldset?.querySelector(`label[for="${groupName}-o${idx}"]`);
          wrongLab?.classList.add('quiz-opt--wrong');
        }
      } else {
        fieldset?.classList.add('quiz-q--skipped');
      }
    });
    result.hidden = false;
    result.textContent = `Score: ${correct} / ${questions.length} correct.`;
  });

  reset.addEventListener('click', () => {
    wrap.querySelectorAll('input[type="radio"]').forEach((i) => {
      i.checked = false;
    });
    wrap.querySelectorAll('.quiz-opt').forEach((lab) => {
      lab.classList.remove('quiz-opt--correct', 'quiz-opt--wrong', 'quiz-opt--missed');
    });
    wrap.querySelectorAll('fieldset.quiz-q').forEach((fs) => fs.classList.remove('quiz-q--skipped'));
    result.hidden = true;
    result.textContent = '';
  });

  return wrap;
}

export function pickRandomQuestions(pool, count) {
  const copy = [...pool];
  shuffleInPlace(copy);
  return copy.slice(0, Math.min(count, copy.length));
}
