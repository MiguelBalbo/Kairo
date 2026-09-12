import { createSignal, onMount, onCleanup, createEffect } from 'solid-js';
import { Squircle } from '../components/Squircle';
import { 
  photos, 
  currentIndex, 
  isPlaying, 
  intervalSeconds, 
  nextPhoto, 
  prevPhoto, 
  togglePlay 
} from '../photosStore';
import { PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon } from '../components/Icons';
import { isTablet } from '../viewport';

// Overlay sobre as fotos: contraste fixo (não segue --bg-color/--text-color de propósito),
// para permanecer legível sobre qualquer foto e em qualquer tema, como um OSD de player de mídia.
const PHOTO_BG = '#000000';
const OVERLAY_BG = 'rgba(0, 0, 0, 0.55)';
const OVERLAY_BORDER = 'rgba(255, 255, 255, 0.25)';
const OVERLAY_BUTTON_BG = 'rgba(255, 255, 255, 0.2)';
const OVERLAY_TEXT = '#ffffff';
const OVERLAY_TEXT_DIM = '#e2e8f0';
const OVERLAY_TEXT_MUTED = '#94a3b8';
const OVERLAY_SHADOW_GRADIENT = 'linear-gradient(to top, rgba(0, 0, 0, 0.45), transparent)';
const CLOCK_CARD_BG = 'rgba(255, 255, 255, 0.52)';
const CLOCK_CARD_BORDER = 'rgba(255, 255, 255, 0.4)';
const CLOCK_CARD_SHADOW = '0 8px 32px rgba(0, 0, 0, 0.25)';
const CLOCK_CARD_TEXT = '#111827';
const CLOCK_CARD_TEXT_DIM = '#1f2937';

