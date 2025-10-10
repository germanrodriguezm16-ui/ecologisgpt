# Design System (mini)

## Principios

- Oscuro moderno: interfaz con alto contraste sobre fondos oscuros, foco en legibilidad.
- Limpio: componentes minimalistas, padding y espaciado consistentes.
- Accesible: cumplir AA en contraste y controles teclado/foco visibles.

## Tokens

- Colores (variables):
  - `--bg: #0b0f14`
  - `--panel: #0f1628`
  - `--card: #111827`
  - `--text: #e5e7eb`
  - `--muted: #94a3b8`
  - `--accent: #22c55e`
  - `--accent-600: #16a34a`
  - `--accent-700: #15803d`
  - `--danger: #ef4444`
  - `--warning: #f59e0b`
  - `--border: rgba(255,255,255,.08)`

- Tipografía y radios:
  - `--font: "Inter", system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
  - `--radius: 12px`
  - `--radius-lg: 20px`

- Sombras:
  - `--shadow-1: 0 6px 18px rgba(0,0,0,.30)`
  - `--shadow-2: 0 10px 25px rgba(0,0,0,.35)`

- Espaciado:
  - `--space-2: 8px`
  - `--space-3: 12px`
  - `--space-4: 16px`
  - `--space-6: 24px`

## Componentes base

- Botón (`.btn`, `.btn.primary`): usar `--card`/`--accent` y `--border`, `border-radius: var(--radius)`.
- Chip: small text, padding `--space-2`/`--space-3`, border-radius `999px`.
- Tarjeta (`.card`): background `--card`, border `1px solid var(--border)`, padding `--space-4`, border-radius `--radius`.

## Pautas

- No usar estilos inline en componentes; preferir utilidades y tokens.
- No usar `!important`.
- Usar siempre variables CSS para colores, radios, espaciados y sombras.
- Estados: hover/active/focus deben estar claramente definidos.

## Paleta y ejemplos

- Ejemplo de botón primario:

```html
<button class="btn primary">Guardar</button>
```

- Ejemplo de FAB:

```html
<button class="fab" aria-label="Crear transacción" data-shortcut="Alt+N">
  <!-- svg icon -->
</button>
```

Este documento sirve como referencia rápida y como la fuente prioritaria para decisiones de UI en el proyecto.
# Design system (mini)

## Principios
- Oscuro moderno: interfaz con alto contraste, enfatizando legibilidad en fondo oscuro.
- Limpio: espacios consistentes, tipografía neutra y jerarquía clara.
- Accesible AA: contrastes y estados visibles, foco claro y navegación por teclado.

## Tokens

- Colores
  - `--bg: #0b0f14`
  - `--panel: #0f1628`
  - `--card: #111827`
  - `--text: #e5e7eb`
  - `--muted: #94a3b8`
  - `--accent: #22c55e`
  - `--accent-600: #16a34a`
  - `--accent-700: #15803d`
  - `--danger: #ef4444`
  - `--warning: #f59e0b`
  - `--border: rgba(255,255,255,.08)`

- Tipografía y radios
  - `--font: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`
  - `--radius: 12px`
  - `--radius-lg: 20px`

- Sombras
  - `--shadow-1: 0 6px 18px rgba(0,0,0,.30)`
  - `--shadow-2: 0 10px 25px rgba(0,0,0,.35)`

- Espaciado
  - `--space-2: 8px`
  - `--space-3: 12px`
  - `--space-4: 16px`
  - `--space-6: 24px`

## Componentes base

- Botón: uso de `--accent` para primary, estados hover/active con `--accent-600/700`, padding con `--space-3/4`, border-radius `--radius`.
- Chip: pequeño contenedor con padding `--space-2`, fondo `var(--panel)`, borde `--border`, radio `--radius`.
- Tarjeta: fondo `--card`, padding `--space-4`, radio `--radius-lg`, sombra `--shadow-1`.

## Pautas
- No usar estilos inline. Usar siempre variables CSS declaradas en `:root`.
- No usar `!important`.
- Todos los colores deben provenir de tokens.
- Asegurar estados `:hover`, `:active` y `:focus-visible` en componentes interactivos.

## Paleta (ejemplo de uso)
- Primary: `background: var(--accent); color: var(--card-on, #07130d)`
- Surface: `background: var(--card); color: var(--text)`

---

Este documento sirve como contrato rápido para futuras implementaciones de UI en el proyecto.