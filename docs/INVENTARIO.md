# Módulo de Inventario en Ecologist-GPT

Este documento describe la implementación y el funcionamiento del módulo de Inventario en Ecologist-GPT, incluyendo su estructura UI, lógica de negocio y contratos de datos con Supabase.

## 🎯 Objetivo

Proveer una gestión completa del inventario, incluyendo el seguimiento de stock operativo, el registro de movimientos (entradas/salidas) y un sistema de valoración FIFO.

## ⚙️ Estructura UI

El módulo de Inventario se organiza en tres pestañas principales:

### 1. **Stock Operativo**
- Muestra un listado vertical de tarjetas de productos.
- Cada tarjeta compacta incluye: Nombre, SKU, contadores de stock (Disponible, Comprometido, En reparto, En devolución) y el "Total bodega".
- Acciones por tarjeta: editar, eliminar, y un botón para desplegar/contraer detalles.
- La vista extendida (debajo de la tarjeta) muestra: Proveedor, Precio de compra/venta, Utilidad bruta, y una tabla de lotes FIFO activos.
- Botón flotante `+ Crear producto` para añadir nuevos productos.
- Buscador por nombre o SKU.

### 2. **Movimientos**
- Presenta una tabla con el historial de todos los movimientos de stock (entradas por lote, salidas por consumo, ajustes).
- Columnas: Fecha, Concepto (origen/destino + comentario), Cantidad, Valor Unitario, Total.
- Filtros por producto y rango de fechas.
- Muestra un "Valor Total Mercancía FIFO" y un "Balance Total" (placeholder).

### 3. **Análisis (Editable)**
- Pestaña con contenido placeholder (`Próximamente`).
- El título de esta pestaña es configurable desde `config/app.json` (ej. `inventory.tab3Title`).

### Persistencia de Pestañas

La pestaña activa se guarda en `localStorage` bajo la clave `inventoryTab` para mantener la selección del usuario entre sesiones.

## 🛠️ Lógica JavaScript (`js/views/inventario.js`)

### Funciones Principales

- **`initInventario(containerEl)`:** Función principal que monta la UI del módulo, inicializa event listeners para pestañas, FAB y filtros. Carga los proveedores para el modal de producto.

- **`switchTab(tabName)`:** Controla la visibilidad de las pestañas y carga los datos correspondientes (`loadProductos`, `loadMovimientos`).

- **`loadProductos()`:** Fetches productos y sus contadores de stock (`vw_stock_operativo_counts`) desde Supabase. Maneja estados de carga y error.

- **`renderProductos(productosList)`:** Renderiza las tarjetas de productos, aplicando filtros de búsqueda.

- **`createProductoCard(producto)`:** Genera el HTML para una tarjeta de producto, incluyendo la vista compacta y la estructura para la vista extendida. Agrega event listeners a los botones de acción.

- **`loadMovimientos()`:** Fetches el historial de `stock_ledger` desde Supabase.

- **`renderMovimientos(movimientosList)`:** Renderiza la tabla de movimientos.

- **`buildMovimientoConcepto(mov, producto)`:** Crea el elemento visual del concepto para un movimiento, incluyendo iconos y badges.

- **`openProductoModal()`:** Abre el modal para crear/editar productos.

- **`loadProveedores()` / `updateProveedorSelects()`:** Carga y actualiza los selects de proveedores en el modal de producto. Primero busca la categoría "Proveedores" por nombre para obtener su UUID, luego filtra los socios por ese UUID.

- **`handleProductoFormSubmit(e)`:** Maneja el envío del formulario de producto (actualmente con lógica local, `TODO` para Supabase).

- **`editProducto(id)` / `deleteProducto(id)`:** Funciones placeholder para acciones de producto.

- **`toggleProductoDetails(id)`:** Expande/contrae la vista de detalles de un producto y carga los lotes FIFO de forma perezosa.

- **`loadLotesFIFO(productId)`:** Llama a la función RPC `fn_fifo_pending` de Supabase para obtener y renderizar los lotes activos de un producto.

### Event Listeners

