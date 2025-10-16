import { $ } from '../utils/dom.js'

let confirmCb = null

export const openConfirm = (msg, onOk, title) => {
  $('#confirmTitle').textContent = title || 'Confirmar acción'
  $('#confirmMsg').textContent = msg || '¿Seguro que deseas continuar?'
  confirmCb = typeof onOk === 'function' ? onOk : null
  openModal($('#modalConfirm'))
}
export const bindConfirm = () => {
  $('#btnCancelConfirm').addEventListener('click', () => {
    closeModal($('#modalConfirm'))
    confirmCb = null
  })
  $('#btnOkConfirm').addEventListener('click', () => {
    const cb = confirmCb

    confirmCb = null
    closeModal($('#modalConfirm'))
    if (cb) cb()
  })
}

/* Categoría modal */
let catEditId = null

export const openCatModal = (mode, row) => {
  catEditId = mode === 'edit' && row && row.id ? row.id : null
  $('#modalTitle').textContent = catEditId ? 'Editar categoría' : 'Nueva categoría'
  const f = $('#formCat')

  f.setAttribute('data-edit-id', catEditId || '')
  f.nombre.value = row?.nombre || ''
  f.color.value = row?.color || '#3ba55d'
  f.balance.value = row?.balance ?? 0
  openModal($('#modalCat'))
}
export const closeCatModal = () => {
  closeModal($('#modalCat'))
  catEditId = null
}
export const getCatEditId = () => catEditId

/* Config modal */
let catCfgId = null

export const openCatConfig = row => {
  catCfgId = row.id
  $('#modalConfigTitle').textContent = 'Config: ' + (row.nombre || 'Categoría')
  const f = $('#formCatConfig')

  f.tab2_name.value = row.tab2_name || 'Notas'
  f.tab3_name.value = row.tab3_name || 'Archivos'
  openModal($('#modalCatConfig'))
}
export const closeCatConfig = () => {
  closeModal($('#modalCatConfig'))
  catCfgId = null
}
export const getCatCfgId = () => catCfgId

/* Socio modal */
let socioEditId = null

export const openSocioModal = (socio, currentCatName) => {
  socioEditId = socio && socio.id ? socio.id : null

  const modalTitle = $('#modalSocioTitle')

  const isProveedores = String(currentCatName || '').toLowerCase() === 'proveedores'
  const action = socioEditId ? 'Editar' : 'Nuevo'
  const type = isProveedores ? 'proveedor' : 'socio'

  modalTitle.textContent = `${action} ${type}`

  const f = $('#formSocio')

  if (!f) {
    console.error('[MODAL] Error: #formSocio no encontrado')
    return
  }

  f.setAttribute('data-edit-id', socioEditId || '')
  f.empresa.value = socio?.empresa || ''
  f.titular.value = socio?.titular || ''
  f.telefono.value = socio?.telefono || ''
  f.direccion.value = socio?.direccion || ''
  f.card_color.value = socio?.card_color || '#121a26'
  f.avatar.value = ''

  const modal = $('#modalSocio')

  if (!modal) {
    console.error('[MODAL] Error: #modalSocio no encontrado')
    return
  }

  openModal(modal)
}
export const closeSocioModal = () => {
  closeModal($('#modalSocio'))
  socioEditId = null
}
export const getSocioEditId = () => socioEditId

export const bindModalCloseButtons = () => {
  console.log('[MODAL] bind close buttons')
  $('#btnCancelCat')?.addEventListener('click', closeCatModal)
  $('#btnCancelCatCfg')?.addEventListener('click', closeCatConfig)
  $('#btnCancelSocio')?.addEventListener('click', closeSocioModal)
  $('#btnCancelTransaccion')?.addEventListener('click', closeTransaccionModal)
}

// Close all modals, backdrops and preview overlays. This is a defensive cleanup
// to ensure no residual overlays remain when navigating between views.
export const closeAllModalsAndOverlays = () => {
  try {
    // Close and cleanup all backdrops
    const backdrops = Array.from(document.querySelectorAll('.backdrop'))

    backdrops.forEach(bd => {
      try {
        // remove event listeners if stored
        const handlers = bd.modalHandlers || {}

        if (handlers.onBackdropClick) bd.removeEventListener('click', handlers.onBackdropClick)
        if (handlers.onKey) document.removeEventListener('keydown', handlers.onKey)
        // remove open class and force hide
        bd.classList.remove('open')
        try {
          bd.style.display = 'none'
        } catch (_) {}
        // close inner modal
        const modal = bd.querySelector('.modal')

        if (modal) {
          modal.classList.remove('open')
          modal.setAttribute('aria-hidden', 'true')
        }
        // remove handlers reference
        try {
          delete bd.modalHandlers
        } catch (_) {
          bd.modalHandlers = null
        }
      } catch (_) {}
    })

    // Remove any preview overlays that might have been appended to body
    const previews = Array.from(document.querySelectorAll('.preview-overlay'))

    previews.forEach(p => {
      try {
        p.classList.remove('open')
        if (p.parentElement) p.remove()
      } catch (_) {}
    })

    // Restore scrolling
    try {
      document.body.style.overflow = ''
    } catch (_) {}
    console.log(
      '[modals] closeAllModalsAndOverlays: cleaned',
      backdrops.length,
      'backdrops and',
      previews.length,
      'previews'
    )
  } catch (e) {
    console.warn('closeAllModalsAndOverlays error', e)
  }
}

