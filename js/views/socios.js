// js/views/socios.js — Paquete 1.0 (completo)
import { $, $all, el, esc } from '../utils/dom.js'
import { fmt } from '../utils/format.js'
import { contrastColor, borderOn, initials, mutedFor } from '../utils/colors.js'
import { getClient, getCategoriaById } from '../services/supabase.js'
import { openConfirm, openSocioModal, openTransaccionModal } from '../ui/modals.js'
import { prepareTransaccionModal } from './transacciones.js'
// FAB se maneja centralmente en fab-manager.js

let currentCat = null
let currentCatName = ''
let currentCatTab2 = 'Notas'
let currentCatTab3 = 'Archivos'
let prefView = localStorage.getItem('sociosViewMode') || 'cards'

// Búsqueda local (cache + helpers)
// let sociosCache = [] // TODO: Implementar cache de socios
let currentSearchQuery = ''

function debounce (fn, wait) {
  let t = null

  return function (...args) {
    clearTimeout(t)
    t = setTimeout(() => fn.apply(this, args), wait)
  }
}

function filterRows (rows, q) {
  if (!q) return rows
  const qq = String(q).toLowerCase()

  return (rows || []).filter(r => {
    const emp = String(r.empresa || '').toLowerCase()
    const tit = String(r.titular || '').toLowerCase()

    return emp.includes(qq) || tit.includes(qq)
  })
}

/* ========== Navegación principal ========== */
export function openSociosList (catId, catName) {
  currentCat = catId
  currentCatName = catName || 'Socios'
  $('#title').textContent = 'Socios · ' + currentCatName
  $('#view').innerHTML = ''

  const labelBtn =
    String(currentCatName).toLowerCase() === 'proveedores' ? 'Crear proveedor' : 'Crear socio'

  $('#topActions').innerHTML =
    '<div style="display:flex;gap:10px;align-items:center">' +
    '  <button class="btn btn--ghost" id="btnBack" type="button">← Volver</button>' +
    '  <input id="socSearch" type="search" placeholder="Buscar por empresa o titular..." style="padding:6px 8px;border-radius:6px;border:1px solid var(--muted);min-width:220px" />' +
    '  <div class="actions-inline">' +
    '    <button class="btn btn--' +
    (prefView === 'list' ? 'warn' : 'secondary') +
    '" id="btnList" type="button" aria-pressed="' +
    (prefView === 'list' ? 'true' : 'false') +
    '">Lista</button>' +
    '    <button class="btn btn--' +
    (prefView === 'cards' ? 'warn' : 'secondary') +
    '" id="btnCards" type="button" aria-pressed="' +
    (prefView === 'cards' ? 'true' : 'false') +
    '">Tarjetas</button>' +
    '    <button class="btn btn--primary" id="btnNewSocio" type="button" data-action="open-new-partner">' +
    esc(labelBtn) +
    '</button>' +
    '  </div>' +
    '</div>'

  // FIX: botón "Volver" correctamente (hash con #)
  $('#btnBack').addEventListener('click', () => {
    const prev = window.location.hash

    window.location.hash = '#socios'
    // Si ya estabas en #socios, fuerza al router a refrescar categorías:
    if (prev === '#socios') {
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    }
  })

  $('#btnList').addEventListener('click', () => {
    prefView = 'list'
    localStorage.setItem('sociosViewMode', 'list')

    // Feedback visual instantáneo
    $('#btnList').classList.add('btn--warn')
    $('#btnList').setAttribute('aria-pressed', 'true')
    $('#btnCards').classList.remove('btn--warn')
    $('#btnCards').setAttribute('aria-pressed', 'false')

    renderSocios()
  })

  $('#btnCards').addEventListener('click', () => {
    prefView = 'cards'
    localStorage.setItem('sociosViewMode', 'cards')

    // Feedback visual instantáneo
    $('#btnCards').classList.add('btn--warn')
    $('#btnCards').setAttribute('aria-pressed', 'true')
    $('#btnList').classList.remove('btn--warn')
    $('#btnList').setAttribute('aria-pressed', 'false')

    renderSocios()
  })

  $('#btnNewSocio').addEventListener('click', () => openSocioModal(null, currentCatName))

  // bind search input (debounced)
  const searchEl = $('#socSearch')

  if (searchEl) {
    searchEl.value = currentSearchQuery || ''
    searchEl.addEventListener(
      'input',
      debounce(e => {
        currentSearchQuery = String(e.target.value || '').trim()
        renderSocios()
      }, 250)
    )
  }

  $('#view').appendChild(el('div', { id: 'socContent' }, ['Cargando…']))

  // FAB se maneja centralmente en fab-manager.js
  getCategoriaById(currentCat)
    .then(cat => {
      currentCatTab2 = cat?.tab2_name || 'Notas'
      currentCatTab3 = cat?.tab3_name || 'Archivos'
    })
    .finally(renderSocios)
}

