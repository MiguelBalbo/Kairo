import { createSignal } from 'solid-js';
import { Note } from './types';

const INITIAL_NOTES: Note[] = [
  {
    id: 1,
    title: "Lorem Ipsum",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer ipsum nisl, rutrum sed ligula vitae, pharetra dignissim eros. Aliquam vitae tincidunt libero, sit amet venenatis massa. Maecenas rutrum diam sit amet rhoncus pharetra. Sed tincidunt, nisl mollis pellentesque rutrum, tellus sem consequat nulla, sed rutrum nisl urna a arcu. Proin a augue vel lacus suscipit convallis. Donec sit amet ligula ornare, tempor tellus ut, lobortis elit. Proin pretium metus enim, in porttitor neque volutpat sed. Ut est mi, tempus eget dolor vitae, aliquam scelerisque leo. Aenean hendrerit dapibus urna at efficitur.",
    date: "Hoje, 13:09",
    timestamp: Date.now() - 1000 * 60 * 30
  },
  {
    id: 2,
    title: "Ideias do Projeto Kairo",
    content: "Estruturar páginas leves e fluidas utilizando PocketJS para tablets legados e modernos.\n\n- Otimizar consumo de RAM (heap QuickJS abaixo de 8MB)\n- Roteamento instantâneo entre páginas\n- Design clássico de bloco de notas inspirado no estilo retrô com papel pautado",
    date: "Ontem, 16:45",
    timestamp: Date.now() - 1000 * 60 * 60 * 24
  },
  {
    id: 3,
    title: "Lista de Compras & Tarefas",
    content: "1. Café em grãos\n2. Caderno pautado clássico\n3. Caneta esferográfica azul\n4. Carregador micro-USB para tablet legado\n5. Testar compilação APK no emulador",
    date: "2 de Setembro",
    timestamp: Date.now() - 1000 * 60 * 60 * 72
  }
];

function loadStoredNotes(): Note[] {
  if (typeof window === 'undefined') return INITIAL_NOTES;
  try {
    const raw = localStorage.getItem('kairo_notes');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Erro ao carregar notas do localStorage:', e);
  }
  return INITIAL_NOTES;
}

export const [notes, setNotes] = createSignal<Note[]>(loadStoredNotes());
export const [selectedNoteId, setSelectedNoteId] = createSignal<number | null>(1);
export const [noteSearchQuery, setNoteSearchQuery] = createSignal<string>('');

export function saveNotesToStorage(next: Note[]) {
  setNotes(next);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('kairo_notes', JSON.stringify(next));
    } catch (e) {
      console.warn('Erro ao persistir notas:', e);
    }
  }
}

export function createNote(title = "Nova Nota", content = ""): Note {
  const now = new Date();
  const timeString = `Hoje, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const newNote: Note = {
    id: Date.now(),
    title: title.trim() || "Nova Nota",
    content,
    date: timeString,
    timestamp: Date.now()
  };

  const updated = [newNote, ...notes()];
  saveNotesToStorage(updated);
  setSelectedNoteId(newNote.id);
  return newNote;
}

export function updateNote(id: number, title: string, content: string) {
  const updated = notes().map((n) => {
    if (n.id === id) {
      return {
        ...n,
        title: title.trim() || "Sem título",
        content,
        timestamp: Date.now()
      };
    }
    return n;
  });
  saveNotesToStorage(updated);
}

export function deleteNote(id: number) {
  const updated = notes().filter((n) => n.id !== id);
  saveNotesToStorage(updated);
  if (selectedNoteId() === id) {
    setSelectedNoteId(updated.length > 0 ? updated[0].id : null);
  }
}
