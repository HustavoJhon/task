# DESIGN DETALLADO - UI/UX Blade + Livewire EsSalud v1.0 Laravel PWA

## 1. Sistema de Diseño

### 1.1 Principios de Diseño

| Principio | Descripción |
|-----------|-------------|
| **Claridad** | El usuario debe entender la interfaz en segundos. Jerarquía visual clara, sin ambigüedades. |
| **Accesibilidad** | WCAG 2.1 AA: contraste mínimo 4.5:1, navegación por teclado, lectores de pantalla. |
| **Consistencia** | Componentes reutilizables con mismo look & feel en toda la plataforma. |
| **Eficiencia** | Mínimo de clics para completar tareas. Flujos optimizados con atajos visuales. |
| **Responsive** | Mobile-first. La plataforma debe funcionar en móvil, tablet y desktop. |
| **Feedback** | Cada acción del usuario recibe respuesta visual inmediata (loading, success, error). |

### 1.2 Stack de Frontend

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Framework CSS** | Tailwind CSS | 3.x |
| **Componentes dinámicos** | Livewire | 3.x |
| **Interactividad JS** | Alpine.js | 3.x (incluido con Livewire) |
| **Iconos** | Blade UI Kit + Heroicons | 2.x |
| **Gráficos** | Chart.js (via Filament) | 4.x |
| **Editor WYSIWYG** | Tiptap o Filament Rich Editor | - |
| **Modales** | Livewire Entangle + Alpine | - |
| **Notificaciones** | Filament Notifications + Laravel Flash | - |
| **Formularios** | Livewire Forms + Laravel Validation | - |

---

## 2. Paleta de Colores — EsSalud Institucional

### 2.1 Colores Primarios

| Nombre | Hex | Tailwind Class | Uso |
|--------|-----|----------------|-----|
| **Azul EsSalud** | `#004B87` | `blue-essalud` | Header, sidebar, botones primarios, links |
| **Azul Claro** | `#0066B3` | `blue-light` | Hover states, elementos interactivos |
| **Azul Fondo** | `#E8F0FE` | `blue-50` | Fondos de secciones, cards info |

### 2.2 Colores Secundarios

| Nombre | Hex | Tailwind Class | Uso |
|--------|-----|----------------|-----|
| **Blanco** | `#FFFFFF` | `white` | Fondos principales, cards en sidebar |
| **Gris Fondo** | `#F5F7FA` | `gray-50` | Fondo general de páginas |
| **Gris Borde** | `#E2E8F0` | `gray-200` | Bordes de cards, inputs, tablas |
| **Gris Texto** | `#4A5568` | `gray-600` | Texto secundario, labels |
| **Gris Oscuro** | `#1A202C` | `gray-900` | Texto principal, headings |

### 2.3 Colores Semánticos

| Nombre | Hex | Tailwind Class | Uso |
|--------|-----|----------------|-----|
| **Éxito** | `#38A169` | `green-600` | Estados APROBADO, mensajes de éxito |
| **Advertencia** | `#D69E2E` | `yellow-600` | Estados PENDIENTE, alertas |
| **Error** | `#E53E3E` | `red-600` | Estados RECHAZADO, errores de validación |
| **Info** | `#3182CE` | `blue-600` | Estados EN_REVISION, información |

