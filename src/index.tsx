import { render } from 'solid-js/web';
import { Router } from './router';
import { initViewportListener } from './viewport';

// Inicializa o monitoramento contínuo de dimensões de tela e orientação
initViewportListener();

const root = document.getElementById('root');

if (root) {
  render(() => <Router />, root);
} else {
  console.error('Elemento raiz #root não foi encontrado.');
}
