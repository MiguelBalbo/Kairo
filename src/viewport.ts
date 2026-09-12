import { createSignal, onMount, onCleanup } from 'solid-js';

const initialWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
const initialHeight = typeof window !== 'undefined' ? window.innerHeight : 600;

export const [viewportWidth, setViewportWidth] = createSignal<number>(initialWidth);
export const [viewportHeight, setViewportHeight] = createSignal<number>(initialHeight);

function loadStoredUiScale(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const val = localStorage.getItem('kairo_ui_scale');
    return val ? parseFloat(val) : 1;
  } catch {
    return 1;
  }
}

export const [uiScale, setUiScale] = createSignal<number>(loadStoredUiScale());

// Escala de UI: multiplica o font-size da raiz (--ui-scale em index.html), o que
// amplia proporcionalmente a maior parte dos espaçamentos/textos/botões do app,
// já que são majoritariamente definidos em `rem`. Torna as áreas de toque maiores.
export function applyUiScale(scale: number) {
  setUiScale(scale);
  if (typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--ui-scale', String(scale));
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('kairo_ui_scale', scale.toString());
    } catch (e) {
      console.warn('Erro ao salvar escala de UI:', e);
    }
  }
}

// Aplica a escala salva assim que o módulo carrega, para restaurar a preferência a cada boot.
if (typeof document !== 'undefined') {
  document.documentElement.style.setProperty('--ui-scale', String(uiScale()));
}

export type ThemeMode = 'auto' | 'light' | 'dark';

function loadStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'auto';
  try {
    const val = localStorage.getItem('kairo_theme_mode');
    return val === 'light' || val === 'dark' ? val : 'auto';
  } catch {
    return 'auto';
  }
}

export const [themeMode, setThemeMode] = createSignal<ThemeMode>(loadStoredThemeMode());

// Modo claro/escuro (Configurações > Sistema). "auto" remove o atributo e volta a
// seguir @media (prefers-color-scheme) em index.html; "light"/"dark" força o tema
// via o atributo data-theme na raiz, independente do sistema.
export function applyThemeMode(mode: ThemeMode) {
  setThemeMode(mode);
  if (typeof document !== 'undefined') {
    if (mode === 'auto') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', mode);
    }
  }
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('kairo_theme_mode', mode);
    } catch (e) {
      console.warn('Erro ao salvar modo de tema:', e);
    }
  }
}

// Aplica o modo salvo assim que o módulo carrega, para restaurar a preferência a cada boot.
if (typeof document !== 'undefined' && themeMode() !== 'auto') {
  document.documentElement.setAttribute('data-theme', themeMode());
}

export function isTablet(): boolean {
  // Dispositivos ou telas com largura >= 640px ou landscape com boa área
  return viewportWidth() >= 640;
}

export function isLandscape(): boolean {
  return viewportWidth() > viewportHeight();
}

export function getScreenAspect(): string {
  const w = viewportWidth();
  const h = viewportHeight();
  const ratio = (w / (h || 1)).toFixed(2);
  return `${w}x${h} (${ratio}:1)`;
}

export function initViewportListener() {
  if (typeof window === 'undefined') return;

  const handleResize = () => {
    setViewportWidth(window.innerWidth);
    setViewportHeight(window.innerHeight);
  };

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);

  onCleanup(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
  });
}
