import { JSX } from 'solid-js';

interface CardProps {
  children: JSX.Element;
  title?: string;
  subtitle?: string;
  badge?: string;
  onClick?: () => void;
  style?: JSX.CSSProperties;
}

export function Card(props: CardProps) {
  const isClickable = !!props.onClick;

  return (
    <div
      onClick={() => props.onClick && props.onClick()}
      style={{
        "background-color": "var(--surface-color)",
        "border": "1px solid var(--border-color)",
        "border-radius": "16px",
        "padding": "16px",
        "cursor": isClickable ? "pointer" : "default",
        "transition": "border-color 0.15s ease, background-color 0.15s ease",
        "color": "var(--text-color)",
        ...props.style
      }}
    >
      {(props.title || props.badge) && (
        <div class="flex items-center justify-between" style={{ "margin-bottom": "8px" }}>
          {props.title && <h3 class="text-sm font-semibold">{props.title}</h3>}
          {props.badge && (
            <span 
              class="text-xs" 
              style={{
                "background-color": "var(--card-color)",
                "color": "var(--text-color)",
                "padding": "2px 8px",
                "border-radius": "4px",
                "font-weight": "500"
              }}
            >
              {props.badge}
            </span>
          )}
        </div>
      )}
      {props.subtitle && (
        <p class="text-xs text-muted" style={{ "margin-bottom": "10px" }}>
          {props.subtitle}
        </p>
      )}
      <div>{props.children}</div>
    </div>
  );
}
