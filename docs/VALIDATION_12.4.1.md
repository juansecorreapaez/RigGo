# Validación · RigGO 12.4.1

Release: `12.4.1-field-corrections-c1`. Build: `2026-10-08-1241-A1`.

## Pruebas ejecutadas

**29 comprobaciones funcionales aprobadas** usando los scripts reales, Chromium, IndexedDB real y los motores reales de PDF/gráficas. Todo el tráfico externo se bloqueó; los datos de prueba y el usuario de prueba existieron exclusivamente en el navegador aislado.

| Área | Resultado |
| --- | --- |
| M48 | 5/54 cargadas; 0 movilizadas, 0 posicionadas y 0 % RM físico. Alcances vacíos en 0. |
| Plan de tres horas | Plan RD 9,5 %, RM 4,375 %, RU 2,375 %; a 24 h coincide con el primer punto original; a 27 h interpola el segundo bloque. |
| Línea base | Inicio planificado conserva atrasos de Release; inicio real sirve de respaldo si falta el planificado. Curva importada intacta; antes del inicio, 0; tras el último punto, valor final. |
| Porcentaje manual | Un RM manual de 42 % se mantiene. |
| Estados de carga | Tránsito suma movilizadas sin sumar posicionadas. Eventos posteriores al corte se excluyen; timestamps legados siguen admitidos. |
| Acciones de transporte | Clics Cargada → En tránsito → Posicionada; reinicio confirmado a Pendiente conserva historial y auditoría. Cola offline existente utilizada. |
| Exportación | Tabla OPS y cuerpo del correo con total/cargadas/movilizadas/posicionadas coherentes. PDF real A4, gráfica PNG real y adjuntos validados. |
| Correos anteriores | Copia enviada sin cambios. Copia pendiente antigua regenera cuerpo, gráfica y PDF, conservando destinatarios. |
| Evidencias | Fotos/firma restauradas desde IndexedDB; otra corrida no recupera esos medios. |
| Fin operativo | 100 % manual cerrado sigue pausando días sin otorgar Acceptance. |
| Arranque | Pasa con CDN y demás servicios externos bloqueados. Perfiles de agente de usuario Edge y Brave Android sobre Chromium también pasan. |
| Móvil | Gesto táctil real desplaza la lista de Moves. Inicio admite desplazamiento en pantalla corta y con texto ampliado al 200 %. |

La prueba reproducible del repositorio es `python3 scripts/smoke_release.py`. Inicia un servidor temporal de loopback. Requiere Python 3, Playwright y Chromium; permite elegir ejecutable, directorio del sitio y directorio de resultados por argumentos.

## Actualización y caché

Prueba adicional sobre el mismo origen: instalar la caché 12.4, guardar evidencia en su IndexedDB y un marcador local, sustituir la publicación por 12.4.1, esperar la instalación completa de los 33 recursos y la retirada de la caché anterior, y recargar sin conexión. **Aprobada**: arranque 12.4.1, caché nueva, evidencia y marcador conservados.

Se verificaron la sintaxis de los scripts externos e internos, referencias de archivos locales, nombres con hash, integridad SRI de las librerías y manifiesto SHA-256 de los 44 archivos de ejecución. Las cuatro librerías proceden de tarballs npm verificados con su integridad publicada; las licencias y registros están incluidos.

## Revisión visual y límites

Revisión conjunta a 1440 px y 390 px. Se corrigió la barra inferior que cubría contadores móviles y se confirmó el resultado. Primera página del PDF inspeccionada: ocho columnas de cargas, nota de horas, plan al corte y footer legibles. El fixture amplio genera páginas adicionales de pendientes; no se afirma que todo reporte deba tener cuatro páginas.

No se usaron cuentas reales, no se modificaron registros de Supabase y no se enviaron correos ni se desplegó Cloudflare. La prueba con perfiles Edge/Brave comprueba el arranque sin CDN y sin reglas por marca de navegador; queda la comprobación en instalaciones reales y teléfonos físicos. RLS, autenticación corporativa, envío real, límites de cuota y políticas del navegador/dispositivo requieren el piloto autorizado.

La interpolación es una aproximación de avance uniforme dentro de bloques de 24 h; no equivale a programar cada actividad por horario. Los documentos `VALIDATION_12.4.md` y `README_12.4.md` preservan las declaraciones del ZIP base y no representan nuevas pruebas de esa versión.
