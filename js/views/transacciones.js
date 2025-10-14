import { $, el, esc } from '../utils/dom.js'
import { getClient } from '../services/supabase.js'
import { openTransaccionModal, closeTransaccionModal } from '../ui/modals.js'
// FAB se maneja centralmente en fab-manager.js
import { fmtMoneyCOP, computeTxSign, buildConcepto } from '../utils/format.js'
import { isoUtcToBogotaLabelShort, bogotaLocalToIsoUtc, defaultDatetimeLocalBogota } from '../utils/datetime.js'

export function openTransaccionesView () {
  console.log('[TX] openTransaccionesView()')
  $('#title').textContent = 'Transacciones'
  $('#view').innerHTML = ''

  // Top action previously had a textual button; we hide it in favor of the FAB
  $('#topActions').innerHTML = ''

  // Abrir y preparar modal (separado para cargar selects y formateo)
  // create FAB (reusable) that opens the modal. If a previous FAB exists, remove it first.
  // FAB se maneja centralmente en fab-manager.js

  const container = el('div', { id: 'transContent' }, ['Cargando…'])

  // Agregar botón de refresh para debuggear
  const refreshBtn = el('button', {
    class: 'btn btn--secondary',
    style: {
      'margin-bottom': '10px'
    },
    onclick: () => {
      console.log('[TX] Refresh manual de transacciones')
      renderTransacciones()
    }
  }, ['🔄 Actualizar transacciones'])

  container.appendChild(refreshBtn)

  $('#view').appendChild(container)

  renderTransacciones()
}

