# 17 - Infraestructura Docker

## Visión General

La plataforma EsSalud Laravel utiliza Docker Compose para orquestar todos los servicios necesarios en entornos de desarrollo y producción. La arquitectura contempla 10 servicios contenerizados que trabajan en conjunto: aplicación PHP-FPM, servidor web Nginx, base de datos MySQL, cache Redis, base de datos vectorial Qdrant, almacenamiento S3 MinIO, worker de colas, scheduler, y monitoreo con Prometheus + Grafana.

## docker-compose.yml Completo

```yaml
version: '3.8'

networks:
  essalud-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16

volumes:
  mysql-data:
    driver: local
  redis-data:
    driver: local
  qdrant-data:
    driver: local
  minio-data:
    driver: local
  prometheus-data:
    driver: local
  grafana-data:
    driver: local
  app-storage:
    driver: local

services:
  # ============================================================
  # 1. PHP-FPM Application (Laravel 11)
  # ============================================================
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: development          # Cambiar a 'production' para producción
    container_name: essalud-app
    restart: unless-stopped
    working_dir: /var/www/html
    volumes:
      - .:/var/www/html            # Código fuente (montado en dev)
      - app-storage:/var/www/html/storage
    environment:
      - APP_ENV=${APP_ENV:-local}
      - APP_DEBUG=${APP_DEBUG:-true}
      - APP_URL=${APP_URL:-http://localhost:8081}
      - DB_CONNECTION=mysql
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_DATABASE=${DB_DATABASE:-essalud}
      - DB_USERNAME=${DB_USERNAME:-essalud_user}
      - DB_PASSWORD=${DB_PASSWORD:-secret}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=null
      - QDRANT_HOST=qdrant
      - QDRANT_PORT=6333
      - QDRANT_COLLECTION=essalud_docs
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OPENAI_MODEL=${OPENAI_MODEL:-gpt-4-turbo}
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY:-minioadmin}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY:-minioadmin}
      - MINIO_BUCKET=${MINIO_BUCKET:-essalud}
      - MAIL_MAILER=${MAIL_MAILER:-log}
      - SESSION_DRIVER=redis
      - QUEUE_CONNECTION=redis
      - CACHE_DRIVER=redis
      - FILESYSTEM_DISK=${FILESYSTEM_DISK:-minio}
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
      qdrant:
        condition: service_healthy
      minio:
        condition: service_healthy
    networks:
      - essalud-network

  # ============================================================
  # 2. Nginx Web Server
  # ============================================================
  nginx:
    image: nginx:1.25-alpine
    container_name: essalud-nginx
    restart: unless-stopped
    ports:
      - "${NGINX_PORT:-8081}:80"
    volumes:
      - .:/var/www/html
      - ./docker/nginx/conf.d:/etc/nginx/conf.d:ro
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/nginx/fastcgi_params:/etc/nginx/fastcgi_params:ro
    depends_on:
      - app
    networks:
      - essalud-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s

  # ============================================================
  # 3. MySQL 8 Database
  # ============================================================
  mysql:
    image: mysql:8.0
    container_name: essalud-mysql
    restart: unless-stopped
    ports:
      - "${DB_PORT:-3306}:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-rootsecret}
      MYSQL_DATABASE: ${DB_DATABASE:-essalud}
      MYSQL_USER: ${DB_USERNAME:-essalud_user}
      MYSQL_PASSWORD: ${DB_PASSWORD:-secret}
    volumes:
      - mysql-data:/var/lib/mysql
      - ./docker/mysql/my.cnf:/etc/mysql/conf.d/my.cnf:ro
      - ./docker/mysql/init:/docker-entrypoint-initdb.d:ro
    networks:
      - essalud-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${DB_ROOT_PASSWORD:-rootsecret}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
      - --default-authentication-plugin=mysql_native_password
      - --max-connections=200
      - --innodb-buffer-pool-size=512M
      - --innodb-log-file-size=256M
      - --slow-query-log=1
      - --slow-query-log-file=/var/log/mysql/slow.log
      - --long-query-time=2

  # ============================================================
  # 4. Redis 7 Cache & Session & Queue
  # ============================================================
  redis:
    image: redis:7-alpine
    container_name: essalud-redis
    restart: unless-stopped
    ports:
      - "${REDIS_PORT:-6380}:6379"
    volumes:
      - redis-data:/data
      - ./docker/redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
    command: redis-server /usr/local/etc/redis/redis.conf
    networks:
      - essalud-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    sysctls:
      - net.core.somaxconn=1024

  # ============================================================
  # 5. Qdrant Vector Database (RAG)
  # ============================================================
  qdrant:
    image: qdrant/qdrant:v1.7
    container_name: essalud-qdrant
    restart: unless-stopped
    ports:
      - "${QDRANT_HTTP_PORT:-6333}:6333"
      - "${QDRANT_GRPC_PORT:-6334}:6334"
    volumes:
      - qdrant-data:/qdrant/storage
      - ./docker/qdrant/config.yaml:/qdrant/config/production.yaml:ro
    environment:
      QDRANT__SERVICE__GRPC_PORT: 6334
      QDRANT__LOG_LEVEL: INFO
    networks:
      - essalud-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6333/health"]
      interval: 15s
      timeout: 10s
      retries: 5
      start_period: 20s

  # ============================================================
  # 6. MinIO S3-Compatible Storage
  # ============================================================
  minio:
    image: minio/minio:latest
    container_name: essalud-minio
    restart: unless-stopped
    ports:
      - "${MINIO_API_PORT:-9002}:9000"
      - "${MINIO_CONSOLE_PORT:-9003}:9001"
    volumes:
      - minio-data:/data
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY:-minioadmin}
    command: server /data --console-address ":9001"
    networks:
      - essalud-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 15s
      timeout: 10s
      retries: 5
      start_period: 20s

  # ============================================================
  # 7. MinIO Bucket Setup (one-off init container)
  # ============================================================
  minio-setup:
    image: minio/mc:latest
    container_name: essalud-minio-setup
    depends_on:
      minio:
        condition: service_healthy
    entrypoint: >
      /bin/sh -c "
      /usr/bin/mc config host add essalud http://minio:9000 ${MINIO_ACCESS_KEY:-minioadmin} ${MINIO_SECRET_KEY:-minioadmin};
      /usr/bin/mc mb --ignore-existing essalud/${MINIO_BUCKET:-essalud};
      /usr/bin/mc anonymous set download essalud/${MINIO_BUCKET:-essalud}/public;
      /usr/bin/mc anonymous set private essalud/${MINIO_BUCKET:-essalud}/private;
      exit 0;
      "
    networks:
      - essalud-network

  # ============================================================
  # 8. Laravel Queue Worker
  # ============================================================
  queue-worker:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    container_name: essalud-queue-worker
    restart: unless-stopped
    working_dir: /var/www/html
    volumes:
      - .:/var/www/html
      - app-storage:/var/www/html/storage
    environment:
      - APP_ENV=${APP_ENV:-local}
      - DB_CONNECTION=mysql
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_DATABASE=${DB_DATABASE:-essalud}
      - DB_USERNAME=${DB_USERNAME:-essalud_user}
      - DB_PASSWORD=${DB_PASSWORD:-secret}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - QDRANT_HOST=qdrant
      - QDRANT_PORT=6333
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY:-minioadmin}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY:-minioadmin}
      - MINIO_BUCKET=${MINIO_BUCKET:-essalud}
      - QUEUE_CONNECTION=redis
    command: php artisan queue:work redis --queue=default,ocr,embeddings,notifications,exports --sleep=3 --tries=3 --max-time=3600 --max-jobs=1000 --rest=1 --memory=256 --timeout=300
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - essalud-network

  # ============================================================
  # 9. Laravel Scheduler (Cron)
  # ============================================================
  scheduler:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    container_name: essalud-scheduler
    restart: unless-stopped
    working_dir: /var/www/html
    volumes:
      - .:/var/www/html
      - app-storage:/var/www/html/storage
    environment:
      - APP_ENV=${APP_ENV:-local}
      - DB_CONNECTION=mysql
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_DATABASE=${DB_DATABASE:-essalud}
      - DB_USERNAME=${DB_USERNAME:-essalud_user}
      - DB_PASSWORD=${DB_PASSWORD:-secret}
      - REDIS_HOST=redis
    command: php artisan schedule:work
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - essalud-network

  # ============================================================
  # 10. Prometheus Monitoring
  # ============================================================
  prometheus:
    image: prom/prometheus:v2.50
    container_name: essalud-prometheus
    restart: unless-stopped
    ports:
      - "${PROMETHEUS_PORT:-9090}:9090"
    volumes:
      - prometheus-data:/prometheus
      - ./docker/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    networks:
      - essalud-network
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:9090/-/healthy"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ============================================================
  # 11. Grafana Dashboards
  # ============================================================
  grafana:
    image: grafana/grafana:10.3
    container_name: essalud-grafana
    restart: unless-stopped
    ports:
      - "${GRAFANA_PORT:-3000}:3000"
    volumes:
      - grafana-data:/var/lib/grafana
      - ./docker/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./docker/grafana/datasources:/etc/grafana/provisioning/datasources:ro
      - ./docker/grafana/grafana.ini:/etc/grafana/grafana.ini:ro
    environment:
      GF_SECURITY_ADMIN_USER: ${GRAFANA_USER:-admin}
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin}
      GF_INSTALL_PLUGINS: grafana-clock-panel,grafana-piechart-panel
    depends_on:
      prometheus:
        condition: service_healthy
    networks:
      - essalud-network
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Dockerfile Multi-Stage

```dockerfile
# ============================================================
# Stage 1: Base PHP image with extensions
# ============================================================
FROM php:8.3-fpm-alpine AS base

