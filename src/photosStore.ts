import { createSignal } from 'solid-js';
import { PhotoItem } from './types';

// Fotos de demonstração de altíssima qualidade para exibição imediata
const DEFAULT_PHOTOS: PhotoItem[] = [
  {
    id: 'demo-1',
    name: 'Almoço de Família',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 'demo-2',
    name: 'Entardecer Dourado',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 'demo-3',
    name: 'Reunião de Amigos',
    url: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 'demo-4',
    name: 'Montanhas & Natureza',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 'demo-5',
    name: 'Memórias de Viagem',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85'
  }
];

function loadStoredFolder(): string {
  if (typeof window === 'undefined') return '/sdcard/DCIM/Camera';
  try {
    return localStorage.getItem('kairo_photo_folder') || '/sdcard/DCIM/Camera';
  } catch {
    return '/sdcard/DCIM/Camera';
  }
}

function loadStoredInterval(): number {
  if (typeof window === 'undefined') return 8;
  try {
    const val = localStorage.getItem('kairo_photo_interval');
    return val ? parseInt(val, 10) : 8;
  } catch {
    return 8;
  }
}

export const [photos, setPhotos] = createSignal<PhotoItem[]>(DEFAULT_PHOTOS);
export const [currentIndex, setCurrentIndex] = createSignal<number>(0);
export const [folderPath, setFolderPath] = createSignal<string>(loadStoredFolder());
export const [intervalSeconds, setIntervalSeconds] = createSignal<number>(loadStoredInterval());
export const [isPlaying, setIsPlaying] = createSignal<boolean>(true);
export const [statusMessage, setStatusMessage] = createSignal<string>('');

export function setCustomFolderPath(path: string) {
  setFolderPath(path);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('kairo_photo_folder', path);
    } catch (e) {
      console.warn('Erro ao salvar pasta de fotos:', e);
    }
  }
}

export function updateInterval(sec: number) {
  setIntervalSeconds(sec);
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('kairo_photo_interval', sec.toString());
    } catch (e) {
      console.warn('Erro ao salvar intervalo:', e);
    }
  }
}

export function nextPhoto() {
  const list = photos();
  if (list.length === 0) return;
  setCurrentIndex((prev) => (prev + 1) % list.length);
}

export function prevPhoto() {
  const list = photos();
  if (list.length === 0) return;
  setCurrentIndex((prev) => (prev - 1 + list.length) % list.length);
}

export function togglePlay() {
  setIsPlaying(!isPlaying());
}

/**
 * Adiciona arquivos de imagem selecionados pelo usuário via File API
 */
export function addPhotosFromFiles(files: FileList | File[]) {
  const newPhotos: PhotoItem[] = [];
  const fileArray = Array.from(files);

  for (const file of fileArray) {
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      newPhotos.push({
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: file.name,
        url
      });
    }
  }

  if (newPhotos.length > 0) {
    setPhotos(newPhotos);
    setCurrentIndex(0);
    setStatusMessage(`${newPhotos.length} fotos carregadas da pasta selecionada!`);
  } else {
    setStatusMessage('Nenhuma imagem válida (.jpg, .png) foi encontrada nesta pasta.');
  }
}

/**
 * Seletor nativo de diretório moderno (File System Access API)
 */
export async function pickPhotoDirectory() {
  if (typeof window !== 'undefined' && 'showDirectoryPicker' in window) {
    try {
      // @ts-ignore - API do navegador
      const dirHandle = await window.showDirectoryPicker();
      setCustomFolderPath(dirHandle.name);
      
      const loaded: PhotoItem[] = [];
      // @ts-ignore
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
          const file = await entry.getFile();
          if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)) {
            loaded.push({
              id: `dir-${file.name}-${file.lastModified}`,
              name: file.name,
              url: URL.createObjectURL(file)
            });
          }
        }
      }

      if (loaded.length > 0) {
        setPhotos(loaded);
        setCurrentIndex(0);
        setStatusMessage(`${loaded.length} fotos importadas com sucesso da pasta "${dirHandle.name}"!`);
      } else {
        setStatusMessage(`A pasta "${dirHandle.name}" não contém arquivos de imagem compatíveis.`);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Erro ao acessar pasta:', err);
        setStatusMessage('Não foi possível ler os arquivos da pasta selecionada.');
      }
    }
  } else {
    // Fallback: simula ou dispara input oculto
    const input = document.getElementById('kairo-folder-file-input') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }
}
