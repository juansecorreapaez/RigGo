# Validación · RigGO 12.4

Release: `12.4.0-operational-design-c1`. Build: `2026-10-06-1240-A1`.

## App y operación

Pruebas ejecutadas en Chromium sobre todos los scripts reales de la aplicación. IndexedDB y motores html2pdf/html2canvas/jsPDF reales; API de Supabase, Storage y proveedor de correo simulados. Cero operaciones de producción.

| Grupo | Resultado |
| --- | --- |
| Runtime y módulos existentes | Arranque y diagnósticos correctos. |
| Rig 992 y corte temporal | Rig 33 % y Camp 34 % movilizadas; posicionadas separadas; RM manual 42 % y sugerido 20 %; estados futuros excluidos. |
| Imagen de firma | PNG válida conservada en caché y Storage; extensión inválida rechazada sin sustituir la firma. |
| Edición e hidratación | Fotos y firma preservadas al editar operación y aplicar dos lecturas de metadatos; no se repiten descargas. |
| Exportación real | PDF OPS válido de cuatro páginas y correo congelado con fotos, firma y porcentajes correctos. |
| Confirmación de envío | Firma/fotos editables intactas; HTML y adjuntos enviados conservados; una edición posterior muestra aviso. |
| Fallo de Storage | Evidencia local conservada; reintento automático respeta espera; reintento manual confirma las rutas sin perder fotos idénticas. |
| Fin físico M47 | Fin en la última actividad completa; D12 ocupado conservado como histórico; sin nuevos días; 99,6 % no termina la operación. |
| 100 % manual reportado | Pausa pendiente de confirmar; no otorga aceptación; 99,6 % no activa la regla; una reapertura permite continuar. |
| Fin confirmado y reapertura | Metadatos confirmados y auditoría explícita. |
| Recarga y aislamiento | Evidencias sobreviven a recarga; otra corrida no recupera medios antiguos. |

Resultado: **11 grupos funcionales aprobados**.

## Sincronización

**25 grupos aprobados**, cubriendo: guardado normal; rechazo permanente sin ciclos automáticos; reintento explícito; esperas de 15/30/60/120/240/300 segundos; cola durable; Moves independientes; envíos compartidos; edición durante un envío; respuestas antiguas; conflictos CAS y límite de 20 rondas; corrida nueva sin mezcla; lectura con espera; modo offline; reinicio/recuperación; metadatos master; coordinación en segundo plano; pestaña oculta; lectura completa limitada; compatibilidad v2/medios y bloqueo del cierre sin confirmación.

## Diseño y accesibilidad

Impeccable typeset/harden, evaluaciones independientes de tipografía y detector estático completo. Revisión conjunta a 1440 px y 390 px, seguida por una tanda de correcciones y una ronda de confirmación. Incluye login, inicio, planificación, selección/días, RD, transporte, RU, avance, recursos, operación, evidencias, Performance, histórico, administración y Move Intelligence. Texto ampliado al 200 % en evidencias.

El detector estático identifica tres advertencias y una recomendación en reglas de CSS históricas (franjas laterales, texto animado, resplandor y borde con sombra). Se contrastaron con los estilos finales: se desactivaron esos adornos en los componentes alcanzados y las superficies activas usan bordes sin sombras. No se afirma una certificación completa de accesibilidad.

## Paquete

Referencias locales, hashes de los ocho recursos modificados, precarga y nombre de caché, integridad ZIP y metadatos de release/build comprobados. Se conserva la identidad de la PWA y las bases de ejecución existentes; se añade un almacén local independiente de evidencias. Los recursos de fotografía, logotipos, plantilla XLSX e iconos existentes se preservan.

No hay SQL ni migración de Supabase. No se publicó el ZIP. Queda pendiente la revisión de un reporte real y el piloto operativo antes del despliegue.
