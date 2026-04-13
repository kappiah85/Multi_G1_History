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
  const hint = document.getElementById('themeColorHint');

  function applyDocumentTheme(mode) {
    const light = mode === 'light';
    document.documentElement.dataset.theme = light ? 'light' : 'dark';
    if (btn) {
      btn.textContent = light ? 'Dark mode' : 'Light mode';
      btn.setAttribute('aria-pressed', String(light));
    }
    if (hint) {
      hint.innerHTML = light
        ? '<strong>Colour models:</strong> Light theme raises RGB components (higher luminance — like raising HSV <strong>V</strong>). Globe lights are boosted so the 3D scene stays readable.'
        : '<strong>Colour models:</strong> Dark UI uses lower RGB luminance (similar to lower HSV “value” <strong>V</strong>). Timeline &amp; algorithm canvases read colours from CSS variables so pixels track the theme.';
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
