# Infraestructura

## Docker Compose

| Servicio | Imagen | Puerto expuesto | Depende de |
|---|---|---|---|
| `app` | Build local | — | sqlserver, redis, minio, mailpit |
| `nginx` | nginx:alpine | `8080:80` | app |
| `sqlserver` | mcr.microsoft.com/mssql/server:2019-latest | `1433` | — |
| `redis` | redis:7-alpine | `6379` | — |
| `minio` | minio/minio | `9000` (API), `9001` (Console) | — |
| `mailpit` | axllent/mailpit | `1025` (SMTP), `8025` (Web) | — |

Volúmenes: `sqlserver_data`, `redis_data`, `minio_data`

## Colas y Jobs

### Queue Driver: Redis

Laravel Queue configurado con conexión `redis`, base `2`:
```
QUEUE_CONNECTION=redis
REDIS_QUEUE_DB=2
```

### Jobs Definidos

| Job | Schedule | Descripción |
|---|---|---|
| `CheckOverdueMilestonesJob` | `->daily()` | Marca seguimientos vencidos como `missed` |

### Comando para escuchar colas
```bash
php artisan queue:listen --tries=1 --timeout=0
```
(Ejecutado automáticamente por `composer dev`)

## Redis

| Base | Uso |
|---|---|
| `db0` | Default |
| `db1` | Cache (`CACHE_STORE=redis`) |
| `db2` | Queue (`QUEUE_CONNECTION=redis`) |
| `db3` | Session (`SESSION_DRIVER=redis`) |

## Almacenamiento

### Discos configurados

| Disco | Driver | Default |
|---|---|---|
| `local` | local | `FILESYSTEM_DISK=local` |
| `public` | local (storage link) | Para fotos subidas |
| `minio` | s3 | `FILESYSTEM_CLOUD=minio` |

### MinIO (S3-compatible)
- Endpoint: `http://minio:9000`
- Bucket: `wasiyuq`
- Las fotos de mascotas se guardan en `storage/app/public/pets/`

## PWA

Ver [`06-public/features.md`](../06-public/features.md) para detalles de PWA.

## Makefile

```makefile
setup:  # composer install, .env, key, migrate, npm install, build
dev:    # 4 procesos: server, queue, logs, vite
lint:   # pint --parallel
test:   # config:clear + lint:check + phpunit
prod:   # optimize, route:cache, view:cache, migrate --force, npm build
```

## Notas de Infraestructura

- **Base de datos:** SQL Server 2019 en Docker con driver ODBC 18
- **Timezone:** `America/Lima`
- **Locale:** `es` (español), faker locale `es_PE`
- **App URL:** `http://localhost:8080`
- **SSL/HTTPS:** No configurado (desarrollo local)
