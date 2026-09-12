import { JSX } from 'solid-js';

interface ButtonProps {
  children: JSX.Element;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function Button(props: ButtonProps) {
  // Reaproveita o botão-pílula padrão do app (.action-button, definido em index.html)
  // em vez de reimplementar a mesma aparência com uma segunda fonte de verdade.
  const getClass = () => {
    const variant = props.variant || 'primary';
    return variant === 'primary' || variant === 'danger'
      ? 'action-button'
      : 'action-button secondary';
  };

  const getStyles = () => {
    const size = props.size || 'md';
    const padding = size === 'sm' ? '8px 14px' : size === 'lg' ? '12px 24px' : '10px 18px';
    const fontSize = size === 'sm' ? '0.8rem' : size === 'lg' ? '1rem' : '0.875rem';

    return {
      "padding": padding,
      "font-size": fontSize,
      "width": props.fullWidth ? "100%" : "auto",
      "min-height": size === 'sm' ? "2.25rem" : "3rem",
      // "ghost" reaproveita a borda/cor do secondary, só troca o fundo para transparente
      "background-color": props.variant === 'ghost' ? 'transparent' : undefined
    };
  };

  return (
    <button
      class={getClass()}
      style={getStyles()}
      onClick={() => props.onClick && props.onClick()}
    >
      {props.children}
    </button>
  );
}