export async function prepareTransaccionModal () {
  console.log('[TX] prepareTransaccionModal()')
  try {
    const supabase = getClient()
    const cats = await supabase
      .from('categorias_socios')
      .select('*')
      .order('orden', { ascending: true })
    // const socios = await supabase.from('socios').select('*').order('empresa', { ascending: true }) // TODO: Usar para filtrar socios
    const sel = id => document.getElementById(id)

    if (cats.data) {
      ['origen_categoria_id', 'destino_categoria_id'].forEach(id => {
        const elSel = sel(id)

        if (!elSel) return
        elSel.innerHTML = ''
        // placeholder option
        const ph = new Option('Seleccione categoría', '')

        ph.disabled = true
        ph.selected = true
        ph.hidden = true
        elSel.add(ph)
        cats.data.forEach(c => elSel.add(new Option(c.nombre, c.id)))
        try {
          elSel.value = ''
        } catch (_) {}
      })
    }

    async function loadSociosForCategory (catId, targetSelectId) {
      const sEl = sel(targetSelectId)

      if (!sEl) return
      sEl.innerHTML = ''
      if (!catId) return

      // Agregar placeholder
      const placeholder = new Option('Seleccione socio', '')

      placeholder.disabled = true
      placeholder.selected = true
      placeholder.hidden = true
      sEl.add(placeholder)

      const { data: socs, error } = await supabase
        .from('socios')
        .select('*')
        .eq('categoria_id', catId)
        .order('empresa', { ascending: true })

      if (error) return console.warn('Error cargando socios por categoría', error.message)

      // Limpiar duplicados usando Map
      const uniqueSocios = new Map()

      socs.forEach(s => {
        const key = `${s.id}-${s.empresa}-${s.titular}`

        if (!uniqueSocios.has(key)) {
          uniqueSocios.set(key, s)
        } else {
          console.warn('[TX] Socio duplicado detectado:', s.empresa, s.titular)
        }
      })

      console.log(`[TX] Cargando ${uniqueSocios.size} socios únicos para categoría ${catId}`)
      uniqueSocios.forEach(s => {
        sEl.add(new Option(s.empresa + ' — ' + (s.titular || ''), s.id))
      })
    }

    const origenCat = document.getElementById('origen_categoria_id')
    const destinoCat = document.getElementById('destino_categoria_id')

    // Limpiar event listeners previos para evitar duplicados
    if (origenCat) {
      origenCat.removeEventListener('change', origenCat._changeHandler)
      origenCat._changeHandler = async e => {
        console.log('[TX] Cambio en categoría origen:', e.target.value)
      await loadSociosForCategory(e.target.value, 'origen_socio_id')
      const origenSel = document.getElementById('origen_socio_id')

      if (origenSel) origenSel.value = ''
      }
      origenCat.addEventListener('change', origenCat._changeHandler)
    }

    if (destinoCat) {
      destinoCat.removeEventListener('change', destinoCat._changeHandler)
      destinoCat._changeHandler = async e => {
        console.log('[TX] Cambio en categoría destino:', e.target.value)
      await loadSociosForCategory(e.target.value, 'destino_socio_id')
      const destinoSel = document.getElementById('destino_socio_id')

      if (destinoSel) destinoSel.value = ''
      }
      destinoCat.addEventListener('change', destinoCat._changeHandler)
    }

    // fecha default se inicializa al preparar el picker más abajo

    const { createCurrencyFSM } = await import('../utils/currency.js')
    const valorInput = document.querySelector('input[name="valor"]')

    if (valorInput) {
      const fsm = createCurrencyFSM()
      // let composing = false // TODO: Implementar composición de texto

      valorInput.value = fsm.getDisplay()
      valorInput.addEventListener('keydown', e => {
        if (e.key === 'Backspace') {
          e.preventDefault()
          fsm.backspace()
          valorInput.value = fsm.getDisplay()
          return
        }
        if (e.key === '.' || e.key === ',') {
          e.preventDefault()
          fsm.inputSep()
          valorInput.value = fsm.getDisplay()
          return
        }
        if (/^[0-9]$/.test(e.key)) {
          e.preventDefault()
          fsm.inputDigit(e.key)
          valorInput.value = fsm.getDisplay()
        }
      })
      // valorInput.addEventListener('compositionstart', () => composing = true) // TODO: Implementar composición
      // valorInput.addEventListener('compositionend', (e) => { composing = false; valorInput.value = fsm.getDisplay() }) // TODO: Implementar composición
      valorInput.addEventListener('paste', e => {
        e.preventDefault()
        const text = (e.clipboardData || window.clipboardData).getData('text') || ''
        const cleaned = text.replace(/[^0-9.,]/g, '')

        for (const ch of cleaned) {
          if (/[0-9]/.test(ch)) fsm.inputDigit(ch)
          else if (ch === '.' || ch === ',') fsm.inputSep()
        }
        valorInput.value = fsm.getDisplay()
      })
    }

    // evitar seleccionar el mismo socio en destino al elegir origen
    const origenSel = document.getElementById('origen_socio_id')
    const destinoSel = document.getElementById('destino_socio_id')

    function syncDisable () {
      if (!origenSel || !destinoSel) return
      const origenVal = origenSel.value

      Array.from(destinoSel.options).forEach(opt => (opt.disabled = opt.value === origenVal))
    }
    origenSel?.addEventListener('change', syncDisable)
    destinoSel?.addEventListener('change', () => {
      if (origenSel && destinoSel && origenSel.value === destinoSel.value) { alert('Origen y destino no pueden ser el mismo socio') }
    })

    // -------- Fecha picker: mostrar formato DD/MM/YYYY  HH:mm en .fecha-display y permitir abrir picker con el icono
    const fechaInput = document.querySelector('input[name="fecha"]')
    const fechaDisplay = document.querySelector('.fecha-display')
    const btnFecha = document.getElementById('btnFechaPicker')
    let fpInstance = null // flatpickr instance if available

    // helpers for showing inline field errors
    function showFieldError (fieldName, msg) {
      try {
        const container =
          document.getElementById('voucherInfo')?.parentElement ||
          document.getElementById('formTransaccion')

        if (!container) return
        let err = document.getElementById(fieldName + 'Error')

        if (!err) {
          err = document.createElement('div')
          err.id = fieldName + 'Error'
          err.className = 'field-error'
          container.appendChild(err)
        }
        err.textContent = msg
      } catch (_) {}
    }
    function clearFieldError (fieldName) {
      try {
        const e = document.getElementById(fieldName + 'Error')

        if (e) e.remove()
      } catch (_) {}
    }
    function formatFechaDisplayFromDatetimeLocal (val) {
      if (!val) return ''
      
      // Convertir datetime-local a ISO UTC y luego a formato corto
      const isoUtc = bogotaLocalToIsoUtc(val)
      if (!isoUtc) return ''
      
      return isoUtcToBogotaLabelShort(isoUtc)
    }
    function syncFechaDisplay () {
      if (fechaDisplay) { fechaDisplay.textContent = formatFechaDisplayFromDatetimeLocal(fechaInput.value) }
    }
    // set default datetime-local to now in Bogota if empty
    if (fechaInput && !fechaInput.value) {
      fechaInput.value = defaultDatetimeLocalBogota()
    }

    // Try to initialize flatpickr (datetime) if available. Graceful fallback to native picker.
    try {
      if (window.flatpickr && fechaInput) {
        fpInstance = window.flatpickr(fechaInput, {
          enableTime: true,
          time_24hr: true,
          dateFormat: 'Y-m-dTH:i',
          defaultDate: fechaInput.value || null,
          onChange: function (selectedDates, dateStr) {
            // dateStr comes formatted as configured (Y-m-dTH:i) matching datetime-local
            fechaInput.value = dateStr
            syncFechaDisplay()
          }
        })
      }
    } catch (_) {
      fpInstance = null
    }
    // init display
    syncFechaDisplay()
    fechaInput.addEventListener('change', () => {
      syncFechaDisplay()
    })
    if (btnFecha) {
      btnFecha.addEventListener('click', e => {
        e.preventDefault()
        if (!fechaInput) return
        // If flatpickr instance exists, open it explicitly
        if (fpInstance && typeof fpInstance.open === 'function') {
          try {
            fpInstance.open()
          } catch (_) {
            /* fallback below */
          }
          return
        }
        if (typeof fechaInput.showPicker === 'function') {
          try {
            fechaInput.showPicker()
          } catch (_) {
            fechaInput.focus()
          }
        } else {
          fechaInput.focus()
        }
      })
    }

    // -------- Voucher file handling (temporal hasta submit)
    const btnAdjuntar = document.getElementById('btnAdjuntar')
    const inputVoucher = document.getElementById('inputVoucher')
    const voucherInfo = document.getElementById('voucherInfo')
    const fileThumb = voucherInfo?.querySelector('.file-thumb')
    const fileNameEl = voucherInfo?.querySelector('.file-name')
    const btnRemove = document.getElementById('btnRemoveVoucher')
    let selectedVoucherFile = null

    function showVoucher (file) {
      if (!voucherInfo) return
      voucherInfo.style.display = 'flex'
      if (file) {
        fileNameEl.textContent = file.name
        // show thumbnail for images
        if (/image\//.test(file.type)) {
          const url = file._objUrl || null

          if (fileThumb) fileThumb.style.backgroundImage = url ? `url(${url})` : ''
        } else if (fileThumb) fileThumb.style.backgroundImage = ''
      } else {
        fileNameEl.textContent = ''
        if (fileThumb) fileThumb.style.backgroundImage = ''
      }
    }

    btnAdjuntar?.addEventListener('click', () => inputVoucher?.click())
    inputVoucher?.addEventListener('change', e => {
      const f = e.target.files && e.target.files[0]

      if (!f) return
      // validate type and size (<=5MB)
      const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']

      if (!allowed.includes(f.type)) {
        // mostrar error no intrusivo
        showFieldError('voucher', 'Tipo de archivo no permitido. Usa JPG/PNG/PDF.')
        return
      }
      if (f.size > 5 * 1024 * 1024) {
        showFieldError('voucher', 'El archivo supera 5 MB')
        return
      }
      clearFieldError('voucher')
      selectedVoucherFile = f
      // create object URL
      try {
        selectedVoucherFile._objUrl = URL.createObjectURL(f)
      } catch (_) {
        selectedVoucherFile._objUrl = null
      }
      showVoucher(f)
    })
    btnRemove?.addEventListener('click', () => {
      // revoke object URL if any and close preview
      try {
        if (selectedVoucherFile && selectedVoucherFile._objUrl) {
          URL.revokeObjectURL(selectedVoucherFile._objUrl)
        }
      } catch (_) {}
      selectedVoucherFile = null
      if (inputVoucher) inputVoucher.value = ''
      if (voucherInfo) voucherInfo.style.display = 'none'
      closePreview()
    })

    // Attach selectedVoucherFile to form before submit (store in dataset as temporary name)
    const form = document.getElementById('formTransaccion')

    if (form) {
      form._getSelectedVoucher = () => selectedVoucherFile
    }

    // ---------- Preview overlay logic
    let previewOverlay = null

    function createPreviewOverlay () {
      if (previewOverlay) return previewOverlay
      const ov = document.createElement('div')

      ov.className = 'preview-overlay'
      const box = document.createElement('div')

      box.className = 'preview-box'
      box.style.maxWidth = '90%'
      box.style.maxHeight = '90%'
      box.style.background = 'var(--card)'
      box.style.borderRadius = '10px'
      box.style.padding = '12px'
      box.style.position = 'relative'
      box.style.overflow = 'auto'
      const closeBtn = document.createElement('button')

      closeBtn.textContent = '✖'
      closeBtn.className = 'file-action remove'
      closeBtn.style.position = 'absolute'
      closeBtn.style.top = '8px'
      closeBtn.style.right = '8px'
      box.appendChild(closeBtn)
      const content = document.createElement('div')

      content.className = 'preview-content'
      content.style.maxHeight = '80vh'
      content.style.overflow = 'auto'
      box.appendChild(content)
      ov.appendChild(box)
      // handlers
      function onClose () {
        closePreview()
      }
      closeBtn.addEventListener('click', onClose)
      ov.addEventListener('click', ev => {
        if (ev.target === ov) onClose()
      })
      document.addEventListener('keydown', onKeyPreview)
      previewOverlay = { el: ov, content, handlers: { onClose, onKey: onKeyPreview, closeBtn } }
      return previewOverlay
    }
    function onKeyPreview (e) {
      if (e.key === 'Escape') closePreview()
    }
    function showPreviewFor (file) {
      if (!file) return
      const p = createPreviewOverlay()

      p.content.innerHTML = ''
      if (file.type.startsWith('image/')) {
        const img = document.createElement('img')

        img.src = file._objUrl || ''
        img.style.maxWidth = '100%'
        img.style.maxHeight = '80vh'
        img.style.display = 'block'
        p.content.appendChild(img)
        if (!document.body.contains(p.el)) document.body.appendChild(p.el)
        p.el.classList.add('open')
      } else if (file.type === 'application/pdf') {
        // try embed
        const embed = document.createElement('embed')

        embed.src = file._objUrl || ''
        embed.type = 'application/pdf'
        embed.style.width = '80vw'
        embed.style.height = '80vh'
        p.content.appendChild(embed)
        if (!document.body.contains(p.el)) document.body.appendChild(p.el)
        p.el.classList.add('open')
        // fallback: if embed fails, open in new tab
        setTimeout(() => {
          const emb = p.content.querySelector('embed')

          if (emb && emb.clientWidth === 0) window.open(file._objUrl, '_blank')
        }, 300)
      } else {
        // fallback open in new tab
        window.open(file._objUrl || '', '_blank')
      }
    }
    function closePreview () {
      if (!previewOverlay) return
      try {
        document.removeEventListener('keydown', onKeyPreview)
        previewOverlay.el.classList.remove('open')
        if (previewOverlay.el.parentElement) previewOverlay.el.remove()
      } catch (_) {}
      previewOverlay = null
    }

    // show preview on eye icon
    const eyeBtn = voucherInfo?.querySelector('.file-action.view')

    eyeBtn?.addEventListener('click', () => {
      const f = selectedVoucherFile

      if (!f) return
      showPreviewFor(f)
    })

    // cleanup on modal close
    const modalEl = document.getElementById('modalTransaccion')

    function cleanupOnClose () {
      // revoke objectURL
      try {
        if (selectedVoucherFile && selectedVoucherFile._objUrl) {
          URL.revokeObjectURL(selectedVoucherFile._objUrl)
        }
      } catch (_) {}
      selectedVoucherFile = null
      if (inputVoucher) inputVoucher.value = ''
      if (voucherInfo) voucherInfo.style.display = 'none'
      closePreview()
      // remove event listeners (best-effort)
      try {
        eyeBtn?.removeEventListener('click', () => {})
        btnAdjuntar?.removeEventListener('click', () => {})
        btnRemove?.removeEventListener('click', () => {})
        inputVoucher?.removeEventListener('change', () => {})
      } catch (_) {}
    }
    modalEl?.addEventListener('modal:closed', cleanupOnClose)
  } catch (e) {
    console.warn('No se pudieron cargar selects de transacciones', e)
  }
}

