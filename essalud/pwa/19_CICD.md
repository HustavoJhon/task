# 19 - CI/CD con GitHub Actions

## Vision General

El pipeline CI/CD de EsSalud Laravel automatiza la integracion continua (CI) en pull requests y el despliegue continuo (CD) a entornos de staging y produccion usando GitHub Actions. El flujo garantiza calidad de codigo, pruebas automatizadas, y despliegues seguros con zero-downtime.

## Arquitectura de Ramas

```
main (produccion)
  |
  |-- develop (staging/integracion)
       |
       |-- feature/xxx (ramas de funcionalidad)
       |-- fix/xxx (ramas de correccion)
       |-- hotfix/xxx (correcciones urgentes a main)
```

**Reglas de proteccion de ramas:**
- `main`: requiere PR aprobado + CI verde + 1 reviewer + linear history (squash merge).
- `develop`: requiere PR + CI verde (no requiere reviewer para equipos pequenos).
- Ramas de feature: efimeras, se mergean a develop via PR.

## Workflow 1: CI - Integracion Continua

**Archivo:** `.github/workflows/ci.yml`

**Disparadores:** `pull_request` a `main` o `develop`, `push` a ramas `feature/*` y `fix/*`.

```yaml
name: CI - Integracion Continua

on:
  pull_request:
    branches: [main, develop]
    types: [opened, synchronize, reopened]
  push:
    branches: ['feature/**', 'fix/**']
  workflow_dispatch:  # Permite ejecucion manual

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

env:
  PHP_VERSION: '8.3'
  NODE_VERSION: '20'

jobs:
  # ============================================================
  # Job 1: Lint de Codigo PHP
  # ============================================================
  php-lint:
    name: 'Laravel Pint (Lint PHP)'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout codigo
        uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ env.PHP_VERSION }}
          tools: composer:v2
          coverage: none

      - name: Cache de dependencias PHP
        uses: actions/cache@v4
        with:
          path: vendor
          key: php-${{ runner.os }}-${{ hashFiles('composer.lock') }}
          restore-keys: php-${{ runner.os }}-

      - name: Instalar dependencias
        run: composer install --no-progress --prefer-dist

      - name: Ejecutar Laravel Pint
        run: vendor/bin/pint --test --preset=laravel

  # ============================================================
  # Job 2: Analisis Estatico (PHPStan)
  # ============================================================
  phpstan:
    name: 'PHPStan - Analisis Estatico (Level 5)'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout codigo
        uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ env.PHP_VERSION }}
          tools: composer:v2
          coverage: none

      - name: Cache de dependencias PHP
        uses: actions/cache@v4
        with:
          path: vendor
          key: php-${{ runner.os }}-${{ hashFiles('composer.lock') }}
          restore-keys: php-${{ runner.os }}-

      - name: Instalar dependencias
        run: composer install --no-progress --prefer-dist

      - name: Ejecutar PHPStan
        run: vendor/bin/phpstan analyse --level=5 --memory-limit=512M

  # ============================================================
  # Job 3: Tests PHPUnit
  # ============================================================
  phpunit:
    name: 'PHPUnit Tests (SQLite)'
    runs-on: ubuntu-latest
    needs: [php-lint]
    strategy:
      matrix:
        test-suite: [Unit, Feature, Livewire]
      fail-fast: false

    services:
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout codigo
        uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ env.PHP_VERSION }}
          extensions: redis, pdo_sqlite, gd, zip
          tools: composer:v2
          coverage: none

      - name: Cache de dependencias PHP
        uses: actions/cache@v4
        with:
          path: vendor
          key: php-${{ runner.os }}-${{ hashFiles('composer.lock') }}
          restore-keys: php-${{ runner.os }}-

      - name: Instalar dependencias
        run: composer install --no-progress --prefer-dist

      - name: Preparar entorno de test
        run: |
          cp .env.ci .env
          php artisan key:generate

      - name: Ejecutar tests
        run: |
          if [ "${{ matrix.test-suite }}" = "Unit" ]; then
            php artisan test --testsuite=Unit --stop-on-failure --parallel --recreate-databases
          elif [ "${{ matrix.test-suite }}" = "Feature" ]; then
            php artisan test --testsuite=Feature --stop-on-failure
          elif [ "${{ matrix.test-suite }}" = "Livewire" ]; then
            php artisan test --testsuite=Livewire --stop-on-failure
          fi

      - name: Subir reporte de tests
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: test-failure-${{ matrix.test-suite }}
          path: storage/logs/

  # ============================================================
  # Job 4: Build de Assets Frontend
  # ============================================================
  assets-build:
    name: 'Build Assets (Vite/Tailwind)'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout codigo
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Instalar dependencias Node
        run: npm ci

      - name: Build assets
        run: npm run build

      - name: Verificar build
        run: |
          if [ ! -f public/build/manifest.json ]; then
            echo "ERROR: Build de assets fallo - manifest.json no encontrado"
            exit 1
          fi
          echo "Build de assets exitoso."

      - name: Subir assets compilados
        uses: actions/upload-artifact@v4
        with:
          name: assets-build
          path: public/build/
          retention-days: 3

  # ============================================================
  # Job 5: Verificacion de Migraciones
  # ============================================================
  migration-check:
    name: 'Verificar Migraciones'
    runs-on: ubuntu-latest
    needs: [php-lint]
    steps:
      - name: Checkout codigo
        uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ env.PHP_VERSION }}
          extensions: pdo_sqlite
          tools: composer:v2

      - name: Instalar dependencias
        run: composer install --no-progress --prefer-dist

      - name: Verificar migraciones fresh + seed
        run: |
          cp .env.ci .env
          php artisan key:generate
          php artisan migrate:fresh --seed --force
          echo "Migracion fresh completada exitosamente."

  # ============================================================
  # Job 6: Reporte de Resultados (Gate final)
  # ============================================================
  ci-result:
    name: 'Resultado CI'
    runs-on: ubuntu-latest
    needs: [php-lint, phpstan, phpunit, assets-build, migration-check]
    if: always()
    steps:
      - name: Verificar resultados
        run: |
          if [ "${{ needs.php-lint.result }}" != "success" ] || \
             [ "${{ needs.phpstan.result }}" != "success" ] || \
             [ "${{ needs.phpunit.result }}" != "success" ] || \
             [ "${{ needs.assets-build.result }}" != "success" ] || \
             [ "${{ needs.migration-check.result }}" != "success" ]; then
            echo "Algunos jobs fallaron. Revisa los logs."
            exit 1
          fi
          echo "Todos los checks pasaron exitosamente!"
```

