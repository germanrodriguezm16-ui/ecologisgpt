# Data model - Ecologist-GPT (supabase)

Este documento describe las tablas del esquema que el frontend espera. Se basa en la implementación actual y en las consultas vistas en el código. No inventa campos: si un campo no aparece en el código, no se asume.

## tablas

### categorias_socios
| columna | tipo | notas |
|---|---:|---|
| id | integer / serial | PK |
| nombre | text | nombre de la categoría (ej. Proveedores) |
| color | text | color hex para tarjetas |
| balance | numeric / double | balance agregado (puede ser calculado) |
| orden | integer | orden para listados |
| tab2_name | text | etiqueta personalizada para pestaña 2 (Notas) |
| tab3_name | text | etiqueta personalizada para pestaña 3 (Archivos) |

### socios
| columna | tipo | notas |
|---|---:|---|
| id | integer / serial | PK |
| empresa | text | nombre de la empresa |
| titular | text | persona contacto |
| telefono | text | opcional |
| direccion | text | opcional |
| categoria_id | integer | FK -> categorias_socios.id |
| avatar_url | text | URL pública del avatar (opcional) |
| card_color | text | color para la tarjeta del socio |

### transacciones
| columna | tipo | notas |
|---|---:|---|
| id | integer / serial | PK |
| origen_categoria_id | integer | FK -> categorias_socios.id (opcional si se usa socio)
| origen_socio_id | integer | FK -> socios.id (opcional)
| destino_categoria_id | integer | FK -> categorias_socios.id (opcional si se usa socio)
| destino_socio_id | integer | FK -> socios.id (opcional)
| valor | numeric / double | monto de la transacción (guardado como número) |
| fecha | timestamptz | fecha/hora en UTC |
| comentario | text | motivo/observación |
| voucher_url | text | URL pública del comprobante (opcional) |
| voucher_type | text | MIME type del comprobante (opcional) |
| created_at | timestamptz | timestamp de creación |

## relaciones
- `socios.categoria_id` referencia `categorias_socios.id`.
- En `transacciones`, los pares `origen_categoria_id`/`origen_socio_id` y `destino_categoria_id`/`destino_socio_id` representan entidades relacionadas; el frontend valida que el socio pertenezca a la categoría correspondiente y la RPC server-side debe validar esta relación.

**Nota:** Si el esquema en Supabase cambia (nuevas columnas o nombres), actualiza este documento inmediatamente.
