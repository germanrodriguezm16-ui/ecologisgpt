const listeners = new Set();

export const router = {
  current: null,
  go(hash) {
    if (location.hash !== hash) location.hash = hash;
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  },
  on(fn) { listeners.add(fn); return () => listeners.delete(fn); }
};

function parseHash() {
  const h = location.hash.replace(/^#/, '');
  const parts = h.split('/').filter(Boolean);
  return { raw: h, parts };
}

function notify() {
  const ctx = parseHash();
  router.current = ctx;
  for (const fn of listeners) try { fn(ctx); } catch(e){ console.error('[router] listener error', e); }
}

window.addEventListener('hashchange', notify);
window.addEventListener('DOMContentLoaded', () => {
  if (!location.hash) router.go('#/socios');
  else notify();
});
