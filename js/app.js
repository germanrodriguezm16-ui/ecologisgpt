// app.js — Router mínimo alineado a tu estructura actual

// ---- utilidades de UI básicas ----
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const setTitle = (txt) => { const t = $('#title'); if (t) t.textContent = txt || '—'; };
const setTopActions = (node) => { const c = $('#topActions'); if (c) { c.innerHTML = ''; if (node) c.appendChild(node); } };
const setView = (node) => { const v = $('#view'); if (v) { v.innerHTML = ''; if (node) v.appendChild(node); } };

// Aviso de error visible en la vista
function showMountError(err, where = '') {
  const wrap = document.createElement('div');
  wrap.style = 'padding:12px; border-radius:10px; border:1px solid #5a2a2a; background:#2a1515; color:#ffb3b3; margin:12px 0;';
  wrap.textContent = '⚠️ No se pudo montar la vista. Revisa la Consola del navegador.';
  if (where) wrap.textContent += ` (${where})`;
  setView(wrap);
  console.error('[mount error]', err);
}

// Importa un módulo y busca una función de “mount”
async function loadAndMount(modulePath, titleLabel) {
  setTitle(titleLabel);
  setTopActions(null);
  setView(document.createTextNode('Cargando…'));

  let mod;
  try {
    mod = await import(modulePath);
  } catch (e) {
    showMountError(e, `import ${modulePath}`);
    return;
  }

  // muestra las claves exportadas para depurar rápido
  console.log(`[exports del módulo ${modulePath}]`, Object.keys(mod));

  // candidatos aceptados para la función de montaje
  const mountFn =
    mod.default ||
    mod.mount ||
    mod.mountView ||
    mod.mountCategorias ||
    mod.mountSocios;

  if (typeof mountFn !== 'function') {
    showMountError(new Error(`No se encontró función de montaje en ${modulePath}`));
    return;
  }

  try {
    // La función de montaje debe encargarse de pintar dentro de #view, #topActions y #title
    // o devolver un nodo para inyectarlo. Soportamos ambas cosas:
    const maybeNode = await mountFn({ $, $$, setTitle, setTopActions, setView });
    if (maybeNode instanceof Node) setView(maybeNode);
  } catch (e) {
    showMountError(e, `run ${modulePath}`);
  }
}

// Router por hash
function parseRoute() {
  const h = location.hash || '#/socios';
  // normaliza dobles barras tipo //#/socios
  const cleaned = h.replace(/^#\/+/, '#/'); 
  const [_, path = 'socios'] = cleaned.slice(1).split('?'); // muy simple
  return path;
}

async function navigate() {
  const path = parseRoute();

  // marca activo en el sidebar
  $$('#nav .nav-btn').forEach(btn => {
    const target = btn.getAttribute('data-view');
    btn.classList.toggle('active', target === path);
  });

  if (path === 'socios') {
    // tu vista de categorías vive en ./views/categorias.js
    await loadAndMount('./views/categorias.js', 'Socios');
    return;
  }

  if (path === 'transacciones') {
    // cuando tengas la vista de transacciones, ajusta a ./views/transacciones.js
    await loadAndMount('./views/transacciones.js', 'Transacciones');
    return;
  }

  // fallback simple
  setTitle(path.charAt(0).toUpperCase() + path.slice(1));
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h3>${setTitle}</h3><p class="muted">Vista demo.</p>`;
  setView(card);
}

// Listeners de navegación del sidebar (requiere data-view en botones)
function wireSidebar() {
  const nav = $('#nav');
  if (!nav) return;
  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('.nav-btn');
    if (!btn) return;
    const view = btn.getAttribute('data-view') || 'socios';
    location.hash = `#/${view}`;
  });
}

// Carga utilidades globales necesarias (no rompe si no existen)
async function bootGlobals() {
  try { await import('./ui/modals.js'); } catch(_) {}
  try { await import('./utils/dom.js'); } catch(_) {}
  try { await import('./utils/colors.js'); } catch(_) {}
  try { await import('./utils/format.js'); } catch(_) {}
}

// API mínima expuesta para que otras vistas puedan navegar
window.APP = {
  goto: (path) => { location.hash = `#/${path.replace(/^#?\/*/,'')}`; },
};

window.addEventListener('hashchange', () => navigate());
document.addEventListener('DOMContentLoaded', async () => {
  wireSidebar();
  await bootGlobals();
  await navigate();
});
