# Validacion RigGO 12.4.3

Build `2026-10-14-1243-A1`; servicios externos aislados. No se ejecutaron SQL, envios reales de correo ni despliegues en Cloudflare o Supabase.

- 29 grupos operativos: horas reales/plan, baseline, overrides, estados de transporte e historia, OPS/PDF/correo, archivos enviados congelados y regeneracion de pendientes, firma, almacenamiento, navegacion y desplazamiento.
- 29 grupos de preferencias/almacenamiento: primer ingreso, varias cuentas, nuevos dispositivos, edicion sin guardar, opciones canonicas, seguridad de sincronizacion por propietario, cola sin conexion, reintento y recuperacion de IndexedDB.
- 21 grupos de ingles y SANAD: portada completa, idioma de reportes/defaults/etiquetas, conservacion de datos del usuario; ambos dominios, mayusculas/alias, formatos invalidos, dominios parecidos, ingreso, creacion de acceso, recuperacion, rechazo de cuenta inactiva, solicitud administrativa y permisos seleccionados, grupos mixtos, destinatarios y solicitud de correo con cuerpo/feedback en ingles.
- 1 actualizacion real del Service Worker desde 12.4.2 a 12.4.3, seguida de arranque sin conexion; conserva almacenamiento, preferencia de idioma y evidencia/firma, y carga la nueva validacion SANAD.

Total: 80 grupos satisfactorios, sin errores JavaScript sin capturar.

En el diagnostico se recorrieron 41 superficies: ingreso, inicio, pasos de planificacion, ejecucion, pasos del reporte, administracion, Performance, dialogo de usuario y reset, reportes generados y tabla administrativa movil. Una revision conjunta de escritorio/movil detecto textos dinamicos que no pasaban por el traductor y etiquetas CSS en espanol. La confirmacion reviso las correcciones; dos etiquetas restantes de categorias se corrigieron y verificaron con aserciones especificas de ruta y reporte. Los nombres, comentarios, datos del Excel y valores canonicos no se usan como copy de la interfaz.

`riggo-admin-users`, Supabase Auth y `riggo-send-email` se simulan en las pruebas de frontera: se comprueban los datos enviados por el codigo real de la aplicacion y el rechazo local correspondiente. Estos resultados no certifican las politicas de la base de datos, las funciones desplegadas, el SMTP/proveedor ni la entrega a una casilla SANAD real. Ver `SANAD_BACKEND_CHECK.md`.

Los perfiles Chromium con identificacion Edge/Brave cubren el comportamiento de la aplicacion; no sustituyen una prueba en la instalacion Edge afectada.