---

## Workflow 2: CD Staging

**Archivo:** `.github/workflows/cd-staging.yml`

**Disparador:** `push` a `develop`.

```yaml
name: CD - Deploy a Staging

on:
  push:
    branches: [develop]
  workflow_dispatch:

concurrency:
  group: cd-staging
  cancel-in-progress: false

env:
  PHP_VERSION: '8.3'
  STAGING_HOST: ${{ secrets.STAGING_HOST }}
  STAGING_USER: ${{ secrets.STAGING_USER }}
  STAGING_PATH: '/var/www/essalud-staging'

jobs:
  deploy-staging:
    name: 'Deploy a Staging'
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.essalud.gob.pe

    steps:
      - name: Checkout codigo
        uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ env.PHP_VERSION }}
          tools: composer:v2

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.STAGING_SSH_KEY }}

      - name: Agregar host a known_hosts
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -H ${{ env.STAGING_HOST }} >> ~/.ssh/known_hosts

      - name: Desplegar a Staging
        run: |
          ssh ${{ env.STAGING_USER }}@${{ env.STAGING_HOST }} << 'DEPLOY_SCRIPT'
            set -e
            echo "=== Iniciando deploy a Staging ==="
            echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"

            cd /var/www/essalud-staging

            # Activar modo mantenimiento
            php artisan down --message="Actualizando sistema..." --retry=60

            # Pull de cambios
            echo "=== Pull de cambios desde develop ==="
            git fetch origin develop
            git reset --hard origin/develop

            # Instalar dependencias PHP
            echo "=== Instalando dependencias PHP ==="
            composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

            # Instalar dependencias Node y build assets
            echo "=== Build assets frontend ==="
            npm ci
            npm run build

            # Ejecutar migraciones
            echo "=== Ejecutando migraciones ==="
            php artisan migrate --force --isolated

            # Limpiar y regenerar cache
            echo "=== Optimizando cache ==="
            php artisan optimize:clear
            php artisan config:cache
            php artisan route:cache
            php artisan view:cache
            php artisan event:cache
            php artisan icons:cache

            # Recrear storage link
            php artisan storage:link

            # Reiniciar queue workers
            echo "=== Reiniciando queue workers ==="
            php artisan queue:restart

            # Reindexar Qdrant (solo si hubo cambios en documentos)
            if git diff --name-only HEAD~1 HEAD | grep -q "app/Services/Qdrant\|database/seeders"; then
              echo "=== Reindexando Qdrant ==="
              php artisan rag:reindex
            fi

            # Activar aplicacion
            php artisan up

            echo "=== Deploy a Staging completado ==="
          DEPLOY_SCRIPT

      - name: Health Check
        run: |
          echo "=== Verificando health check ==="
          for i in $(seq 1 10); do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://staging.essalud.gob.pe/health || echo "000")
            if [ "$STATUS" = "200" ]; then
              echo "Health check OK (status $STATUS)"
              exit 0
            fi
            echo "Intento $i/10: status $STATUS. Esperando..."
            sleep 5
          done
          echo "ERROR: Health check fallo despues de 10 intentos"
          exit 1

      - name: Smoke Tests
        run: |
          echo "=== Ejecutando smoke tests ==="

          # Verificar pagina de login
          LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://staging.essalud.gob.pe/login)
          if [ "$LOGIN_STATUS" != "200" ]; then
            echo "ERROR: Login page status $LOGIN_STATUS"
            exit 1
          fi
          echo "Login page: OK"

          # Verificar API health
          API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://staging.essalud.gob.pe/api/v1/faq)
          if [ "$API_STATUS" != "200" ]; then
            echo "ERROR: API FAQ status $API_STATUS"
            exit 1
          fi
          echo "API FAQ: OK"

          # Verificar pagina de FAQ
          FAQ_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://staging.essalud.gob.pe/faq)
          if [ "$FAQ_STATUS" != "200" ]; then
            echo "ERROR: FAQ page status $FAQ_STATUS"
            exit 1
          fi
          echo "FAQ page: OK"

          echo "Todos los smoke tests pasaron."

      - name: Notificar resultado (Slack)
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Deploy a Staging: ${{ job.status == 'success' && 'EXITOSO :rocket:' || 'FALLIDO :x:' }}\nCommit: ${{ github.sha }}\nBranch: develop\n${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

  # ============================================================
  # Job de verificacion de base de datos
  # ============================================================
  db-verify:
    name: 'Verificar Base de Datos'
    runs-on: ubuntu-latest
    needs: [deploy-staging]
    steps:
      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.STAGING_SSH_KEY }}

      - name: Agregar host a known_hosts
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -H ${{ env.STAGING_HOST }} >> ~/.ssh/known_hosts

      - name: Verificar conexion DB
        run: |
          ssh ${{ env.STAGING_USER }}@${{ env.STAGING_HOST }} << 'EOF'
            cd /var/www/essalud-staging
            php artisan db:show --database=mysql || exit 1
            php artisan db:monitor || exit 1
            echo "Base de datos OK."
          EOF
```

