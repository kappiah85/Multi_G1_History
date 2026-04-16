/**
 * Mobile / narrow view: hamburger toggles slide-in sheet with toolbar + page links.
 * Desktop: toggle hidden; nav stays in normal flow (see styles.css).
 */

const MOBILE_MQ = window.matchMedia('(max-width: 768px)');

function isMobileNavLayout() {
  return MOBILE_MQ.matches;
}

function setMobileNavOpen(open) {
  const backdrop = document.getElementById('mobileNavBackdrop');
  const toggle = document.getElementById('btnMobileNavToggle');

  if (!isMobileNavLayout()) {
    document.body.classList.remove('mobile-nav-open');
    toggle?.setAttribute('aria-expanded', 'false');
    if (backdrop) {
      backdrop.hidden = true;
      backdrop.classList.remove('is-visible');
    }
    document.body.style.overflow = '';
    return;
  }

  document.body.classList.toggle('mobile-nav-open', open);
  toggle?.setAttribute('aria-expanded', String(open));
  if (backdrop) {
    backdrop.hidden = !open;
    backdrop.classList.toggle('is-visible', open);
  }
  document.body.style.overflow = open ? 'hidden' : '';
}

/** Call once per page (after DOM ready). Safe if controls are missing. */
export function initMobileNav() {
  const toggle = document.getElementById('btnMobileNavToggle');
  const backdrop = document.getElementById('mobileNavBackdrop');
  const nav = document.getElementById('siteMainNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    setMobileNavOpen(!document.body.classList.contains('mobile-nav-open'));
  });

  backdrop?.addEventListener('click', () => setMobileNavOpen(false));

  nav.addEventListener('click', (ev) => {
    const t = ev.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.closest('a, button')) setMobileNavOpen(false);
  });

  MOBILE_MQ.addEventListener('change', (e) => {
    if (!e.matches) setMobileNavOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMobileNavOpen(false);
  });
}