### 2.4 Configuración Tailwind (tailwind.config.js)

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'essalud': {
          '50': '#E8F0FE',
          '100': '#C5DBF8',
          '200': '#93B9F2',
          '300': '#6296EC',
          '400': '#3073E6',
          '500': '#0066B3',
          '600': '#005299',
          '700': '#004B87',
          '800': '#003D6E',
          '900': '#002F55',
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
};
```

---

## 3. Tipografía

### 3.1 Escala Tipográfica

| Nivel | Clase Tailwind | Tamaño | Uso |
|-------|---------------|--------|-----|
| **Heading 1** | `text-3xl font-bold` | 30px | Títulos de página |
| **Heading 2** | `text-2xl font-semibold` | 24px | Títulos de sección |
| **Heading 3** | `text-xl font-semibold` | 20px | Títulos de card |
| **Heading 4** | `text-lg font-medium` | 18px | Subtítulos |
| **Body Large** | `text-base` | 16px | Texto de cuerpo principal |
| **Body** | `text-sm` | 14px | Texto secundario, tablas |
| **Caption** | `text-xs` | 12px | Labels, timestamps, badges |
| **Mono** | `font-mono text-sm` | 14px | Códigos, IDs, estados técnicos |

### 3.2 Familias Tipográficas

| Familia | Uso | Carga |
|---------|-----|-------|
| **Inter** (sans-serif) | Texto principal, UI, botones, formularios | Google Fonts, peso 400/500/600/700 |
| **System UI** (fallback) | Fallback si Inter no carga | Sistema operativo |

---

## 4. Componentes Livewire Reutilizables

### 4.1 Catálogo de Componentes

| Componente | Descripción | Props | Estados |
|------------|-------------|-------|---------|
| `<x-button>` | Botón con variantes y tamaños | `variant`, `size`, `icon`, `disabled`, `loading` | default, hover, disabled, loading |
| `<x-input>` | Input con label, hint y error | `label`, `type`, `placeholder`, `error`, `required` | default, focus, error, disabled |
| `<x-select>` | Select con opciones | `label`, `options`, `placeholder`, `error` | default, focus, error |
| `<x-modal>` | Modal con Livewire entangle | `title`, `size`, `wire:key` | open, closing, loading |
| `<x-card>` | Card con header, body, footer | `title`, `padding`, `shadow` | default, hover |
| `<x-table>` | Tabla con sorting y paginación | `headers`, `rows`, `sortable` | loading, empty, error |
| `<x-badge>` | Badge de estado | `variant`, `label` | success, warning, error, info, neutral |
| `<x-alert>` | Alerta de sistema | `type`, `title`, `dismissible` | success, warning, error, info |
| `<x-avatar>` | Avatar de usuario | `src`, `name`, `size` | image, initials, loading |
| `<x-timeline>` | Línea de tiempo de estados | `events`, `current` | complete, current, future |
| `<x-dropzone>` | Zona de drag & drop para upload | `accept`, `maxSize`, `multiple` | default, dragover, uploading, success, error |
| `<x-skeleton>` | Placeholder de carga | `type`, `count` | loading (pulse animation) |
| `<x-empty-state>` | Estado vacío | `icon`, `title`, `description`, `action` | empty |
| `<x-breadcrumb>` | Navegación jerárquica | `items` | default |
| `<x-pagination>` | Paginación de resultados | `paginator` | default |

### 4.2 Ejemplo: Componente Button (button.blade.php)

```html
@props([
    'variant' => 'primary',
    'size' => 'md',
    'icon' => null,
    'disabled' => false,
    'loading' => false,
    'type' => 'button',
])

@php
$baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2';

$variantClasses = match($variant) {
    'primary' => 'bg-essalud-700 text-white hover:bg-essalud-600 focus:ring-essalud-500',
    'secondary' => 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-essalud-500',
    'danger' => 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500',
    'ghost' => 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500',
    'success' => 'bg-green-600 text-white hover:bg-green-500 focus:ring-green-500',
    default => 'bg-essalud-700 text-white hover:bg-essalud-600',
};

$sizeClasses = match($size) {
    'xs' => 'px-2 py-1 text-xs',
    'sm' => 'px-3 py-1.5 text-sm',
    'md' => 'px-4 py-2 text-sm',
    'lg' => 'px-6 py-3 text-base',
    default => 'px-4 py-2 text-sm',
};
@endphp

<button
    type="{{ $type }}"
    {{ $attributes->merge(['class' => "$baseClasses $variantClasses $sizeClasses"]) }}
    @disabled($disabled || $loading)
    wire:loading.attr="disabled"
>
    @if($loading)
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
    @endif
    @if($icon && !$loading)
        <x-dynamic-component :component="$icon" class="h-4 w-4 mr-2" />
    @endif
    {{ $slot }}
