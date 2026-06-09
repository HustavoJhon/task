# Instalación y Puesta en Marcha

## 1. Clonar el repositorio

```bash
git clone <repo-url> wasiyuq
cd wasiyuq
```

## 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env según sea necesario (DB, Redis, MinIO, Mail)
```

Variables clave en `.env`:

```
APP_NAME=Wasiyuq
APP_URL=http://localhost:8080
APP_TIMEZONE=America/Lima
APP_LOCALE=es

DB_CONNECTION=sqlsrv
DB_HOST=sqlserver
DB_PORT=1433
DB_DATABASE=wasiyuq
DB_USERNAME=sa
DB_PASSWORD=your_password

REDIS_HOST=redis
REDIS_PORT=6379

MINIO_ENDPOINT=http://minio:9000
MINIO_BUCKET=wasiyuq
MINIO_KEY=wasiyuq
MINIO_SECRET=your_minio_secret
```

## 3. Iniciar contenedores Docker

```bash
docker compose up -d
```

Esto levanta: `app` (PHP-FPM), `nginx`, `sqlserver`, `redis`, `minio`, `mailpit`.

## 4. Instalar dependencias

```bash
# PHP
composer install

# Node (frontend)
npm install
```

## 5. Generar clave de aplicación y migrar BD

```bash
php artisan key:generate
php artisan migrate --force
```

## 6. Compilar assets

```bash
npm run build
```

## 7. Iniciar servidor de desarrollo

```bash
composer dev
```

Esto ejecuta **4 procesos simultáneos**:
- `php artisan serve --host=localhost` (servidor HTTP)
- `php artisan queue:listen --tries=1 --timeout=0` (cola de trabajos)
- `php artisan pail --timeout=0` (logs en tiempo real)
- `npm run dev` (Vite HMR)

## 8. Acceder

| URL | Descripción |
|---|---|
| `http://localhost:8080` | Aplicación (vía nginx) |
| `http://localhost:8025` | Mailpit (web mail) |
| `http://localhost:9001` | MinIO Console |

## Comandos Útiles

```bash
# Build frontend para producción
npm run build

# Lint PHP
composer lint

# Lint JS/TS
npm run lint

# Tests
composer test

# TypeScript check
npm run types:check

# Formatear frontend
npm run format
```
