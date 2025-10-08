import { esc, fmtMoney, contrastColor, mutedFor, borderOn } from '../../core/utils.js';

export function iconPencil(){ return '<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" stroke-width="1.5"/></svg>'; }
export function iconTrash(){ return '<svg class="icon" viewBox="0 0 24 24" fill="none"><path d="M6 7h12M9 7V4h6v3m-8 3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'; }

export function catCard(cat){
  const bg = cat.color || '#3ba55d', txt=contrastColor(bg), muted=mutedFor(bg), brd=borderOn(bg);
  const div = document.createElement('div');
  div.className='card';
  div.style.background = bg;
  div.style.color = txt;
  div.style.borderColor = brd;
  div.dataset.id = cat.id;
  div.innerHTML = `
    <div class="row">
      <div>
        <div style="display:flex;align-items:center;gap:8px;font-weight:700">
          <span style="width:12px;height:12px;border-radius:999px;background:${bg};display:inline-block;border:1px solid #0005"></span>
          <span>${esc(cat.nombre || '—')}</span>
        </div>
        <div class="muted" style="margin-top:6px;color:${muted}">Balance: ${fmtMoney(cat.balance||0)}</div>
      </div>
      <div class="mini-actions">
        <button class="icon-btn edit" title="Editar">${iconPencil()}</button>
        <button class="icon-btn delete" title="Eliminar">${iconTrash()}</button>
      </div>
    </div>`;
  return div;
}

export function socioCard(r){
  const bg = r.card_color || '#18213a';
  const txt = contrastColor(bg), brd = borderOn(bg), sub = mutedFor(bg);
  const c = document.createElement('div');
  c.className='card';
  c.style.background=bg; c.style.color=txt; c.style.borderColor=brd;
  c.dataset.id = r.id;
  const initials = (txt) => { const p=String(txt||'').trim().split(/\s+/); return (p[0]?.[0]||'S') + (p[1]?.[0]||''); };
  c.innerHTML = `
    <div class="row">
      <div style="display:flex;align-items:center;gap:10px">
        ${r.avatar_url ? `<img class="avatar" src="${esc(r.avatar_url)}" />` : `<div class="avatar" style="display:grid;place-items:center;font-weight:700;color:${sub}">${initials(r.empresa)}</div>`}
        <div>
          <div style="font-weight:700">${esc(r.empresa||'—')}</div>
          <div class="muted" style="color:${sub}">${esc(r.titular||'—')}</div>
        </div>
      </div>
      <div class="mini-actions">
        <button class="icon-btn edit" title="Editar">${iconPencil()}</button>
        <button class="icon-btn delete" title="Eliminar">${iconTrash()}</button>
      </div>
    </div>
    <div class="balance-big">${fmtMoney(r.balance||0)}</div>
    <div class="muted" style="margin-top:6px;color:${sub}">${esc(r.telefono||'—')}${r.direccion?(' · '+esc(r.direccion)) : ''}</div>
  `;
  return c;
}

export function sociosTable(rows){
  const table = document.createElement('table'); table.className='list';
  const thead = document.createElement('thead');
  thead.innerHTML = `<tr><th>Orden</th><th>Empresa</th><th>Titular</th><th>Teléfono</th><th>Dirección</th><th>Balance</th><th></th></tr>`;
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  rows.forEach(r => {
    const tr = document.createElement('tr'); tr.dataset.id = r.id;
    const initials = (txt) => { const p=String(txt||'').trim().split(/\s+/); return (p[0]?.[0]||'S') + (p[1]?.[0]||''); };
    tr.innerHTML = `
      <td>${r.orden ?? '—'}</td>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          ${r.avatar_url ? `<img class="avatar" src="${esc(r.avatar_url)}" />` : `<div class="avatar" style="display:grid;place-items:center;font-weight:700;color:var(--muted)">${initials(r.empresa)}</div>`}
          <div><div style="font-weight:700">${esc(r.empresa||'—')}</div><div class="muted">${r.card_color ? 'Color: '+esc(r.card_color) : '—'}</div></div>
        </div>
      </td>
      <td>${esc(r.titular||'—')}</td>
      <td>${esc(r.telefono||'—')}</td>
      <td>${esc(r.direccion||'—')}</td>
      <td>${fmtMoney(r.balance||0)}</td>
      <td>
        <div class="mini-actions">
          <button class="icon-btn edit" title="Editar">${iconPencil()}</button>
          <button class="icon-btn delete" title="Eliminar">${iconTrash()}</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  return table;
}
