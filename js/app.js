import { $, $all, el } from './utils/dom.js'
import { loadCategorias } from './views/categorias.js'
import { handleSocioFormSubmit } from './views/socios.js'
import { openTransaccionesView, handleTransaccionFormSubmit } from './views/transacciones.js'
import { initInventario } from './views/inventario.js'
import { getClient } from './services/supabase.js'
import {
  bindConfirm,
  bindModalCloseButtons,
  openCatModal,
  getCatEditId,
  closeCatModal,
  closeAllModalsAndOverlays
} from './ui/modals.js'
import { mountFAB, unmountFAB, getCurrentRoute } from './ui/fab-manager.js'
import './ui/actions-delegation.js'

// boot beacon (runs after imports)
console.log('[BOOT] app.js OK - Hot Reload funcionando! ✅ Verificado')
// beacon helper
window.beacon = function beacon (tag, data) {
  try {
    if (tag) console.log('[' + tag + ']', data === undefined ? '' : data)
  } catch (_) {}
}

// Debug helper para forzar mount
window.egMount = function egMount (tab) {
  console.log('[DEBUG] Forzando mount de:', tab)
  try {
    mountView(tab)
    console.log('[DEBUG] Mount exitoso')
  } catch (e) {
    console.error('[DEBUG] Error en mount:', e)
  }
};

// Sentry init (optional)
(function initSentry () {
  try {
    const DSN = (window.APP_CONFIG && window.APP_CONFIG.SENTRY_DSN) || ''

    if (DSN && window.Sentry) {
      window.Sentry.init({ dsn: DSN, environment: 'production', tracesSampleRate: 0 })
    }
  } catch (e) {
    console.warn('Sentry init skipped', e)
  }
})()

// Simple demo views for other modules