LABEL maintainer="EsSalud Dev Team"
LABEL description="EsSalud Laravel 11 Application"

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    git \
    unzip \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    freetype-dev \
    oniguruma-dev \
    libxml2-dev \
    libzip-dev \
    icu-dev \
    imagemagick-dev \
    imagemagick \
    tesseract-ocr \
    tesseract-ocr-data-spa \
    poppler-utils \
    ghostscript \
    ffmpeg \
    jpegoptim \
    optipng \
    pngquant

# Install PHP extensions
RUN docker-php-ext-configure gd \
    --with-freetype \
    --with-jpeg \
    --with-webp && \
    docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_mysql \
    mysqli \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    intl \
    zip \
    xml \
    opcache \
    sockets && \
    pecl install redis imagick && \
    docker-php-ext-enable redis imagick

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# ============================================================
# Stage 2: Development
# ============================================================
FROM base AS development

# Install dev dependencies
RUN apk add --no-cache \
    linux-headers \
    $PHPIZE_DEPS && \
    pecl install xdebug && \
    docker-php-ext-enable xdebug

# Copy PHP configuration
COPY docker/php/conf.d/dev.ini /usr/local/etc/php/conf.d/zzz-custom.ini

# Copy entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]

# ============================================================
# Stage 3: Production
# ============================================================
FROM base AS production

