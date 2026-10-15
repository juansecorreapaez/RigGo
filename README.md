# RigGO 12.4.3

Esta rama corrige la presentacion en ingles y amplia los dominios corporativos de la aplicacion a NABORS y SANAD. Build `2026-10-14-1243-A1`.

- `site/`: archivos estaticos de la aplicacion y PWA para Cloudflare Pages. Sin compilacion.
- `downloads/RigGO_12_4_3_CLOUDFLARE_READY.zip`: paquete individual con `index.html` en la raiz.
- `docs/VALIDATION_12.4.3.md`: 80 comprobaciones locales con servicios externos aislados.
- `docs/SANAD_BACKEND_CHECK.md`: verificacion pendiente de las funciones y politicas reales de Supabase.
- `scripts/`: verificaciones de activos, operacion, preferencias, SANAD y actualizacion offline.
- `db/`: migraciones historicas ya aplicadas. No reaplicarlas para esta entrega.

Los valores de estado y opciones conservan su representacion canonica; los nombres, comentarios y datos aportados por el usuario se preservan. La preferencia de idioma sigue guardandose por cuenta y el selector superior permite cambiarla.

SANAD debe tener cuenta habilitada por el administrador y los permisos correspondientes. El codigo del servidor `riggo-admin-users` y `riggo-send-email` no fue suministrado; no se ha desplegado una modificacion en Supabase ni se ha probado un envio real a una casilla SANAD. Las pruebas de frontera verifican la solicitud que genera el cliente usando respuestas simuladas.

Los archivos de esta rama no se han promovido a produccion en Cloudflare. Para una carga manual, subir el ZIP individual al proyecto actual. Para la integracion Git, usar la carpeta `site/` con la configuracion existente y revisar el cambio antes de promover la version. Mantener el mismo dominio y los datos locales.
