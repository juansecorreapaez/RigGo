# Publicar este snapshot en GitHub

Destino acordado: **repositorio privado en la cuenta personal del propietario**, para revisión inicial por IT. Cuando Nabors asuma el mantenimiento, transferirlo a la organización corporativa y revisar permisos.

## Crear el repositorio

Nombre sugerido: `riggo-it-architecture-review`. Elegir **Private** y crear vacío, sin README, `.gitignore` ni licencia generados por GitHub. Invitar solo a revisores de IT autorizados; el paquete contiene código corporativo, la URL pública del proyecto Supabase y una clave cliente publishable.

Desde la carpeta descomprimida:

```bash
git init -b main
git add .
git commit -m "Document RigGO 12.3.7 architecture snapshot"
git remote add origin git@github.com:TU_USUARIO/riggo-it-architecture-review.git
git push -u origin main
```

Si se prefiere HTTPS, sustituir la URL remota por `https://github.com/TU_USUARIO/riggo-it-architecture-review.git` y usar la autenticación normal de GitHub. Este paquete ya fue inicializado como repositorio local antes de comprimirse, pero el ZIP distribuido omite `.git` para que sea sencillo inspeccionarlo; por eso el ejemplo inicia un repo nuevo.

## Antes de compartir con IT

1. Comprobar que GitHub indique **Private**.
2. Ejecutar `python3 scripts/verify_snapshot.py`.
3. Compartir el enlace al README y `docs/ARCHITECTURE.md`.
4. Pedir a IT que contraste RLS/grants/Storage y configuración Cloudflare desde sus consolas; esos detalles no están completos en el snapshot.

No conectar Actions para desplegar este repositorio ni ejecutar automáticamente los SQL de `db/`.