# Copy production PHP configuration
COPY docker/php/conf.d/prod.ini /usr/local/etc/php/conf.d/zzz-custom.ini

# Copy application (excluding dev files via .dockerignore)
COPY . /var/www/html

# Install production dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Copy entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]
```

## Archivo entrypoint.sh

```bash
#!/bin/sh
set -e

echo "==> Iniciando EsSalud Laravel Application..."

# Esperar a que MySQL esté disponible
echo "==> Verificando conexión a MySQL..."
until php -r "new PDO('mysql:host=${DB_HOST};port=${DB_PORT};dbname=${DB_DATABASE}', '${DB_USERNAME}', '${DB_PASSWORD}');" 2>/dev/null; do
    echo "   Esperando MySQL..."
    sleep 2
done
echo "   MySQL conectado."

# Esperar a que Redis esté disponible
echo "==> Verificando conexión a Redis..."
until php -r "new Redis(); \$r = new Redis(); \$r->connect('${REDIS_HOST}', 6379);" 2>/dev/null; do
    echo "   Esperando Redis..."
    sleep 1
done
echo "   Redis conectado."

# Esperar a que Qdrant esté disponible
echo "==> Verificando conexión a Qdrant..."
until curl -s -f "http://${QDRANT_HOST}:6333/health" > /dev/null 2>&1; do
    echo "   Esperando Qdrant..."
    sleep 2
done
echo "   Qdrant conectado."

# Esperar a que MinIO esté disponible
echo "==> Verificando conexión a MinIO..."
until curl -s -f "http://${MINIO_ENDPOINT}/minio/health/live" > /dev/null 2>&1; do
    echo "   Esperando MinIO..."
    sleep 2
done
echo "   MinIO conectado."

# Cache de configuración y rutas (solo en producción)
if [ "${APP_ENV}" = "production" ]; then
    echo "==> Optimizando aplicación para producción..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan event:cache
    php artisan icons:cache
fi

# Ejecutar migraciones (opcional, controlado por variable de entorno)
if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    echo "==> Ejecutando migraciones..."
    php artisan migrate --force --isolated
fi

# Crear storage link si no existe
if [ ! -L "/var/www/html/public/storage" ]; then
    echo "==> Creando storage symlink..."
    php artisan storage:link
fi

# Inicializar colección Qdrant si no existe
echo "==> Verificando colección Qdrant..."
php artisan qdrant:init-collection 2>/dev/null || true

