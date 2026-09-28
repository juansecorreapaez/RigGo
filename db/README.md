# SQL histórico, no automatizado

Los dos archivos son evidencia del contrato de base observado para 12.3.6/12.3.7, no pasos de instalación de este repositorio. Según el historial de operación, **ambos ya fueron ejecutados en Supabase producción**. No repetir `12.3.6_reset_baseline_APPLIED_DO_NOT_RERUN.sql`; contiene cambios de lifecycle y limpieza de artefactos asociados al RPC Reset. El hotfix 12.3.7 sustituye el cuerpo de un trigger. Ninguno se ejecuta al abrir o desplegar `site/`.

Para otro entorno, IT debe construir una migración desde el esquema de ese entorno, revisar diff de funciones/RLS/grants y ejecutar con control de cambios. Los SQL aquí no son un dump completo de Supabase.
