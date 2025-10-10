# UI Conventions - Ecologist-GPT

Este archivo documenta las convenciones visuales y patrones usados en el frontend (no cambia estilos, solo documenta lo existente).

## Paleta de colores (variables CSS en `assets/styles.css`)
- --bg: #0b0f14 (fondo)
- --panel: #0f1620 (panel lateral)
- --card: #121a26 (fondo de tarjetas)
- --text: #e6edf3 (texto principal)
- --muted: #9fb0c2 (texto secundario)
- --primary: #3ba55d (acciones primarias, verde)
- --border: #223044 (bordes)
- --danger: #d9534f (errores)

## Tipografía
- Fuente del sistema (`system-ui` y familiares) para rendimiento.
- Tamaños: `title` ~18px, headers modal ~20px; labels ~12-13px; body ~14px.

## Componentes y disposición
- Layout: grid con `aside` (navegación) y `main` (vista). `.layout` usa `grid-template-columns: 260px 1fr`.
- Cards: `.card` con `border-radius:16px`, padding 18px y sombras suaves; hover lift.
- Buttons: `.btn` genérico; variantes: `.primary`, `.ghost`, `.cancel`, `.create`.
- Inputs: estilados con `background: var(--card)`, `border-radius:10px` y `border:1px solid var(--border)`.

## Modales
- Estructura: `.backdrop` (inset:0, backdrop-filter blur) > `.modal` (contenedor central, animación de translate/opacity).
- Abrir/cerrar: se usa clase `.open` en `.backdrop` y `.modal` para mostrar y animar; `modal.js` añade/remueve handlers (escape, click fuera) y bloquea scroll del body.
- Formularios: `.modal-body` usa dos columnas (grid) en desktop y colapsa a una columna en pantallas pequeñas.

## Iconografía y botones inline
- Iconos inline como emojis o svg insertados directamente; botones de acción pequeños `.icon-btn` o `.file-action`.

## Accesibilidad y usabilidad
- Labels visibles y placeholders explícitos para selects (se usan opciones disabled+hidden como placeholder).
- Inputs con `aria-invalid` y mensajes `.field-error` para errores en campo.
- Focus management: `openModal` intenta mover el foco al primer control interactivo.

## Responsive
- Media query en 900px para adaptar disposición (grid de modal a 1 columna, layout a una columna única).

## Prácticas recomendadas
- No cambiar ids o names de inputs sin actualizar las vistas y el backend.
- Usar placeholders y opciones disabled para selects que deben forzar elección.
- Mantener contraste suficiente para texto sobre fondos oscuros.

