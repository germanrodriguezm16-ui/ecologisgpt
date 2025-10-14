export const $ = (s, el) => (el || document).querySelector(s)
export const $all = (s, el) => Array.prototype.slice.call((el || document).querySelectorAll(s))
export const el = (tag, attrs = {}, children = []) => {
  const node = document.createElement(tag)

  for (const k in attrs) {
    if (k === 'class') node.className = attrs[k]
    else if (k === 'style') {
      Object.assign(node.style, attrs[k])
    } else node.setAttribute(k, attrs[k])
  }
  children.forEach(c => {
    if (c != null) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c)
  })
  return node
}
export const debug = msg => {
  const d = $('#debug')

  if (d) d.textContent = String(msg)
}
export const esc = s =>
  String(s).replace(
    /[&<>"']/g,
    m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[m]
  )
