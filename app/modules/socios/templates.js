// app/modules/socios/templates.js

export function topbarCategorias() {
  return /*html*/`
    <div class="actions-inline">
      <button type="button" class="btn primary" data-action="new-cat">Crear categoría</button>
    </div>
  `;
}

export function categoriaCard(c) {
  return /*html*/`
    <div class="card" data-id="${c.id}" style="background:${c.color||'#121a26'};border-color:rgba(255,255,255,.1)">
      <div class="row">
        <div>
          <div style="font-weight:700">${escapeHtml(c.nombre||'—')}</div>
          <div class="muted" style="margin-top:6px">Balance: $${fmt(c.balance||0)}</div>
        </div>
        <div class="actions">
          <button type="button" class="icon-btn edit" data-action="edit-cat" data-id="${c.id}" title="Editar">✎</button>
          <button type="button" class="icon-btn delete" data-action="delete-cat" data-id="${c.id}" title="Eliminar">🗑</button>
        </div>
      </div>
    </div>
  `;
}

export function topbarSocios() {
  return /*html*/`
    <button type="button" class="btn ghost" data-action="back-to-cats">← Volver a categorías</button>
    <div class="actions-inline">
      <button type="button" class="btn" data-action="list-view">Lista</button>
      <button type="button" class="btn warn" data-action="cards-view">Tarjetas</button>
      <button type="button" class="btn primary" data-action="new-socio">Crear socio</button>
    </div>
  `;
}

export function socioCard(s) {
  const initials = (txt) => String(txt||'').trim().split(/\s+/).slice(0,2).map(p => p[0]||'').join('').toUpperCase() || 'SO';
  return /*html*/`
    <div class="card" data-id="${s.id}">
      <div class="row">
        <div class="row-flex">
          ${s.avatar_url ? `<img class="avatar" src="${escapeAttr(s.avatar_url)}" alt="">`
                         : `<div class="avatar" style="display:grid;place-items:center;color:var(--muted);font-weight:700">${initials(s.empresa)}</div>`}
          <div>
            <div style="font-weight:700">${escapeHtml(s.empresa||'—')}</div>
            <div class="muted">${escapeHtml(s.titular||'—')}</div>
          </div>
        </div>
        <div class="actions">
          <button type="button" class="icon-btn edit" data-action="edit-socio" data-id="${s.id}" title="Editar">✎</button>
          <button type="button" class="icon-btn delete" data-action="delete-socio" data-id="${s.id}" title="Eliminar">🗑</button>
        </div>
      </div>
      <div class="muted" style="margin-top:8px">
        ${escapeHtml(s.telefono||'—')}${s.direccion ? ' · ' + escapeHtml(s.direccion) : ''}
      </div>
    </div>
  `;
}

export function sociosListTable(rows){
  return /*html*/`
    <table class="list">
      <thead><tr>
        <th></th><th>Empresa</th><th>Titular</th><th>Teléfono</th><th>Dirección</th><th></th>
      </tr></thead>
      <tbody>
        ${rows.map(r => /*html*/`
          <tr data-id="${r.id}">
            <td>${r.avatar_url ? `<img class="avatar" src="${escapeAttr(r.avatar_url)}" alt="">`
                                : `<div class="avatar" style="display:grid;place-items:center;color:var(--muted);font-weight:700">${(r.empresa||'SO').slice(0,2).toUpperCase()}</div>`}
            </td>
            <td>${escapeHtml(r.empresa||'—')}</td>
            <td>${escapeHtml(r.titular||'—')}</td>
            <td>${escapeHtml(r.telefono||'—')}</td>
            <td>${escapeHtml(r.direccion||'—')}</td>
            <td class="mini-actions">
              <button type="button" class="icon-btn edit" data-action="edit-socio" data-id="${r.id}" title="Editar">✎</button>
              <button type="button" class="icon-btn delete" data-action="delete-socio" data-id="${r.id}" title="Eliminar">🗑</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// helpers
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function escapeAttr(s){ return escapeHtml(s); }
function fmt(n){ return Number(n).toLocaleString('es-CO',{maximumFractionDigits:2}); }
