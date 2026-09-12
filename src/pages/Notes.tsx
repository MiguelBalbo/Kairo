import { createSignal, createEffect } from 'solid-js';
import { 
  notes, 
  selectedNoteId, 
  setSelectedNoteId, 
  noteSearchQuery, 
  setNoteSearchQuery, 
  createNote, 
  updateNote, 
  deleteNote 
} from '../notesStore';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  PencilIcon, 
  CheckIcon, 
  TrashIcon, 
  CaretCircleRightIcon 
} from '../components/Icons';
import { isTablet } from '../viewport';

export function NotesPage() {
  // Se visualizando/editando uma nota em tela cheia (estilo iMac - 8)
  const [editorMode, setEditorMode] = createSignal<boolean>(false);
  const [searchOpen, setSearchOpen] = createSignal<boolean>(false);

  // Estado temporário de edição da nota ativa
  const [activeTitle, setActiveTitle] = createSignal<string>('');
  const [activeContent, setActiveContent] = createSignal<string>('');
  const [isSavedNotice, setIsSavedNotice] = createSignal<boolean>(false);
  const [isEditing, setIsEditing] = createSignal<boolean>(false);

  // Atualiza os campos do editor quando a nota selecionada mudar
  createEffect(() => {
    const currentId = selectedNoteId();
    if (currentId) {
      const found = notes().find((n) => n.id === currentId);
      if (found) {
        setActiveTitle(found.title);
        setActiveContent(found.content);
      }
    }
  });

  const filteredNotes = () => {
    const q = noteSearchQuery().trim().toLowerCase();
    if (!q) return notes();
    return notes().filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  };

  const currentNote = () => {
    return notes().find((n) => n.id === selectedNoteId()) || null;
  };

  const handleOpenNote = (id: number) => {
    setSelectedNoteId(id);
    const found = notes().find((n) => n.id === id);
    if (found) {
      setActiveTitle(found.title);
      setActiveContent(found.content);
    }
    setIsEditing(false);
    setEditorMode(true);
  };

  const handleCreateNewNote = () => {
    const newNote = createNote("Nova Nota", "");
    setActiveTitle(newNote.title);
    setActiveContent("");
    setIsEditing(true);
    setEditorMode(true);
  };

  const handleCloseEditor = () => {
    setIsEditing(false);
    setEditorMode(false);
  };

  const handleAutoSave = (title: string, content: string) => {
    const id = selectedNoteId();
    if (id) {
      updateNote(id, title, content);
      setIsSavedNotice(true);
      setTimeout(() => setIsSavedNotice(false), 2000);
    }
  };

  const handleDeleteCurrent = () => {
    const id = selectedNoteId();
    if (id) {
      deleteNote(id);
      setIsEditing(false);
      setEditorMode(false);
    }
  };

  return (
    <div 
      class="w-full h-full flex flex-col overflow-hidden"
      style={{
        "background-color": "var(--bg-color)",
        "padding": editorMode() ? "0" : isTablet() ? "2vw 3vw" : "16px",
        "color": "var(--text-color)"
      }}
    >
      {/* ========================================================================= */}
      {/* MODO 1: GRADE DE NOTAS (Inspirado no iMac - 7.png)                         */}
      {/* ========================================================================= */}
      {!editorMode() && (
        <div class="w-full h-full flex flex-col overflow-hidden">
          {/* Cabeçalho "Notas" com Lupa e Botão de Adicionar */}
          <div 
            class="flex items-center justify-between"
            style={{ "margin-bottom": "1.5rem" }}
          >
            <h1 
              class="font-archivo font-extralight"
              style={{ "font-size": isTablet() ? "3.5rem" : "2.4rem", "letter-spacing": "-0.03em" }}
            >
              Notas
            </h1>

            <div class="flex items-center gap-3">
              {/* Botão de Busca */}
              <button
                onClick={() => setSearchOpen(!searchOpen())}
                class="action-button secondary"
                style={{
                  "padding": "10px",
                  "background-color": searchOpen() ? "var(--border-color)" : "var(--surface-color)"
                }}
                title="Pesquisar notas"
              >
                <MagnifyingGlassIcon size={isTablet() ? 36 : 28} />
              </button>

              {/* Botão Nova Nota */}
              <button
                onClick={handleCreateNewNote}
                class="action-button"
                style={{
                  "padding": isTablet() ? "10px 20px" : "10px 14px",
                  "font-size": "0.95rem"
                }}
              >
                <PlusIcon size={24} />
                <span>Nova Nota</span>
              </button>
            </div>
          </div>

          {/* Campo de Pesquisa Expansível */}
          {searchOpen() && (
            <div style={{ "margin-bottom": "1.5rem" }}>
              <input
                type="text"
                placeholder="Pesquisar em todas as notas..."
                value={noteSearchQuery()}
                onInput={(e) => setNoteSearchQuery(e.currentTarget.value)}
                class="font-archivo font-light"
                style={{
                  "width": "100%",
                  "background-color": "var(--surface-color)",
                  "border": "1px solid var(--border-color)",
                  "border-radius": "16px",
                  "padding": "12px 18px",
                  "color": "var(--text-color)",
                  "font-size": "1.1rem",
                  "outline": "none"
                }}
                autofocus
              />
            </div>
          )}

          {/* Grade de Cartões de Notas Amarelos (Post-it / Legal pad cards) */}
          <div 
            class="flex-1 overflow-y-auto"
            style={{
              "display": "grid",
              "grid-template-columns": isTablet() ? "repeat(2, 1fr)" : "1fr",
              "gap": "1.5rem",
              "padding-bottom": "2rem",
              "align-content": "start"
            }}
          >
            {filteredNotes().length === 0 ? (
              <div 
                class="col-span-full flex flex-col items-center justify-center text-muted"
                style={{ "padding": "4rem 1rem", "text-align": "center" }}
              >
                <p class="font-archivo font-extralight text-xl">
                  Nenhuma nota encontrada.
                </p>
                <button
                  onClick={handleCreateNewNote}
                  style={{
                    "margin-top": "1rem",
                    "font-size": "0.95rem"
                  }}
                >
                  + Criar sua primeira nota agora
                </button>
              </div>
            ) : (
              filteredNotes().map((note) => (
                <div
                  onClick={() => handleOpenNote(note.id)}
                  style={{
                    "background-color": "#fff785",
                    "background-image": "linear-gradient(180deg, #fff99e 0%, #fff475 100%)",
                    "border-radius": "16px",
                    "padding": "1.8rem 2rem",
                    "color": "#1c1917",
                    "cursor": "pointer",
                    "box-shadow": "0 6px 18px rgba(0, 0, 0, 0.35)",
                    "display": "flex",
                    "flex-direction": "column",
                    "min-height": "190px",
                    "max-height": "250px",
                    "overflow": "hidden",
                    "position": "relative",
                    "transition": "transform 0.15s ease, box-shadow 0.15s ease"
                  }}
                >
                  <div class="flex items-center justify-between" style={{ "margin-bottom": "0.75rem" }}>
                    <h2 
                      class="font-archivo font-normal"
                      style={{
                        "font-size": "1.65rem",
                        "color": "#111827",
                        "letter-spacing": "-0.02em",
                        "white-space": "nowrap",
                        "overflow": "hidden",
                        "text-overflow": "ellipsis"
                      }}
                    >
                      {note.title}
                    </h2>
                    <span 
                      class="text-xs font-light"
                      style={{ "color": "rgba(28, 25, 23, 0.65)", "white-space": "nowrap" }}
                    >
                      {note.date}
                    </span>
                  </div>

                  <p 
                    class="font-archivo font-light"
                    style={{
                      "font-size": "1.05rem",
                      "line-height": "1.55",
                      "color": "#27272a",
                      "overflow": "hidden",
                      "display": "-webkit-box",
                      "-webkit-line-clamp": "4",
                      "-webkit-box-orient": "vertical",
                      "text-overflow": "ellipsis"
                    }}
                  >
                    {note.content || "(Nota sem texto...)"}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODO 2: EDITOR ESTILO PAPEL PAUTADO RETRÔ (iMac - 8.png & Apple Notes)    */}
      {/* ========================================================================= */}
      {editorMode() && currentNote() && (
        <div class="w-full h-full flex flex-col overflow-hidden relative">
          {/* Barra de Ações Superior do Bloco */}
          <div 
            class="flex items-center justify-between border-b"
            style={{
              "height": "52px",
              "padding": "0 1.5rem",
              "background-color": "var(--surface-color)",
              "border-color": "var(--border-color)"
            }}
          >
            <div class="flex items-center gap-3">
              <button
                onClick={handleCloseEditor}
                class="action-button secondary"
                style={{
                  "padding": "6px 14px",
                  "font-size": "0.85rem",
                  "min-height": "32px"
                }}
              >
                <span>←</span>
                <span>Todas as Notas</span>
              </button>

              <span class="text-xs text-dim">
                {currentNote()?.date}
              </span>
            </div>

            <div class="flex items-center gap-3">
              {isSavedNotice() && (
                <span class="text-xs" style={{ "color": "var(--text-color)", "font-weight": "500", "opacity": "0.8" }}>
                  ✓ Salvo automaticamente
                </span>
              )}

              <button
                onClick={handleDeleteCurrent}
                class="action-button secondary"
                style={{
                  "padding": "6px 12px",
                  "font-size": "0.85rem",
                  "min-height": "32px"
                }}
                title="Excluir esta nota"
              >
                <TrashIcon size={18} />
                <span>Excluir</span>
              </button>

              <button
                onClick={handleCloseEditor}
                class="action-button"
                style={{
                  "padding": "6px 16px",
                  "font-size": "0.85rem",
                  "min-height": "32px"
                }}
              >
                <CheckIcon size={18} />
                <span>Concluído</span>
              </button>
            </div>
          </div>

          {/* O Papel Pautado Amarelo Clássico (Lined Legal Pad) */}
          <div 
            class="flex-1 overflow-y-auto"
            style={{
              "background-color": "#fef388",
              "background-image": "repeating-linear-gradient(transparent, transparent 31px, rgba(147, 197, 253, 0.55) 31px, rgba(147, 197, 253, 0.55) 32px)",
              "position": "relative",
              "padding": isTablet() ? "2.5rem 3.5rem" : "1.5rem 1.2rem",
              "color": "#1c1917"
            }}
          >
            {/* Linha vertical clássica da margem esquerda (vermelha/rosa do legal pad) */}
            <div 
              style={{
                "position": "absolute",
                "top": "0",
                "bottom": "0",
                "left": isTablet() ? "65px" : "32px",
                "width": "2px",
                "background-color": "rgba(248, 113, 113, 0.7)",
                "pointer-events": "none"
              }}
            />

            {/* Container interno com margem ajustada para respeitar a linha vertical */}
            <div 
              style={{
                "margin-left": isTablet() ? "50px" : "28px",
                "display": "flex",
                "flex-direction": "column",
                "min-height": "100%"
              }}
            >
              {/* Linha do Título com Botão de Habilitar/Desabilitar Edição */}
              <div
                class="flex items-center justify-between"
                style={{
                  "margin-bottom": "16px",
                  "min-height": "64px"
                }}
              >
                <input
                  type="text"
                  value={activeTitle()}
                  disabled={!isEditing()}
                  onInput={(e) => {
                    setActiveTitle(e.currentTarget.value);
                    handleAutoSave(e.currentTarget.value, activeContent());
                  }}
                  placeholder="Título da nota..."
                  class="font-archivo font-normal"
                  style={{
                    "font-size": isTablet() ? "3rem" : "2rem",
                    "letter-spacing": "-0.03em",
                    "color": "#18181b",
                    "background": "transparent",
                    "border": "none",
                    "outline": "none",
                    "width": "90%",
                    "opacity": isEditing() ? "1" : "0.75",
                    "cursor": isEditing() ? "text" : "default"
                  }}
                />

                {/* Botão para habilitar/desabilitar a edição desta nota */}
                <button
                  onClick={() => setIsEditing(!isEditing())}
                  style={{
                    "color": isEditing() ? "#1c1917" : "rgba(28, 25, 23, 0.45)",
                    "display": "flex",
                    "align-items": "center",
                    "padding": "6px",
                    "cursor": "pointer"
                  }}
                  title={isEditing() ? "Bloquear edição" : "Ativar edição"}
                >
                  <PencilIcon size={isTablet() ? 36 : 28} color={isEditing() ? "#1c1917" : "rgba(28, 25, 23, 0.45)"} />
                </button>
              </div>

              {/* Área de Texto Pautada com Alinhamento Perfeito nas Linhas */}
              <textarea
                value={activeContent()}
                disabled={!isEditing()}
                onInput={(e) => {
                  setActiveContent(e.currentTarget.value);
                  handleAutoSave(activeTitle(), e.currentTarget.value);
                }}
                placeholder="Escreva sua anotação aqui..."
                class="font-archivo font-light"
                style={{
                  "width": "100%",
                  "min-height": "500px",
                  "background": "transparent",
                  "border": "none",
                  "outline": "none",
                  "color": "#27272a",
                  "font-size": isTablet() ? "1.25rem" : "1.05rem",
                  "line-height": "32px",
                  "resize": "none",
                  "padding": "0",
                  "margin": "0",
                  "opacity": isEditing() ? "1" : "0.75",
                  "cursor": isEditing() ? "text" : "default"
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
