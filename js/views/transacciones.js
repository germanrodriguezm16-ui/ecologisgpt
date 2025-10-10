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

  // Abrir y preparar modal (separado para cargar selects y formateo)
  $('#btnNewTrans').addEventListener('click', async ()=> {
    openTransaccionModal();
    await prepareTransaccionModal();
  });

  const container = el('div', { id: 'transContent' }, ['Cargando…']);
  $('#view').appendChild(container);

  renderTransacciones();
}

export async function prepareTransaccionModal(){
  try{
    const supabase = getClient();
    const cats = await supabase.from('categorias_socios').select('*').order('orden',{ascending:true});
    const socios = await supabase.from('socios').select('*').order('empresa',{ascending:true});
    const sel = (id)=> document.getElementById(id);
    if (cats.data){
      ['origen_categoria_id','destino_categoria_id'].forEach(id=>{
        const elSel = sel(id); if(!elSel) return; elSel.innerHTML='';
        // placeholder option
        const ph = new Option('Seleccione categoría', ''); ph.disabled = true; ph.selected = true; ph.hidden = true; elSel.add(ph);
        cats.data.forEach(c=> elSel.add(new Option(c.nombre, c.id)));
        try{ elSel.value = ''; }catch(_){ }
      });
    }

    async function loadSociosForCategory(catId, targetSelectId){
      const sEl = sel(targetSelectId);
      if(!sEl) return;
      sEl.innerHTML = '';
      if(!catId) return;
      const { data: socs, error } = await supabase.from('socios').select('*').eq('categoria_id', catId).order('empresa',{ascending:true});
      if(error) return console.warn('Error cargando socios por categoría', error.message);
      socs.forEach(s => sEl.add(new Option(s.empresa + ' — ' + (s.titular||''), s.id)));
    }

    const origenCat = document.getElementById('origen_categoria_id');
    const destinoCat = document.getElementById('destino_categoria_id');
    origenCat?.addEventListener('change', async (e)=>{
      await loadSociosForCategory(e.target.value, 'origen_socio_id');
      const origenSel = document.getElementById('origen_socio_id'); if (origenSel) origenSel.value = '';
    });
    destinoCat?.addEventListener('change', async (e)=>{
      await loadSociosForCategory(e.target.value, 'destino_socio_id');
      const destinoSel = document.getElementById('destino_socio_id'); if (destinoSel) destinoSel.value = '';
    });

    const fechaInput = document.querySelector('input[name="fecha"]');
    if (fechaInput && !fechaInput.value){
      const nowUtc = Date.now();
      const colombiaOffsetHours = -5;
      const colombiaMillis = nowUtc + colombiaOffsetHours * 3600_000;
      const d = new Date(colombiaMillis);
      fechaInput.value = d.toISOString().slice(0,16);
    }

    const { createCurrencyFSM } = await import('../utils/currency.js');
    const valorInput = document.querySelector('input[name="valor"]');
    if (valorInput){
      const fsm = createCurrencyFSM();
      let composing = false;
      valorInput.value = fsm.getDisplay();
      valorInput.addEventListener('keydown', (e)=>{
        if (e.key === 'Backspace'){ e.preventDefault(); fsm.backspace(); valorInput.value = fsm.getDisplay(); return; }
        if (e.key === '.' || e.key === ','){ e.preventDefault(); fsm.inputSep(); valorInput.value = fsm.getDisplay(); return; }
        if (/^[0-9]$/.test(e.key)){ e.preventDefault(); fsm.inputDigit(e.key); valorInput.value = fsm.getDisplay(); return; }
      });
      valorInput.addEventListener('compositionstart', ()=> composing = true);
      valorInput.addEventListener('compositionend', (e)=>{ composing = false; valorInput.value = fsm.getDisplay(); });
      valorInput.addEventListener('paste', (e)=>{
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text') || '';
        const cleaned = text.replace(/[^0-9.,]/g, '');
        for (const ch of cleaned){ if (/[0-9]/.test(ch)) fsm.inputDigit(ch); else if (ch === '.' || ch === ',') fsm.inputSep(); }
        valorInput.value = fsm.getDisplay();
      });
    }

    // evitar seleccionar el mismo socio en destino al elegir origen
    const origenSel = document.getElementById('origen_socio_id');
    const destinoSel = document.getElementById('destino_socio_id');
    function syncDisable(){
      if (!origenSel || !destinoSel) return;
      const origenVal = origenSel.value;
      Array.from(destinoSel.options).forEach(opt=> opt.disabled = (opt.value === origenVal));
    }
    origenSel?.addEventListener('change', syncDisable);
    destinoSel?.addEventListener('change', ()=>{ if (origenSel && destinoSel && origenSel.value === destinoSel.value) alert('Origen y destino no pueden ser el mismo socio'); });

  }catch(e){ console.warn('No se pudieron cargar selects de transacciones', e); }
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
