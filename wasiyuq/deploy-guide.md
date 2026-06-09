# Guía de Despliegue — Wasiyuq

> Plataforma de adopción responsable de mascotas en Cusco

---

## Requisitos del servidor

| Recurso | Versión / Detalle |
|---------|-------------------|
| PHP | 8.4+ |
| SQL Server | 2019+ |
| Node.js | 20+ |
| Composer | 2+ |
| Extensión PHP | `pdo_sqlsrv`, `sqlsrv`, `mbstring`, `curl`, `gd`, `zip`, `intl`, `opcache` |

> **Nota**: Sin `pdo_sqlsrv` la aplicación no puede conectarse a SQL Server.

---

## Pasos de instalación

### 1. Clonar el repositorio

```bash
git clone <repo-url> wasiyuq
cd wasiyuq
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
php artisan key:generate
```

Editar `.env` con los valores reales:

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://wasiyuq.raox.cc

DB_CONNECTION=sqlsrv
DB_HOST=127.0.0.1
DB_PORT=1433
DB_DATABASE=wasiyuq
DB_USERNAME=sa
DB_PASSWORD=********

SESSION_DRIVER=file
CACHE_STORE=file
QUEUE_CONNECTION=sync

MAIL_MAILER=smtp
MAIL_HOST=...          # ej. smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=...
MAIL_PASSWORD=...
MAIL_FROM_ADDRESS=noreply@wasiyuq.pe
```

> `SESSION_DRIVER`, `CACHE_STORE` y `QUEUE_CONNECTION` están en `file`/`sync` porque Redis no es requerido. Si tienes Redis, puedes usar `redis`.

### 3. Instalar dependencias

```bash
composer install --no-dev --optimize-autoloader
npm ci && npm run build
```

### 4. Configurar storage

```bash
php artisan storage:link
chmod -R 775 storage bootstrap/cache
```

### 5. Migrar base de datos

```bash
php artisan migrate --force
```

### 6. Cachear configuraciones

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 7. Configurar el servidor web

**Nginx** — apuntar `root` a `wasiyuq/public/`:

```nginx
server {
    listen 80;
    server_name wasiyuq.raox.cc;
    root /var/www/wasiyuq/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.4-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

---

## Post-deploy: verificación

```bash
# Probar health check
curl https://wasiyuq.raox.cc/health
# → {"status":"ok"}

# Verificar logs si hay errores
tail -f storage/logs/laravel.log
```

---

## Notas importantes

- Las fotos de mascotas se almacenan en `storage/app/public/` y se sirven vía el symlink `public/storage`
- El archivo `.env` **nunca debe committeadse** — está en `.gitignore`
- `APP_KEY` debe ser única por entorno (generar con `php artisan key:generate`)
- Si agregas Redis más adelante, cambia `SESSION_DRIVER`, `CACHE_STORE`, `QUEUE_CONNECTION` a `redis`

---

## Troubleshooting común

| Error | Causa | Solución |
|-------|-------|----------|
| `could not find driver` | Falta `pdo_sqlsrv` en PHP | Instalar extensión: `pecl install sqlsrv pdo_sqlsrv` |
| `Class "Redis" not found` | Redis configurado pero no instalado | Cambiar drivers a `file`/`sync` en `.env` |
| `Target class [xxx] does not exist` | Falta `composer dump-autoload` | Ejecutar `composer dump-autoload` |
| Las fotos no cargan (404) | Falta symlink `public/storage` | Ejecutar `php artisan storage:link` |
| Página en blanco / error 500 | Permisos en `storage/` o `bootstrap/cache/` | `chmod -R 775 storage bootstrap/cache` |
