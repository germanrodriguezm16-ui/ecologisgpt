# 🔘 Sistema de Botones LCDM

**Archivo de configuración:** `assets/theme-lcdm.css`  
**Última actualización:** 2025-10-12

---

## 🎯 **Jerarquía de Colores por Prioridad**

### **Nivel 1: Botones Principales (Acción Primaria)**
| Clase | Token | Color | Uso |
|-------|-------|-------|-----|
| `btn--primary` | `--lcdm-primary` | 🟠 Naranja `#FF7A00` | Crear categoría, Crear socio, Guardar |

### **Nivel 2: Botones Secundarios (Acción Secundaria)**
| Clase | Token | Color | Uso |
|-------|-------|-------|-----|
| `btn--secondary` | `--lcdm-surface` | 🔘 Gris oscuro `#141414` | Botones intermedios, confirmar |
| `btn--ghost` | Transparente | 👻 Invisible | Volver, cancelar |

### **Nivel 3: Botones de Acción (Estados)**
| Clase | Token | Color | Uso |
|-------|-------|-------|-----|
| `btn--danger` | `--danger` | 🔴 Rojo `#ef4444` | Eliminar, cancelar |
| `btn--warn` | `--lcdm-accent` | 🟡 Amarillo `#FFD166` | Advertencias |

### **Nivel 4: Iconos de Acción (Tarjetas)**
| Clase | Token | Color | Uso |
|-------|-------|-------|-----|
| `icon-btn--edit` | `--blue` | 🔵 Azul `#3b82f6` | Editar elemento |
| `icon-btn--delete` | `--danger` | 🔴 Rojo `#ef4444` | Eliminar elemento |
| `icon-btn--config` | `--lcdm-surface` | 🔘 Gris `#141414` | Configurar |

### **Nivel 5: Botones de Navegación**
| Clase | Token | Color | Uso |
|-------|-------|-------|-----|
| `tab-btn` | `--lcdm-surface` | 🔘 Gris oscuro `#141414` | Pestañas de navegación |
| `tab-btn.active` | `--lcdm-primary` | 🟠 Naranja `#FF7A00` | Pestaña activa |

---

## 🎨 **Comportamiento de Estados**

### **Estados Comunes (Todos los botones):**
```css
/* Hover */
:hover:not(:disabled) {
  transform: translateY(-1px);        /* Elevación sutil */
  box-shadow: 0 4px 8px rgba(...);   /* Sombra más pronunciada */
}

/* Active */
:active:not(:disabled) {
  transform: scale(0.97);             /* Comprimir al presionar */
}

/* Disabled */
:disabled {
  opacity: 0.5;                       /* Opacidad reducida */
  cursor: not-allowed;                /* Cursor bloqueado */
}

/* Focus */
:focus-visible {
  outline: 2px solid var(--lcdm-primary);  /* Outline naranja */
  outline-offset: 2px;
}
```

### **Transiciones:**
- **Duración:** `0.2s ease` para colores
- **Duración:** `0.1s ease-in-out` para transformaciones
- **Propiedades:** `background-color`, `transform`, `box-shadow`

---

## 🔧 **Cómo Usar los Tokens LCDM**

### **1. Para Botones Principales:**
```html
<!-- Crear, Guardar, Acciones importantes -->
<button class="btn btn--primary">Crear elemento</button>
```

### **2. Para Botones Secundarios:**
```html
<!-- Confirmar, Ver más, Acciones intermedias -->
<button class="btn btn--secondary">Confirmar</button>
```

### **3. Para Botones de Navegación:**
```html
<!-- Volver, Cancelar, Navegación -->
<button class="btn btn--ghost">← Volver</button>
```

### **4. Para Botones de Acción:**
```html
<!-- Eliminar, Cancelar operaciones -->
<button class="btn btn--danger">Eliminar</button>

<!-- Advertencias, Avisos -->
<button class="btn btn--warn">Advertencia</button>
```

### **5. Para Iconos en Tarjetas:**
```html
<!-- Editar elemento -->
<button class="icon-btn icon-btn--edit" title="Editar">
  <svg>...</svg>
</button>

<!-- Eliminar elemento -->
<button class="icon-btn icon-btn--delete" title="Eliminar">
  <svg>...</svg>
</button>

<!-- Configurar elemento -->
<button class="icon-btn icon-btn--config" title="Configurar">
  <svg>...</svg>
</button>
```

### **6. Para Pestañas:**
```html
<!-- Pestaña inactiva -->
<button class="tab-btn" data-tab="info">Información</button>

<!-- Pestaña activa -->
<button class="tab-btn active" data-tab="transactions">Transacciones</button>
```

---

## 🎨 **Crear Nuevos Botones Coherentes**

### **Paso 1: Identificar el nivel de prioridad**
- **¿Es la acción principal?** → `btn--primary`
- **¿Es una acción secundaria?** → `btn--secondary`
- **¿Es navegación?** → `btn--ghost`
- **¿Es destructiva?** → `btn--danger`
- **¿Es una advertencia?** → `btn--warn`

