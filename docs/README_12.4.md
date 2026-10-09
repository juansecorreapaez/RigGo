# RigGO 12.4

Build: `2026-10-06-1240-A1`. Base: `RigGO_12_3_8_CLOUDFLARE_READY.zip`, derivada de la 12.3.7 del usuario.

## Cambios

- Fotos y firmas conservadas al editar, navegar, recargar y enviar reportes. Caché local por corrida y reporte; restauración selectiva, sin descargar todas las evidencias en segundo plano.
- Firma dibujada o cargada como imagen PNG/JPG/WebP. Errores de archivo y sincronización explicados en el reporte.
- Transporte y tablas por alcance calculan **movilizadas / total**. Las posicionadas y el RM general sugerido conservan su propia métrica. El porcentaje manual del supervisor se mantiene.
- Fin operativo separado de la aceptación: limita nuevos días, conserva reportes históricos y permite reapertura auditada. Un 100 % manual cerrado pausa los días para revisión; un porcentaje redondeado no confirma terminación física.
- Diseño global con Impeccable: cuerpo/campos de 16 px, etiquetas/controles/tablas de 14 px y metadatos de 12 px; composición adaptable, gráficas legibles, foco visible y Performance sin anillos decorativos.
- Se conservan las protecciones de sincronización de 12.3.8: espera entre reintentos, pausa de rechazos, confirmación del servidor y aislamiento entre corridas.

## Publicar en Cloudflare Pages

1. Descomprimir el ZIP y publicar su contenido con `index.html`, `sw.js`, `version.json`, `_headers` y `assets/` en la raíz. No requiere comando de compilación.
2. Mantener el dominio existente para conservar los datos locales de los dispositivos.
3. Recargar la app y comprobar el título **RigGO · 12.4** y el build `2026-10-06-1240-A1`. Los recursos modificados usan nombres con hash y una nueva caché.
4. Antes de extender el despliegue, revisar un reporte real de Rig 992 y el fin operativo de M47. Editar después de añadir fotos/firma; enviar; reabrir; comprobar evidencias, porcentajes y días disponibles.

**No requiere SQL ni cambios de esquema en Supabase.** La autenticación actual permanece; SSO corporativo con Entra ID queda fuera de este paquete. No borrar datos locales para actualizar.

## Validación y alcance

11 grupos funcionales y 25 de sincronización aprobados con la app real, IndexedDB real y respuestas simuladas de Supabase. Se generó un PDF OPS con el motor real y se comprobó la copia congelada del correo. Se revisaron pantallas de escritorio/móvil y texto ampliado al 200 %. Detalle en `docs/VALIDATION.md`; reglas en `docs/OPERATION_RULES.md`.

Este ZIP está preparado para publicar; no se desplegó ni se enviaron correos reales durante la validación. La prueba piloto de operación corresponde al paso previo a publicar. Los cambios reducen solicitudes futuras innecesarias y no reinician el consumo de cuota ya registrado.