// Sistema de lookup para nombres de socios y categorías
async function fetchLookupMaps () {
  console.log('[TX] fetchLookupMaps: inicio')
  const s = getClient()
  console.log('[TX] fetchLookupMaps: cliente Supabase:', s)
  
  const [cats, socs] = await Promise.all([
    s.from('categorias_socios').select('id,nombre'),
    s.from('socios').select('id,empresa,avatar_url')
  ])
  
  console.log('[TX] fetchLookupMaps: cats:', cats)
  console.log('[TX] fetchLookupMaps: socs:', socs)
  
  const catById = new Map((cats.data || []).map(r => [r.id, r.nombre]))
  const socById = new Map((socs.data || []).map(r => [r.id, { nombre: r.empresa, avatar: r.avatar_url || '' }]))

  console.log('[TX] fetchLookupMaps: catById:', catById)
  console.log('[TX] fetchLookupMaps: socById:', socById)
  console.log('[TX] fetchLookupMaps: retornando maps')

  return { catById, socById }
}

// Resuelve nombres de origen y destino
function resolveNames (tx, { catById, socById }) {
  console.log('[TX] resolveNames: inicio para tx:', tx)
  console.log('[TX] resolveNames: catById:', catById)
  console.log('[TX] resolveNames: socById:', socById)
  
  const o = tx.origen_socio_id ? (socById.get(tx.origen_socio_id)?.nombre) : catById.get(tx.origen_categoria_id)
  const d = tx.destino_socio_id ? (socById.get(tx.destino_socio_id)?.nombre) : catById.get(tx.destino_categoria_id)

  console.log('[TX] resolveNames: o:', o, 'd:', d)
  const result = { origenNombre: o || '—', destinoNombre: d || '—' }
  console.log('[TX] resolveNames: resultado:', result)
  
  return result
}