---

## Workflow 3: CD Produccion

**Archivo:** `.github/workflows/cd-production.yml`

**Disparador:** `push` a `main` (con aprobacion manual requerida via environment protection rules).

```yaml
name: CD - Deploy a Produccion

on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: cd-production
  cancel-in-progress: false

env:
  PHP_VERSION: '8.3'
  PROD_HOST: ${{ secrets.PROD_HOST }}
  PROD_USER: ${{ secrets.PROD_USER }}
  PROD_PATH: '/var/www/essalud'
  RELEASE_PATH: '/var/www/essalud/releases'
  BACKUP_PATH: '/var/www/essalud/backups'

jobs:
  # ============================================================
  # Job de aprobacion manual (solo si no es workflow_dispatch)
  # ============================================================
  approval:
    name: 'Aprobacion de Deploy'
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    environment:
      name: production
    steps:
      - name: Confirmacion de deploy
        run: |
          echo "Deploy a produccion aprobado."
          echo "Commit: ${{ github.sha }}"
          echo "Autor: ${{ github.actor }}"

  # ============================================================
  # Job: Deploy con Zero-Downtime
  # ============================================================
  deploy-production:
    name: 'Deploy a Produccion'
    runs-on: ubuntu-latest
    needs: [approval]
    if: always() && (needs.approval.result == 'success' || github.event_name == 'workflow_dispatch')
    environment:
      name: production
      url: https://essalud.gob.pe

    steps:
      - name: Checkout codigo
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.PROD_SSH_KEY }}

      - name: Agregar host a known_hosts
        run: |
          mkdir -p ~/.ssh
          ssh-keyscan -H ${{ env.PROD_HOST }} >> ~/.ssh/known_hosts

      - name: Deploy Zero-Downtime
        id: deploy
        run: |
          ssh ${{ env.PROD_USER }}@${{ env.PROD_HOST }} << 'DEPLOY_SCRIPT'
            set -e
            echo "========================================"
            echo "  DEPLOY A PRODUCCION - EsSalud"
            echo "========================================"
            echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
            echo ""

            RELEASE_DIR="/var/www/essalud/releases/$(date '+%Y%m%d_%H%M%S')"
            CURRENT_DIR="/var/www/essalud/current"
            BACKUP_DIR="/var/www/essalud/backups"

            # 1. Backup de base de datos
            echo "=== Paso 1: Backup de base de datos ==="
            mkdir -p $BACKUP_DIR
            BACKUP_FILE="$BACKUP_DIR/db_backup_$(date '+%Y%m%d_%H%M%S').sql.gz"
            mysqldump -u ${DB_USERNAME} -p${DB_PASSWORD} -h ${DB_HOST} ${DB_DATABASE} | gzip > $BACKUP_FILE
            echo "Backup creado: $BACKUP_FILE ($(du -h $BACKUP_FILE | cut -f1))"
            # Mantener solo los ultimos 7 backups
            ls -t $BACKUP_DIR/db_backup_*.sql.gz | tail -n +8 | xargs -r rm

            # 2. Clonar repositorio en nueva release
            echo "=== Paso 2: Clonando codigo en nueva release ==="
            mkdir -p $RELEASE_DIR
            git clone --depth 1 --branch main git@github.com:essalud/essalud-laravel.git $RELEASE_DIR
            cd $RELEASE_DIR

            # 3. Instalar dependencias
            echo "=== Paso 3: Instalando dependencias ==="
            composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --quiet
            npm ci --quiet
            npm run build

            # 4. Copiar archivos de entorno y configuraciones
            echo "=== Paso 4: Configurando entorno ==="
            cp $CURRENT_DIR/.env $RELEASE_DIR/.env
            cp -r $CURRENT_DIR/storage/app $RELEASE_DIR/storage/app 2>/dev/null || true
            ln -sfn $CURRENT_DIR/storage/app/public $RELEASE_DIR/public/storage

            # 5. Crear symlinks necesarios
            echo "=== Paso 5: Creando symlinks ==="
            chmod -R 775 $RELEASE_DIR/storage
            chmod -R 775 $RELEASE_DIR/bootstrap/cache

            # 6. Ejecutar migraciones
            echo "=== Paso 6: Ejecutando migraciones ==="
            php artisan migrate --force --isolated

            # 7. Optimizar
            echo "=== Paso 7: Optimizando cache ==="
            php artisan config:cache
            php artisan route:cache
            php artisan view:cache
            php artisan event:cache
            php artisan icons:cache

            # 8. Hacer el switch atomico
            echo "=== Paso 8: Switch atomico (symlink current) ==="
            ln -sfn $RELEASE_DIR $CURRENT_DIR

            # 9. Reiniciar servicios
            echo "=== Paso 9: Reiniciando servicios ==="
            php artisan queue:restart
            sudo systemctl reload php8.3-fpm
            sudo systemctl reload nginx

            # 10. Limpiar releases antiguos (mantener ultimos 5)
            echo "=== Paso 10: Limpiando releases antiguos ==="
            ls -dt /var/www/essalud/releases/*/ | tail -n +6 | xargs -r rm -rf

            echo ""
            echo "========================================"
            echo "  DEPLOY COMPLETADO EXITOSAMENTE"
            echo "  Release: $RELEASE_DIR"
            echo "========================================"
          DEPLOY_SCRIPT

      - name: Health Check Produccion
        id: healthcheck
        run: |
          echo "=== Verificando health check de produccion ==="
          for i in $(seq 1 15); do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://essalud.gob.pe/health || echo "000")
            if [ "$STATUS" = "200" ]; then
              echo "Health check OK (intento $i, status $STATUS)"
              echo "health_status=ok" >> $GITHUB_OUTPUT
              exit 0
            fi
            echo "Intento $i/15: status $STATUS. Esperando 5s..."
            sleep 5
          done
          echo "health_status=failed" >> $GITHUB_OUTPUT
          echo "ERROR: Health check fallo despues de 15 intentos"
          exit 1

      - name: Rollback (si health check falla)
        if: failure() && steps.deploy.outcome == 'success'
        run: |
          echo "=== EJECUTANDO ROLLBACK AUTOMATICO ==="
          ssh ${{ env.PROD_USER }}@${{ env.PROD_HOST }} << 'ROLLBACK'
            set -e
            echo "Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
            CURRENT="/var/www/essalud/current"
            RELEASES="/var/www/essalud/releases"

            # Obtener release anterior (el penultimo directorio)
            PREVIOUS=$(ls -dt $RELEASES/*/ | head -2 | tail -1)
            if [ -z "$PREVIOUS" ]; then
              echo "ERROR: No hay release anterior para hacer rollback"
              exit 1
            fi

            echo "Revirtiendo a release anterior: $PREVIOUS"
            ln -sfn $PREVIOUS $CURRENT

            # Restaurar backup de BD si es necesario
            LATEST_BACKUP=$(ls -t /var/www/essalud/backups/db_backup_*.sql.gz | head -1)
            if [ -f "$LATEST_BACKUP" ]; then
              echo "Restaurando base de datos desde backup: $LATEST_BACKUP"
              zcat $LATEST_BACKUP | mysql -u ${DB_USERNAME} -p${DB_PASSWORD} -h ${DB_HOST} ${DB_DATABASE}
            fi

            # Reiniciar servicios
            sudo systemctl reload php8.3-fpm
            sudo systemctl reload nginx

            echo "Rollback completado a: $PREVIOUS"
          ROLLBACK

      - name: Smoke Tests
        if: steps.healthcheck.outputs.health_status == 'ok'
        run: |
          echo "=== Ejecutando smoke tests de produccion ==="

          endpoints=(
            "https://essalud.gob.pe:200"
            "https://essalud.gob.pe/login:200"
            "https://essalud.gob.pe/faq:200"
            "https://essalud.gob.pe/api/v1/faq:200"
            "https://essalud.gob.pe/api/v1/news:200"
          )

          FAILED=0
          for endpoint in "${endpoints[@]}"; do
            URL=$(echo $endpoint | cut -d: -f1,2)
            EXPECTED=$(echo $endpoint | cut -d: -f3)
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
            if [ "$STATUS" != "$EXPECTED" ]; then
              echo "FAIL: $URL -> status $STATUS (esperado $EXPECTED)"
              FAILED=1
            else
              echo "OK: $URL -> status $STATUS"
            fi
          done

          if [ $FAILED -eq 1 ]; then
            echo "ERROR: Algunos smoke tests fallaron"
            exit 1
          fi
          echo "Todos los smoke tests pasaron."

      - name: Notificar resultado (Slack)
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Deploy a Produccion: ${{ job.status == 'success' && 'EXITOSO :tada:' || 'FALLIDO :rotating_light:' }}\nBranch: main\nCommit: ${{ github.sha }}\nAutor: ${{ github.actor }}\n${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_PRODUCTION }}
```

