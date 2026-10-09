# RigGO · Diseño operativo

La 12.4 refina la identidad existente: fotografía real del equipo, logotipos Nabors/RigGO y superficies oscuras para una herramienta de movilización. El propósito es registrar y revisar operación, no presentar una campaña comercial.

## Tipografía y jerarquía

Segoe UI Variable Text / Segoe UI / fuente del sistema. Roles estables en escritorio y móvil: cuerpo y campos 16 px, etiquetas/controles/tablas 14 px, metadatos 12 px. Los valores están expresados en rem para permitir ampliación de texto. Títulos de 18–32 px según función y los titulares de marca existentes se mantienen.

Las plantillas oficiales OPS usan sus dimensiones de impresión en puntos y milímetros. Las fuentes de correo/PDF conservan fallbacks compatibles con exportación. No se introduce otra fuente remota.

## Composición

Operación primero: estado, período, actividad y siguiente acción. Los paneles se usan para separar tareas; las subdivisiones internas emplean espacios y líneas. El resumen de Performance utiliza valores con etiquetas y contexto en lugar de anillos decorativos.

En móvil, tarjetas de transporte, campos de participantes y rutas se apilan. En móvil, las etapas y pasos usan selectores nativos que activan los mismos controles y validaciones; en escritorio permanecen visibles las pestañas. Las tablas extensas conservan desplazamiento horizontal dentro de su contenedor. Las gráficas ajustan su ancho y reducen la frecuencia de etiquetas, manteniendo tamaño legible.

## Estados y accesibilidad

Foco visible, enlace para saltar al contenido, acciones desde teclado, etiquetas de participantes y archivos, selección/cursor/barra de desplazamiento acordes con la paleta. Los diálogos conservan foco y responden a Escape. Los errores distinguen guardado local, sincronización pendiente y fallo de almacenamiento. Movimiento reducido respeta la preferencia del dispositivo.

## Validación con Impeccable

La 12.4.2 ejecuta audit → harden → clarify → adapt → distill → polish. Dos evaluaciones independientes revisaron diseño y evidencia DOM/AX de la aplicación completa. Se aplicó una tanda conjunta de correcciones y una confirmación acotada de escritorio/móvil. Defectos nuevos del visor se repararon y verificaron de forma funcional sin reiniciar una ronda general de pulido.

El launcher Impeccable no está disponible en esta sesión (exit 127). El detector y overlay no se ejecutaron; su conteo es desconocido. La validación usa Chromium/Playwright, capturas, geometría y árbol AX; no equivale a una certificación WCAG ni a pruebas en dispositivos físicos o lectores de pantalla reales.

## Correcciones 12.4.1

Se mantiene la identidad de la 12.4. El documento puede crecer y desplazarse en móvil y escritorio; la navegación de ejecución permanece al final del contenido. Transporte etiqueta cargadas, movilizadas y posicionadas, con el RM físico identificado. El contexto de horas y referencia del plan acompaña la comparación.

## Registro y divulgación progresiva · 12.4.2

La acción de carga lleva un verbo; el estado se muestra aparte. El guardado explica si existe confirmación remota. Las correcciones inmediatas añaden historial y conservan contexto de corrida/período. El foco continúa en el control operado y los nuevos campos reciben foco al añadir.

Los recursos se resumen por grupo, con detalle y edición accesibles. Sin cambios significa que los campos diarios quedan deshabilitados hasta habilitar la edición. El OPS añade herramientas de vista previa separadas del documento oficial; cambiar página o escala no modifica sus datos ni sus exportaciones.

El servicio compartido de interfaz reemplaza el decorador de la 12.4.1. Centraliza etiquetas, anuncios, foco, diálogos, ayuda y resúmenes; evita añadir otra autoridad de persistencia. La implementación sigue siendo una instantánea con capas históricas y requiere recuperar el proyecto modular para simplificar su mantenimiento.
