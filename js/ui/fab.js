// FAB helper: accessible SVG icon, data-shortcut and single global Alt+N handler
// guard global registration on window to avoid redeclaration across HMR or multiple imports
if (!window.egFabGlobal) window.egFabGlobal = { registered: false }

const addProductSVG = () => {
  return `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <defs>
        <!-- Gradiente para el ícono -->
        <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f8fafc;stop-opacity:0.9" />
        </linearGradient>
        
        <!-- Filtro de sombra -->
        <filter id="boxShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      
      <!-- Círculo de fondo -->
      <circle cx="12" cy="12" r="10" fill="url(#boxGradient)" stroke="rgba(255,255,255,0.2)" stroke-width="1" filter="url(#boxShadow)"/>
      
      <!-- Caja de inventario -->
      <rect x="6" y="8" width="12" height="8" rx="1" fill="none" stroke="#ffffff" stroke-width="2" filter="url(#boxShadow)"/>
      
      <!-- Líneas de la caja -->
      <path d="M6 8L12 5L18 8" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#boxShadow)"/>
      
      <!-- Plus en el centro -->
      <path d="M12 10v4M10 12h4" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" fill="none" filter="url(#boxShadow)"/>
    </svg>
  `;
};

const addTransaccionSVG = () => {
  return `
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <defs>
        <!-- Gradiente para el ícono -->
        <linearGradient id="transGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f8fafc;stop-opacity:0.9" />
        </linearGradient>
        
        <!-- Filtro de sombra -->
        <filter id="transShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
        </filter>
      </defs>
      
      <!-- Círculo de fondo -->
      <circle cx="12" cy="12" r="10" fill="url(#transGradient)" stroke="rgba(255,255,255,0.2)" stroke-width="1" filter="url(#transShadow)"/>
      
      <!-- Símbolo de dinero grande -->
      <text x="12" y="16" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle" filter="url(#transShadow)">$</text>
      
      <!-- Líneas decorativas -->
      <path d="M8 8h8M8 16h8" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" fill="none" filter="url(#transShadow)"/>
    </svg>
  `;
};

// Función para remover el FAB
export function removeFAB(id = null) {
  if (id) {
    // Remover FAB específico por ID
    const existingFab = document.getElementById(id);
    if (existingFab) {
      existingFab.remove();
    }
  } else {
    // Remover cualquier FAB
    const existingFab = document.querySelector('.fab');
    if (existingFab) {
      existingFab.remove();
      window.egFabGlobal.registered = false;
    }
  }
}

// Función para crear el FAB
export function createFAB(config = {}) {
  console.log('[FAB] createFAB called with config:', config);
  
  // Si ya hay un FAB registrado y no se especifica ID, no crear otro
  if (window.egFabGlobal.registered && !config.id) {
    console.log('[FAB] Ya hay un FAB registrado y no se especifica ID, no crear otro');
    return;
  }
  
  // Remover FAB existente si se especifica ID
  if (config.id) {
    const existingFab = document.getElementById(config.id);
    if (existingFab) {
      console.log('[FAB] Removiendo FAB existente con ID:', config.id);
      existingFab.remove();
    }
  } else {
    // Si no se especifica ID, remover cualquier FAB existente
    const existingFab = document.querySelector('.fab');
    if (existingFab) {
      console.log('[FAB] Removiendo FAB existente sin ID');
      existingFab.remove();
    }
  }
  
  const fab = document.createElement('button');
  fab.className = 'fab';
  
  // Configurar según el tipo de FAB
  if (config.id === 'fabNewTrans') {
    // FAB para crear transacción (naranja)
    fab.id = config.id;
    fab.setAttribute('aria-label', config.ariaLabel || 'Crear transacción');
    fab.setAttribute('title', config.title || 'Crear transacción');
    fab.innerHTML = addTransaccionSVG();
    fab.style.background = 'var(--lcdm-primary)';
    fab.style.boxShadow = '0 8px 24px rgba(255, 122, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
    
    // Event listener para transacción
    fab.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('FAB de transacción clickeado, config:', config);
      
      try {
        if (config.onActivate) {
          console.log('Ejecutando onActivate...');
          await config.onActivate();
          console.log('onActivate ejecutado exitosamente');
        } else {
          console.error('No hay onActivate configurado en el FAB');
        }
      } catch (error) {
        console.error('Error ejecutando onActivate del FAB:', error);
        // Fallback: navegar a transacciones
        console.log('Navegando a transacciones como fallback...');
        window.location.hash = '#transacciones';
      }
    });
  } else {
    // FAB para crear producto (azul) - solo en inventario
    fab.setAttribute('aria-label', 'Crear nuevo producto');
    fab.setAttribute('data-shortcut', 'Alt+N');
    fab.innerHTML = addProductSVG();
    
    // Event listener para producto
    fab.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Solo funciona en inventario
      const currentView = window.location.hash;
      if (currentView === '#inventario') {
        const modal = document.getElementById('modalProducto');
        if (modal) {
          modal.style.display = 'flex';
          setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
          }, 100);
        }
      }
    });
    
    // Event listener para el atajo de teclado
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        fab.click();
      }
    });
  }
  
  document.body.appendChild(fab);
  window.egFabGlobal.registered = true;
  
  console.log('[FAB] FAB creado exitosamente:', {
    id: fab.id || 'sin-id',
    className: fab.className,
    type: config.id === 'fabNewTrans' ? 'transaccion' : 'producto'
  });
  
  return fab;
}

// Auto-inicializar solo para inventario
if (!window.egFabGlobal.registered) {
  // Solo crear FAB automáticamente si estamos en inventario
  const currentView = window.location.hash;
  if (currentView === '#inventario') {
    createFAB();
  }
}

// Verificar FAB al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const currentView = window.location.hash;
  console.log('[FAB] DOMContentLoaded, current view:', currentView);
  
  // Si estamos en inventario y no hay FAB, crearlo
  if (currentView === '#inventario' && !document.querySelector('.fab')) {
    console.log('[FAB] Creando FAB de inventario en DOMContentLoaded');
    createFAB();
  }
});

// Verificar FAB cuando cambia el hash
window.addEventListener('hashchange', () => {
  const currentView = window.location.hash;
  console.log('[FAB] Hash changed to:', currentView);
  
  // Si estamos en inventario y no hay FAB, crearlo
  if (currentView === '#inventario' && !document.querySelector('.fab')) {
    console.log('[FAB] Creando FAB de inventario en hashchange');
    createFAB();
  }
});