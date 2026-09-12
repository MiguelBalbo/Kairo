import { createSignal, onMount } from 'solid-js';
import { selectedDay, setSelectedDay, addCalendarEvent } from '../calendarStore';
import { navigate } from '../router';
import { isTablet } from '../viewport';
import { CalendarEvent } from '../types';
import { 
  ArrowLeftIcon, 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  CheckIcon, 
  GoogleIcon,
  ExternalLinkIcon
} from '../components/Icons';
import { 
  googleConfig, 
  createGoogleCalendarApiEvent, 
  generateGoogleCalendarWebUrl 
} from '../services/googleCalendar';

export function NewEventPage() {
  const getInitialDate = () => {
    if (selectedDay()) return selectedDay()!;
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const [date, setDate] = createSignal(getInitialDate());
  const [title, setTitle] = createSignal('');
  const [isAllDay, setIsAllDay] = createSignal(false);
  const [startTime, setStartTime] = createSignal('09:00');
  const [endTime, setEndTime] = createSignal('10:00');
  const [category, setCategory] = createSignal<CalendarEvent['category']>('work');
  const [location, setLocation] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [syncWithGoogle, setSyncWithGoogle] = createSignal(false);
  const [openInGoogleWeb, setOpenInGoogleWeb] = createSignal(false);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [feedbackMsg, setFeedbackMsg] = createSignal('');

  onMount(() => {
    // Se o usuário tem conta Google conectada com token, marca sincronização por padrão
    if (googleConfig().accessToken) {
      setSyncWithGoogle(true);
    }
  });

  const formattedDateHeader = () => {
    try {
      const [y, m, d] = date().split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return date();
    }
  };

  const categories: { id: CalendarEvent['category']; label: string }[] = [
    { id: 'work', label: 'Trabalho' },
    { id: 'personal', label: 'Pessoal' },
    { id: 'birthday', label: 'Aniversário' },
    { id: 'bill', label: 'Conta / Fatura' },
    { id: 'task', label: 'Tarefa / Urgente' }
  ];

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!title().trim()) {
      setFeedbackMsg('Por favor, informe o título do evento.');
      return;
    }

    setIsSubmitting(true);
    setFeedbackMsg('');

    const timeString = isAllDay() ? 'Dia inteiro' : startTime();
    const eventPayload: Omit<CalendarEvent, 'id'> = {
      date: date(),
      title: title().trim(),
      time: timeString,
      endTime: !isAllDay() ? endTime() : undefined,
      category: category(),
      location: location().trim() || undefined,
      description: description().trim() || undefined,
      isGoogle: false
    };

    // Sincronização direta com Google Calendar API se solicitado e token ativo
    if (syncWithGoogle() && googleConfig().accessToken) {
      try {
        const googleId = await createGoogleCalendarApiEvent(googleConfig().accessToken, eventPayload);
        eventPayload.isGoogle = true;
        eventPayload.googleEventId = googleId;
      } catch (err) {
        console.warn('Falha ao enviar para Google Calendar API:', err);
      }
    }

    // Adiciona ao calendário local
    addCalendarEvent(eventPayload);
    setSelectedDay(date());

    // Se o usuário optou por abrir no Google Agenda Web
    if (openInGoogleWeb()) {
      const googleUrl = generateGoogleCalendarWebUrl({
        title: title().trim(),
        date: date(),
        time: isAllDay() ? undefined : startTime(),
        endTime: isAllDay() ? undefined : endTime(),
        description: description().trim(),
        location: location().trim()
      });
      window.open(googleUrl, '_blank');
    }

    setFeedbackMsg('Evento salvo com sucesso!');
    setTimeout(() => {
      navigate('calendar');
    }, 400);
  };

  return (
    <div 
      class="w-full h-full flex flex-col overflow-y-auto select-none"
      style={{
        "background-color": "var(--bg-color)",
        "color": "var(--text-color)",
        "padding": isTablet() ? "24px 32px" : "16px"
      }}
    >
      {/* ========================================================================= */}
      {/* CABEÇALHO DA PÁGINA (Com botão Voltar)                                    */}
      {/* ========================================================================= */}
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

        <h1
          class="font-archivo text-xl font-extralight flex items-center gap-2"
          style={{ "letter-spacing": "-0.01em", "color": "var(--text-color)" }}
        >
          <CalendarIcon size={22} />
          <span>Novo Compromisso</span>
        </h1>
      </div>

      {/* ========================================================================= */}
      {/* CORPO DO FORMULÁRIO DEDICADO                                              */}
      {/* ========================================================================= */}
      <div 
        class="flex-1 flex flex-col"
        style={{ "max-width": "760px", "margin-left": "auto", "margin-right": "auto", "width": "100%" }}
      >
        <form onSubmit={handleSubmit} class="flex flex-col gap-5">
          
          {/* 1. TÍTULO DO EVENTO */}
          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-dim">
              Título do Evento *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Reunião com Equipe, Almoço, Consulta Médica..."
              value={title()}
              onInput={(e) => setTitle(e.currentTarget.value)}
              class="w-full font-archivo transition-all"
              style={{
                "background-color": "var(--surface-color)",
                "border": "1px solid var(--border-color)",
                "color": "var(--text-color)",
                "border-radius": "16px",
                "padding": "14px 18px",
                "font-size": "1.2rem",
                "outline": "none"
              }}
              autofocus
            />
          </div>

          {/* 2. DATA E HORÁRIO */}
          <div 
            style={{
              "display": "grid",
              "grid-template-columns": isTablet() ? "1fr 1fr" : "1fr",
              "gap": "16px"
            }}
          >
            {/* Seletor de Data */}
            <div class="flex flex-col gap-2">
              <label class="text-xs font-semibold uppercase tracking-wider flex items-center justify-between text-dim">
                <span>Data</span>
                <span class="text-xs font-normal capitalize text-muted">{formattedDateHeader()}</span>
              </label>
              <input
                type="date"
                required
                value={date()}
                onInput={(e) => setDate(e.currentTarget.value)}
                class="w-full font-archivo"
                style={{
                  "background-color": "var(--surface-color)",
                  "border": "1px solid var(--border-color)",
                  "color": "var(--text-color)",
                  "border-radius": "12px",
                  "padding": "12px 16px",
                  "font-size": "0.95rem",
                  "outline": "none"
                }}
              />
            </div>

            {/* Alternador de Horário */}
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-semibold uppercase tracking-wider text-dim">
                  Horário
                </label>
                <button
                  type="button"
                  onClick={() => setIsAllDay(!isAllDay())}
                  class="text-xs cursor-pointer font-medium"
                  style={{
                    "color": "var(--text-color)",
                    "text-decoration": isAllDay() ? "underline" : "none"
                  }}
                >
                  {isAllDay() ? '✓ Dia Inteiro marcado' : 'Marcar como Dia Inteiro'}
                </button>
              </div>

              {isAllDay() ? (
                <div 
                  class="flex items-center justify-center text-sm italic"
                  style={{
                    "background-color": "var(--surface-color)",
                    "border": "1px dashed var(--border-color)",
                    "color": "var(--text-color)",
                    "border-radius": "12px",
                    "padding": "12px 16px",
                    "min-height": "48px"
                  }}
                >
                  Compromisso durante o dia inteiro
                </div>
              ) : (
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="text-xs mb-1 block text-dim">Início</label>
                    <input
                      type="time"
                      value={startTime()}
                      onInput={(e) => setStartTime(e.currentTarget.value)}
                      class="w-full font-archivo"
                      style={{
                        "background-color": "var(--surface-color)",
                        "border": "1px solid var(--border-color)",
                        "color": "var(--text-color)",
                        "border-radius": "12px",
                        "padding": "10px 14px",
                        "font-size": "0.95rem",
                        "outline": "none"
                      }}
                    />
                  </div>
                  <div>
                    <label class="text-xs mb-1 block text-dim">Término</label>
                    <input
                      type="time"
                      value={endTime()}
                      onInput={(e) => setEndTime(e.currentTarget.value)}
                      class="w-full font-archivo"
                      style={{
                        "background-color": "var(--surface-color)",
                        "border": "1px solid var(--border-color)",
                        "color": "var(--text-color)",
                        "border-radius": "12px",
                        "padding": "10px 14px",
                        "font-size": "0.95rem",
                        "outline": "none"
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. CATEGORIA DO EVENTO */}
          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-dim">
              Categoria
            </label>
            <div class="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = () => category() === cat.id;
                return (
                  <button
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    class="cursor-pointer transition-all flex items-center gap-2"
                    style={{
                      "padding": "8px 16px",
                      "border-radius": "9999px",
                      "font-size": "0.85rem",
                      "font-weight": isSelected() ? "600" : "400",
                      "color": "var(--text-color)",
                      "background-color": isSelected() ? "var(--card-color)" : "transparent",
                      "border": isSelected() ? `2px solid var(--text-color)` : "1px solid var(--border-color)",
                      "transform": isSelected() ? "scale(1.03)" : "scale(1)"
                    }}
                  >
                    <span>{cat.label}</span>
                    {isSelected() && <CheckIcon size={14} color="var(--text-color)" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. LOCAL / LINK */}
          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold uppercase tracking-wider flex items-center gap-1 text-dim">
              <MapPinIcon size={14} />
              <span>Local ou Link (Opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Sala de Reuniões 2, Google Meet, ou endereço..."
              value={location()}
              onInput={(e) => setLocation(e.currentTarget.value)}
              class="w-full font-archivo"
              style={{
                "background-color": "var(--surface-color)",
                "border": "1px solid var(--border-color)",
                "color": "var(--text-color)",
                "border-radius": "12px",
                "padding": "12px 16px",
                "font-size": "0.95rem",
                "outline": "none"
              }}
            />
          </div>

          {/* 5. DESCRIÇÃO / NOTAS */}
          <div class="flex flex-col gap-2">
            <label class="text-xs font-semibold uppercase tracking-wider text-dim">
              Descrição / Observações (Opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Adicione detalhes, pauta, links ou notas deste compromisso..."
              value={description()}
              onInput={(e) => setDescription(e.currentTarget.value)}
              class="w-full font-archivo resize-none"
              style={{
                "background-color": "var(--surface-color)",
                "border": "1px solid var(--border-color)",
                "color": "var(--text-color)",
                "border-radius": "12px",
                "padding": "12px 16px",
                "font-size": "0.95rem",
                "outline": "none"
              }}
            />
          </div>

          {/* 6. INTEGRAÇÃO GOOGLE AGENDA */}
          <div 
            class="flex flex-col gap-3 p-4 rounded-2xl border"
            style={{
              "background-color": "var(--surface-color)",
              "border-color": "var(--border-color)"
            }}
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <GoogleIcon size={22} />
                <span class="font-archivo text-sm font-medium">
                  Integração Google Agenda
                </span>
              </div>
              {googleConfig().accessToken ? (
                <span class="text-xs border px-2 py-0.5 rounded-full" style={{ "border-color": "var(--text-color)" }}>
                  Conta Conectada
                </span>
              ) : (
                <span class="text-xs border px-2 py-0.5 rounded-full" style={{ "border-color": "var(--border-color)", "color": "var(--text-color)" }}>
                  Pronto para Sincronizar
                </span>
              )}
            </div>

            <div class="flex flex-col gap-2">
              <label class="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={openInGoogleWeb()}
                  onChange={(e) => setOpenInGoogleWeb(e.currentTarget.checked)}
                  class="w-4 h-4 rounded cursor-pointer"
                />
                <span class="text-xs flex items-center gap-1.5 text-dim">
                  <ExternalLinkIcon size={14} />
                  Abrir no Google Agenda ao salvar para adicionar diretamente à sua conta
                </span>
              </label>

              {googleConfig().accessToken && (
                <label class="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={syncWithGoogle()}
                    onChange={(e) => setSyncWithGoogle(e.currentTarget.checked)}
                    class="w-4 h-4 rounded cursor-pointer"
                  />
                  <span class="text-xs text-dim">
                    Sincronizar automaticamente via API do Google Calendar
                  </span>
                </label>
              )}
            </div>
          </div>

          {feedbackMsg() && (
            <div 
              class="p-3 rounded-xl text-center text-sm font-medium"
              style={{
                "background-color": "var(--card-color)",
                "color": "var(--text-color)",
                "border": "1px solid var(--border-color)"
              }}
            >
              {feedbackMsg()}
            </div>
          )}

          {/* 7. BOTÕES DE FINALIZAÇÃO */}
          <div class="flex items-center justify-end gap-3 pt-2 mb-8">
            <button
              type="button"
              onClick={() => navigate('calendar')}
              class="action-button secondary"
              style={{ "min-height": "48px" }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting()}
              class="action-button"
              style={{ "min-height": "48px", "opacity": isSubmitting() ? "0.7" : "1" }}
            >
              <CheckIcon size={18} />
              <span>{isSubmitting() ? 'Salvando...' : 'Salvar Compromisso'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