export function PhotoFrame() {
  const [horario, setHorario] = createSignal(new Date());
  const [controlsVisible, setControlsVisible] = createSignal(true);
  let hideControlsTimer: any;

  // Atualiza o relógio a cada segundo
  onMount(() => {
    const clockTimer = setInterval(() => setHorario(new Date()), 1000);

    // Timer do slideshow de fotos
    let slideTimer: any;

    const resetSlideTimer = () => {
      if (slideTimer) clearInterval(slideTimer);
      if (isPlaying()) {
        slideTimer = setInterval(() => {
          nextPhoto();
        }, intervalSeconds() * 1000);
      }
    };

    resetSlideTimer();

    createEffect(() => {
      // Reage a mudanças no status de reprodução ou intervalo
      isPlaying();
      intervalSeconds();
      resetSlideTimer();
    });

    // Oculta os controles automaticamente após 4 segundos de inatividade
    const handleUserInteraction = () => {
      setControlsVisible(true);
      if (hideControlsTimer) clearTimeout(hideControlsTimer);
      hideControlsTimer = setTimeout(() => {
        setControlsVisible(false);
      }, 4500);
    };

    window.addEventListener('mousemove', handleUserInteraction);
    window.addEventListener('touchstart', handleUserInteraction);
    handleUserInteraction();

    onCleanup(() => {
      clearInterval(clockTimer);
      if (slideTimer) clearInterval(slideTimer);
      if (hideControlsTimer) clearTimeout(hideControlsTimer);
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    });
  });

  const formattedTime = () => {
    return horario().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formattedDate = () => {
    // Formato fiel à referência: "Sábado, 06 de agosto"
    const raw = horario().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long'
    });
    // Capitaliza a primeira letra do dia da semana
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  const currentPhoto = () => {
    const list = photos();
    if (list.length === 0) return null;
    return list[currentIndex() % list.length];
  };

  return (
    <div 
      class="w-full h-full relative overflow-hidden flex items-center justify-center select-none"
      style={{ "background-color": PHOTO_BG }}
    >
      {/* Imagem de Fundo em Tela Cheia com Transição Suave */}
      {currentPhoto() ? (
        <img
          src={currentPhoto()?.url}
          alt={currentPhoto()?.name || "Foto"}
          class="w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
          style={{
            "position": "absolute",
            "top": "0",
            "left": "0",
            "width": "100%",
            "height": "100%",
            "object-fit": "cover",
            "filter": "brightness(0.95)"
          }}
        />
      ) : (
        <div class="text-lg font-archivo font-light" style={{ "color": OVERLAY_TEXT }}>
          Nenhuma foto disponível. Adicione fotos nas Configurações.
        </div>
      )}

      {/* Sombra sutil na parte inferior para garantir legibilidade perfeita */}
      <div 
        style={{
          "position": "absolute",
          "bottom": "0",
          "left": "0",
          "right": "0",
          "height": "40%",
          "background": OVERLAY_SHADOW_GRADIENT,
          "pointer-events": "none"
        }}
      />

      {/* ========================================================================= */}
      {/* CARD DE RELÓGIO E DATA NO CANTO (Fiel ao iMac - 6.png)                    */}
      {/* ========================================================================= */}
      <div
        style={{
          "position": "absolute",
          "bottom": isTablet() ? "32px" : "80px",
          "left": isTablet() ? "32px" : "50%",
          "transform": isTablet() ? "none" : "translateX(-50%)",
          "z-index": "20"
        }}
      >
        <Squircle
          cornerRadius={33}
          class="flex flex-col justify-center"
          style={{
            "background-color": CLOCK_CARD_BG,
            "backdrop-filter": "blur(24px)",
            "-webkit-backdrop-filter": "blur(24px)",
            "border": `1px solid ${CLOCK_CARD_BORDER}`,
            "padding": isTablet() ? "1.6rem 2.8rem" : "1.2rem 1.8rem",
            "box-shadow": CLOCK_CARD_SHADOW,
            "color": CLOCK_CARD_TEXT
          }}
        >
          {/* Horário no topo em destaque */}
          <h1
            class="font-archivo font-thin"
            style={{
              "font-size": isTablet() ? "4.5rem" : "2.8rem",
              "line-height": "1",
              "letter-spacing": "-0.04em",
              "margin": "0 0 4px 0",
              "color": CLOCK_CARD_TEXT
            }}
          >
            {formattedTime()}
          </h1>

          {/* Data por extenso: "Sábado, 06 de agosto" */}
          <h2
            class="font-archivo font-extralight"
            style={{
              "font-size": isTablet() ? "2.2rem" : "1.4rem",
              "line-height": "1.2",
              "margin": "0",
              "color": CLOCK_CARD_TEXT_DIM,
              "letter-spacing": "-0.02em"
            }}
          >
            {formattedDate()}
          </h2>
        </Squircle>
      </div>

      {/* Controles de Slideshow no Canto Inferior Direito */}
      <div
        style={{
          "position": "absolute",
          "bottom": isTablet() ? "32px" : "20px",
          "right": isTablet() ? "32px" : "auto",
          "left": isTablet() ? "auto" : "50%",
          "transform": isTablet() ? "none" : "translateX(-50%)",
          "z-index": "30",
          "opacity": controlsVisible() ? "1" : "0",
          "pointer-events": controlsVisible() ? "auto" : "none",
          "transition": "opacity 0.3s ease"
        }}
      >
        <div
          class="flex items-center gap-2"
          style={{
            "background-color": OVERLAY_BG,
            "border": `1px solid ${OVERLAY_BORDER}`,
            "backdrop-filter": "blur(12px)",
            "-webkit-backdrop-filter": "blur(12px)",
            "padding": "8px 14px",
            "border-radius": "30px",
            "color": OVERLAY_TEXT
          }}
        >
          {/* Botão Foto Anterior */}
          <button
            onClick={prevPhoto}
            style={{ "color": OVERLAY_TEXT_DIM, "padding": "6px", "cursor": "pointer" }}
            title="Foto Anterior"
          >
            <SkipBackIcon size={20} />
          </button>

          {/* Botão Play / Pause */}
          <button
            onClick={togglePlay}
            style={{
              "background-color": OVERLAY_BUTTON_BG,
              "border-radius": "50%",
              "width": "36px",
              "height": "36px",
              "display": "flex",
              "align-items": "center",
              "justify-content": "center",
              "color": OVERLAY_TEXT,
              "cursor": "pointer"
            }}
            title={isPlaying() ? "Pausar Slideshow" : "Iniciar Slideshow"}
          >
            {isPlaying() ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
          </button>

          {/* Botão Próxima Foto */}
          <button
            onClick={nextPhoto}
            style={{ "color": OVERLAY_TEXT_DIM, "padding": "6px", "cursor": "pointer" }}
            title="Próxima Foto"
          >
            <SkipForwardIcon size={20} />
          </button>

          {/* Indicador de Índice */}
          <span
            class="text-xs font-archivo font-light"
            style={{ "margin-left": "6px", "color": OVERLAY_TEXT_MUTED }}
          >
            {currentIndex() + 1} / {photos().length}
          </span>
        </div>
      </div>
    </div>
  );
}
