# Descargar RigGO 12.4.3

Archivo individual listo para Cloudflare Pages: `RigGO_12_4_3_CLOUDFLARE_READY.zip`.

Descarga directa: https://github.com/juansecorreapaez/RigGo/raw/refs/heads/codex/riggo-12.4.3-download/downloads/RigGO_12_4_3_CLOUDFLARE_READY.zip

Build `2026-10-14-1243-A1`. SHA256 `cfeef574a810d4963c94e79cec1a32628c17795e12b9744ced1671488faadbe0`.

Corrige los textos de la interfaz y los reportes al seleccionar ingles. Amplia los filtros de la aplicacion para ingresar, crear acceso, recuperar contrasena, administrar usuarios y usar destinatarios `@sanad.com`, conservando NABORS y los permisos existentes.

80 comprobaciones locales satisfactorias. Las funciones externas se simularon: falta revisar sus restricciones reales, pues su fuente no esta en este repositorio. Ver `SANAD_BACKEND_CHECK.md`.

Para carga manual, abrir el proyecto Pages actual, Create a new deployment, Production, cargar este ZIP y Save and Deploy. Para la integracion Git, la carpeta estatica `site/` de esta rama contiene los mismos archivos ejecutables; use el mecanismo de despliegue existente y su revision habitual antes de promover la version.

Publicar estos archivos en GitHub no actualiza por si solo el proyecto de produccion de Cloudflare ni las funciones de Supabase. Conservar el dominio y los datos del navegador al actualizar.
