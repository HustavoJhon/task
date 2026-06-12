# CI/CD - Integración y Despliegue Continuo EsSalud v1.0

## 1. Diagrama del Pipeline

```mermaid
flowchart LR
    PR[Pull Request] --> CI[CI Pipeline]
    CI --> LINT[Lint + Type Check]
    LINT --> TEST[Unit Tests]
    TEST --> INTEG[Integration Tests]
    INTEG --> BUILD[Build Docker Images]
    BUILD --> PUSH[Push to GHCR]
    
    PUSH --> STAGING{Deploy Staging}
    STAGING -->|Auto merge develop| DEPLOY_STG[Deploy to Staging]
    
    DEPLOY_STG --> E2E[E2E Tests]
    E2E --> APPROVAL{Manual Approval}
    APPROVAL -->|Approve| PROD[Deploy to Production]
    APPROVAL -->|Reject| ROLLBACK[Rollback]
    
    PROD --> HEALTH[Health Check]
    HEALTH --> MONITOR[Monitoring]
    
    MONITOR -->|Issues| ROLLBACK
```

---

## 2. Estrategia de Branching (GitFlow Adaptado)

```
main ──────────────────────●────────────────────────●── (producción)
  \                      / \                      /
   develop ─────●────●───────●────●────●──────────    (staging)
     \         /    \         /    \    /
      feature/*  feature/*  feature/*  hotfix/*
```

| Rama | Propósito | Deploy | Protegida |
|------|-----------|:------:|:---------:|
| `main` | Código en producción | Producción | ✅ (protegida) |
| `develop` | Integración continua | Staging | ✅ (protegida) |
| `feature/*` | Desarrollo de funcionalidades | No | ❌ |
| `hotfix/*` | Correcciones urgentes | Producción directa | ❌ |
| `release/*` | Preparación de release | Staging | ❌ |

### Reglas de Merge
- `feature/*` → `develop`: Requiere PR aprobado + tests pasando
- `develop` → `main`: Requiere PR aprobado + tests + aprobación manual
- `hotfix/*` → `main` + backport a `develop`
- Commits directos a `main` o `develop`: prohibidos

---

## 3. GitHub Actions Workflows

### 3.1 ci.yml — Integración Continua

```yaml
name: CI Pipeline

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [develop]

env:
  PYTHON_VERSION: "3.11"
  FLUTTER_VERSION: "3.19"
  REGISTRY: ghcr.io
  IMAGE_NAME: essalud

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-22.04
    
    strategy:
      matrix:
        service: [auth-service, user-service, news-service, 
                  procedure-service, chatbot-service, document-service]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Install dependencies
        run: |
          cd services/${{ matrix.service }}
          pip install -r requirements-dev.txt
          pip install ruff mypy
      
      - name: Ruff linter
        run: |
          cd services/${{ matrix.service }}
          ruff check . --output-format=github
      
      - name: MyPy type check
        run: |
          cd services/${{ matrix.service }}
          mypy . --ignore-missing-imports
      
      - name: Format check
        run: |
          cd services/${{ matrix.service }}
          ruff format --check .

  flutter-lint:
    name: Flutter Lint
    runs-on: ubuntu-22.04
    
    defaults:
      run:
        working-directory: flutter_app
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
      
      - name: Get dependencies
        run: flutter pub get
      
      - name: Analyze
        run: flutter analyze
      
      - name: Format
        run: dart format --set-exit-if-changed .

  unit-tests:
    name: Unit Tests
    needs: [lint]
    runs-on: ubuntu-22.04
    
    strategy:
      matrix:
        service: [auth-service, user-service, news-service,
                  procedure-service, chatbot-service, document-service]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Install dependencies
        run: |
          cd services/${{ matrix.service }}
          pip install -r requirements-dev.txt
      
      - name: Run unit tests
        run: |
          cd services/${{ matrix.service }}
          pytest tests/unit/ -v --cov=app --cov-report=xml --cov-fail-under=80
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: services/${{ matrix.service }}/coverage.xml
          flags: ${{ matrix.service }}
      
      - name: Run security scan (Bandit)
        run: |
          cd services/${{ matrix.service }}
          bandit -r app/ -f json -o bandit-report.json

  flutter-tests:
    name: Flutter Tests
    needs: [flutter-lint]
    runs-on: ubuntu-22.04
    
    defaults:
      run:
        working-directory: flutter_app
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
      
      - name: Get dependencies
        run: flutter pub get
      
      - name: Run tests
        run: flutter test --coverage --machine > test-results.json
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: flutter_app/coverage
          flags: flutter

  integration-tests:
    name: Integration Tests
    needs: [unit-tests]
    runs-on: ubuntu-22.04
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: test_pass
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}
      
      - name: Install test dependencies
        run: pip install -r services/requirements-integration.txt
      
      - name: Run integration tests
        run: |
          pytest tests/integration/ -v --timeout=120
        env:
          DATABASE_URL: postgresql+asyncpg://postgres:test_pass@localhost:5432/postgres
          REDIS_URL: redis://localhost:6379/0

  docker-build:
    name: Build Docker Images
    needs: [integration-tests, flutter-tests]
    runs-on: ubuntu-22.04
    
    strategy:
      matrix:
        service: [api-gateway, auth-service, user-service, news-service,
                  procedure-service, chatbot-service, document-service]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to GitHub Container Registry
        uses: docker/login-actions@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ github.repository }}/${{ matrix.service }}
          tags: |
            type=sha,format=short
            type=ref,event=branch
            type=ref,event=pr
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: services/${{ matrix.service }}
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  security-scan:
    name: Security Scan
    needs: [docker-build]
    runs-on: ubuntu-22.04
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Run SonarQube scan
        uses: sonarsource/sonarcloud-github-action@v2
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      
      - name: Run Trivy vulnerability scan
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'
```

