# DOCKER COMPOSE - Infraestructura Containerizada EsSalud v1.0

## 1. Arquitectura de Redes Docker

```mermaid
graph TD
    subgraph "frontend-network"
        NG[Nginx :80 :443]
    end
    
    subgraph "backend-network"
        GW[API Gateway :8000]
        AS[auth-service :8001]
        US[user-service :8002]
        NS[news-service :8003]
        PS[procedure-service :8004]
        CS[chatbot-service :8005]
        DS[document-service :8006]
        CE[Celery Worker]
    end
    
    subgraph "data-network"
        PG[PostgreSQL :5432]
        RE[Redis :6379]
        QD[Qdrant :6333 :6334]
        MI[MinIO :9000 :9001]
        RM[RabbitMQ :5672 :15672]
    end
    
    subgraph "monitoring-network"
        PR[Prometheus :9090]
        GR[Grafana :3000]
        LO[Loki :3100]
        PT[Promtail]
    end

    NG --> GW
    GW --> AS
    GW --> US
    GW --> NS
    GW --> PS
    GW --> CS
    GW --> DS

    AS --> PG
    US --> PG
    NS --> PG
    PS --> PG
    CS --> PG
    DS --> PG

    AS --> RE
    PS --> RE
    CS --> RE
    CE --> RE

    CS --> QD
    
    DS --> MI
    CE --> MI

    AS --> RM
    PS --> RM
    DS --> RM
    CS --> RM
    CE --> RM

    AS --> PR
    US --> PR
    NS --> PR
    PS --> PR
    CS --> PR
    DS --> PR

    PT --> LO
    PT --> NG
    PT --> AS
    
    GR --> PR
    GR --> LO
```

---

## 2. docker-compose.yml (Producción)

