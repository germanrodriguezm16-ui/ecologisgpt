import { $, $all, el, esc } from '../utils/dom.js';
import { fmt } from '../utils/format.js';
import { contrastColor, borderOn, initials, mutedFor } from '../utils/colors.js';
import { getClient, getCategoriaById } from '../services/supabase.js';
import { openConfirm, openSocioModal } from '../ui/modals.js';

let currentCat = null,
    currentCatName = '',
    currentCatTab2 = 'Notas',
    currentCatTab3 = 'Archivos';
let prefView = localStorage.getItem('sociosViewMode') || 'cards';

export function openSociosList(catId, catName) {
  currentCat = catId;
  currentCatName = catName || 'Socios';
  $('#title').textContent = 'Socios · ' + currentCatName;
  $('#view').innerHTML = '';

  const labelBtn =
    String(currentCatName).toLowerCase() === 'proveedores'
      ? 'Crear proveedor'
      : 'Crear socio';

  $('#topActions').innerHTML =
    '<button class="btn ghost" id="btnBack" type="button">← Volver</button>' +
    '<div class="actions-inline">' +
    ' <button class="btn ' +
    (prefView === 'list' ? 'warn' : '') +
    '" id="btnList" type="button">Lista</button>' +
    ' <button class="btn ' +
    (prefView === 'cards' ? 'warn' : '') +
    '" id="btnCards" type="button">Tarjetas</button>' +
    ' <button class="btn primary" id="btnNewSocio" type="button">' +
    esc(labelBtn) +
    '</button>' +
    '</div>';

  // ✅ FIX: botón "Volver" correctamente enlazado
  $('#btnBack').addEventListener('click', () => {
    window.location.hash = '#socios';
  });

  $('#btnList').addEventListener('click', () => {
    prefView = 'list';
    localStorage.setItem('sociosViewMode', 'list');
    renderSocios();
    $('#btnList').classList.add('warn');
    $('#btnCards').classList.remove('warn');
  });

  $('#btnCards').addEventListener('click', () => {
    prefView = 'cards';
    localStorage.setItem('sociosViewMode', 'cards');
    renderSocios();
    $('#btnCards').classList.add('warn');
    $('#btnList').classList.remove('warn');
  });

  $('#btnNewSocio').addEventListener('click', () =>
    openSocioModal(null, currentCatName)
  );

  $('#view').appendChild(el('div', { id: 'socContent' }, ['Cargando…']));

  getCategoriaById(currentCat)
    .then((cat) => {
      currentCatTab2 = cat?.tab2_name || 'Notas';
      currentCatTab3 = cat?.tab3_name || 'Archivos';
    })
    .finally(renderSocios);
}

function fetchSociosQuery() {
  const supabase = getClient();
  return supabase
    .from('socios')
    .select('*')
    .eq('categoria_id', currentCat)
    .order('orden', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: false });
}

async function fetchSocios() {
  const { data, error } = await fetchSociosQuery();
  if (error) {
    return { rows: [], error: error };
  }
  return { rows: data || [], error: null };
}

