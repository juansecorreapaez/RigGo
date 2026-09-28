# RigGO 12.3.7 — paquete de revisión para IT

**Uso previsto:** repositorio **privado** del equipo autorizado de Nabors. Contiene una copia fiel del artefacto web 12.3.7 y la documentación técnica disponible. No es una solicitud de despliegue ni una exportación de la base productiva.

## Qué hay aquí

| Ruta | Contenido |
| --- | --- |
| `site/` | Artefacto Cloudflare-ready 12.3.7: PWA estática, JS consolidado, CSS, imágenes y plantilla Excel. |
| `db/` | SQL 12.3.6 de Reset y hotfix 12.3.7, ambos **ya ejecutados** según el historial de producción compartido. No se ejecutan automáticamente. |
| `tests/` | Harness y resultados de pruebas locales/simuladas de 12.3.7. |
| `docs/` | Arquitectura, contratos de datos, estado de validación, riesgos y auditoría local. |

La versión del artefacto es `2026-09-26-1237-A1` (`site/version.json`). El ZIP fuente fue `RigGO_12_3_7_CLOUDFLARE_READY.zip`; `site/` conserva sus 33 entradas sin modificar. La aplicación puede abrirse como sitio estático, pero **no debe conectarse a producción desde un entorno de prueba informal**: el artefacto contiene la URL de Supabase y una clave *publishable* de cliente, visibles por diseño en el navegador.

## Punto de partida para la revisión

1. [Arquitectura y flujos](docs/ARCHITECTURE.md).
2. [Datos, RPCs y límites de confianza](docs/DATA_AND_TRUST.md).
3. [Estado de producción y evidencias](docs/VALIDATION_STATUS.md).
4. [Preguntas y riesgos para IT](docs/IT_REVIEW.md).

## Alcance y procedencia

Este repositorio es un **snapshot del artefacto de entrega**, no el código fuente original con historial de desarrollo, sistema de build, lockfile o infraestructura como código. El HTML contiene lógica inline de distintas versiones y los bundles son archivos de entrega. No se dispone aquí de una exportación completa del esquema Supabase, políticas RLS, configuración de Cloudflare Workers, secretos de entorno, funciones Edge, ni código de servicios de correo. IT necesitará acceso propio a esas consolas para una revisión integral.

Según la validación comunicada por el operador, el hotfix del guard 12.3.7 está instalado en Supabase y el guardado de RigGO 12.3.6 volvió a funcionar. **No tenemos confirmación documental de que el frontend 12.3.7 esté publicado**, ni un canary real de dos dispositivos Reset → Reactivate. Los resultados en `tests/` son locales/simulados; ver [estado de validación](docs/VALIDATION_STATUS.md).

## Publicación recomendada

Crear un repositorio **privado en la organización corporativa**, con IT como revisores y acceso limitado. No usar una cuenta personal ni hacer público el código, la URL del backend, el modelo operativo y la marca sin autorización corporativa. Configurar revisión de cambios antes de modificar `site/` o `db/`. El primer commit es un snapshot para arquitectura; un futuro equipo de desarrollo podrá migrarlo a un proyecto fuente reproducible.

## Comprobación local sin tocar producción

```bash
python3 scripts/verify_snapshot.py
node --check site/sw.js
```

No hay paso de build. `site/` es el contenido publicable. **No ejecutar los SQL de `db/` como parte de un pipeline o una instalación nueva**; primero deben ser revisados contra el esquema y el historial real de cada entorno.
