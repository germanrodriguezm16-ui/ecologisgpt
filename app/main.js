// app/main.js
import { $, $all } from './core/utils.js';
import { router } from './core/router.js';
import * as socios from './modules/socios/index.js';

const titleEl = $('#title');
const viewEl  = $('#view');
const navEl   = $('#nav');

function setActive(tab){
  $all('.nav-btn', navEl).forEach(b => b.classList.toggle('active', b.dataset.view===tab));
  if (titleEl) titleEl.textContent = tab.charAt(0).toUpperCase()+tab.slice(1);
}

function mountView(ctx){
  const section = ctx.parts[0] || 'socios';
  setActive(section);
  if (!viewEl) return;

  viewEl.innerHTML = '';
  if (section === 'socios'){
    socios.mount(viewEl);
    socios.update(ctx);
  } else {
    const card = document.createElement('div');
    card.className='card';
    card.innerHTML = `<h3>${section}</h3><p class="muted">Vista demo.</p>`;
    viewEl.appendChild(card);
  }
}

navEl?.addEventListener('click', (e)=>{
  const btn = e.target.closest('.nav-btn'); if(!btn) return;
  const tab = btn.dataset.view;
  if (tab === 'socios') router.go('#/socios');
  else router.go('#/'+tab);
});

// Escuchar cambios de ruta
router.on(mountView);

// ⚙️ Fuerza el montaje inicial aunque el evento ya haya ocurrido
(function ensureInitialMount(){
  const ready = document.readyState;
  if (ready === 'complete' || ready === 'interactive') {
    const ctx = router.current();
    console.log('[EG] forzando montaje inicial inmediato', ctx);
    mountView(ctx);
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      const ctx = router.current();
      console.log('[EG] forzando montaje inicial (DOMContentLoaded)', ctx);
      mountView(ctx);
    });
  }
})();