```yaml
version: '3.8'

networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge
  data-network:
    driver: bridge
    internal: true
  monitoring-network:
    driver: bridge

volumes:
  postgres-data:
    driver: local
  redis-data:
    driver: local
  qdrant-storage:
    driver: local
  minio-data:
    driver: local
  prometheus-data:
    driver: local
  grafana-data:
    driver: local
  loki-data:
    driver: local

services:
  # ===== API GATEWAY =====
  nginx:
    image: nginx:1.25-alpine
    container_name: essalud-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/error.html:/usr/share/nginx/html/error.html:ro
    networks:
      - frontend-network
      - backend-network
    depends_on:
      api-gateway:
        condition: service_healthy
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  api-gateway:
    build:
      context: ./services/api-gateway
      dockerfile: Dockerfile
    container_name: essalud-api-gateway
    expose:
      - "8000"
    environment:
      - AUTH_SERVICE_URL=http://auth-service:8001
      - USER_SERVICE_URL=http://user-service:8002
      - NEWS_SERVICE_URL=http://news-service:8003
      - PROCEDURE_SERVICE_URL=http://procedure-service:8004
      - CHATBOT_SERVICE_URL=http://chatbot-service:8005
      - DOCUMENT_SERVICE_URL=http://document-service:8006
      - REDIS_URL=redis://redis:6379/0
      - RATE_LIMIT_ENABLED=true
      - RATE_LIMIT_WINDOW=60
      - RATE_LIMIT_MAX=100
    networks:
      - backend-network
      - monitoring-network
    depends_on:
      redis:
        condition: service_healthy
      auth-service:
        condition: service_started
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
    restart: unless-stopped

  # ===== MICROSERVICES =====
  auth-service:
    build:
      context: ./services/auth-service
      dockerfile: Dockerfile
    container_name: essalud-auth-service
    expose:
      - "8001"
    environment:
      - SERVICE_NAME=auth-service
      - DATABASE_URL=postgresql+asyncpg://essalud:essalud_pass@postgres:5432/essalud_auth
      - REDIS_URL=redis://redis:6379/0
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - JWT_ALGORITHM=RS256
      - JWT_ACCESS_EXPIRE_MINUTES=1440
      - JWT_REFRESH_EXPIRE_DAYS=30
      - RENIEC_API_URL=${RENIEC_API_URL}
      - RENIEC_API_KEY=${RENIEC_API_KEY}
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=587
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - RATE_LIMIT_WINDOW=60
      - RATE_LIMIT_MAX_REQUESTS=30
    networks:
      - backend-network
      - data-network
      - monitoring-network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    restart: unless-stopped

  user-service:
    build:
      context: ./services/user-service
      dockerfile: Dockerfile
    container_name: essalud-user-service
    expose:
      - "8002"
    environment:
      - SERVICE_NAME=user-service
      - DATABASE_URL=postgresql+asyncpg://essalud:essalud_pass@postgres:5432/essalud_users
      - REDIS_URL=redis://redis:6379/1
      - JWT_PUBLIC_KEY=${JWT_PUBLIC_KEY}
    networks:
      - backend-network
      - data-network
      - monitoring-network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8002/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    restart: unless-stopped

  news-service:
    build:
      context: ./services/news-service
      dockerfile: Dockerfile
    container_name: essalud-news-service
    expose:
      - "8003"
    environment:
      - SERVICE_NAME=news-service
      - DATABASE_URL=postgresql+asyncpg://essalud:essalud_pass@postgres:5432/essalud_news
      - REDIS_URL=redis://redis:6379/2
    networks:
      - backend-network
      - data-network
      - monitoring-network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8003/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
    restart: unless-stopped

  procedure-service:
    build:
      context: ./services/procedure-service
      dockerfile: Dockerfile
    container_name: essalud-procedure-service
    expose:
      - "8004"
    environment:
      - SERVICE_NAME=procedure-service
      - DATABASE_URL=postgresql+asyncpg://essalud:essalud_pass@postgres:5432/essalud_procedures
      - REDIS_URL=redis://redis:6379/3
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
    networks:
      - backend-network
      - data-network
      - monitoring-network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_started
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8004/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    restart: unless-stopped

  chatbot-service:
    build:
      context: ./services/chatbot-service
      dockerfile: Dockerfile
    container_name: essalud-chatbot-service
    expose:
      - "8005"
    environment:
      - SERVICE_NAME=chatbot-service
      - DATABASE_URL=postgresql+asyncpg://essalud:essalud_pass@postgres:5432/essalud_chatbot
      - REDIS_URL=redis://redis:6379/4
      - QDRANT_URL=http://qdrant:6333
      - QDRANT_COLLECTION=essalud_documents
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OPENAI_EMBEDDING_MODEL=text-embedding-3-small
      - OPENAI_CHAT_MODEL=gpt-4o-mini
      - EMBEDDING_DIMENSIONS=1536
      - CHUNK_SIZE=512
      - CHUNK_OVERLAP=64
      - RAG_SIMILARITY_THRESHOLD=0.75
      - RAG_TOP_K=5
      - CONFIDENCE_THRESHOLD=0.6
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
    networks:
      - backend-network
      - data-network
      - monitoring-network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      qdrant:
        condition: service_started
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8005/health"]
      interval: 30s
      timeout: 15s
      retries: 3
      start_period: 40s
    restart: unless-stopped

  document-service:
    build:
      context: ./services/document-service
      dockerfile: Dockerfile
    container_name: essalud-document-service
    expose:
      - "8006"
    environment:
      - SERVICE_NAME=document-service
      - DATABASE_URL=postgresql+asyncpg://essalud:essalud_pass@postgres:5432/essalud_documents
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
      - MINIO_BUCKET_DOCUMENTS=essalud-documents
      - MINIO_BUCKET_TEMP=essalud-temp-uploads
      - MINIO_PRESIGNED_EXPIRY=60
      - MAX_FILE_SIZE_MB=10
      - ALLOWED_EXTENSIONS=pdf,jpg,jpeg,png
      - OCR_ENABLED=true
      - TESSERACT_LANG=spa
      - RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
    networks:
      - backend-network
      - data-network
      - monitoring-network
    depends_on:
      postgres:
        condition: service_healthy
      minio:
        condition: service_healthy
      rabbitmq:
        condition: service_started
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8006/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    restart: unless-stopped

  celery-worker:
    build:
      context: ./services/document-service
      dockerfile: Dockerfile.worker
    container_name: essalud-celery-worker
    environment:
      - DATABASE_URL=postgresql+asyncpg://essalud:essalud_pass@postgres:5432/essalud_documents
      - REDIS_URL=redis://redis:6379/5
      - CELERY_RESULT_BACKEND=redis://redis:6379/6
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - QDRANT_URL=http://qdrant:6333
      - QDRANT_COLLECTION=essalud_documents
      - CHUNK_SIZE=512
      - CHUNK_OVERLAP=64
      - OCR_ENABLED=true
      - TESSERACT_LANG=spa
    networks:
      - data-network
      - monitoring-network
    depends_on:
      redis:
        condition: service_healthy
      qdrant:
        condition: service_started
      minio:
        condition: service_healthy
    restart: unless-stopped

  # ===== DATA SERVICES =====
  postgres:
    image: postgres:15-alpine
    container_name: essalud-postgres
    expose:
      - "5432"
    environment:
      - POSTGRES_USER=essalud
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-essalud_pass}
      - POSTGRES_MULTIPLE_DATABASES=essalud_auth,essalud_users,essalud_news,essalud_procedures,essalud_chatbot,essalud_documents
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./scripts/init-multiple-dbs.sh:/docker-entrypoint-initdb.d/init-multiple-dbs.sh
    networks:
      - data-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U essalud"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: essalud-redis
    expose:
      - "6379"
    command: redis-server --appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis-data:/data
    networks:
      - data-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s
    restart: unless-stopped

  qdrant:
    image: qdrant/qdrant:v1.7.0
    container_name: essalud-qdrant
    expose:
      - "6333"
      - "6334"
    volumes:
      - qdrant-storage:/qdrant/storage
    networks:
      - data-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:6333/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    container_name: essalud-minio
    expose:
      - "9000"
      - "9001"
    environment:
      - MINIO_ROOT_USER=${MINIO_ACCESS_KEY:-minioadmin}
      - MINIO_ROOT_PASSWORD=${MINIO_SECRET_KEY:-minioadmin123}
    command: server /data --console-address ":9001"
    volumes:
      - minio-data:/data
    networks:
      - data-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
    restart: unless-stopped

  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    container_name: essalud-rabbitmq
    expose:
      - "5672"
      - "15672"
    environment:
      - RABBITMQ_DEFAULT_USER=guest
      - RABBITMQ_DEFAULT_PASS=guest
    volumes:
      - rabbitmq-data:/var/lib/rabbitmq
    networks:
      - data-network
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s
    restart: unless-stopped

  # ===== MONITORING =====
  prometheus:
    image: prom/prometheus:v2.48.0
    container_name: essalud-prometheus
    expose:
      - "9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    networks:
      - monitoring-network
    restart: unless-stopped

  grafana:
    image: grafana/grafana:10.2.0
    container_name: essalud-grafana
    expose:
      - "3000"
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_USER:-admin}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    volumes:
      - grafana-data:/var/lib/grafana
      - ./monitoring/grafana/dashboards:/etc/grafana/provisioning/dashboards:ro
      - ./monitoring/grafana/datasources:/etc/grafana/provisioning/datasources:ro
    networks:
      - monitoring-network
    depends_on:
      - prometheus
      - loki
    restart: unless-stopped

  loki:
    image: grafana/loki:2.9.0
    container_name: essalud-loki
    expose:
      - "3100"
    volumes:
      - ./monitoring/loki-config.yml:/etc/loki/local-config.yaml:ro
      - loki-data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    networks:
      - monitoring-network
    restart: unless-stopped

  promtail:
    image: grafana/promtail:2.9.0
    container_name: essalud-promtail
    volumes:
      - ./monitoring/promtail-config.yml:/etc/promtail/config.yml:ro
      - /var/run/docker.sock:/var/run/docker.sock
    command: -config.file=/etc/promtail/config.yml
    networks:
      - monitoring-network
    depends_on:
      - loki
    restart: unless-stopped
```

