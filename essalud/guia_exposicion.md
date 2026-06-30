# Guía de Exposición — EsSalud-Laravel (5 min)

---

## 0. Preparación (antes de empezar)

```bash
# Terminal 1 — Servidor
cd ~/Github/hustavojhon/EsSalud-Laravel
docker compose up -d
docker compose run --rm app php artisan migrate:fresh --seed

# Terminal 2 — Tests (listo para ejecutar)
cd ~/Github/hustavojhon/EsSalud-Laravel
alias test="docker compose run --rm -e DB_CONNECTION=sqlite -e DB_DATABASE=/tmp/testdb.sqlite -e SESSION_DRIVER=array app sh -c 'rm -f /tmp/testdb.sqlite && touch /tmp/testdb.sqlite && php artisan migrate:fresh --force --quiet && php artisan db:seed --force --quiet && php vendor/bin/phpunit'"

# Terminal 3 — Navegador en http://localhost:8000
xdg-open http://localhost:8000
```

---

## 1. Introducción — ¿Qué es? (30 seg)

> _"Este proyecto es una **plataforma de trámites digitales para EsSalud** (Seguro Social de Salud del Perú). Permite a los asegurados realizar seguimiento de trámites, chatear con un asistente virtual, subir documentos, y consultar FAQs — todo desde el navegador o desde una **app Android nativa**."_

**Público objetivo:** Asegurados, personal administrativo de EsSalud, operadores.

---

## 2. Stack Tecnológico (30 seg)

| Capa | Tecnología |
|------|-----------|
| Backend | **Laravel 11** (PHP 8.3) |
| Frontend | **Blade** + **Tailwind CSS** + **Alpine.js** |
| App Móvil | **Capacitor** (Android nativo) |
| Base de datos | **MySQL** (producción) / **SQLite** (desarrollo/testing) |
| Vector DB | **Qdrant** (búsqueda semántica para el chatbot) |
| Cache | **Redis** |
| Object Storage | **MinIO** (S3-compatible) |
| Contenedores | **Docker Compose** |
| IA | **OpenAI API** (con modo mock cuando no hay API key) |

---

## 3. Arquitectura y Módulos (1 min)

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│  Blade + Tailwind + Alpine.js + Capacitor        │
├─────────────────────────────────────────────────┤
│              Capa de Servicios                   │
│  ChatService  │  QdrantService  │  OpenAIService │
│  SearchContext │  MatchFAQs     │  Cache         │
├─────────────────────────────────────────────────┤
│           Controladores (Web + API)              │
│  ChatController  │  ProcedureController          │
│  DocumentController  │  Api/*Controllers         │
├─────────────────────────────────────────────────┤
│            Modelos + Migraciones                 │
│  User │ Procedure │ Document │ ChatSession │ FAQ  │
├─────────────────────────────────────────────────┤
│              Infraestructura                     │
│  Docker │ MySQL │ Qdrant │ Redis │ MinIO         │
└─────────────────────────────────────────────────┘
```

**Módulos principales:**

| Módulo | Función |
|--------|---------|
| **Chatbot** | Asistente virtual con matching de FAQs + RAG (Qdrant) + OpenAI. Responde preguntas sobre trámites, subsidios, afiliación. |
| **Trámites** | CRUD de procedimientos con estados (borrador, radicado, en revisión, aprobado, rechazado, subsanación). |
| **Documentos** | Carga, validación y almacenamiento de archivos. Integración con MinIO. |
| **FAQs** | Preguntas frecuentes categorizadas con keywords y búsqueda híbrida (texto + sinónimos). |
| **Usuarios/Roles** | Autenticación con roles: admin, operador, asegurado. Permisos con Spatie. |
| **Mobile UI** | Navegación inferior con FAB, menú "Más" tipo bottom sheet, diseño mobile-first. |

---

## 4. Demo en Vivo (2 min)

### 4.1 Login y Navegación (30 seg)

1. Abrir `http://localhost:8000`
2. **Login como admin:** `admin@essalud.pe` / `Admin123!`
3. Mostrar:
   - Sidebar colapsable en desktop
   - **Bottom nav** en mobile (redimensionar navegador)
   - **FAB central** del Chat
   - **Menú "Más"** con bottom sheet

### 4.2 Chatbot — Pregunta sobre lactancia (45 seg)

1. Ir a **Chat** (desde el FAB o sidebar)
2. Preguntar: _"¿cuál es el monto de subsidio por lactancia?"_
3. **Mostrar respuesta:** _"El monto es de S/ 820.00 por cada hijo nacido vivo..."_
4. Preguntar: _"¿cómo lo cobro?"_
5. **Mostrar respuesta:** _"Si diste a luz en un hospital de EsSalud, el pago es automático..."_
6. Señalar las **Fuentes** (FAQ matched) y el score de confianza.

### 4.3 Trámites y Documentos (30 seg)

1. Ir a **Trámites** → mostrar tabla desktop + **cards mobile**
2. Abrir un trámite → mostrar **información detallada**, acciones, historial
3. Ir a **Documentos** → mostrar lista con estados de validación

### 4.4 Responsive Design (15 seg)

1. Redimensionar a ~375px (iPhone)
2. Mostrar: bottom nav, cards en vez de tabla, botones full-width

---

## 5. Tests (1 min)

### 5.1 Ejecutar tests (15 seg)

```bash
# Desde la raíz del proyecto:
docker compose run --rm -e DB_CONNECTION=sqlite -e DB_DATABASE=/tmp/testdb.sqlite -e SESSION_DRIVER=array app sh -c 'rm -f /tmp/testdb.sqlite && touch /tmp/testdb.sqlite && php artisan migrate:fresh --force --quiet && php artisan db:seed --force --quiet && php vendor/bin/phpunit'
```

### 5.2 Mostrar resultados (15 seg)

```
OK (18 tests, 45 assertions)
```

### 5.3 Explicar qué se testea (30 seg)

| Test | Lo que cubre |
|------|-------------|
| `ChatServiceTest` (6) | Keyword matching, sinónimos, stopwords, preguntas vacías, follow-ups, topic boost |
| `QdrantServiceTest` (3) | Búsqueda vectorial, generación de embeddings, errores de conexión (mocks Guzzle) |
| `ProcedureTest` (7) | CRUD de trámites, autorización por roles, paginación, redirección de invitados |

**Testing stack:** PHPUnit 11, SQLite in-memory, factories (4), Guzzle mocks.

---

## 6. Cierre (30 seg)

> _"El proyecto está **dockerizado** — se despliega con un solo comando. El chatbot funciona **sin API key** (modo mock con respuestas contextuales). La interfaz es **mobile-first** con bottom nav y gestos táctiles. 18 tests unitarios y de feature pasando."_

**Repositorio:** `github.com/HustavoJhon/EsSalud-Laravel`

---

## 7. Posibles Preguntas

| Pregunta | Respuesta |
|----------|-----------|
| ¿Por qué SQLite en local? | MySQL requiere variables de entorno no definidas en local. SQLite da zero-config para desarrollo. |
| ¿El chatbot usa IA real? | Soporta OpenAI, pero si no hay API key usa un mock con 30+ patrones regex y matching de FAQs. |
| ¿Cómo se escala? | Docker Compose → Docker Swarm / Kubernetes. Qdrant y Redis ya están contenerizados. |
| ¿App móvil? | Capacitor genera APK nativo desde el mismo código Laravel. `npx cap open android` para compilar. |
| ¿Los tests son lentos? | SQLite in-memory + sin dependencias externas → ~1.3 segundos para 18 tests. |
