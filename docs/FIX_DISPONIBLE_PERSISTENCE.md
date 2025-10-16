# Fix: Persistencia de Ajustes Manuales de Disponible

## Problema Identificado

El contador "Disponible" se actualizaba visualmente pero no persistía en la base de datos, causando que:
1. Al abrir el modal nuevamente, aparecía el valor anterior
2. Al refrescar la página, se perdían los ajustes manuales

## Causa Raíz

1. **La tabla `productos` no tiene campo `disponible`** - se calcula dinámicamente
2. **La vista `vw_stock_operativo_counts` solo consideraba lotes FIFO** - no ajustes manuales
3. **Los ajustes se guardaban en `stock_ledger`** pero con valor absoluto en lugar del delta real

## Solución Implementada

### 1. Corrección en `js/views/inventario.js`

**Antes:**
```javascript
qty: Math.abs(delta), // ❌ Valor absoluto
```

**Después:**
```javascript
qty: delta, // ✅ Delta real (positivo o negativo)
```

### 2. Nueva Vista SQL (`sql/fix-stock-operativo-view.sql`)

**Antes:**
```sql
-- Solo consideraba lotes FIFO
COALESCE(SUM(CASE WHEN l.qty_in > l.qty_consumed THEN l.qty_in - l.qty_consumed ELSE 0 END), 0) AS disponible
```

**Después:**
```sql
-- Considera lotes FIFO + ajustes manuales
COALESCE(
    SUM(CASE WHEN l.qty_in > l.qty_consumed THEN l.qty_in - l.qty_consumed ELSE 0 END), 0
) + COALESCE(
    SUM(CASE 
        WHEN sl.kind = 'adjust' AND sl.ref_type = 'manual_adjust' 
        THEN sl.qty  -- Delta real (positivo o negativo)
        ELSE 0 
    END), 0
) AS disponible
```

### 3. Restauración de `refreshProductCards`

**Antes:**
```javascript
// Actualización directa (no persistía)
updateDisponibleDirecto(productId, nuevoDisponible);
```

**Después:**
```javascript
// Usa la vista actualizada (persiste en BD)
await refreshProductCards([productId]);
```

## Instrucciones de Implementación

1. **Ejecutar el SQL:**
   ```sql
   -- Ejecutar en Supabase SQL Editor
   \i sql/fix-stock-operativo-view.sql
   ```

2. **Verificar funcionamiento:**
   - Editar disponible de un producto
   - Cerrar modal y abrir nuevamente → debe mostrar el nuevo valor
   - Refrescar página → debe mantener el nuevo valor

## Resultados Esperados

✅ **Persistencia:** Los ajustes manuales se guardan en `stock_ledger`  
✅ **Cálculo:** La vista considera lotes FIFO + ajustes manuales  
✅ **Consistencia:** El valor persiste después de refrescar la página  
✅ **Integridad:** No se afectan otras funcionalidades existentes  

## Archivos Modificados

- `js/views/inventario.js` - Corrección en inserción de `stock_ledger`
- `sql/fix-stock-operativo-view.sql` - Nueva vista que considera ajustes manuales
- `docs/FIX_DISPONIBLE_PERSISTENCE.md` - Esta documentación
