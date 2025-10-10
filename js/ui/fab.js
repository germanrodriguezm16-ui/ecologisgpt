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
  btn.setAttribute('data-shortcut','Alt+N');
  // inline SVG: money + plus (accessible)
  btn.innerHTML = `
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
      <path d="M12 1v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 21v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5 7h14v10H5z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 11h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19 5v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19 7h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  // events
  btn.addEventListener('click', (e)=>{ e.preventDefault(); if(typeof onActivate === 'function') onActivate(e); });
  btn.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); btn.click(); } });

  // keyboard shortcut Alt+N (scoped, prevent duplicate triggers if multiple FABs)
  function onKey(ev){ if(ev.altKey && (ev.key === 'n' || ev.key === 'N')){ ev.preventDefault(); const active = document.getElementById(id); if(active) active.click(); } }
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
