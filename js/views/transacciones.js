import { $, el, esc } from '../utils/dom.js';
import { fmt } from '../utils/format.js';
import { listTransacciones } from '../services/supabase.js';

export function mountTransaccionesView(){
  $('#title').textContent = 'Transacciones';
  $('#topActions').innerHTML = ''; // El FAB se maneja desde app.js
  const root = el('div');
  root.appendChild(el('div', {id:'txListWrap'}, ['Cargando transacciones…']));
  $('#view').innerHTML='';
  $('#view').appendChild(root);
  renderTxList();

  // refrescar cuando se cree una
  window.addEventListener('tx:created', renderTxList, {once:false});
}

async function renderTxList(){
  const wrap = $('#txListWrap');
  try{
    const rows = await listTransacciones();
    if(!rows.length){ wrap.innerHTML = '<div class="empty">Aún no hay transacciones.</div>'; return; }
    const list = el('div',{class:'tx-list'});
    rows.forEach(r=>{
      const left = el('div',{class:'left'});
      const date = el('div',{},[r.fecha || '—']);
      const concept = el('div',{class:'concept'},[`${esc(r.origen?.empresa||'—')} → ${esc(r.destino?.empresa||'—')}${r.comentario ? ' · '+esc(r.comentario) : ''}`]);
      left.appendChild(date); left.appendChild(concept);

      const right = el('div',{class:'right'},['$ '+fmt(r.valor||0)]);
      const item = el('div',{class:'tx-item'},[left,right]);
      list.appendChild(item);
    });
    wrap.innerHTML=''; wrap.appendChild(list);
  }catch(err){
    console.error(err);
    wrap.innerHTML = '<div class="error">No se pudo cargar el historial.</div>';
  }
}
