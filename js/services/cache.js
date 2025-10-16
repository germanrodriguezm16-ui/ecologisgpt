/**
 * Sistema de Cache Automático para Supabase
 * Reduce llamadas a la BD y mejora performance
 */

const cache = new Map()
const CACHE_TIME = 5 * 60 * 1000 // 5 minutos en desarrollo, ajustable

/**
 * Obtiene datos con cache automático
 * @param {string} key - Clave única para el cache
 * @param {Function} fetchFn - Función que obtiene los datos
 * @param {number} ttl - Tiempo de vida del cache en ms (opcional)
 * @returns {Promise} - Datos cacheados o frescos
 */
export const getCached = async (key, fetchFn, ttl = CACHE_TIME) => {
  const cached = cache.get(key)
  const now = Date.now()

  // Si hay cache válido, retornarlo
  if (cached && now - cached.timestamp < ttl) {
    console.debug(`[CACHE] HIT: ${key} (${((now - cached.timestamp) / 1000).toFixed(1)}s ago)`)
    return cached.data
  }

  // Si no hay cache o expiró, obtener datos frescos
  console.debug(`[CACHE] MISS: ${key} - fetching...`)
  const data = await fetchFn()

  // Guardar en cache
  cache.set(key, {
    data,
    timestamp: now
  })

  return data
}

/**
 * Invalida el cache para una clave específica
 * @param {string} key - Clave a invalidar
 */
export const invalidateCache = key => {
  if (cache.has(key)) {
    cache.delete(key)
    console.debug(`[CACHE] INVALIDATED: ${key}`)
  }
}

/**
 * Invalida todo el cache que coincida con un patrón
 * @param {RegExp|string} pattern - Patrón para invalidar
 */
export const invalidatePattern = pattern => {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern
  let count = 0

  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key)
      count++
    }
  }

  if (count > 0) {
    console.debug(`[CACHE] INVALIDATED ${count} entries matching: ${pattern}`)
  }
}

/**
 * Limpia todo el cache
 */
export const clearCache = () => {
  const size = cache.size

  cache.clear()
  console.debug(`[CACHE] CLEARED all ${size} entries`)
}

/**
 * Obtiene estadísticas del cache
 */
export const getCacheStats = () => {
  const now = Date.now()
  const entries = Array.from(cache.entries())

  return {
    size: cache.size,
    entries: entries.map(([key, value]) => ({
      key,
      age: ((now - value.timestamp) / 1000).toFixed(1) + 's',
      expired: now - value.timestamp > CACHE_TIME
    }))
  }
}

// Helper para crear claves de cache consistentes
export const cacheKey = {
  categorias: () => 'categorias:all',
  categoria: id => `categoria:${id}`,
  socios: catId => `socios:categoria:${catId}`,
  socio: id => `socio:${id}`,
  transacciones: () => 'transacciones:recent'
}

// Exponer para debugging en desarrollo
if (typeof window !== 'undefined') {
  window.__cache = {
    stats: getCacheStats,
    clear: clearCache,
    invalidate: invalidateCache,
    invalidatePattern
  }
}
