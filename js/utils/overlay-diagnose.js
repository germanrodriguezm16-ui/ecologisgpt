// overlay-diagnose.js
// Lightweight runtime diagnostic to detect external overlays that cover the
// viewport and to restore visibility of main layout elements if accidentally hidden.
// It is conservative: it will NOT hide app-owned elements like .fab, .modal or .backdrop.

function selectorFor (el) {
  if (!el) return ''
  let s = el.tagName.toLowerCase()

  if (el.id) s += `#${el.id}`
  if (el.classList && el.classList.length) s += '.' + Array.from(el.classList).join('.')
  return s
}

function isAppElement (el) {
  if (!el) return false
  const cls = (el.className || '') + ''

  if (/\b(fab|modal|backdrop|preview-overlay)\b/.test(cls)) return true
  if (el.id && /modal|fab/.test(el.id)) return true
  return false
}

function candidateElements () {
  const layout = document.querySelector('.layout')
  const all = Array.from(document.body.querySelectorAll('*'))
  const candidates = []

  for (const el of all) {
    try {
      if (isAppElement(el)) continue
      const cs = getComputedStyle(el)

      if (!['fixed', 'absolute', 'sticky'].includes(cs.position)) continue
      const rect = el.getBoundingClientRect()
      const area = Math.max(0, rect.width) * Math.max(0, rect.height)
      const screenArea = Math.max(1, window.innerWidth * window.innerHeight)
      const coverage = area / screenArea
      // candidate: covers a large portion of viewport (conservative threshold)

      if (coverage < 0.5) continue
      // skip if element is inside the main app layout (likely app overlay)
      if (layout && (layout.contains(el) || el.contains(layout))) continue
      candidates.push(el)
    } catch (e) {
      /* ignore errors on exotic elements */
    }
  }
  return candidates
}

function saveOriginal (el) {
  if (!el) return
  if (!el.dataset.__origStyle) el.dataset.__origStyle = el.getAttribute('style') || ''
}

function hideExternalOverlay (el) {
  saveOriginal(el)
  try {
    el.style.setProperty('display', 'none', 'important')
    el.style.setProperty('visibility', 'hidden', 'important')
    el.style.setProperty('pointer-events', 'none', 'important')
  } catch (e) {
    /* best-effort */
  }
}

function restoreMainIfHidden () {
  const changed = []
  const body = document.body
  const layout = document.querySelector('.layout')
  const main = document.querySelector('main') || (layout && layout.querySelector('main'));

  [body, layout, main].forEach(el => {
    if (!el) return
    try {
      const cs = getComputedStyle(el)
      const before = { display: cs.display, visibility: cs.visibility, opacity: cs.opacity }
      let modified = false

      if (cs.display === 'none') {
        saveOriginal(el)
        el.style.display = 'block'
        modified = true
      }
      if (cs.visibility === 'hidden') {
        saveOriginal(el)
        el.style.visibility = 'visible'
        modified = true
      }
      if (parseFloat(cs.opacity) < 0.1) {
        saveOriginal(el)
        el.style.opacity = '1'
        modified = true
      }
      if (modified) {
        changed.push({
          selector: selectorFor(el),
          before,
          after: {
            display: el.style.display,
            visibility: el.style.visibility,
            opacity: el.style.opacity
          }
        })
      }
    } catch (e) {}
  })
  return changed
}

function runDiagnosis () {
  const report = { restoredRoots: [], hiddenOverlays: [] }

  report.restoredRoots = restoreMainIfHidden()
  const cands = candidateElements()

  for (const el of cands) {
    const sel = selectorFor(el)

    console.warn('[overlay-diagnose] detected external overlay candidate:', sel)
    hideExternalOverlay(el)
    report.hiddenOverlays.push(sel)
  }
  if (report.restoredRoots.length === 0 && report.hiddenOverlays.length === 0) {
    console.log('[overlay-diagnose] no blocking overlays or hidden roots detected')
  } else {
    console.log('[overlay-diagnose] corrections applied:', report)
  }
  return report
}

// run after DOMContentLoaded to allow app to initialize
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => setTimeout(runDiagnosis, 50))
} else setTimeout(runDiagnosis, 50)

// expose for manual re-run from console
window.__overlayDiagnose = runDiagnosis
