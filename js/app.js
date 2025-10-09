// js/app.js
// Router con paracaídas + compatibilidad amplia de nombres de montaje

function $(s, el){ return (el||document).querySelector(s); }
function el(tag, attrs={}, children=[]){
  const n=document.createElement(tag);
  for(const k in attrs){
    if(k==='class') n.className=attrs[k];
    else if(k==='style'){ Object.assign(n.style, attrs[k]); }
    else n.setAttribute(k, attrs[k]);
  }
  for(const c of children){ n.appendChild(typeof c==='string'?document.createTextNode(c):c); }
  return n;
}

function showFatal(msg){
  const v = $('#view') || document.body;
  v.innerHTML = `<div style="padding:16px;background:#220c10;border:1px solid #5a1f2a;border-radius:12px;color:#ffb4b4">
    ⚠️ ${msg}
  </div>`;
}

window.addEventListener('error', (e)=>{
  console.error('[GLOBAL ERROR]', e.error || e.message);
  showFatal('Se produjo un error en la aplicación. Abre la Consola para ver detalles.');
});
window.addEventListener('unhandledrejection', (e)=>{
  console.error('[PROMISE REJECTION]', e.reason);
  showFatal('Error inesperado. Revisa la Consola del navegador.');
});

let currentUnmount = null;
async function safeUnmount(){
  try{ if(typeof currentUnmount === 'function') await currentUnmount(); }
  catch(err){ console.warn('[unmount error]', err); }
  finally{ currentUnmount = null; }
}

function setTitle(t){ const te = $('#title'); if(te) te.textContent = t; }
function clearTopActions(){ const ta=$('#topActions'); if(ta) ta.innerHTML=''; }

/** Encuentra una función de montaje en el módulo cargado */
function findMountFn(mod){
  // Soporte export default (función)
  if (typeof mod?.default === 'function') return mod.default;

  const candidates = [
    'mountCategorias','mountCategoriasView',
    'mountSocios','mountTransacciones',
    'mountView','mount','initCategorias','init','start'
  ];
  const key = candidates.find(name => typeof mod[name] === 'function');
  return key ? mod[key] : null;
}

async function mountWithFallback(loadModule, mountArgs=[]){
  const mod = await loadModule();
  console.debug('[view module exports]', Object.keys(mod));
  const mountFn = findMountFn(mod);
  if(!mountFn){
    throw new Error('No se encontró una función de montaje en el módulo. Exports: '+Object.keys(mod).join(', '));
  }
  const un = await mountFn(...mountArgs);
  if (typeof un === 'function') return un;

  // Si no devolvió función, intentamos firmas típicas de desmontaje
  const uf = ['unmount','unmountView','unmountCategorias','unmountSocios'].find(name => typeof mod[name] === 'function');
  return uf ? mod[uf] : null;
}

async function handleRoute(){
  const hash = location.hash || '#/socios';
  const [, route] = hash.split('#/');
  await safeUnmount();

  const view = $('#view');
  if (view) view.innerHTML = '';

  try{
    switch(route){
      case 'socios': {
        setTitle('Socios'); clearTopActions();
        currentUnmount = await mountWithFallback(
          () => import('./views/categorias.js'),
          [view]
        );
        break;
      }
      case 'transacciones': {
        setTitle('Transacciones'); clearTopActions();
        currentUnmount = await mountWithFallback(
          () => import('./views/transacciones.js'),
          [view]
        );
        break;
      }
      case 'pedidos': case 'seguimiento': case 'clientes':
      case 'inventario': case 'devoluciones': {
        setTitle(route.charAt(0).toUpperCase()+route.slice(1)); clearTopActions();
        if (view) view.appendChild(el('div',{class:'card',style:{padding:'16px'}},[
          el('h3',{},['Vista ', route]), el('div',{class:'muted'},['(Placeholder)'])
        ]));
        currentUnmount = null;
        break;
      }
      default:
        location.hash = '#/socios';
        return;
    }
  }catch(err){
    console.error('[route error]', err);
    showFatal('No se pudo montar la vista. Revisa la Consola del navegador.');
  }
}

function wireNav(){
  const nav = $('#nav');
  if(!nav) return;
  nav.addEventListener('click', (e)=>{
    const btn = e.target.closest('.nav-btn');
    if (!btn) return;
    const r = btn.getAttribute('data-view');
    if (!r) return;
    location.hash = '#/'+r;
  });
  function markActive(){
    const r = (location.hash || '#/socios').replace('#/','');
    Array.from(nav.querySelectorAll('.nav-btn')).forEach(b=>{
      b.classList.toggle('active', b.getAttribute('data-view')===r);
    });
  }
  window.addEventListener('hashchange', markActive);
  markActive();
}

window.addEventListener('DOMContentLoaded', ()=>{
  try{
    if(!location.hash || location.hash==='#') location.hash = '#/socios';
    wireNav();
    handleRoute();
  }catch(err){
    console.error('[bootstrap error]', err);
    showFatal('Error al iniciar la app. Revisa la Consola del navegador.');
  }
});

window.addEventListener('hashchange', handleRoute);
