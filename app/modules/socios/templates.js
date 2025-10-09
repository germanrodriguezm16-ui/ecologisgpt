// app/modules/socios/templates.js
// Plantillas HTML para el módulo de Socios (categorías y socios)

import { contrastColor, mutedFor, borderOn } from '../../core/utils.js';

/* ───────────────────────────────── Topbars ───────────────────────────────── */

export function topbarCategorias(){
  return `
    <button class="btn primary" data-action="new-cat">Crear categoría</button>
  `;
}

export function topbarSocios(){
  const isList = (localStorage.getItem('sociosViewMode') === 'list');
  return `
    <button class="btn ghost" data-action="back-to-cats">← Volver</button>
    <button class="btn ${isList ? 'warn' : ''}" data-action="list-view">Lista</button>
    <button class="btn ${!isList ? 'warn' : ''}" data-action="cards-view">Tarjetas</button>
    <button class="btn primary" data-action="new-socio">Crear socio</button>
  `;
}

/* ─────────────────────────────── Categorías ─────────────────────────────── */

export function categoriaCard(row){
  const bg = row.color || '#3ba55d';
  const txt = contrastColor(bg);
  const muted = mutedFor(bg);
  const brd = borderOn(bg);
  return `
    <div class="card" data-id="${row.id}" style="background:${bg};border-color:${brd};color:${txt}">
      <div class="row">
        <div>
          <div style="display:flex;align-items:center;gap:8px;font-weight:700">
            <span class="color-dot" style="background:${bg}"></span>
            <span>${escapeHtml(row.nombre || '—')}</span>
          </div>
          <div class="muted" style="margin-top:6px;color:${muted}">
            Balance: $${fmt(row.balance || 0)}
          </div>
        </div>
        <div class="actions">
          <button type="button" class="icon-btn edit" title="Editar"
                  data-action="edit-cat" data-id="${row.id}">✏️</button>
          <button type="button" class="icon-btn delete" title="Eliminar"
                  data-action="delete-cat" data-id="${row.id}">🗑️</button>
        </div>
      </div>
    </div>
  `;
}

/* ──────────────────────────────── Socios ───────────────────────────────── */

export function socioCard(row){
  const col = row.card_color || '#121a26';
  const txt = contrastColor(col);
  const brd = borderOn(col);
  const muted = mutedFor(col);

  const avatar = row.avatar_url
    ? `<img class="avatar" src="${escapeHtml(row.avatar_url)}" alt="">`
    : `<div class="avatar" style="display:grid;place-items:center;color:${muted};font-weight:700">
         ${initials(row.empresa)}
       </div>`;

  return `
    <div class="card" data-id="${row.id}" style="background:${col};border-color:${brd};color:${txt}">
      <div class="row">
        <div class="row-flex">
          ${avatar}
          <div>
            <div style="font-weight:700">${escapeHtml(row.empresa || '—')}</div>
            <div class="muted" style="color:${muted}">${escapeHtml(row.titular || '—')}</div>
          </div>
        </div>
        <div class="actions">
          <button type="button" class="icon-btn edit" title="Editar"
                  data-action="edit-socio" data-id="${row.id}">✏️</button>
          <button type="button" class="icon-btn delete" title="Eliminar"
                  data-action="delete-socio" data-id="${row.id}">🗑️</button>
        </div>
      </div>
      <div class="muted" style="margin-top:8px;color:${muted}">
        ${escapeHtml(row.telefono || '—')}
        ${row.direccion ? ` · ${escapeHtml(row.direccion)}` : ''}
      </div>
    </div>
  `;
}

/* ───────────────────────────── Vista de Lista ───────────────────────────── */

export function sociosListTable(rows){
  const header = `
    <table class="list">
      <thead>
        <tr>
          <th></th>
          <th>Empresa</th>
          <th>Titular</th>
          <th>Teléfono</th>
          <th>Dirección</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(socioListRow).join('')}
      </tbody>
    </table>
  `;
  return header;
}

function socioListRow(r){
  const muted = 'var(--muted)';
  const avatar = r.avatar_url
    ? `<img class="avatar" src="${escapeHtml(r.avatar_url)}" alt="">`
    : `<div class="avatar" style="display:grid;place-items:center;color:${muted};font-weight:700">
         ${initials(r.empresa)}
       </div>`;
  return `
    <tr data-id="${r.id}">
      <td>${avatar}</td>
      <td><div class="row-flex"><span>${escapeHtml(r.empresa || '—')}</span></div></td>
      <td>${escapeHtml(r.titular || '—')}</td>
      <td>${escapeHtml(r.telefono || '—')}</td>
      <td>${escapeHtml(r.direccion || '—')}</td>
      <td>
        <div class="mini-actions">
          <button type="button" class="icon-btn edit" title="Editar"
                  data-action="edit-socio" data-id="${r.id}">✏️</button>
          <button type="button" class="icon-btn delete" title="Eliminar"
                  data-action="delete-socio" data-id="${r.id}">🗑️</button>
        </div>
      </td>
    </tr>
  `;
}

/* ────────────────────────────── Helpers locales ─────────────────────────── */

function fmt(n){
  return Number(n).toLocaleString('es-CO', { maximumFractionDigits: 2 });
}

function escapeHtml(s){
  return String(s || '').replace(/[&<>"']/g, (m) => (
    { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]
  ));
}

function initials(txt){
  txt = String(txt || '');
  const p = txt.trim().split(/\s+/);
  return (p.slice(0,2).map(x => x[0] || '').join('').toUpperCase()) || 'SO';
}
