# Layouts

## Sistema de Resolución

En `resources/js/app.ts`, cada página resuelve su layout automáticamente según su prefijo:

| Prefijo | Layout |
|---|---|
| `Public/` | `PublicLayout.vue` |
| `auth/` | `AuthLayout.vue` |
| `Dashboard` o `Admin/` o `Dashboard/` | `DashboardLayout.vue` |
| Otros | `PublicLayout.vue` |

## PublicLayout

**Archivo:** `resources/js/layouts/PublicLayout.vue`

Header con navegación completa + footer con links, redes sociales, copyright.

```html
<template>
    <AppHeader />
    <main>
        <slot />
    </main>
    <footer>...</footer>
</template>
```

## AuthLayout

**Archivo:** `resources/js/layouts/AuthLayout.vue`

Elige entre 3 variantes según la página:
- `AuthCardLayout` — formulario centrado (login, register)
- `AuthSimpleLayout` — formulario simple (verify email)
- `AuthSplitLayout` — formulario + branding visual

## DashboardLayout

**Archivo:** `resources/js/layouts/DashboardLayout.vue`

Layout completo con sidebar + header:

```html
<SidebarProvider>
    <AppSidebar />          <!-- Navegación lateral -->
    <SidebarInset>
        <AppHeader />        <!-- Top bar con buscador, team switcher, user menu -->
        <AppContent>        <!-- Contenido principal con breadcrumbs -->
            <slot />
        </AppContent>
    </SidebarInset>
</SidebarProvider>
```

### AppSidebar
- Logo + nombre
- Navegación principal (Dashboard, Mascotas, Adopciones, Seguimientos, Eventos, Blog, Usuarios, Organizaciones, Roles, Perfil)
- Agrupado por secciones
- Colapsable
- Footer con user info

### AppHeader
- Breadcrumbs dinámicos
- CommandPalette (buscador global con atajos de teclado)
- TeamSwitcher (selector de organización activa)
- User menu (perfil, settings, logout)

## Settings Layout

**Archivo:** `resources/js/layouts/settings/Layout.vue`

Sidebar de navegación para settings: Profile, Security, Appearance, Teams.