const mountView = tab => {
  console.log('[MOUNT] Iniciando mountView para:', tab)
  console.log('[MOUNT] Elementos DOM - #view:', !!$('#view'), '#nav:', !!$('#nav'))

  // Defensive cleanup: ensure no leftover modals/overlays remain before mounting a new view
  try {
    closeAllModalsAndOverlays()
  } catch (_) {}
  try {
    window.beacon && window.beacon('NAV', { to: tab })
  } catch (_) {}
  $all('.nav-btn', $('#nav')).forEach(b => b.classList.toggle('active', b.dataset.view === tab))
  $('#title').textContent = tab.charAt(0).toUpperCase() + tab.slice(1)

  // Gestionar scopes de página para theme-overrides.css
  const body = document.body
  const main = document.querySelector('main')
  
  // Remover todas las clases de scope existentes
  const scopes = ['partners-page', 'transactions-page', 'inventory-page', 'categories-page']
  scopes.forEach(scope => {
    body?.classList.remove(scope)
    main?.classList.remove(scope)
  })
  
  // Agregar el scope correspondiente
  const scopeMap = {
    'socios': 'partners-page',
    'transacciones': 'transactions-page', 
    'inventario': 'inventory-page',
    'categorias': 'categories-page'
  }
  
  const currentScope = scopeMap[tab]
  if (currentScope) {
    body?.classList.add(currentScope)
    main?.classList.add(currentScope)
    console.log('[MOUNT] Scope de página aplicado:', currentScope)
  }

  // Limpiar view
  const viewEl = $('#view')

  if (viewEl) {
    viewEl.innerHTML = ''
    console.log('[MOUNT] View limpiado')
  } else {
    console.error('[MOUNT] Elemento #view no encontrado')
    return
  }

  if (tab === 'socios') {
    console.log('[MOUNT] Montando vista de socios')

    // Crear estructura original de socios
    const root = document.createElement('div')

    root.id = 'sociosRoot'
    root.appendChild(
      el('div', { id: 'socTop', class: 'actions-inline', style: { marginBottom: '12px' } }, [])
    )
    root.appendChild(el('div', { id: 'socGrid', class: 'grid' }, []))
    viewEl.appendChild(root)
    console.log('[MOUNT] Estructura de socios creada')

    // Configurar botón de acción
    $('#topActions').innerHTML =
      '<button class="btn btn--primary" id="btnNuevaCat" type="button" data-action="open-new-category">Crear categoría de socios</button>'
    // El evento se maneja por delegación en actions-delegation.js

    // Cargar categorías
    try {
      getClient()
      console.log('[MOUNT] Cliente Supabase obtenido correctamente')

      // Cargar categorías después de que el DOM esté listo
      setTimeout(() => {
        try {
          console.log('[MOUNT] Intentando cargar categorías...')
          const socGridEl = $('#socGrid')

          if (socGridEl) {
            console.log('[MOUNT] Elemento #socGrid encontrado, cargando categorías')
            loadCategorias()
          } else {
            console.error('[MOUNT] Elemento #socGrid no encontrado')
            viewEl.innerHTML = '<div class="error">Error: elemento #socGrid no encontrado</div>'
          }
        } catch (e) {
          console.error('[MOUNT] Error loading categorias:', e)
          const socGridEl = $('#socGrid')

          if (socGridEl) {
            socGridEl.innerHTML =
              '<div class="error">Error cargando categorías: ' + (e?.message || e) + '</div>'
          } else {
            viewEl.innerHTML =
              '<div class="error">Error cargando categorías: ' + (e?.message || e) + '</div>'
          }
        }
      }, 200)
    } catch (e) {
      console.error('[MOUNT] Error getting Supabase client:', e)
      const socGridEl = $('#socGrid')

      if (socGridEl) {
        socGridEl.innerHTML =
          '<div class="error">Error de conexión: ' + (e?.message || e) + '</div>'
      } else {
        viewEl.innerHTML = '<div class="error">Error de conexión: ' + (e?.message || e) + '</div>'
      }
    }
  } else if (tab === 'transacciones') {
    try {
      openTransaccionesView()
    } catch (e) {
      console.error('Error opening transacciones view', e)
      $('#topActions').innerHTML = ''
      viewEl.innerHTML =
        '<div class="card"><h3>💳 Transacciones</h3><p>Error cargando transacciones: ' +
        (e?.message || e) +
        '</p></div>'
    }
  } else if (tab === 'inventario') {
    try {
      console.log('[MOUNT] Montando vista de inventario')
      initInventario(viewEl)
    } catch (e) {
      console.error('Error opening inventario view', e)
      $('#topActions').innerHTML = ''
      viewEl.innerHTML =
        '<div class="card"><h3>📦 Inventario</h3><p>Error cargando inventario: ' +
        (e?.message || e) +
        '</p></div>'
    }
  } else {
    $('#topActions').innerHTML = ''
    viewEl.innerHTML =
      '<div class="card"><h3>' +
      tab.charAt(0).toUpperCase() +
      tab.slice(1) +
      '</h3><p class="muted">Vista demo.</p></div>'
  }

  // Fallback adicional: asegurar que siempre haya contenido visible
  setTimeout(() => {
    if (viewEl && viewEl.children.length === 0) {
      console.warn('[FALLBACK] View vacío, mostrando contenido de emergencia')
      viewEl.innerHTML =
        '<div class="card"><h3>Bienvenido a Ecologist-GPT</h3><p class="muted">Selecciona una opción del menú lateral para comenzar.</p></div>'
    }
  }, 1000)

  location.hash = tab
  console.log('[MOUNT] mountView completado para:', tab)
}

const onHashChange = () => {
  const tab = (location.hash || '#socios').slice(1)

  console.log('[HASH] onHashChange ejecutado, tab:', tab)
  try {
    closeAllModalsAndOverlays()
  } catch (_) {}
  try {
    window.beacon && window.beacon('NAV', { from: location.hash, to: tab })
  } catch (_) {}
  
  // Gestionar FAB según la ruta
  try {
    unmountFAB()
    mountFAB(getCurrentRoute())
  } catch (error) {
    console.error('[FAB] Error managing FAB:', error)
  }
  
  mountView(tab)
}

