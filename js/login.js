/**
 * Login page logic.
 * - Redirects already-logged-in users straight to the app.
 * - Validates the form, stores the session, shows a welcome overlay, then navigates.
 */

import { isLoggedIn, setLoggedIn } from './auth.js';

/* Already authenticated → skip login */
if (isLoggedIn()) {
  window.location.replace('index.html');
}

const form          = document.getElementById('loginForm');
const usernameInput = document.getElementById('loginUsername');
const passwordInput = document.getElementById('loginPassword');
const errorEl       = document.getElementById('loginError');
const welcomeOverlay = document.getElementById('loginWelcome');
const welcomeTitle   = document.getElementById('loginWelcomeTitle');
const submitBtn      = document.getElementById('loginSubmit');

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
}

function hideError() {
  errorEl.hidden = true;
  errorEl.textContent = '';
}

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  hideError();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username && !password) {
    showError('Please enter your username and password.');
    usernameInput.focus();
    return;
  }
  if (!username) {
    showError('Username cannot be empty.');
    usernameInput.focus();
    return;
  }
  if (!password) {
    showError('Password cannot be empty.');
    passwordInput.focus();
    return;
  }

  /* Store session */
  setLoggedIn(username);

  /* Disable form while transitioning */
  if (submitBtn) submitBtn.disabled = true;

  /* Show personalised welcome overlay */
  if (welcomeTitle) welcomeTitle.textContent = `Welcome, ${username}!`;
  if (welcomeOverlay) welcomeOverlay.hidden = false;

  /* Redirect after the welcome animation plays */
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1800);
});

/* Clear error as soon as the user starts typing again */
[usernameInput, passwordInput].forEach((el) => {
  el?.addEventListener('input', hideError);
});
