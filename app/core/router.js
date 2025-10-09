// app/core/router.js
// Sencillo router basado en hash con handlers de mount/unmount/update por módulo.
const listeners = new Set();

export const router = {
  current: null,
  go(hash) {
    if (location.hash !== hash) location.hash = hash;
    // forzar dispatch para casos donde el hash sea el mismo
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  },
  on(fn) { listeners.add(fn); return () => listeners.delete(fn); }
};

function parseHash() {
  const h = location.hash.replace(/^#/, '');
  const parts = h.split('/').filter(Boolean);
  // rutas: ["socios"] | ["socios", ":catId"]
  return { raw: h, parts };
}

function notify() {
  const ctx = parseHash();
  router.current = ctx;
  for (const fn of listeners) try { fn(ctx); } catch(e){ console.error('[router] listener error', e); }
}

window.addEventListener('hashchange', notify);
window.addEventListener('DOMContentLoaded', () => {
  // ruta por defecto
  if (!location.hash) router.go('#/socios');
  else notify();
});

export function isRoute(ctx, name){ return ctx.parts[0] === name; }
export function routeParam(ctx, idx){ return ctx.parts[idx] || null; }
