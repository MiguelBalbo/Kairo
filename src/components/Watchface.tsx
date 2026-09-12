import { createSignal, onMount, onCleanup, For, JSX } from 'solid-js';
import { Watchface as WatchfaceData, WatchfaceElement } from '../types';
import { formatTimeToken } from '../watchfaceStore';
import { isTablet } from '../viewport';

interface WatchfaceProps {
  watchface: WatchfaceData;
  // Usado pelo WatchfacePreview: ignora o breakpoint real e sempre usa os
  // tamanhos de tablet, para a miniatura ficar consistente em qualquer tela.
  forceTabletSizing?: boolean;
}

// Renderiza a watchface ativa dentro do card de relógio da Home. Cada watchface é
// uma pilha vertical de elementos declarativos (ver WATCHFACES.md); este componente
// é o único intérprete desse formato — tanto a watchface padrão quanto as
// customizadas importadas (e suas miniaturas de preview) passam pelo mesmo código.
export function Watchface(props: WatchfaceProps) {
  const [now, setNow] = createSignal(new Date());
  const useTabletSizing = () => props.forceTabletSizing || isTablet();

  onMount(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    onCleanup(() => clearInterval(timer));
  });

  const formattedDate = (style: 'long' | 'short') => {
    if (style === 'short') {
      const raw = now().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    }
    return now().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const textStyle = (el: {
    fontWeight?: number;
    letterSpacing?: string;
    lineHeight?: string;
    marginTop?: string;
    marginTopMobile?: string;
    opacity?: number;
  }): JSX.CSSProperties => ({
    "color": "var(--text-color)",
    "font-weight": String(el.fontWeight ?? 200),
    "letter-spacing": el.letterSpacing,
    "line-height": el.lineHeight,
    "opacity": el.opacity !== undefined ? String(el.opacity) : "1",
    "margin": "0",
    "margin-top": (useTabletSizing() ? el.marginTop : el.marginTopMobile ?? el.marginTop) ?? "0",
    "padding": "0"
  });

  const renderElement = (el: WatchfaceElement) => {
    switch (el.type) {
      case 'time-text':
        return (
          <h1
            class={`font-archivo${el.uppercase ? ' uppercase' : ''}`}
            style={{
              ...textStyle(el),
              "font-size": useTabletSizing() ? el.fontSize : el.fontSizeMobile
            }}
          >
            {formatTimeToken(now(), el.format)}
          </h1>
        );

      case 'date-text':
        return (
          <h2
            class={`font-archivo${el.uppercase ? ' uppercase' : ''}`}
            style={{
              ...textStyle(el),
              "font-size": useTabletSizing() ? el.fontSize : el.fontSizeMobile,
              "text-transform": el.uppercase ? "uppercase" : "capitalize"
            }}
          >
            {formattedDate(el.style)}
          </h2>
        );

      case 'label-text':
        return (
          <p
            class={`font-archivo${el.uppercase ? ' uppercase' : ''}`}
            style={{
              ...textStyle(el),
              "font-size": useTabletSizing() ? el.fontSize : el.fontSizeMobile
            }}
          >
            {el.text}
          </p>
        );

      case 'divider':
        return (
          <div
            class="divider"
            style={{ "background": "var(--border-color)", "opacity": "0.5", "margin-top": el.marginTop ?? "0.5rem" }}
          />
        );

      case 'analog-clock':
        return <AnalogClock el={el} now={now()} tabletSizing={useTabletSizing()} />;

      case 'digit-cells':
        return <DigitCells el={el} now={now()} tabletSizing={useTabletSizing()} />;

      default:
        return null;
    }
  };

  return (
    <div class="flex flex-col" style={{ "width": "100%" }}>
      <For each={props.watchface.elements}>{(el) => renderElement(el)}</For>
    </div>
  );
}

function AnalogClock(props: { el: Extract<WatchfaceElement, { type: 'analog-clock' }>; now: Date; tabletSizing: boolean }) {
  const seconds = () => props.now.getSeconds();
  const minutes = () => props.now.getMinutes();
  const hours = () => props.now.getHours() % 12;

  const secondsDeg = () => seconds() * 6;
  const minutesDeg = () => minutes() * 6 + seconds() * 0.1;
  const hoursDeg = () => hours() * 30 + minutes() * 0.5;

  const ticks = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <div
      style={{
        "width": props.tabletSizing ? props.el.diameter : props.el.diameterMobile,
        "height": props.tabletSizing ? props.el.diameter : props.el.diameterMobile,
        "margin": props.el.marginTop ? `${props.el.marginTop} auto 0` : "0 auto"
      }}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        <circle cx="100" cy="100" r="94" fill="none" stroke="var(--border-color)" stroke-width="3" />

        {props.el.tickMarks && ticks.map((deg) => (
          <line
            x1="100" y1="10" x2="100" y2="22"
            stroke="var(--text-color)"
            stroke-width="3"
            stroke-linecap="round"
            opacity="0.6"
            transform={`rotate(${deg} 100 100)`}
          />
        ))}

        {/* Ponteiro das horas */}
        <line
          x1="100" y1="100" x2="100" y2="56"
          stroke="var(--text-color)" stroke-width="6" stroke-linecap="round"
          transform={`rotate(${hoursDeg()} 100 100)`}
        />
        {/* Ponteiro dos minutos */}
        <line
          x1="100" y1="100" x2="100" y2="32"
          stroke="var(--text-color)" stroke-width="4" stroke-linecap="round" opacity="0.85"
          transform={`rotate(${minutesDeg()} 100 100)`}
        />
        {/* Ponteiro dos segundos */}
        {props.el.showSeconds && (
          <line
            x1="100" y1="112" x2="100" y2="24"
            stroke="var(--text-color)" stroke-width="1.5" stroke-linecap="round" opacity="0.6"
            transform={`rotate(${secondsDeg()} 100 100)`}
          />
        )}

        <circle cx="100" cy="100" r="5" fill="var(--text-color)" />
      </svg>
    </div>
  );
}

function DigitCells(props: { el: Extract<WatchfaceElement, { type: 'digit-cells' }>; now: Date; tabletSizing: boolean }) {
  const text = () => formatTimeToken(props.now, props.el.format);
  const fontSize = () => (props.tabletSizing ? props.el.fontSize : props.el.fontSizeMobile);

  return (
    <div
      class="flex items-center font-archivo font-medium"
      style={{ "gap": "0.35rem", "margin-top": props.el.marginTop ?? "0" }}
    >
      <For each={text().split('')}>
        {(char) =>
          char === ':' ? (
            <span style={{ "color": "var(--text-color)", "font-size": fontSize(), "opacity": "0.5" }}>
              :
            </span>
          ) : (
            <span
              style={{
                "display": "inline-flex",
                "align-items": "center",
                "justify-content": "center",
                "min-width": "1.1em",
                "padding": "0 0.15em",
                "background-color": "var(--card-color)",
                "border": "1px solid var(--border-color)",
                "border-radius": "12px",
                "color": "var(--text-color)",
                "font-size": fontSize()
              }}
            >
              {char}
            </span>
          )
        }
      </For>
    </div>
  );
}
