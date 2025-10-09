import { $, debug } from '../utils/dom.js';

let confirmCb = null;

export function openConfirm(msg, onOk, title){
  $('#confirmTitle').textContent = title || 'Confirmar acción';
  $('#confirmMsg').textContent = msg || '¿Seguro que deseas continuar?';
  confirmCb = (typeof onOk==='function') ? onOk : null;
  $('#modalConfirm').style.display='flex';
}
export function bindConfirm(){
  $('#btnCancelConfirm').addEventListener('click', ()=>{ $('#modalConfirm').style.display='none'; confirmCb=null; });
  $('#btnOkConfirm').addEventListener('click', ()=>{
    const cb=confirmCb; confirmCb=null; $('#modalConfirm').style.display='none';
    if(cb) cb();
  });
}

/* Categoría modal */
let catEditId = null;
export function openCatModal(mode, row){
  catEditId = (mode==='edit' && row && row.id) ? row.id : null;
  $('#modalTitle').textContent = catEditId? 'Editar categoría' : 'Nueva categoría';
  const f = $('#formCat');
  f.nombre.value = row?.nombre || '';
  f.color.value  = row?.color  || '#3ba55d';
  f.balance.value = row?.balance ?? 0;
  $('#modalCat').style.display='flex';
}
export function closeCatModal(){ $('#modalCat').style.display='none'; catEditId=null; }
export function getCatEditId(){ return catEditId; }

/* Config modal */
let catCfgId = null;
export function openCatConfig(row){
  catCfgId = row.id;
  $('#modalConfigTitle').textContent = 'Config: ' + (row.nombre||'Categoría');
  const f = $('#formCatConfig');
  f.tab2_name.value = row.tab2_name || 'Notas';
  f.tab3_name.value = row.tab3_name || 'Archivos';
  $('#modalCatConfig').style.display='flex';
}
export function closeCatConfig(){ $('#modalCatConfig').style.display='none'; catCfgId=null; }
export function getCatCfgId(){ return catCfgId; }

/* Socio modal */
let socioEditId = null;
export function openSocioModal(socio, currentCatName){
  socioEditId = (socio && socio.id) ? socio.id : null;
  $('#modalSocioTitle').textContent = socioEditId ? 'Editar socio' : (String(currentCatName||'').toLowerCase()==='proveedores'?'Editar proveedor':'Nuevo socio').replace('Editar','Nuevo');
  const f = $('#formSocio');
  f.empresa.value = socio?.empresa || '';
  f.titular.value = socio?.titular || '';
  f.telefono.value = socio?.telefono || '';
  f.direccion.value = socio?.direccion || '';
  f.card_color.value = socio?.card_color || '#121a26';
  f.avatar.value = '';
  $('#modalSocio').style.display='flex';
}
export function closeSocioModal(){ $('#modalSocio').style.display='none'; socioEditId=null; }
export function getSocioEditId(){ return socioEditId; }

export function bindModalCloseButtons(){
  $('#btnCancelCat')?.addEventListener('click', closeCatModal);
  $('#btnCancelCatCfg')?.addEventListener('click', closeCatConfig);
  $('#btnCancelSocio')?.addEventListener('click', closeSocioModal);
}
