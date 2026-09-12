import { createSignal, onMount, onCleanup } from 'solid-js';
import { Squircle } from '../components/Squircle';
import { Watchface } from '../components/Watchface';
import {
  ThermometerIcon,
  WindIcon,
  CloudRainIcon,
  CalendarIcon,
  CaretCircleRightIcon
} from '../components/Icons';
import { viewportWidth, isTablet } from '../viewport';
import { events } from '../calendarStore';
import { activeWatchface } from '../watchfaceStore';
import { navigate } from '../router';
import { CalendarEvent } from '../types';

interface ClimaData {
  temperatura: number;
  vento: number;
  chanceChuva: number;
  condicao?: string;
  maxima?: number;
  minima?: number;
}

export function ClockHome() {
  const [clima, setClima] = createSignal<ClimaData>({
    temperatura: 24,
    vento: 12,
    chanceChuva: 0,
    condicao: 'Ensolarado',
    maxima: 27,
    minima: 18
  });
  const [loading, setLoading] = createSignal(true);

  onMount(() => {
    let isMounted = true;

    // Busca clima com geolocalização ou coordenadas padrão (São Paulo)
    const fetchWeather = async (latitude: number, longitude: number) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        const data = await res.json();

        if (isMounted && data.current_weather) {
          setClima({
            temperatura: Math.ceil(data.current_weather.temperature),
            vento: Math.round(data.current_weather.windspeed),
            chanceChuva: data.daily?.precipitation_probability_max?.[0] ?? 0,
            maxima: Math.ceil(data.daily?.temperature_2m_max?.[0] ?? data.current_weather.temperature + 3),
            minima: Math.floor(data.daily?.temperature_2m_min?.[0] ?? data.current_weather.temperature - 4),
            condicao: data.current_weather.windspeed > 25 ? 'Ventania' : 'Estável'
          });
        }
      } catch (error) {
        if (isMounted) {
          console.warn('Usando dados meteorológicos em cache/fallback:', error);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Fallback para coordenadas padrão caso o usuário negue ou offline
          fetchWeather(-23.5505, -46.6333);
        },
        { timeout: 8000 }
      );
    } else {
      fetchWeather(-23.5505, -46.6333);
    }

    onCleanup(() => {
      isMounted = false;
    });
  });

  // Eventos do calendário mais próximos de até 1 semana (ordenados cronologicamente)
  const upcomingWeekEvents = () => {
    const allEvents = events();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);
    oneWeekLater.setHours(23, 59, 59, 999);

    return allEvents
      .filter((e) => {
        const parts = e.date.split('-').map(Number);
        if (parts.length !== 3) return false;
        const evtDate = new Date(parts[0], parts[1] - 1, parts[2]);
        return evtDate >= today && evtDate <= oneWeekLater;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });
  };

  // Formatação amigável da data do evento ("Hoje", "Amanhã", ou "Qua, 09/09")
  const formatEventDateLabel = (dateStr: string) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    if (dateStr === todayStr) return 'Hoje';
    if (dateStr === tomorrowStr) return 'Amanhã';

    const parts = dateStr.split('-').map(Number);
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' });
      return `${weekday}, ${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  };

  const getCategoryColor = (cat: CalendarEvent['category']) => {
    return { bg: 'var(--card-color)', text: 'var(--text-color)', border: 'var(--border-color)' };
  };

  return (
    <div 
      class="w-full h-full flex flex-col justify-center overflow-y-auto"
      style={{
        "padding": isTablet() ? "16px 20px" : "12px",
        "padding-bottom": "40px",
        "background-color": "var(--bg-color)"
      }}
    >
      <div 
        class="w-full flex items-center justify-center gap-5"
        style={{
          "flex-direction": isTablet() ? "row" : "column",
          "min-height": "100%",
          "max-width": "1600px",
          "margin": "0 auto"
        }}
      >
        {/* Bloco Esquerdo: Relógio Gigante e Data */}
        <Squircle
          cornerRadius={33}
          class="flex flex-col justify-center"
          style={{
            "width": isTablet() ? "65%" : "100%",
            "min-height": isTablet() ? "86vh" : "auto",
            "padding": isTablet() ? "3rem" : "1.5rem",
            "display": "flex",
            "flex-direction": "column",
            "justify-content": "center",
            "background-color": "var(--surface-color)",
            "border": "1px solid var(--border-color)"
          }}
        >
          {/* Watchface ativa — troca de estilo não afeta o restante da Home */}
          <Watchface watchface={activeWatchface()} />
        </Squircle>

        {/* Bloco Direito: Informações Meteorológicas e Próximos Eventos do Calendário */}
        <div
          class="flex flex-col gap-5"
          style={{
            "width": isTablet() ? "35%" : "100%",
            "min-height": isTablet() ? "86vh" : "auto"
          }}
        >
          {/* Linha 1: Temperatura e Vento */}
          <div class="flex gap-5" style={{ "min-height": "clamp(110px, 14vh, 150px)" }}>
            {/* Card Temperatura com Ícone de Termômetro */}
            <Squircle
              cornerRadius={33}
              class="flex-1 flex items-center justify-center gap-3 p-4"
              style={{ "min-height": "100%", "background-color": "var(--surface-color)", "border": "1px solid var(--border-color)", "color": "var(--text-color)" }}
            >
              <ThermometerIcon size={isTablet() ? 44 : 32} color="var(--text-color)" />
              <h3 
                class="font-archivo font-extralight text-center"
                style={{ "font-size": isTablet() ? "clamp(2rem, 3.5vw, 3.75rem)" : "1.8rem" }}
              >
                {clima().temperatura}°C
              </h3>
            </Squircle>

            {/* Card Vento com Ícone de Vento */}
            <Squircle
              cornerRadius={33}
              class="flex-1 flex items-center justify-center gap-3 p-4"
              style={{ "min-height": "100%", "background-color": "var(--surface-color)", "border": "1px solid var(--border-color)", "color": "var(--text-color)" }}
            >
              <WindIcon size={isTablet() ? 44 : 32} color="var(--text-color)" />
              <h3 
                class="font-archivo font-extralight text-center"
                style={{ "font-size": isTablet() ? "clamp(1.8rem, 3.2vw, 3.25rem)" : "1.6rem" }}
              >
                {clima().vento} km/h
              </h3>
            </Squircle>
          </div>

          {/* Linha 2: Chance de Chuva com Ícone de Nuvem com Chuva */}
          <div style={{ "min-height": "clamp(85px, 9vh, 100px)" }}>
            <Squircle
              cornerRadius={33}
              class="w-full h-full flex items-center justify-center gap-3 p-4"
              style={{ "background-color": "var(--surface-color)", "border": "1px solid var(--border-color)", "color": "var(--text-color)" }}
            >
              <CloudRainIcon size={isTablet() ? 44 : 32} color="var(--text-color)" />
              <h3
                class="font-archivo font-extralight text-center"
                style={{ "font-size": isTablet() ? "clamp(1.5rem, 2.5vw, 2.75rem)" : "1.3rem" }}
              >
                {clima().chanceChuva}% de chance de chuva
              </h3>
            </Squircle>
          </div>

          {/* Divisor elegante */}
          <div class="divider" style={{ "background": "var(--border-color)", "opacity": "0.5" }}></div>

          {/* ========================================================================= */}
          {/* SEÇÃO INFERIOR DIREITA: PRÓXIMOS EVENTOS (100% TOUCH-FRIENDLY, SCROLL)    */}
          {/* ========================================================================= */}
          <Squircle
            cornerRadius={33}
            class="flex-1 flex flex-col justify-between p-5"
            style={{
              "min-height": isTablet() ? "250px" : "210px",
              "overflow": "hidden",
              "display": "flex",
              "flex-direction": "column",
              "background-color": "var(--surface-color)",
              "border": "1px solid var(--border-color)",
              "color": "var(--text-color)"
            }}
          >
            {/* Cabeçalho Limpo e Focado (Sem dados de temperatura) */}
            <div 
              class="flex items-center justify-between border-b" 
              style={{ 
                "padding-bottom": "12px", 
                "border-color": "var(--border-color)" 
              }}
            >
              <div 
                class="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate('calendar')}
                title="Abrir Calendário Completo"
              >
                <CalendarIcon size={isTablet() ? 28 : 24} color="var(--text-color)" />
                <h3 
                  class="font-archivo font-light"
                  style={{ "font-size": isTablet() ? "1.5rem" : "1.2rem", "letter-spacing": "-0.02em" }}
                >
                  Próximos 7 Dias
                </h3>
              </div>

              {/* Botão Touch-Friendly para Ver Agenda Completa */}
              <button
                onClick={() => navigate('calendar')}
                class="action-button secondary"
                style={{
                  "padding": "6px 14px",
                  "font-size": "0.82rem",
                  "min-height": "36px"
                }}
              >
                <span>Agenda</span>
                <span>→</span>
              </button>
            </div>

            {/* Lista Touch-Friendly de Eventos com Scroll Confinado Exclusivamente à Área */}
            <div
              class="flex-1 flex flex-col gap-3 overflow-y-auto"
              style={{
                "margin-top": "12px",
                "padding-right": "4px",
                "-webkit-overflow-scrolling": "touch"
              }}
            >
              {upcomingWeekEvents().length === 0 ? (
                <div class="flex flex-col items-center justify-center text-muted" style={{ "padding": "2rem 0", "text-align": "center" }}>
                  <p class="font-archivo font-extralight text-sm">
                    Nenhum compromisso marcado para os próximos 7 dias.
                  </p>
                  <button 
                    onClick={() => navigate('calendar')}
                    class="action-button secondary"
                    style={{
                      "margin-top": "10px",
                      "font-size": "0.85rem"
                    }}
                  >
                    + Agendar Compromisso
                  </button>
                </div>
              ) : (
                upcomingWeekEvents().map((evt) => {
                  const colors = getCategoryColor(evt.category);
                  return (
                    <div
                      onClick={() => navigate('calendar')}
                      class="flex items-center justify-between transition-all cursor-pointer select-none"
                      style={{
                        "min-height": "50px",
                        "padding": "10px 14px",
                        "border-radius": "16px",
                        "background-color": "var(--card-color)",
                        "border": "1px solid var(--border-color)",
                        "transition": "all 0.15s ease",
                        "gap": "12px",
                        "overflow": "hidden"
                      }}
                    >
                      {/* Lado Esquerdo: Badge da Data e Título do Evento */}
                      <div class="flex items-center gap-3 overflow-hidden flex-1" style={{ "min-width": "0" }}>
                        <span
                          style={{
                            "font-size": "0.75rem",
                            "font-weight": "600",
                            "padding": "4px 10px",
                            "border-radius": "8px",
                            "background-color": colors.bg,
                            "color": colors.text,
                            "border": `1px solid ${colors.border}`,
                            "white-space": "nowrap",
                            "min-width": "64px",
                            "flex-shrink": "0",
                            "text-align": "center"
                          }}
                        >
                          {formatEventDateLabel(evt.date)}
                        </span>

                        <div class="flex flex-col overflow-hidden" style={{ "min-width": "0", "flex": "1" }}>
                          <span
                            class="font-archivo font-medium truncate"
                            style={{ "font-size": "0.95rem", "letter-spacing": "-0.01em", "color": "var(--text-color)" }}
                          >
                            {evt.title}
                          </span>
                          {evt.description && (
                            <span
                              class="text-xs truncate font-light"
                              style={{ "font-size": "0.75rem", "color": "var(--text-color)", "opacity": "0.7" }}
                            >
                              {evt.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Lado Direito: Horário e Seta */}
                      <div class="flex items-center gap-2" style={{ "white-space": "nowrap", "flex-shrink": "0" }}>
                        <span
                          class="font-archivo font-light"
                          style={{ "font-size": "0.85rem", "color": "var(--text-color)", "opacity": "0.7" }}
                        >
                          {evt.time}
                        </span>
                        <CaretCircleRightIcon size={20} color="var(--text-color)" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Squircle>
        </div>
      </div>
    </div>
  );
}
