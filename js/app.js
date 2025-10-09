// js/app.js
// Fase 0: Router con mount/unmount y paracaídas de errores
// Mantiene compatibilidad con tus vistas actuales (categorías/socios).

// Utilidades DOM mínimas
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

// Bloquea pantallazo negro: muestra errores en #view
function showFatal(msg){
  const v = $('#view') || document.body;
  v.innerHTML = `<div style="padding:16px;background:#220c10;border:1px solid #5a1f2a;border-radius:12px;color:#ffb4b4">
    ⚠️ ${msg}
  </div>`;
}

// Paracaídas globales
window.addEventListener('error', (e)=>{
  console.error('[GLOBAL ERROR]', e.error || e.message);
  showFatal('Se produjo un error en la aplicación. Abre la Consola para ver detalles.');
});
window.addEventListener('unhandledrejection', (e)=>{
  console.error('[PROMISE REJECTION]', e.reason);
  showFatal('Error inesperado. Revisa la Consola del navegador.');
});

// ---- Router básico con lifecycle ----
let currentUnmount = null;

async function safeUnmount(){
  try{
    if(typeof currentUnmount === 'function') await currentUnmount();
  }catch(err){
    console.warn('[unmount error]', err);
  }finally{
    currentUnmount = null;
  }
}

async function mountWithFallback(loadModule, candidates, mountArgs=[]){
  // Carga dinámica del módulo y busca cualquier firma conocida de montaje
  const mod = await loadModule();
  const f = candidates.find(name => typeof mod[name] === 'function');
  if (!f) throw new Error('No se encontró función de montaje en el módulo.');
  const un = await mod[f](...mountArgs);
  // Permite que el módulo devuelva un unmount o que exponga una función conocida
  if (typeof un === 'function') return un;
  const uf = ['unmount','unmountView','unmountCategorias','unmountSocios'].find(name => typeof mod[name] === 'function');
  if (uf) return mod[uf];
  return null;
}

function setTitle(t){ const te = $('#title'); if(te) te.textContent = t; }
function clearTopActions(){ const ta=$('#topActions'); if(ta) ta.innerHTML=''; }

// Rutas soportadas
async function handleRoute(){
  const hash = location.hash || '#/socios';
  const [_, route] = hash.split('#/');
  await safeUnmount();

  // siempre hay contenedor
  const view = $('#view');
  if (view) view.innerHTML = '';

  try{
    switch(route){
      case 'socios':
        setTitle('Socios');
        clearTopActions();
        // Vista de CATEGORÍAS (home de socios)
        currentUnmount = await mountWithFallback(
          () => import('./views/categorias.js'),
          // Buscamos cualquiera de estas (compatibilidad con tus nombres previos)
          ['mountCategorias','mountCategoriasView','mount','initCategorias'],
          [view]
        );
        break;

      case 'transacciones':
        setTitle('Transacciones');
        clearTopActions();
        currentUnmount = await mountWithFallback(
          () => import('./views/transacciones.js'),
          ['mountTransacciones','mount','init'],
          [view]
        );
        break;

      case 'pedidos': case 'seguimiento': case 'clientes':
      case 'inventario': case 'devoluciones': case 'transacciones-old':
        setTitle(route.charAt(0).toUpperCase()+route.slice(1));
        clearTopActions();
        if (view) view.appendChild(el('div',{class:'card',style:{padding:'16px'}},[
          el('h3',{},['Vista ', route]), el('div',{class:'muted'},['(Placeholder)'])
        ]));
        currentUnmount = null;
        break;

      default:
        // fallback a socios
        location.hash = '#/socios';
        return;
    }
  }catch(err){
    console.error('[route error]', err);
    showFatal('No se pudo montar la vista. Revisa la Consola del navegador.');
  }
}

// Navegación del sidebar (data-view)
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

  // Estado activo
  function markActive(){
    const r = (location.hash || '#/socios').replace('#/','');
    Array.from(nav.querySelectorAll('.nav-btn')).forEach(b=>{
      b.classList.toggle('active', b.getAttribute('data-view')===r);
    });
  }
  window.addEventListener('hashchange', markActive);
  markActive();
}

// Asegura hash por defecto y arranca
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

// Reacciona a cambios de ruta
window.addEventListener('hashchange', handleRoute);
