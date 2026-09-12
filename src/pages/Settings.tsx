import { createSignal } from 'solid-js';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { WatchfacePreview } from '../components/WatchfacePreview';
import { viewportWidth, viewportHeight, isTablet, uiScale, applyUiScale, themeMode, applyThemeMode } from '../viewport';
import {
  folderPath,
  setCustomFolderPath,
  intervalSeconds,
  updateInterval,
  photos,
  pickPhotoDirectory,
  addPhotosFromFiles,
  statusMessage
} from '../photosStore';
import { FolderIcon, ImageIcon, GoogleIcon, ArrowsClockwiseIcon, TrashIcon } from '../components/Icons';
import {
  googleConfig,
  saveGoogleConfig,
  syncGoogleCalendarFromUrl,
  isGoogleSyncing,
  setIsGoogleSyncing,
  googleSyncStatus,
  setGoogleSyncStatus
} from '../services/googleCalendar';
import {
  events,
  mergeGoogleEvents,
  clearGoogleEvents
} from '../calendarStore';
import {
  allWatchfaces,
  selectedWatchfaceId,
  selectWatchface,
  deleteCustomWatchface,
  importWatchfaceFromFile,
  BUILTIN_WATCHFACES
} from '../watchfaceStore';

type SettingsTab = 'agenda' | 'photos' | 'watchfaces' | 'system';

