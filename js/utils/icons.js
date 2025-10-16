// js/utils/icons.js — Sistema de iconos SVG para Ecologist-GPT
// Iconografía rica y contextual para mejorar la experiencia visual

/**
 * Genera icono SVG con configuración personalizable
 * @param {string} path - Path del SVG
 * @param {Object} options - Opciones de configuración
 * @returns {string} HTML del icono SVG
 */
function createIcon (path, options = {}) {
  const {
    size = 20,
    color = 'currentColor',
    className = '',
    viewBox = '0 0 24 24'
  } = options

  return `<svg class="icon ${className}" width="${size}" height="${size}" viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="${path}" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`
}

// ===== ICONOS DE ACCIÓN =====

export const iconPlus = (options = {}) => createIcon(
  'M12 5v14m-7-7h14',
  { ...options, className: 'icon-plus' }
)

export const iconClose = (options = {}) => createIcon(
  'M18 6L6 18M6 6l12 12',
  { ...options, className: 'icon-close' }
)

export const iconEdit = (options = {}) => createIcon(
  'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',
  { ...options, className: 'icon-edit' }
)

export const iconDelete = (options = {}) => createIcon(
  'M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  { ...options, className: 'icon-delete' }
)

export const iconSave = (options = {}) => createIcon(
  'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z',
  { ...options, className: 'icon-save' }
)

// ===== ICONOS DE NAVEGACIÓN =====

export const iconBack = (options = {}) => createIcon(
  'M19 12H5m7-7l-7 7 7 7',
  { ...options, className: 'icon-back' }
)

export const iconHome = (options = {}) => createIcon(
  'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  { ...options, className: 'icon-home' }
)

export const iconMenu = (options = {}) => createIcon(
  'M3 12h18M3 6h18M3 18h18',
  { ...options, className: 'icon-menu' }
)

// ===== ICONOS DE CONTENIDO =====

export const iconUser = (options = {}) => createIcon(
  'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
  { ...options, className: 'icon-user' }
)

export const iconUsers = (options = {}) => createIcon(
  'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2',
  { ...options, className: 'icon-users' }
)

export const iconBuilding = (options = {}) => createIcon(
  'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z',
  { ...options, className: 'icon-building' }
)

export const iconCategory = (options = {}) => createIcon(
  'M4 7h16M4 12h16M4 17h16',
  { ...options, className: 'icon-category' }
)

export const iconTransaction = (options = {}) => createIcon(
  'M12 1v22m9-9H3',
  { ...options, className: 'icon-transaction' }
)

export const iconMoney = (options = {}) => createIcon(
  'M12 1v22m9-9H3m7-7l7 7-7 7',
  { ...options, className: 'icon-money' }
)

export const iconCard = (options = {}) => createIcon(
  'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z',
  { ...options, className: 'icon-card' }
)

// ===== ICONOS DE COMUNICACIÓN =====

export const iconPhone = (options = {}) => createIcon(
  'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
  { ...options, className: 'icon-phone' }
)

export const iconEmail = (options = {}) => createIcon(
  'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z',
  { ...options, className: 'icon-email' }
)

export const iconWhatsApp = (options = {}) => createIcon(
  'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488',
  { ...options, className: 'icon-whatsapp', viewBox: '0 0 24 24' }
)

// ===== ICONOS DE FECHA Y TIEMPO =====

export const iconCalendar = (options = {}) => createIcon(
  'M8 2v4m8-4v4m-9 4h10M5 4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5z',
  { ...options, className: 'icon-calendar' }
)

export const iconClock = (options = {}) => createIcon(
  'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  { ...options, className: 'icon-clock' }
)

export const iconTime = (options = {}) => createIcon(
  'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  { ...options, className: 'icon-time' }
)

// ===== ICONOS DE UBICACIÓN =====

export const iconLocation = (options = {}) => createIcon(
  'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z',
  { ...options, className: 'icon-location' }
)

export const iconMap = (options = {}) => createIcon(
  'M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7',
  { ...options, className: 'icon-map' }
)

// ===== ICONOS DE ARCHIVOS =====

export const iconFile = (options = {}) => createIcon(
  'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
  { ...options, className: 'icon-file' }
)

export const iconDocument = (options = {}) => createIcon(
  'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
  { ...options, className: 'icon-document' }
)

export const iconUpload = (options = {}) => createIcon(
  'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5l5-5 5 5m-5-5v12',
  { ...options, className: 'icon-upload' }
)

// ===== ICONOS DE CONFIGURACIÓN =====