// Resuelve icono según tipo de transacción
function resolveIcon (tx) {
  console.log('[TX] resolveIcon: inicio para tx:', tx)
  if (tx.voucher_type === 'application/pdf') {
    console.log('[TX] resolveIcon: retornando 📄')
    return '📄'
  }
  if (tx.voucher_type && tx.voucher_type.startsWith('image/')) {
    console.log('[TX] resolveIcon: retornando 🧾')
    return '🧾'
  }
  console.log('[TX] resolveIcon: retornando 💳 por defecto')
  return '💳' // por defecto tarjeta/billete
}

// Renderiza una fila de transacción con micro-animaciones
function renderTxRow (tx, maps, { perspectiveSocioId = null, isNew = false } = {}) {
  console.log('[TX] renderTxRow: inicio para tx:', tx)
  console.log('[TX] renderTxRow: maps:', maps)
  console.log('[TX] renderTxRow: perspectiveSocioId:', perspectiveSocioId)
  
  try {
    const { origenNombre, destinoNombre } = resolveNames(tx, maps)
    console.log('[TX] renderTxRow: nombres resueltos:', { origenNombre, destinoNombre })
    
    const c = buildConcepto({ origenNombre, destinoNombre, comentario: tx.comentario })
    console.log('[TX] renderTxRow: concepto construido:', c)
    
    const fecha = isoUtcToBogotaLabelShort(tx.fecha || tx.created_at)
    console.log('[TX] renderTxRow: fecha formateada:', fecha)
    
    const sign = computeTxSign(tx, { perspectiveSocioId })
    console.log('[TX] renderTxRow: sign calculado:', sign)
    
    const valClass = sign > 0 ? 'tx-valor-pos' : (sign < 0 ? 'tx-valor-neg' : '')
    const valPrefix = sign > 0 ? '+' : (sign < 0 ? '−' : '')
    console.log('[TX] renderTxRow: valClass:', valClass, 'valPrefix:', valPrefix)

    const tr = el('tr', { class: isNew ? 'tx-row--new' : '' }, [
      el('td', { class: 'tx-col-fecha' }, [esc(fecha)]),
      el('td', { class: 'tx-col-concepto', title: c.texto }, [
        el('span', { class: 'tx-concepto' }, [
          el('span', { class: 'tx-icon' }, [esc(resolveIcon(tx))]),
          el('span', { class: 'tx-badge tx-badge--origen' }, [esc(c.o)]),
          el('span', { class: 'tx-badge tx-badge--destino' }, [esc(c.d)]),
          el('span', {}, [' — ']),
          el('span', {}, [esc(tx.comentario || '')])
        ])
      ]),
      el('td', { class: `tx-col-valor ${valClass}` }, [esc(valPrefix + fmtMoneyCOP(tx.valor))])
    ])

    console.log('[TX] renderTxRow: tr generada:', tr)
    return tr
  } catch (err) {
    console.error('[TX] renderTxRow: error:', err, 'tx:', tx)
    // Retornar una fila de error en lugar de fallar completamente
    return el('tr', {}, [
      el('td', { colspan: '3', class: 'error' }, ['Error renderizando transacción: ' + (err.message || 'Error desconocido')])
    ])
  }
}