- **Tabs:** Listener en los botones de pestañas para cambiar entre vistas.
- **FAB:** Listener para abrir el modal de crear producto. También responde a `Ctrl+N`.
- **Búsqueda:** Listener en el input de búsqueda para filtrar productos en tiempo real.
- **Refresh:** Botón para recargar la lista de productos.
- **Filtros:** Listeners en los selectores y inputs de fecha para filtrar movimientos.
- **Modal Producto:** Listeners para cancelar y enviar el formulario.
- **Botones de Tarjeta:** Event listeners agregados dinámicamente a cada tarjeta para editar, eliminar y expandir detalles.

## 🗄️ Contrato de Datos (Supabase)

### Tablas

#### `productos`
```sql
CREATE TABLE IF NOT EXISTS productos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    supplier_id UUID REFERENCES socios(id) ON DELETE SET NULL,
    buy_price NUMERIC(10,2) NOT NULL CHECK (buy_price >= 0),
    sell_price NUMERIC(10,2) NOT NULL CHECK (sell_price >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `lotes`
```sql
CREATE TABLE IF NOT EXISTS lotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES socios(id) ON DELETE SET NULL,
    qty_in INTEGER NOT NULL CHECK (qty_in > 0),
    unit_cost NUMERIC(10,2) NOT NULL CHECK (unit_cost >= 0),
    qty_consumed INTEGER DEFAULT 0 CHECK (qty_consumed >= 0),
    received_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_qty_consumed CHECK (qty_consumed <= qty_in)
);
```

#### `stock_ledger`
```sql
CREATE TABLE IF NOT EXISTS stock_ledger (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('in', 'out', 'adjust')),
    qty INTEGER NOT NULL CHECK (qty > 0),
    unit_value NUMERIC(10,2) NOT NULL CHECK (unit_value >= 0),
    total_value NUMERIC(10,2) NOT NULL CHECK (total_value >= 0),
    ref_type TEXT,
    ref_id TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Índices

```sql
CREATE INDEX IF NOT EXISTS idx_productos_sku ON productos(sku);
CREATE INDEX IF NOT EXISTS idx_lotes_product_id ON lotes(product_id);
CREATE INDEX IF NOT EXISTS idx_lotes_received_at ON lotes(received_at);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_product_id ON stock_ledger(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_kind ON stock_ledger(kind);
```

### Vistas

#### `vw_stock_operativo_counts`
Calcula `disponible`, `comprometido`, `en_reparto`, `en_devolucion` y `total_bodega` por producto.

```sql
CREATE OR REPLACE VIEW vw_stock_operativo_counts AS
SELECT 
    p.id, p.sku, p.name, p.supplier_id, p.buy_price, p.sell_price,
    COALESCE(SUM(CASE WHEN l.qty_in > l.qty_consumed THEN l.qty_in - l.qty_consumed ELSE 0 END), 0) AS disponible,
    0 AS comprometido, 
    0 AS en_reparto, 
    0 AS en_devolucion,
    COALESCE(SUM(CASE WHEN l.qty_in > l.qty_consumed THEN l.qty_in - l.qty_consumed ELSE 0 END), 0) AS total_bodega
FROM productos p
LEFT JOIN lotes l ON p.id = l.product_id
GROUP BY p.id, p.sku, p.name, p.supplier_id, p.buy_price, p.sell_price;
```

**Nota:** `comprometido`, `en_reparto`, `en_devolucion` son `0` por ahora (TODO para integración con Pedidos/Seguimiento).

#### `vw_fifo_value`
Calcula el `valor_fifo_producto` total de la mercancía activa por producto.

```sql
CREATE OR REPLACE VIEW vw_fifo_value AS
SELECT 
    p.id, p.sku, p.name,
    COALESCE(SUM(CASE WHEN l.qty_in > l.qty_consumed THEN (l.qty_in - l.qty_consumed) * l.unit_cost ELSE 0 END), 0) AS valor_fifo_producto
FROM productos p
LEFT JOIN lotes l ON p.id = l.product_id
GROUP BY p.id, p.sku, p.name;
```

### Funciones RPC

#### `fn_fifo_pending(p_product_id UUID)`
Retorna los lotes de un producto con cantidad disponible (`qty_in - qty_consumed`), ordenados por `received_at` (FIFO).

**Retorna:**
- `lote_id` (UUID)
- `fecha` (TIMESTAMPTZ)
- `cantidad_disponible` (INTEGER)
- `proveedor` (TEXT)
- `precio_unitario` (NUMERIC)
- `total_lote` (NUMERIC)