console.log('[BOOT] registrando DOMContentLoaded')
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('[BOOT] DOM listo')

    // Health check temporal
    console.log('[health] APP_CONFIG:', window.APP_CONFIG)

    try {
      const supabase = getClient()
      const { data, error } = await supabase.from('categorias_socios').select('*').limit(1)

      console.log('[health] Test categorias_socios:', { data, error })

      if (error) {
        console.error('[health] Error Supabase:', error)
        const errorDiv = document.createElement('div')

        errorDiv.className = 'error'
        errorDiv.style.cssText =
          'position:fixed;top:10px;right:10px;background:#ef4444;color:white;padding:10px;border-radius:5px;z-index:10000;'
        errorDiv.innerHTML = `Error Supabase: ${error.message}`
        document.body.appendChild(errorDiv)
      } else {
        console.log('[health] Supabase OK - categorías encontradas:', data?.length || 0)
      }
    } catch (e) {
      console.error('[health] Error en health check:', e)
      const errorDiv = document.createElement('div')

      errorDiv.className = 'error'
      errorDiv.style.cssText =
        'position:fixed;top:10px;right:10px;background:#ef4444;color:white;padding:10px;border-radius:5px;z-index:10000;'
      errorDiv.innerHTML = `Health check failed: ${e.message}`
      document.body.appendChild(errorDiv)
    }
    // Defensive cleanup at startup
    try {
      closeAllModalsAndOverlays()
    } catch (_) {}
    // bind modals
    bindConfirm()
    bindModalCloseButtons()

    // nav
    $('#nav').addEventListener('click', e => {
      const btn = e.target.closest('.nav-btn')

      if (!btn) return
      mountView(btn.dataset.view)
    })

    // forms submit binding
    // Categoría
    $('#formCat').addEventListener('submit', async e => {
      e.preventDefault()
      const supabase = getClient()
      const f = e.target
      const nombre = f.nombre.value.trim()
      const color = f.color.value || '#3ba55d'
      const balance = parseFloat(f.balance.value || '0')

      if (!nombre) return alert('Nombre obligatorio')
      const catId = getCatEditId()

      if (catId) {
        const up = await supabase
          .from('categorias_socios')
          .update({ nombre, color, balance })
          .eq('id', catId)

        if (up.error) return alert(up.error.message)
        try {
          window.beacon && window.beacon('CAT:SAVED', { id: catId, action: 'update' })
        } catch (_) {}
      } else {
        const ins = await supabase
          .from('categorias_socios')
          .insert([{ nombre, color, balance, tab2_name: 'Notas', tab3_name: 'Archivos' }])

        if (ins.error) return alert(ins.error.message)
        try {
          const newId = ins && ins.data && ins.data[0] && ins.data[0].id ? ins.data[0].id : null

          window.beacon && window.beacon('CAT:SAVED', { id: newId, action: 'insert' })
        } catch (_) {}
      }
      closeCatModal()
      loadCategorias()
    })
    // Socio
    $('#formSocio').addEventListener('submit', e => handleSocioFormSubmit(e))

    // Transacciones form submit
    const formT = $('#formTransaccion')

    if (formT) formT.addEventListener('submit', e => handleTransaccionFormSubmit(e))

    // La preparación del modal de transacciones se realiza en views/transacciones.prepareTransaccionModal()

    window.addEventListener('hashchange', onHashChange)
    console.log('[BOOT] llamando onHashChange, hash=', location.hash)

    // Asegurar que siempre haya un hash válido
    if (!location.hash || location.hash === '#') {
      location.hash = '#socios'
    }

    // Ejecutar onHashChange después de un pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
      try {
        onHashChange()
      } catch (e) {
        console.error('[BOOT] Error en onHashChange:', e)
        // Fallback: mostrar contenido básico
        const viewEl = document.getElementById('view')

        if (viewEl) {
          viewEl.innerHTML =
            '<div class="card"><h3>Error de inicialización</h3><p>Hubo un problema al cargar la aplicación. Recarga la página.</p></div>'
        }
      }
    }, 100)
  } catch (e) {
    console.error('[BOOT] error en DOMContentLoaded', e)
    try {
      const v = document.getElementById('view')

      if (v) {
        v.innerHTML =
          '<div class="error">Error inicializando la app: ' + (e?.message || e) + '</div>'
      }
    } catch (_) {}
  }
})
