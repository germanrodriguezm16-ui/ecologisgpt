// js/utils/datetime.js — Sistema global de fechas para Ecologist-GPT
// Convención: Todas las fechas se muestran en formato "LUN 10 OCT 25 — 23:15" (hora Bogotá)
// Todas las fechas se almacenan en UTC en la base de datos

export const TZ = 'America/Bogota'

// Iniciales de días de la semana (en español)
const DOW = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB']

// Iniciales de meses (en español)
const MON = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']

/**
 * Obtiene la fecha/hora actual en zona horaria de Bogotá
 * @returns {Date} Fecha actual en Bogotá
 */
export function nowBogota () {
  return new Date()
}

/**
 * Convierte un valor datetime-local de Bogotá a ISO UTC
 * @param {string} localValue - Valor en formato "YYYY-MM-DDTHH:mm" (datetime-local)
 * @returns {string|null} Fecha en formato ISO UTC o null si inválida
 */
export function bogotaLocalToIsoUtc (localValue) {
  if (!localValue) return null
  
  const [d, t] = localValue.split('T')
  if (!d || !t) return null
  
  const [y, m, day] = d.split('-').map(Number)
  const [hh, mm] = t.split(':').map(Number)
  
  // Crear fecha en UTC asumiendo que el input es hora local de Bogotá
  const utcMillis = Date.UTC(y, m - 1, day, hh, mm)
  
  // Calcular offset de Bogotá para esa fecha específica
  const bogotaDate = new Date(utcMillis)
  const bogotaOffset = bogotaDate.getTimezoneOffset() * 60000 // en milisegundos
  
  // Bogotá está UTC-5, pero puede variar por DST
  const bogotaTime = new Date(utcMillis - (5 * 60 * 60 * 1000)) // UTC-5
  const actualOffset = bogotaTime.getTimezoneOffset() * 60000
  const finalUtc = utcMillis - actualOffset + bogotaOffset
  
  return new Date(finalUtc).toISOString()
}

/**
 * Convierte fecha ISO UTC a formato corto de Bogotá
 * Formato: "LUN 10 OCT 25 — 23:15"
 * @param {string} iso - Fecha en formato ISO UTC
 * @returns {string} Fecha formateada o string vacío si inválida
 */
export function isoUtcToBogotaLabelShort (iso) {
  if (!iso) return ''
  
  try {
    const d = new Date(iso)
    
    // Obtener día de la semana en español
    const weekdayFormatter = new Intl.DateTimeFormat('es-CO', {
      timeZone: TZ,
      weekday: 'short'
    })
    const weekdayShort = weekdayFormatter.format(d).slice(0, 3).toUpperCase()
    
    // Mapear a nuestras iniciales
    const dowMap = {
      'DOM': 'DOM', 'LUN': 'LUN', 'MAR': 'MAR', 'MIE': 'MIE',
      'JUE': 'JUE', 'VIE': 'VIE', 'SAB': 'SAB'
    }
    const dow = dowMap[weekdayShort] || 'DOM'
    
    // Obtener día del mes (2 dígitos)
    const dayFormatter = new Intl.DateTimeFormat('es-CO', {
      timeZone: TZ,
      day: '2-digit'
    })
    const dd = dayFormatter.format(d)
    
    // Obtener mes (número) y mapear a iniciales
    const monthFormatter = new Intl.DateTimeFormat('es-CO', {
      timeZone: TZ,
      month: 'numeric'
    })
    const MMnum = parseInt(monthFormatter.format(d))
    const mon = MON[MMnum - 1] || 'ENE'
    
    // Obtener año (2 dígitos)
    const yearFormatter = new Intl.DateTimeFormat('es-CO', {
      timeZone: TZ,
      year: '2-digit'
    })
    const yy = yearFormatter.format(d)
    
    // Obtener hora y minutos (24h)
    const timeFormatter = new Intl.DateTimeFormat('es-CO', {
      timeZone: TZ,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    const timeParts = timeFormatter.formatToParts(d)
    const timeMap = Object.fromEntries(timeParts.map(p => [p.type, p.value]))
    const time = `${timeMap.hour}:${timeMap.minute}`
    
    return `${dow} ${dd} ${mon} ${yy} — ${time}`
  } catch (error) {
    console.warn('[datetime] Error formateando fecha:', error)
    return ''
  }
}

/**
 * Genera valor por defecto para inputs datetime-local en hora de Bogotá
 * @returns {string} Valor en formato "YYYY-MM-DDTHH:mm"
 */
export function defaultDatetimeLocalBogota () {
  try {
    const now = new Date()
    
    // Formatear fecha actual en zona horaria de Bogotá
    const formatter = new Intl.DateTimeFormat('es-CO', {
      timeZone: TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    
    const parts = formatter.formatToParts(now)
    const map = Object.fromEntries(parts.map(p => [p.type, p.value]))
    
    return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`
  } catch (error) {
    console.warn('[datetime] Error generando fecha por defecto:', error)
    // Fallback a fecha actual local
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hour = String(now.getHours()).padStart(2, '0')
    const minute = String(now.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day}T${hour}:${minute}`
  }
}

/**
 * Convierte fecha ISO UTC a formato de fecha simple para inputs date
 * @param {string} iso - Fecha en formato ISO UTC
 * @returns {string} Fecha en formato "YYYY-MM-DD"
 */
export function isoUtcToDateLocal (iso) {
  if (!iso) return ''
  
  try {
    const d = new Date(iso)
    const formatter = new Intl.DateTimeFormat('es-CO', {
      timeZone: TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    
    const parts = formatter.formatToParts(d)
    const map = Object.fromEntries(parts.map(p => [p.type, p.value]))
    
    return `${map.year}-${map.month}-${map.day}`
  } catch (error) {
    console.warn('[datetime] Error convirtiendo fecha a local:', error)
    return ''
  }
}

/**
 * Convierte fecha ISO UTC a formato de hora simple para inputs time
 * @param {string} iso - Fecha en formato ISO UTC
 * @returns {string} Hora en formato "HH:mm"
 */
export function isoUtcToTimeLocal (iso) {
  if (!iso) return ''
  
  try {
    const d = new Date(iso)
    const formatter = new Intl.DateTimeFormat('es-CO', {
      timeZone: TZ,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
    
    const parts = formatter.formatToParts(d)
    const map = Object.fromEntries(parts.map(p => [p.type, p.value]))
    
    return `${map.hour}:${map.minute}`
  } catch (error) {
    console.warn('[datetime] Error convirtiendo hora a local:', error)
    return ''
  }
}
