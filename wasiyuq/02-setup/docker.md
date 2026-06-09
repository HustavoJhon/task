# Entorno Docker

## Servicios

| Servicio | Imagen | Propósito |
|---|---|---|
| `app` | Construida desde `docker/php/Dockerfile` | PHP 8.4 FPM con extensiones SQL Server |
| `nginx` | `nginx:alpine` | Servidor web, proxy a PHP-FPM |
| `sqlserver` | `mcr.microsoft.com/mssql/server:2019-latest` | Base de datos principal |
| `redis` | `redis:7-alpine` | Cache, sesiones, colas de trabajo |
| `minio` | `minio/minio` | Almacenamiento S3-compatible (fotos, archivos) |
| `mailpit` | `axllent/mailpit` | Captura de correos en desarrollo |

## Dockerfile PHP (`docker/php/Dockerfile`)

```dockerfile
FROM php:8.4-fpm-bookworm

# Dependencias del sistema
RUN apt-get update && apt-get install -y \
    unzip curl git gnupg libgd-dev libzip-dev libicu-dev ca-certificates

# Drivers Microsoft SQL Server (ODBC 18 + sqlsrv)
RUN curl -sSL https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl -sSL https://packages.microsoft.com/config/debian/12/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update && ACCEPT_EULA=Y apt-get install -y msodbcsql18 unixodbc-dev

RUN pecl install sqlsrv pdo_sqlsrv && docker-php-ext-enable sqlsrv pdo_sqlsrv

# Extensiones PHP
RUN docker-php-ext-install gd zip intl opcache pcntl

# Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
```

## Volúmenes Persistentes

```yaml
volumes:
  sqlserver_data:    # Datos de SQL Server
  redis_data:        # Datos de Redis
  minio_data:        # Archivos subidos (fotos, etc.)
```

## Red

Todos los servicios se comunican en una red Docker interna. La aplicación accede a:
- `sqlserver:1433` — base de datos
- `redis:6379` — cache/queue/session
- `minio:9000` — almacenamiento de archivos
- `mailpit:1025` — envío de correos

## Comandos Docker Útiles

```bash
# Iniciar todos los servicios
docker compose up -d

# Ver logs
docker compose logs -f app

# Reconstruir imagen PHP tras cambios
docker compose build app

# Detener y eliminar volúmenes (¡borra datos!)
docker compose down -v

# Acceder al contenedor app
docker compose exec app bash

# Ejecutar Artisan dentro del contenedor
docker compose exec app php artisan migrate
```
