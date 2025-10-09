// app/core/router.js
const listeners = new Set();

function parseHash(){
  const h = (location.hash || '#/socios').replace(/^#\/?/, '');
  const parts = h.split('/').filter(Boolean);
  return { raw: h, parts };
}

function notify(){
  const ctx = parseHash();
  listeners.forEach(fn => { try{ fn(ctx); }catch(e){ console.error(e); } });
}

export const router = {
  on(fn){ listeners.add(fn); },
  off(fn){ listeners.delete(fn); },
  go(path){ location.hash = path; },
  current(){ return parseHash(); }
};

window.addEventListener('hashchange', notify);
document.addEventListener('DOMContentLoaded', notify);
