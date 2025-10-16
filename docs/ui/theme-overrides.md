# Theme Overrides - Sistema de Overrides Seguros

## 📋 **Resumen**

Este documento describe el sistema de overrides de tema seguro implementado en `assets/theme-overrides.css`. Este sistema permite ajustes visuales manuales sin romper el sistema de colores ni la lógica JavaScript.

## 🎯 **Objetivos**

- **Seguridad**: No romper el sistema de colores base ni la lógica JS
- **Flexibilidad**: Permitir ajustes visuales por módulo
- **Mantenibilidad**: Mantener `theme-lcdm.css` como fuente de verdad
- **Escalabilidad**: Sistema que crece con nuevos módulos

## 📁 **Estructura de Archivos**

```
assets/
├── theme-lcdm.css          # Fuente de verdad del branding
├── visual-design.css       # Componentes visuales base
├── styles.css             # Estilos globales
└── theme-overrides.css    # Overrides seguros por módulo
```

## 🔄 **Orden de Carga CSS**

```html
<!-- 1. Tema base (fuente de verdad) -->
<link rel="stylesheet" href="./assets/theme-lcdm.css" />

<!-- 2. Componentes visuales -->
<link rel="stylesheet" href="./assets/visual-design.css" />

<!-- 3. Estilos globales -->
<link rel="stylesheet" href="./assets/styles.css" />

<!-- 4. Overrides seguros (último) -->
<link rel="stylesheet" href="./assets/theme-overrides.css" />
```

## 🗺️ **Mapa de Rutas → Scopes de Página**

| Ruta | Scope de Página | Descripción |
|------|----------------|-------------|
| `/socios` | `.partners-page` | Gestión de socios y categorías |
| `/transacciones` | `.transactions-page` | Listado y creación de transacciones |
| `/inventario` | `.inventory-page` | Gestión de productos y stock |
| `/categorias` | `.categories-page` | Gestión de categorías de socios |

## 🎨 **Cuándo Usar Cada Sistema**

### ✅ **Usar Tokens (theme-lcdm.css)**
- **Cuándo**: Cambios de marca globales
- **Ejemplo**: Cambiar el color primario de toda la aplicación
- **Archivo**: `assets/theme-lcdm.css`
- **Variables**: `--lcdm-primary`, `--lcdm-accent`, etc.

### ✅ **Usar Overrides (theme-overrides.css)**
- **Cuándo**: Ajustes específicos por módulo
- **Ejemplo**: Botones de editar más prominentes solo en socios
- **Archivo**: `assets/theme-overrides.css`
- **Scope**: `.partners-page .icon-btn--edit`

### ✅ **Usar Variantes Opt-in**
- **Cuándo**: Estilos opcionales que se aplican manualmente
- **Ejemplo**: Botón con brillo extra para casos especiales
- **Clase**: `.btn.is-bright`, `.btn.is-accent`

## 🎨 **Mapa de Variantes → Tokens**

### **Botones de Acción por Módulo**