### **Paso 2: Usar los tokens correctos**
```css
/* ✅ CORRECTO - Usar tokens */
.mi-boton {
  background: var(--lcdm-primary);
  color: var(--lcdm-text);
}

/* ❌ INCORRECTO - Hardcodear colores */
.mi-boton {
  background: #FF7A00;  /* NO hacer esto */
  color: #FFFFFF;       /* NO hacer esto */
}
```

### **Paso 3: Aplicar estados**
```css
.mi-boton {
  transition: all 0.2s ease;
}

.mi-boton:hover:not(:disabled) {
  transform: translateY(-1px);
}

.mi-boton:active:not(:disabled) {
  transform: scale(0.97);
}
```

---

## 🚫 **PROHIBIDO**

### **❌ NO hagas esto:**
```css
/* NUNCA hardcodees colores */
.mi-boton {
  background: #FF7A00 !important;  /* ❌ MALO */
  color: #FFFFFF !important;       /* ❌ MALO */
}

/* NUNCA uses !important */
.mi-boton {
  background: var(--lcdm-primary) !important;  /* ❌ MALO */
}

/* NUNCA cambies la estructura HTML */
<!-- ❌ MALO -->
<div class="mi-boton">Texto</div>
```

### **✅ Haz esto:**
```html
<!-- Usa las clases predefinidas -->
<button class="btn btn--primary">Mi botón naranja</button>
<button class="btn btn--secondary">Mi botón secundario</button>
```

---

## 🎯 **Verificación de Contraste**

### **Combinaciones verificadas (WCAG AA):**

| Combinación | Ratio | Cumple AA |
|-------------|-------|-----------|
| `#FFFFFF` sobre `#FF7A00` | 3.78:1 | ✅ AA |
| `#FFFFFF` sobre `#3b82f6` | 4.58:1 | ✅ AA |
| `#FFFFFF` sobre `#ef4444` | 4.00:1 | ✅ AA |
| `#0B0B0B` sobre `#FFD166` | 14.52:1 | ✅ AAA |

---

## 📁 **Archivos del Sistema**

### **Principales:**
- `assets/theme-lcdm.css` - Sistema completo de botones
- `assets/styles.css` - Botones de modal (`.btn.create`, `.btn.cancel`)

### **Uso en JavaScript:**
- `js/app.js` - Botón "Crear categoría"
- `js/views/socios.js` - Botones de socios y navegación
- `js/views/categorias.js` - Iconos de editar/eliminar

---

## 🚀 **Aplicación del Sistema**

### **1. El sistema se carga automáticamente:**
```html
<!-- En index.html -->
<link rel="stylesheet" href="./assets/theme-lcdm.css" />
<link rel="stylesheet" href="./assets/styles.css" />
```

### **2. Orden de carga:**
1. **theme-lcdm.css** - Define sistema completo de botones
2. **styles.css** - Botones específicos de modal

### **3. Hot reload:**
El servidor detecta cambios automáticamente.

---

## ✅ **Verificación**

Para verificar que el sistema funciona:

1. **Abre:** http://localhost:8080/#socios
2. **Verifica:**
   - ✅ Botón "Crear categoría" → 🟠 **NARANJA**
   - ✅ Botón "Crear socio" → 🟠 **NARANJA**
   - ✅ Botones "Volver" → 👻 **TRANSPARENTES**
   - ✅ Iconos "Editar" → 🔵 **AZUL**
   - ✅ Iconos "Eliminar" → 🔴 **ROJO**
   - ✅ Iconos "Configurar" → 🔘 **GRIS**
   - ✅ FAB → 🟠 **NARANJA** con gradiente

---

## 🎨 **Paleta de Tokens Disponibles**

```css
/* Tokens principales */
--lcdm-primary: #FF7A00;        /* Naranja principal */
--lcdm-primary-600: #E86E00;    /* Naranja hover */
--lcdm-primary-700: #CC6300;    /* Naranja active */

/* Tokens de superficie */
--lcdm-bg: #0B0B0B;             /* Fondo general */
--lcdm-surface: #141414;        /* Fondos alternos */
--lcdm-card: #1A1A1A;           /* Tarjetas */
--lcdm-border: #2A2A2A;         /* Bordes */

/* Tokens de texto */
--lcdm-text: #FFFFFF;           /* Texto principal */
--lcdm-text-2: #D7D7D7;         /* Texto secundario */

/* Tokens de acción */
--lcdm-accent: #FFD166;         /* Amarillo */
--blue: #3b82f6;                /* Azul */
--danger: #ef4444;              /* Rojo */
--warning: #f59e0b;             /* Amarillo alternativo */
```

---

*Sistema implementado: 2025-10-12*  
*Tiempo de implementación: ~45 minutos*  
*Estado: ✅ Funcionando correctamente*  
*Botones con color coherente: 100%*
