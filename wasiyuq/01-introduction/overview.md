# Visión General — Wasiyuq

## ¿Qué es Wasiyuq?

**Wasiyuq** (voz quechua que significa *"el que tiene casa"*) es una plataforma web de **adopción responsable de mascotas** enfocada en la región de **Cusco, Perú**. Conecta refugios y organizaciones protectoras de animales con adoptantes potenciales, facilitando todo el proceso: desde la publicación de mascotas disponibles, la postulación, la revisión de solicitudes, hasta el seguimiento post-adopción.

## Propósito

Digitalizar y centralizar la gestión de adopciones de mascotas en Cusco, permitiendo que:

- **Organizaciones** publiquen y administren sus mascotas, eventos y blog
- **Adoptantes** encuentren mascotas, se postulen y reciban seguimiento
- **Administradores** supervisen todo el sistema desde un panel centralizado

## Funcionalidades Principales

### Público (sin autenticación)
- Landing page con estadísticas y mascotas destacadas
- Catálogo de mascotas con filtros por especie, tamaño, edad, ubicación
- Calendario de eventos
- Blog con artículos
- Página "Sobre nosotros"
- Formulario de contacto
- Sitemap XML para SEO

### Autenticación
- Registro y login tradicional (email + contraseña)
- Login con Google (Socialite)
- Passkeys (WebAuthn) para autenticación sin contraseña
- Autenticación de dos factores (2FA)
- Verificación de email
- Recuperación de contraseña

### Postulante (autenticado)
- Postularse a una mascota
- Ver estado de sus postulaciones
- Reportar seguimientos post-adopción

### Organización (team dashboard)
- CRUD completo de mascotas del refugio
- Gestión de solicitudes de adopción (aprobar/rechazar)
- Programación de seguimientos
- Blog y eventos propios de la organización
- Gestión de miembros del equipo

### Administrador Global (super admin)
- Dashboard con estadísticas globales
- CRUD de todas las mascotas (cualquier organización)
- CRUD de organizaciones
- CRUD de eventos y blog (todos)
- Gestión de usuarios y roles
- Seguimientos globales

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Backend** | Laravel 13 (PHP 8.4) |
| **Frontend** | Vue 3 + TypeScript |
| **Bridge** | Inertia.js v3 |
| **UI Kit** | shadcn-vue (New York style, v4) |
| **CSS** | Tailwind CSS v4 |
| **BD** | SQL Server 2019 (Microsoft) |
| **Cache/Queue** | Redis 7 |
| **Storage** | MinIO (S3-compatible) / Local |
| **Email** | Mailpit (dev) |
| **Auth** | Laravel Fortify + Socialite |
| **PWA** | vite-plugin-pwa |
| **Testing** | Pest PHP |
| **Contenedores** | Docker Compose |

## Audiencias y Permisos

| Rol | Acceso | Alcance |
|---|---|---|
| **Visitante** | Público | Ver mascotas, eventos, blog, contacto |
| **Usuario** | Autenticado | Postularse, ver mis adopciones, reportar seguimientos |
| **Miembro de equipo** | Team Dashboard | CRUD del equipo al que pertenece |
| **Admin** | Panel `/admin` | Todo el sistema (super admin) |