export function SettingsPage() {
  const [activeTab, setActiveTab] = createSignal<SettingsTab>('agenda');
  const [ramBudget, setRamBudget] = createSignal<'8mb' | '16mb' | '32mb'>('8mb');
  const [statusMsg, setStatusMsg] = createSignal<string>('');
  const [manualFolderInput, setManualFolderInput] = createSignal<string>(folderPath());
  const [customIntervalInput, setCustomIntervalInput] = createSignal<string>('');
  const [customIntervalError, setCustomIntervalError] = createSignal<string>('');
  const [watchfaceImportStatus, setWatchfaceImportStatus] = createSignal<{ ok: boolean; message: string } | null>(null);

  const [iCalUrlInput, setICalUrlInput] = createSignal(googleConfig().syncUrl || '');

  const googleEventsCount = () => events().filter((e) => e.isGoogle).length;

  const TABS: { id: SettingsTab; label: string }[] = [
    { id: 'agenda', label: 'Agenda' },
    { id: 'photos', label: 'Porta-Retratos' },
    { id: 'watchfaces', label: 'Watchfaces' },
    { id: 'system', label: 'Sistema' }
  ];

  const handleSyncGoogle = async () => {
    const url = iCalUrlInput().trim();
    if (!url) {
      setGoogleSyncStatus('Por favor, insira o link iCal do Google Agenda.');
      return;
    }
    setIsGoogleSyncing(true);
    setGoogleSyncStatus('Sincronizando com o Google Agenda...');
    try {
      saveGoogleConfig({ syncUrl: url });
      const googleEvents = await syncGoogleCalendarFromUrl(url);
      mergeGoogleEvents(googleEvents);
      saveGoogleConfig({ lastSync: Date.now() });
      setGoogleSyncStatus(`Sincronizado! ${googleEvents.length} eventos carregados.`);
    } catch (err: any) {
      setGoogleSyncStatus(err?.message || 'Falha ao sincronizar agenda do Google.');
    } finally {
      setIsGoogleSyncing(false);
    }
  };

  const handleClearGoogle = () => {
    clearGoogleEvents();
    saveGoogleConfig({ lastSync: 0 });
    setGoogleSyncStatus('Eventos do Google removidos.');
    setTimeout(() => setGoogleSyncStatus(''), 2000);
  };

  const saveSettings = () => {
    setCustomFolderPath(manualFolderInput());
    setStatusMsg('Configurações salvas e aplicadas com sucesso!');
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleFolderFileInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      addPhotosFromFiles(target.files);
      const firstFile = target.files[0];
      // @ts-ignore
      const relativePath = firstFile.webkitRelativePath || firstFile.name;
      const folderName = relativePath.split('/')[0] || 'Pasta Local';
      setManualFolderInput(folderName);
      setCustomFolderPath(folderName);
    }
  };

  const handleApplyCustomInterval = () => {
    const value = Number(customIntervalInput());
    if (!Number.isFinite(value) || value <= 0) {
      setCustomIntervalError('Informe um número de segundos maior que zero.');
      setTimeout(() => setCustomIntervalError(''), 3000);
      return;
    }
    updateInterval(Math.round(value));
    setCustomIntervalError('');
  };

  const handleWatchfaceFileInput = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    target.value = '';
    if (!file) return;

    const result = await importWatchfaceFromFile(file);
    if (result.ok) {
      setWatchfaceImportStatus({ ok: true, message: `"${result.watchface.name}" importada e aplicada com sucesso!` });
    } else {
      setWatchfaceImportStatus({ ok: false, message: result.error });
    }
    setTimeout(() => setWatchfaceImportStatus(null), 4000);
  };

  return (
    <div
      class="flex flex-col gap-5 p-4 overflow-y-auto h-full"
      style={{
        "background-color": "var(--bg-color)",
        "padding-bottom": "40px"
      }}
    >
      <div>
        <h1 class="font-archivo font-extralight" style={{ "font-size": isTablet() ? "2.4rem" : "2rem" }}>
          Configurações do Sistema
        </h1>
        <p class="text-sm text-muted">
          Gerencie diretórios de mídia, parâmetros de hardware e renderização.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* BARRA DE ABAS                                                              */}
      {/* ========================================================================= */}
      <div class="flex items-center gap-2 flex-wrap">
        {TABS.map((tab) => (
          <Button
            variant={activeTab() === tab.id ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab() === 'agenda' && (
        <Card title="Integração Google Agenda">
          <div class="flex flex-col gap-4">
            <p class="text-xs text-muted">
              Cole o endereço secreto em formato iCal do seu Google Agenda para sincronizar eventos automaticamente.
            </p>

            <div class="flex flex-col gap-1">
              <label class="text-xs text-dim">Link Privado (.ics):</label>
              <input
                type="url"
                placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                value={iCalUrlInput()}
                onInput={(e) => setICalUrlInput(e.currentTarget.value)}
                style={{
                  "flex": "1",
                  "background-color": "var(--surface-color)",
                  "border": "1px solid var(--border-color)",
                  "border-radius": "12px",
                  "padding": "12px 16px",
                  "color": "var(--text-color)",
                  "font-size": "0.9rem",
                  "outline": "none",
                  "width": "100%"
                }}
              />
            </div>

            <div class="flex items-center gap-3 flex-wrap">
              <Button variant="primary" onClick={handleSyncGoogle}>
                <ArrowsClockwiseIcon size={18} />
                <span>{isGoogleSyncing() ? 'Sincronizando...' : 'Sincronizar'}</span>
              </Button>

              {googleEventsCount() > 0 && (
                <Button variant="ghost" onClick={handleClearGoogle}>
                  Desconectar
                </Button>
              )}
            </div>

            {googleSyncStatus() && (
              <p class="text-xs" style={{ "font-weight": "500" }}>
                {googleSyncStatus()}
              </p>
            )}

            <div
              class="flex items-center justify-between p-3"
              style={{
                "background-color": "var(--card-color)",
                "border-radius": "12px",
                "border": "1px solid var(--border-color)"
              }}
            >
              <div class="flex items-center gap-2">
                <GoogleIcon size={20} />
                <span class="text-xs font-semibold">
                  {googleEventsCount()} eventos sincronizados
                </span>
              </div>
              {googleConfig().lastSync > 0 && (
                <span class="text-xs text-dim">
                  Última: {new Date(googleConfig().lastSync).toLocaleString('pt-BR')}
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      {activeTab() === 'photos' && (
        <Card title="Porta-Retratos & Slideshow de Fotos">
          <div class="flex flex-col gap-4">
            <p class="text-xs text-muted">
              Defina o diretório local onde estão armazenadas as fotos para o modo de exibição
              com relógio sobreposto (estilo <code>iMac - 6.png</code>).
            </p>

            {/* Seleção da Pasta */}
            <div
              style={{
                "display": "grid",
                "grid-template-columns": isTablet() ? "2fr 1.2fr" : "1fr",
                "gap": "12px",
                "align-items": "center"
              }}
            >
              <div class="flex flex-col gap-1">
                <label class="text-xs text-dim">Caminho da Pasta no Dispositivo / Android:</label>
                <div class="flex items-center gap-2">
                  <input
                    type="text"
                    value={manualFolderInput()}
                    onInput={(e) => setManualFolderInput(e.currentTarget.value)}
                    placeholder="Ex: /sdcard/DCIM/Camera ou /sdcard/Pictures"
                    style={{
                      "flex": "1",
                      "background-color": "var(--surface-color)",
                      "border": "1px solid var(--border-color)",
                      "border-radius": "12px",
                      "padding": "9px 12px",
                      "color": "var(--text-color)",
                      "font-size": "0.9rem",
                      "outline": "none"
                    }}
                  />
                  <Button variant="secondary" size="sm" onClick={() => setCustomFolderPath(manualFolderInput())}>
                    Fixar
                  </Button>
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-xs text-dim">Selecionar Pasta no Computador / Tablet:</label>
                {/* Input oculto para fallback em navegadores com webkitdirectory */}
                <input
                  type="file"
                  id="kairo-folder-file-input"
                  style={{ "display": "none" }}
                  // @ts-ignore
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={handleFolderFileInput}
                />
                <Button variant="primary" onClick={pickPhotoDirectory}>
                  <FolderIcon size={20} />
                  <span>Escolher Pasta...</span>
                </Button>
              </div>
            </div>

            {/* Status da Pasta e Fotos Carregadas */}
            <div
              class="flex items-center justify-between p-3"
              style={{
                "background-color": "var(--card-color)",
                "border-radius": "16px",
                "border": "1px solid var(--border-color)"
              }}
            >
              <div class="flex items-center gap-2">
                <ImageIcon size={22} />
                <span class="text-xs font-semibold">
                  {photos().length} fotos disponíveis no Slideshow
                </span>
              </div>
              <span class="text-xs text-dim">
                Pasta: <strong>{folderPath()}</strong>
              </span>
            </div>

            {statusMessage() && (
              <p class="text-xs" style={{ "font-weight": "500" }}>
                ✓ {statusMessage()}
              </p>
            )}

            {/* Intervalo de Transição */}
            <div class="flex flex-col gap-2">
              <label class="text-xs text-dim">Velocidade de Transição do Slideshow:</label>
              <div class="flex gap-2 flex-wrap">
                {[
                  { sec: 5, label: '5 segundos (Rápido)' },
                  { sec: 8, label: '8 segundos (Padrão)' },
                  { sec: 15, label: '15 segundos' },
                  { sec: 30, label: '30 segundos (Lento)' }
                ].map((item) => (
                  <Button
                    variant={intervalSeconds() === item.sec ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => updateInterval(item.sec)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>

              {/* Velocidade Personalizada */}
              <div class="flex items-center gap-2" style={{ "margin-top": "4px" }}>
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Personalizado (segundos)"
                  value={customIntervalInput()}
                  onInput={(e) => setCustomIntervalInput(e.currentTarget.value)}
                  style={{
                    "width": "180px",
                    "background-color": "var(--surface-color)",
                    "border": "1px solid var(--border-color)",
                    "border-radius": "12px",
                    "padding": "9px 12px",
                    "color": "var(--text-color)",
                    "font-size": "0.9rem",
                    "outline": "none"
                  }}
                />
                <Button variant="secondary" size="sm" onClick={handleApplyCustomInterval}>
                  Aplicar
                </Button>
              </div>
              {customIntervalError() && (
                <p class="text-xs" style={{ "color": "var(--text-color)", "font-weight": "500" }}>
                  {customIntervalError()}
                </p>
              )}
            </div>

            <div>
              <Button variant="primary" onClick={saveSettings}>
                Salvar Preferências
              </Button>
              {statusMsg() && (
                <span class="text-xs" style={{ "margin-left": "12px" }}>
                  {statusMsg()}
                </span>
              )}
            </div>
          </div>
        </Card>
      )}

      {activeTab() === 'watchfaces' && (
        <Card title="Watchfaces">
          <div class="flex flex-col gap-4">
            <p class="text-xs text-muted">
              Escolha o mostrador do relógio exibido na tela inicial. Novas watchfaces são
              instaladas importando um arquivo <code>.json</code> que siga o formato descrito em{' '}
              <code>WATCHFACES.md</code>, na raiz do projeto.
            </p>

            <div class="flex flex-col gap-2">
              {allWatchfaces().map((wf) => {
                const isCustom = !BUILTIN_WATCHFACES.some((b) => b.id === wf.id);
                return (
                  <div
                    class="flex items-center justify-between p-3"
                    style={{
                      "background-color": "var(--card-color)",
                      "border-radius": "12px",
                      "border": "1px solid var(--border-color)"
                    }}
                  >
                    <div class="flex items-center gap-3">
                      <WatchfacePreview watchface={wf} />
                      <span class="text-sm font-medium">{wf.name}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <Button
                        variant={selectedWatchfaceId() === wf.id ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => selectWatchface(wf.id)}
                      >
                        {selectedWatchfaceId() === wf.id ? 'Selecionada' : 'Aplicar'}
                      </Button>
                      {isCustom && (
                        <button
                          onClick={() => deleteCustomWatchface(wf.id)}
                          class="action-button secondary"
                          style={{ "padding": "8px", "min-height": "2.25rem" }}
                          title="Excluir watchface"
                        >
                          <TrashIcon size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {watchfaceImportStatus() && (
              <p class="text-xs" style={{ "font-weight": "500", "color": "var(--text-color)" }}>
                {watchfaceImportStatus()!.ok ? '✓ ' : '⚠ '}{watchfaceImportStatus()!.message}
              </p>
            )}

            <div>
              <input
                type="file"
                id="kairo-watchface-file-input"
                style={{ "display": "none" }}
                accept=".json,application/json"
                onChange={handleWatchfaceFileInput}
              />
              <Button
                variant="primary"
                onClick={() => document.getElementById('kairo-watchface-file-input')?.click()}
              >
                <FolderIcon size={20} />
                <span>Importar Watchface (.json)...</span>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab() === 'system' && (
        <>
          <div
            style={{
              "display": "grid",
              "grid-template-columns": isTablet() ? "repeat(3, 1fr)" : "1fr",
              "gap": "14px"
            }}
          >
            <Card title="Tema">
              <p class="text-xs text-muted" style={{ "margin-bottom": "12px" }}>
                Escolha claro ou escuro manualmente, ou deixe automático para seguir o
                tema do sistema operacional.
              </p>
              <div class="flex gap-2 flex-wrap">
                <Button
                  variant={themeMode() === 'auto' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => applyThemeMode('auto')}
                >
                  Automático
                </Button>
                <Button
                  variant={themeMode() === 'light' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => applyThemeMode('light')}
                >
                  Claro
                </Button>
                <Button
                  variant={themeMode() === 'dark' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => applyThemeMode('dark')}
                >
                  Escuro
                </Button>
              </div>
            </Card>

            <Card title="Orçamento de Memória RAM (Heap QuickJS)">
              <p class="text-xs text-muted" style={{ "margin-bottom": "12px" }}>
                No Android 2.3 em tablets legados (geralmente com 512 MB de RAM física total),
                manter o heap do JS enxuto evita coletas de lixo (GC pauses).
              </p>
              <div class="flex gap-2">
                {(['8mb', '16mb', '32mb'] as const).map((opt) => (
                  <Button
                    variant={ramBudget() === opt ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setRamBudget(opt)}
                  >
                    {opt.toUpperCase()}
                  </Button>
                ))}
              </div>
            </Card>

            <Card title="Escala da Interface">
              <p class="text-xs text-muted" style={{ "margin-bottom": "12px" }}>
                Aumente o tamanho de textos, espaçamentos e botões para tornar a interface mais
                fácil de tocar em telas capacitivas ou resistivas.
              </p>
              <div class="flex gap-2 flex-wrap">
                <Button
                  variant={uiScale() === 1 ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => applyUiScale(1)}
                >
                  Padrão
                </Button>
                <Button
                  variant={uiScale() === 1.15 ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => applyUiScale(1.15)}
                >
                  Confortável
                </Button>
                <Button
                  variant={uiScale() === 1.3 ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => applyUiScale(1.3)}
                >
                  Grande
                </Button>
              </div>
            </Card>
          </div>

          <Card title="Status do Viewport em Tempo Real">
            <div class="flex flex-col gap-2 text-xs">
              <div class="flex justify-between border-b" style={{ "padding": "6px 0", "border-color": "var(--border-color)" }}>
                <span class="text-dim">Dimensões Atuais:</span>
                <span class="font-semibold">{viewportWidth()} x {viewportHeight()} px</span>
              </div>
              <div class="flex justify-between border-b" style={{ "padding": "6px 0", "border-color": "var(--border-color)" }}>
                <span class="text-dim">Classificação:</span>
                <span class="font-semibold">
                  {isTablet() ? 'Tablet (Landscape / Wide View)' : 'Handheld / Compact View'}
                </span>
              </div>
              <div class="flex justify-between" style={{ "padding": "6px 0" }}>
                <span class="text-dim">Camada de Renderização:</span>
                <span class="font-semibold">OpenGL ES 2.0 / Native Canvas</span>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
