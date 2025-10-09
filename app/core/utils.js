// app/core/utils.js
export function $(s, el){ return (el||document).querySelector(s); }
export function $all(s, el){ return Array.from((el||document).querySelectorAll(s)); }
export function esc(s){ return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
export function fmt(n){ return Number(n||0).toLocaleString('es-CO',{maximumFractionDigits:2}); }
export function debug(msg){ const d=$('#debug'); if(d) d.textContent=String(msg); }

/* Colores y contraste */
export function hexToRgb(hex){
  hex = String(hex||'').replace('#','');
  if(hex.length===3) hex=hex.split('').map(x=>x+x).join('');
  const num = parseInt(hex,16);
  if (isNaN(num)) return {r:0,g:0,b:0};
  return { r:(num>>16)&255, g:(num>>8)&255, b:num&255 };
}
function relLum(c){
  function ch(v){ v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }
  return 0.2126*ch(c.r)+0.7152*ch(c.g)+0.0722*ch(c.b);
}
export function contrastColor(bg){ const L=relLum(hexToRgb(bg)); return L>0.5?'#000':'#fff'; }
export function mutedFor(bg){ return contrastColor(bg)==='#000'?'rgba(0,0,0,.72)':'rgba(255,255,255,.72)'; }
export function borderOn(bg){ const L=relLum(hexToRgb(bg)); return L>0.5?'rgba(0,0,0,.25)':'rgba(255,255,255,.25)'; }

/* pequeñas helpers */
export function initials(txt){ txt=String(txt||''); const p=txt.trim().split(/\s+/); return (p[0]?.[0]||'')+(p[1]?.[0]||'') || 'SO'; }