# Ejecutar el comando pasado como argumento
echo "==> Aplicación lista. Ejecutando: $@"
exec "$@"
```

## Configuración de PHP por Entorno

### Desarrollo (`docker/php/conf.d/dev.ini`)

```ini
; Configuración PHP para desarrollo
memory_limit = 512M
max_execution_time = 300
max_input_time = 300
post_max_size = 64M
upload_max_filesize = 64M
max_file_uploads = 50

display_errors = On
display_startup_errors = On
error_reporting = E_ALL
log_errors = On
error_log = /dev/stderr

opcache.enable = 0
opcache.revalidate_freq = 0

xdebug.mode = debug,coverage
xdebug.start_with_request = trigger
xdebug.client_host = host.docker.internal
xdebug.client_port = 9003
xdebug.log = /dev/stderr
xdebug.idekey = PHPSTORM

session.save_handler = redis
session.save_path = "tcp://redis:6379"
session.gc_maxlifetime = 7200
```

### Producción (`docker/php/conf.d/prod.ini`)

```ini
; Configuración PHP para producción
memory_limit = 256M
max_execution_time = 60
max_input_time = 60
post_max_size = 32M
upload_max_filesize = 32M
max_file_uploads = 20

display_errors = Off
display_startup_errors = Off
error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT
log_errors = On
error_log = /var/log/php-error.log

opcache.enable = 1
opcache.memory_consumption = 128
opcache.interned_strings_buffer = 16
opcache.max_accelerated_files = 20000
opcache.revalidate_freq = 60
opcache.fast_shutdown = 1
opcache.enable_cli = 0

session.save_handler = redis
session.save_path = "tcp://redis:6379"
session.gc_maxlifetime = 7200
session.cookie_secure = 1
session.cookie_httponly = 1
session.cookie_samesite = Lax
```

## Configuración Nginx

### `docker/nginx/nginx.conf`

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;

    include /etc/nginx/conf.d/*.conf;
}
```

### `docker/nginx/conf.d/essalud.conf`

```nginx
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=60r/m;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

# Health check endpoint (sin logging)
server {
    listen 80;
    server_name localhost;

    location /health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }
}

# Main application server
server {
    listen 80;
    server_name essalud.local www.essalud.local;
    root /var/www/html/public;

    index index.php index.html;

    charset utf-8;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

    # Static files cache
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        try_files $uri $uri/ =404;
    }

    # Laravel: todas las requests a index.php excepto archivos existentes
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP-FPM
    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass app:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 4 256k;
        fastcgi_busy_buffers_size 256k;
        fastcgi_read_timeout 300;

        # Rate limiting para API
        location ~ ^/api/ {
            limit_req zone=api_limit burst=10 nodelay;
            limit_req_status 429;
        }

        # Rate limiting para auth
        location ~ ^/api/v1/auth/ {
            limit_req zone=auth_limit burst=5 nodelay;
            limit_req_status 429;
        }
    }

    # Denegar acceso a archivos ocultos
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Denegar acceso a archivos sensibles
    location ~* \.(env|log|yml|yaml|xml|json|lock|md|dist|gitattributes|gitignore)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

## Configuración Redis

### `docker/redis/redis.conf`

```
# Redis 7 configuration for EsSalud
bind 0.0.0.0
port 6379
protected-mode no

# Persistence
save 900 1
save 300 10
save 60 10000
dbfilename dump.rdb
dir /data
appendonly yes
appendfsync everysec

# Memory management
maxmemory 512mb
maxmemory-policy allkeys-lru

# Connections
timeout 300
tcp-keepalive 60
maxclients 10000

# Slow log
slowlog-log-slower-than 10000
slowlog-max-len 128

# Latency monitor
latency-monitor-threshold 100

# Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command DEBUG ""
rename-command CONFIG "CONFIG_ESSA"

# Event notifications for cache invalidation
notify-keyspace-events Ex
```

## Variables de Entorno (.env)

```ini
APP_NAME=EsSalud
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8081
APP_TIMEZONE=America/Lima
APP_LOCALE=es
APP_FALLBACK_LOCALE=es
APP_FAKER_LOCALE=es_PE

# Base de datos
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=essalud
DB_USERNAME=essalud_user
DB_PASSWORD=secret
DB_ROOT_PASSWORD=rootsecret

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=null

# Session & Cache
SESSION_DRIVER=redis
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis

# Qdrant Vector DB
QDRANT_HOST=qdrant
QDRANT_PORT=6333
QDRANT_HTTP_PORT=6333
QDRANT_GRPC_PORT=6334
QDRANT_COLLECTION=essalud_docs
QDRANT_VECTOR_SIZE=1536