export const iconSettings = (options = {}) => createIcon(
  'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  { ...options, className: 'icon-settings' }
)

export const iconGear = (options = {}) => createIcon(
  'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  { ...options, className: 'icon-gear' }
)

// ===== ICONOS DE ESTADO =====

export const iconCheck = (options = {}) => createIcon(
  'M20 6L9 17l-5-5',
  { ...options, className: 'icon-check' }
)

export const iconWarning = (options = {}) => createIcon(
  'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z',
  { ...options, className: 'icon-warning' }
)

export const iconError = (options = {}) => createIcon(
  'M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  { ...options, className: 'icon-error' }
)

export const iconInfo = (options = {}) => createIcon(
  'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  { ...options, className: 'icon-info' }
)

// ===== ICONOS DE PRODUCTOS Y VENTAS =====

export const iconShoppingCart = (options = {}) => createIcon(
  'M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 1 1-4 0v-6m4 0V9a2 2 0 1 0-4 0v4.01',
  { ...options, className: 'icon-shopping-cart' }
)

export const iconPackage = (options = {}) => createIcon(
  'M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  { ...options, className: 'icon-package' }
)

export const iconBox = (options = {}) => createIcon(
  'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
  { ...options, className: 'icon-box' }
)

// ===== ICONOS DE BUSCAR Y FILTROS =====

export const iconSearch = (options = {}) => createIcon(
  'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
  { ...options, className: 'icon-search' }
)

export const iconFilter = (options = {}) => createIcon(
  'M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.586a1 1 0 0 1-.293.707l-6.414 6.414a1 1 0 0 0-.293.707V17l-4 4v-6.586a1 1 0 0 0-.293-.707L3.293 7.293A1 1 0 0 1 3 6.586V4z',
  { ...options, className: 'icon-filter' }
)

export const iconSort = (options = {}) => createIcon(
  'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12',
  { ...options, className: 'icon-sort' }
)

// ===== FUNCIONES UTILITARIAS =====

/**
 * Combina múltiples iconos en un contenedor
 * @param {Array} icons - Array de iconos
 * @param {Object} options - Opciones de configuración
 * @returns {string} HTML combinado
 */
export function combineIcons (icons, options = {}) {
  const { className = '', style = '' } = options
  return `<div class="icon-group ${className}" style="${style}">${icons.join('')}</div>`
}

/**
 * Crea un icono con badge/notificación
 * @param {string} iconHtml - HTML del icono
 * @param {number} count - Número del badge
 * @param {Object} options - Opciones adicionales
 * @returns {string} HTML del icono con badge
 */
export function iconWithBadge (iconHtml, count, options = {}) {
  const { badgeColor = '#ef4444', badgeTextColor = 'white' } = options
  return `
    <div class="icon-with-badge" style="position: relative; display: inline-block;">
      ${iconHtml}
      <span class="icon-badge" style="
        position: absolute;
        top: -6px;
        right: -6px;
        background: ${badgeColor};
        color: ${badgeTextColor};
        border-radius: 50%;
        width: 18px;
        height: 18px;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        border: 2px solid white;
      ">${count}</span>
    </div>
  `
}

// ===== EXPORTAR TODOS LOS ICONOS =====
export default {
  // Acción
  plus: iconPlus,
  close: iconClose,
  edit: iconEdit,
  delete: iconDelete,
  save: iconSave,
  
  // Navegación
  back: iconBack,
  home: iconHome,
  menu: iconMenu,
  
  // Contenido
  user: iconUser,
  users: iconUsers,
  building: iconBuilding,
  category: iconCategory,
  transaction: iconTransaction,
  money: iconMoney,
  card: iconCard,
  
  // Comunicación
  phone: iconPhone,
  email: iconEmail,
  whatsapp: iconWhatsApp,
  
  // Fecha y tiempo
  calendar: iconCalendar,
  clock: iconClock,
  time: iconTime,
  
  // Ubicación
  location: iconLocation,
  map: iconMap,
  
  // Archivos
  file: iconFile,
  document: iconDocument,
  upload: iconUpload,
  
  // Configuración
  settings: iconSettings,
  gear: iconGear,
  
  // Estado
  check: iconCheck,
  warning: iconWarning,
  error: iconError,
  info: iconInfo,
  
  // Productos
  shoppingCart: iconShoppingCart,
  package: iconPackage,
  box: iconBox,
  
  // Buscar y filtros
  search: iconSearch,
  filter: iconFilter,
  sort: iconSort,
  
  // Utilidades
  combineIcons,
  iconWithBadge
}
