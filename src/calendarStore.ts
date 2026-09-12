import { createSignal } from 'solid-js';
import { CalendarEvent } from './types';

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    date: '2026-09-02',
    title: 'Início do Kairo PJS 2',
    time: '09:00',
    category: 'work',
    description: 'Planejamento e estruturação do projeto'
  },
  {
    id: 'evt-2',
    date: '2026-09-06',
    title: 'Reunião de Alinhamento',
    time: '14:30',
    category: 'work',
    description: 'Apresentação das novas telas e funcionalidades'
  },
  {
    id: 'evt-3',
    date: '2026-09-06',
    title: 'Aniversário do Lucas',
    time: '19:00',
    category: 'birthday',
    description: 'Comemoração em família'
  },
  {
    id: 'evt-4',
    date: '2026-09-10',
    title: 'Vencimento de Fatura',
    time: 'Dia inteiro',
    category: 'bill',
    description: 'Internet & Servidores'
  },
  {
    id: 'evt-5',
    date: '2026-09-15',
    title: 'Entrega da Versão Tablet',
    time: '17:00',
    category: 'task',
    description: 'Revisão final de performance e touch targets'
  },
  {
    id: 'evt-6',
    date: '2026-09-20',
    title: 'Passeio no Parque',
    time: '10:00',
    category: 'personal',
    description: 'Descanso e caminhada matinal'
  }
];

function loadStoredEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return INITIAL_EVENTS;
  try {
    const raw = localStorage.getItem('kairo_calendar_events');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Erro ao carregar eventos:', e);
  }
  return INITIAL_EVENTS;
}

export const [events, setEvents] = createSignal<CalendarEvent[]>(loadStoredEvents());
export const [selectedDay, setSelectedDay] = createSignal<string | null>(null);
export const [isAddingEvent, setIsAddingEvent] = createSignal<boolean>(false);

export function saveEventsToStorage(next: CalendarEvent[]) {
  setEvents(next);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('kairo_calendar_events', JSON.stringify(next));
    } catch (e) {
      console.warn('Erro ao salvar eventos no storage:', e);
    }
  }
}

export function addCalendarEvent(eventData: Omit<CalendarEvent, 'id'>): CalendarEvent {
  const newEvt: CalendarEvent = {
    ...eventData,
    id: `evt-${Date.now()}`
  };
  const updated = [...events(), newEvt];
  saveEventsToStorage(updated);
  return newEvt;
}

export function removeCalendarEvent(id: string) {
  const updated = events().filter((e) => e.id !== id);
  saveEventsToStorage(updated);
}

export function getEventsForDate(dateStr: string): CalendarEvent[] {
  return events().filter((e) => e.date === dateStr);
}

/**
 * Mescla eventos do Google Agenda sem duplicar eventos existentes
 */
export function mergeGoogleEvents(googleEvents: CalendarEvent[]) {
  // Mantém todos os eventos locais (não Google)
  const localEvents = events().filter((e) => !e.isGoogle);

  // Evita duplicatas por googleEventId ou por combinação de date + title
  const existingGoogleIds = new Set(localEvents.map((e) => e.googleEventId).filter(Boolean));
  const newGoogleEvents: CalendarEvent[] = [];

  for (const gEvt of googleEvents) {
    if (gEvt.googleEventId && existingGoogleIds.has(gEvt.googleEventId)) {
      continue;
    }
    newGoogleEvents.push(gEvt);
  }

  const merged = [...localEvents, ...newGoogleEvents];
  // Ordena por data e horário
  merged.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.time === 'Dia inteiro') return -1;
    if (b.time === 'Dia inteiro') return 1;
    return a.time.localeCompare(b.time);
  });

  saveEventsToStorage(merged);
}

/**
 * Remove apenas eventos importados do Google Agenda
 */
export function clearGoogleEvents() {
  const localOnly = events().filter((e) => !e.isGoogle);
  saveEventsToStorage(localOnly);
}