</button>
```

---

## 5. Layout Principal

### 5.1 Estructura del Layout

```
┌──────────────────────────────────────────────────────────────┐
│                         TOPBAR                               │
│  [☰]  [Logo EsSalud]              [🔔] [👤 Usuario] [⚙️]   │
├────────────┬─────────────────────────────────────────────────┤
│            │                                                  │
│  SIDEBAR   │            CONTENIDO PRINCIPAL                  │
│            │                                                  │
│  📋 Menú   │   ┌──────────────────────────────────────┐     │
│  ├ Inicio  │   │                                      │     │
│  ├ Chatbot │   │     Área de contenido dinámico       │     │
│  ├ Trámites│   │     (renderizado por Livewire)        │     │
│  ├ Docs    │   │                                      │     │
│  ├ Noticias│   │                                      │     │
│  ├ FAQ     │   │                                      │     │
│  └ Perfil  │   └──────────────────────────────────────┘     │
│            │                                                  │
│  (colapsa │                                                  │
│   en      │                                                  │
│   mobile) │                                                  │
└────────────┴──────────────────────────────────────────────────┘
```

### 5.2 Sidebar — Navegación por Rol

#### Asegurado (ASEG)
```
🏠 Inicio
💬 Chatbot
📋 Mis Trámites
📄 Documentos
📰 Noticias
❓ FAQ
👤 Mi Perfil
```

#### Operador (OPER)
```
📊 Dashboard
📋 Trámites Asignados
📋 Todos los Trámites
📄 Documentos
👤 Mi Perfil
```

#### Supervisor (SUPV)
```
📊 Dashboard KPIs
📋 Gestión de Trámites
👥 Asignaciones
📄 Documentos
📈 Reportes
📝 Auditoría
👤 Mi Perfil
```

#### Gestor Documental (GESDOC)
```
📊 Dashboard
📰 Noticias
❓ FAQ
📄 Catálogo Documental
🤖 Fuentes RAG
👤 Mi Perfil
```

#### Super Admin (SADM) — Panel Filament en /admin
```
Acceso directo a Filament con todos los Resources
```

### 5.3 Topbar

```
┌──────────────────────────────────────────────────────────────┐
│  [☰ colapsar]  [EsSalud Logo]            [🔔 3]  [👤] [⚙️] │
│                                                        │     │
│  Breadcrumb: Inicio > Trámites > Detalle               │     │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Pantallas Principales (Wireframes ASCII)

### 6.1 Login

```
┌──────────────────────────────────────────────────────┐
│                                                       │
│              [Logo EsSalud - Grande]                  │
│                                                       │
│         Plataforma de Atención al Asegurado           │
│                                                       │
│   ┌─────────────────────────────────────────────┐    │
│   │  📧 Correo Electrónico                       │    │
│   │  [___________________________________]       │    │
│   │                                              │    │
│   │  🔒 Contraseña                               │    │
│   │  [___________________________________] [👁]  │    │
│   │                                              │    │
│   │  [✓] Recordarme                             │    │
│   │                                              │    │
│   │  [       INICIAR SESIÓN        ] (azul)     │    │
│   │                                              │    │
│   │  ¿Olvidaste tu contraseña?   |   Registrarse │    │
│   └─────────────────────────────────────────────┘    │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### 6.2 Dashboard Asegurado

```
┌──────────────────────────────────────────────────────────────┐
│  ¡Bienvenido, Juan Pérez!                          [EsSalud] │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ 📋       │  │ ⏳       │  │ ✅       │  │ ⚡ Acceso    │ │
│  │ Trámites │  │ Pendient.│  │ Aprobados│  │ Rápido:      │ │
│  │    3     │  │    1     │  │    2     │  │ [Nuevo Trám.]│ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘ │
│                                                               │
│  ┌─────────────────────────────────┐ ┌──────────────────────┐│
│  │ 📰 Últimas Noticias            │ │ 📋 Mis Trámites      ││
│  │                                 │ │                      ││
│  │ ┌─────────────────────────────┐ │ │ ● Afiliación        ││
│  │ │ 🏥 Nueva cobertura...  2h  │ │ │   Pendiente →       ││
│  │ │ 📝 Requisitos actualiz. 1d │ │ │                      ││
│  │ │ 💉 Campaña vacunación.. 3d │ │ │ ● Lactancia          ││
│  │ └─────────────────────────────┘ │ │   Aprobado ✓         ││
│  │                    [Ver todas]  │ │                      ││
│  └─────────────────────────────────┘ └──────────────────────┘│
│                                                               │
│  💬 ¿Necesitas ayuda? ¡Pregúntale al Chatbot! [Iniciar Chat] │
└──────────────────────────────────────────────────────────────┘
```

### 6.3 Chatbot

```
┌──────────────────────────────────────────────────────────────┐
│  💬 Chatbot EsSalud                           [📥 Exportar]  │
│  Asistente virtual con IA · Respuestas basadas en docs oficiales│
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │              Historial de Conversación               │     │
│  │                                                      │     │
│  │  Sugerencias: [¿Cómo afiliarme?] [Requisitos lact.]  │     │
│  │                                                      │     │
│  │  ┌──────────────────────────────────────┐            │     │
│  │  │ 👤 Usuario                    10:30  │            │     │
│  │  │ ¿Qué documentos necesito para el     │            │     │
│  │  │ trámite de subsidio por maternidad?  │            │     │
│  │  └──────────────────────────────────────┘            │     │
│  │                                                      │     │
│  │  ┌──────────────────────────────────────┐            │     │
│  │  │ 🤖 Chatbot EsSalud            10:31  │            │     │
│  │  │ Para el subsidio por maternidad      │            │     │
│  │  │ necesitas:                           │            │     │
│  │  │ • DNI vigente                        │            │     │
│  │  │ • Certificado de nacimiento          │            │     │
│  │  │ • Formulario 1040-SM                 │            │     │
│  │  │                                      │            │     │
│  │  │ 📎 Fuente: Manual de Prestaciones    │            │     │
│  │  │    Económicas, p.23 (2025)           │            │     │
│  │  │                                      │            │     │
│  │  │ ¿Fue útil? [👍] [👎]                │            │     │
│  │  └──────────────────────────────────────┘            │     │
│  │                                                      │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 💬 Escribe tu consulta aquí...              [📎] [➤]    ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 6.4 Crear Trámite (Wizard)

