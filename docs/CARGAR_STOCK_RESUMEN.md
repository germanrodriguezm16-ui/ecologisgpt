# Flujo "Cargar Stock" - Resumen Ejecutivo

## 🎯 IMPLEMENTADO

✅ **Modal "Cargar Stock"** en Inventario → Movimientos  
✅ **Persistencia** en tablas existentes: `lotes`, `productos`, `stock_ledger`  
✅ **Validaciones** completas (proveedor, productos, cantidades, precios)  
✅ **Refrescar selectivo** (solo productos y movimientos afectados)  
✅ **Zona horaria CO** (UI en Colombia, persistencia en UTC)  
✅ **Manejo de errores RLS/Policy**

---

## 📝 ARCHIVOS MODIFICADOS

### `index.html`
- **Líneas 506-628:** Modal `#modalCargarStock` con estructura visual

### `js/views/inventario.js`
- **Línea 98:** Botón "📦 Cargar stock"
- **Líneas 200-206:** Event listener
- **Líneas 927-1368:** Implementación completa (442 líneas)

**Total:** 2 archivos, ~570 líneas agregadas

---

## 🔄 FLUJO

1. Usuario abre modal → Selecciona proveedor, fecha, forma pago, nota
2. Agrega productos (cantidad, precios) → Resumen actualiza
3. Click "Cargar stock" → Validaciones
4. **Supabase (secuencial):**
   - INSERT `lotes` (1..N)
   - UPDATE `productos.disponible` (agrupado)
   - INSERT `stock_ledger` (1..N)
5. Éxito → Alert + Cerrar + Refrescar

---

## 🧪 QA

### ✅ Probado Manualmente
- [x] Modal abre/cierra (X, Esc, backdrop)
- [x] Proveedores cargados
- [x] Agregar/eliminar productos
- [x] Precios prefill
- [x] Resumen actualiza
- [x] Validaciones funcionan
- [x] Botón deshabilita correctamente
- [x] Persistencia en Supabase
- [x] Refrescar selectivo

### ⚠️ Pendiente
- [ ] Integración con tabla `transacciones` (contabilidad)
- [ ] Toast en lugar de alerts
- [ ] Loading spinner
- [ ] Validación en tiempo real

---

## 📊 MAPPINGS

### `lotes`
```js
{
  product_id: UUID,
  supplier_id: UUID,
  qty_in: int,
  unit_cost: numeric,
  received_at: timestamptz (UTC),
  qty_consumed: 0
}
```

### `productos`
```sql
UPDATE productos
SET disponible = disponible + cantidad
WHERE id = product_id
```

### `stock_ledger`
```js
{
  kind: 'ENTRADA',
  product_id: UUID,
  supplier_id: UUID,
  qty: int,
  unit_cost: numeric,
  total: numeric,
  ref_table: 'lotes',
  ref_id: UUID (lote),
  ref_note: 'CARGA_STOCK',
  created_at: timestamptz (UTC)
}
```

---

## ✅ ESTADO

**Completado y listo para pruebas**  
**Enfoque:** MIN-INVASIVO (sin modificar schema)  
**Documentación:** `docs/CHANGELOG_CARGAR_STOCK.md`

