# Wasiyuq — Documentación del Proyecto

> **Wasiyuq** (del quechua: "el que tiene casa") — Plataforma de adopción responsable de mascotas en Cusco, Perú.

---

## Estructura de la documentación

### 1. [Introducción](01-introduction/overview.md)
- Visión general, propósito, funcionalidades principales
- [Arquitectura del sistema](01-introduction/architecture.md) — stack tecnológico, flujo de datos

### 2. [Setup e Instalación](02-setup/)
- [Requisitos del sistema](02-setup/requirements.md)
- [Instalación y puesta en marcha](02-setup/installation.md)
- [Entorno Docker](02-setup/docker.md)

### 3. [Backend (Laravel)](03-backend/)
- [Estructura del backend](03-backend/structure.md)
- [Modelos y relaciones](03-backend/models.md)
- [Controladores](03-backend/controllers.md) — admin, public, dashboard, settings, teams
- [Rutas](03-backend/routes.md) — todos los grupos de rutas
- [Middleware](03-backend/middleware.md) — auth, admin, team membership
- [Form Requests y validación](03-backend/requests.md)
- [Base de datos](03-backend/database.md) — esquema, migraciones, SQL Server
- [Servicios](03-backend/services.md) — lógica de negocio compartida

### 4. [Frontend (Vue 3 + Inertia)](04-frontend/)
- [Estructura del frontend](04-frontend/structure.md)
- [Sistema de layouts](04-frontend/layouts.md)
- [Páginas](04-frontend/pages.md)
- [Componentes UI (shadcn-vue)](04-frontend/components.md)
- [Composables](04-frontend/composables.md)
- [Estilos y theming](04-frontend/styling.md) — Tailwind v4, modo oscuro, PWA

### 5. [Módulos del Sistema](05-modules/)
- [🐕 Mascotas (Pets)](05-modules/pets.md) — CRUD completo, fotos, estados
- [🏢 Organizaciones (Teams)](05-modules/organizations.md) — gestión de organizaciones
- [❤️ Adopciones](05-modules/adoptions.md) — solicitudes, revisión, actas
- [📋 Seguimientos (Follow-ups)](05-modules/followups.md) — visitas post-adopción
- [📅 Eventos](05-modules/events.md) — anuncios y actividades
- [📝 Blog](05-modules/blog.md) — artículos, markdown, categorías
- [👥 Usuarios y Roles](05-modules/users.md) — gestión de usuarios y permisos
- [🔐 Autenticación](05-modules/auth.md) — Fortify, Google Login, Passkeys, 2FA
- [📬 Contacto](05-modules/contact.md) — formulario de contacto público

### 6. [Páginas Públicas](06-public/)
- [Páginas](06-public/pages.md) — home, mascotas, eventos, blog, sobre-nosotros, contacto
- [Características](06-public/features.md) — SEO, sitemap, PWA, meta tags

### 7. [Panel Admin](07-admin/)
- [Dashboard](07-admin/dashboard.md) — estadísticas y gráficos
- [Perfil](07-admin/profile.md) — perfil de administrador
- [Roles y permisos](07-admin/roles.md)

### 8. [Dashboard por Organización](08-dashboard-team/)
- [Resumen](08-dashboard-team/overview.md) — CRUDs por equipo/organización

### 9. [Infraestructura](09-infrastructure/)
- [Docker](09-infrastructure/docker.md) — servicios, redes, volúmenes
- [Colas y Jobs](09-infrastructure/queue.md) — Redis, jobs programados
- [PWA](09-infrastructure/pwa.md) — service worker, offline
- [Almacenamiento](09-infrastructure/storage.md) — local + MinIO (S3-compatible)

### 10. [Testing](10-testing/testing.md)
- Pest PHP, tests de autenticación, equipos, settings

---

## Comandos rápidos

```bash
# Desarrollo (4 procesos simultáneos)
composer dev

# Build frontend
npm run build

# Lint
composer lint

# Tests
composer test
```
