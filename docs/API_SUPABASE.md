# API Supabase - Ecologist-GPT

Este documento resume cómo el frontend interactúa con Supabase en este proyecto.

## Cliente
- `js/services/supabase.js` expone `getClient()` que devuelve un cliente Supabase configurado con `config.js`.
- El cliente se usa directamente desde las vistas para operaciones CRUD y RPC.

## Operaciones comunes
- Leer categorías:
  - `supabase.from('categorias_socios').select('*').order('orden',{ascending:true})`
- Leer socios:
  - `supabase.from('socios').select('*').order('empresa',{ascending:true})`
- Insert / Update / Delete para `categorias_socios` y `socios` utilizando `insert`, `update`, `delete` y `eq`/`match` para filtros.

## RPC
- Hay al menos una función RPC usada por el frontend: `insert_transaccion_and_update_balances`.
  - El frontend llama `supabase.rpc('insert_transaccion_and_update_balances', payload)` donde `payload` incluye `p_origen_categoria_id`, `p_origen_socio_id`, `p_destino_categoria_id`, `p_destino_socio_id`, `p_valor`, `p_fecha`, `p_comentario`, `p_voucher_url`, `p_voucher_type`.
  - La lógica crítica de actualización de balances y validaciones complejas se espera que resida en esta función server-side.

## Storage
- Los uploads (avatares, vouchers) emplean Supabase Storage:
  - Ejemplo: `supabase.storage.from('socios').upload(path, file, { upsert: true })`
  - Para vouchers el frontend usa el bucket `transacciones` por convención; revisar que el bucket exista y tenga políticas públicas/privadas según necesidades.
  - Para obtener URL pública: `supabase.storage.from(bucket).getPublicUrl(path)`.

## Manejo de errores
- Después de cada operación, el código revisa la propiedad `error` en la respuesta (por ejemplo: `if (up.error) return alert(up.error.message);`).
- Para llamadas RPC el error se lanza al catch y se muestra un mensaje en la UI (ej. `errEl.textContent = 'No se pudo crear la transacción: ' + (err.message || String(err));`).

## Validaciones
- Se realizan validaciones en frontend (campos obligatorios, correspondencia socio-categoría) pero la función RPC también debe validar consistencia server-side.
- En general, no confiar sólo en validaciones client-side para integridad de datos.

## Recomendaciones
- Definir políticas RLS y roles en Supabase para proteger endpoints sensibles.
- Si los vouchers son privados, usar signed URLs en vez de publicUrl.

