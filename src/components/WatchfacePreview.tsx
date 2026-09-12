import { Watchface } from './Watchface';
import { Watchface as WatchfaceData } from '../types';

// Dimensões de referência que aproximam o card real do relógio na Home (tablet,
// padding de 3rem, conteúdo centralizado). O preview renderiza a watchface nesse
// "canvas" de tamanho fixo e depois encolhe tudo via transform:scale — assim a
// miniatura é sempre fiel ao componente real, sem duplicar nenhuma lógica de layout.
const REF_WIDTH = 620;
const REF_HEIGHT = 680;
const ASPECT = REF_HEIGHT / REF_WIDTH;

interface WatchfacePreviewProps {
  watchface: WatchfaceData;
  size?: number;
}

export function WatchfacePreview(props: WatchfacePreviewProps) {
  const width = () => props.size ?? 84;
  const height = () => width() * ASPECT;
  const scale = () => width() / REF_WIDTH;

  return (
    <div
      style={{
        "width": `${width()}px`,
        "height": `${height()}px`,
        "overflow": "hidden",
        "border-radius": "10px",
        "border": "1px solid var(--border-color)",
        "background-color": "var(--surface-color)",
        "position": "relative",
        "flex": "0 0 auto"
      }}
    >
      <div
        style={{
          "position": "absolute",
          "top": "0",
          "left": "0",
          "width": `${REF_WIDTH}px`,
          "height": `${REF_HEIGHT}px`,
          "transform": `scale(${scale()})`,
          "transform-origin": "top left",
          "display": "flex",
          "flex-direction": "column",
          "justify-content": "center",
          "padding": "3rem",
          "pointer-events": "none"
        }}
      >
        <Watchface watchface={props.watchface} forceTabletSizing />
      </div>
    </div>
  );
}