```
┌──────────────────────────────────────────────────────────────┐
│  📋 Nuevo Trámite                                            │
│  Paso 2 de 4 · Documentos Requeridos                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  ●──●──◉──○                                          │     │
│  │  Tipo  Datos  Docs  Resumen                          │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  📄 Documentos para: Subsidio por Maternidad                 │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │                                                      │     │
│  │   📎 DNI (obligatorio)                   ✓ Subido   │     │
│  │      dni_frontal.pdf - 245 KB                         │     │
│  │                                              [🗑️]    │     │
│  │   ───────────────────────────────────────            │     │
│  │                                                      │     │
│  │   📎 Certificado de Nacimiento (obligatorio)         │     │
│  │                                                      │     │
│  │   ┌────────────────────────────────────┐             │     │
│  │   │       📤 Arrastra tu archivo       │             │     │
│  │   │            o haz clic              │             │     │
│  │   │       PDF, JPG, PNG (máx 10MB)    │             │     │
│  │   └────────────────────────────────────┘             │     │
│  │                                                      │     │
│  │   ───────────────────────────────────────            │     │
│  │   📎 Formulario 1040-SM (obligatorio)    ⚠ Pendiente │     │
│  │                                                      │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  [← Anterior]                          [Siguiente →]          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.5 Detalle de Trámite (Timeline)

```
┌──────────────────────────────────────────────────────────────┐
│  ← Volver    Trámite #TRX-2026-0042                          │
│  Tipo: Subsidio por Maternidad    Estado: EN REVISION        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌────────────────────────────────────┐│
│  │ Timeline         │  │ 📄 Documentos Adjuntos             ││
│  │                  │  │                                    ││
│  │ ● Creado         │  │ 📄 dni_frontal.pdf         245 KB ││
│  │   15/06/2026     │  │ 📄 certificado_nac.pdf     1.2 MB ││
│  │   10:30          │  │ 📄 formulario_1040.pdf     580 KB ││
│  │                  │  │                                    ││
│  │ ● Enviado        │  └────────────────────────────────────┘│
│  │   15/06/2026     │                                         │
│  │   10:35          │  ┌────────────────────────────────────┐│
│  │                  │  │ 💬 Comentarios del Operador        ││
│  │ ● En Revisión   │  │                                    ││
│  │   16/06/2026     │  │ Operador: "Documentos en revisión. ││
│  │   09:15          │  │ Se notificará resultado en 5 días  ││
│  │                  │  │ hábiles."                         ││
│  │ ○ Aprobado       │  │                    16/06/2026 9:15││
│  │   (pendiente)    │  │                                    ││
│  │                  │  └────────────────────────────────────┘│
│  └──────────────────┘                                         │
│                                                               │
│  [Descargar Comprobante]  [Contactar Soporte]                │
└──────────────────────────────────────────────────────────────┘
```

### 6.6 Dashboard Admin (Filament)

```
┌──────────────────────────────────────────────────────────────┐
│  EsSalud Admin    🔍 Buscar...         🔔  👤 Admin  ⚙️     │
├──────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐ │
│  │ 📋      │ │ ⏳       │ │ ✅       │ │ 🤖              │ │
│  │ Trámites│ │ Pend.    │ │ Aprobados│ │ Resolución Chat  │ │
│  │   1,247 │ │   342    │ │   1,580  │ │    73%           │ │
│  │ ↑ 12%   │ │ ↓ 5%    │ │ ↑ 18%    │ │ ↑ 3%            │ │
│  └─────────┘ └──────────┘ └──────────┘ └──────────────────┘ │
│                                                               │
│  ┌───────────────────────────┐ ┌────────────────────────────┐│
│  │ 📊 Trámites por Estado    │ │ 📈 Trámites por Día (7d)  ││
│  │                           │ │                            ││
│  │   [Gráfico de Donut]      │ │   [Gráfico de Barras]     ││
│  │   Aprobados:  52%        │ │   ████████▌  Lun        ││
│  │   En Revisión: 23%       │ │   █████████  Mar        ││
│  │   Pendientes: 15%        │ │   ██████▌    Mié        ││
│  │   Rechazados: 10%        │ │   ████████▌  Jue        ││
│  │                           │ │   ██████████  Vie       ││
│  └───────────────────────────┘ └────────────────────────────┘│
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🕐 Últimos Trámites                        [Ver Todos]   ││
│  │                                                           ││
│  │  ID        | Asegurado    | Tipo          | Estado | Fe. ││
│  │  TRX-0042  | J. Pérez     | Maternidad    | 📝 Rev | 16/6││
│  │  TRX-0041  | M. García    | Afiliación    | ✅ Apr | 16/6││
│  │  TRX-0040  | L. Torres    | Sepelio       | ⏳ Pend| 15/6││
│  │  TRX-0039  | A. Ruiz      | Lactancia     | ❌ Rec | 15/6││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 6.7 FAQ (Acordeón)