// Función removida - se usa directamente en renderTransacciones

export async function renderTransacciones () {
  console.log('[TX] renderTransacciones(): inicio')
  const cont = $('#transContent')

  if (!cont) {
    console.warn('[TX] renderTransacciones: contenedor transContent no encontrado')
    return
  }
  cont.innerHTML = 'Cargando…'

  try {
    const s = getClient()
    console.log('[TX] Cliente Supabase:', s)
    console.log('[TX] Configuración APP_CONFIG:', window.APP_CONFIG)
    console.log('[TX] Ejecutando consulta a transacciones...')
    
    // Consulta simple para obtener transacciones
    const { data: rows, error } = await s.from('transacciones').select('*').order('fecha', { ascending: false }).limit(200)
    console.log('[TX] Respuesta de Supabase:', { data: rows, error })
    
    // Si no hay datos, probar con autenticación
    if (!error && (!rows || rows.length === 0)) {
      console.log('[TX] Probando con autenticación...')
      const { data: authRows, error: authError } = await s.from('transacciones').select('*').order('fecha', { ascending: false }).limit(200)
      console.log('[TX] Respuesta con auth:', { data: authRows, error: authError })
    }
    
    // Si no hay datos, mostrar mensaje informativo
    if (!error && (!rows || rows.length === 0)) {
      console.log('[TX] No se encontraron transacciones. Verificando permisos...')
      
      // Mostrar mensaje más específico al usuario
      cont.innerHTML = `
        <div class="error" style="padding: 20px; text-align: center;">
          <h3>⚠️ No se pueden cargar las transacciones</h3>
          <p>Posible problema de permisos en Supabase.</p>
          <p>Verifica la configuración RLS de la tabla 'transacciones'.</p>
          <button class="btn btn--secondary" onclick="location.reload()">🔄 Reintentar</button>
        </div>
      `
      return
    }

    if (error) {
      console.error('[TX] Error cargando transacciones:', error)
      cont.innerHTML = '<div class="error">Error cargando transacciones: ' + (error.message || 'Error') + '</div>'
      return
    }

    console.log('[TX] Transacciones cargadas:', rows?.length || 0)
    if (rows && rows.length > 0) {
      console.log('[TX] Primera transacción:', rows[0])
    }

    const maps = await fetchLookupMaps()
    const table = el('table', { class: 'table-visual' })
    const thead = el('thead')

    thead.innerHTML = '<tr><th class="tx-col-fecha">Fecha</th><th class="tx-col-concepto">Concepto</th><th class="tx-col-valor">Valor</th></tr>'
    table.appendChild(thead)
    const tbody = el('tbody')

    if (rows && rows.length > 0) {
      console.log('[TX] Renderizando', rows.length, 'transacciones')
      rows.forEach((tx, index) => {
        console.log(`[TX] Renderizando transacción ${index + 1}:`, tx.id, tx.comentario)
        tbody.appendChild(renderTxRow(tx, maps))
      })
    } else {
      console.log('[TX] No hay transacciones para mostrar')
      const emptyRow = el('tr', {}, [
        el('td', { 
          colspan: '3', 
          style: {
            'text-align': 'center',
            'padding': '20px',
            'color': 'var(--muted)'
          }
        }, ['No hay transacciones registradas'])
      ])

      tbody.appendChild(emptyRow)
    }

    table.appendChild(tbody)
    cont.innerHTML = ''
    cont.appendChild(table)

    console.log('[TX] renderTransacciones(): completado - tabla renderizada')

    // Verificar que la tabla se renderizó correctamente
    const renderedTable = cont.querySelector('.tx-table')

    if (renderedTable) {
      const renderedRows = renderedTable.querySelectorAll('tbody tr')

      console.log('[TX] Filas renderizadas en DOM:', renderedRows.length)
    } else {
      console.warn('[TX] No se encontró la tabla renderizada')
    }
  } catch (err) {
    console.error('[TX] Error en renderTransacciones:', err)
    cont.innerHTML = '<div class="error">Error: ' + (err.message || 'Error desconocido') + '</div>'
  }
}

