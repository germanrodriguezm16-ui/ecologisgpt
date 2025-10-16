# Ecologist GPT — Visión y Hoja de Ruta

> **Documento Vivo:** Este documento se actualiza según los acuerdos y el progreso del proyecto.  
> **Última actualización:** 2025-10-12

---

## 🎯 Propósito del Sistema

Sistema de logística y finanzas para e-commerce "La Casa del Motero" (extensible a múltiples tiendas).

**Enfocado en:**
- **Pedidos** - Gestión completa del ciclo de vida
- **Inventarios** - Control físico y valoración FIFO
- **Socios** - Proveedores, transportadoras, bancos/cuentas, empleados, inversionistas, patrimonio
- **Transacciones** - Manuales y automáticas con estado financiero en tiempo real

---

## 1) Modelo Mental del Negocio

- **Pedido** es el evento central. Al crearse, reservará inventario; al **entregarse**, impacta costos (FIFO) y flujos con transportadoras.
- **Socios** agrupan contrapartes del negocio. Cada socio vive dentro de una **categoría** que tiene **rol** de negocio (p. ej. transportadora, proveedor, banco, empleado, inversionista, patrimonio).
- **Transacciones**
  - **Manuales:** dinero real que se mueve (pagos a proveedor, recaudos de transportadora, consignaciones a/desde banco, nómina, etc.).
  - **Automáticas:** se generan por eventos de negocio (entrega de pedido, devolución, carga de stock). No se editan directamente; derivan de sus orígenes.
- **Inventario**
  - **Físico** (bodega hoy): disponible / comprometido / en reparto / en devolución.
  - **FIFO** (valor teórico de mercancía total): lotes por producto; define costo real al entregar.

---

## 2) Entidades y Relaciones Clave

### **Categorías y Socios:**
- `categorias: { id, nombre, **rol**, slug, flags(json) }`
  - **rol:** enum orientado a comportamiento: `transportadora | proveedor | banco | empleado | inversionista | patrimonio | inventario | cliente?` (solo si se decide).
  - **flags:** reglas por categoría (signos por defecto, si admite automáticas, etc.).
- `socios: { id, categoria_id(FK), nombre/empresa, … }`

### **Productos e Inventario:**
- `productos: { id, proveedor_id? (FK socio), sku, nombre, … }`
- `inventario_lotes: { id, producto_id, cantidad_inicial, costo_unitario, restantes }` ← base para FIFO

### **Pedidos:**
- `pedidos: { id, cliente (texto o FK opcional), vendedor, **transportadora_id (FK socio)**, estado[creado|despachado|entregado|devuelto], direccion, ciudad, flete, items[] }`
- `pedido_items: { id, pedido_id, producto_id, cantidad, precio_venta_unit }`

### **Transacciones:**
- `transacciones: { id, tipo[manual|auto], **origen**(?)**, destino**(?)**, socio_id(s) y/o categoria_id(s), monto, fecha, comentario, refs({pedido_id, lote_id, …}) }`

> **Nota sobre clientes:** No vivirán como "socios" por volumen. Se guardan como texto/datos del pedido. Cuando un pago del cliente NO es contraentrega, se genera **transacción automática** a la cuenta/banco correspondiente.

---

## 3) Reglas de Inventario (Resumen Operativo)

### **Al crear un pedido:**
- Mover de **disponible → comprometido** (por cada item).

### **Al despachar:**
- **comprometido → en reparto**.

### **Al entregar:**
- **en reparto → descuenta FIFO** (resta de lotes; se fija costo real del pedido).
- **Transacción automática** contra **transportadora**:
  - Si es contraentrega: transportadora nos debe (recaudo - flete).
  - Si NO es contraentrega: registrar recaudo a banco/cuenta (auto).

### **Al marcar devuelto:**
- **en reparto → en devolución**; al recibir la devolución: **en devolución → disponible** (no impacta FIFO hasta entrega).

### **Carga de stock (compra a proveedor):**
- Crea **lotes FIFO**, y opcionalmente **transacción manual** al proveedor (pago) o **cuenta por pagar** si no pagado.

---

## 4) Transacciones (Signos y Flujos)

### **Tipos:**
- **Manual:** creada por el usuario; siempre impacta saldos.
- **Automática:** generada por eventos (entrega, carga/ajuste inventario, devolución).