---

## Variables de Entorno `.env.ci` para Tests

```ini
APP_NAME=EsSalud
APP_ENV=testing
APP_DEBUG=true
APP_URL=http://localhost
APP_KEY=

# Base de datos de testing (SQLite en memoria)
DB_CONNECTION=sqlite
DB_DATABASE=:memory:

# Redis para tests
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Queues - sync para tests
QUEUE_CONNECTION=sync

# Cache
CACHE_DRIVER=array
SESSION_DRIVER=array

# Simular servicios externos
OPENAI_API_KEY=sk-test-placeholder
QDRANT_HOST=localhost
QDRANT_PORT=6333

# Almacenamiento local
FILESYSTEM_DISK=local

# Broadcasting (deshabilitado en tests)
BROADCAST_DRIVER=log

# Mail (log para tests)
MAIL_MAILER=array
```

## Secrets Requeridos en GitHub

Los siguientes secrets deben configurarse en Settings > Secrets and variables > Actions:

| Secret Name                   | Descripcion                                    | Entorno      |
|-------------------------------|------------------------------------------------|--------------|
| `STAGING_SSH_KEY`             | Clave SSH privada para acceso al servidor staging | Staging    |
| `STAGING_HOST`                | IP o dominio del servidor staging              | Staging      |
| `STAGING_USER`                | Usuario SSH del servidor staging               | Staging      |
| `PROD_SSH_KEY`                | Clave SSH privada para acceso al servidor prod | Produccion   |
| `PROD_HOST`                   | IP o dominio del servidor produccion           | Produccion   |
| `PROD_USER`                   | Usuario SSH del servidor produccion            | Produccion   |
| `DB_USERNAME`                 | Usuario de base de datos (staging y prod)      | Ambos        |
| `DB_PASSWORD`                 | Password de base de datos (staging y prod)     | Ambos        |
| `DB_HOST`                     | Host de base de datos                          | Ambos        |
| `DB_DATABASE`                 | Nombre de base de datos                        | Ambos        |
| `SLACK_WEBHOOK`               | Webhook de Slack para notificaciones staging   | Staging      |
| `SLACK_WEBHOOK_PRODUCTION`    | Webhook de Slack para notificaciones prod      | Produccion   |
| `OPENAI_API_KEY`              | API key de OpenAI (solo en .env del servidor)  | Ambos        |

