import { JSX } from 'solid-js';

interface SquircleProps {
  children: JSX.Element;
  cornerRadius?: number;
  class?: string;
  style?: JSX.CSSProperties;
  onClick?: () => void;
}

export function Squircle(props: SquircleProps) {
  const radius = props.cornerRadius || 33;

  return (
    <div
      class={`squircle ${props.class || ''}`}
      onClick={() => props.onClick && props.onClick()}
      style={{
        "border-radius": `${radius}px`,
        ...props.style
      }}
    >
      {props.children}
    </div>
  );
}
