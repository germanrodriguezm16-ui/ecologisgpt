// app/core/router.js
const listeners = new Set();

function parseHash(){
  const h = (location.hash || '#/socios').replace(/^#\/?/, '');
  const parts = h.split('/').filter(Boolean);
  return { raw: h, parts };
}

function notify(){
  const ctx = parseHash();
  listeners.forEach(fn => { try { fn(ctx); } catch (e) { console.error(e); } });
}

export const router = {
  on(fn){ listeners.add(fn); },
  off(fn){ listeners.delete(fn); },
  go(path){ location.hash = path; },
  current(){ return parseHash(); }
};

// Siempre escuchar cambios del hash
window.addEventListener('hashchange', notify);

// Disparos “por si acaso”: si este archivo se carga después de DOMContentLoaded,
// igual notificamos a los suscriptores inmediatamente.
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  // Ejecuta en el próximo tick para dar tiempo a que se registren los listeners.
  setTimeout(notify, 0);
} else {
  document.addEventListener('DOMContentLoaded', notify);
}
