import { createSignal } from 'solid-js';
import { CalendarEvent, GoogleCalendarConfig } from '../types';

const STORAGE_KEY = 'kairo_google_calendar_config';

const DEFAULT_CONFIG: GoogleCalendarConfig = {
  syncUrl: '',
  clientId: '',
  accessToken: '',
  lastSync: 0,
  autoSync: false
};

function loadStoredConfig(): GoogleCalendarConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Erro ao carregar configuração do Google Calendar:', e);
  }
  return DEFAULT_CONFIG;
}

export const [googleConfig, setGoogleConfig] = createSignal<GoogleCalendarConfig>(loadStoredConfig());
export const [isGoogleSyncing, setIsGoogleSyncing] = createSignal<boolean>(false);
export const [googleSyncStatus, setGoogleSyncStatus] = createSignal<string>('');

export function saveGoogleConfig(next: Partial<GoogleCalendarConfig>) {
  const updated = { ...googleConfig(), ...next };
  setGoogleConfig(updated);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Erro ao salvar configuração do Google Calendar:', e);
    }
  }
}

/**
 * Descompacta textos com caracteres de escape iCal (\, \; \n)
 */
function unescapeIcs(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();
}

/**
 * Parser nativo leve e robusto para arquivos iCal (.ics) do Google Agenda
 */