| Módulo | Botón | Token Usado | Color Resultante |
|--------|-------|-------------|------------------|
| Socios | Editar | `--lcdm-accent` | Verde (#22c55e) |
| Socios | Eliminar | `--lcdm-danger` | Rojo (#ef4444) |
| Socios | Configurar | `--lcdm-primary` | Naranja (#ff7a00) |
| Categorías | Editar | `--lcdm-accent` | Verde (#22c55e) |
| Categorías | Eliminar | `--lcdm-danger` | Rojo (#ef4444) |
| Categorías | Configurar | `--lcdm-primary` | Naranja (#ff7a00) |

### **FABs por Módulo**

| Módulo | Token Usado | Color Resultante |
|--------|-------------|------------------|
| Transacciones | `--lcdm-primary` | Naranja (#ff7a00) |
| Inventario | `--lcdm-accent` | Verde (#22c55e) |

### **Variantes Opt-in**

| Clase | Token Usado | Efecto |
|-------|-------------|--------|
| `.btn.is-bright` | N/A | `filter: saturate(1.08) brightness(1.02)` |
| `.btn.is-accent` | `--lcdm-accent` | Fondo verde con texto blanco |
| `.btn.is-muted` | `--lcdm-surface` | Fondo neutro con borde |

## 📝 **Ejemplos de Antes/Después**

### **Ejemplo 1: Botón de Editar en Socios**

**Antes:**
```css
.icon-btn--edit {
  background: transparent;
  color: var(--text);
}
```

**Después:**
```css
.partners-page .icon-btn--edit {
  background: var(--lcdm-accent);
  color: #fff;
}
```

**Resultado**: Botón de editar verde solo en la página de socios.

### **Ejemplo 2: FAB de Inventario**

**Antes:**
```css
.fab {
  background: #3b82f6; /* Azul hardcodeado */
}
```

**Después:**
```css
.inventory-page .fab {
  background: var(--lcdm-accent); /* Verde del tema */
}
```

**Resultado**: FAB verde solo en inventario, mantiene naranja en transacciones.

## 🚫 **Reglas Prohibidas**

### ❌ **NO Hacer en theme-overrides.css**

```css
/* ❌ Redefinir componentes base sin scope */
.btn {
  background: red; /* ROMPE TODO */
}

/* ❌ Cambiar propiedades de layout */
.fab {
  position: relative; /* ROMPE EL FAB */
  z-index: 1; /* ROMPE LA SUPERPOSICIÓN */
}

/* ❌ Cambiar display/pointer-events */
.modal {
  display: none; /* ROMPE LOS MODALES */
  pointer-events: none; /* ROMPE LA INTERACCIÓN */
}
```

### ✅ **SÍ Hacer en theme-overrides.css**

```css
/* ✅ Overrides con scope de página */
.partners-page .icon-btn--edit {
  background: var(--lcdm-accent);
  color: #fff;
}

/* ✅ Variantes opt-in */
.btn.is-bright {
  filter: saturate(1.08) brightness(1.02);
}

/* ✅ Ajustes de color/estilo con scope */
.transactions-page .tx-valor-pos {
  color: #059669;
  font-weight: 700;
}
```

## 🔧 **Implementación Técnica**

### **Gestión de Scopes en JavaScript**

```javascript
// En js/app.js - mountView()
const scopeMap = {
  'socios': 'partners-page',
  'transacciones': 'transactions-page', 
  'inventario': 'inventory-page',
  'categorias': 'categories-page'
}

const currentScope = scopeMap[tab]
if (currentScope) {
  body?.classList.add(currentScope)
  main?.classList.add(currentScope)
}
```

### **Estructura de Clases CSS**

```css
/* Scope de página */
.partners-page {
  /* Estilos específicos de socios */
}

/* Componente con scope */
.partners-page .icon-btn--edit {
  /* Override específico */
}

/* Variante opt-in */
.btn.is-bright {
  /* Estilo opcional */
}
```

## 🧪 **Testing y Verificación**

### **Checklist de Verificación**

- [ ] `/socios`: Botones editar/eliminar/config con colores correctos
- [ ] `/transacciones`: FAB naranja visible y funcional
- [ ] `/inventario`: FAB verde visible y funcional
- [ ] `/categorias`: Botones con colores correctos
- [ ] Sin errores en consola
- [ ] Sin cambios en clases `.js-*`
- [ ] Modales funcionan correctamente
- [ ] FABs cambian correctamente al navegar

### **Debugging Visual**

Para debugging, agregar clase `.debug-scope` al body:

```javascript
document.body.classList.add('debug-scope')
```

Esto mostrará outlines de colores para cada scope de página.

## 📚 **Referencias**

- **theme-lcdm.css**: Fuente de verdad de tokens de color
- **visual-design.css**: Componentes visuales base
- **styles.css**: Estilos globales y layout
- **theme-overrides.css**: Overrides seguros por módulo

## 🔄 **Mantenimiento**

### **Agregar Nuevo Módulo**

1. **Agregar scope en JavaScript:**
```javascript
const scopeMap = {
  // ... existentes
  'nuevo-modulo': 'nuevo-module-page'
}
```

2. **Agregar estilos en CSS:**
```css
.nuevo-module-page .componente {
  /* Overrides específicos */
}
```

3. **Actualizar documentación:**
- Agregar entrada en tabla de rutas
- Documentar tokens usados
- Agregar ejemplos si es necesario

### **Cambios de Marca Global**

- **NO** modificar `theme-overrides.css`
- **SÍ** modificar `theme-lcdm.css`
- Los overrides se adaptarán automáticamente

---

**Última actualización**: 2025-01-13  
**Versión**: 1.0.0  
**Mantenido por**: Equipo de Desarrollo
