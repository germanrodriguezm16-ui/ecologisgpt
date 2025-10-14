import { $, $all, el, esc } from '../utils/dom.js'
import { fmt } from '../utils/format.js'
import { contrastColor, borderOn } from '../utils/colors.js'
import { getClient } from '../services/supabase.js'
import { openConfirm, openCatModal, openCatConfig } from '../ui/modals.js'
import { openSociosList } from './socios.js'

export async function loadCategorias () {
  console.log('[CATEGORIAS] loadCategorias iniciado')
  const supabase = getClient()
  const grid = $('#socGrid')

  // Verificar que el elemento existe
  if (!grid) {
    console.error('[CATEGORIAS] Elemento #socGrid no encontrado')
    return
  }

  grid.innerHTML = '<div class="loading">Cargando categorías…</div>'

  try {
    const { data, error } = await supabase
      .from('categorias_socios')
      .select('*')
      .order('orden', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[CATEGORIAS] Error de Supabase:', error)
      grid.innerHTML = '<div class="error">' + esc(error.message) + '</div>'
      return
    }

    grid.innerHTML = ''

    if (data && data.length > 0) {
      console.log('[CATEGORIAS] Pintando', data.length, 'categorías en el DOM');
      (data || []).forEach(r => grid.appendChild(buildCatCard(r)))

      // Drag & drop categorías
      if (window.Sortable && (data || []).length) {
        window.Sortable.create(grid, {
          animation: 150,
          ghostClass: 'drag-ghost',
          onEnd: async function () {
            try {
              const items = $all('.card', grid).map((card, idx) => ({
                id: Number(card.getAttribute('data-id')),
                orden: idx + 1
              }))

              await Promise.all(
                items.map(it =>
                  supabase.from('categorias_socios').update({ orden: it.orden }).eq('id', it.id)
                )
              )
            } catch (err) {
              console.error(err)
              alert('No se pudo guardar el nuevo orden de categorías.')
            }
          }
        })
      }
    } else {
      // No hay categorías, mostrar mensaje
      grid.innerHTML =
        '<div class="card"><h3>Sin categorías</h3><p class="muted">No hay categorías de socios. Crea una nueva categoría para comenzar.</p></div>'
    }

    try {
      window.__beacon && window.__beacon('CAT:LOADED', { count: (data || []).length })
    } catch (_) {}
  } catch (err) {
    console.error('[CATEGORIAS] Error general:', err)
    grid.innerHTML = '<div class="error">Error cargando categorías: ' + esc(err.message) + '</div>'
  }
}

export function buildCatCard (row) {
  const bg = row.color || '#3ba55d'
  const txt = contrastColor(bg)
  const brd = borderOn(bg)
  const card = el(
    'div',
    { class: 'card', style: { background: bg, borderColor: brd, color: txt } },
    []
  )

  card.setAttribute('data-id', String(row.id || ''))

  const titleWrap = el('div', null, [])
  const title = el(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: '700',
        fontSize: '16px',
        paddingRight: '70px'
      }
    },
    []
  )

  title.appendChild(el('span', { class: 'color-dot', style: { background: bg } }))
  title.appendChild(el('span', null, [String(row.nombre || '—')]))
  const bal = el('div', { style: { marginTop: '8px', fontSize: '15px', fontWeight: '600' } }, [
    'Balance: $' + fmt(row.balance || 0)
  ])

  titleWrap.appendChild(title)
  titleWrap.appendChild(bal)

  const actions = el('div', { class: 'actions-column' }, [])
  const ebtn = el('button', { class: 'icon-btn icon-btn--edit', title: 'Editar', type: 'button', 'data-action': 'edit-category', 'data-id': row.id }, [])

  ebtn.innerHTML = pencil()
  const dbtn = el('button', { class: 'icon-btn icon-btn--delete', title: 'Eliminar', type: 'button', 'data-action': 'delete-category', 'data-id': row.id }, [])

  dbtn.innerHTML = trash()
  const cbtn = el(
    'button',
    { class: 'icon-btn icon-btn--config', title: 'Configuración', type: 'button' },
    []
  )

  cbtn.innerHTML = gear()

  // Los eventos se manejan por delegación en actions-delegation.js
  cbtn.addEventListener('click', ev => {
    ev.stopPropagation()
    openCatConfig(row)
  })

  actions.appendChild(ebtn)
  actions.appendChild(dbtn)
  actions.appendChild(cbtn)

  card.appendChild(titleWrap)
  card.appendChild(actions)

  card.addEventListener('click', ev => {
    if (ev.target.closest('.icon-btn')) return
    openSociosList(row.id, row.nombre)
  })
  return card
}

function pencil () {
  return '<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" stroke-width="1.5"/></svg>'
}
function trash () {
  return '<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M6 7h12M9 7V4h6v3m-8 3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
}
function gear () {
  return '<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M12 8.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm7.5 3.5a7.46 7.46 0 0 0-.12-1.3l2.02-1.58-2-3.46-2.42.98A7.52 7.52 0 0 0 14.8 4l-.3-2.6h-5l-.3 2.6a7.52 7.52 0 0 0-2.18 1.14l-2.42-.98-2 3.46 2.02 1.58c-.08.42-.12.86-.12 1.3s.04.88.12 1.3L2.18 14.2l2 3.46 2.42-.98c.66.48 1.4.87 2.18 1.14l.3 2.6h5l.3-2.6c.78-.27 1.52-.66 2.18-1.14l2.42.98 2-3.46-2.02-1.58c.08-.42.12-.86.12-1.3Z" stroke="currentColor" stroke-width="1.2"/></svg>'
}
