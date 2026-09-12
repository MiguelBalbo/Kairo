import { Show, For, createSignal, createEffect, onCleanup } from 'solid-js';
import { currentRoute, navigate } from '../router';
import { Route } from '../types';
import { isTablet } from '../viewport';

const CLOSE_ANIM_MS = 200;

interface FloatingNavProps {
  isOpen: boolean;
  onClose: () => void;
  openedAt?: number;
}

export function FloatingNav(props: FloatingNavProps) {
  // Mantém o menu montado durante a animação de saída — <Show> por si só remove
  // o elemento instantaneamente, sem tocar nenhuma transição de fechamento.
  const [shouldRender, setShouldRender] = createSignal(false);
  const [isClosing, setIsClosing] = createSignal(false);
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  createEffect(() => {
    if (props.isOpen) {
      clearTimeout(closeTimer);
      setIsClosing(false);
      setShouldRender(true);
    } else if (shouldRender()) {
      setIsClosing(true);
      closeTimer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, CLOSE_ANIM_MS);
    }
  });

  onCleanup(() => clearTimeout(closeTimer));

  const routes: { id: Route; name: string }[] = [
    { id: 'home', name: 'Relógio' },
    { id: 'calendar', name: 'Calendário' },
    { id: 'photos', name: 'Porta-Retratos' },
    { id: 'notes', name: 'Notas' },
    { id: 'contacts', name: 'Contatos' },
    { id: 'settings', name: 'Configurações' }
  ];

  const handleBackdropClick = (e: MouseEvent) => {
    e.stopPropagation();
    // Previne que o soltar do mouse/touch do próprio gesto de abertura feche o menu imediatamente
    if (props.openedAt && Date.now() - props.openedAt < 300) {
      return;
    }
    props.onClose();
  };

  return (
    <Show when={shouldRender()}>
      <div
        class="fixed inset-0 z-50 flex items-end justify-center select-none"
        style={{
          "pointer-events": "auto"
        }}
      >
        {/* Backdrop para fechar o menu ao clicar fora */}
        <div
          onClick={handleBackdropClick}
          class="fixed inset-0"
          style={{
            "background-color": "color-mix(in srgb, var(--bg-color) 80%, transparent)",
            "backdrop-filter": "blur(8px)",
            "-webkit-backdrop-filter": "blur(8px)",
            "z-index": "51",
            "animation": `${isClosing() ? 'backdropFadeOut' : 'backdropFadeIn'} ${isClosing() ? CLOSE_ANIM_MS : 200}ms ease forwards`
          }}
        />

        {/* Container Flutuante com Gradiente no Fundo e Pílulas */}
        <div
          onClick={(e) => e.stopPropagation()}
          class="relative flex items-center justify-center gap-2"
          style={{
            "z-index": "52",
            "margin-bottom": isTablet() ? "36px" : "20px",
            "padding": "12px 18px",
            "max-width": "92vw",
            "background": "var(--surface-color)",
            "border": "1px solid var(--border-color)",
            "border-radius": isTablet() ? "9999px" : "16px",
            "flex-wrap": isTablet() ? "nowrap" : "wrap",
            "box-shadow": "0 8px 30px color-mix(in srgb, var(--bg-color) 60%, transparent)",
            "backdrop-filter": "blur(24px)",
            "-webkit-backdrop-filter": "blur(24px)",
            "animation": isClosing()
              ? `slideDownMenu ${CLOSE_ANIM_MS}ms cubic-bezier(0.4, 0, 1, 1) forwards`
              : "slideUpMenu 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards"
          }}
        >
          <For each={routes}>
            {(item) => {
              const isActive = () => currentRoute() === item.id;
              return (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(item.id);
                    props.onClose(); // auto close when a navigation happens
                  }}
                  class="font-archivo transition-all cursor-pointer"
                  style={{
                    "border-radius": "9999px",
                    "padding": isTablet() ? "12px 24px" : "10px 16px",
                    "font-size": isTablet() ? "0.95rem" : "0.85rem",
                    "font-weight": isActive() ? "600" : "400",
                    "color": isActive() ? "var(--accent-text)" : "var(--text-color)",
                    "background": isActive() ? "var(--accent-color)" : "transparent",
                    "border": isActive() 
                      ? "1px solid var(--accent-color)" 
                      : "1px solid transparent",
                    "white-space": "nowrap",
                    "min-height": isTablet() ? "44px" : "40px",
                    "display": "inline-flex",
                    "align-items": "center",
                    "justify-content": "center"
                  }}
                >
                  {item.name}
                </button>
              );
            }}
          </For>
        </div>

        <style>{`
          @keyframes slideUpMenu {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes slideDownMenu {
            from {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
            to {
              opacity: 0;
              transform: translateY(30px) scale(0.96);
            }
          }
          @keyframes backdropFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes backdropFadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
        `}</style>
      </div>
    </Show>
  );
}