export function parseICS(icsContent: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  
  // Unfold folded lines (RFC 5545: linhas que continuam com espaço ou tab)
  const unfolded = icsContent.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
  const lines = unfolded.split(/\r\n|\n|\r/);

  let inEvent = false;
  let current: Partial<CalendarEvent> = {};
  let dtStartRaw = '';
  let dtEndRaw = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      current = {
        isGoogle: true,
        category: 'work'
      };
      dtStartRaw = '';
      dtEndRaw = '';
      continue;
    }

    if (line === 'END:VEVENT') {
      if (inEvent && current.title && current.date) {
        events.push({
          id: current.googleEventId || `google-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          date: current.date,
          title: current.title,
          time: current.time || 'Dia inteiro',
          category: current.category || 'work',
          description: current.description,
          location: current.location,
          endTime: current.endTime,
          isGoogle: true,
          googleEventId: current.googleEventId
        });
      }
      inEvent = false;
      current = {};
      continue;
    }

    if (!inEvent) continue;

    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const propFull = line.slice(0, colonIdx);
    const val = line.slice(colonIdx + 1);
    const propName = propFull.split(';')[0].toUpperCase();

    switch (propName) {
      case 'UID':
        current.googleEventId = val;
        break;

      case 'SUMMARY':
        current.title = unescapeIcs(val);
        // Heurística de categoria baseada no título
        const tLower = current.title.toLowerCase();
        if (tLower.includes('aniversário') || tLower.includes('niver') || tLower.includes('birthday')) {
          current.category = 'birthday';
        } else if (tLower.includes('fatura') || tLower.includes('conta') || tLower.includes('pagar') || tLower.includes('boleto')) {
          current.category = 'bill';
        } else if (tLower.includes('urgente') || tLower.includes('tarefa') || tLower.includes('entregar')) {
          current.category = 'task';
        } else if (tLower.includes('médico') || tLower.includes('dentista') || tLower.includes('almoço') || tLower.includes('passeio')) {
          current.category = 'personal';
        } else {
          current.category = 'work';
        }
        break;

      case 'DESCRIPTION':
        current.description = unescapeIcs(val);
        break;

      case 'LOCATION':
        current.location = unescapeIcs(val);
        break;

      case 'DTSTART':
        dtStartRaw = val;
        // Formatos: YYYYMMDD ou YYYYMMDDTHHMMSSZ ou YYYYMMDDTHHMMSS
        if (dtStartRaw.length >= 8) {
          const y = dtStartRaw.slice(0, 4);
          const m = dtStartRaw.slice(4, 6);
          const d = dtStartRaw.slice(6, 8);
          current.date = `${y}-${m}-${d}`;

          if (dtStartRaw.includes('T')) {
            const timePart = dtStartRaw.split('T')[1];
            if (timePart.length >= 4) {
              const hh = timePart.slice(0, 2);
              const mm = timePart.slice(2, 4);
              current.time = `${hh}:${mm}`;
            }
          } else {
            current.time = 'Dia inteiro';
          }
        }
        break;

      case 'DTEND':
        dtEndRaw = val;
        if (dtEndRaw.includes('T')) {
          const timePart = dtEndRaw.split('T')[1];
          if (timePart.length >= 4) {
            const hh = timePart.slice(0, 2);
            const mm = timePart.slice(2, 4);
            current.endTime = `${hh}:${mm}`;
          }
        }
        break;
    }
  }

  return events;
}

/**
 * Baixa e sincroniza eventos a partir do link iCal/ICS do Google Calendar
 */
export async function syncGoogleCalendarFromUrl(syncUrl: string): Promise<CalendarEvent[]> {
  if (!syncUrl || !syncUrl.trim()) {
    throw new Error('URL da agenda Google não informada.');
  }

  const cleanUrl = syncUrl.trim().replace(/^webcal:\/\//i, 'https://');

  let icsText = '';

  // 1. Tenta fetch direto (funciona se não houver restrição CORS ou em WebView nativa)
  try {
    const res = await fetch(cleanUrl, { mode: 'cors' });
    if (res.ok) {
      icsText = await res.text();
    }
  } catch (errDirect) {
    console.log('Fetch direto falhou (provável CORS), tentando proxy transparente...', errDirect);
  }

  // 2. Se falhar, usa fallback com CORS proxy público seguro
  if (!icsText || !icsText.includes('BEGIN:VCALENDAR')) {
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(cleanUrl)}`;
      const resProxy = await fetch(proxyUrl);
      if (resProxy.ok) {
        icsText = await resProxy.text();
      }
    } catch (errProxy) {
      console.warn('Proxy allorigins falhou, tentando corsproxy fallback:', errProxy);
      const fallbackProxy = `https://corsproxy.io/?${encodeURIComponent(cleanUrl)}`;
      const resFallback = await fetch(fallbackProxy);
      if (resFallback.ok) {
        icsText = await resFallback.text();
      }
    }
  }

  if (!icsText || !icsText.includes('BEGIN:VCALENDAR')) {
    throw new Error('Não foi possível ler o arquivo da agenda Google. Verifique se o link secreto iCal está correto.');
  }

  const parsedEvents = parseICS(icsText);
  return parsedEvents;
}

/**
 * Busca eventos via Google Calendar REST API v3 usando token OAuth
 */
export async function fetchGoogleCalendarApiEvents(accessToken: string): Promise<CalendarEvent[]> {
  const now = new Date();
  const past = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString();
  const future = new Date(now.getFullYear(), now.getMonth() + 4, 1).toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${past}&timeMax=${future}&singleEvents=true&orderBy=startTime&maxResults=250`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`Falha na API do Google Calendar (${res.status}): ${res.statusText}`);
  }

  const data = await res.json();
  const items = data.items || [];

  return items.map((item: any): CalendarEvent => {
    const isAllDay = !item.start?.dateTime && !!item.start?.date;
    const dateStr = (item.start?.dateTime || item.start?.date || '').slice(0, 10);
    
    let timeStr = 'Dia inteiro';
    let endTimeStr: string | undefined;

    if (!isAllDay && item.start?.dateTime) {
      const startDate = new Date(item.start.dateTime);
      timeStr = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
      if (item.end?.dateTime) {
        const endDate = new Date(item.end.dateTime);
        endTimeStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
      }
    }

    return {
      id: `google-api-${item.id}`,
      googleEventId: item.id,
      title: item.summary || 'Sem título',
      date: dateStr,
      time: timeStr,
      endTime: endTimeStr,
      category: 'work',
      description: item.description || '',
      location: item.location || item.hangoutLink || '',
      isGoogle: true,
      googleLink: item.htmlLink
    };
  });
}

/**
 * Cria um evento diretamente na Google Calendar API v3
 */
export async function createGoogleCalendarApiEvent(
  accessToken: string,
  event: Omit<CalendarEvent, 'id'>
): Promise<string> {
  const isAllDay = event.time === 'Dia inteiro';
  
  let startPayload: any;
  let endPayload: any;

  if (isAllDay) {
    startPayload = { date: event.date };
    // Google Calendar API all-day end date é exclusivo (+1 dia)
    const nextDay = new Date(event.date + 'T00:00:00');
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
    endPayload = { date: nextDayStr };
  } else {
    const [hh, mm] = event.time.split(':').map((n) => parseInt(n, 10));
    const startObj = new Date(event.date + 'T00:00:00');
    startObj.setHours(hh || 9, mm || 0, 0, 0);

    const endObj = new Date(startObj.getTime() + 60 * 60 * 1000); // 1h padrão
    if (event.endTime) {
      const [endH, endM] = event.endTime.split(':').map((n) => parseInt(n, 10));
      endObj.setHours(endH, endM, 0, 0);
    }

    startPayload = { dateTime: startObj.toISOString() };
    endPayload = { dateTime: endObj.toISOString() };
  }

  const payload: any = {
    summary: event.title,
    description: event.description,
    location: event.location,
    start: startPayload,
    end: endPayload
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`Erro ao criar evento no Google (${res.status})`);
  }

  const data = await res.json();
  return data.id;
}

/**
 * Gera URL oficial para abrir o Google Agenda adicionando este evento via Web Intent
 */
export function generateGoogleCalendarWebUrl(event: {
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  description?: string;
  location?: string;
}): string {
  const isAllDay = !event.time || event.time === 'Dia inteiro';
  const cleanDate = event.date.replace(/-/g, '');

  let datesParam = `${cleanDate}/${cleanDate}`;

  if (!isAllDay && event.time) {
    const [hh, mm] = event.time.split(':');
    const startFormatted = `${cleanDate}T${hh || '09'}${mm || '00'}00`;

    let endFormatted = `${cleanDate}T${String(Math.min(23, (parseInt(hh, 10) || 9) + 1)).padStart(2, '0')}${mm || '00'}00`;
    if (event.endTime) {
      const [eh, em] = event.endTime.split(':');
      endFormatted = `${cleanDate}T${eh || '10'}${em || '00'}00`;
    }
    datesParam = `${startFormatted}/${endFormatted}`;
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: datesParam,
    details: event.description || '',
    location: event.location || ''
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Gera URL para abrir o Google Agenda em um dia específico
 */
export function generateGoogleCalendarDayUrl(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `https://calendar.google.com/calendar/u/0/r/day/${y}/${m}/${d}`;
}