---

## 3. docker-compose.override.yml (Desarrollo Local)

```yaml
version: '3.8'

services:
  nginx:
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.dev.conf:/etc/nginx/nginx.conf:ro

  api-gateway:
    build:
      context: ./services/api-gateway
      dockerfile: Dockerfile.dev
    volumes:
      - ./services/api-gateway:/app:delegated
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  auth-service:
    build:
      context: ./services/auth-service
      dockerfile: Dockerfile.dev
    volumes:
      - ./services/auth-service:/app:delegated
    command: uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload

  user-service:
    build:
      context: ./services/user-service
      dockerfile: Dockerfile.dev
    volumes:
      - ./services/user-service:/app:delegated
    command: uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload

  news-service:
    build:
      context: ./services/news-service
      dockerfile: Dockerfile.dev
    volumes:
      - ./services/news-service:/app:delegated
    command: uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload

  procedure-service:
    build:
      context: ./services/procedure-service
      dockerfile: Dockerfile.dev
    volumes:
      - ./services/procedure-service:/app:delegated
    command: uvicorn app.main:app --host 0.0.0.0 --port 8004 --reload

  chatbot-service:
    build:
      context: ./services/chatbot-service
      dockerfile: Dockerfile.dev
    volumes:
      - ./services/chatbot-service:/app:delegated
    command: uvicorn app.main:app --host 0.0.0.0 --port 8005 --reload

  document-service:
    build:
      context: ./services/document-service
      dockerfile: Dockerfile.dev
    volumes:
      - ./services/document-service:/app:delegated
    command: uvicorn app.main:app --host 0.0.0.0 --port 8006 --reload

  celery-worker:
    build:
      context: ./services/document-service
      dockerfile: Dockerfile.dev
    volumes:
      - ./services/document-service:/app:delegated
    command: celery -A worker.app worker --loglevel=info --concurrency=2

  postgres:
    ports:
      - "5432:5432"

  redis:
    ports:
      - "6379:6379"

  qdrant:
    ports:
      - "6333:6333"
      - "6334:6334"

  minio:
    ports:
      - "9000:9000"
      - "9001:9001"

  rabbitmq:
    ports:
      - "5672:5672"
      - "15672:15672"

  grafana:
    ports:
      - "3000:3000"

  prometheus:
    ports:
      - "9090:9090"

  loki:
    ports:
      - "3100:3100"
```

