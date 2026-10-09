# RigGO 12.4.2

Build: `2026-10-09-1242-A1`. Conserva las correcciones de la 12.4.1. Base original: el ZIP `RigGO_12_4_CLOUDFLARE_READY(1).zip` aportado por el usuario.

## Interfaz y registro · 12.4.2

- Acciones explícitas **Registrar cargue / salida / llegada** junto al estado actual. Los nombres accesibles identifican la carga. Un bloqueo por carga impide que una activación rápida duplique el evento y mantiene el foco de teclado.
- **Corregir último registro** agrega un evento de corrección y auditoría. Conserva el evento anterior y requiere la misma corrida, período y último evento. Es una corrección inmediata de esta sesión, no un editor general del historial ni una acción disponible después de recargar.
- Guardado local, sincronización pendiente y confirmación se distinguen en avisos accesibles que sobreviven al render. El registro sigue usando la autoridad y la cola existentes.
- Campos con etiquetas persistentes, controles importantes de al menos 44 px, validación asociada al campo y foco restaurado al añadir participantes y cerrar diálogos, incluso con fecha/hora anidada.
- Navegación móvil por selectores nativos, recursos del plan agrupados en desplegables y recursos diarios **Sin cambios** protegidos hasta habilitar su edición. Los resúmenes conservan todos los datos y reglas de arrastre.
- OPS con selector de páginas, ajuste al ancho/tamaño original y orientación de revisión. Se conservan la plantilla oficial y todas las páginas al exportar o imprimir. El último paso explica qué falta para cerrar y enviar.
- Ayuda contextual en todas las rutas; gráfica acumulada con 100 % arriba y 0 % abajo. Los correos pendientes antiguos regeneran la gráfica, el cuerpo y el PDF con renderer 5; los ya enviados permanecen congelados.

## Cambios

- Transporte distingue **Cargada → En tránsito → Posicionada**. Una carga preparada en origen todavía no está movilizada. El botón avanza una etapa por clic; volver a Pendiente pide confirmación y conserva el historial anterior.
- Cargadas incluye las cargas que ya pasaron al tránsito o a destino. Movilizadas incluye En tránsito y Posicionada. El **RM físico por alcance y el RM general sugerido** usan Posicionadas / Total. Los porcentajes manuales del supervisor se conservan.
- Pantalla, tabla OPS/PDF y correo muestran estas mismas definiciones. Los correos pendientes de una versión anterior regeneran conjuntamente cuerpo, gráfica y PDF; las copias ya enviadas permanecen congeladas.
- Plan al corte calculado por horas mediante interpolación de la curva diaria importada en bloques de 24 horas. Se usa el Rig Release planificado; si no existe, se usa el real y se indica esa referencia. La curva original y las asignaciones de actividades del Excel se conservan.
- Librerías de acceso y exportación incluidas localmente, con versiones fijas, licencias e integridad verificada. El arranque no depende de que Edge, Brave o una red corporativa permita un CDN.
- Desplazamiento natural en móvil y escritorio. La navegación inferior ya no tapa los contadores. La caché se consulta por versión; se conserva IndexedDB y el almacenamiento local al actualizar.
- Se mantienen las evidencias durables, imagen de firma, fin operativo, protección entre corridas y política de reintentos de la 12.4.

## Ejemplo M48

Con un Rig Release planificado y real el 6 de octubre a las 21:00, y corte el 7 de octubre a las 00:00 (hora Colombia), transcurrieron 3 horas. Si el plan acumulado a 24 h es RD 76 %, RM 35 % y RU 19 %, el plan al corte es **9,5 %, 4,375 % y 2,375 %**. La interfaz conserva el redondeo a porcentajes enteros. Un Release real posterior al planificado mantiene el atraso real; no se desplaza la línea base para ocultarlo.

Cinco cargas cargadas de un total de 54, sin tránsito ni posicionamiento, muestran **5 cargadas, 0 movilizadas, 0 posicionadas y 0 % de RM físico**. La programación diaria detallada por porcentajes sigue siendo una decisión de planificación; esta corrección usa la curva existente y supone avance uniforme entre sus puntos.

## Publicar en Cloudflare Pages

1. Descomprimir el ZIP y publicar con `index.html`, `sw.js`, `version.json`, `_headers` y `assets/` en la raíz. No requiere compilación ni instalación de paquetes.
2. Mantener el dominio existente para conservar los datos de los dispositivos.
3. Comprobar el título **RigGO · 12.4.2** y build `2026-10-09-1242-A1`. Abrir también una sesión que tuviera la 12.4.1 para verificar la actualización.
4. Revisar un reporte controlado de M48: cinco cargas preparadas, avance por horas, PDF, correo y desplazamiento en teléfono. Confirmar la operación con la cuenta autorizada antes de extender el despliegue.

No requiere SQL ni cambios de esquema en Supabase. El paquete no se desplegó y no se enviaron correos reales. La prueba de arranque usa Chromium y perfiles de agente de usuario Edge/Brave; no sustituye la comprobación en esos navegadores y teléfonos físicos.

## Desarrollo y validación

En el repositorio, servir `site/` con `python3 -m http.server 8000 --bind 127.0.0.1 --directory site`. En el ZIP desplegable, servir la raíz del paquete. Para revisar los bytes de la versión en el repositorio: `python3 scripts/verify_snapshot.py`.

Las pruebas reproducibles están en `scripts/smoke_release.py` del repositorio y requieren Python 3, Playwright y Chromium. Inician un servidor temporal de loopback y bloquean todo acceso externo. En el repositorio: `python3 scripts/smoke_release.py`; en la raíz del ZIP: `python3 scripts/smoke_release.py --site .`. Véase `docs/VALIDATION.md` para resultados y límites, y `docs/OPERATION_RULES.md` para definiciones.

## Comprobar esta entrega

Desde el repositorio o el ZIP descomprimido:

```bash
python3 scripts/verify_snapshot.py
python3 scripts/smoke_release.py
python3 scripts/check_registration.py
```

Los dos runners de navegador requieren Playwright y Chromium. Usan datos sintéticos y bloquean los servicios externos. No envían correos ni prueban cuentas reales. Para servir la carpeta del ZIP: `python3 -m http.server 8000 --bind 127.0.0.1`; desde el repositorio añade `--directory site`.

Lee `docs/VALIDATION.md`, `docs/AUDIT_12.4.2.md` y `docs/OPERATION_RULES.md`. No ejecutes SQL histórico para instalar esta actualización. La publicación en Cloudflare y las pruebas con usuarios reales siguen siendo pasos separados.
