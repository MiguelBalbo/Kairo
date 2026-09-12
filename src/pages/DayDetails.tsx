import { selectedDay, getEventsForDate, removeCalendarEvent } from '../calendarStore';
import { navigate } from '../router';
import { isTablet } from '../viewport';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  TrashIcon, 
  PlusIcon,
  GoogleIcon,
  ExternalLinkIcon
} from '../components/Icons';
import { generateGoogleCalendarDayUrl, generateGoogleCalendarWebUrl } from '../services/googleCalendar';
import { CalendarEvent } from '../types';

export function DayDetailsPage() {
  const isCurrentToday = (dateStr: string) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return dateStr === todayStr;
  };

  const getCategoryLabel = (cat: CalendarEvent['category']) => {
    switch (cat) {
      case 'birthday': return 'Aniversário';
      case 'personal': return 'Pessoal';
      case 'bill': return 'Conta / Fatura';
      case 'task': return 'Tarefa';
      case 'work': default: return 'Trabalho';
    }
  };

  const selectedDateDetails = () => {
    if (!selectedDay()) return null;
    try {
      const [y, m, d] = selectedDay()!.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      const dayNum = String(d).padStart(2, '0');
      const weekday = dt.toLocaleDateString('pt-BR', { weekday: 'long' });
      const monthYear = dt.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      return {
        dayNum,
        weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
        monthYear: monthYear.charAt(0).toUpperCase() + monthYear.slice(1),
        isToday: isCurrentToday(selectedDay()!)
      };
    } catch {
      return {
        dayNum: selectedDay()!,
        weekday: '',
        monthYear: '',
        isToday: false
      };
    }
  };

  const details = selectedDateDetails();

  if (!details) {
    return (
      <div class="w-full h-full flex flex-col items-center justify-center bg-panel text-muted">
        Nenhuma data selecionada.
        <button onClick={() => navigate('calendar')} class="action-button mt-4">
          Voltar
        </button>
      </div>
    );
  }

  const dayEvents = () => getEventsForDate(selectedDay()!);

  return (
    <div 
      class="w-full h-full flex flex-col overflow-y-auto"
      style={{
        "background-color": "var(--bg-color)",
        "color": "var(--text-color)",
        "padding": isTablet() ? "24px 32px" : "16px"
      }}
    >
      <div 
        class="flex items-center justify-between border-b pb-4 mb-6"
        style={{ "border-color": "var(--border-color)", "max-width": "760px", "margin-left": "auto", "margin-right": "auto", "width": "100%" }}
      >
        <button
          type="button"
          onClick={() => navigate('calendar')}
          class="flex items-center gap-2 cursor-pointer transition-colors"
          style={{
            "background-color": "var(--surface-color)",
            "border": "1px solid var(--border-color)",
            "border-radius": "9999px",
            "padding": "8px 16px",
            "font-size": "0.9rem",
            "font-weight": "500",
            "color": "var(--text-color)"
          }}
        >
          <ArrowLeftIcon size={18} />
          <span>Voltar ao Calendário</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.open(generateGoogleCalendarDayUrl(selectedDay()!), '_blank')}
            class="flex items-center gap-1.5 cursor-pointer"
            style={{
              "background-color": "var(--surface-color)",
              "border": "1px solid var(--border-color)",
              "border-radius": "14px",
              "padding": "6px 12px",
              "font-size": "0.8rem",
              "color": "var(--text-color)"
            }}
            title="Abrir este dia no Google Agenda"
          >
            <GoogleIcon size={16} />
            <span class={isTablet() ? "inline" : "hidden"}>Google</span>
            <ExternalLinkIcon size={12} />
          </button>
        </div>
      </div>

      <div class="flex-1 flex flex-col" style={{ "max-width": "760px", "margin-left": "auto", "margin-right": "auto", "width": "100%" }}>
        <div class="flex items-center gap-6 mb-8">
          <div 
            class="flex items-center justify-center font-archivo font-bold"
            style={{
              "width": "80px",
              "height": "80px",
              "border-radius": "22px",
              "font-size": "2.4rem",
              "background-color": details.isToday ? "var(--text-color)" : "var(--surface-color)",
              "color": details.isToday ? "var(--bg-color)" : "var(--text-color)",
              "border": "1px solid var(--border-color)"
            }}
          >
            {details.dayNum}
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-semibold tracking-wider uppercase text-muted">
              {details.isToday ? 'Hoje' : 'Data Selecionada'}
            </span>
            <h2 class="font-archivo text-3xl font-extralight leading-tight">
              {details.weekday}
            </h2>
            <span class="text-base text-dim font-archivo">
              {details.monthYear}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('new-event')}
          class="action-button w-full mb-8"
        >
          <PlusIcon size={20} />
          <span>Adicionar Novo Evento</span>
        </button>

        <div class="flex-1 flex flex-col gap-3">
          <div class="flex items-center justify-between text-xs font-semibold text-dim uppercase tracking-wider mb-2">
            <span>Compromissos ({dayEvents().length})</span>
          </div>

          {dayEvents().length === 0 ? (
            <div 
              class="flex flex-col items-center justify-center p-8 text-center rounded-2xl border"
              style={{ "border-color": "var(--border-color)", "background-color": "var(--surface-color)" }}
            >
              <CalendarIcon size={36} color="var(--text-color)" />
              <p class="text-sm font-medium mt-4">Nenhum compromisso agendado para esta data.</p>
            </div>
          ) : (
            dayEvents().map((evt) => (
              <div 
                class="flex items-center justify-between p-4 rounded-2xl border transition-all"
                style={{
                  "background-color": "var(--surface-color)",
                  "border-color": "var(--border-color)"
                }}
              >
                <div class="flex flex-col gap-1.5 flex-1 pr-3">
                  <div class="flex items-center gap-2 flex-wrap">
                    {evt.isGoogle && (
                      <span class="text-xs flex items-center gap-1 font-semibold rounded-md px-2 py-0.5" style={{ "border": "1px solid var(--border-color)" }}>
                        <GoogleIcon size={12} />
                        <span>Google</span>
                      </span>
                    )}
                    <span class="text-xs font-medium rounded-md px-2 py-0.5" style={{ "border": "1px solid var(--border-color)" }}>
                      {getCategoryLabel(evt.category)}
                    </span>
                    <span class="text-xs font-mono flex items-center gap-1">
                      <ClockIcon size={13} />
                      <span>{evt.time}{evt.endTime ? ` - ${evt.endTime}` : ''}</span>
                    </span>
                  </div>

                  <h4 class="text-base font-medium leading-tight mt-1">
                    {evt.title}
                  </h4>

                  {evt.location && (
                    <p class="text-xs text-dim flex items-center gap-1 mt-1">
                      <MapPinIcon size={12} />
                      <span>{evt.location}</span>
                    </p>
                  )}

                  {evt.description && (
                    <p class="text-xs text-dim line-clamp-2 mt-1">
                      {evt.description}
                    </p>
                  )}
                </div>

                <div class="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const url = evt.googleLink || generateGoogleCalendarWebUrl(evt);
                      window.open(url, '_blank');
                    }}
                    class="p-2 rounded-xl cursor-pointer action-button secondary"
                    style={{ "min-height": "40px", "padding": "8px" }}
                    title="Abrir no Google Agenda"
                  >
                    <ExternalLinkIcon size={16} />
                  </button>

                  <button
                    onClick={() => removeCalendarEvent(evt.id)}
                    class="p-2 rounded-xl cursor-pointer action-button secondary"
                    style={{ "min-height": "40px", "padding": "8px" }}
                    title="Excluir evento"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