---

## 4. docker-compose.prod.yml (Producción)

```yaml
version: '3.8'

services:
  nginx:
    ports:
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 256M

  api-gateway:
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    environment:
      - ENVIRONMENT=production
      - LOG_LEVEL=INFO

  auth-service:
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    environment:
      - ENVIRONMENT=production

  user-service:
    deploy:
      replicas: 1
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  news-service:
    deploy:
      replicas: 1
      resources:
        limits:
          cpus: '0.25'
          memory: 256M

  procedure-service:
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  chatbot-service:
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
    environment:
      - ENVIRONMENT=production

  document-service:
    deploy:
      replicas: 1
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  celery-worker:
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '1.0'
          memory: 1G

  postgres:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backups:/backups:ro

  redis:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 1G

  qdrant:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G

  minio:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G

  rabbitmq:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

---

## 5. nginx.conf

```nginx
worker_processes auto;
events {
    worker_connections 1024;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logging
    log_format json escape=json '{'
        '"time":"$time_iso8601",'
        '"remote_addr":"$remote_addr",'
        '"remote_user":"$remote_user",'
        '"request":"$request",'
        '"status":$status,'
        '"body_bytes":$body_bytes_sent,'
        '"request_time":$request_time,'
        '"http_referrer":"$http_referer",'
        '"http_user_agent":"$http_user_agent",'
        '"upstream_addr":"$upstream_addr"'
    '}';
    access_log /var/log/nginx/access.log json;
    error_log /var/log/nginx/error.log warn;
    
    # Rate limiting zones
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
    limit_req_zone $binary_remote_addr zone=chat:10m rate=30r/m;
    
    # SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Timeouts
    proxy_connect_timeout 10s;
    proxy_send_timeout 30s;
    proxy_read_timeout 30s;
    
    # Buffers
    proxy_buffer_size 4k;
    proxy_buffers 8 16k;
    proxy_busy_buffers_size 32k;
    
    # Upstreams
    upstream api_gateway {
        server api-gateway:8000;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    server {
        listen 80;
        server_name api.essalud.gob.pe;
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name api.essalud.gob.pe;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        # Rate limiting by endpoint
        location = /auth/login {
            limit_req zone=login burst=3 nodelay;
            proxy_pass http://api_gateway;
        }
        
        location /chat/ {
            limit_req zone=chat burst=5 nodelay;
            proxy_pass http://api_gateway;
        }
        
        location / {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://api_gateway;
        }
        
        # Health check endpoint (no rate limit)
        location /health {
            proxy_pass http://api_gateway/health;
        }
        
        # Static files
        location /static/ {
            root /var/www;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
        
        # Error pages
        error_page 429 /error.html;
        error_page 502 503 504 /error.html;
        
        location = /error.html {
            root /usr/share/nginx/html;
            internal;
        }
    }
}
```

---

## 6. Comandos Útiles

| Tarea | Comando |
|-------|---------|
| Iniciar todos los servicios | `docker compose up -d` |
| Iniciar en desarrollo | `docker compose -f docker-compose.yml -f docker-compose.override.yml up -d` |
| Iniciar producción | `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d` |
| Detener servicios | `docker compose down` |
| Detener y limpiar volúmenes | `docker compose down -v` |
| Ver logs de un servicio | `docker compose logs -f auth-service` |
| Ver logs de todos | `docker compose logs -f` |
| Reconstruir un servicio | `docker compose build auth-service` |
| Reconstruir y reiniciar | `docker compose up -d --build auth-service` |
| Escalar servicio | `docker compose up -d --scale chatbot-service=3` |
| Ver estado | `docker compose ps` |
| Ejecutar comando en servicio | `docker compose exec postgres psql -U essalud` |
| Backup PostgreSQL | `docker compose exec postgres pg_dump -U essalud essalud_auth > backup.sql` |
| Restore PostgreSQL | `docker compose exec -T postgres psql -U essalud essalud_auth < backup.sql` |
| Ver métricas servicio | `docker compose exec auth-service curl localhost:8001/metrics` |
| Ver healthchecks | `docker inspect --format='{{json .State.Health}}' essalud-api-gateway` |

---

## 7. .env.example

```bash
# === PostgreSQL ===
POSTGRES_PASSWORD=essalud_pass_change_me

# === JWT ===
JWT_SECRET_KEY=generate-a-strong-rsa-256-key-pair-here
JWT_PUBLIC_KEY=corresponding-public-key

# === RENIEC API ===
RENIEC_API_URL=https://api.reniec.gob.pe/v1
RENIEC_API_KEY=your-reniec-api-key

# === SMTP ===
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key

# === MinIO ===
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123_change_me

# === OpenAI ===
OPENAI_API_KEY=sk-your-openai-api-key

# === Grafana ===
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin_change_me

# === Environment ===
ENVIRONMENT=development
LOG_LEVEL=DEBUG
```

---

## 8. Referencias Cruzadas

| Archivo | Relación |
|---------|----------|
| [[19_CICD.md]] | Pipeline CI/CD usa estos Docker Compose |
| [[20_OBSERVABILIDAD.md]] | Monitoreo de los servicios |
| [[05_MICROSERVICIOS.md]] | Configuración de cada servicio |
| [[18_OPENAPI_SWAGGER.md]] | APIs expuestas por servicios |

---

#docker #compose #infraestructura #devops #nginx #essalud #v1.0
