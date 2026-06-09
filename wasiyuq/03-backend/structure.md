# Estructura del Backend (Laravel)

```
app/
├── Concerns/
│   ├── GeneratesUniqueTeamSlugs.php   # Generación de slugs únicos para equipos
│   └── HasTeams.php                    # Trait para relación User ↔ Team
├── Enums/
│   ├── AdoptionStatus.php              # pending, approved, rejected, completed, cancelled
│   ├── AnnouncementType.php            # adoption_drive, fundraiser, workshop, other
│   ├── FollowUpStatus.php              # pending, completed, missed
│   ├── PetSize.php                     # small, medium, large
│   ├── PetSpecies.php                  # dog, cat, rabbit, bird, other
│   ├── PetStatus.php                   # available, adopted, reserved, medical, temporary
│   └── TeamRole.php                    # owner, admin, member
├── Http/
│   ├── Controllers/
│   │   ├── Admin/          (10)    # Panel de administración global
│   │   ├── Adopter/        (2)     # Panel del adoptante
│   │   ├── Auth/           (1)     # Social login (Google)
│   │   ├── Dashboard/      (4)     # Dashboard por organización (team-scoped)
│   │   ├── Public/         (7)     # Páginas públicas
│   │   ├── Settings/       (2)     # Configuración de usuario
│   │   ├── Teams/          (4)     # Gestión de equipos/organizaciones
│   │   └── Controller.php          # Base controller
│   ├── Middleware/
│   │   ├── EnsureTeamMembership.php # Verifica membresía al team actual
│   │   └── AdminMiddleware.php      # Verifica is_super_admin
│   └── Requests/
│       ├── Announcement/
│       │   ├── StoreAnnouncementRequest.php
│       │   └── UpdateAnnouncementRequest.php
│       ├── Blog/
│       │   ├── StoreBlogPostRequest.php
│       │   └── UpdateBlogPostRequest.php
│       ├── FollowUp/
│       │   ├── StoreFollowUpRequest.php
│       │   └── UpdateFollowUpRequest.php
│       ├── Pet/
│       │   ├── StorePetRequest.php
│       │   └── UpdatePetRequest.php
│       └── User/
│           └── UpdateUserRoleRequest.php
├── Jobs/
│   └── CheckOverdueMilestonesJob.php   # Job diario para seguimientos vencidos
├── Models/
│   ├── Adoption.php           # Solicitudes de adopción
│   ├── Announcement.php       # Eventos/anuncios
│   ├── BlogPost.php           # Artículos del blog
│   ├── ContactRequest.php     # Solicitudes de contacto
│   ├── FollowUp.php           # Seguimientos post-adopción
│   ├── Membership.php         # Pivot team_members (User ↔ Team)
│   ├── Pet.php                # Mascotas
│   ├── Team.php               # Organizaciones/equipos
│   ├── TeamInvitation.php     # Invitaciones a equipos
│   └── User.php               # Usuarios
└── Services/
    └── PetService.php         # Lógica de negocio de mascotas (público)
```

## Configuraciones Clave

| Archivo | Propósito |
|---|---|
| `config/fortify.php` | Configuración de Laravel Fortify (auth) |
| `config/filesystems.php` | Discos: local, public, minio (S3) |
| `config/database.php` | Conexiones: sqlsrv, redis |
| `config/session.php` | Driver: redis |
| `config/cache.php` | Driver: redis |
| `config/queue.php` | Conexión: redis |
