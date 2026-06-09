# Páginas del Frontend

## Estructura Completa

```
pages/
├── Admin/                           # Panel super admin (29 archivos)
│   ├── Dashboard.vue                # Dashboard con stats y tendencias
│   ├── Adoptions/
│   │   ├── Index.vue                # Lista con filtros y gráficos
│   │   └── Show.vue                 # Detalle con preguntas y seguimientos
│   ├── Blog/
│   │   ├── Index.vue                # Lista con búsqueda
│   │   ├── Create.vue               # Formulario con markdown editor
│   │   ├── Edit.vue                 # Editar artículo
│   │   └── Show.vue                 # Detalle con markdown renderizado
│   ├── Events/
│   │   ├── Index.vue                # Lista con tipo coloreado
│   │   ├── Create.vue               # Formulario con secciones
│   │   ├── Edit.vue                 # Editar evento
│   │   └── Show.vue                 # Detalle con hero
│   ├── FollowUps/
│   │   ├── Index.vue                # Lista con búsqueda
│   │   ├── Create.vue               # Formulario con selector adopción
│   │   ├── Edit.vue                 # Editar seguimiento
│   │   └── Show.vue                 # Detalle con fotos
│   ├── Organizations/
│   │   ├── Index.vue                # Lista con stats
│   │   ├── Create.vue               # Formulario de creación
│   │   ├── Edit.vue                 # Editar organización
│   │   └── Show.vue                 # Detalle con stats y miembros
│   ├── Pets/
│   │   ├── Index.vue                # Lista con filtros y gráficos
│   │   ├── Create.vue               # Formulario con foto preview
│   │   ├── Edit.vue                 # Editar mascota
│   │   └── Show.vue                 # Detalle con galería
│   ├── Profile/
│   │   └── Index.vue                # Perfil con inline theme toggle
│   ├── Roles/
│   │   ├── Index.vue                # Roles list
│   │   └── Show.vue                 # Detalle de rol
│   └── Users/
│       ├── Index.vue                # Lista de usuarios
│       └── Show.vue                 # Detalle con adopciones
├── Adopter/                         # Panel del adoptante (3 archivos)
│   ├── Applications/
│   │   └── Index.vue                # Mis postulaciones
│   └── FollowUp/
│       ├── Index.vue                # Mis seguimientos
│       └── Show.vue                 # Detalle seguimiento
├── auth/                            # Autenticación (7 archivos)
│   ├── Login.vue                    # Login
│   ├── Register.vue                 # Registro
│   ├── ForgotPassword.vue           # Olvidé contraseña
│   ├── ResetPassword.vue            # Resetear contraseña
│   ├── TwoFactorChallenge.vue       # Desafío 2FA
│   ├── VerifyEmail.vue              # Verificar email
│   └── ConfirmPassword.vue          # Confirmar contraseña
├── Dashboard/                       # Dashboard por org (14 archivos)
│   ├── Adoptions/
│   │   ├── Index.vue
│   │   └── Show.vue
│   ├── Blog/
│   │   ├── Index.vue, Create.vue, Edit.vue, Show.vue
│   ├── Events/
│   │   ├── Index.vue, Create.vue, Edit.vue, Show.vue
│   └── FollowUp/
│       ├── Index.vue, Show.vue
├── Public/                          # Páginas públicas (8 archivos)
│   ├── Home.vue                     # Landing page
│   ├── About.vue                    # Sobre nosotros
│   ├── Contact.vue                  # Contacto
│   ├── Blog/
│   │   ├── Index.vue                # Blog list
│   │   └── Show.vue                 # Artículo detalle
│   ├── Events/
│   │   ├── Index.vue                # Eventos list
│   │   └── Show.vue                 # Evento detalle
│   └── Pets/
│       ├── Index.vue                # Mascotas list
│       └── Show.vue                 # Mascota detalle
├── settings/                        # Configuración (3 archivos)
│   ├── Appearance.vue               # Tema (claro/oscuro/sistema)
│   ├── Profile.vue                  # Editar perfil
│   └── Security.vue                 # Seguridad y contraseña
├── teams/                           # Equipos (2 archivos)
│   ├── Edit.vue                     # Editar equipo
│   └── Index.vue                    # Lista de equipos
├── Dashboard.vue                    # Dashboard principal de org
├── Welcome.vue                      # Página de bienvenida
└── Teams/
    └── Pets/
        ├── Index.vue                # Mascotas del team
        └── Create.vue               # Crear mascota en team
```

Total: **~74 archivos Vue**
