# TASKS - Estado del proyecto

Este archivo mantiene un registro simple de prioridades y acciones relacionadas con la documentación y desarrollo.

## Por hacer
- Implementar validaciones frontend que muestren una lista de campos obligatorios en el modal de transacción. (Responsable: equipo)
- Añadir placeholders consistentes para selects que no tienen valor seleccionado.
- Revisar bucket `transacciones` en Supabase y ajustar políticas de acceso (público vs. privado).
- Crear pruebas unitarias mínimas para el FSM de `js/utils/currency.js`.
- Evaluar integración de date-time picker (flatpickr) para navegadores sin `showPicker()`.

## En progreso
- Crear y mantener documentación en `/docs` (esta tarea). — En progreso: documentos base creados.

## Completadas
- Implementación de FSM para input de moneda (entrada incremental y formateo). (Completado)
- Modal `Nueva transacción` rediseñado y validaciones básicas añadidas.
- Subida y previsualización de comprobante en modal (objectURL), con revocación en cierre.

---

> Nota: Actualiza este archivo cuando añadas o cambies módulos o esquema de datos. Si no puedes automatizar la actualización, añade una tarea específica aquí: "Actualizar docs/ARCHITECTURE.md" o "Actualizar docs/DATA_MODEL.md".

## Diagnóstico pantalla vacía – beacons

Se añadió instrumentación para detectar y mitigar el problema de "pantalla vacía" (HUD: hijos en #view: 0).

- Beacons añadidos (mensajes en consola y en `#debug`):
	- [BOOT] — arranque del app y DOMContentLoaded
	- [ROUTER] — llamadas a mountView(tab) y conteo de hijos en `#view`
	- [TX] — entrada/salida en funciones públicas de `views/transacciones`
	- [MODAL] — eventos open/close de modales

- Fallback: si `#view` sigue vacío 800 ms después del arranque, se fuerza `mountView('socios')` una vez.

Cómo usar:
- Observa el elemento `#debug` en la esquina superior para ver beacons rápidos.
- Revisa la consola del navegador para los logs `[BOOT]`, `[ROUTER]`, `[TX]`, `[MODAL]`.
- Para forzar montaje manual: `window.__eg_mount('socios')`.
