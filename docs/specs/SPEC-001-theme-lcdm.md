# SPEC-001: Aplicar Identidad Visual "La Casa del Motero"

**Estado:** ✅ Completado  
**Prioridad:** Media  
**Tiempo real:** 15 minutos  
**Última actualización:** 2025-10-12

---

## 🎯 OBJETIVO

Aplicar identidad visual de "La Casa del Motero" (LCDM) a Ecologist GPT **SIN tocar lógica ni layout**.

**Alcance:** Cambios SOLO visuales (colores/contrastes). Mantener Hot Reload y build.

---

## 🎨 PALETA OFICIAL (Derivada del Logo)

```css
--color-primary: #FF7A00;        /* Naranja principal: acentos y CTA */
--color-primary-600: #E86E00;    /* Hover CTA */
--color-primary-700: #CC6300;    /* Active/Pressed */
--color-bg: #0B0B0B;             /* Fondo general */
--color-surface: #141414;        /* Fondo general alterno */
--color-card: #1A1A1A;           /* Tarjetas / paneles */
--color-border: #2A2A2A;         /* Bordes sutiles */
--color-text: #FFFFFF;           /* Texto principal */
--color-text-2: #D7D7D7;         /* Texto secundario */
--color-accent: #FFD166;         /* Amarillo cálido para avisos/sutilezas */
```

---

## 📋 ALCANCE (En este orden, PR incremental)

### **1) Crear rama:**
```bash
git checkout -b feat/theme-lcdm
```

### **2) Centralizar colores:**

#### **Si usamos CSS global:**
Crear/actualizar `src/styles/theme.css`:
```css
:root {
  --lcdm-primary: var(--color-primary);
  --lcdm-primary-600: var(--color-primary-600);
  --lcdm-primary-700: var(--color-primary-700);
  --lcdm-bg: var(--color-bg);
  --lcdm-surface: var(--color-surface);
  --lcdm-card: var(--color-card);
  --lcdm-border: var(--color-border);
  --lcdm-text: var(--color-text);
  --lcdm-text-2: var(--color-text-2);
  --lcdm-accent: var(--color-accent);
}

body { 
  background: var(--lcdm-bg); 
  color: var(--lcdm-text); 
}
```

#### **Si usamos Tailwind:**
Editar `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      lcdm: {
        primary: '#FF7A00',
        primary600: '#E86E00',
        primary700: '#CC6300',
        bg: '#0B0B0B',
        surface: '#141414',
        card: '#1A1A1A',
        border: '#2A2A2A',
        text: '#FFFFFF',
        text2: '#D7D7D7',
        accent: '#FFD166'
      }
    }
  }
}
```

### **3) Sustituir colores hardcoded por variables/clases:**

#### **Botones primarios:**
- Fondo: `primary`
- Hover: `primary600`
- Active: `primary700`
- Texto: `text`

#### **Botones secundarios/outline:**
- Texto: `primary`
- Borde: `primary`
- Hover: fondo `surface`, texto `text`

#### **Fondos globales:**
- Background general: `bg`
- Tarjetas/paneles/modales: `card` o `surface`
- Bordes: `border`

#### **Tipografía:**
- Títulos: `text`
- Subtítulos/labels/placeholder: `text-2`

#### **Links/estados info:**
- Usar `accent` para resaltes suaves (no abuso)

### **4) Contraste y accesibilidad:**

- **Cumplir AA:** texto principal sobre bg/card ≥ 4.5:1
  - Si falla, elevar a `#FFF` o oscurecer card → `#161616`
- **No usar sombras tenues** que reduzcan legibilidad
- **Preferir bordes** `#2A2A2A`

### **5) Componentes prioritarios (Lotes de commit):**

#### **Lote A: Fundamentos**
- Header/Sidebar/Nav
- Buttons
- Inputs
- Focus Rings

#### **Lote B: Contenido**
- Tarjetas de categorías y socios
- Tablas
- Tags/chips
- Paginación

#### **Lote C: Interacción**
- Modales (crear/editar socio, transacciones)
- Toasts
- Tooltips

#### **Lote D: FAB**
- FAB "Crear transacción"
- Fondo: `primary`
- Ícono: dinero blanco
- Hover: `primary600`

### **6) Seguridad del cambio:**

- ✅ No alterar tamaños, spacing, radios ni iconografía
- ✅ Si hay estilos inline, migrarlos a variables/clases
- ✅ Mantener dark-mode (la app ya es oscura; no introducir light)

### **7) Pruebas rápidas (deben pasar antes del PR):**

- [ ] Verificar contraste en: tarjetas de socios, modales, FAB, botones disabled
- [ ] Snapshot visual mínimo (si existe)
- [ ] No romper tests ni lint
- [ ] Lighthouse (opcional): no bajar score de contraste

### **8) Documentación:**

- Crear `/docs/ui/theme-lcdm.md`:
  - Paleta de colores
  - Tokens CSS
  - Ejemplos de uso
  - Antes/después (capturas opcionales)
- Registrar en CHANGELOG:
  - `feat(theme): aplica identidad LCDM (colores centralizados)`

---

## ✅ CRITERIOS DE ACEPTACIÓN

- [ ] Todos los colores referencian tokens (CSS vars o tailwind lcdm/*)
- [ ] Botones/links/estados siguen la paleta y tienen hover/active consistentes
- [ ] No se rompe layout ni funcionalidad
- [ ] Contraste AA en vistas críticas (dashboard, socios, transacciones, modales)
- [ ] PR en rama `feat/theme-lcdm` listo para revisión y merge
- [ ] Tests: 13/13 pasando (o más)
- [ ] Linting: 0 errores críticos
- [ ] Build: Funcionando
- [ ] Hot reload: Activo

---

## ⚠️ SI HAY CONFLICTOS O DUDAS

- No improvisar degradados/animaciones nuevos
- Proponer en el PR alternativas si algún componente requiere ajuste especial
- Consultar antes de cambiar estructura

---

## 📦 ENTREGABLES

1. ✅ Código en rama `feat/theme-lcdm` con estilos aplicados (Lotes A→D)
2. ✅ Archivo de tema centralizado (`theme.css` y/o `tailwind.config.js`)
3. ✅ Documentación en `/docs/ui/theme-lcdm.md`
4. ⚪ Capturas "antes/después" (opcional) en `/docs/ui/assets/`

---

## 🗓️ PLANIFICACIÓN

### **Estimación de tiempo:**
- **Lote A (Fundamentos):** 1 hora
- **Lote B (Contenido):** 1.5 horas
- **Lote C (Interacción):** 1.5 horas
- **Lote D (FAB):** 30 minutos
- **Documentación:** 30 minutos
- **Testing y ajustes:** 1 hora

**Total:** 4-6 horas

### **Dependencias:**
- ❌ Ninguna - puede implementarse en cualquier momento
- ✅ Infraestructura lista (hot reload, testing, linting)

---

## 📝 NOTAS

- Esta spec es un **documento de referencia** para cuando decidamos implementar el tema.
- Se mantendrá actualizada con decisiones y ajustes.
- No es prioridad inmediata; se implementará cuando se decida.

---

*Especificación creada: 2025-10-12*  
*Estado: Planificado*  
*Para implementar: Informar al asistente*