// Hook futuro para transacciones dinámicas
async function getDynamicTransactions (_socioId) { return [] }

// Vista por socio (manuales + hook futuras dinámicas)
export async function renderSocioTransacciones (socioId, mountEl) {
  console.log('[TX] renderSocioTransacciones: inicio para socioId:', socioId)
  console.log('[TX] renderSocioTransacciones: mountEl:', mountEl)
  
  const s = getClient()
  console.log('[TX] renderSocioTransacciones: cliente Supabase:', s)
  
  const [manualRes, dyn] = await Promise.all([
    s.from('transacciones').select('*').or(`origen_socio_id.eq.${socioId},destino_socio_id.eq.${socioId}`).order('fecha', { ascending: false }).limit(200),
    getDynamicTransactions(socioId)
  ])
  
  console.log('[TX] renderSocioTransacciones: manualRes.error:', manualRes.error)
  if (manualRes.error) {
    console.error('[TX] renderSocioTransacciones: error en consulta Supabase:', manualRes.error)
  }
  
  console.log('[TX] renderSocioTransacciones: manualRes:', manualRes)
  console.log('[TX] renderSocioTransacciones: dyn:', dyn)
  
  const rows = [...(manualRes.data || []), ...(dyn || [])].sort((a, b) => (b.fecha || b.created_at || '').localeCompare(a.fecha || a.created_at || ''))
  console.log('[TX] renderSocioTransacciones: rows procesadas:', rows.length, rows)
  
  if (rows.length === 0) {
    console.log('[TX] renderSocioTransacciones: No hay transacciones para mostrar')
    mountEl.innerHTML = '<div class="empty">No hay transacciones para este socio</div>'
    return
  }
  
  const maps = await fetchLookupMaps()
  console.log('[TX] renderSocioTransacciones: maps:', maps)
  
  if (!maps || !maps.catById || !maps.socById) {
    console.error('[TX] renderSocioTransacciones: maps inválido:', maps)
    mountEl.innerHTML = '<div class="error">Error cargando datos de referencia</div>'
    return
  }
  
  const table = el('table', { class: 'table-visual' })
  const thead = el('thead')

  thead.innerHTML = '<tr><th class="tx-col-fecha">Fecha</th><th class="tx-col-concepto">Concepto</th><th class="tx-col-valor">Valor</th></tr>'
  const tbody = el('tbody')

  rows.forEach(tx => {
    console.log('[TX] renderSocioTransacciones: renderizando tx:', tx)
    try {
      const row = renderTxRow(tx, maps, { perspectiveSocioId: socioId })
      console.log('[TX] renderSocioTransacciones: row generada:', row)
      if (row && row.nodeType === Node.ELEMENT_NODE) {
        tbody.appendChild(row)
      } else {
        console.error('[TX] renderSocioTransacciones: row no es un elemento válido:', row)
      }
    } catch (err) {
      console.error('[TX] renderSocioTransacciones: error renderizando tx:', err, tx)
      // Agregar una fila de error en lugar de fallar completamente
      const errorRow = el('tr', {}, [
        el('td', { colspan: '3', class: 'error' }, ['Error renderizando transacción: ' + (err.message || 'Error desconocido')])
      ])
      tbody.appendChild(errorRow)
    }
  })
  
  table.appendChild(thead)
  table.appendChild(tbody)
  console.log('[TX] renderSocioTransacciones: table generada:', table)
  
  if (!mountEl) {
    console.error('[TX] renderSocioTransacciones: mountEl es null o undefined')
    return
  }
  
  try {
    mountEl.innerHTML = ''
    mountEl.appendChild(table)
    console.log('[TX] renderSocioTransacciones: completado')
    console.log('[TX] renderSocioTransacciones: mountEl después del append:', mountEl)
    console.log('[TX] renderSocioTransacciones: table en mountEl:', mountEl.querySelector('table'))
    console.log('[TX] renderSocioTransacciones: rows en table:', mountEl.querySelectorAll('tbody tr').length)
  } catch (err) {
    console.error('[TX] renderSocioTransacciones: error al montar tabla:', err)
    mountEl.innerHTML = '<div class="error">Error mostrando transacciones: ' + (err.message || 'Error desconocido') + '</div>'
  }
}

