# RigGO 12.3.7 — stale execution run compatibility

Build: `2026-09-26-1237-A1`  
Base exacta: RigGO `12.3.6-field-audit`.

## Servidor

- Corrige únicamente la semántica de `public.riggo_execution_run_guard_1236()`.
- Una escritura ordinaria con el mismo `_riggoRunId` que la fila autoritativa se permite continuar por las reglas/RPC/CAS ya existentes, tanto desde `riggo_execution_save_v2` como desde v3.
- Si la fila autoritativa tiene `_riggoRunId`, un payload sin token o con token distinto se rechaza con `stale_execution_run`.
- `riggo.atomic_reset` conserva la excepción de Reset.
- `riggo.atomic_activation` conserva la excepción de Activation y rota el run token en servidor.
- No se modifica `riggo_execution_state`, no se hace reset, no se borran datos y no se reejecuta el SQL grande de 12.3.6.
- El hotfix tiene preflight y aborta si faltan los RPC/trigger/contratos atómicos esperados.

## Cliente C4

- Reconoce `stale_execution_run` tanto en `response.error` como en `data.code`/mensaje estructurado.
- Antes de enviar un outbox, si C4 ya sabe que pertenece a otra corrida, vuelve a leer Server Truth y lo descarta.
- Durante hydrate compara de forma independiente el `_riggoRunId` del outbox pendiente contra servidor, incluso cuando el estado local ya coincide con servidor.
- Ante cambio de corrida: servidor gana, se elimina el outbox de esa Move y se reemplaza ejecución; no hay `merge3` entre corridas.
- `completeMove` aplica la misma reconciliación de stale antes de devolver el error.

## Preservación 12.3.6

Los bundles de Operación/Flat Time, Field Integrity, Move Intelligence, CSS y Move Template permanecen byte-a-byte idénticos a 12.3.6. El patch de Field UX conserva la misma lógica de cargas, Daily Siguiente, Sin cambios y Reset; solo cambia identidad/alias/mensaje de versión.