```
┌──────────────────────────────────────────────────────────────┐
│  ❓ Preguntas Frecuentes                                     │
│  🔍 [Buscar en FAQ...                             ]         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ 📂 Afiliación y Registro                    (12)  ▼ │     │
│  │                                                      │     │
│  │   ¿Cómo me afilio a EsSalud?                         │     │
│  │   ┌──────────────────────────────────────────────┐   │     │
│  │   │ Para afiliarte debes ser trabajador activo    │   │     │
│  │   │ dependiente o independiente. Tu empleador     │   │     │
│  │   │ realiza el registro. Como independiente,      │   │     │
│  │   │ debes acercarte a una oficina de EsSalud.     │   │     │
│  │   │                                               │   │     │
│  │   │ ¿Fue útil? [👍 45] [👎 3]                    │   │     │
│  │   └──────────────────────────────────────────────┘   │     │
│  │                                                      │     │
│  │   ¿Qué documentos necesito para registrarme?         │     │
│  │   ¿Puedo afiliar a mi familia?                       │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ 📂 Trámites y Prestaciones                   (8)   ▶ │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ 📂 Subsidios Económicos                      (6)   ▶ │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ 📂 Documentos y Requisitos                   (10)  ▶ │     │
│  └─────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

### 6.8 Subir Documentos (Drag & Drop)

```
┌──────────────────────────────────────────────────────────────┐
│  📄 Subir Documento                                          │
│  Asociado a: Trámite #TRX-0042 — Subsidio por Maternidad    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │                                                      │     │
│  │                     ☁️  📤                            │     │
│  │                                                      │     │
│  │        Arrastra y suelta tus archivos aquí           │     │
│  │                     o haz clic                       │     │
│  │                                                      │     │
│  │        Formatos aceptados: PDF, JPG, PNG             │     │
│  │        Tamaño máximo: 10 MB por archivo              │     │
│  │        Resolución mínima (escaneados): 200 DPI       │     │
│  │                                                      │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Archivos Seleccionados                               │     │
│  │                                                      │     │
│  │ 📄 dni_frontal.pdf                          245 KB   │     │
│  │   ████████████████████████ 100% ✓ Subido             │     │
│  │                                                      │     │
│  │ 📄 certificado_nac.pdf                      1.2 MB   │     │
│  │   ████████████░░░░░░░░░░░░ 58% Subiendo...           │     │
│  │                                                      │     │
│  │ 🖼️ formulario_escaneado.png                 3.1 MB   │     │
│  │   ⏳ Pendiente de subir                              │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                               │
│  [Cancelar]                    [Subir y Validar Documentos]  │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Estados de UI

