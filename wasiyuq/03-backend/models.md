# Modelos y Relaciones

## Diagrama de Relaciones

```
Team ──┬── Pet              (1:N)
       ├── Announcement     (1:N) [Eventos]
       ├── BlogPost         (1:N)
       ├── Adoption         (1:N)
       ├── Membership       (1:N) [User ↔ Team pivot]
       └── TeamInvitation   (1:N)

User ───┬── Adoption        (1:N) [como adoptante]
        ├── FollowUp        (1:N) [como creador]
        ├── Announcement    (1:N) [como autor]
        ├── BlogPost        (1:N) [como autor]
        ├── TeamInvitation  (1:N) [como invitador]
        └── Membership      (1:N) [membresías a equipos]

Pet ────┬── Adoption        (1:N)
        └── ContactRequest  (1:N)

Adoption ──┬── FollowUp     (1:N)
           ├── Pet          (N:1)
           ├── User         (N:1) [adoptante]
           ├── Team         (N:1)
           └── User         (N:1) [revisor]
```

## Modelos Detallados

### Pet (Mascota)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | bigint | PK |
| `team_id` | bigint FK | Organización dueña |
| `name` | string | Nombre |
| `slug` | string | URL amigable (único) |
| `species` | enum | `dog`, `cat`, `rabbit`, `bird`, `other` |
| `breed` | string | Raza |
| `age_years` | integer | Años |
| `age_months` | integer | Meses |
| `gender` | string | `male`, `female` |
| `size` | enum | `small`, `medium`, `large` |
| `color` | string | Color |
| `description` | text | Descripción |
| `medical_notes` | text | Notas médicas |
| `status` | enum | `available`, `adopted`, `reserved`, `medical`, `temporary` |
| `photos` | json | Array de rutas de fotos |
| `deleted_at` | timestamp | Soft delete |

**Método especial:** `generateUniqueSlug(name, exceptId?)` — genera slug único incrementando contador si existe.

### Adoption (Solicitud de Adopción)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | bigint | PK |
| `pet_id` | bigint FK | Mascota solicitada |
| `user_id` | bigint FK | Adoptante |
| `team_id` | bigint FK | Organización |
| `status` | enum | `pending`, `approved`, `rejected`, `completed`, `cancelled` |
| `motivation` | text | Motivación para adoptar |
| `experience_with_pets` | bool | Experiencia previa |
| `has_yard` | bool | Tiene patio |
| `housing_type` | string | Tipo de vivienda |
| `family_composition` | string | Composición familiar |
| `notes` | text | Notas internas |
| `reviewed_by` | bigint FK | Quién revisó |
| `reviewed_at` | datetime | Fecha de revisión |
| `acta_path` | string | Ruta del acta (PDF) |
| `deleted_at` | timestamp | Soft delete |

### FollowUp (Seguimiento)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | bigint | PK |
| `adoption_id` | bigint FK | Adopción relacionada |
| `scheduled_date` | date | Fecha programada |
| `completed_date` | date | Fecha realizada |
| `status` | enum | `pending`, `completed`, `missed` |
| `notes` | text | Notas de la visita |
| `photos` | json | Fotos de la visita |
| `created_by` | bigint FK | Usuario que creó |

### Team (Organización/Equipo)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | bigint | PK |
| `name` | string | Nombre |
| `slug` | string | URL amigable |
| `is_personal` | bool | Si es equipo personal del usuario |
| `bio` | text | Descripción de la organización |
| `logo` | string | URL del logo |
| `website` | string | Sitio web |
| `phone` | string | Teléfono |
| `address` | string | Dirección |
| `city` | string | Ciudad |
| `state` | string | Departamento/Región |
| `social_links` | json | Redes sociales |
| `deleted_at` | timestamp | Soft delete |

### Enumeraciones

| Enum | Valores |
|---|---|
| `AdoptionStatus` | `pending`, `approved`, `rejected`, `completed`, `cancelled` |
| `AnnouncementType` | `adoption_drive`, `fundraiser`, `workshop`, `other` |
| `FollowUpStatus` | `pending`, `completed`, `missed` |
| `PetSize` | `small`, `medium`, `large` |
| `PetSpecies` | `dog`, `cat`, `rabbit`, `bird`, `other` |
| `PetStatus` | `available`, `adopted`, `reserved`, `medical`, `temporary` |
| `TeamRole` | `owner`, `admin`, `member` |
