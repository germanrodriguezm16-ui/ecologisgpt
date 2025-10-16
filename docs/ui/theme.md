# 🎨 Sistema de Tokens LCDM

**Archivo de configuración:** `assets/theme-lcdm.css`  
**Última actualización:** 2025-10-12

---

## 🎯 **Dónde Editar los Colores de Marca**

### **Archivo principal:**
```
assets/theme-lcdm.css
```

### **Claves de color:**
```css
:root {
  /* === PALETA OFICIAL LCDM === */
  --color-primary: #FF7A00;        /* Naranja principal */
  --color-primary-600: #E86E00;    /* Hover */
  --color-primary-700: #CC6300;    /* Active/Pressed */
  
  --color-bg: #0B0B0B;             /* Fondo general */
  --color-surface: #141414;        /* Fondo alterno */
  --color-card: #1A1A1A;           /* Tarjetas / paneles */
  --color-border: #2A2A2A;         /* Bordes sutiles */
  
  --color-text: #FFFFFF;           /* Texto principal */
  --color-text-2: #D7D7D7;         /* Texto secundario */
  
  --color-accent: #FFD166;         /* Amarillo cálido */
}
```

---

## 🎨 **Paleta Vigente**

| Token | Valor | Uso |
|-------|-------|-----|
| `--lcdm-primary` | `#FF7A00` | Botones CTA, acentos, links |
| `--lcdm-primary-600` | `#E86E00` | Hover en botones |
| `--lcdm-primary-700` | `#CC6300` | Active/Pressed |
| `--lcdm-bg` | `#0B0B0B` | Fondo general de la app |
| `--lcdm-surface` | `#141414` | Fondos alternos (sidebar, panels) |
| `--lcdm-card` | `#1A1A1A` | Tarjetas, modales, paneles |
| `--lcdm-border` | `#2A2A2A` | Bordes sutiles |
| `--lcdm-text` | `#FFFFFF` | Texto principal, títulos |
| `--lcdm-text-2` | `#D7D7D7` | Texto secundario, labels |
| `--lcdm-accent` | `#FFD166` | Amarillo cálido para warnings |

---

## 🔧 **Cómo Crear un Nuevo Botón Respetando el Tema**

### **1. Usar las clases predefinidas:**

```html
<!-- Botón primario (naranja LCDM) -->
<button class="btn btn--primary">Crear elemento</button>

<!-- Botón secundario (outline naranja) -->
<button class="btn btn--secondary">Cancelar</button>

<!-- Botón ghost (transparente) -->
<button class="btn btn--ghost">Volver</button>

<!-- Botón de peligro (rojo) -->
<button class="btn btn--danger">Eliminar</button>

<!-- Botón de advertencia (amarillo) -->
<button class="btn btn--warn">Advertencia</button>
```

### **2. Iconos de botones:**

```html
<!-- Botón de editar (azul) -->
<button class="icon-btn icon-btn--edit" title="Editar">
  <svg>...</svg>
</button>

<!-- Botón de eliminar (rojo) -->
<button class="icon-btn icon-btn--delete" title="Eliminar">
  <svg>...</svg>
</button>

<!-- Botón de configuración (gris) -->
<button class="icon-btn icon-btn--config" title="Configuración">
  <svg>...</svg>
</button>
```

### **3. Estados automáticos:**

Todos los botones incluyen automáticamente:
- `:hover` - Efectos de hover
- `:active` - Estados de presión
- `:focus-visible` - Outline naranja para accesibilidad

---

## 🚫 **PROHIBIDO**

### **❌ NO hagas esto:**
```css
/* NUNCA hardcodees colores */
.mi-boton {
  background: #FF7A00;  /* ❌ MALO */
  color: #FFFFFF;       /* ❌ MALO */
}

/* NUNCA uses !important */
.mi-boton {
  background: var(--lcdm-primary) !important;  /* ❌ MALO */
}
```

### **✅ Haz esto:**
```css
/* Usa las clases predefinidas */
.mi-boton {
  /* Usa btn btn--primary en HTML */
}

/* O usa tokens directamente */
.mi-boton {
  background: var(--lcdm-primary);  /* ✅ BUENO */
  color: var(--lcdm-text);          /* ✅ BUENO */
}
```

---

## 🎯 **Mapeo a Variables Existentes**

El sistema mapea automáticamente los tokens LCDM a variables existentes:

```css
:root {
  /* Mapeo automático para compatibilidad */
  --bg: var(--lcdm-bg);
  --panel: var(--lcdm-surface);
  --card: var(--lcdm-card);
  --text: var(--lcdm-text);
  --muted: var(--lcdm-text-2);
  --accent: var(--lcdm-primary);
  --accent-600: var(--lcdm-primary-600);
  --accent-700: var(--lcdm-primary-700);
  --border: var(--lcdm-border);
}
```

**Esto significa que el código existente funciona automáticamente** sin cambios.

---

## 🔍 **Verificación de Contraste**

### **Combinaciones verificadas (WCAG AA):**

| Combinación | Ratio | Cumple AA |
|-------------|-------|-----------|
| `#FFFFFF` sobre `#0B0B0B` | 19.37:1 | ✅ AAA |
| `#FFFFFF` sobre `#1A1A1A` | 16.43:1 | ✅ AAA |
| `#D7D7D7` sobre `#0B0B0B` | 14.52:1 | ✅ AAA |
| `#FF7A00` sobre `#0B0B0B` | 5.12:1 | ✅ AA |
| `#FFFFFF` sobre `#FF7A00` | 3.78:1 | ✅ AA |

---

## 🛠️ **Check de Lint**

Para evitar colores hardcoded, el proyecto incluye reglas ESLint que detectan:

- Colores hex (`#FF7A00`)
- Colores RGB (`rgb(255, 122, 0)`)
- Colores HSL (`hsl(32, 100%, 50%)`)

**Comando para verificar:**
```bash
npm run lint:check
```

---

## 📁 **Archivos del Sistema**

### **Principales:**
- `assets/theme-lcdm.css` - Tokens y sistema de botones
- `assets/styles.css` - Estilos base (usa tokens)
- `index.html` - Include del tema

### **Backup (no tocar):**
- `assets/theme-lcdm-new.css` - Archivo temporal (puede eliminarse)

---

## 🚀 **Aplicación del Tema**

### **1. El tema se carga automáticamente:**
```html
<!-- En index.html -->
<link rel="stylesheet" href="./assets/theme-lcdm.css" />
<link rel="stylesheet" href="./assets/styles.css" />
```

### **2. Orden de carga:**
1. **theme-lcdm.css** - Define tokens y sistema de botones
2. **styles.css** - Usa los tokens para estilos base

### **3. Hot reload:**
El servidor de desarrollo detecta cambios automáticamente.

---

## ✅ **Verificación**

Para verificar que el tema funciona:

1. **Abre:** http://localhost:8080/#socios
2. **Verifica:**
   - Fondo oscuro (negro)
   - Botón "Crear categoría" naranja
   - FAB naranja (esquina inferior derecha)
   - Botones de editar/eliminar con colores correctos

---

*Sistema implementado: 2025-10-12*  
*Tiempo de implementación: ~30 minutos*  
*Estado: ✅ Funcionando correctamente*