```sql
CREATE OR REPLACE FUNCTION fn_fifo_pending(p_product_id UUID)
RETURNS TABLE (lote_id UUID, fecha TIMESTAMPTZ, cantidad_disponible INTEGER, proveedor TEXT, precio_unitario NUMERIC, total_lote NUMERIC) 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, l.received_at, (l.qty_in - l.qty_consumed), COALESCE(s.empresa, 'Sin proveedor'), l.unit_cost, (l.qty_in - l.qty_consumed) * l.unit_cost
    FROM lotes l
    LEFT JOIN socios s ON l.supplier_id = s.id
    WHERE l.product_id = p_product_id AND l.qty_in > l.qty_consumed
    ORDER BY l.received_at ASC;
END;
$$;
```

#### `fn_fifo_consume(p_product_id UUID, p_qty INTEGER, p_ref_type TEXT, p_ref_id TEXT, p_note TEXT DEFAULT NULL)`
Consume `p_qty` unidades de un producto siguiendo la lógica FIFO.
- Actualiza `qty_consumed` en la tabla `lotes`.
- Registra un movimiento `kind 'out'` en `stock_ledger`.

**Retorna:**
- `success` (BOOLEAN)
- `message` (TEXT)
- `total_consumed` (INTEGER)
- `total_value` (NUMERIC)

```sql
CREATE OR REPLACE FUNCTION fn_fifo_consume(p_product_id UUID, p_qty INTEGER, p_ref_type TEXT, p_ref_id TEXT, p_note TEXT DEFAULT NULL)
RETURNS TABLE (success BOOLEAN, message TEXT, total_consumed INTEGER, total_value NUMERIC) 
LANGUAGE plpgsql AS $$
DECLARE
    v_remaining_qty INTEGER := p_qty;
    v_total_consumed INTEGER := 0;
    v_total_value NUMERIC := 0;
    v_lote RECORD;
    v_consume_qty INTEGER;
BEGIN
    FOR v_lote IN 
        SELECT id, (qty_in - qty_consumed) as disponible, unit_cost
        FROM lotes 
        WHERE product_id = p_product_id AND qty_in > qty_consumed
        ORDER BY received_at ASC
    LOOP
        IF v_remaining_qty <= 0 THEN EXIT; END IF;
        v_consume_qty := LEAST(v_remaining_qty, v_lote.disponible);
        UPDATE lotes SET qty_consumed = qty_consumed + v_consume_qty WHERE id = v_lote.id;
        INSERT INTO stock_ledger (product_id, kind, qty, unit_value, total_value, ref_type, ref_id, note)
        VALUES (p_product_id, 'out', v_consume_qty, v_lote.unit_cost, v_consume_qty * v_lote.unit_cost, p_ref_type, p_ref_id, p_note);
        v_total_consumed := v_total_consumed + v_consume_qty;
        v_total_value := v_total_value + (v_consume_qty * v_lote.unit_cost);
        v_remaining_qty := v_remaining_qty - v_consume_qty;
    END LOOP;
    
    IF v_remaining_qty > 0 THEN
        RETURN QUERY SELECT false, FORMAT('Stock insuficiente. Se consumieron %s de %s solicitados', v_total_consumed, p_qty), v_total_consumed, v_total_value;
    ELSE
        RETURN QUERY SELECT true, FORMAT('Consumo exitoso: %s unidades por $%s', v_total_consumed, v_total_value), v_total_consumed, v_total_value;
    END IF;
END;
$$;
```

### Row Level Security (RLS)

Políticas RLS básicas para `productos`, `lotes` y `stock_ledger` que permiten todas las operaciones (`FOR ALL USING (true)`).

```sql
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on productos" ON productos FOR ALL USING (true);
CREATE POLICY "Allow all operations on lotes" ON lotes FOR ALL USING (true);
CREATE POLICY "Allow all operations on stock_ledger" ON stock_ledger FOR ALL USING (true);
```

**⚠️ Nota:** Esto deberá ser ajustado para una seguridad más granular en producción.

## 🎨 UX/Estilo

### Tarjetas de Producto

