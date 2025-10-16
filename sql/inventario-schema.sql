-- =====================================================
-- MÓDULO DE INVENTARIO - SCHEMA COMPLETO
-- =====================================================
-- Fecha creación: 2025-10-13
-- Descripción: Schema completo para gestión de inventario con sistema FIFO
-- =====================================================

-- ===== TABLAS =====

-- Tabla de productos
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

COMMENT ON TABLE productos IS 'Catálogo de productos del inventario';
COMMENT ON COLUMN productos.sku IS 'Código único de producto (Stock Keeping Unit)';
COMMENT ON COLUMN productos.supplier_id IS 'Referencia al proveedor principal del producto';
COMMENT ON COLUMN productos.buy_price IS 'Precio de compra del producto';
COMMENT ON COLUMN productos.sell_price IS 'Precio de venta del producto';

-- Tabla de lotes FIFO
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

COMMENT ON TABLE lotes IS 'Lotes de mercancía para control FIFO';
COMMENT ON COLUMN lotes.qty_in IS 'Cantidad inicial ingresada en el lote';
COMMENT ON COLUMN lotes.unit_cost IS 'Costo unitario del producto en este lote';
COMMENT ON COLUMN lotes.qty_consumed IS 'Cantidad ya consumida del lote (para FIFO)';
COMMENT ON COLUMN lotes.received_at IS 'Fecha de recepción del lote (crítica para orden FIFO)';

-- Tabla de movimientos de stock (ledger)
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

COMMENT ON TABLE stock_ledger IS 'Registro histórico de todos los movimientos de stock';
COMMENT ON COLUMN stock_ledger.kind IS 'Tipo de movimiento: in (entrada), out (salida), adjust (ajuste)';
COMMENT ON COLUMN stock_ledger.ref_type IS 'Tipo de documento de referencia (ej: pedido, devolución, ajuste)';
COMMENT ON COLUMN stock_ledger.ref_id IS 'ID del documento de referencia';
COMMENT ON COLUMN stock_ledger.note IS 'Nota o comentario sobre el movimiento';

-- ===== ÍNDICES =====

