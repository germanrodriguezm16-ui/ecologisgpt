// small FAB helper: crea y monta un botón flotante que ejecuta un handler al activarse
export function createFAB({ id = 'fabNewTrans', ariaLabel = 'Nueva transacción', title = 'Nueva transacción', onActivate } = {}){
  // evita crear duplicados
  if (document.getElementById(id)) return document.getElementById(id);
  const btn = document.createElement('button');
  btn.id = id;
  btn.className = 'fab';
  btn.type = 'button';
  btn.setAttribute('aria-label', ariaLabel);
  btn.setAttribute('title', title);
  btn.innerHTML = '<span class="fab-icon">\uD83D\uDCB3</span>'; // money bag icon as fallback

  // events
  btn.addEventListener('click', (e)=>{ e.preventDefault(); if(typeof onActivate === 'function') onActivate(e); });
  btn.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); btn.click(); } });

  // keyboard shortcut Alt+N
  function onKey(ev){ if(ev.altKey && (ev.key === 'n' || ev.key === 'N')){ ev.preventDefault(); btn.click(); } }
  document.addEventListener('keydown', onKey);

  // store cleanup handle
  btn._fabCleanup = ()=>{ document.removeEventListener('keydown', onKey); btn.remove(); };

  document.body.appendChild(btn);
  return btn;
}

export function removeFAB(id = 'fabNewTrans'){
  const el = document.getElementById(id);
  if(!el) return;
  try{ if(typeof el._fabCleanup === 'function') el._fabCleanup(); }catch(_){ }
}
