import { createSignal } from 'solid-js';
import { 
  events, 
  getEventsForDate,
  selectedDay, 
  setSelectedDay
} from '../calendarStore';
import { 
  CaretLeftIcon, 
  CaretRightIcon, 
  PlusIcon, 
  GoogleIcon
} from '../components/Icons';
import { isTablet } from '../viewport';
import { CalendarEvent } from '../types';
import { navigate } from '../router';
import { googleConfig } from '../services/googleCalendar';

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

export function CalendarPage() {
  const now = new Date();
  const [currentDate, setCurrentDate] = createSignal(new Date(now.getFullYear(), now.getMonth(), 1));

  const year = () => currentDate().getFullYear();
  const month = () => currentDate().getMonth();

  const monthName = () => {
    const raw = currentDate().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year(), month() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year(), month() + 1, 1));
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDay(todayStr);
  };

  // Montagem da grade mensal
  const calendarDays = () => {
    const y = year();
    const m = month();
    const firstDayIndex = new Date(y, m, 1).getDay();
    const totalDaysInMonth = new Date(y, m + 1, 0).getDate();
    const prevMonthTotalDays = new Date(y, m, 0).getDate();

    const days: { dayNum: number; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Dias do mês anterior
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const prevM = m === 0 ? 12 : m;
      const prevY = m === 0 ? y - 1 : y;
      const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({ dayNum, isCurrentMonth: false, dateStr });
    }

    // Dias do mês atual
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const monthStr = String(m + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${y}-${monthStr}-${dayStr}`;
      days.push({ dayNum: d, isCurrentMonth: true, dateStr });
    }

    // Dias do próximo mês
    const remaining = (days.length > 35 ? 42 : 35) - days.length;
    for (let n = 1; n <= remaining; n++) {
      const nextM = m === 11 ? 1 : m + 2;
      const nextY = m === 11 ? y + 1 : y;
      const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
      days.push({ dayNum: n, isCurrentMonth: false, dateStr });
    }

    return days;
  };

  const isCurrentToday = (dateStr: string) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return dateStr === todayStr;
  };

  const getCategoryChipStyle = (cat: CalendarEvent['category']) => {
    // Monochromatic theme
    return { 
      "background-color": "var(--card-color)", 
      "color": "var(--text-color)", 
      "border": "1px solid var(--border-color)",
      "opacity": "0.9"
    };
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

  const googleEventsCount = () => events().filter((e) => e.isGoogle).length;

  return (
    <div 
      class="w-full h-full flex flex-col overflow-hidden select-none"
      style={{
        "padding": isTablet() ? "16px 20px" : "12px",
        "padding-bottom": "40px",
        "background-color": "var(--bg-color)"
      }}
    >
      {/* ========================================================================= */}
      {/* BARRA SUPERIOR DE CONTROLE (Google Agenda style)                          */}
      {/* ========================================================================= */}
      <div 
        class="flex items-center justify-between"
        style={{ "margin-bottom": "14px", "gap": "12px" }}
      >
        <div class="flex items-center gap-3">
          <h1 
            class="font-archivo font-extralight"
            style={{ "font-size": isTablet() ? "2.4rem" : "1.8rem", "letter-spacing": "-0.02em", "color": "var(--text-color)" }}
          >
            Calendário
          </h1>

          {/* Botão Hoje */}
          <button
            onClick={handleJumpToToday}
            class="action-button secondary"
            style={{
              "padding": "6px 14px",
              "font-size": "0.85rem",
              "min-height": "32px"
            }}
          >
            Hoje
          </button>
        </div>

        <div class="flex items-center gap-2">
          {/* Seletor do Mês com Setas */}
          <div 
            class="flex items-center gap-1"
            style={{
              "background-color": "var(--surface-color)",
              "border": "1px solid var(--border-color)",
              "border-radius": "9999px",
              "padding": "4px 8px"
            }}
          >
            <button
              onClick={handlePrevMonth}
              style={{ "color": "var(--text-color)", "padding": "4px 6px", "cursor": "pointer" }}
              title="Mês anterior"
            >
              <CaretLeftIcon size={18} />
            </button>

            <span 
              class="font-archivo font-light text-center"
              style={{ "color": "var(--text-color)", "min-width": isTablet() ? "160px" : "110px", "font-size": isTablet() ? "1rem" : "0.85rem" }}
            >
              {monthName()}
            </span>

            <button
              onClick={handleNextMonth}
              style={{ "color": "var(--text-color)", "padding": "4px 6px", "cursor": "pointer" }}
              title="Próximo mês"
            >
              <CaretRightIcon size={18} />
            </button>
          </div>

          {/* Botão de Integração Google Agenda */}
          <button
            onClick={() => navigate('settings')}
            class="action-button secondary"
            style={{
              "padding": "7px 12px",
              "font-size": "0.85rem",
              "min-height": "32px",
              "border-color": "var(--border-color)"
            }}
            title="Configurar Google Agenda"
          >
            <GoogleIcon size={18} />
            {googleEventsCount() > 0 && (
              <span class="text-xs" style={{ "margin-left": "2px" }}>{googleEventsCount()}</span>
            )}
          </button>

          {/* Botão de Novo Evento (Navega para a nova página dedicada) */}
          <button
            onClick={() => {
              const today = new Date();
              const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              setSelectedDay(selectedDay() || todayStr);
              navigate('new-event');
            }}
            class="action-button"
            style={{
              "padding": isTablet() ? "8px 18px" : "8px 14px",
              "font-size": "0.85rem",
              "min-height": "32px"
            }}
          >
            <PlusIcon size={18} />
            <span>Novo Evento</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* GRADE MENSAL 100% EM TELA (Google Agenda Style)                          */}
      {/* ========================================================================= */}
      <div 
        class="flex-1 w-full flex flex-col rounded-2xl overflow-hidden border"
        style={{
          "background-color": "var(--surface-color)",
          "border-color": "var(--border-color)"
        }}
      >
        {/* Cabeçalho dos 7 Dias da Semana */}
        <div 
          style={{
            "display": "grid",
            "grid-template-columns": "repeat(7, 1fr)",
            "background-color": "var(--card-color)",
            "border-bottom": "1px solid var(--border-color)"
          }}
        >
          {WEEKDAYS.map((wd, i) => (
            <div 
              style={{
                "padding": "10px 4px",
                "text-align": "center",
                "font-size": "0.75rem",
                "font-weight": "600",
                "color": i === 0 || i === 6 ? "var(--text-color)" : "var(--text-color)",
                "opacity": i === 0 || i === 6 ? "0.6" : "0.9",
                "letter-spacing": "0.05em"
              }}
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Grade dos Dias (100% da Altura e Largura) */}
        <div 
          class="flex-1 w-full"
          style={{
            "display": "grid",
            "grid-template-columns": "repeat(7, 1fr)",
            "grid-auto-rows": "1fr"
          }}
        >
          {calendarDays().map((cell) => {
            const dayEvents = getEventsForDate(cell.dateStr);
            const isToday = isCurrentToday(cell.dateStr);

            return (
              <div
                onClick={() => {
                  setSelectedDay(cell.dateStr);
                  navigate('day-details');
                }}
                style={{
                  "border-right": "1px solid var(--border-color)",
                  "border-bottom": "1px solid var(--border-color)",
                  "padding": isTablet() ? "6px 8px" : "4px",
                  "background-color": cell.isCurrentMonth ? "var(--bg-color)" : "var(--surface-color)",
                  "cursor": "pointer",
                  "display": "flex",
                  "flex-direction": "column",
                  "position": "relative",
                  "overflow": "hidden",
                  "transition": "background-color 0.15s ease"
                }}
              >
                {/* Cabeçalho do Dia (Número + Botão de Adicionar) */}
                <div class="flex items-center justify-between" style={{ "margin-bottom": "4px" }}>
                  {isToday ? (
                    <span 
                      style={{
                        "background-color": "var(--text-color)",
                        "color": "var(--bg-color)",
                        "width": "24px",
                        "height": "24px",
                        "border-radius": "50%",
                        "display": "flex",
                        "align-items": "center",
                        "justify-content": "center",
                        "font-size": "0.75rem",
                        "font-weight": "700"
                      }}
                    >
                      {cell.dayNum}
                    </span>
                  ) : (
                    <span 
                      class="text-xs font-archivo"
                      style={{
                        "color": "var(--text-color)",
                        "opacity": cell.isCurrentMonth ? "1" : "0.4",
                        "font-weight": "500",
                        "padding-left": "2px"
                      }}
                    >
                      {cell.dayNum}
                    </span>
                  )}

                  {/* Botão + rápido que navega para a página de novo evento */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDay(cell.dateStr);
                      navigate('new-event');
                    }}
                    style={{
                      "color": "var(--text-color)",
                      "opacity": "0.4",
                      "padding": "2px 4px",
                      "border-radius": "4px",
                      "line-height": "1",
                      "cursor": "pointer"
                    }}
                    title="Adicionar evento neste dia"
                  >
                    <PlusIcon size={14} />
                  </button>
                </div>

                {/* Lista de Chips Coloridos dos Eventos */}
                <div class="flex-1 flex flex-col gap-1 overflow-y-auto" style={{ "max-height": "100%" }}>
                  {dayEvents.slice(0, isTablet() ? 3 : 2).map((evt) => (
                    <div
                      style={{
                        "font-size": "0.7rem",
                        "padding": "2px 6px",
                        "border-radius": "4px",
                        "white-space": "nowrap",
                        "overflow": "hidden",
                        "text-overflow": "ellipsis",
                        "display": "flex",
                        "align-items": "center",
                        "gap": "4px",
                        ...getCategoryChipStyle(evt.category)
                      }}
                      title={`${evt.title} (${evt.time})`}
                    >
                      {evt.isGoogle && (
                        <span style={{ "display": "inline-flex", "align-items": "center" }}>
                          <GoogleIcon size={10} />
                        </span>
                      )}
                      <span style={{ "font-weight": "600" }}>{evt.time !== 'Dia inteiro' ? evt.time : '●'}</span>
                      <span class="truncate">{evt.title}</span>
                    </div>
                  ))}

                  {/* Indicador de mais eventos */}
                  {dayEvents.length > (isTablet() ? 3 : 2) && (
                    <span class="text-xs text-muted font-medium" style={{ "font-size": "0.65rem", "padding-left": "2px" }}>
                      +{dayEvents.length - (isTablet() ? 3 : 2)} mais
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
