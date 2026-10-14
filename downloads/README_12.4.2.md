# RigGO 12.4.2 para Cloudflare Pages

Paquete: `RigGO_12_4_2_CLOUDFLARE_READY.zip` (4,014,123 bytes).
Build: `2026-10-14-1242-A1`.
SHA256: `b001a8c773aea8504831c68a32b6b808f0010d23f2cbc3300d9a855175b69e5a`.

## Descargar

Abra el ZIP en GitHub y use Download raw file. Este es el paquete individual preparado para Cloudflare; el ZIP general del repositorio contiene tambien la estructura del repositorio y no se debe subir directamente como sitio.

## Cambios

- Seleccion inicial de ingles o espanol al ingresar con una cuenta autorizada, preferencia guardada por usuario y selector superior para cambiarla.
- Recuperacion del arranque y del almacenamiento del navegador sin borrar datos; errores concretos y reintento.
- Horas reales y del plan separadas; cargas acumuladas y pendientes de salir diferenciadas.

No requiere SQL. Esta entrega no habilita SANAD. Las 59 comprobaciones locales pasaron; queda validar la instalacion Edge afectada y los servicios reales despues del despliegue.

## Publicar

En un proyecto Pages de carga manual, abra Workers & Pages, seleccione su proyecto actual, Create a new deployment, Production, cargue este ZIP y seleccione Save and Deploy. El ZIP contiene index.html y assets directamente en la raiz; no requiere compilacion.

Si Pages esta integrado con GitHub, actualice la carpeta estatica del repositorio que ya usa el proyecto (por ejemplo site/) con el contenido extraido del paquete y use su despliegue existente. Esa integracion no permite arrastrar ZIPs en el panel.

Mantenga el proyecto y dominio existentes. Verifique RigGO 12.4.2 y el build indicado, seleccion de idioma y recuperacion de la preferencia al volver a entrar. No borre los datos del navegador para actualizar.

Esta rama contiene el paquete de entrega. Publicar el archivo en GitHub no equivale a actualizar produccion en Cloudflare.
