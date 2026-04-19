const THEME_STORAGE_KEY = 'whe-theme';

export function isLightTheme() {
  return document.documentElement.dataset.theme === 'light';
}

/**
 * @param {{ globeApplyTheme?: (light: boolean) => void, timelinePanelApi?: { refreshClear?: () => void }, onAfterThemeApply?: () => void }} [options]
 */
export function initThemeSystem(options = {}) {
  const { globeApplyTheme, timelinePanelApi, onAfterThemeApply } = options;
  const btn = document.getElementById('btnThemeToggle');

  function applyDocumentTheme(mode) {
    const light = mode === 'light';
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    if (btn) {
      btn.textContent = light ? 'Dark mode' : 'Light mode';
      btn.setAttribute('aria-pressed', String(light));
    }
    globeApplyTheme?.(light);
    timelinePanelApi?.refreshClear?.();
    onAfterThemeApply?.();
  }

  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'light') applyDocumentTheme('light');
  else applyDocumentTheme('dark');

  btn?.addEventListener('click', () => {
    const next = isLightTheme() ? 'dark' : 'light';
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyDocumentTheme(next);
  });
}
