# SQL para Transacciones

Este directorio contiene SQL útil para añadir la función RPC que inserta una transacción y actualiza balances de forma atómica.

Archivo principal:
- `02-rpc-transacciones.sql` — crea la función `insert_transaccion_and_update_balances`, agrega columnas opcionales y otorga permisos.

Pasos para ejecutar en Supabase (SQL editor)

1. Hacer backup (opcional pero recomendado)

   - En el SQL editor de Supabase, puedes ejecutar:
     ```sql
     CREATE TABLE public.transacciones_backup AS TABLE public.transacciones WITH DATA;
     ```

2. Abrir `02-rpc-transacciones.sql`, copiar todo su contenido y pegarlo en el SQL editor.

3. Ejecutar el script.

4. Probar la función desde el SQL editor (reemplaza los UUIDs por valores reales):

```sql
select * from public.insert_transaccion_and_update_balances(
  '00000000-0000-0000-0000-000000000001'::uuid, -- origen_categoria_id
  '00000000-0000-0000-0000-000000000002'::uuid, -- origen_socio_id
  '00000000-0000-0000-0000-000000000003'::uuid, -- destino_categoria_id
  '00000000-0000-0000-0000-000000000004'::uuid, -- destino_socio_id
  150000.00,
  now(),
  'Pago por servicio X',
  null,
  null
);
```

Si la función se ejecuta correctamente, verás la fila retornada y los balances de los socios deberían actualizarse.

Llamada desde frontend (supabase-js)

Ejemplo con supabase-js:

```javascript
const { data, error } = await supabase.rpc('insert_transaccion_and_update_balances', {
  p_origen_categoria_id: '00000000-0000-0000-0000-000000000001',
  p_origen_socio_id: '00000000-0000-0000-0000-000000000002',
  p_destino_categoria_id: '00000000-0000-0000-0000-000000000003',
  p_destino_socio_id: '00000000-0000-0000-0000-000000000004',
  p_valor: 150000.00,
  p_fecha: new Date().toISOString(),
  p_comentario: 'Pago por servicio X',
  p_voucher_url: null,
  p_voucher_type: null
});
if (error) console.error('RPC error', error);
else console.log('Transacción creada', data);
```

Notas de seguridad

- La función se creó con `security definer` para que se ejecute con los permisos del owner. Aun así, revisa las políticas RLS en `transacciones` y `socios` para evitar bloqueos o accesos no deseados.
- Si tu columna `id` o `balance` usa otros tipos (por ejemplo integer), modifica la firma de la función en `02-rpc-transacciones.sql` antes de ejecutar.

Si quieres, ejecuto el SQL por ti (no recomendable por seguridad) o te guío paso a paso mientras lo pegas en el SQL editor.
