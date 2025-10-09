// app/main.js
// Montaje de vistas + telemetría Sentry + montaje inicial garantizado

import { $, $all } from './core/utils.js';
import { router } from './core/router.js';
import * as socios from './modules/socios/index.js';

const S = window.Sentry;

const titleEl = $('#title');
const viewEl  = $('#view');
const navEl   = $('#nav');

function setActive(tab){
  $all('.nav-btn', navEl).forEach(b => b.classList.toggle('active', b.dataset.view === tab));
  if (titleEl) titleEl.textContent = tab.charAt(0).toUpperCase() + tab.slice(1);
}

function mountView(ctx){
  try {
    const section = ctx.parts[0] || 'socios';
    S?.addBreadcrumb({ category: 'ui', message: 'mountView', data: { section, ctx }, level: 'info' });
    setActive(section);
    if (!viewEl) return;

    viewEl.innerHTML = '';
    if (section === 'socios'){
      socios.mount(viewEl);   // pinta la UI base del módulo
      socios.update(ctx);     // carga datos/estado según la ruta
    } else {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `<h3>${section}</h3><p class="muted">Vista demo.</p>`;
      viewEl.appendChild(card);
    }
  } catch (e) {
    S?.captureException(e, { tags:{ where:'main.mountView' }, extra:{ ctx } });
    console.error(e);
  }
}

// Navegación lateral
navEl?.addEventListener('click', (e)=>{
  const btn = e.target.closest('.nav-btn'); if (!btn) return;
  const tab = btn.dataset.view;
  S?.addBreadcrumb({ category: 'ui', message: 'sidebar click', data: { tab }, level: 'info' });
  if (tab === 'socios') router.go('#/socios');
  else router.go('#/' + tab);
});

// Suscripción a cambios de ruta
router.on(mountView);

// Montaje inicial garantizado (funciona en cualquier estado del documento)
(function ensureInitialMount(){
  const run = () => {
    const ctx = router.current();
    S?.captureMessage('main.ensureInitialMount', { level: 'info', extra: { ctx, ready: document.readyState } });
    mountView(ctx);
  };
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(run, 0); // siguiente tick
  } else {
    window.addEventListener('DOMContentLoaded', run, { once: true });
  }
})();
