# SANAD: verificacion del servidor

Esta entrega cambia las validaciones de la aplicacion. No incluye una sustitucion de las funciones de Supabase: su fuente no fue suministrada y no se dispuso de acceso administrativo al proyecto. La aceptacion real del servidor y la entrega de correo no se han probado.

1. En el proyecto Supabase usado por RigGO, abrir **Edge Functions** y revisar la fuente de `riggo-admin-users` y `riggo-send-email`.
2. Buscar restricciones de dominio en el usuario autenticado, usuario creado/modificado, destinatarios Para/CC y Reply-To. Si una validacion permite exclusivamente Nabors, ampliar esa misma validacion para aceptar exactamente `nabors.com` o `sanad.com`. Conservar la verificacion del JWT, la cuenta activa, los permisos, el control de acceso a Moves, idempotencia y limites existentes.
3. Revisar cualquier hook de Auth, restriccion de `access_list`, politica RLS o configuracion de dominios que tambien aplique ese filtro. No reaplicar las migraciones historicas de reset o stale-run para este cambio.
4. Con la fuente real disponible, aplicar un cambio limitado a las validaciones encontradas y desplegar las funciones por el mecanismo existente. No reemplazar toda la funcion con un ejemplo generico.
5. Verificar con una cuenta SANAD habilitada: crear acceso, ingresar, recuperar contrasena y recibir un correo en una casilla SANAD de prueba indicada por su propietario. Comprobar que las cuentas inactivas y los dominios no admitidos sigan rechazados y que NABORS mantenga su funcionamiento.

La politica de correo corporativo de la aplicacion puede replicarse en el servidor donde actualmente se requiera un dominio corporativo:

```js
const corporateDomains = new Set(['nabors.com', 'sanad.com']);
function isCorporateEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  const parts = email.split('@');
  if (email.length > 254 || parts.length !== 2 || !corporateDomains.has(parts[1])) return false;
  const local = parts[0];
  return local.length > 0 && local.length <= 64 && /^[a-z0-9._%+-]+$/.test(local)
    && !local.startsWith('.') && !local.endsWith('.') && !local.includes('..');
}
```

La coincidencia de dominio nunca debe usarse por si sola para autorizar un usuario. Tampoco debe imponerse una nueva restriccion corporativa a una ruta de destinatarios que anteriormente permitia otros dominios.

Para terminar esta verificacion se necesita la fuente real de ambas funciones o una conexion al proyecto Supabase con los permisos correspondientes.