/* Transaccion modal */
export const openTransaccionModal = () => {
  openModal($('#modalTransaccion'))
}
export const closeTransaccionModal = () => {
  closeModal($('#modalTransaccion'))
}

/* Generic modal helpers: operate on modal element (which is inside a .backdrop parent in markup) */
const openModal = el => {
  try {
    console.log('[MODAL] open', el?.id || el?.className)
    if (!el) return console.warn('openModal: element not found')
    // normalize: el can be the backdrop or the inner modal
    let backdrop = null
    let modalEl = null

    if (el.classList && el.classList.contains('backdrop')) {
      backdrop = el
      modalEl = backdrop.querySelector('.modal, .modal-visual')
    } else {
      modalEl = el
      backdrop =
        modalEl &&
        modalEl.parentElement &&
        modalEl.parentElement.classList &&
        modalEl.parentElement.classList.contains('backdrop')
          ? modalEl.parentElement
          : null
    }
    if (!backdrop) {
      console.error('openModal: backdrop not found', el)
      return
    }
    if (!modalEl) {
      console.warn('openModal: modal element not found, using backdrop', el)
      // Si no hay modal interno, usar el backdrop mismo
      modalEl = backdrop
    }
    // add open classes
    backdrop.classList.add('open')
    // ensure visible even if HTML had inline display:none
    try {
      backdrop.style.display = 'flex'
    } catch (_) {}
    modalEl.classList.add('open')
    modalEl.setAttribute('aria-hidden', 'false')
    // lock scroll
    document.body.style.overflow = 'hidden'
    // focus first interactive element
    setTimeout(() => {
      const first = modalEl.querySelector('input, select, textarea, button')

      first?.focus()
    }, 50)
    // backdrop click closes
    const onBackdropClick = ev => {
      if (ev.target === backdrop) closeModal(backdrop)
    }

    backdrop.addEventListener('click', onBackdropClick)
    // esc to close
    const onKey = ev => {
      if (ev.key === 'Escape') closeModal(backdrop)
    }

    document.addEventListener('keydown', onKey)
    // store handlers on backdrop to simplify cleanup
    backdrop.modalHandlers = { modalEl, onBackdropClick, onKey }
  } catch (e) {
    console.warn('openModal error', e)
  }
}

const closeModal = el => {
  try {
    console.log('[MODAL] close', el?.id || el?.className)
  } catch (_) {}
  try {
    if (!el) return
    // el may be backdrop or modal element
    let backdrop = null
    let modalEl = null

    if (el.classList && el.classList.contains('backdrop')) {
      backdrop = el
      modalEl = backdrop.querySelector('.modal')
    } else {
      modalEl = el
      backdrop =
        modalEl &&
        modalEl.parentElement &&
        modalEl.parentElement.classList &&
        modalEl.parentElement.classList.contains('backdrop')
          ? modalEl.parentElement
          : null
    }
    const handlers = (backdrop && backdrop.modalHandlers) || {}

    if (handlers.onBackdropClick && backdrop) { backdrop.removeEventListener('click', handlers.onBackdropClick) }
    if (handlers.onKey) document.removeEventListener('keydown', handlers.onKey)
    if (backdrop) {
      backdrop.classList.remove('open')
      try {
        backdrop.style.display = 'none'
      } catch (_) {}
    }
    if (modalEl) modalEl.classList.remove('open')
    if (modalEl) modalEl.setAttribute('aria-hidden', 'true')
    // restore scroll only if no other backdrop open
    const anyOpen = Array.from(document.querySelectorAll('.backdrop.open')).length > 0

    if (!anyOpen) document.body.style.overflow = ''
    // dispatch closed event for views to cleanup
    try {
      if (modalEl) {
        modalEl.dispatchEvent(
          new CustomEvent('modal:closed', {
            bubbles: true,
            detail: { backdropId: backdrop && backdrop.id }
          })
        )
      }
    } catch (_) {}
    // remove handlers reference
    try {
      if (backdrop) delete backdrop.modalHandlers
    } catch (_) {
      if (backdrop) backdrop.modalHandlers = null
    }
  } catch (e) {
    console.warn('closeModal error', e)
  }
}
