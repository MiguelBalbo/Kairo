import { createSignal, createEffect, onMount, onCleanup } from 'solid-js';
import { Route } from './types';
import { ClockHome } from './pages/ClockHome';
import { CalendarPage } from './pages/Calendar';
import { PhotoFrame } from './pages/PhotoFrame';
import { NotesPage } from './pages/Notes';
import { ContactsPage } from './pages/Contacts';
import { SettingsPage } from './pages/Settings';
import { NewEventPage } from './pages/NewEvent';
import { DayDetailsPage } from './pages/DayDetails';
import { FloatingNav } from './components/FloatingNav';

export const [currentRoute, setCurrentRoute] = createSignal<Route>('home');
export const [routeHistory, setRouteHistory] = createSignal<Route[]>(['home']);
export const [isMenuOpen, setIsMenuOpen] = createSignal<boolean>(false);
export const [menuOpenedAt, setMenuOpenedAt] = createSignal<number>(0);

export function openMenu() {
  setMenuOpenedAt(Date.now());
  setIsMenuOpen(true);
}

export function navigate(to: Route) {
  setRouteHistory((prev) => [...prev, to]);
  setCurrentRoute(to);
  setIsMenuOpen(false);
}

export function goBack() {
  const history = routeHistory();
  if (history.length > 1) {
    const nextHistory = history.slice(0, -1);
    setRouteHistory(nextHistory);
    setCurrentRoute(nextHistory[nextHistory.length - 1]);
  }
}

export function toggleMenu() {
  if (isMenuOpen()) {
    setIsMenuOpen(false);
  } else {
    openMenu();
  }
}

export function Router() {
  let touchStartY = 0;
  let touchStartX = 0;
  let pageEl: HTMLDivElement | undefined;

  // Reinicia a animação de entrada da página sempre que a rota muda, removendo e
  // readicionando a classe (forçando reflow) — a mesma div é reaproveitada pelo
  // Solid, então apenas trocar a classe não bastaria para retrigger do CSS.
  createEffect(() => {
    currentRoute();
    if (pageEl) {
      pageEl.classList.remove('page-transition');
      void pageEl.offsetWidth;
      pageEl.classList.add('page-transition');
    }
  });

  onMount(() => {
    // Listener global para detectar o gesto de deslizar de baixo para cima (Swipe Up)
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        const touchEndY = e.changedTouches[0].clientY;
        const deltaY = touchEndY - touchStartY;
        const screenHeight = window.innerHeight;
        const bottomZone = Math.min(screenHeight * 0.75, screenHeight - 120);

        // Se o gesto iniciou na área inferior e deslizou para cima pelo menos 30px
        if (touchStartY >= bottomZone && deltaY < -30) {
          openMenu();
        }
      }
    };

    // Suporte aprimorado para segurar e arrastar o mouse no computador (Desktop Swipe-Up)
    let mouseStartY = 0;
    let mouseStartX = 0;
    let isMouseDown = false;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Apenas clique com botão esquerdo
      const screenHeight = window.innerHeight;
      const bottomThreshold = Math.min(screenHeight * 0.75, screenHeight - 120);
      if (e.clientY >= bottomThreshold) {
        mouseStartY = e.clientY;
        mouseStartX = e.clientX;
        isMouseDown = true;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      // Se soltou o botão do mouse fora da janela
      if (e.buttons !== 1) {
        isMouseDown = false;
        return;
      }

      const deltaY = e.clientY - mouseStartY;
      const deltaX = Math.abs(e.clientX - mouseStartX);

      // Dispara o menu assim que arrastar pelo menos 30px para cima
      if (deltaY <= -30 && deltaX < Math.abs(deltaY) * 1.8) {
        openMenu();
        isMouseDown = false;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isMouseDown) {
        const deltaY = e.clientY - mouseStartY;
        const deltaX = Math.abs(e.clientX - mouseStartX);
        if (deltaY <= -25 && deltaX < Math.abs(deltaY) * 1.8) {
          openMenu();
        }
        isMouseDown = false;
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    onCleanup(() => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    });
  });

  const renderCurrentPage = () => {
    switch (currentRoute()) {
      case 'calendar':
        return <CalendarPage />;
      case 'photos':
        return <PhotoFrame />;
      case 'notes':
        return <NotesPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'new-event':
        return <NewEventPage />;
      case 'day-details':
        return <DayDetailsPage />;
      case 'home':
      default:
        return <ClockHome />;
    }
  };

  return (
    <div 
      class="w-full h-full relative overflow-hidden flex flex-col"
      style={{ "background-color": "var(--bg-color)" }}
    >
      {/* Conteúdo da Página Atual em Tela Cheia Imersiva */}
      <main class="w-full h-full flex-1 overflow-hidden relative">
        <div ref={pageEl} class="w-full h-full page-transition">
          {renderCurrentPage()}
        </div>
      </main>

      {/* ========================================================================= */}
      {/* ZONA DE GESTO INFERIOR & ALÇA SUTIL (Swipe Up Trigger)                     */}
      {/* ========================================================================= */}
      <div 
        onClick={(e) => {
          e.stopPropagation();
          openMenu();
        }}
        class="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center cursor-pointer select-none"
        style={{
          "height": "36px",
          "background": "linear-gradient(to top, color-mix(in srgb, var(--text-color) 25%, transparent), transparent)"
        }}
        title="Deslize para cima ou clique para abrir o menu de páginas"
      >
        <div 
          style={{
            "width": "64px",
            "height": "5px",
            "border-radius": "9999px",
            "background-color": "color-mix(in srgb, var(--text-color) 40%, transparent)",
            "transition": "background-color 0.2s ease, transform 0.2s ease"
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* MENU FLUTUANTE EM FORMATO DE PÍLULAS COM GRADIENTE                         */}
      {/* ========================================================================= */}
      <FloatingNav 
        isOpen={isMenuOpen()} 
        openedAt={menuOpenedAt()}
        onClose={() => setIsMenuOpen(false)} 
      />
    </div>
  );
}
