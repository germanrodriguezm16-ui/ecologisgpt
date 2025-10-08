import { $, $$ } from './utils.js';
import { store } from './store.js';

export function createRouter(routes){
  let current = null;

  function updateActive(route){
    $$('#nav .nav-btn').forEach(b=> b.classList.toggle('active', b.dataset.route===route));
    const title = route.replace('#/','');
    $('#title').textContent = title.charAt(0).toUpperCase()+title.slice(1);
  }

  async function go(route){
    store.currentRoute = route;
    updateActive(route);
    const m = routes[route] || routes['#/404'];
    if(!m) return;
    if(current && current.unmount) current.unmount();
    const root = $('#view');
    root.innerHTML='';
    current = m;
    await m.mount(root, {});
  }

  function start(){
    window.addEventListener('hashchange', () => go(location.hash || '#/socios'));
    $$('#nav .nav-btn').forEach(btn=>btn.addEventListener('click', (e)=>{
      const r = btn.getAttribute('data-route');
      location.hash = r;
    }));
    go(location.hash || '#/socios');
  }

  return { start, go };
}
