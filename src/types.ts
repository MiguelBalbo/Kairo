export type Route = 'home' | 'calendar' | 'photos' | 'notes' | 'contacts' | 'settings' | 'new-event' | 'day-details';

export interface RouteItem {
  id: Route;
  label: string;
  name: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  time: string; // Ex: "14:30" ou "Dia inteiro"
  category: 'work' | 'personal' | 'birthday' | 'bill' | 'task';
  description?: string;
  location?: string;
  endTime?: string;
  isGoogle?: boolean;
  googleEventId?: string;
  googleLink?: string;
}

export interface GoogleCalendarConfig {
  syncUrl: string; // Link iCal/ICS
  clientId: string; // Google OAuth Client ID
  accessToken: string; // Token OAuth
  lastSync: number; // Timestamp do último sync
  autoSync: boolean;
}

export interface Contact {
  id: number;
  nome: string;
  tel: string;
  endereco: string;
  obs?: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  date: string;
  timestamp: number;
}

export interface PhotoItem {
  id: string;
  url: string;
  name: string;
}

export interface PhotoSettings {
  folderPath: string;
  intervalSeconds: number;
  autoPlay: boolean;
}

export interface SystemMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  status: 'good' | 'warning' | 'info';
}

// Props de estilo compartilhadas pelos elementos de texto de uma watchface.
// fontSize/fontSizeMobile aceitam qualquer valor CSS válido, incluindo clamp().
interface WatchfaceTextStyle {
  fontWeight?: 100 | 200 | 300 | 400;
  fontSize: string;
  fontSizeMobile: string;
  letterSpacing?: string;
  lineHeight?: string;
  marginTop?: string;
  marginTopMobile?: string;
  opacity?: number;
  uppercase?: boolean;
}

export type WatchfaceElement =
  | ({ type: 'time-text'; format: string } & WatchfaceTextStyle)
  | ({ type: 'date-text'; style: 'long' | 'short' } & WatchfaceTextStyle)
  | ({ type: 'label-text'; text: string } & WatchfaceTextStyle)
  | { type: 'divider'; marginTop?: string }
  | { type: 'analog-clock'; diameter: string; diameterMobile: string; showSeconds?: boolean; tickMarks?: boolean; marginTop?: string }
  | { type: 'digit-cells'; format: string; fontSize: string; fontSizeMobile: string; marginTop?: string };

export interface Watchface {
  id: string;
  name: string;
  elements: WatchfaceElement[];
}