## Environment Protection Rules

En GitHub Settings > Environments:

### Staging Environment
- Sin reglas de proteccion estrictas (deploy automatico desde develop).
- URL: `https://staging.essalud.gob.pe`.
- Solo secrets de staging accesibles.

### Production Environment
- **Required reviewers:** minimo 1, se recomienda 2.
- **Wait timer:** 0 minutos (la aprobacion manual es suficiente).
- **Deployment branches:** solo `main`.
- URL: `https://essalud.gob.pe`.
- Solo secrets de produccion accesibles.

## Configuracion del Servidor para Zero-Downtime

### Estructura de directorios en el servidor

```
/var/www/essalud/
├── current -> /var/www/essalud/releases/20260621_143000  (symlink)
├── releases/
│   ├── 20260620_120000/
│   ├── 20260621_090000/
│   └── 20260621_143000/    (release actual)
├── backups/
│   ├── db_backup_20260620_120000.sql.gz
│   └── db_backup_20260621_143000.sql.gz
├── shared/
│   ├── .env                    (archivo de entorno)
│   ├── storage/                (storage persistente entre releases)
│   └── uploads/                (uploads de usuarios)
└── scripts/
    └── deploy.sh
```

### Configuracion de Nginx

```nginx
server {
    listen 80;
    server_name essalud.gob.pe;
    root /var/www/essalud/current/public;
    index index.php;

    # El root siempre apunta al symlink 'current'
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

## Monitoreo Post-Deploy

Despues de cada deploy, se recomienda monitorear:

1. **Logs de errores:** `tail -f /var/log/nginx/error.log` y `tail -f storage/logs/laravel.log`
2. **Metricas de aplicacion:** Prometheus + Grafana (ver File 17)
3. **Horizon dashboard:** `/horizon` para monitoreo de queues
4. **Telescope:** monitoreo de requests, queries, jobs (solo staging/dev)
5. **Sentry / Bugsnag:** tracking de errores en produccion
6. **New Relic / Datadog:** APM para performance

## Comandos Utiles para Debug de CI/CD

```bash
# Ejecutar CI localmente con act
act pull_request

