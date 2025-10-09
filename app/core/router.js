// app/core/router.js
// Router mínimo con notificación inmediata y breadcrumbs para Sentry

const listeners = new Set();
const S = window.Sentry;

function parseHash() {
  const h = (location.hash || '#/socios').replace(/^#\/?/, '');
  const parts = h.split('/').filter(Boolean);
  return { raw: h, parts };
}

function notify() {
  const ctx = parseHash();
  S?.addBreadcrumb({ category: 'router', message: 'notify', data: ctx, level: 'info' });
  for (const fn of listeners) {
    try { fn(ctx); }
    catch (e) {
      S?.captureException(e, { tags: { where: 'router.notify' }, extra: { ctx } });
      console.error(e);
    }
  }
}

export const router = {
  on(fn)  { listeners.add(fn); S?.addBreadcrumb({ category: 'router', message: 'listener added', level: 'info' }); },
  off(fn) { listeners.delete(fn); },
  go(path){ S?.addBreadcrumb({ category: 'router', message: 'go ' + path, level: 'info' }); location.hash = path; },
  current(){ return parseHash(); }
};

// Escucha cambios del hash siempre
window.addEventListener('hashchange', notify);

// Notifica al cargar aunque DOMContentLoaded ya haya pasado
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(() => { S?.captureMessage('router.notify@ready'); notify(); }, 0);
} else {
  document.addEventListener('DOMContentLoaded', () => { S?.captureMessage('router.notify@DOMContentLoaded'); notify(); }, { once: true });
}