/* ========== Carga de datos ========== */
function fetchSociosQuery () {
  const supabase = getClient()

  return supabase
    .from('socios')
    .select('*')
    .eq('categoria_id', currentCat)
    .order('orden', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: false })
}

async function fetchSocios () {
  const { data, error } = await fetchSociosQuery()

  if (error) return { rows: [], error }
  return { rows: data || [], error: null }
}

/* ========== Render principal ========== */
export async function renderSocios () {
  const cont = $('#socContent')

  cont.innerHTML = 'Cargando…'
  const r = await fetchSocios()

  if (r.error) {
    cont.innerHTML = '<div class="error">' + esc(r.error.message) + '</div>'
    return
  }
  const rows = r.rows || []

  // sociosCache = rows // TODO: Implementar cache de socios
  const filtered = filterRows(rows, currentSearchQuery)

  if (!rows.length) {
    cont.innerHTML = '<div class="empty">No hay socios en esta categoría.</div>'
    return
  }

  if (filtered.length === 0) {
    cont.innerHTML = '<div class="empty">No se encontraron socios.</div>'
    return
  }

  cont.innerHTML = ''
  if (prefView === 'list') cont.appendChild(buildSociosTable(filtered, currentCatName))
  else cont.appendChild(buildSociosCards(filtered, currentCatName))

  // Drag & drop en cards
  if (prefView === 'cards' && window.Sortable) {
    const grid = $('#socContent .grid')

    if (grid) {
      window.Sortable.create(grid, {
        animation: 150,
        onEnd: async function () {
          try {
            const supabase = getClient()
            const items = $all('.card', grid).map((card, idx) => ({
              id: Number(card.getAttribute('data-id')),
              orden: idx + 1
            }))

            await Promise.all(
              items.map(it => supabase.from('socios').update({ orden: it.orden }).eq('id', it.id))
            )
          } catch (err) {
            console.error(err)
            alert('No se pudo guardar el nuevo orden de socios.')
          }
        }
      })
    }
  }
}

/* ========== Cards (con balance y buen contraste) ========== */
function buildSociosCards (rows, currentCatName) {
  const grid = el('div', { class: 'grid' })

  rows.forEach(r => {
    const bg = r.card_color || '#121a26'
    const txt = contrastColor(bg)
    const mut = mutedFor(bg)
    const brd = borderOn(bg)

    const c = el('div', {
      class: 'card',
      style: { background: bg, color: txt, borderColor: brd }
    })

    c.setAttribute('data-id', r.id)

    // header
    const header = el('div', { class: 'row' })
    const left = el('div', { class: 'row-flex' })

    const avatar = r.avatar_url
      ? el('img', { class: 'avatar', src: r.avatar_url })
      : el(
        'div',
        {
          class: 'avatar',
          style: {
            display: 'grid',
            placeItems: 'center',
            color: mut,
            fontWeight: '700'
          }
        },
        [initials(r.empresa)]
      )

    left.appendChild(avatar)

    const titleWrap = el('div')
    const h = el('div', { style: { fontWeight: '700' } }, [r.empresa || '—'])
    const sub = el('div', { style: { color: mut } }, [r.titular || '—'])

    titleWrap.appendChild(h)
    titleWrap.appendChild(sub)
    left.appendChild(titleWrap)

    const actions = el('div', { class: 'actions-column' })
    const ebtn = el('button', { class: 'icon-btn icon-btn--edit', title: 'Editar', type: 'button', 'data-action': 'edit-partner', 'data-id': r.id })

    ebtn.innerHTML = pencil()
    const dbtn = el('button', { class: 'icon-btn icon-btn--delete', title: 'Eliminar', type: 'button', 'data-action': 'delete-partner', 'data-id': r.id })

    dbtn.innerHTML = trash()
    actions.appendChild(ebtn)
    actions.appendChild(dbtn)

    header.appendChild(left)
    header.appendChild(actions)
    c.appendChild(header)

    // Balance grande (sin teléfono/dirección)
    const balance = el(
      'div',
      {
        style: {
          marginTop: '10px',
          fontSize: '16px',
          fontWeight: '600',
          color: txt
        }
      },
      ['Balance: $' + fmt(r.balance || 0)]
    )

    c.appendChild(balance)

    // click para detalle (evitar si se toca un botón)
    c.addEventListener('click', e => {
      if (e.target.closest('.icon-btn')) return
      openSocioDetail(r)
    })

    grid.appendChild(c)
  })

  // acciones
  $all('.icon-btn.edit', grid).forEach(b =>
    b.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()
      const card = b.closest('.card')
      const id = card?.dataset?.id // Mantener como string (UUID)
      const socio = rows.find(x => x.id === id) // Comparar strings directamente

      openSocioModal(socio, currentCatName)
    })
  )

  $all('.icon-btn.delete', grid).forEach(b =>
    b.addEventListener('click', e => {
      e.stopPropagation()
      const id = b.closest('.card').dataset.id // Mantener como string (UUID)

      deleteSocio(id)
    })
  )

  return grid
}

