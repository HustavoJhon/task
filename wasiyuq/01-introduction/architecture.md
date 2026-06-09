# Arquitectura del Sistema

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      Navegador Web                          │
│              Vue 3 SPA + Inertia.js v3                      │
├─────────────────────────────────────────────────────────────┤
│                        nginx (:8080)                        │
├─────────────────────────────────────────────────────────────┤
│                      Laravel 13 (PHP 8.4)                   │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Routes  │  │Middleware│  │Controllers│  │  Models  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Inertia │  │  Fortify │  │  Socialite│  │  Queue   │   │
│  │ (SSR)    │  │  (Auth)  │  │  (Google) │  │  (Jobs)  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  SQL Server  │    │    Redis     │    │    MinIO     │
│   (2019)     │    │   (7-alpine) │    │  (S3 API)    │
│  persistente │    │  cache/queue │    │  storage fs  │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Flujo de una Solicitud de Adopción

```
1. Visitante ve mascotas en catálogo público
2. Se registra / inicia sesión
3. Postula a una mascota específica
4. Admin/Organización revisa la solicitud
5. Aprueba o rechaza
6. Si aprueba → se programa seguimiento
7. Post-adopción: visitas de seguimiento programadas
```

## Flujo de Inertia.js

```
Petición HTTP → Laravel Route → Middleware → Controller
  → Render Inertia(page, props) → Vue component
  → HTML enviado al cliente → Vue hidrata SPA
  → Navegación SPA (sin recargar) vía Inertia
```

## Decisiones Técnicas Clave

| Decisión | Razón |
|---|---|
| **Inertia.js** en vez de API REST | Simplicidad, no duplicar validación, SSR sin framework adicional |
| **SQL Server** en vez de MySQL | Requisito del proyecto, compatible con Laravel vía `sqlsrv` PDO |
| **Redis** para cache/queue/session | Alto rendimiento, sesiones compartidas, colas de trabajo |
| **MinIO** para archivos | Almacenamiento S3-compatible local sin depender de AWS |
| **shadcn-vue** + **Tailwind v4** | UI consistente, accesible, theming con CSS variables |
| **Passkeys (WebAuthn)** | Autenticación moderna sin contraseñas |
| **PHP 8.4 + Laravel 13** | Última versión estable del ecosistema Laravel |
