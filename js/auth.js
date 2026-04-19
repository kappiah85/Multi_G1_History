/**
 * Shared auth helpers used by every page and the login page.
 * Storage: sessionStorage so the session ends when the tab closes.
 */

const KEY_LOGIN = 'whe_logged_in';
const KEY_USER  = 'whe_username';

export function isLoggedIn() {
  return sessionStorage.getItem(KEY_LOGIN) === 'true';
}

export function getUsername() {
  return sessionStorage.getItem(KEY_USER) || 'Explorer';
}

export function setLoggedIn(username) {
  sessionStorage.setItem(KEY_LOGIN, 'true');
  sessionStorage.setItem(KEY_USER, username.trim());
}

export function logout() {
  sessionStorage.removeItem(KEY_LOGIN);
  sessionStorage.removeItem(KEY_USER);
  window.location.replace('login.html');
}

/**
 * Call at the top of every protected page's module script.
 * The synchronous inline guard in each HTML file handles the fast redirect;
 * this provides a JS-module-level safety net.
 */
export function requireLogin() {
  if (!isLoggedIn()) {
    window.location.replace('login.html');
  }
}

/**
 * Appends a logout button (and username label) to #siteMainNav.
 * Call once per page after the DOM is ready.
 */
export function injectLogoutButton() {
  const nav = document.getElementById('siteMainNav');
  if (!nav) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'btnLogout';
  btn.className = 'btn btn--sm btn--logout';
  btn.textContent = `👤 ${getUsername()}`;
  btn.title = 'Click to log out';
  btn.setAttribute('aria-label', `Logged in as ${getUsername()}. Click to log out.`);
  btn.addEventListener('click', logout);

  nav.appendChild(btn);
}