### **Signos:**
Definidos por **rol** y contexto (origen/destino). Ejemplos típicos:
- Pagamos a **proveedor** → salida de caja/banco (–), baja de deuda proveedor.
- Transportadora **entrega** pedido **contraentrega** → transportadora **debe** (+ a cobrar); cuando paga → entra a banco (+) y baja su cuenta.
- Compra de stock → aumenta **inventario FIFO** (+ teórico); si se paga, baja banco (–) y baja deuda proveedor.

### **Regla importante:**
- **No duplicar:** Una automática no se edita; se **regenera** si cambia el origen (p. ej., se reabre un pedido).

---

## 5) Estado Financiero (Cómo se Calcula)

### **Componentes:**
- **Activos:** bancos/cuentas, transportadoras (saldo a favor), inventario FIFO, patrimonio.
- **Pasivos:** proveedores (por pagar), empleados (nómina pendiente), inversionistas.

### **Cálculos:**
- **Saldo por categoría** = sumatoria de transacciones (manuales + automáticas) asociadas a socios de esa categoría (y reglas de signo).
- **Estado general** = agregación de saldos por rol (con signo adecuado).

### **Balance visible:**
- En **cada socio:** balance y lista de transacciones (manuales y automáticas relevantes).
- En **cada categoría:** suma de balances de sus socios.
- **Global:** suma de categorías.

---

## 6) Flujo de Pedidos (Eventos que Disparan Lógica)

1. **Crear:** reserva inventario (movimientos de stock físico).
2. **Despachar:** actualiza a "en reparto".
3. **Entregar:** descuenta FIFO, crea automáticas de costo y relación con transportadora/bancos.
4. **Devolver:** gestiona "en devolución" y reingreso a disponible cuando corresponda.
5. **Eliminar pedido:** elimina/ajusta todas las **automáticas** derivadas (las manuales permanecen si fueron movimientos reales).

---

## 7) UI (Módulos Planificados)

### **Socios** ✅ **(Implementado parcialmente)**
- ✅ Vista de categorías (cards con balance).
- ✅ Lista de socios por categoría (cards con balance).
- ✅ Detalle del socio: tabs (Transacciones, Datos, Archivos/Notas).
- ✅ FAB "Nueva transacción" (manual).

### **Transacciones** ⚠️ **(Parcialmente implementado)**
- ⚠️ Lista cronológica (manuales + automáticas con badges); filtros.
- ⚠️ Modal crear transacción manual (fecha, origen/destino, valor, comentario, voucher).
- ❌ CRUD completo de transacciones manuales.
- ❌ Visualización de automáticas con badges.

### **Inventario** ❌ **(Por implementar)**
- ❌ Productos (card con disponible/comprometido/en reparto/en devolución).
- ❌ Lotes FIFO por producto.
- ❌ Movimientos de stock físico (timeline).
- ❌ Reportes de costo por entrega (link a pedidos).

### **Pedidos** ❌ **(Por implementar)**
- ❌ Crear/editar pedido (cliente, items, transportadora, dirección/ciudad).
- ❌ Cambiar estados con automatismos.
- ❌ Vista de pedidos por estado.
- ❌ Integración con inventario FIFO.

### **Dashboard** ❌ **(Por implementar)**
- ❌ Estado financiero agregado por rol.
- ❌ Alertas (vencidos, devoluciones, etc.).
- ❌ Gráficas de balance.
- ❌ KPIs clave.

---

## 8) Consideraciones Técnicas

### **Stack:**
- **Supabase** como BaaS (Postgres + RLS + Storage).
- **Eventos:** Triggers/funciones (o lógica en servidor/edge) para generar/actualizar **automáticas** al cambiar estados de pedidos, cargas de stock, etc.

### **Consistencia:**
- Si cambia un pedido, se **recalcula** lo derivado (automáticas + stock físico + costos FIFO).

### **Performance:**
- Vistas/materializadas para saldos por socio/categoría.
- Invalidación al cambiar transacciones relevantes.
- **Cache implementado** ✅ para queries frecuentes.

### **Idempotencia:**
- Generadores de automáticas deben ser idempotentes (no duplicar).

### **Auditoría:**
- Transacciones guardan refs (pedido_id, lote_id, etc.) para trazabilidad.

---

## 9) Documentación y Pruebas

### **Docs:**
- Mantener este documento como visión viva (`docs/VISION_Y_ROADMAP.md`).
- Specs por módulo (socios, pedidos, inventario, transacciones) en `docs/specs/*.md`.