### 3.2 cd-staging.yml — Deploy a Staging

```yaml
name: CD Staging

on:
  push:
    branches: [develop]

env:
  REGISTRY: ghcr.io
  IMAGE_TAG: ${{ github.sha }}

jobs:
  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-22.04
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.STAGING_SSH_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H ${{ secrets.STAGING_HOST }} >> ~/.ssh/known_hosts
      
      - name: Deploy via Docker Compose
        run: |
          ssh ${{ secrets.STAGING_USER }}@${{ secrets.STAGING_HOST }} '
            cd /opt/essalud
            docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps --build
            docker system prune -f
          '
      
      - name: Health check
        run: |
          sleep 30
          curl -f https://staging.essalud.gob.pe/health || exit 1
      
      - name: Run smoke tests
        run: |
          cd tests/smoke
          pip install -r requirements.txt
          pytest smoke_test.py --base-url=https://staging.essalud.gob.pe
```

### 3.3 cd-prod.yml — Deploy a Producción

```yaml
name: CD Production

on:
  push:
    tags:
      - 'v*.*.*'

env:
  REGISTRY: ghcr.io
  IMAGE_TAG: ${{ github.ref_name }}

jobs:
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-22.04
    
    environment: production
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Wait for approval
        uses: trstringer/manual-approval@v1
        with:
          secret: ${{ secrets.GITHUB_TOKEN }}
          approvers: ${{ vars.PRODUCTION_APPROVERS }}
          minimum-approvals: 2
          issue-title: "Deploy v${{ github.ref_name }} to Production"
          issue-body: |
            Release: ${{ github.ref_name }}
            Commit: ${{ github.sha }}
            
            Changelog:
            ${{ github.event.release.body }}
      
      - name: Configure SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.PROD_SSH_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H ${{ secrets.PROD_HOST }} >> ~/.ssh/known_hosts
      
      - name: Create backup
        run: |
          ssh ${{ secrets.PROD_USER }}@${{ secrets.PROD_HOST }} '
            cd /opt/essalud
            docker compose exec postgres pg_dump -U essalud --all > /backups/pre-deploy-${{ github.ref_name }}.sql
          '
      
      - name: Deploy
        run: |
          ssh ${{ secrets.PROD_USER }}@${{ secrets.PROD_HOST }} '
            cd /opt/essalud
            docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps
            docker system prune -f
          '
      
      - name: Health check
        run: |
          for i in {1..12}; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.essalud.gob.pe/health)
            if [ "$STATUS" = "200" ]; then
              echo "Health check passed"
              exit 0
            fi
            echo "Attempt $i: HTTP $STATUS, retrying in 10s..."
            sleep 10
          done
          echo "Health check failed after 12 attempts"
          exit 1
      
      - name: Rollback on failure
        if: failure()
        run: |
          ssh ${{ secrets.PROD_USER }}@${{ secrets.PROD_HOST }} '
            cd /opt/essalud
            docker compose -f docker-compose.yml -f docker-compose.prod.yml down
            docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
          '
          echo "Rollback completed"
```