# OpenAI
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4-turbo
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_MAX_TOKENS=2000
OPENAI_TEMPERATURE=0.5

# MinIO / S3
FILESYSTEM_DISK=minio
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=essalud
MINIO_API_PORT=9002
MINIO_CONSOLE_PORT=9003
AWS_URL=http://localhost:9002/essalud

# Mail
MAIL_MAILER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@essalud.gob.pe"
MAIL_FROM_NAME="EsSalud"

# Puertos
NGINX_PORT=8081

# Monitoreo
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin

# Laravel
BROADCAST_DRIVER=log
LOG_CHANNEL=stack
LOG_LEVEL=debug
```

## Comandos de Uso Diario

### Iniciar todos los servicios

```bash
# Levantar todos los servicios en segundo plano
docker compose up -d

# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f app
docker compose logs -f queue-worker
```

### Construir y reconstruir

```bash
# Reconstruir imágenes después de cambios en Dockerfile
docker compose build

# Reconstruir y levantar (sin cache)
docker compose build --no-cache && docker compose up -d
```

### Comandos Artisan dentro del contenedor

```bash
# Ejecutar migraciones
docker compose exec app php artisan migrate

# Ejecutar seeders
docker compose exec app php artisan db:seed

# Limpiar cache
docker compose exec app php artisan optimize:clear

# Generar app key
docker compose exec app php artisan key:generate

# Crear storage link
docker compose exec app php artisan storage:link

# Ejecutar tests
docker compose exec app php artisan test

# Ejecutar queue worker manualmente (debug)
docker compose exec app php artisan queue:work --queue=default

# Verificar estado de Horizon
docker compose exec app php artisan horizon:status
```

### Acceso a servicios web

| Servicio    | URL                          | Credenciales         |
|-------------|------------------------------|----------------------|
| Aplicación  | http://localhost:8081        | -                    |
| MinIO API   | http://localhost:9002        | minioadmin / minioadmin |
| MinIO Web   | http://localhost:9003        | minioadmin / minioadmin |
| Qdrant      | http://localhost:6333        | -                    |
| Prometheus  | http://localhost:9090        | -                    |
| Grafana     | http://localhost:3000        | admin / admin        |

## Configuración de Prometheus

### `docker/prometheus/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: essalud

alerting:
  alertmanagers:
    - static_configs:
        - targets: []

rule_files: []

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    metrics_path: /metrics

  - job_name: 'mysql'
    static_configs:
      - targets: ['mysql-exporter:9104']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'qdrant'
    static_configs:
      - targets: ['qdrant:6333']
    metrics_path: /metrics
```

## Configuración de Grafana

### `docker/grafana/datasources/prometheus.yml`

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
```

### `docker/grafana/dashboards/dashboards.yml`

```yaml
apiVersion: 1

providers:
  - name: 'EsSalud Dashboards'
    orgId: 1
    folder: 'EsSalud'
    type: file
    disableDeletion: true
    editable: false
    options:
      path: /etc/grafana/provisioning/dashboards
```

## Consideraciones para Producción

1. **Variables de entorno seguras:** todas las claves y passwords deben venir de un secrets manager o variables de entorno del host. Nunca comitear `.env` con datos reales.

2. **Volúmenes persistentes:** en producción, usar volúmenes de Docker con drivers adecuados (EBS en AWS, Persistent Disk en GCP, NFS para almacenamiento compartido).

3. **Logging:** en producción, redirigir logs a stdout/stderr para que Docker los capture. Usar un driver de logging como json-file, syslog, o un agregador como ELK/Loki.

4. **Healthchecks:** todos los servicios tienen healthchecks configurados para que Docker pueda detectar fallos y reiniciar contenedores.

5. **Resource limits:** en producción, agregar límites de CPU y memoria a cada servicio:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

6. **Backups:** configurar backups automáticos de MySQL (con `mysqldump`) y de los volúmenes de MinIO y Qdrant. Los backups deben almacenarse fuera del contenedor.

7. **Actualizaciones:** el stage `production` del Dockerfile copia el código en la imagen. Para CD, se reconstruye la imagen y se redeploya.

8. **Escalado horizontal:** el servicio `app` puede escalarse con `docker compose up -d --scale app=3` para manejar más tráfico. Nginx balancea entre las réplicas si se configura upstream.

9. **Seguridad de red:** en producción, solo exponer los puertos necesarios (80/443 para Nginx). Los demás servicios solo accesibles dentro de la red Docker.

10. **HTTPS:** en producción, Nginx debe terminar SSL con certificados de Let's Encrypt o un load balancer cloud.
