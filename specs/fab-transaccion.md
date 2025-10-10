# Especificación: FAB — Botón flotante de Nueva Transacción

Contexto
- Actualmente el botón “Nueva transacción” está en la esquina superior derecha del módulo de Transacciones, con texto.
- Lo queremos como botón flotante circular (FAB) con un ícono de dinero (sin texto).
- Debe existir tanto en el módulo de Transacciones como en el módulo de Socios.

Objetivo
- Agregar un FAB circular fijo en la esquina inferior derecha, con z-index suficiente, que abra el mismo modal de nueva transacción.
- Ícono: dinero (sin texto). Accesible con aria-label y atajo de teclado (Alt+N).
- Mantener comportamiento del modal sin cambios.

Alcance (SÍ puede tocar)
- Vista/UI de Transacciones y de Socios (montaje del FAB).
- CSS/estilos locales para el FAB.
- Hook o handler que abre el modal de nueva transacción.

Fuera de alcance (NO tocar)
- Lógica interna del modal y validaciones.
- Modelo de datos, Supabase, RLS, rutas.
- Otros módulos (Pedidos, Clientes, etc.).

Plan (3 pasos)
1) Crear componente/estilos del FAB (posición fija, circular, responsive, tema oscuro, aria-label).
2) Integrar el FAB en la vista de Transacciones y enlazarlo al handler actual que abre el modal. Retirar/ocultar el botón textual superior si ya no es necesario.
3) Integrar el FAB en la vista de Socios (pantalla de categorías y listado de socios), reutilizando el mismo handler para abrir el modal de transacción.

Criterios de aceptación
- FAB visible en Transacciones y Socios, posición inferior derecha, no tapa contenido importante en móvil.
- Click/Enter/Space en el FAB abre el modal de nueva transacción.
- Ícono de dinero (sin texto), con tooltip o aria-label “Nueva transacción”.
- El botón textual superior en Transacciones deja de mostrarse (o queda oculto) para evitar duplicidad.
- Sin errores en consola; estilos consistentes con la UI (tema oscuro).

Notas de implementación
- Reutilizar `openTransaccionModal()` y `prepareTransaccionModal()` para abrir y preparar el modal.
- Exponer un pequeño módulo `js/ui/fab.js` que permita inicializar el FAB en cualquier vista.