/* ========== Lista (con balance incluido) ========== */
function buildSociosTable (rows, currentCatName) {
  const table = el('table', { class: 'list' })
  const thead = el('thead')
  const trh = el('tr');

  ['', 'Empresa', 'Titular', 'Teléfono', 'Dirección', 'Balance', ''].forEach(h => {
    const th = el('th', {}, [h])

    trh.appendChild(th)
  })
  thead.appendChild(trh)
  table.appendChild(thead)

  const tbody = el('tbody')

  rows.forEach(r => {
    const tr = el('tr', { 'data-id': r.id })

    // avatar
    const td0 = el('td')
    const avatar = r.avatar_url
      ? `<img class="avatar" src="${esc(r.avatar_url)}" alt="">`
      : `<div class="avatar" style="display:grid;place-items:center;color:var(--muted);font-weight:700">${initials(
        r.empresa
      )}</div>`

    td0.innerHTML = avatar

    const td1 = el('td', {}, [r.empresa || '—'])
    const td2 = el('td', {}, [r.titular || '—'])
    const td3 = el('td', {}, [r.telefono || '—'])
    const td4 = el('td', {}, [r.direccion || '—'])
    const td5 = el('td', {}, ['$' + fmt(r.balance || 0)])

    const td6 = el('td')
    const mini = el('div', { class: 'mini-actions' })
    const ebtn = el('button', { class: 'icon-btn icon-btn--edit', title: 'Editar', type: 'button', 'data-action': 'edit-partner', 'data-id': r.id })

    ebtn.innerHTML = pencil()
    const dbtn = el('button', { class: 'icon-btn icon-btn--delete', title: 'Eliminar', type: 'button', 'data-action': 'delete-partner', 'data-id': r.id })

    dbtn.innerHTML = trash()
    mini.appendChild(ebtn)
    mini.appendChild(dbtn)
    td6.appendChild(mini)

    tr.appendChild(td0)
    tr.appendChild(td1)
    tr.appendChild(td2)
    tr.appendChild(td3)
    tr.appendChild(td4)
    tr.appendChild(td5)
    tr.appendChild(td6)

    // click en fila (evita botones)
    tr.addEventListener('click', e => {
      if (e.target.closest('.mini-actions')) return
      openSocioDetail(r)
    })

    tbody.appendChild(tr)
  })
  table.appendChild(tbody)

  // Drag & drop en lista
  if (window.Sortable) {
    window.Sortable.create(tbody, {
      animation: 150,
      ghostClass: 'drag-ghost',
      filter: '.mini-actions button',
      preventOnFilter: false,
      onEnd: async function () {
        try {
          const supabase = getClient()
          const items = $all('tr[data-id]', tbody).map((tr, idx) => ({
            id: Number(tr.getAttribute('data-id')),
            orden: idx + 1
          }))

          await Promise.all(
            items.map(it => supabase.from('socios').update({ orden: it.orden }).eq('id', it.id))
          )
        } catch (err) {
          console.error(err)
          alert('No se pudo guardar el nuevo orden de socios.')
        }
      }
    })
  }

  // acciones
  $all('.icon-btn.edit', table).forEach(b =>
    b.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()
      const id = b.closest('tr').dataset.id // Mantener como string (UUID)
      const socio = rows.find(x => x.id === id) // Comparar strings directamente

      openSocioModal(socio, currentCatName)
    })
  )

  $all('.icon-btn.delete', table).forEach(b =>
    b.addEventListener('click', e => {
      e.stopPropagation()
      const id = b.closest('tr').dataset.id // Mantener como string (UUID)

      deleteSocio(id)
    })
  )

  return table
}

