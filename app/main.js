import { router } from './core/router.js';
import * as socios from './modules/socios/view.js';

const nav = document.getElementById('nav');
const viewRoot = document.getElementById('view');
const titleEl = document.getElementById('title');

if (nav){
  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-btn');
    if (!btn) return;
    const v = btn.dataset.view;
    if (v === 'socios') router.go('#/socios');
    else {
      router.go('#/'+v);
      viewRoot.innerHTML = `<div class="card"><h3>${v}</h3><p class="muted">Vista demo.</p></div>`;
      setActiveNav(v);
      if (titleEl) titleEl.textContent = v.charAt(0).toUpperCase()+v.slice(1);
    }
  });
}

function setActiveNav(tab){
  const btns = nav ? nav.querySelectorAll('.nav-btn') : [];
  btns.forEach(b => b.classList.toggle('active', b.dataset.view === tab));
}

let mounted = null;
router.on(async (ctx) => {
  const top = (ctx.parts && ctx.parts[0]) || '';
  if (top === 'socios'){
    setActiveNav('socios');
    if (titleEl) titleEl.textContent = 'Socios';
    if (!mounted){
      viewRoot.innerHTML = '';
      await socios.mount(viewRoot);
      mounted = 'socios';
    }
    await socios.update(ctx);
  } else {
    if (mounted === 'socios') { socios.unmount?.(); mounted = null; }
  }
});

if (!location.hash) router.go('#/socios');
