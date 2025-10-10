# Prompt Guide - Ecologist-GPT

Este archivo contiene reglas y ejemplos para generar prompts que ayuden al desarrollo y mantenimiento del proyecto de forma segura y coherente.

## Regla base de trabajo
- Ser claro y conciso: describir objetivo, archivos a cambiar y criterios de aceptación.
- No exponer secretos ni credenciales en prompts.
- Priorizar cambios pequeños y verificables (unitarios) antes de grandes refactors.
- Siempre indicar el archivo(s) exacto(s) a editar y el comportamiento esperado en términos de inputs/outputs.

## Seguridad y privacidad
- Evitar prompts que pidan o incluyan claves API, tokens o secretos.
- Si se necesita una variable de entorno, usar placeholders (ej. `SUPABASE_URL`, `SUPABASE_KEY`) y documentar en `.env.example`.

## Estilo de prompts para tareas comunes
- Corrección de bugs:
  - "Arregla el bug en `js/views/transacciones.js` donde la miniatura del comprobante no aparece; usa objectURL en lugar de FileReader y revoca el URL al cerrar la modal. Criterios: la miniatura debe aparecer, 'ojito' abre preview y revoca al borrar."
- Añadir feature:
  - "Agrega soporte para previsualizar PDFs en el modal `Nueva transacción`. Mostrar embed en overlay; si no disponible, abrir en nueva pestaña."
- Refactor:
  - "Extrae la lógica de preparación del modal de transacciones a `prepareTransaccionModal()` en `js/views/transacciones.js`, y actualiza `openTransaccionesView()` para abrir la modal y llamar a la preparación."

## Ejemplos de prompts pequeños
- "Formatea el input de `valor` para que admita separador de miles en la notación colombiana y mantenga siempre 2 decimales al perder focus." 
- "Agrega mensajes inline cuando el usuario intenta subir un archivo mayor a 5 MB al adjuntar comprobante."

## Reglas de estilo para prompts
- Indicar lenguaje (ES/EN) si importa.
- Incluir criterios de aceptación claros y pasos de verificación.
- Evitar lenguaje ambiguo; preferir pasos concretos.