/* ========== Borrado con confirmación (callback modal actual) ========== */
async function deleteSocio (id) {
  openConfirm(
    '¿Eliminar este socio?',
    async () => {
      const supabase = getClient()
      const { error } = await supabase.from('socios').delete().eq('id', id)

      if (error) alert(error.message)
      else renderSocios()
    },
    'Eliminar socio'
  )
}

/* ========== Detalle del socio con tabs (hereda nombres de categoría) ========== */
export async function openSocioDetail (socio) {
  $('#title').textContent = 'Socio · ' + (socio.empresa || '—')
  $('#topActions').innerHTML =
    '<button class="btn btn--ghost" id="btnBackSocios" type="button">← Volver a socios</button>'
  $('#btnBackSocios').addEventListener('click', () =>
    openSociosList(socio.categoria_id || currentCat, currentCatName)
  )

  const cat = await getCategoriaById(socio.categoria_id || currentCat)

  currentCatTab2 = cat?.tab2_name || 'Notas'
  currentCatTab3 = cat?.tab3_name || 'Archivos'

  const wrap = document.createElement('div')
  const tabs = document.createElement('div')

  tabs.className = 'tabs'
  tabs.id = 'socioDetailTabs'

  tabs.innerHTML =
    '<button class="tab-btn active" data-tab="tx">Transacciones</button>' +
    '<button class="tab-btn" data-tab="t2">' +
    esc(currentCatTab2) +
    '</button>' +
    '<button class="tab-btn" data-tab="t3">' +
    esc(currentCatTab3) +
    '</button>'

  const panel = document.createElement('div')

  panel.className = 'tab-panel active'
  panel.id = 'socioDetailPanel'
  
  // Renderizar contenido inicial (tab de transacciones)
  const initialContent = renderSocioDetailPanel('tx', socio)
  if (initialContent && initialContent.nodeType) {
    panel.appendChild(initialContent)
  } else {
    panel.innerHTML = initialContent || ''
  }

  tabs.addEventListener('click', e => {
    const b = e.target.closest('.tab-btn')

    if (!b) return
    const tab = b.getAttribute('data-tab')

    $all('.tab-btn', tabs).forEach(x => x.classList.toggle('active', x === b))
    
    // Limpiar panel y renderizar nuevo contenido
    panel.innerHTML = ''
    const newContent = renderSocioDetailPanel(tab, socio)
    
    // Si es un elemento DOM, agregarlo directamente
    if (newContent && newContent.nodeType) {
      panel.appendChild(newContent)
    } else {
      // Si es HTML string, usar innerHTML
      panel.innerHTML = newContent || ''
    }
  })

  wrap.appendChild(tabs)
  wrap.appendChild(panel)
  $('#view').innerHTML = ''
  $('#view').appendChild(wrap)
}

