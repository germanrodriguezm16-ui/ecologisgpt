# SQL Scripts para Ecologist-GPT

Este directorio contiene scripts SQL para el backend de Supabase, incluyendo funciones RPC, schemas de tablas y vistas.

## 📁 Archivos

### Transacciones
- **`02-rpc-transacciones.sql`** — Función RPC para insertar transacciones y actualizar balances de forma atómica

### Inventario
- **`inventario-schema.sql`** — Schema completo del módulo de inventario:
  - Tablas: `productos`, `lotes`, `stock_ledger`
  - Vistas: `vw_stock_operativo_counts`, `vw_fifo_value`, `vw_inventario_dashboard`
  - Funciones: `fn_fifo_pending`, `fn_fifo_consume`, `fn_stock_entrada`
  - Índices, triggers, RLS

---

## 🚀 Uso: Transacciones

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

---

## 📦 Uso: Inventario

### Instalación

1. **Abrir el editor SQL de Supabase**

2. **Ejecutar el schema completo:**
   - Abrir `inventario-schema.sql`
   - Copiar todo el contenido
   - Pegar en el SQL editor de Supabase
   - Ejecutar el script

3. **Verificar la instalación:**
   ```sql
   -- Verificar tablas
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('productos', 'lotes', 'stock_ledger');

   -- Verificar vistas
   SELECT table_name FROM information_schema.views 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'vw_%';

   -- Verificar funciones
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name LIKE 'fn_%';
   ```

### Uso de Funciones RPC

#### 1. Obtener lotes FIFO pendientes de un producto

```javascript
const { data, error } = await supabase.rpc('fn_fifo_pending', {
  p_product_id: 'uuid-del-producto'
});

if (error) console.error('Error:', error);
else console.log('Lotes FIFO:', data);
```

#### 2. Consumir stock FIFO

```javascript
const { data, error } = await supabase.rpc('fn_fifo_consume', {
  p_product_id: 'uuid-del-producto',
  p_qty: 50,
  p_ref_type: 'pedido',
  p_ref_id: 'uuid-del-pedido',
  p_note: 'Consumo por entrega de pedido #123'
});

if (error) console.error('Error:', error);
else {
  console.log('Éxito:', data[0].success);
  console.log('Mensaje:', data[0].message);
  console.log('Consumido:', data[0].total_consumed);
  console.log('Valor:', data[0].total_value);
}
```

#### 3. Registrar entrada de mercancía

```javascript
const { data, error } = await supabase.rpc('fn_stock_entrada', {
  p_product_id: 'uuid-del-producto',
  p_supplier_id: 'uuid-del-proveedor',
  p_qty: 100,
  p_unit_cost: 50.00,
  p_note: 'Compra lote #456'
});

if (error) console.error('Error:', error);
else {
  console.log('Éxito:', data[0].success);
  console.log('Lote ID:', data[0].lote_id);
}
```

### Consultas desde el Frontend

#### Obtener productos con contadores

```javascript
const { data, error } = await supabase
  .from('productos')
  .select('*, vw_stock_operativo_counts(disponible, comprometido, en_reparto, en_devolucion)')
  .order('name');
```

#### Obtener movimientos de stock

```javascript
const { data, error } = await supabase
  .from('stock_ledger')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(100);
```

### Datos de Ejemplo (Opcional)

Para probar el sistema con datos de ejemplo, descomenta la sección final de `inventario-schema.sql` y ejecuta nuevamente.

---

## 📚 Documentación Adicional

- **Módulo de Inventario:** Ver `docs/INVENTARIO.md`
- **Changelog:** Ver `docs/CHANGELOG_INVENTARIO.md`
- **Sistema de fechas:** Ver `docs/timezone.md`
