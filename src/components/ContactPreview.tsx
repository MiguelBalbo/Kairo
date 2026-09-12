import { Squircle } from './Squircle';
import { CaretCircleRightIcon } from './Icons';
import { Contact } from '../types';
import { formatarTelefone } from '../contactsStore';

interface ContactPreviewProps {
  contato: Contact;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ContactPreview(props: ContactPreviewProps) {
  return (
    <Squircle
      cornerRadius={16}
      onClick={props.onClick}
      class="flex justify-between items-center cursor-pointer"
      style={{
        "padding": "1rem 1.4rem",
        "margin-bottom": "8px",
        "background-color": props.isSelected 
          ? "var(--card-color)" 
          : "var(--surface-color)",
        "border": props.isSelected 
          ? "2px solid var(--accent-color)" 
          : "1px solid var(--border-color)",
        "transition": "all 0.15s ease",
        "cursor": "pointer"
      }}
    >
      <p class="font-archivo font-extralight truncate" style={{ "font-size": "1.2rem", "letter-spacing": "-0.01em", "flex": "1", "min-width": "0" }}>
        {props.contato.nome}
      </p>

      <div class="flex gap-3 items-center" style={{ "flex-shrink": "0" }}>
        <p class="font-archivo font-extralight text-muted" style={{ "font-size": "1rem" }}>
          {formatarTelefone(props.contato.tel)}
        </p>
        <CaretCircleRightIcon size={24} />
      </div>
    </Squircle>
  );
}
