// js/ui/fab-manager.js - FAB Manager por ruta
// Gestiona la creación/eliminación de FABs según la ruta actual

// SVG para FAB de transacción
const transactionSVG = () => `
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`

// SVG para FAB de producto
const productSVG = () => `
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#ffffff;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#f8fafc;stop-opacity:0.9" />
      </linearGradient>
      <filter id="boxShadow">
        <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)"/>
      </filter>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#boxGradient)" stroke="rgba(255,255,255,0.2)" stroke-width="1" filter="url(#boxShadow)"/>
    <rect x="6" y="8" width="12" height="8" rx="1" fill="none" stroke="#ffffff" stroke-width="2" filter="url(#boxShadow)"/>
    <path d="M6 8L12 5L18 8" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" filter="url(#boxShadow)"/>
    <path d="M12 10v4M10 12h4" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" fill="none" filter="url(#boxShadow)"/>
  </svg>
`

// Determinar qué FAB mostrar según la ruta
export function shouldShowFAB(route) {
  console.debug('[ui:fab] shouldShowFAB route=', route)
  
  if (route === '#socios' || route === '#transacciones') {
    return 'transaction'
  } else if (route === '#inventario') {
    return 'product'
  }
  return 'none'
}

// Crear FAB según el tipo
function createFABButton(type) {
  const fab = document.createElement('button')
  fab.className = 'fab'
  fab.style.position = 'fixed'
  fab.style.right = 'calc(24px + env(safe-area-inset-right))'
  fab.style.bottom = 'calc(24px + env(safe-area-inset-bottom))'
  fab.style.width = '64px'
  fab.style.height = '64px'
  fab.style.borderRadius = '50%'
  fab.style.display = 'flex'
  fab.style.alignItems = 'center'
  fab.style.justifyContent = 'center'
  fab.style.border = 'none'
  fab.style.cursor = 'pointer'
  fab.style.zIndex = '1000'
  fab.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  fab.style.backdropFilter = 'blur(10px)'

        if (type === 'transaction') {
          fab.setAttribute('aria-label', 'Crear transacción')
          fab.setAttribute('title', 'Crear transacción')
          fab.setAttribute('data-action', 'open-new-transaction')
          fab.classList.add('fab--money')
          fab.style.background = 'var(--money-green)'
          fab.style.boxShadow = '0 8px 24px rgba(34, 197, 94, 0.35), 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
          fab.innerHTML = transactionSVG()
        } else if (type === 'product') {
    fab.setAttribute('aria-label', 'Crear producto')
    fab.setAttribute('title', 'Crear producto')
    fab.setAttribute('data-action', 'open-new-product')
    fab.style.background = '#3b82f6'
    fab.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.35), 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
    fab.innerHTML = productSVG()
  }

  // Hover effects
  fab.addEventListener('mouseenter', () => {
    fab.style.transform = 'translateY(-4px) scale(1.08)'
    if (type === 'transaction') {
      fab.style.boxShadow = '0 16px 40px rgba(255, 122, 0, 0.45), 0 8px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15) inset'
    } else {
      fab.style.boxShadow = '0 16px 40px rgba(59, 130, 246, 0.45), 0 8px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.15) inset'
    }
  })

  fab.addEventListener('mouseleave', () => {
    fab.style.transform = 'translateY(0) scale(1)'
    if (type === 'transaction') {
      fab.style.boxShadow = '0 8px 24px rgba(255, 122, 0, 0.35), 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
    } else {
      fab.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.35), 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
    }
  })

  return fab
}

// Montar FAB según la ruta
export function mountFAB(route) {
  console.debug('[ui:fab] mountFAB route=', route)
  
  // Remover FAB existente
  unmountFAB()
  
  const fabType = shouldShowFAB(route)
  if (fabType === 'none') {
    return
  }
  
  const fab = createFABButton(fabType)
  fab.id = `fab-${fabType}-${Date.now()}` // ID único para evitar conflictos
  
  document.body.appendChild(fab)
  console.debug('[ui:fab] FAB mounted:', fabType)
}

// Desmontar FAB actual
export function unmountFAB() {
  const existingFab = document.querySelector('.fab')
  if (existingFab) {
    existingFab.remove()
    console.debug('[ui:fab] FAB unmounted')
  }
}

// Obtener ruta actual
export function getCurrentRoute() {
  return window.location.hash || '#socios'
}

// Auto-inicializar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    mountFAB(getCurrentRoute())
  })
} else {
  mountFAB(getCurrentRoute())
}