# Ejecutar un job especifico
act -j phpunit

# Ejecutar con secrets
act -s STAGING_SSH_KEY="$(cat ~/.ssh/id_rsa)" pull_request

# Verificar sintaxis del workflow
act --dryrun

# Debug de SSH
ssh -v usuario@servidor

# Ver releases en servidor
ls -la /var/www/essalud/releases/
ls -la /var/www/essalud/current

# Ver logs de deploy
grep "DEPLOY" /var/log/syslog
```

## Mejores Practicas de CI/CD

1. **Build una vez, deploya muchas veces:** el artifact compilado se genera una vez en CI y se promueve a staging y produccion. En nuestro caso usamos symlink strategy.

2. **Inmutabilidad de releases:** cada release es un directorio nuevo, no se modifica en caliente. El rollback es instantaneo (cambiar el symlink).

3. **Migraciones compatibles hacia atras:** las migraciones deben ser no-destructivas. Nunca renombrar columnas en una migracion (usar 3 pasos: agregar nueva, copiar datos, eliminar vieja en siguiente deploy).

4. **Health checks robustos:** no basta con verificar HTTP 200. El health check debe verificar conexion a BD, Redis, y Qdrant.

5. **Alertas tempranas:** configurar alertas en Slack/Discord/email para cualquier fallo de deploy.

6. **Rollback automatizado:** si el health check falla post-deploy, el rollback es automatico. No requiere intervencion manual inmediata (aunque se debe investigar la causa).

7. **Secretos encriptados:** nunca loguear secretos. Usar `::add-mask::` en GitHub Actions si es necesario mostrar valores sensibles en logs.

8. **Concurrency control:** usar `concurrency` para evitar deploys simultaneos al mismo entorno.

9. **Entorno de staging identico a prod:** misma configuracion de PHP, mismas extensiones, mismas variables (con datos anonimizados).

10. **Documentar rollbacks manuales:** tener un runbook claro para rollback manual en caso de que el automatico falle.