CREATE INDEX IF NOT EXISTS idx_productos_sku ON productos(sku);
CREATE INDEX IF NOT EXISTS idx_productos_supplier ON productos(supplier_id);
CREATE INDEX IF NOT EXISTS idx_lotes_product_id ON lotes(product_id);
CREATE INDEX IF NOT EXISTS idx_lotes_received_at ON lotes(received_at);
CREATE INDEX IF NOT EXISTS idx_lotes_supplier ON lotes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_product_id ON stock_ledger(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_kind ON stock_ledger(kind);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_created_at ON stock_ledger(created_at);

-- ===== VISTAS =====

-- Vista para contadores de stock operativo
CREATE OR REPLACE VIEW vw_stock_operativo_counts AS
SELECT 
    p.id, 
    p.sku, 
    p.name, 
    p.supplier_id, 
    p.buy_price, 
    p.sell_price,
    COALESCE(SUM(CASE WHEN l.qty_in > l.qty_consumed THEN l.qty_in - l.qty_consumed ELSE 0 END), 0) AS disponible,
    0 AS comprometido, -- TODO: Integrar con módulo de pedidos
    0 AS en_reparto,   -- TODO: Integrar con módulo de seguimiento
    0 AS en_devolucion, -- TODO: Integrar con módulo de devoluciones
    COALESCE(SUM(CASE WHEN l.qty_in > l.qty_consumed THEN l.qty_in - l.qty_consumed ELSE 0 END), 0) AS total_bodega
FROM productos p
LEFT JOIN lotes l ON p.id = l.product_id
GROUP BY p.id, p.sku, p.name, p.supplier_id, p.buy_price, p.sell_price;

COMMENT ON VIEW vw_stock_operativo_counts IS 'Contadores de stock por producto (disponible, comprometido, en reparto, en devolución)';

-- Vista para valoración FIFO
CREATE OR REPLACE VIEW vw_fifo_value AS
SELECT 
    p.id, 
    p.sku, 
    p.name,
    COALESCE(SUM(CASE WHEN l.qty_in > l.qty_consumed THEN (l.qty_in - l.qty_consumed) * l.unit_cost ELSE 0 END), 0) AS valor_fifo_producto
FROM productos p
LEFT JOIN lotes l ON p.id = l.product_id
GROUP BY p.id, p.sku, p.name;

COMMENT ON VIEW vw_fifo_value IS 'Valoración FIFO total por producto';

-- Vista consolidada para dashboard
CREATE OR REPLACE VIEW vw_inventario_dashboard AS
SELECT 
    COUNT(DISTINCT p.id) as total_productos,
    COUNT(DISTINCT l.id) as total_lotes,
    COALESCE(SUM(CASE WHEN l.qty_in > l.qty_consumed THEN l.qty_in - l.qty_consumed ELSE 0 END), 0) as total_unidades,
    COALESCE(SUM(CASE WHEN l.qty_in > l.qty_consumed THEN (l.qty_in - l.qty_consumed) * l.unit_cost ELSE 0 END), 0) as valor_total_fifo
FROM productos p
LEFT JOIN lotes l ON p.id = l.product_id;

COMMENT ON VIEW vw_inventario_dashboard IS 'Métricas resumidas para el dashboard de inventario';

-- ===== FUNCIONES RPC =====

-- Función para obtener lotes FIFO pendientes
CREATE OR REPLACE FUNCTION fn_fifo_pending(p_product_id UUID)
RETURNS TABLE (
    lote_id UUID, 
    fecha TIMESTAMPTZ, 
    cantidad_disponible INTEGER, 
    proveedor TEXT, 
    precio_unitario NUMERIC, 
    total_lote NUMERIC
) 
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id, 
        l.received_at, 
        (l.qty_in - l.qty_consumed)::INTEGER, 
        COALESCE(s.empresa, 'Sin proveedor')::TEXT, 
        l.unit_cost, 
        ((l.qty_in - l.qty_consumed) * l.unit_cost)::NUMERIC
    FROM lotes l
    LEFT JOIN socios s ON l.supplier_id = s.id
    WHERE l.product_id = p_product_id 
      AND l.qty_in > l.qty_consumed
    ORDER BY l.received_at ASC;
END;
$$;

COMMENT ON FUNCTION fn_fifo_pending IS 'Obtiene los lotes pendientes de un producto ordenados por FIFO';

-- Función para consumir stock FIFO
CREATE OR REPLACE FUNCTION fn_fifo_consume(
    p_product_id UUID, 
    p_qty INTEGER, 
    p_ref_type TEXT, 
    p_ref_id TEXT, 
    p_note TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN, 
    message TEXT, 
    total_consumed INTEGER, 
    total_value NUMERIC
) 
LANGUAGE plpgsql AS $$
DECLARE
    v_remaining_qty INTEGER := p_qty;
    v_total_consumed INTEGER := 0;
    v_total_value NUMERIC := 0;
    v_lote RECORD;
    v_consume_qty INTEGER;
BEGIN
    -- Validar que la cantidad sea positiva
    IF p_qty <= 0 THEN
        RETURN QUERY SELECT 
            false::BOOLEAN, 
            'La cantidad debe ser mayor a 0'::TEXT, 
            0::INTEGER, 
            0::NUMERIC;
        RETURN;
    END IF;

    -- Iterar sobre los lotes disponibles en orden FIFO
    FOR v_lote IN 
        SELECT id, (qty_in - qty_consumed) as disponible, unit_cost
        FROM lotes 
        WHERE product_id = p_product_id 
          AND qty_in > qty_consumed
        ORDER BY received_at ASC
    LOOP
        IF v_remaining_qty <= 0 THEN 
            EXIT; 
        END IF;

        -- Calcular cuánto consumir de este lote
        v_consume_qty := LEAST(v_remaining_qty, v_lote.disponible);
        
        -- Actualizar el lote
        UPDATE lotes 
        SET qty_consumed = qty_consumed + v_consume_qty,
            updated_at = NOW()
        WHERE id = v_lote.id;
        
        -- Registrar el movimiento en el ledger
        INSERT INTO stock_ledger (
            product_id, 
            kind, 
            qty, 
            unit_value, 
            total_value, 
            ref_type, 
            ref_id, 
            note
        )
        VALUES (
            p_product_id, 
            'out', 
            v_consume_qty, 
            v_lote.unit_cost, 
            v_consume_qty * v_lote.unit_cost, 
            p_ref_type, 
            p_ref_id, 
            p_note
        );
        
        -- Acumular totales
        v_total_consumed := v_total_consumed + v_consume_qty;
        v_total_value := v_total_value + (v_consume_qty * v_lote.unit_cost);
        v_remaining_qty := v_remaining_qty - v_consume_qty;
    END LOOP;
    
    -- Retornar resultado
    IF v_remaining_qty > 0 THEN
        RETURN QUERY SELECT 
            false::BOOLEAN, 
            FORMAT('Stock insuficiente. Se consumieron %s de %s solicitados', v_total_consumed, p_qty)::TEXT, 
            v_total_consumed::INTEGER, 
            v_total_value::NUMERIC;
    ELSE
        RETURN QUERY SELECT 
            true::BOOLEAN, 
            FORMAT('Consumo exitoso: %s unidades por $%s', v_total_consumed, v_total_value)::TEXT, 
            v_total_consumed::INTEGER, 
            v_total_value::NUMERIC;
    END IF;
END;
$$;

COMMENT ON FUNCTION fn_fifo_consume IS 'Consume stock de un producto siguiendo el método FIFO y registra el movimiento';

-- Función para registrar entrada de mercancía (nuevo lote)
CREATE OR REPLACE FUNCTION fn_stock_entrada(
    p_product_id UUID,
    p_supplier_id UUID,
    p_qty INTEGER,
    p_unit_cost NUMERIC,
    p_note TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    lote_id UUID
)
LANGUAGE plpgsql AS $$
DECLARE
    v_new_lote_id UUID;
BEGIN
    -- Validaciones
    IF p_qty <= 0 THEN
        RETURN QUERY SELECT 
            false::BOOLEAN,
            'La cantidad debe ser mayor a 0'::TEXT,
            NULL::UUID;
        RETURN;
    END IF;

    IF p_unit_cost < 0 THEN
        RETURN QUERY SELECT 
            false::BOOLEAN,
            'El costo unitario no puede ser negativo'::TEXT,
            NULL::UUID;
        RETURN;
    END IF;

    -- Crear nuevo lote
    INSERT INTO lotes (product_id, supplier_id, qty_in, unit_cost, received_at)
    VALUES (p_product_id, p_supplier_id, p_qty, p_unit_cost, NOW())
    RETURNING id INTO v_new_lote_id;

    -- Registrar movimiento en ledger
    INSERT INTO stock_ledger (
        product_id,
        kind,
        qty,
        unit_value,
        total_value,
        ref_type,
        ref_id,
        note
    )
    VALUES (
        p_product_id,
        'in',
        p_qty,
        p_unit_cost,
        p_qty * p_unit_cost,
        'lote',
        v_new_lote_id::TEXT,
        p_note
    );

    -- Retornar éxito
    RETURN QUERY SELECT 
        true::BOOLEAN,
        FORMAT('Entrada registrada: %s unidades a $%s c/u', p_qty, p_unit_cost)::TEXT,
        v_new_lote_id;
END;
$$;

COMMENT ON FUNCTION fn_stock_entrada IS 'Registra una entrada de mercancía creando un nuevo lote y actualizando el ledger';

-- ===== TRIGGERS =====

-- Trigger para actualizar updated_at en productos
CREATE OR REPLACE FUNCTION update_productos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_productos_updated_at
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION update_productos_timestamp();

-- Trigger para actualizar updated_at en lotes
CREATE OR REPLACE FUNCTION update_lotes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_lotes_updated_at
    BEFORE UPDATE ON lotes
    FOR EACH ROW
    EXECUTE FUNCTION update_lotes_timestamp();

-- ===== ROW LEVEL SECURITY (RLS) =====

-- Habilitar RLS en todas las tablas
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_ledger ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas (TODO: Ajustar para producción con autenticación real)
CREATE POLICY "Allow all operations on productos" 
    ON productos FOR ALL 
    USING (true);

CREATE POLICY "Allow all operations on lotes" 
    ON lotes FOR ALL 
    USING (true);

CREATE POLICY "Allow all operations on stock_ledger" 
    ON stock_ledger FOR ALL 
    USING (true);

-- ===== DATOS DE EJEMPLO (OPCIONAL) =====

-- Descomentar para insertar datos de prueba
/*
-- Insertar productos de ejemplo
INSERT INTO productos (sku, name, supplier_id, buy_price, sell_price) VALUES
('PROD-001', 'Producto A', NULL, 100.00, 150.00),
('PROD-002', 'Producto B', NULL, 200.00, 300.00),
('PROD-003', 'Producto C', NULL, 50.00, 75.00);

-- Insertar lotes de ejemplo
INSERT INTO lotes (product_id, supplier_id, qty_in, unit_cost, received_at) 
SELECT id, NULL, 100, buy_price, NOW() - INTERVAL '30 days'
FROM productos WHERE sku = 'PROD-001';

INSERT INTO lotes (product_id, supplier_id, qty_in, unit_cost, received_at) 
SELECT id, NULL, 50, buy_price, NOW() - INTERVAL '15 days'
FROM productos WHERE sku = 'PROD-001';
*/

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================
