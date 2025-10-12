// FAB helper: accessible SVG icon, data-shortcut and single global Alt+N handler
// guard global registration on window to avoid redeclaration across HMR or multiple imports
if (!window.egFabGlobal) window.egFabGlobal = { registered: false };

const moneyPlusSVG = () => {
  return `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
};

export const createFAB = ({
  id = 'fabNewTrans',
  ariaLabel = 'Crear transacción',
  title = 'Crear transacción',
  dataShortcut = 'Alt+N',
  onActivate
} = {}) => {
  console.debug('[FAB] createFAB called', { id, ariaLabel });
  if (document.getElementById(id)) {
    console.debug('[FAB] already exists', id);
    return document.getElementById(id);
  }
  const btn = document.createElement('button');

  btn.id = id;
  btn.className = 'fab';
  btn.type = 'button';
  btn.setAttribute('aria-label', ariaLabel);
  btn.setAttribute('title', title);
  btn.setAttribute('data-shortcut', dataShortcut);
  btn.innerHTML = moneyPlusSVG();

  btn.addEventListener('click', e => {
    e.preventDefault();
    if (typeof onActivate === 'function') onActivate(e);
  });
  console.debug('[FAB] appended to DOM', id);
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.click();
    }
  });

  if (!window.egFabGlobal.registered) {
    window.egFabGlobal.registered = true;
    document.addEventListener('keydown', ev => {
      if (ev.altKey && (ev.key === 'n' || ev.key === 'N')) {
        const f = document.querySelector('button.fab[data-shortcut="Alt+N"]');

        if (f) {
          ev.preventDefault();
          f.click();
        }
      }
    });
  }

  btn.fabCleanup = () => {
    try {
      btn.remove();
    } catch (_) {}
  };
  document.body.appendChild(btn);
  return btn;
};

export const removeFAB = (id = 'fabNewTrans') => {
  const el = document.getElementById(id);

  if (!el) return;
  try {
    if (typeof el.fabCleanup === 'function') el.fabCleanup();
  } catch (_) {}
};
