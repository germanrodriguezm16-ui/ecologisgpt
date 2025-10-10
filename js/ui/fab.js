// FAB helper: accessible SVG icon, data-shortcut and single global Alt+N handler
// guard global registration on window to avoid redeclaration across HMR or multiple imports
if (!window.__EG_FAB_GLOBAL) window.__EG_FAB_GLOBAL = { registered: false };


function moneyPlusSVG(){
  return `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <rect x="2" y="6" width="20" height="12" rx="2" fill="currentColor" opacity="0.08"></rect>
      <path d="M8 10h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 8v8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18 6v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20 8h-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

export function createFAB({ id = 'fabNewTrans', ariaLabel = 'Crear transacción', title = 'Crear transacción', dataShortcut = 'Alt+N', onActivate } = {}){
  console.debug('[FAB] createFAB called', { id, ariaLabel });
  if (document.getElementById(id)) { console.debug('[FAB] already exists', id); return document.getElementById(id); }
  const btn = document.createElement('button');
  btn.id = id;
  btn.className = 'fab';
  btn.type = 'button';
  btn.setAttribute('aria-label', ariaLabel);
  btn.setAttribute('title', title);
  btn.setAttribute('data-shortcut', dataShortcut);
  btn.innerHTML = moneyPlusSVG();

  btn.addEventListener('click', (e)=>{ e.preventDefault(); if(typeof onActivate === 'function') onActivate(e); });
  console.debug('[FAB] appended to DOM', id);
  btn.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); btn.click(); } });

  if (!window.__EG_FAB_GLOBAL.registered){
    window.__EG_FAB_GLOBAL.registered = true;
    document.addEventListener('keydown', (ev)=>{
      if (ev.altKey && (ev.key === 'n' || ev.key === 'N')){
        const f = document.querySelector('button.fab[data-shortcut="Alt+N"]');
        if(f){ ev.preventDefault(); f.click(); }
      }
    });
  }

  btn._fabCleanup = ()=>{ try{ btn.remove(); }catch(_){ } };
  document.body.appendChild(btn);
  return btn;
}

export function removeFAB(id = 'fabNewTrans'){
  const el = document.getElementById(id);
  if(!el) return;
  try{ if(typeof el._fabCleanup === 'function') el._fabCleanup(); }catch(_){ }
}
// FAB helper: accessible SVG icon, data-shortcut and single global Alt+N handler
let _globalHandlerRegistered = false;

function moneyPlusSVG(){
  return `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <rect x="2" y="6" width="20" height="12" rx="2" fill="currentColor" opacity="0.08"></rect>
      <path d="M8 10h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 8v8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18 6v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20 8h-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

export function createFAB({ id = 'fabNewTrans', ariaLabel = 'Crear transacción', title = 'Crear transacción', dataShortcut = 'Alt+N', onActivate } = {}){
  if (document.getElementById(id)) return document.getElementById(id);
  const btn = document.createElement('button');
  btn.id = id;
  btn.className = 'fab';
  btn.type = 'button';
  btn.setAttribute('aria-label', ariaLabel);
  btn.setAttribute('title', title);
  btn.setAttribute('data-shortcut', dataShortcut);
  btn.innerHTML = moneyPlusSVG();

  btn.addEventListener('click', (e)=>{ e.preventDefault(); if(typeof onActivate === 'function') onActivate(e); });
  btn.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); btn.click(); } });

  if (!_globalHandlerRegistered){
    _globalHandlerRegistered = true;
    document.addEventListener('keydown', (ev)=>{
      if (ev.altKey && (ev.key === 'n' || ev.key === 'N')){
        // find first visible FAB and click it
        const f = document.querySelector('button.fab[data-shortcut="Alt+N"]');
        if(f){ ev.preventDefault(); f.click(); }
      }
    });
  }

  btn._fabCleanup = ()=>{ try{ btn.remove(); }catch(_){ } };
  document.body.appendChild(btn);
  return btn;
}

export function removeFAB(id = 'fabNewTrans'){
  const el = document.getElementById(id);
  if(!el) return;
  try{ if(typeof el._fabCleanup === 'function') el._fabCleanup(); }catch(_){ }
}
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
