import { JSX } from 'solid-js';

interface IconProps {
  size?: number;
  class?: string;
  color?: string;
  style?: JSX.CSSProperties;
}

export function ThermometerIcon(props: IconProps) {
  const s = props.size || 36;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <path d="M128,48a24,24,0,0,0-24,24v82.49a48,48,0,1,0,48,0V72A24,24,0,0,0,128,48Z" />
      <circle cx="128" cy="184" r="24" fill={props.color || "currentColor"} />
      <line x1="128" y1="128" x2="128" y2="160" stroke-width="18" />
    </svg>
  );
}

export function WindIcon(props: IconProps) {
  const s = props.size || 36;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <path d="M129.48449,192.32854A24.00285,24.00285,0,1,0,152,160H40" />
      <path d="M97.48449,63.67146A24.00285,24.00285,0,1,1,120,96H24" />
      <path d="M185.48449,95.67146A24.00285,24.00285,0,1,1,208,128H32" />
    </svg>
  );
}

export function CloudRainIcon(props: IconProps) {
  const s = props.size || 36;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <path d="M88,152A56,56,0,1,1,144,96h8a40,40,0,1,1,38.86,49.88" />
      <line x1="96" y1="176" x2="80" y2="216" />
      <line x1="136" y1="176" x2="120" y2="216" />
      <line x1="176" y1="176" x2="160" y2="216" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  const s = props.size || 36;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <rect x="40" y="48" width="176" height="160" rx="20" />
      <line x1="40" y1="96" x2="216" y2="96" />
      <line x1="88" y1="28" x2="88" y2="56" />
      <line x1="168" y1="28" x2="168" y2="56" />
    </svg>
  );
}

export function CaretLeftIcon(props: IconProps) {
  const s = props.size || 24;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="20"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <polyline points="160 208 80 128 160 48" />
    </svg>
  );
}

export function CaretRightIcon(props: IconProps) {
  const s = props.size || 24;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="20"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <polyline points="96 48 176 128 96 208" />
    </svg>
  );
}

export function XIcon(props: IconProps) {
  const s = props.size || 24;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="20"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <line x1="200" y1="56" x2="56" y2="200" />
      <line x1="200" y1="200" x2="56" y2="56" />
    </svg>
  );
}

export function MagnifyingGlassIcon(props: IconProps) {
  const s = props.size || 32;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <circle cx="112" cy="112" r="80" />
      <line x1="168.49" y1="168.49" x2="224" y2="224" />
    </svg>
  );
}

export function CaretCircleRightIcon(props: IconProps) {
  const s = props.size || 32;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <circle cx="128" cy="128" r="96" />
      <polyline points="120 88 160 128 120 168" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  const s = props.size || 28;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="20"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <line x1="40" y1="128" x2="216" y2="128" />
      <line x1="128" y1="40" x2="128" y2="216" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  const s = props.size || 28;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <circle cx="128" cy="96" r="64" />
      <path d="M32,216a96,96,0,0,1,192,0" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  const s = props.size || 28;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <path d="M92.4,121.6a144.3,144.3,0,0,0,42,42l24.4-24.4a16,16,0,0,1,16.2-3.8,115.6,115.6,0,0,0,36.2,5.8,16,16,0,0,1,16,16v32a16,16,0,0,1-16,16A192,192,0,0,1,16,32,16,16,0,0,1,32,16H64a16,16,0,0,1,16,16,115.6,115.6,0,0,0,5.8,36.2,16,16,0,0,1-3.8,16.2Z" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  const s = props.size || 28;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <circle cx="128" cy="104" r="32" />
      <path d="M208,104c0,72-80,128-80,128S48,176,48,104a80,80,0,0,1,160,0Z" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  const s = props.size || 24;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <line x1="216" y1="56" x2="40" y2="56" />
      <line x1="104" y1="104" x2="104" y2="168" />
      <line x1="152" y1="104" x2="152" y2="168" />
      <path d="M200,56V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V56" />
      <path d="M168,56V40a16,16,0,0,0-16-16H104A16,16,0,0,0,88,40V56" />
    </svg>
  );
}