---

## 4. Quality Gates

| Gate | Herramienta | Threshold | Acción |
|------|------------|:---------:|--------|
| **Cobertura unit tests** | pytest-cov | ≥ 80% | ❌ Fail build |
| **Cobertura Flutter** | flutter test --coverage | ≥ 70% | ❌ Fail build |
| **Code smells** | SonarQube / Ruff | ≤ 20 | ⚠️ Warning |
| **Duplicación** | SonarQube | ≤ 5% | ⚠️ Warning |
| **Vulnerabilidades críticas** | Trivy / Bandit | 0 | ❌ Fail build |
| **Vulnerabilidades altas** | Trivy / Bandit | ≤ 3 | ❌ Fail build |
| **Complejidad ciclomática** | SonarQube / Ruff | ≤ 15 por función | ⚠️ Warning |
| **Documentación API** | OpenAPI diff | Sin breaking changes | ⚠️ Warning |
| **Tests de integración** | pytest | 100% passing | ❌ Fail build |

---

## 5. Tests por Capa

| Tipo | Framework | Propósito | Cobertura Mínima | Tiempo Máximo |
|------|-----------|-----------|:-----------------:|:-------------:|
| **Unitarios (Python)** | pytest + pytest-asyncio | Lógica de negocio, use cases | 80% | 5 min |
| **Unitarios (Flutter)** | flutter_test | Providers, widgets | 70% | 3 min |
| **Integración (Python)** | pytest + TestContainers | API endpoints, DB, Redis | Casos críticos | 10 min |
| **Widget (Flutter)** | flutter_test + mocktail | Pantallas completas | Pantallas principales | 5 min |
| **E2E** | Playwright o detekt | Flujos completos | Happy paths | 15 min |
| **Smoke (post-deploy)** | pytest + requests | Health checks post-deploy | Endpoints críticos | 2 min |

---

## 6. Registro de Imágenes Docker

```
Registro: ghcr.io/{organization}/essalud
Autenticación: GitHub Container Registry token
Política de tags:
  - {sha-short}: build individual
  - develop: último build de develop
  - v*.*.*: releases versionados
Retención: últimos 90 días, releases permanentes
```

---

## 7. Estrategia de Rollback

| Situación | Acción | Tiempo |
|-----------|--------|:------:|
| Health check falla post-deploy | `docker compose up -d` con versión anterior | 2 min |
| Bug crítico en producción | Revertir tag en `docker compose` y reiniciar | 5 min |
| Migración DB falla | Restore desde backup pre-deploy | 10 min |
| API OpenAI caída | Activar fallback FAQ-only vía feature flag | 1 min |

```yaml
# rollback.sh
ROLLBACK_VERSION=$1
echo "Rolling back to version: $ROLLBACK_VERSION"

# Update tags
sed -i "s/:latest/:$ROLLBACK_VERSION/g" docker-compose.prod.yml

# Restart services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --no-deps

# Verify health
./health-check.sh
```

---

## 8. Referencias Cruzadas

| Archivo | Relación |
|---------|----------|
| [[17_DOCKER_COMPOSE.md]] | Docker Compose usado en deploy |
| [[20_OBSERVABILIDAD.md]] | Monitoreo post-deploy |
| [[21_SEGURIDAD_AUDITORIA.md]] | Seguridad en el pipeline |
| [[22_ROADMAP.md]] | Plan de releases |

---

#ci #cd #github #actions #devops #essalud #v1.0