function renderSocioDetailPanel (tab, socio) {
  if (tab === 'tx') {
    // Crear contenedor para transacciones del socio
    const container = document.createElement('div')
    container.innerHTML = 
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
      '<div class="muted">Transacciones de <b>' +
      esc(socio.empresa || '—') +
      '</b>.</div>' +
      '<button class="btn btn--primary" type="button" id="btnAddTxSocio">Agregar transacción</button>' +
      '</div>' +
      '<div id="socioTransaccionesContainer">Cargando transacciones...</div>'
    
    // Cargar transacciones del socio
    setTimeout(async () => {
      try {
        console.log('[Socios] renderSocioDetailPanel: cargando transacciones para socio:', socio)
        const { renderSocioTransacciones } = await import('./transacciones.js')
        console.log('[Socios] renderSocioDetailPanel: renderSocioTransacciones importada:', renderSocioTransacciones)
        const containerEl = container.querySelector('#socioTransaccionesContainer')
        console.log('[Socios] renderSocioDetailPanel: containerEl encontrado:', containerEl)
        if (containerEl) {
          console.log('[Socios] renderSocioDetailPanel: llamando renderSocioTransacciones con socio.id:', socio.id)
          await renderSocioTransacciones(socio.id, containerEl)
          console.log('[Socios] renderSocioDetailPanel: renderSocioTransacciones completada')
          console.log('[Socios] renderSocioDetailPanel: containerEl después de renderSocioTransacciones:', containerEl)
          console.log('[Socios] renderSocioDetailPanel: contenido del containerEl:', containerEl.innerHTML)
        } else {
          console.error('[Socios] renderSocioDetailPanel: containerEl no encontrado')
        }
      } catch (err) {
        console.error('[Socios] Error cargando transacciones del socio:', err)
        const containerEl = container.querySelector('#socioTransaccionesContainer')
        if (containerEl) {
          containerEl.innerHTML = '<div class="error">Error cargando transacciones</div>'
        }
      }
    }, 100)
    
    // Configurar botón de agregar transacción
    setTimeout(() => {
      const btnAddTx = container.querySelector('#btnAddTxSocio')
      if (btnAddTx) {
        btnAddTx.addEventListener('click', async () => {
          try {
            const { openTransaccionModal, prepareTransaccionModal } = await import('./transacciones.js')
            openTransaccionModal()
            await prepareTransaccionModal()
          } catch (err) {
            console.error('[Socios] Error abriendo modal de transacción:', err)
          }
        })
      }
    }, 200)
    
    return container
  }
  if (tab === 't2') {
    return (
      '<div><div class="muted">Pestaña 2: <b>' +
      esc(currentCatTab2) +
      '</b> (definido por la categoría).</div><div class="empty" style="margin-top:8px">Sin contenido.</div></div>'
    )
  }
  return (
    '<div><div class="muted">Pestaña 3: <b>' +
    esc(currentCatTab3) +
    '</b> (definido por la categoría).</div><div class="empty" style="margin-top:8px">Sin contenido.</div></div>'
  )
}

/* ========== Crear/editar socio + subida de avatar (export requerido por app.js) ========== */
export async function handleSocioFormSubmit (e) {
  e.preventDefault()
  const supabase = getClient()
  const f = $('#formSocio')

  const empresa = f.empresa.value.trim()
  const titular = f.titular.value.trim()

  if (!empresa || !titular) return alert('Empresa y Titular son obligatorios')

  const telefono = f.telefono.value.trim()
  const direccion = f.direccion.value.trim()
  const card_color = f.card_color.value || '#121a26'

  let socioId = f.getAttribute('data-edit-id') || null

  if (socioId) {
    socioId = Number(socioId)
    const up = await supabase
      .from('socios')
      .update({ empresa, titular, telefono, direccion, card_color })
      .eq('id', socioId)

    if (up.error) return alert(up.error.message)
  } else {
    const ins = await supabase
      .from('socios')
      .insert([
        {
          categoria_id: currentCat,
          empresa,
          titular,
          telefono,
          direccion,
          card_color
        }
      ])
      .select('id')
      .single()

    if (ins.error) return alert(ins.error.message)
    socioId = ins.data.id
  }

  const file = f.avatar.files[0]

  if (file) {
    if (file.size > 2 * 1024 * 1024) return alert('El archivo supera 2 MB')
    const path = socioId + '/' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const up = await supabase.storage.from('socios').upload(path, file, {
      upsert: true
    })

    if (!up.error) {
      const pub = supabase.storage.from('socios').getPublicUrl(path)
      const url = pub?.data?.publicUrl

      if (url) {
        await supabase.from('socios').update({ avatar_url: url }).eq('id', socioId)
      }
    } else {
      alert('Error subiendo imagen: ' + up.error.message)
    }
  }

  // use centralized modal close helper to ensure backdrop and handlers are cleaned
  import('../ui/modals.js').then(m => m.closeSocioModal())
  renderSocios()
}

/* ========== Iconos ========== */
function pencil () {
  return '<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" stroke-width="1.5"/></svg>'
}
function trash () {
  return '<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M6 7h12M9 7V4h6v3m-8 3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
}
