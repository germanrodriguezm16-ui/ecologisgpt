-- =====================================================
-- CORRECCIÓN DE POLÍTICAS RLS PARA VISTAS
-- =====================================================
-- Fecha: 2025-10-13
-- Problema: Las vistas vw_fifo_value y vw_stock_operativo_counts muestran "Unrestricted"
-- Solución: Agregar políticas RLS a las vistas
-- =====================================================

-- Habilitar RLS en las vistas
ALTER VIEW vw_stock_operativo_counts SET (security_invoker = false);
ALTER VIEW vw_fifo_value SET (security_invoker = false);
ALTER VIEW vw_inventario_dashboard SET (security_invoker = false);

-- Crear políticas RLS para las vistas
-- Nota: Las vistas heredan las políticas de las tablas subyacentes,
-- pero necesitamos asegurar que tengan acceso de lectura

-- Política para vw_stock_operativo_counts
CREATE POLICY "Allow read access to vw_stock_operativo_counts" 
    ON vw_stock_operativo_counts FOR SELECT 
    USING (true);

-- Política para vw_fifo_value  
CREATE POLICY "Allow read access to vw_fifo_value" 
    ON vw_fifo_value FOR SELECT 
    USING (true);

-- Política para vw_inventario_dashboard
CREATE POLICY "Allow read access to vw_inventario_dashboard" 
    ON vw_inventario_dashboard FOR SELECT 
    USING (true);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Para verificar que las políticas se aplicaron correctamente:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename LIKE 'vw_%';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