// Exportar funciones para uso en otros módulos
export { fetchLookupMaps, renderTxRow }

/* Form submit handling (delegated from app.js binding) */
export async function handleTransaccionFormSubmit (e) {
  e.preventDefault()
  const f = e.target

  // Recolectar campos obligatorios faltantes
  const missing = []

  if (!f.origen_categoria_id.value) missing.push('Categoría origen')
  if (!f.origen_socio_id.value) missing.push('Socio origen')
  if (!f.destino_categoria_id.value) missing.push('Categoría destino')
  if (!f.destino_socio_id.value) missing.push('Socio destino')
  if (!f.valor.value || !String(f.valor.value).trim()) missing.push('Valor')
  if (!f.fecha.value) missing.push('Fecha y hora')

  const errElId = 'transError'
  let errEl = document.getElementById(errElId)

  if (!errEl) {
    errEl = document.createElement('div')
    errEl.id = errElId
    errEl.className = 'error-list'
    f.prepend(errEl)
  }
  if (missing.length) {
    errEl.innerHTML =
      '<strong>Faltan campos obligatorios:</strong><br>' + missing.map(m => '- ' + m).join('<br>')
    return
  }
  errEl.innerHTML = ''

  // Comentario obligatorio (UI requirement)
  const comentarioInput = f.comentario
  let comentarioErr = document.getElementById('comentarioError')

  if (!comentarioErr) {
    comentarioErr = document.createElement('div')
    comentarioErr.id = 'comentarioError'
    comentarioErr.className = 'field-error'
    comentarioInput.after(comentarioErr)
  }
  const comentarioVal = String(comentarioInput.value || '')

  if (!comentarioVal.trim()) {
    comentarioErr.textContent = 'El comentario es obligatorio.'
    comentarioInput.setAttribute('aria-invalid', 'true')
    comentarioInput.classList.add('invalid')
    return
  }
  // clear comentario error if any
  comentarioErr.textContent = ''
  comentarioInput.removeAttribute('aria-invalid')
  comentarioInput.classList.remove('invalid')

  // Convertir fecha local (datetime-local asume hora en Bogotá) -> ISO UTC
  function colombiaLocalToIsoUtc (localDatetimeValue) {
    return bogotaLocalToIsoUtc(localDatetimeValue)
  }

  // Parse currency colombiana: ejemplo "1.234.567,89" -> 1234567.89
  function parseCurrencyToNumber (str) {
    if (!str) return 0
    // quitar espacios y prefijos
    let s = String(str).replace(/\s/g, '').replace(/\$/g, '')
    // eliminar puntos de miles, cambiar coma decimal por punto

    s = s.replace(/\./g, '').replace(/,/g, '.')
    const n = parseFloat(s)

    return isNaN(n) ? 0 : n
  }

  const valorNum = parseCurrencyToNumber(f.valor.value)

  if (!valorNum || valorNum <= 0) {
    errEl.innerHTML = '<strong>Error:</strong> El valor debe ser mayor que 0'
    return
  }

  const payload = {
    p_origen_categoria_id: f.origen_categoria_id.value || null,
    p_origen_socio_id: f.origen_socio_id.value || null,
    p_destino_categoria_id: f.destino_categoria_id.value || null,
    p_destino_socio_id: f.destino_socio_id.value || null,
    p_valor: valorNum,
    p_fecha: colombiaLocalToIsoUtc(f.fecha.value),
    p_comentario: f.comentario.value || null,
    p_voucher_url: null,
    p_voucher_type: null
  }

  try {
    const supabase = getClient()
    // if there's a selected voucher file attached to the form, upload to storage first
    const selectedVoucher =
      f._getSelectedVoucher && typeof f._getSelectedVoucher === 'function'
        ? f._getSelectedVoucher()
        : null

    if (selectedVoucher) {
      try {
        const path = `vouchers/${Date.now()}_${selectedVoucher.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const up = await supabase.storage
          .from('transacciones')
          .upload(path, selectedVoucher, { upsert: false })

        if (!up.error) {
          const pub = supabase.storage.from('transacciones').getPublicUrl(path)

          payload.p_voucher_url = pub?.data?.publicUrl || null
          payload.p_voucher_type = selectedVoucher.type || null
        } else {
          console.warn('No se pudo subir voucher, procediendo sin él', up.error.message)
        }
      } catch (uploadError) {
        console.warn('Error subiendo voucher', uploadError)
      }
    }

    console.log('[TX] Enviando transacción a Supabase:', payload)
    const { data, error } = await supabase.rpc('insert_transaccion_and_update_balances', payload)

    if (error) {
      console.error('[TX] Error al crear transacción:', error)
      throw error
    }

    console.log('[TX] Transacción creada exitosamente:', data)

    // Inyección optimista: construir txNuevo y agregarlo a la vista actual
    const txNuevo = {
      id: Date.now(), // temporal hasta que se confirme el ID real
      fecha: payload.p_fecha,
      valor: payload.p_valor,
      comentario: payload.p_comentario,
      origen_categoria_id: payload.p_origen_categoria_id,
      origen_socio_id: payload.p_origen_socio_id,
      destino_categoria_id: payload.p_destino_categoria_id,
      destino_socio_id: payload.p_destino_socio_id,
      voucher_url: payload.p_voucher_url,
      voucher_type: payload.p_voucher_type,
      created_at: new Date().toISOString()
    }

    // Si estamos en #transacciones, inyectar la fila nueva
    const currentView = window.location.hash

    if (currentView === '#transacciones') {
      const cont = $('#transContent')
      const table = cont?.querySelector('.tx-table')
      const tbody = table?.querySelector('tbody')

      if (tbody) {
        const maps = await fetchLookupMaps()
        const newRow = renderTxRow(txNuevo, maps, { isNew: true })

        tbody.insertBefore(newRow, tbody.firstChild)
      }

      // Forzar actualización de la vista de transacciones
      console.log('[TX] Actualizando vista de transacciones después de crear nueva transacción')
      await renderTransacciones()
    }

    closeTransaccionModal()

    alert('Transacción creada exitosamente')
  } catch (err) {
    console.error(err)
    errEl.textContent = 'No se pudo crear la transacción: ' + (err.message || String(err))
  }
}

// Listener to support opening modal after mounting the transacciones view (used by Socios FAB)
window.addEventListener('openTransaccionAfterMount', async () => {
  try {
    openTransaccionModal()
    await prepareTransaccionModal()
  } catch (_) {}
})
