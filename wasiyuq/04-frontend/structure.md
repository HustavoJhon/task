# Estructura del Frontend (Vue 3 + TypeScript)

## Entry Point (`resources/js/app.ts`)

```ts
import { createApp, defineAsyncComponent, h } from 'vue';
import { createInertiaApp, Head, Link } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

createInertiaApp({
    resolve: (name) => {
        const page = await resolvePageComponent(
            `./pages/${name}.vue`,
            import.meta.glob('./pages/**/*.vue')
        );
        
        // Resolución automática de layouts
        if (name.startsWith('Public/')) {
            page.default.layout ??= PublicLayout;
        } else if (name.startsWith('auth/')) {
            page.default.layout ??= AuthLayout;
        } else if (name === 'Dashboard' || name.startsWith('Admin/') || name.startsWith('Dashboard/')) {
            page.default.layout ??= DashboardLayout;
        } else {
            page.default.layout ??= PublicLayout;
        }
        return page;
    },
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .mount(el);
    },
    progress: { color: '#2D6A4F' },
});
```

## Sistema de Layouts

| Layout | Archivo | Se aplica a |
|---|---|---|
| **PublicLayout** | `layouts/PublicLayout.vue` | Páginas públicas (home, mascotas, blog, etc.) |
| **AuthLayout** | `layouts/AuthLayout.vue` | Login, registro, verificación, 2FA, etc. |
| **DashboardLayout** | `layouts/DashboardLayout.vue` | Admin (`/admin/*`) y Dashboard por org (`/{team}/*`) |

### DashboardLayout
Incluye: sidebar colapsable, header con buscador global, team switcher, breadcrumbs, notificaciones toast.

## Árbol de Páginas

```
pages/
├── Admin/           (29 archivos) — Panel super admin
├── Adopter/         (3 archivos)  — Panel del adoptante
├── auth/            (7 archivos)  — Autenticación
├── Dashboard/       (14 archivos) — Dashboard por organización
├── Public/          (8 archivos)  — Páginas públicas
├── settings/        (3 archivos)  — Configuración de usuario
├── teams/           (2 archivos)  — Gestión de equipos
├── Dashboard.vue                   — Dashboard de organización
└── Welcome.vue                     — Página de bienvenida
```

## Componentes UI (shadcn-vue)

190+ componentes en `resources/js/components/`, incluyendo:

| Carpeta | Componentes |
|---|---|
| `ui/` | Button, Input, Select, Card, Badge, Dialog, Sheet, Sidebar, Table, Avatar, Tooltip, DropdownMenu, Checkbox, Separator, Skeleton, Spinner, NavigationMenu, Breadcrumb, Alert, InputOTP, Collapsible, Sonner, Label |
| `charts/` | AreaChart, BarChart, DoughnutChart |
| Raíz | AppShell, AppSidebar, AppHeader, AppearanceTabs, TeamSwitcher, CommandPalette, Heading, TextLink, Breadcrumbs, etc. |

## Composición de Páginas Admin

Todas las páginas admin siguen el mismo patrón visual:

```
┌──────────────────────────────────────────────┐
│  Icon + Título + Subtítulo                   │
├──────────────────────────────────────────────┤
│  [Search Input] [Filtros Select] [Limpiar]   │
├──────────────────────────────────────────────┤
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐    │
│  │ Stat 1│ │ Stat 2│ │ Stat 3│ │ Stat 4│    │
│  └───────┘ └───────┘ └───────┘ └───────┘    │
├──────────────────────────────────────────────┤
│  ┌─── Gráfico de barras ───┐ ┌─── Gráfico ─┐│
│  │ (CSS puro)              │ │ (CSS puro)   ││
│  └─────────────────────────┘ └──────────────┘│
├──────────────────────────────────────────────┤
│  ┌── Card ───────────────────────────────┐   │
│  │  Info principal + Badge               │   │
│  │  Metadatos + Acciones                 │   │
│  └───────────────────────────────────────┘   │
│  ...                                         │
├──────────────────────────────────────────────┤
│  Paginación                                  │
└──────────────────────────────────────────────┘
```

## Colores de Marca

| Color | Uso | Hex |
|---|---|---|
| Verde principal | Accents, botones, hover | `#2D6A4F` |
| Verde oscuro | Hover de botones | `#245a40` |
| Verde suave | Fondos de cards | `#2D6A4F]/10` o `/15` |
| Verde gradiente | Fondos modo oscuro | `dark:from-[#2D6A4F]/15` |
