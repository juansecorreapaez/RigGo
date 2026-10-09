# Reglas operativas de RigGO 12.4.1

## Porcentajes al corte del reporte

- **Cargadas:** cargas con estado Cargada, En tránsito o Posicionada al corte. Es un acumulado de preparación, no evidencia de salida de origen.
- **Movilizadas:** cargas con estado En tránsito o Posicionada al corte. Cargada por sí sola no participa en este conteo.
- **Posicionadas:** cargas con estado Posicionada, dividido por el total.
- **RM físico por alcance:** posicionadas / total de cargas del alcance.
- **RM sugerido general:** posicionadas / total de cargas de la Move.
- **RM reportado:** conserva el ajuste manual del supervisor. No se sustituye por el sugerido.
- Los estados posteriores al fin del período no participan en el cálculo. Un alcance sin cargas muestra 0 %.

Ejemplo M48: 5/54 cargadas, sin tránsito ni posicionamiento, son 0 movilizadas y 0 % de RM físico. El 9 % corresponde a preparación/cargue y no se presenta como avance físico. En los históricos no se convierte automáticamente Cargada a En tránsito; debe existir evidencia del estado correspondiente. Un RM manual de 42 % permanece en 42 %.

## Plan al corte

La curva acumulada del Excel se interpola entre Release (0 %) y sus puntos de 24, 48, 72 horas, etc. La fecha de referencia es `meta.projectedRelease`, o `exec.actualRelease` cuando falta la planificada. Antes del Release planificado el avance esperado es cero; después del último punto se conserva ese valor final.

Los períodos de reporte siguen usando sus cortes reales. Un período de tres horas no equivale a 24 horas de plan. Cambiar el corte cambia el instante de consulta, no la curva importada. Las asignaciones de actividades por día del Excel siguen siendo grupos de planificación, no horarios exactos ni cuotas parciales de actividad. La interpolación supone avance uniforme dentro de cada bloque; no introduce un editor de cuotas diarias ni inventa secuencias de ejecución.

Las tablas del PDF y correo, y las gráficas de avance del día, consultan el mismo cálculo. Las cifras visibles se redondean como antes. El fin operativo no depende de esta interpolación ni del redondeo del plan.

## Fin operativo y aceptación

El fin operativo limita los días sin otorgar aceptación formal ni cerrar administrativamente la Move. Se determina por un fin confirmado, una aceptación existente o el instante de la última actividad cuando todas las tareas y cargas están completas. Una cifra redondeada de 100 % no prueba terminación física.

Si un reporte cerrado tiene las tres fases exactamente en 100 % y utiliza ajustes manuales, la generación de días se pausa para revisión. El usuario puede confirmar el fin o continuar la operación. La continuación/reapertura se registra en auditoría. No se elimina ningún reporte existente con contenido posterior al fin: queda señalado como fuera de operación.

## Evidencias y reportes enviados

Fotos y firmas se conservan por Move, corrida y reporte en IndexedDB, y se sincronizan con Storage y los metadatos existentes de ejecución. El caché se consulta antes de descargar. Se restauran únicamente las evidencias del reporte seleccionado o solicitado para exportación.

Una foto o firma enviada permanece editable. El correo enviado conserva su contenido congelado y sus adjuntos; una edición posterior muestra un aviso para revisar y reenviar. Los archivos se escriben con rutas únicas para preservar la copia enviada. Un correo aún pendiente de la versión anterior se actualiza con cuerpo, gráfica y PDF coherentes antes de su envío; conserva su distribución de destinatarios.

Sin conexión o ante un fallo de Storage, la evidencia queda pendiente en el dispositivo. Si el almacenamiento local falla, se informa del fallo sin anunciar que se guardó. Los errores temporales esperan entre intentos; los rechazos permanentes requieren un reintento explícito.

La firma admite dibujo o imagen PNG/JPG/WebP hasta 5 MB. Las fotos admiten los mismos formatos hasta 12 MB por archivo y se reducen a un máximo de 1600 píxeles por lado. La imagen de firma conserva su proporción dentro del lienzo.

Conservar el mismo dominio al publicar permite mantener los datos locales de los dispositivos. La evidencia local pendiente todavía necesita conexión y confirmación del servidor para estar disponible en otro dispositivo.

## Corrección inmediata de interfaz · 12.4.2

El último estado registrado en esta sesión puede corregirse si sigue siendo el evento más reciente de la misma corrida y período. La corrección añade un evento con referencia `corrects` y una entrada `load_status_correction`; no elimina el evento anterior ni cambia cortes históricos. Guarda mediante la autoridad existente, queda pendiente offline y conserva las defensas de corrida. Tras recargar, cambiar de período o recibir un evento posterior, esa opción inmediata deja de estar disponible. Esto no sustituye el procedimiento de revisión de registros históricos.