export function PencilIcon(props: IconProps) {
  const s = props.size || 28;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <path d="M92.7,216H48a8,8,0,0,1-8-8V163.3a7.9,7.9,0,0,1,2.3-5.6l120-120a8,8,0,0,1,11.4,0l44.6,44.7a8,8,0,0,1,0,11.4l-120,120A8.2,8.2,0,0,1,92.7,216Z" />
      <line x1="136" y1="64" x2="192" y2="120" />
    </svg>
  );
}

export function NoteIcon(props: IconProps) {
  const s = props.size || 28;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <rect x="40" y="40" width="176" height="176" rx="16" />
      <line x1="80" y1="88" x2="176" y2="88" />
      <line x1="80" y1="128" x2="176" y2="128" />
      <line x1="80" y1="168" x2="136" y2="168" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  const s = props.size || 28;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="20"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <polyline points="40 136 96 192 216 72" />
    </svg>
  );
}

export function ImageIcon(props: IconProps) {
  const s = props.size || 28;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <rect x="32" y="48" width="192" height="160" rx="16" />
      <circle cx="88" cy="100" r="16" fill={props.color || "currentColor"} />
      <path d="M32,184l64-64,48,48,40-40,40,40" />
    </svg>
  );
}

export function FolderIcon(props: IconProps) {
  const s = props.size || 28;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <path d="M216,72H131.31L104,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V88A16,16,0,0,0,216,72Z" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  const s = props.size || 24;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="currentColor"
      style={props.style}
    >
      <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-24.32-13.51V40a16,16,0,0,1,24.32-13.51L232.4,114.49A15.74,15.74,0,0,1,240,128Z" />
    </svg>
  );
}

export function PauseIcon(props: IconProps) {
  const s = props.size || 24;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="currentColor"
      style={props.style}
    >
      <path d="M216,48V208a16,16,0,0,1-16,16H160a16,16,0,0,1-16-16V48a16,16,0,0,1,16-16h40A16,16,0,0,1,216,48ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Z" />
    </svg>
  );
}

export function SkipForwardIcon(props: IconProps) {
  const s = props.size || 24;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="currentColor"
      style={props.style}
    >
      <path d="M208,40V216a8,8,0,0,1-16,0V144.22L67.75,221.94A16,16,0,0,1,42,208.31V47.69A16,16,0,0,1,67.75,34.06L192,111.78V40a8,8,0,0,1,16,0Z" />
    </svg>
  );
}

export function SkipBackIcon(props: IconProps) {
  const s = props.size || 24;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="currentColor"
      style={props.style}
    >
      <path d="M214,47.69V208.31a16,16,0,0,1-25.75,13.63L64,144.22V216a8,8,0,0,1-16,0V40a8,8,0,0,1,16,0v71.78L188.25,34.06A16,16,0,0,1,214,47.69Z" />
    </svg>
  );
}

export function GoogleIcon(props: IconProps) {
  const s = props.size || 20;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <path d="M128,128h80a80,80,0,1,1-24-56" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  const s = props.size || 24;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="20"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <line x1="216" y1="128" x2="40" y2="128" />
      <polyline points="112 56 40 128 112 200" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  const s = props.size || 20;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <circle cx="128" cy="128" r="96" />
      <polyline points="128 72 128 128 168 152" />
    </svg>
  );
}

export function ArrowsClockwiseIcon(props: IconProps) {
  const s = props.size || 20;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <polyline points="176 16 224 40 200 88" />
      <path d="M64 88A80 80 0 0 1 200 64l24-24" />
      <polyline points="80 240 32 216 56 168" />
      <path d="M192 168a80 80 0 0 1-136 24L32 216" />
    </svg>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  const s = props.size || 18;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <path d="M200,136v64a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8h64" />
      <polyline points="160 40 216 40 216 96" />
      <line x1="216" y1="40" x2="120" y2="136" />
    </svg>
  );
}

export function ListIcon(props: IconProps) {
  const s = props.size || 24;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 256 256"
      fill="none"
      stroke={props.color || "currentColor"}
      stroke-width="18"
      stroke-linecap="round"
      stroke-linejoin="round"
      style={props.style}
    >
      <line x1="40" y1="128" x2="216" y2="128" />
      <line x1="40" y1="64" x2="216" y2="64" />
      <line x1="40" y1="192" x2="216" y2="192" />
    </svg>
  );
}
