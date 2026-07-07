# Wasiyuq — Documentación del Proyecto

> **Wasiyuq** (del quechua: "el que tiene casa") — Plataforma de adopción responsable de mascotas en Cusco, Perú.

---
### WASIYUQ — Transformación Digital e Innovación Social

[![Wasiyuq](https://img.shields.io/badge/wasiyuq.com-2D6A4F?style=for-the-badge)](http://wasiyuq.com)
 
 **Problema.** En Cusco hay más de 100,000 animales abandonados. Las adopciones se gestionan informalmente por redes sociales, sin verificación de adoptantes ni seguimiento. Los refugios carecen de herramientas digitales para publicar mascotas, evaluar postulantes y dar trazabilidad al proceso. Muchos animales adoptados terminan nuevamente en la calle.

**Solución.** Wasiyuq (quechua: "el que tiene casa") digitaliza el ciclo completo de adopción responsable. Conecta municipalidades, refugios y ciudadanos en un sistema que cubre desde la publicación de la mascota hasta 12 meses de seguimiento post-adopción con 5 hitos automatizados. Cada postulación evalúa el hogar del adoptante y al aprobarse genera automáticamente el acta legal de adopción.

**Innovación.** Seguimiento post-adopción de 12 meses con hitos programados automáticamente. Evaluación estructurada del hogar del adoptante. Generación automática de documentos legales. Plataforma multi-organización donde cada entidad opera de forma independiente con control granular de permisos por miembro del equipo.

**Impacto social.** Cada adopción incluye verificación del hogar, contrato y acompañamiento continuo, reduciendo el abandono recurrente. La plataforma visibiliza refugios, facilita campañas de esterilización y educa sobre tenencia responsable. Alineado con los ODS 3 (salud), 11 (ciudades sostenibles) y 15 (vida de ecosistemas).

**Potencial.** Diseñada para escalar a nuevas ciudades sin modificar su estructura. Modelo SaaS con suscripción para municipalidades. Los datos de seguimiento generan evidencia publicable en revistas científicas. Expansión futura: geolocalización de extraviados y telemedicina veterinaria.

**Resumen.** Wasiyuq es la primera plataforma peruana que digitaliza el ciclo completo de adopción responsable, conectando municipalidades, refugios y ciudadanos con 12 meses de seguimiento post-adopción, verificación del hogar y generación automática de documentos legales. Transforma un proceso informal en un sistema transparente que salva vidas animales y protege la salud pública. Escalable a nivel nacional.

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
