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

  // Recolectar campos obligatorios faltantes
  const missing = [];
  if (!f.origen_categoria_id.value) missing.push('Categoría origen');
  if (!f.origen_socio_id.value) missing.push('Socio origen');
  if (!f.destino_categoria_id.value) missing.push('Categoría destino');
  if (!f.destino_socio_id.value) missing.push('Socio destino');
  if (!f.valor.value || !String(f.valor.value).trim()) missing.push('Valor');
  if (!f.fecha.value) missing.push('Fecha y hora');

  const errElId = 'transError';
  let errEl = document.getElementById(errElId);
  if (!errEl){ errEl = document.createElement('div'); errEl.id = errElId; errEl.className='error-list'; f.prepend(errEl); }
  if (missing.length){
    errEl.innerHTML = '<strong>Faltan campos obligatorios:</strong><br>' + missing.map(m=> '- ' + m).join('<br>');
    return;
  }
  errEl.innerHTML = '';

  // Comentario obligatorio (UI requirement)
  const comentarioInput = f.comentario;
  let comentarioErr = document.getElementById('comentarioError');
  if (!comentarioErr){ comentarioErr = document.createElement('div'); comentarioErr.id='comentarioError'; comentarioErr.className='field-error'; comentarioInput.after(comentarioErr); }
  const comentarioVal = String(comentarioInput.value || '');
  if (!comentarioVal.trim()){
    comentarioErr.textContent = 'El comentario es obligatorio.';
    comentarioInput.setAttribute('aria-invalid','true'); comentarioInput.classList.add('invalid');
    return;
  }
  // clear comentario error if any
  comentarioErr.textContent = '';
  comentarioInput.removeAttribute('aria-invalid'); comentarioInput.classList.remove('invalid');

  // Convertir fecha local (datetime-local asume hora en Bogotá) -> ISO UTC
  function colombiaLocalToIsoUtc(localDatetimeValue){
    const colombiaOffsetMinutes = -300; // -5 * 60
    const [date, time] = localDatetimeValue.split('T');
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);
    const utcMillis = Date.UTC(y, m - 1, d, hh, mm) - (colombiaOffsetMinutes * 60000);
    return new Date(utcMillis).toISOString();
  }

  // Parse currency colombiana: ejemplo "1.234.567,89" -> 1234567.89
  function parseCurrencyToNumber(str){
    if(!str) return 0;
    // quitar espacios y prefijos
    let s = String(str).replace(/\s/g,'').replace(/\$/g,'');
    // eliminar puntos de miles, cambiar coma decimal por punto
    s = s.replace(/\./g,'').replace(/,/g,'.');
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }

  const valorNum = parseCurrencyToNumber(f.valor.value);
  if (!valorNum || valorNum <= 0){ errEl.innerHTML = '<strong>Error:</strong> El valor debe ser mayor que 0'; return; }

  const payload = {
    p_origen_categoria_id: f.origen_categoria_id.value || null,
    p_origen_socio_id: f.origen_socio_id.value || null,
    p_destino_categoria_id: f.destino_categoria_id.value || null,
    p_destino_socio_id: f.destino_socio_id.value || null,
    p_valor: valorNum,
    p_fecha: colombiaLocalToIsoUtc(f.fecha.value),
    p_comentario: f.comentario.value || null,
    p_voucher_url: null,
    p_voucher_type: null
  };

  try{
    const supabase = getClient();
    const { data, error } = await supabase.rpc('insert_transaccion_and_update_balances', payload);
    if (error) throw error;
    closeTransaccionModal();
    await renderTransacciones();
    alert('Transacción creada');
  }catch(err){
    console.error(err);
    errEl.textContent = 'No se pudo crear la transacción: ' + (err.message || String(err));
  }
}
