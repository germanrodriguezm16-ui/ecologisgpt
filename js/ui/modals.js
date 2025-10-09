import { $, $all } from '../utils/dom.js';
import { listCategorias, listSociosByCategoria, insertTransaccion, uploadVoucher, updateTransaccion } from '../services/supabase.js';
import { fmt } from '../utils/format.js';

/* ========= Confirm genérico ========= */
let confirmCb = null;
export function openConfirm(msg, onOk, title){
  $('#confirmTitle').textContent = title || 'Confirmar acción';
  $('#confirmMsg').textContent = msg || '¿Seguro que deseas continuar?';
  confirmCb = (typeof onOk==='function') ? onOk : null;
  $('#modalConfirm').style.display='flex';
}
export function bindConfirm(){
  $('#btnCancelConfirm').addEventListener('click', ()=>{ $('#modalConfirm').style.display='none'; confirmCb=null; });
  $('#btnOkConfirm').addEventListener('click', ()=>{ const cb=confirmCb; confirmCb=null; $('#modalConfirm').style.display='none'; if(cb) cb(); });
}

/* ========= Cat modal ========= */
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

/* ========= Config categoría ========= */
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

/* ========= Socio modal ========= */
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

/* ========= Transacción modal ========= */
let txEditId = null; // para futuro editar
let localVoucherObjectURL = null;

export async function openTxModal(preset=null){
  txEditId = null;
  const f = $('#formTx');
  // Limpia
  f.reset();
  f.ori_cat.innerHTML = '<option value="">Cargando…</option>';
  f.ori_socio.innerHTML = '<option value="">Seleccione categoría</option>';
  f.des_cat.innerHTML = '<option value="">Cargando…</option>';
  f.des_socio.innerHTML = '<option value="">Seleccione categoría</option>';
  $('#btnViewVoucher').disabled = true;
  $('#btnClearVoucher').disabled = true;
  clearLocalVoucherPreview();

  // Carga categorías
  const cats = await listCategorias();
  f.ori_cat.innerHTML = '<option value="">Seleccione</option>' + cats.map(c=>`<option value="${c.id}">${c.nombre}</option>`).join('');
  f.des_cat.innerHTML = '<option value="">Seleccione</option>' + cats.map(c=>`<option value="${c.id}">${c.nombre}</option>`).join('');

  // Listeners dependientes
  f.ori_cat.onchange = async ()=>{
    f.ori_socio.innerHTML = '<option value="">Cargando…</option>';
    if(!f.ori_cat.value){ f.ori_socio.innerHTML = '<option value="">Seleccione categoría</option>'; return; }
    const socios = await listSociosByCategoria(Number(f.ori_cat.value));
    f.ori_socio.innerHTML = '<option value="">Seleccione socio</option>' + socios.map(s=>`<option value="${s.id}">${s.empresa}</option>`).join('');
  };
  f.des_cat.onchange = async ()=>{
    f.des_socio.innerHTML = '<option value="">Cargando…</option>';
    if(!f.des_cat.value){ f.des_socio.innerHTML = '<option value="">Seleccione categoría</option>'; return; }
    const socios = await listSociosByCategoria(Number(f.des_cat.value));
    f.des_socio.innerHTML = '<option value="">Seleccione socio</option>' + socios.map(s=>`<option value="${s.id}">${s.empresa}</option>`).join('');
  };

  // Máscara de valor (pesos con miles)
  f.valor.addEventListener('input', ()=>{
    const raw = f.valor.value.replace(/[^\d]/g,'');
    if(!raw){ f.valor.value=''; return; }
    const n = Number(raw);
    f.valor.value = '$ ' + n.toLocaleString('es-CO');
  }, {once:true});
  f.valor.addEventListener('input', ()=>{
    const raw = f.valor.value.replace(/[^\d]/g,'');
    const n = raw? Number(raw): 0;
    f.valor.value = n ? ('$ ' + n.toLocaleString('es-CO')) : '';
  });

  // Voucher ver/quitar
  f.voucher.onchange = ()=>{
    const file = f.voucher.files?.[0];
    const has = !!file;
    $('#btnViewVoucher').disabled = !has;
    $('#btnClearVoucher').disabled = !has;
    if (localVoucherObjectURL){ URL.revokeObjectURL(localVoucherObjectURL); localVoucherObjectURL=null; }
    if (has){ localVoucherObjectURL = URL.createObjectURL(file); }
  };
  $('#btnViewVoucher').onclick = ()=>{ if(localVoucherObjectURL) window.open(localVoucherObjectURL, '_blank'); };
  $('#btnClearVoucher').onclick = ()=>{
    f.voucher.value = '';
    if (localVoucherObjectURL){ URL.revokeObjectURL(localVoucherObjectURL); localVoucherObjectURL=null; }
    $('#btnViewVoucher').disabled = true;
    $('#btnClearVoucher').disabled = true;
  };

  // Fecha por defecto hoy
  if (!f.fecha.value){
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth()+1).padStart(2,'0');
    const dd = String(today.getDate()).padStart(2,'0');
    f.fecha.value = `${yyyy}-${mm}-${dd}`;
  }

  $('#modalTx').style.display='flex';
}
export function closeTxModal(){ $('#modalTx').style.display='none'; txEditId=null; clearLocalVoucherPreview(); }
function clearLocalVoucherPreview(){ if(localVoucherObjectURL){ URL.revokeObjectURL(localVoucherObjectURL); localVoucherObjectURL=null; } }

export async function handleTxFormSubmit(e){
  e.preventDefault();
  const f = $('#formTx');

  // Validación mínima
  if(!f.ori_cat.value || !f.ori_socio.value || !f.des_cat.value || !f.des_socio.value || !f.valor.value || !f.fecha.value || !f.comentarios.value){
    alert('Completa todos los campos obligatorios.'); return;
  }

  const valorRaw = Number(f.valor.value.replace(/[^\d]/g,'')) || 0;

  const payload = {
    origen_categoria_id: Number(f.ori_cat.value),
    origen_socio_id: Number(f.ori_socio.value),
    destino_categoria_id: Number(f.des_cat.value),
    destino_socio_id: Number(f.des_socio.value),
    valor: valorRaw,
    fecha: f.fecha.value,
    comentario: f.comentarios.value.trim(),
    voucher_url: null
  };

  try{
    // 1) Insertar para obtener id
    const txId = await insertTransaccion(payload);

    // 2) Si hay voucher, subir y actualizar
    const file = f.voucher.files?.[0];
    if(file){
      const url = await uploadVoucher(file, txId);
      await updateTransaccion(txId, {voucher_url: url});
    }

    closeTxModal();
    // Disparar evento global para que listas refresquen (módulo transacciones / socio detalle)
    window.dispatchEvent(new CustomEvent('tx:created'));
  }catch(err){
    console.error(err);
    alert('No se pudo guardar la transacción: ' + (err?.message||err));
  }
}