- **Diseño Compacto:** 2 filas/2 columnas en móvil; 1 fila con badges alineados a la derecha en desktop.
- **Badges de Estado:**
  - Tamaño: S
  - Colores por status:
    - `disponible` = verde (`badge--success`)
    - `comprometido` = amarillo (`badge--warning`)
    - `en_reparto` = azul (`badge--info`)
    - `en_devolucion` = rojo (`badge--danger`)

### Vista Expandida

- **Tabla de Lotes:** Header sticky, filas zebra, total en la parte inferior.
- **Lazy Loading:** Los lotes FIFO se cargan solo cuando se expande la tarjeta.

### FAB (Floating Action Button)

- **Posición:** Parte inferior derecha
- **Acción:** Abre modal de crear producto
- **Tecla Rápida:** `Ctrl+N`
- **Color:** Naranja primario LCDM (`var(--lcdm-primary)`)

### Accesibilidad

- `aria-expanded` en el botón de expandir detalles
- `aria-pressed` en las pestañas
- Focus visible en todos los elementos interactivos

## ✅ Validaciones

- **SKU único:** Validación en servidor + UI
- **Precios numéricos:** `> 0`
- **Lotes `qty_in`:** `> 0`
- **Eliminación de productos:** Bloqueada si existen lotes o registros en ledger

## 🧪 Pruebas Manuales

1. **Crear productos/lotes:** Verificar que se guardan correctamente
2. **Revisar contadores:** Verificar que los badges muestran los valores correctos
3. **Consumir FIFO:** Probar la función `fn_fifo_consume`
4. **Ver movimientos:** Verificar que se registran en el historial
5. **Cambiar pestañas:** Verificar persistencia en localStorage

## 📝 Organización del Código

- **Módulos:** El código está organizado en funciones modulares y reutilizables
- **Prefijo `inv_`:** Para funciones específicas del inventario (si aplica)
- **TODOs:** Marcados donde se necesita trabajo adicional
- **Comentarios:** Documentación JSDoc en funciones principales

## ⚠️ Deuda Técnica / TODOs

### Alta Prioridad
1. **Integración de `fn_fifo_consume` con el módulo de Pedidos:** Cuando se confirme una entrega, debe consumir stock automáticamente.
2. **Implementación completa de crear/editar productos:** Actualmente solo guarda localmente, falta integración con Supabase.
3. **Implementación de eliminación de productos:** Agregar validación de lotes/ledger existentes.

### Media Prioridad
4. **Contadores avanzados:** Implementar lógica real para `comprometido`, `en_reparto`, `en_devolucion` (actualmente en `0`).
5. **Desarrollo completo de la pestaña "Movimientos":**
   - Filtros avanzados funcionales
   - Balance total calculado
   - Exportación de datos
6. **Desarrollo completo de la pestaña "Análisis":**
   - Reportes de ventas
   - Optimización de stock
   - Alertas personalizadas

### Baja Prioridad
7. **Validaciones de formulario más robustas:** SKU único en Supabase (actualmente solo en cliente).
8. **Manejo de errores y toasts:** Feedback visual para el usuario en todas las operaciones.
9. **Optimización de rendimiento:** Paginación para listados grandes.
10. **Modo oscuro:** Adaptar estilos para tema oscuro.

## 🐛 Errores Corregidos (Historial)

### 2025-10-13
1. **Error `appendChild`:** Números pasados directamente a `el()` en lugar de strings → Convertidos a `String()`.
2. **Error `CSSStyleDeclaration`:** Atributo `style` como string → Cambiado a objeto `{ display: 'none' }`.
3. **Error `children.forEach`:** Strings pasados sin array en `el()` → Envueltos en arrays `[string]`.
4. **Error `onclick`:** Atributos onclick con strings de código → Cambiados a event listeners con `addEventListener`.
5. **Error UUID proveedores:** Query con string `'proveedores'` en lugar de UUID → Implementada consulta en dos pasos para obtener UUID real de la categoría.

## 📚 Referencias

- **Sistema de fechas:** Ver `docs/timezone.md` para el formato global de fechas.
- **Sistema visual:** Ver `assets/visual-design.css` para los estilos del tema LCDM.
- **Utilidades DOM:** Ver `js/utils/dom.js` para la función `el()` y otros helpers.

---

**Última actualización:** 2025-10-13  
**Autor:** AI Assistant  
**Estado:** ✅ Funcional con TODOs pendientes