### 7.1 Loading Skeletons

```
┌──────────────────────────────────────────────┐
│  ┌──────────────────────────────────────┐    │
│  │ ░░░░░░░░░░░░░░░░░░░░  (card skeleton) │    │
│  │ ░░░░░░░░░░░░                           │    │
│  │ ░░░░░░░░░░░░░░░░                       │    │
│  └──────────────────────────────────────┘    │
│                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ ░░░░░░░░ │ │ ░░░░░░░░ │ │ ░░░░░░░░ │     │
│  └──────────┘ └──────────┘ └──────────┘     │
│                                               │
│  (Animación de pulso con animate-pulse)       │
└──────────────────────────────────────────────┘
```

### 7.2 Estados Vacíos

```
┌──────────────────────────────────────────────┐
│                                               │
│               📋 (ícono grande)               │
│                                               │
│         No tienes trámites activos            │
│     Crea tu primer trámite para comenzar      │
│                                               │
│         [➕ Crear Nuevo Trámite]              │
│                                               │
└──────────────────────────────────────────────┘
```

### 7.3 Estados de Error

```
┌──────────────────────────────────────────────┐
│  ⚠️ Algo salió mal                            │
│  No pudimos cargar tus trámites.              │
│  Por favor, intenta nuevamente.              │
│                                               │
│  [Reintentar]  [Volver al Inicio]            │
└──────────────────────────────────────────────┘
```

### 7.4 Estados de Éxito (Toast)

```
┌─────────────────────────────────┐
│  ✅ Trámite enviado con éxito   │
│     Recibirás una notificación  │
│     cuando sea revisado.        │
│                          [✕]    │
└─────────────────────────────────┘
```

---

## 8. Responsive Design

### 8.1 Breakpoints

| Breakpoint | Ancho | Dispositivo |
|------------|-------|-------------|
| `sm` | 640px | Móvil landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop pequeño |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Desktop grande |

### 8.2 Comportamiento Mobile

- Sidebar se colapsa en off-canvas con overlay
- Cards se apilan verticalmente
- Tablas se convierten en cards/listas apiladas
- Header sticky en top
- Botones full-width en formularios
- Navegación inferior fija (bottom nav) con iconos + labels
- Menú hamburguesa (☰) en topbar izquierdo

### 8.3 Comportamiento Desktop

- Sidebar fijo visible (250px de ancho)
- Cards en grid de 2 o 3 columnas
- Tablas completas con todas las columnas
- Modal centrado con overlay
- Navegación lateral con iconos y texto

---

## 9. Fluxograma de Interacciones Livewire

```
┌──────────────┐    usuario     ┌──────────────┐
│   Browser    │   interactúa   │   Livewire   │
│  (Blade +    │──────────────▶│  Component   │
│   Alpine)    │                │  (PHP Class) │
└──────┬───────┘                └──────┬───────┘
       │                               │
       │  wire:click="save"           │
       │   o wire:model="name"        │
       │                               │
       │                     ┌─────────▼─────────┐
       │                     │ Validación Laravel │
       │                     │ Procesamiento      │
       │                     │ Llamadas Eloquent  │
       │                     └─────────┬─────────┘
       │                               │
       │          re-renderiza        │
       │  ◀───────────────────────────┘
       │   (morfología DOM diff)
       │
       ▼
  ┌─────────────────┐
  │ UI actualizada   │
  │ sin recarga de   │
  │ página completa  │
  └─────────────────┘
```

---

## 10. Referencias Cruzadas

| Archivo | Relación |
|---------|----------|
| [[15_BLADE_UIUX.md]] | Design tokens y componentes visuales detallados |
| [[16_LIVEWIRE_ESTRUCTURA.md]] | Arquitectura de componentes Livewire |
| [[04_ARQUITECTURA.md]] | Arquitectura general del monolito Laravel |
| [[14_DASHBOARD_ADMIN.md]] | Dashboard administrativo con Filament |
| [[02_SPEC_DETALLADO.md]] | Especificación funcional de todas las pantallas |

---

#design #ui #ux #essalud #blade #livewire #tailwind #v1.0