export async function renderSocios() {
  const cont = $('#socContent');
  cont.innerHTML = 'Cargando…';
  const r = await fetchSocios();
  if (r.error) {
    cont.innerHTML = '<div class="error">' + esc(r.error.message) + '</div>';
    return;
  }
  const rows = r.rows;
  if (!rows.length) {
    cont.innerHTML = '<div class="empty">No hay socios en esta categoría.</div>';
    return;
  }

  cont.innerHTML = '';
  if (prefView === 'list') {
    cont.appendChild(buildSociosTable(rows));
  } else {
    cont.appendChild(buildSociosCards(rows));
  }

  if (prefView === 'cards' && window.Sortable) {
    const grid = $('#socContent .grid');
    if (grid) {
      window.Sortable.create(grid, {
        animation: 150,
        onEnd: async function () {
          try {
            const supabase = getClient();
            const items = $all('.card', grid).map((card, idx) => ({
              id: Number(card.getAttribute('data-id')),
              orden: idx + 1,
            }));
            await Promise.all(
              items.map((it) =>
                supabase.from('socios').update({ orden: it.orden }).eq('id', it.id)
              )
            );
          } catch (err) {
            console.error(err);
            alert('No se pudo guardar el nuevo orden de socios.');
          }
        },
      });
    }
  }
}
function buildSociosCards(rows) {
  const grid = el('div', { class: 'grid' });
  rows.forEach((r) => {
    const bg = r.card_color || '#121a26';
    const txt = contrastColor(bg);
    const muted = mutedFor(bg);
    const brd = borderOn(bg);

    const c = el('div', {
      class: 'card',
      style: { background: bg, color: txt, borderColor: brd },
    });
    c.setAttribute('data-id', r.id);

    // Header (empresa + titular)
    const header = el('div', { class: 'row' });
    const left = el('div', { class: 'row-flex' });

    const avatar = r.avatar_url
      ? el('img', { class: 'avatar', src: r.avatar_url })
      : el('div', {
          class: 'avatar',
          style: {
            display: 'grid',
            placeItems: 'center',
            color: muted,
            fontWeight: '700',
          },
        }, [initials(r.empresa)]);

    left.appendChild(avatar);

    const titleWrap = el('div');
    const h = el('div', { style: { fontWeight: '700' } }, [r.empresa || '—']);
    const sub = el('div', { class: 'muted' }, [r.titular || '—']);
    titleWrap.appendChild(h);
    titleWrap.appendChild(sub);
    left.appendChild(titleWrap);

    const actions = el('div', { class: 'actions-column' });
    const ebtn = el('button', { class: 'icon-btn edit', title: 'Editar' });
    ebtn.innerHTML = pencil();
    const dbtn = el('button', { class: 'icon-btn delete', title: 'Eliminar' });
    dbtn.innerHTML = trash();
    actions.appendChild(ebtn);
    actions.appendChild(dbtn);

    header.appendChild(left);
    header.appendChild(actions);
    c.appendChild(header);

    // ✅ NUEVO: Balance grande visible
    const balance = el('div', {
      style: {
        marginTop: '10px',
        fontSize: '16px',
        fontWeight: '600',
        color: txt,
      },
    }, ['Balance: $' + fmt(r.balance || 0)]);
    c.appendChild(balance);

    grid.appendChild(c);
  });

  // Bind acciones
  $all('.icon-btn.edit', grid).forEach((b) =>
    b.addEventListener('click', () => {
      const id = Number(b.closest('.card').dataset.id);
      openSocioModal(
        rows.find((x) => Number(x.id) === id),
        currentCatName
      );
    })
  );
  $all('.icon-btn.delete', grid).forEach((b) =>
    b.addEventListener('click', async () => {
      const id = Number(b.closest('.card').dataset.id);
      const ok = await openConfirm('¿Eliminar este socio?');
      if (!ok) return;
      const supabase = getClient();
      const { error } = await supabase.from('socios').delete().eq('id', id);
      if (error) alert(error.message);
      else renderSocios();
    })
  );

  return grid;
}

// ✅ Vista LISTA con balance incluido
function buildSociosTable(rows) {
  const table = el('table', { class: 'list' });
  const thead = el('thead');
  const trh = el('tr');
  ['Empresa', 'Titular', 'Teléfono', 'Dirección', 'Balance', ''].forEach((h) => {
    const th = el('th', {}, [h]);
    trh.appendChild(th);
  });
  thead.appendChild(trh);
  table.appendChild(thead);

  const tbody = el('tbody');
  rows.forEach((r) => {
    const tr = el('tr');
    const td1 = el('td', {}, [r.empresa || '—']);
    const td2 = el('td', {}, [r.titular || '—']);
    const td3 = el('td', {}, [r.telefono || '—']);
    const td4 = el('td', {}, [r.direccion || '—']);
    const td5 = el('td', {}, ['$' + fmt(r.balance || 0)]);

    const td6 = el('td');
    const miniActions = el('div', { class: 'mini-actions' });
    const ebtn = el('button', { class: 'icon-btn edit', title: 'Editar' });
    ebtn.innerHTML = pencil();
    const dbtn = el('button', { class: 'icon-btn delete', title: 'Eliminar' });
    dbtn.innerHTML = trash();
    miniActions.appendChild(ebtn);
    miniActions.appendChild(dbtn);
    td6.appendChild(miniActions);

    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    tr.appendChild(td4);
    tr.appendChild(td5);
    tr.appendChild(td6);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  // Eventos
  $all('.icon-btn.edit', table).forEach((b) =>
    b.addEventListener('click', () => {
      const id = Number(b.closest('tr').dataset?.id || 0);
      openSocioModal(
        rows.find((x) => Number(x.id) === id),
        currentCatName
      );
    })
  );
  $all('.icon-btn.delete', table).forEach((b) =>
    b.addEventListener('click', async () => {
      const id = Number(b.closest('tr').dataset?.id || 0);
      const ok = await openConfirm('¿Eliminar este socio?');
      if (!ok) return;
      const supabase = getClient();
      const { error } = await supabase.from('socios').delete().eq('id', id);
      if (error) alert(error.message);
      else renderSocios();
    })
  );

  return table;
}

// Iconos SVG
function pencil() {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
     stroke="currentColor" stroke-width="1.5"/></svg>`;
}

function trash() {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none">
    <path d="M6 7h12M9 7V4h6v3m-8 3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V10"
     stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
}
