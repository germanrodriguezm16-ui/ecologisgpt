import { $, el, $all, esc } from '../utils/dom.js';
import { getClient } from '../services/supabase.js';
import { openTransaccionModal, closeTransaccionModal } from '../ui/modals.js';

export function openTransaccionesView(){
  $('#title').textContent = 'Transacciones';
  $('#view').innerHTML = '';

  $('#topActions').innerHTML =
    '<div style="display:flex;gap:10px;align-items:center">' +
    '  <button class="btn primary" id="btnNewTrans">Nueva transacción</button>' +
    '</div>';

  $('#btnNewTrans').addEventListener('click', ()=> openTransaccionModal());

  const container = el('div', { id: 'transContent' }, ['Cargando…']);
  $('#view').appendChild(container);

  renderTransacciones();
}

async function fetchTransacciones(){
  const supabase = getClient();
  const { data, error } = await supabase.from('transacciones').select('*').order('created_at', {ascending:false}).limit(200);
  return { rows: data || [], error };
}

export async function renderTransacciones(){
  const cont = $('#transContent');
  cont.innerHTML = 'Cargando…';
  const r = await fetchTransacciones();
  if (r.error) return cont.innerHTML = '<div class="error">' + esc(r.error.message) + '</div>';
  if (!r.rows.length) return cont.innerHTML = '<div class="empty">No hay transacciones.</div>';

  const table = el('table', { class: 'list' });
  const thead = el('thead');
  thead.innerHTML = '<tr><th>Fecha</th><th>Origen</th><th>Destino</th><th>Valor</th><th>Comentario</th></tr>';
  table.appendChild(thead);
  const tbody = el('tbody');
  r.rows.forEach(t => {
    const tr = el('tr');
    tr.innerHTML = '<td>'+ esc(String(t.fecha||'')) +'</td>' +
                   '<td>'+ esc(String(t.origen_socio_id||t.origen_categoria_id||'')) +'</td>' +
                   '<td>'+ esc(String(t.destino_socio_id||t.destino_categoria_id||'')) +'</td>' +
                   '<td>$'+ esc(String(t.valor||0)) +'</td>' +
                   '<td>'+ esc(String(t.comentario||'')) +'</td>';
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  cont.innerHTML = '';
  cont.appendChild(table);
}

/* Form submit handling (delegated from app.js binding) */
export async function handleTransaccionFormSubmit(e){
  e.preventDefault();
  const f = e.target;
  const payload = {
    p_origen_categoria_id: f.origen_categoria_id.value || null,
    p_origen_socio_id: f.origen_socio_id.value || null,
    p_destino_categoria_id: f.destino_categoria_id.value || null,
    p_destino_socio_id: f.destino_socio_id.value || null,
    p_valor: parseFloat(f.valor.value||'0'),
    p_fecha: f.fecha.value || null,
    p_comentario: f.comentario.value || null,
    p_voucher_url: null,
    p_voucher_type: null
  };

  // llamada RPC
  try{
    const supabase = getClient();
    const { data, error } = await supabase.rpc('insert_transaccion_and_update_balances', payload);
    if (error) throw error;
    closeTransaccionModal();
    await renderTransacciones();
    alert('Transacción creada');
  }catch(err){
    console.error(err);
    alert('No se pudo crear la transacción: ' + (err.message || String(err)));
  }
}
