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
