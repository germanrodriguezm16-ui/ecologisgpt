# Black screen fix

Fecha: 2025-10-10 12:25 UTC

Descripción:
Se agregó un limpiador global `closeAllModalsAndOverlays()` para eliminar overlays residuales que causaban la pantalla negra al cambiar de vistas.

Archivos modificados:
- `js/ui/modals.js` (se añadió la función `closeAllModalsAndOverlays` que cierra `.backdrop.open`, limpia handlers y elimina `.preview-overlay` del DOM)
- `js/app.js` (se importó y llamó la función en `mountView`, `onHashChange` y al inicio de `DOMContentLoaded`)

Resultado esperado:
La aplicación nunca mostrará un overlay persistente al navegar o recargar vistas; los modales y previsualizaciones seguirán funcionando normalmente.

Notas:
Este cambio es defensivo y mantiene la lógica existente de modales y FAB. Si aparecen problemas adicionales, revisar la creación y eliminación de `preview-overlay` en `js/views/transacciones.js`.
