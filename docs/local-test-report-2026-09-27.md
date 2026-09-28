# RigGO 12.3.7 — Test report

Build: `2026-09-26-1237-A1`  
Fecha de build/auditoría: 2026-09-26/27  
Base: ZIP de handover RigGO 12.3.6, verificado contra `SHA256SUMS.txt`.

## 1. Diagnóstico y causa raíz

La hipótesis del handover queda sustentada por los archivos exactos:

- El guard instalado por el SQL 12.3.6 no solo compara `_riggoRunId`; también exige que la GUC de sesión `riggo.execution_run_verified` coincida con el run vigente.
- `riggo_execution_save_v3` establece esa GUC.
- `riggo_execution_save_v2` no la establece.
- El bundle real 12.3.4 usa `riggo_execution_save_v2` y `sanitizeExec()` no elimina `_riggoRunId`.

Consecuencia: un cliente v2 puede enviar correctamente el token CURRENT y ser rechazado de todos modos por el guard 12.3.6. El candidate del handover elimina correctamente esa dependencia; el hotfix final conserva esa idea y añade preflight fail-closed.

`sql/01_STALE_RUN_DIAGNOSTIC_READONLY.sql` fue auditado y confirmado como read-only. **No se ejecutó contra producción desde este entorno** porque no existe una sesión SQL/credencial de Supabase disponible aquí. Por tanto, no se afirma haber validado el estado instalado de producción ni se inventa una salida del diagnóstico.

## 2. Validación estática/contractual

Resultado: **PASS**.

Se validó:

- Diagnóstico 01 sin DML/DDL/escrituras.
- Causa raíz GUC v2/v3 contra contratos reales.
- Bundle 12.3.4 real: flush v2 + conservación de `_riggoRunId`.
- Hotfix: same run permitido; token faltante/distinto bloqueado; Reset/Activation atómicos; token nuevo generado por servidor durante Activation.
- Hotfix sin DML sobre `moves`, `riggo_execution_state`, history u operations.
- C4: stale en error y data; chequeo independiente del outbox; server-wins/no-merge.
- Service Worker no borra IndexedDB/Site Data.
- Operación, Field Integrity, Move Intelligence, CSS y plantilla Excel idénticos byte-a-byte a 12.3.6.
- Referencias de assets, versión, SW y cache headers coherentes.
- Sintaxis JavaScript de todos los bundles y Service Worker: PASS (`node --check`).

Evidencia reproducible: `audit/contracts_1237.py` y `audit/contracts-1237-results.txt`.

## 3. Browser regression con paquete 12.3.7 real

Chromium ejecutó el HTML/bundles reales 12.3.7 con IndexedDB en memoria y un backend contractual simulado. No se modificó la aplicación para las pruebas.

Resultado: **PASS** en todos los escenarios ejecutados:

- Arranque 12.3.7 + C4 self-check `server-wins-no-merge`.
- Flat Time: 10/10 categorías guardadas con ACK C4, incluyendo `road` / Vías-Locación.
- Daily Report: Siguiente funciona en un clic en 0→1, 1→2, 2→3, 3→4 y 4→5.
- Los cuatro controles Sin cambios mantienen el scroll.
- Cargas: Pendiente → Cargada → Posicionada → Pendiente sin selector de estado.
- Cierre manual antes del cutoff conserva el cutoff programado y marca cierre anticipado.
- Cliente tipo 12.3.4: llamada explícita a `riggo_execution_save_v2` con CURRENT `_riggoRunId` guarda correctamente bajo la semántica 12.3.7.
- Payload sin `_riggoRunId`: rechazado; servidor sin cambios.
- Payload con token OLD: rechazado; servidor sin cambios.
- Outbox OLD con estado local ya CURRENT: outbox eliminado y Server Truth adoptada sin merge.
- `stale_execution_run` recibido en `response.error`: reconciliado.
- `stale_execution_run` recibido en `data.code`: reconciliado.
- Reset ACTIVE → READY conserva flujo UI y el retry reutiliza el mismo `operation_id`.
- Simulación de dos clientes Reset → Reactivate: Activation rota token; el cliente que conserva la corrida pre-reset no puede escribir; su outbox se descarta y adopta la corrida reactivada sin revivir closures viejos.
- Corte explícito fecha+hora retenido.
- Move Intelligence y Performance cargan sus módulos conservados.
- Password recovery conserva UI de nueva contraseña.
- Smoke móvil 390 px sin overflow horizontal global.
- Cero excepciones no capturadas durante la batería.

Evidencia reproducible: `audit/browser_1237.py` y `audit/browser-1237-results.txt`.

## 4. Lo que NO se certifica como E2E productivo

Estas pruebas no sustituyen:

1. Ejecutar el diagnóstico 01 contra la base productiva real y conservar su output.
2. Aplicar el hotfix 02 en Supabase producción después de revisar el diagnóstico.
3. Hacer una prueba controlada con **dos dispositivos/navegadores reales** y una Move de prueba: dispositivo A Reset → Reactivate; dispositivo B permanece con la corrida previa e intenta guardar; B debe ser rechazado/reconciliado y nunca revivir ejecución vieja.
4. Validar correos, Storage/PDF y Daily email contra servicios externos reales después del despliegue.

Por esta razón el estado de esta entrega es **build/auditoría local listo para canary**, no “E2E producción certificado”.
