# Datos y límites de confianza

## Datos principales identificados

| Recurso | Función observada | Evidencia en paquete |
| --- | --- | --- |
| `moves` | Maestro, Plan, estado y revisión de Move. | Frontend y RPC Reset/Activation en SQL 12.3.6. |
| `riggo_execution_state` | Payload y revisión de ejecución vigente. | RPCs C4/v2/v3 y trigger de corrida. |
| `riggo_execution_history` | Historial técnico; ya hubo un incidente de crecimiento, resuelto aparte. | SQL 12.3.6 y handover histórico; no hay purga en este repo. |
| `riggo_operations`, `riggo_move_audit` | Idempotencia/auditoría de cambios de ciclo de vida. | SQL 12.3.6. |
| `daily_periods`, `daily_closures`, `reports`, `riggo_move_reports` | Días, cierres y reportes. | Frontend y SQL Reset. |
| `access_list`, `move_assignments` | Acceso de usuarios y asignaciones de Moves. | Consultas frontend. |
| `riggo-files` | Bucket de Storage para PDFs y medios. | Llamadas de Storage en frontend. |

Esta es una **lista observada**, no un inventario completo del esquema. Hay otras tablas de configuración y distribución. Los tipos, índices, FKs, políticas RLS, grants y retención no pueden certificarse con el artefacto web.

## Autoridad y seguridad

- El navegador y su IndexedDB son estado de trabajo y caché; PostgreSQL es autoridad para la ejecución C4. El cliente no debe ser tratado como un límite de seguridad.
- La clave *publishable* de Supabase está en `site/index.html` y es pública por diseño. No encontramos una clave `service_role`, `sb_secret_` o clave privada en los archivos incluidos. Esto **no prueba** que no exista una exposición fuera de este snapshot.
- `access_list` y permisos de UI no sustituyen RLS/grants y chequeos dentro de RPC. IT debe verificar acceso directo a tablas, Storage y ejecución de funciones para usuarios autenticados/no autenticados.
- `_riggoRunId` separa corridas para evitar la resurrección de ejecución vieja; no es una credencial de autenticación. CAS/revisión y permisos siguen siendo necesarios.
- Las excepciones `riggo.atomic_reset` y `riggo.atomic_activation` dependen de rutas RPC transaccionales. IT debe revisar los grants y si hay formas de invocar funciones privilegiadas fuera del flujo esperado.

## Contrato de sincronización C4 observado

1. Leer el estado autoritativo mediante `riggo_execution_read_c4`.
2. Crear/actualizar un pendiente local de ejecución con `operation_id` y revisión esperada.
3. Guardar por `riggo_execution_save_v3` si hay `_riggoRunId`, o v2 en caso legacy.
4. Ante conflicto de revisión, conciliar según la lógica C4; ante cambio de corrida, **Server Truth gana sin merge**.
5. El guard 12.3.7 de `db/12.3.7_stale_run_compat_hotfix_APPLIED.sql` rechaza token faltante/distinto cuando el estado previo ya tiene token. Reset/Activation son rutas atómicas especiales.

El cliente también tiene una ruta de recuperación `riggo_execution_recover_c4`. Revisar sus grants y criterios de autorización en la base real. Los archivos ya emitidos en Storage y correos ya enviados son artefactos externos al payload de una corrida reiniciada.
