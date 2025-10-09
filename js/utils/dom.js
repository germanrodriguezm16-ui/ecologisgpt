export function $(s, el){ return (el||document).querySelector(s); }
export function $all(s, el){ return Array.prototype.slice.call((el||document).querySelectorAll(s)); }
export function el(tag, attrs={}, children=[]){
  const node = document.createElement(tag);
  for (const k in attrs){
    if (k === 'class') node.className = attrs[k];
    else if (k === 'style'){ Object.assign(node.style, attrs[k]); }
    else node.setAttribute(k, attrs[k]);
  }
  children.forEach(c => { if (c!=null) node.appendChild(typeof c==='string' ? document.createTextNode(c) : c); });
  return node;
}
export function debug(msg){ const d = $('#debug'); if(d) d.textContent = String(msg); }
export function esc(s){ return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
