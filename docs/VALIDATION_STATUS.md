# Estado verificable — 28 de septiembre de 2026

## Producción comunicada por el operador

- Producción ejecutó el SQL 12.3.6 de Reset con anterioridad.
- El diagnóstico de producción confirmó el guard anterior con dependencia indebida de la GUC `riggo.execution_run_verified`.
- Se ejecutó el hotfix SQL 12.3.7 y se verificó mediante `pg_get_functiondef`: están presentes `riggo.atomic_reset` y `riggo.atomic_activation`; la dependencia de esa GUC ya no aparece.
- Después del cambio de servidor, el usuario confirmó: «YA SE ARREGLO COMPLETAMENTE». Esto acredita su observación de operación restablecida. No incluye un export de cambios/revisiones ni sustituye pruebas controladas.

## Artefacto de frontend

El paquete 12.3.7 incluido fue construido desde 12.3.6 y pasó las pruebas locales detalladas en `local-test-report-2026-09-27.md`. No hay en los materiales confirmación de **publicación del frontend 12.3.7** ni de canary real Reset → Reactivate en dos dispositivos. Por eso el estado productivo del frontend queda **por confirmar con IT/operaciones**. El fix inmediato de producción funcionó en el frontend 12.3.6 tras la corrección del trigger.

## Evidencia y límites de los tests

- `tests/contracts_1237.py`, `tests/browser_1237.py` y archivos `*-results.txt` provienen del handover de ingeniería.
- Las pruebas de navegador usan Chromium y backend contractual simulado. Cubren el caso v2 con token CURRENT, rechazo de token anterior/faltante, outbox de corrida vieja, Flat Time, Daily, cargas y UX descritos en el reporte.
- No se probó E2E contra Supabase y Cloudflare productivos desde este entorno. Correo, Storage/PDF, RLS y dos dispositivos físicos requieren verificación real.
- El SQL de 12.3.6 incluido es historial de migración; **no repetirlo**. El hotfix 12.3.7 ya está instalado según la verificación compartida; tampoco aplicarlo de nuevo por rutina.

## Integridad del snapshot

`scripts/verify_snapshot.py` compara los SHA-256 de los 31 archivos del `site/` con el manifiesto fijado desde el ZIP Cloudflare-ready. Así se detectan cambios accidentales de los archivos publicables; el manifiesto no certifica que ese ZIP esté desplegado.
