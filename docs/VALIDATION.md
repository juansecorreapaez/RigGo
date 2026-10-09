# Validación · RigGO 12.4.2

Release `12.4.2-accessible-registration-c1`, build `2026-10-09-1242-A1`. Base 12.4.1; ninguna migración SQL nueva.

## Evidencia funcional

- **29 grupos de regresión operativa**: separación cargadas/tránsito/posicionadas, corte histórico, interpolación por horas, línea base y porcentajes manuales; OPS/PDF y correo reales; copia enviada congelada, actualización del correo pendiente; IndexedDB de fotos/firma y aislamiento de corrida; fin operativo separado de Acceptance; scroll táctil y perfiles de user-agent.
- **17 comprobaciones de registro**: nombre/acción de carga, activaciones repetidas, foco después del registro y corrección, avisos de sincronización, corrección auditada que conserva el evento original y rechazo de otra corrida/evento posterior, nuevo participante, etiquetas, recursos Sin cambios y edición Unicode, error asociado al campo, Tab/Escape y gráfico ascendente.
- **113 estados y 48 comprobaciones de confirmación**: escritorio 1440×1000, móvil 390×844, ancho 320 y raíz tipográfica 32 px. Se recorrieron acceso, inicio, ocho pasos de plan, ejecución, siete pasos de reporte, OPS/correo, administración, Performance y cierre. Se comprobaron los diálogos de Flat Time y fechas anidadas, devolución del foco, nombres de lecciones en AX, grupos de recursos, páginas y reflow.
- Se repararon dos defectos nuevos del visor/estado de conexión detectados en la confirmación: duplicación del control al reemplazar el documento y escala calculada sobre el contenedor en vez del papel. **18 comprobaciones funcionales dirigidas** confirmaron página seleccionada, ajuste del rectángulo real del documento, impresión de todas las páginas y palabra Offline sin recorte a 16/32 px. No se reinició una revisión general de estilo.

Los datos existieron sólo en contextos nuevos de Chromium, con tráfico externo bloqueado. No se enviaron correos ni se escribieron cuentas, permisos o datos en Supabase. PDF, PNG, IndexedDB y código de producción fueron reales; la identidad y operación fueron sintéticas.

`python3 scripts/smoke_release.py` y `python3 scripts/check_registration.py` son reproducibles desde el repositorio o el ZIP descomprimido. Requieren Playwright y `/usr/bin/chromium`, permiten elegir ejecutable/sitio/directorio de resultados e inician y detienen servidores temporales. El segundo devuelve código distinto de cero si falla una comprobación.

## Integridad y actualización

La entrega verifica sintaxis externa e inline, referencias locales, nombres de assets derivados de su SHA-256, SRI/proveniencia de las cuatro librerías y `SITE_SHA256SUMS.txt`. El ZIP se abre y se recorre con comprobación CRC; la copia descargada debe coincidir byte a byte y en SHA-256.

La prueba de PWA usa el mismo origen: instala 12.4.1, conserva un marcador local y una firma en IndexedDB, sustituye por 12.4.2, instala la caché nueva completa y recarga offline. La caché de código antigua se retira; el almacenamiento de operación/evidencias se conserva. El código sigue usando `riggo-media-v124` y las autoridades C4 existentes.

## Límites

La auditoría independiente y la confirmación utilizan Chromium headless, DOM/AX y estilos computados. El detector/overlay Impeccable no está disponible (launcher inexistente, exit 127). No son pruebas con NVDA/VoiceOver, teléfonos físicos, navegadores Edge/Brave nativos o zoom completo del navegador; ampliar la raíz a 32 px prueba el texto basado en rem. No se verificaron autenticación, RLS, sincronización entre dos dispositivos, entrega real de correo ni Cloudflare desplegado.

Transporte conserva una lista larga y la primera carga sigue requiriendo desplazamiento inicial. La instantánea no incluye el proyecto modular original. Estos límites están detallados en `KNOWN_LIMITATIONS.md` y en la auditoría.
