-- =====================================================
-- CORRECCIÓN DE VISTA vw_stock_operativo_counts
-- =====================================================
-- Fecha: 2025-10-13
-- Problema: La vista no considera ajustes manuales del stock_ledger
-- Solución: Modificar la vista para incluir ajustes manuales
-- =====================================================

-- Recrear la vista para incluir ajustes manuales
CREATE OR REPLACE VIEW vw_stock_operativo_counts AS
SELECT 
    p.id, 
    p.sku, 
    p.name, 
    p.supplier_id, 
    p.buy_price, 
    p.sell_price,
    -- Disponible: lotes FIFO + ajustes manuales
    COALESCE(
        SUM(CASE WHEN l.qty_in > l.qty_consumed THEN l.qty_in - l.qty_consumed ELSE 0 END), 0
    ) + COALESCE(
        SUM(CASE 
            WHEN sl.kind = 'adjust' AND sl.ref_type = 'manual_adjust' 
            THEN sl.qty  -- sl.qty ya contiene el delta real (positivo o negativo)
            ELSE 0 
        END), 0
    ) AS disponible,
    0 AS comprometido, -- TODO: Integrar con módulo de pedidos
    0 AS en_reparto,   -- TODO: Integrar con módulo de seguimiento
    0 AS en_devolucion, -- TODO: Integrar con módulo de devoluciones
    -- Total bodega: mismo cálculo que disponible
    COALESCE(
        SUM(CASE WHEN l.qty_in > l.qty_consumed THEN l.qty_in - l.qty_consumed ELSE 0 END), 0
    ) + COALESCE(
        SUM(CASE 
            WHEN sl.kind = 'adjust' AND sl.ref_type = 'manual_adjust' 
            THEN sl.qty  -- sl.qty ya contiene el delta real (positivo o negativo)
            ELSE 0 
        END), 0
    ) AS total_bodega
FROM productos p
LEFT JOIN lotes l ON p.id = l.product_id
LEFT JOIN stock_ledger sl ON p.id = sl.product_id AND sl.kind = 'adjust' AND sl.ref_type = 'manual_adjust'
GROUP BY p.id, p.sku, p.name, p.supplier_id, p.buy_price, p.sell_price;

COMMENT ON VIEW vw_stock_operativo_counts IS 'Contadores de stock por producto incluyendo ajustes manuales (disponible, comprometido, en reparto, en devolución)';
