import { viewportWidth, viewportHeight, isTablet, isLandscape } from '../viewport';

export function StatusBar() {
  const now = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      class="w-full flex items-center justify-between border-b text-xs text-dim"
      style={{
        "height": "28px",
        "padding": "0 14px",
        "background-color": "var(--surface-color)",
        "border-color": "var(--border-color)",
        "color": "var(--text-color)"
      }}
    >
      <div class="flex items-center gap-2">
        <span style={{ "font-weight": "600" }}>KAIRO OS</span>
        <span>•</span>
        <span>{isTablet() ? 'Modo Tablet' : 'Modo Compacto'}</span>
        <span>({isLandscape() ? 'Paisagem' : 'Retrato'})</span>
      </div>

      <div class="flex items-center gap-3">
        <span>{viewportWidth()}x{viewportHeight()} px</span>
        <span class="text-dim">● Conectado</span>
        <span style={{ "font-weight": "600" }}>{now()}</span>
      </div>
    </div>
  );
}
