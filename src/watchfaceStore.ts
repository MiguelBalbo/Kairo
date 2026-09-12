import { createSignal } from 'solid-js';
import { Watchface, WatchfaceElement } from './types';

// Watchfaces de fábrica — sempre disponíveis, nunca persistidas em localStorage.
// "Padrão" reproduz fielmente o visual original do relógio da Home.
export const BUILTIN_WATCHFACES: Watchface[] = [
  {
    id: 'default',
    name: 'Padrão',
    elements: [
      {
        type: 'time-text',
        format: 'HH:mm',
        fontWeight: 100,
        fontSize: 'clamp(6rem, 17vw, 22rem)',
        fontSizeMobile: 'clamp(4.5rem, 18vw, 7.5rem)',
        lineHeight: '0.88',
        letterSpacing: '-0.04em'
      },
      {
        type: 'date-text',
        style: 'long',
        fontWeight: 200,
        fontSize: 'clamp(1.5rem, 4vw, 4.5rem)',
        fontSizeMobile: 'clamp(1.1rem, 4.5vw, 1.75rem)',
        marginTop: '1.5rem',
        marginTopMobile: '0.75rem',
        opacity: 0.95,
        lineHeight: '1.15'
      }
    ]
  },
  {
    id: 'analog-classic',
    name: 'Analógico Clássico',
    elements: [
      {
        type: 'analog-clock',
        diameter: 'clamp(200px, 32vw, 340px)',
        diameterMobile: 'clamp(160px, 55vw, 240px)',
        showSeconds: true,
        tickMarks: true
      },
      {
        type: 'date-text',
        style: 'long',
        fontWeight: 200,
        fontSize: 'clamp(1.25rem, 2.5vw, 2rem)',
        fontSizeMobile: 'clamp(1rem, 4vw, 1.4rem)',
        marginTop: '1.75rem',
        marginTopMobile: '1rem',
        opacity: 0.9
      }
    ]
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    elements: [
      {
        type: 'time-text',
        format: 'HH:mm',
        fontWeight: 200,
        fontSize: 'clamp(3rem, 8vw, 6rem)',
        fontSizeMobile: 'clamp(2.5rem, 12vw, 4rem)',
        letterSpacing: '-0.02em'
      },
      {
        type: 'date-text',
        style: 'short',
        fontWeight: 300,
        fontSize: '1rem',
        fontSizeMobile: '0.85rem',
        marginTop: '0.75rem',
        marginTopMobile: '0.5rem',
        opacity: 0.6,
        uppercase: true,
        letterSpacing: '0.1em'
      }
    ]
  },
  {
    id: 'flip-digits',
    name: 'Dígitos em Blocos',
    elements: [
      {
        type: 'digit-cells',
        format: 'HH:mm:ss',
        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
        fontSizeMobile: 'clamp(1.8rem, 9vw, 3rem)'
      },
      {
        type: 'date-text',
        style: 'long',
        fontWeight: 200,
        fontSize: 'clamp(1.1rem, 2.5vw, 1.75rem)',
        fontSizeMobile: 'clamp(0.95rem, 4vw, 1.3rem)',
        marginTop: '1.5rem',
        marginTopMobile: '0.85rem',
        opacity: 0.9
      }
    ]
  }
];

const DEFAULT_WATCHFACE_ID = 'default';
const ELEMENT_TYPES = ['time-text', 'date-text', 'label-text', 'divider', 'analog-clock', 'digit-cells'];

function loadCustomWatchfaces(): Watchface[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('kairo_custom_watchfaces');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Erro ao carregar watchfaces customizadas:', e);
    return [];
  }
}

function loadSelectedWatchfaceId(): string {
  if (typeof window === 'undefined') return DEFAULT_WATCHFACE_ID;
  try {
    return localStorage.getItem('kairo_selected_watchface') || DEFAULT_WATCHFACE_ID;
  } catch {
    return DEFAULT_WATCHFACE_ID;
  }
}

export const [customWatchfaces, setCustomWatchfaces] = createSignal<Watchface[]>(loadCustomWatchfaces());
export const [selectedWatchfaceId, setSelectedWatchfaceId] = createSignal<string>(loadSelectedWatchfaceId());

function saveCustomWatchfacesToStorage(next: Watchface[]) {
  setCustomWatchfaces(next);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('kairo_custom_watchfaces', JSON.stringify(next));
    } catch (e) {
      console.warn('Erro ao persistir watchfaces customizadas:', e);
    }
  }
}

export function allWatchfaces(): Watchface[] {
  return [...BUILTIN_WATCHFACES, ...customWatchfaces()];
}

