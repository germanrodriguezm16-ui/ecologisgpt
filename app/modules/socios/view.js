import { router } from '../../core/router.js';
import * as act from './actions.js';
import * as tpl from './templates.js';

let root, topActionsEl, contentEl;
let currentCatId = null;
let viewMode = localStorage.getItem('sociosViewMode') || 'cards';
let onClick, onSubmitCat, onSubmitSocio;

export async function mount(container){
  root = container;
  root.innerHTML = `
    <div class="topbar">
      <div class="title" id="soc-title">Socios</div>
      <div id="soc-actions" class="actions-inline"></div>
    </div>
    <div id="soc-content"></div>
  `;
  topActionsEl = root.querySelector('#soc-actions');
  contentEl = root.querySelector('#soc-content');

  onClick = async (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    e.preventDefault();
    if (el.tagName === 'BUTTON' && el.type !== 'button') el.type = 'button';
    const { action, id } = el.dataset;
    switch(action){
      case 'new-cat': return openCatModal('create');
      case 'edit-cat': return openCatModal('edit', id);
      case 'delete-cat': return deleteCat(id);
      case 'back-to-cats': currentCatId = null; return renderCategorias();
      case 'new-socio': return openSocioModal('create');
      case 'edit-socio': return openSocioModal('edit', id);
      case 'delete-socio': return deleteSocio(id);
      case 'list-view': viewMode = 'list'; localStorage.setItem('sociosViewMode','list'); return renderSocios();
      case 'cards-view': viewMode = 'cards'; localStorage.setItem('sociosViewMode','cards'); return renderSocios();
    }
  };
  root.addEventListener('click', onClick);

  const modalCat = document.getElementById('modalCat');
  const formCat = document.getElementById('formCat');
  if (modalCat && formCat){
    onSubmitCat = async (ev) => {
      ev.preventDefault();
      const f = ev.target;
      const payload = {
        id: f.dataset.id ? Number(f.dataset.id) : undefined,
        nombre: f.nombre.value.trim(),
        color: f.color.value || '#3ba55d',
        balance: Number(f.balance.value || '0')
      };
      if (!payload.nombre) return alert('Nombre obligatorio');
      const { error } = await act.upsertCategoria(payload);
      if (error) return alert(error.message);
      modalCat.style.display = 'none';
      await renderCategorias();
    };
    formCat.addEventListener('submit', onSubmitCat);
    const btnCancelCat = document.getElementById('btnCancelCat');
    if (btnCancelCat) btnCancelCat.addEventListener('click', () => { modalCat.style.display='none'; });
  }

  const modalSoc = document.getElementById('modalSocio');
  const formSoc = document.getElementById('formSocio');
  if (modalSoc && formSoc){
    onSubmitSocio = async (ev) => {
      ev.preventDefault();
      const f = ev.target;
      const data = new FormData(f);
      const payload = {
        id: f.dataset.id ? Number(f.dataset.id) : undefined,
        categoria_id: currentCatId,
        empresa: (data.get('empresa')||'').toString().trim(),
        titular: (data.get('titular')||'').toString().trim(),
        telefono: (data.get('telefono')||'').toString().trim() || null,
        direccion: (data.get('direccion')||'').toString().trim() || null,
        balance: data.get('balance') ? Number(data.get('balance')) : null,
        card_color: data.get('card_color') || null
      };
      if (!payload.empresa || !payload.titular) return alert('Empresa y Titular son obligatorios');

      let newId = payload.id;
      if (payload.id) {
        const { error } = await act.upsertSocio(payload);
        if (error) return alert(error.message);
      } else {
        const ins = await act.upsertSocio(payload);
        if (ins.error) return alert(ins.error.message);
        newId = ins.data?.id;
      }

      const file = f.avatar?.files?.[0];
      if (file && newId){
        if (file.size > 2*1024*1024) return alert('El archivo supera 2 MB');
        const up = await act.uploadAvatar(file, newId);
        if (up.error) alert('Error subiendo imagen: ' + up.error.message);
      }

      modalSoc.style.display = 'none';
      await renderSocios();
    };
    formSoc.addEventListener('submit', onSubmitSocio);
    const btnCancelSoc = document.getElementById('btnCancelSocio');
    if (btnCancelSoc) btnCancelSoc.addEventListener('click', () => { modalSoc.style.display='none'; });
  }

  await renderCategorias();
}

export function unmount(){
  if (root && onClick) root.removeEventListener('click', onClick);
  const formCat = document.getElementById('formCat');
  if (formCat && onSubmitCat) formCat.removeEventListener('submit', onSubmitCat);
  const formSoc = document.getElementById('formSocio');
  if (formSoc && onSubmitSocio) formSoc.removeEventListener('submit', onSubmitSocio);
  root = topActionsEl = contentEl = null;
  currentCatId = null;
  onClick = onSubmitCat = onSubmitSocio = null;
}

export async function update(ctx){
  const parts = ctx.parts || [];
  if (parts[0] !== 'socios') return;
  const catId = parts[1] ? Number(parts[1]) : null;
  if (catId !== currentCatId){
    currentCatId = catId;
    if (currentCatId) await renderSocios();
    else await renderCategorias();
  }
}

async function renderCategorias(){
  root.querySelector('#soc-title').textContent = 'Socios';
  topActionsEl.innerHTML = tpl.topbarCategorias();

  const box = contentEl;
  box.innerHTML = '<div class="loading">Cargando categorías…</div>';
  const { data, error } = await act.listCategorias();
  if (error) { box.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`; return; }
  if (!data.length){ box.innerHTML = '<div class="empty">No hay categorías aún.</div>'; return; }

  const grid = document.createElement('div');
  grid.className = 'grid';
  grid.innerHTML = data.map(tpl.categoriaCard).join('');
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.card[data-id]');
    if (!card) return;
    const id = Number(card.dataset.id);
    if (e.target.closest('[data-action]')) return;
    location.hash = `#/socios/${id}`;
  });
  box.innerHTML = '';
  box.appendChild(grid);
}

async function renderSocios(){
  if (!currentCatId){ return renderCategorias(); }
  root.querySelector('#soc-title').textContent = 'Socios · Categoría';
  topActionsEl.innerHTML = tpl.topbarSocios();

  const box = contentEl;
  box.innerHTML = '<div class="loading">Cargando socios…</div>';
  const { data, error } = await act.listSociosByCategoria(currentCatId);
  if (error) { box.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`; return; }

  if (!data.length){ box.innerHTML = '<div class="empty">No hay socios en esta categoría.</div>'; return; }

  if (viewMode === 'list'){
    box.innerHTML = tpl.sociosListTable(data);
  } else {
    const grid = document.createElement('div');
    grid.className = 'grid';
    grid.innerHTML = data.map(tpl.socioCard).join('');
    box.innerHTML = '';
    box.appendChild(grid);
  }
}

function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
