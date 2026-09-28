# Revisión solicitada a IT

## Prioridad 1: acceso y autoridad

1. Confirmar que el repositorio esté en la organización corporativa, privado, con owners de IT y branch protection.
2. Revisar políticas RLS, grants de tablas/RPC y policies del bucket `riggo-files` desde Supabase. Probar el acceso directo desde una sesión autenticada con permisos mínimos.
3. Auditar las funciones `SECURITY DEFINER`, el `search_path`, el uso de GUC transaccionales para Reset/Activation y las condiciones CAS/idempotencia. El token de corrida es integridad de datos, no autorización.
4. Verificar almacenamiento y retención de datos de operación, PDFs, imágenes, auditoría e historial; definir backups/restauración y monitoreo del crecimiento de `riggo_execution_history`.

## Prioridad 2: propiedad y despliegue

1. Identificar repositorio fuente original y pipeline que producen estos bundles; si no existe, planear un build reproducible. Este snapshot no permite reconstruir el frontend desde fuentes separadas.
2. Registrar el proyecto Cloudflare real, rutas, ambientes, control de acceso, DNS, logs y proceso de rollback. El paquete solo contiene archivos estáticos.
3. Confirmar qué versión de frontend corre hoy. El hotfix de base está verificado; publicación 12.3.7 y canary de dos dispositivos siguen sin evidencia en este paquete.
4. Mantener migraciones SQL bajo revisión/aprobación y aplicarlas una sola vez por ambiente; no ejecutar `db/` desde CI.

## Prioridad 3: deuda técnica observable

- `index.html` mezcla lógica inline histórica y bundles superpuestos. El orden de carga es frágil y complica revisión de cambios.
- `manifest.webmanifest` aún anuncia `12.3.5` aunque `version.json`, título, JS y caché SW son 12.3.7. Corregirlo en una próxima release controlada, no editando el snapshot auditado.
- Supabase JS se carga como `@2` sin versión exacta; fijar versión e integridad comprobable. Los CDN de PDF también deben entrar en inventario de dependencias.
- El paquete incluye configuración pública de conexión al proyecto. Mantener el repositorio privado por código, marca y contexto operativo, aunque la clave *publishable* no sea secreta.

## Evidencia que IT debería aportar para cerrar la revisión

Export de esquema/policies y grants; inventario de funciones y Storage policies; configuración de Cloudflare; confirmación de frontend desplegado; logs de monitoreo; prueba E2E controlada de dos dispositivos y revisión de resultados sin datos sensibles en el repositorio.