### **Testing:**
- **Unit:** signos por rol, cálculos FIFO, generadores automáticos.
- **Integración:** flujo completo de pedido (crear→despachar→entregar→devolver).
- **E2E mínimo:** crear transacción manual y ver reflejo en saldos.

---

## 10) Cambios Futuros (Sujetos a Iteración)

- Inclusión opcional de **clientes** como socios (si unificamos CRM).
- Reglas por **flags** en categorías (signos por defecto, si admite automáticas, etc.).
- Tarifas/fletes por ciudad con tablas dedicadas.
- Multi-tienda: aislar datos por `store_id`.

---

## 📊 Estado Actual de Implementación

*Actualizado: 2025-10-12*

### **✅ Completado:**
- ✅ Infraestructura de desarrollo (testing, linting, hot reload, etc.)
- ✅ Módulo de categorías de socios (CRUD completo)
- ✅ Módulo de socios (CRUD completo)
- ✅ Sistema de cache para performance
- ✅ Sistema de documentación inteligente

### **⚠️ En progreso:**
- ⚠️ Transacciones manuales (lectura implementada, falta edición/eliminación)

### **❌ Pendiente:**
- ❌ Productos
- ❌ Inventario FIFO
- ❌ Pedidos
- ❌ Transacciones automáticas
- ❌ Dashboard financiero

---

## 🗺️ Hoja de Ruta Propuesta

### **Fase 1: Fundamentos** *(Actual - En progreso)*
- [x] Infraestructura de desarrollo
- [x] Categorías y socios
- [ ] Transacciones manuales (CRUD completo)
- [ ] Sistema de roles básico

### **Fase 2: Productos e Inventario Básico**
- [ ] Modelo de productos
- [ ] Inventario físico simple (sin FIFO inicialmente)
- [ ] Carga de stock básica
- [ ] UI de productos

### **Fase 3: Pedidos Simples**
- [ ] Modelo de pedidos
- [ ] UI de crear/editar pedido
- [ ] Estados básicos (creado, entregado)
- [ ] Reserva de inventario

### **Fase 4: FIFO y Costos**
- [ ] Lotes FIFO
- [ ] Descuento FIFO en entregas
- [ ] Cálculo de costos reales
- [ ] Reportes de márgenes

### **Fase 5: Transacciones Automáticas**
- [ ] Generadores de automáticas por eventos
- [ ] Integración con pedidos
- [ ] Integración con transportadoras
- [ ] Recálculo automático

### **Fase 6: Dashboard Financiero**
- [ ] Estado por rol
- [ ] Gráficas de balance
- [ ] KPIs clave
- [ ] Alertas y notificaciones

---

## 📝 Acuerdos y Decisiones

### **Decisiones tomadas:**
- ✅ Usar Supabase como backend
- ✅ SPA con Vanilla JavaScript (sin frameworks pesados)
- ✅ Cache de 5 minutos para queries frecuentes
- ✅ Clientes como texto en pedidos (no como socios)
- ✅ Automatización máxima en desarrollo

### **Por definir:**
- ⚪ ¿Incluir clientes como socios en el futuro?
- ⚪ ¿Implementar multi-tienda desde el inicio?
- ⚪ ¿Tarifas de flete por ciudad?
- ⚪ ¿Nivel de permisos por usuario?

---

## 🎯 Próximos Pasos Inmediatos

### **Opción recomendada: Evolución incremental**

1. **Completar transacciones manuales** (2-4 horas)
   - CRUD completo
   - Validaciones robustas
   - Tests de integración

2. **Agregar productos básicos** (4-6 horas)
   - Modelo en Supabase
   - UI de productos
   - Sin inventario complejo inicialmente

3. **Pedidos simples** (8-10 horas)
   - Sin FIFO inicialmente
   - Estados básicos
   - Integración con productos

4. **Ir complejizando según necesidad**
   - Agregar FIFO cuando lo necesites
   - Agregar automáticas cuando lo necesites
   - Evitar sobre-ingeniería

---

## 📌 Notas Importantes

- Este documento es **vivo** y se actualiza con cada decisión importante.
- No todo debe implementarse de inmediato; priorizamos por valor de negocio.
- La infraestructura actual ya soporta el crecimiento planificado.
- Cada módulo nuevo tendrá tests automáticos.

---

*Documento de visión - Actualización continua*  
*Para ver estado actual de implementación: `docs/README.md`*  
*Para ver guía completa del sistema: `docs/SYSTEM_COMPLETE_GUIDE.md`*