export function activeWatchface(): Watchface {
  return allWatchfaces().find((w) => w.id === selectedWatchfaceId()) || BUILTIN_WATCHFACES[0];
}

export function selectWatchface(id: string) {
  setSelectedWatchfaceId(id);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('kairo_selected_watchface', id);
    } catch (e) {
      console.warn('Erro ao salvar watchface selecionada:', e);
    }
  }
}

export function deleteCustomWatchface(id: string) {
  const updated = customWatchfaces().filter((w) => w.id !== id);
  saveCustomWatchfacesToStorage(updated);
  if (selectedWatchfaceId() === id) {
    selectWatchface(DEFAULT_WATCHFACE_ID);
  }
}

// Formata a hora atual segundo os tokens usados por `time-text`/`digit-cells`:
// HH (24h com zero), h (12h sem zero), mm, ss, a/A (am-pm minúsculo/maiúsculo).
export function formatTimeToken(date: Date, format: string): string {
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const pad = (n: number) => String(n).padStart(2, '0');
  const tokens: Record<string, string> = {
    HH: pad(hours24),
    h: String(hours12),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
    A: hours24 < 12 ? 'AM' : 'PM',
    a: hours24 < 12 ? 'am' : 'pm'
  };
  return format.replace(/HH|h|mm|ss|A|a/g, (token) => tokens[token]);
}

function validateElement(el: any, index: number): string | null {
  if (!el || typeof el !== 'object' || typeof el.type !== 'string') {
    return `Elemento #${index + 1}: falta o campo "type".`;
  }
  if (!ELEMENT_TYPES.includes(el.type)) {
    return `Elemento #${index + 1}: tipo "${el.type}" desconhecido.`;
  }
  const needsFont = ['time-text', 'date-text', 'label-text', 'digit-cells'];
  if (needsFont.includes(el.type) && (typeof el.fontSize !== 'string' || typeof el.fontSizeMobile !== 'string')) {
    return `Elemento #${index + 1} (${el.type}): "fontSize" e "fontSizeMobile" são obrigatórios.`;
  }
  if ((el.type === 'time-text' || el.type === 'digit-cells') && typeof el.format !== 'string') {
    return `Elemento #${index + 1} (${el.type}): "format" é obrigatório.`;
  }
  if (el.type === 'date-text' && el.style !== 'long' && el.style !== 'short') {
    return `Elemento #${index + 1} (date-text): "style" deve ser "long" ou "short".`;
  }
  if (el.type === 'label-text' && typeof el.text !== 'string') {
    return `Elemento #${index + 1} (label-text): "text" é obrigatório.`;
  }
  if (el.type === 'analog-clock' && (typeof el.diameter !== 'string' || typeof el.diameterMobile !== 'string')) {
    return `Elemento #${index + 1} (analog-clock): "diameter" e "diameterMobile" são obrigatórios.`;
  }
  return null;
}

function validateWatchfaceShape(data: any): { elements: WatchfaceElement[]; name: string } | { error: string } {
  if (!data || typeof data !== 'object') {
    return { error: 'O arquivo não contém um objeto JSON válido.' };
  }
  if (typeof data.name !== 'string' || !data.name.trim()) {
    return { error: 'Falta o campo "name" (nome da watchface).' };
  }
  if (!Array.isArray(data.elements) || data.elements.length === 0) {
    return { error: 'Falta o campo "elements" (lista de elementos) ou está vazio.' };
  }
  for (let i = 0; i < data.elements.length; i++) {
    const err = validateElement(data.elements[i], i);
    if (err) return { error: err };
  }
  return { elements: data.elements as WatchfaceElement[], name: data.name.trim() };
}

export type ImportWatchfaceResult = { ok: true; watchface: Watchface } | { ok: false; error: string };

export async function importWatchfaceFromFile(file: File): Promise<ImportWatchfaceResult> {
  let parsed: any;
  try {
    const text = await file.text();
    parsed = JSON.parse(text);
  } catch (e) {
    return { ok: false, error: 'Não foi possível ler o arquivo — verifique se é um JSON válido.' };
  }

  const validated = validateWatchfaceShape(parsed);
  if ('error' in validated) {
    return { ok: false, error: validated.error };
  }

  const watchface: Watchface = {
    id: `custom-${Date.now()}`,
    name: validated.name,
    elements: validated.elements
  };

  saveCustomWatchfacesToStorage([...customWatchfaces(), watchface]);
  selectWatchface(watchface.id);
  return { ok: true, watchface };
}
