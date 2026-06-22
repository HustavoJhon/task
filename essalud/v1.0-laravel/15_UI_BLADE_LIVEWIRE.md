# 15 - Arquitectura UI: Blade + Livewire

## Visión General

La interfaz de usuario de EsSalud está construida sobre **Blade** (motor de plantillas de Laravel) y **Livewire 3** (framework full-stack para componentes reactivos sin JavaScript). Se utiliza **Tailwind CSS 3** para los estilos utilitarios y **Alpine.js** para micro-interactividad declarativa en el frontend. Esta combinación permite construir una SPA-like experience sin necesidad de un framework JavaScript pesado, manteniendo toda la lógica del lado del servidor en PHP.

## Layout Base: `layouts/app.blade.php`

El layout principal sigue una estructura clásica de panel administrativo con tres zonas:

```
┌──────────────────────────────────────────────┐
│  TOPBAR (app-header)                         │
├────────┬─────────────────────────────────────┤
│        │                                     │
│ SIDEBAR│         CONTENIDO PRINCIPAL         │
│        │         ({{ $slot }})               │
│        │                                     │
│        │                                     │
└────────┴─────────────────────────────────────┘
```

### Topbar

- **Logo de EsSalud** (izquierda, enlace al home).
- **Dropdown de usuario:** avatar, nombre, rol actual, enlace a perfil, cerrar sesión.
- **Selector de rol:** para usuarios con múltiples roles (asegurado, funcionario, admin), permite cambiar de contexto.
- **Notificaciones:** campana con contador de notificaciones no leídas (badge rojo). Dropdown con últimas 5 notificaciones y enlace "Ver todas".
- **Toggle del sidebar** en móvil (botón hamburguesa).

### Sidebar

- **Colapsable** (toggle con ícono de chevron). En móvil se oculta completamente y se muestra como overlay (drawer lateral con backdrop).
- **Ítems de navegación** con íconos SVG (Heroicons), texto y badge opcional de contador.
- **Agrupamiento:** secciones expandibles (acordeón) para agrupar rutas relacionadas.
- **Resaltado activo:** el ítem correspondiente a la ruta actual se resalta con color de fondo y borde izquierdo.
- **Enlaces según rol:**
  - **Asegurado:** Mis Trámites, Nuevo Trámite, Chat de Ayuda, Mis Documentos, Preguntas Frecuentes, Noticias.
  - **Funcionario:** Bandeja de Trámites, Revisión Pendiente, Chat de Atención, Reportes.
  - **Administrador:** Dashboard, Gestión de Usuarios, Todos los Trámites, Reportes, Configuración, Logs.

### Contenido Principal (`{{ $slot }}`)

- Padding responsivo (más compacto en móvil).
- Animación de transición de página con `wire:navigate` (Livewire 3 SPA mode).
- Scroll independiente.

### Layout Secundario: `layouts/guest.blade.php`

Para páginas públicas (login, register, forgot-password). Diseño centrado con tarjeta flotante, logo de EsSalud arriba, fondo con gradiente institucional.

## Componentes Blade Reutilizables

Los componentes Blade anónimos (claseless, en `resources/views/components/`) siguen la convención `<x-nombre>` y aceptan props para personalización.

### `<x-input>`

Campo de formulario completo con:
- **Props:** `name`, `label`, `type` (text, email, password, number, tel, date, file, select, textarea), `placeholder`, `icon` (nombre de Heroicon), `required`, `disabled`, `readonly`, `wire:model` (para binding con Livewire), `hint` (texto de ayuda).
- **Label:** flotante o estándar, con asterisco rojo si es required.
- **Icono:** a la izquierda dentro del input (Heroicon SVG inline).
- **Error:** mensaje debajo del campo en rojo con ícono de alerta, proveniente de `$errors` bag de Laravel.
- **Estados visuales:** borde normal (gray-300), focus (primary-500 con ring), error (red-500), disabled (bg-gray-100, cursor-not-allowed).
- **Select y textarea:** variantes con el mismo estilo visual.

```blade
<x-input name="dni" label="DNI" type="text" icon="heroicon-o-identification" wire:model="dni" required />
```

### `<x-button>`

Botón con múltiples variantes y estados:

- **Variantes** (prop `variant`):
  - `primary`: fondo primary-600, texto blanco, hover primary-700.
  - `secondary`: fondo gray-200, texto gray-700, hover gray-300.
  - `danger`: fondo red-600, texto blanco, hover red-700.
  - `ghost`: sin fondo, texto primary-600, hover bg-primary-50.
  - `success`: fondo green-600, texto blanco.
  - `warning`: fondo amber-500, texto blanco.
- **Tamaños** (prop `size`): `xs`, `sm`, `md` (default), `lg`, `xl`.
- **Loading state:** cuando `wire:loading` está activo, muestra un spinner SVG animado y deshabilita el botón. El texto se reemplaza por "Cargando..." o se mantiene con spinner a la izquierda.
- **Props adicionales:** `icon` (Heroicon a la izquierda), `iconRight`, `fullWidth`, `href` (se renderiza como `<a>` si se provee), `type` (submit, button, reset).
- **Atributos wire:** `wire:click`, `wire:submit`, `wire:confirm` se pasan automáticamente.

```blade
<x-button variant="primary" wire:click="save" wire:loading.attr="disabled">
    Guardar Trámite
</x-button>
```

### `<x-modal>`

Modal accesible con:
- **Props:** `maxWidth` (sm, md, lg, xl, 2xl, full en móvil), `closeable` (permite cerrar con Escape o click fuera).
- **Backdrop:** negro con opacidad 50%, animación fade-in.
- **Contenido:** animación scale-in + translate-up.
- **Header:** título, botón de cierre (X).
- **Body:** slot principal.
- **Footer:** slot para botones de acción (cancelar, confirmar).
- **Confirmación:** variante `<x-confirmation-modal>` con ícono de advertencia, título, descripción, botones "Cancelar" y "Confirmar".
- **Integración Livewire:** usa `wire:model` para mostrar/ocultar. Eventos `openModal` y `closeModal` vía `$dispatch`.
- **Enfoque:** atrapa el foco dentro del modal (trap focus), restaura foco al cerrar.
- **Teclado:** Escape cierra, Tab navega entre elementos focusables.

```blade
<x-modal wire:model="showCreateModal" maxWidth="lg">
    <x-slot name="title">Nuevo Trámite</x-slot>
    <!-- contenido -->
    <x-slot name="footer">
        <x-button variant="secondary" wire:click="$set('showCreateModal', false)">Cancelar</x-button>
        <x-button variant="primary" wire:click="createProcedure">Crear</x-button>
    </x-slot>
</x-modal>
```

### `<x-table>`

Tabla de datos completa con:

- **Props:** `headers` (array de columnas con key, label, sortable, align), `rows` (datos), `actions` (slot con botones de acción por fila), `emptyMessage`, `loading`.
- **Sorting:** click en header sortable ordena ascendente/descendente. Indicador visual con ícono de flecha. Se comunica con Livewire vía `$emit('sort', column)`.
- **Paginación:** componente `<x-pagination>` integrado al pie, con links de páginas, info "Mostrando X-Y de Z resultados", selector de per page (10, 25, 50, 100).
- **Filtros:** slot `filters` arriba de la tabla para inputs de búsqueda, selects de estado, rango de fechas.
- **Selección:** checkboxes para selección múltiple con "Seleccionar todos".
- **Estados:**
  - **Loading:** skeleton rows (barras grises animadas con pulse).
  - **Empty:** ilustración SVG + mensaje "No se encontraron resultados" + botón de acción opcional.
  - **Error:** mensaje de error con botón "Reintentar".
- **Responsive:** scroll horizontal en pantallas pequeñas (`overflow-x-auto`). Columnas opcionales ocultas en móvil (`hidden md:table-cell`).
- **Estilo:** bordes suaves, alternancia de colores en filas (striped), hover highlight.

```blade
<x-table :headers="[
    ['key' => 'id', 'label' => '#', 'sortable' => true],
    ['key' => 'type', 'label' => 'Tipo', 'sortable' => true],
    ['key' => 'status', 'label' => 'Estado', 'sortable' => true],
    ['key' => 'created_at', 'label' => 'Fecha', 'sortable' => true],
]" :rows="$procedures">
    <x-slot name="actions" :row="$row">
        <x-button variant="ghost" size="xs" wire:click="view({{ $row->id }})">Ver</x-button>
    </x-slot>
</x-table>
```

### `<x-card>`

Tarjeta contenedora:
- **Props:** `title`, `subtitle`, `padding` (none, sm, md, lg), `footer`, `headerAction` (slot para botón en header), `collapsible`.
- **Header:** título, subtítulo, acción opcional alineada a la derecha. Si es `collapsible`, toggle para expandir/colapsar cuerpo.
- **Body:** slot principal.
- **Footer:** slot opcional (generalmente botones de acción o resumen).
- **Variantes:** borde (default), sombra (shadow), sin borde (flat).

### `<x-alert>`

Notificación inline:
- **Tipos** (prop `type`): `success` (verde, ícono check), `error` (rojo, ícono x-circle), `warning` (ámbar, ícono exclamation), `info` (azul, ícono information).
- **Dismissible:** botón X para cerrar (con Alpine.js `x-data` y `x-show`).
- **Animación:** slide-down al aparecer, fade-out al desaparecer.
- **Uso típico:** feedback después de guardar/eliminar. Se auto-oculta después de 5 segundos si es success/info.

```blade
<x-alert type="success" dismissible wire:message="procedureSaved">
    Trámite guardado exitosamente.
</x-alert>
```

### `<x-badge>`

Indicador de estado:
- **Colores por estado de trámite:**
  - `pendiente`: amarillo/ámbar.
  - `en_revision`: azul.
  - `aprobado`: verde.
  - `rechazado`: rojo.
  - `completado`: verde oscuro.
  - `cancelado`: gris.
  - `observado`: naranja.
  - `en_proceso`: púrpura.
- **Tamaños:** `sm`, `md`, `lg`.
- **Variantes:** `filled` (fondo color), `outlined` (borde color, texto color).
- **Props:** `color` (nombre del color o estado), `dot` (agrega un punto pulsante), `removable`.

### `<x-dropdown>`

Menú desplegable accesible:
- **Trigger:** slot que activa el dropdown al click.
- **Items:** links (`<a>`) o botones con ícono opcional, texto, shortcut de teclado.
- **Divider:** separador entre grupos de items.
- **Posicionamiento:** automático (abajo, arriba, izquierda, derecha según espacio disponible), usando Floating UI vía Alpine.js.
- **Teclado:** Arrow keys navegan, Enter selecciona, Escape cierra.

### `<x-timeline>`

Línea de tiempo vertical para historial de trámites:
- **Items:** array de eventos con `title`, `description`, `timestamp`, `status` (completed, current, pending, error), `icon`.
- **Visual:** línea vertical con nodos (círculos). Color del nodo según estado. Último nodo con animación pulse si está en progreso.
- **Contenido:** tarjeta a la derecha (escritorio) o debajo (móvil) con título, descripción, fecha formateada con `diffForHumans()`.
- **Uso:** historial de cambios de estado del trámite, registro de documentos subidos, comentarios de funcionarios.

### `<x-stat-card>`

Tarjeta de estadística para dashboards:
- **Props:** `icon` (Heroicon), `value` (número o texto), `label` (descripción), `trend` (up, down, neutral), `trendValue` (porcentaje de cambio), `color` (primary, success, warning, danger, info).
- **Visual:** ícono grande a la izquierda con fondo de color suave, valor grande con `@animateNumber` (animación de conteo al entrar en viewport), label pequeño debajo, flecha de tendencia (verde arriba, roja abajo) con porcentaje.
- **Loading:** skeleton mientras `$loading`.

```blade
<x-stat-card
    icon="heroicon-o-document-text"
    :value="$totalProcedures"
    label="Trámites Totales"
    trend="up"
    trendValue="12.5%"
    color="primary"
/>
```

## Componentes Livewire Principales

### `LoginForm`

Formulario de inicio de sesión:
- **Campos:** `email` (input con ícono de sobre), `password` (input con toggle de visibilidad), `remember` (checkbox).
- **Validación:** en tiempo real con `updated()` hook. Errores mostrados inline debajo de cada campo. Mensaje de error general (credenciales inválidas, cuenta inactiva).
- **Loading:** botón muestra spinner "Ingresando..." durante `wire:loading`.
- **Acciones:** "¿Olvidaste tu contraseña?" link a forgot-password. "¿No tienes cuenta? Regístrate" link a register.
- **Rate limiting:** después de 5 intentos fallidos, bloqueo temporal con mensaje y countdown.

### `RegisterForm`

Formulario de registro de asegurado:
- **Campos:** `dni` (8 dígitos, validación de formato y unicidad contra RENIEC simulado), `email` (validación de formato y unicidad), `phone` (9 dígitos), `full_name` (texto, mínimo 3 caracteres), `password` (mínimo 8 caracteres, debe contener mayúscula, minúscula y número), `password_confirmation`.
- **Validación:** en tiempo real campo por campo. Barra de fortaleza de contraseña (rojo → amarillo → verde).
- **Pasos opcionales:** wizard opcional de 2 pasos (datos personales → credenciales).
- **Términos y condiciones:** checkbox requerido con link a modal de términos.
- **Post-registro:** redirección a dashboard con toast "Bienvenido a EsSalud".

### `ProcedureList`

Tabla principal de trámites del asegurado:
- **Filtros:** estado (select múltiple con badges), tipo de trámite (select), rango de fechas (date inputs), búsqueda por texto (input con debounce 300ms).
- **Columnas:** ID, Tipo, Estado (badge de color), Fecha de creación, Última actualización, Acciones (Ver, Continuar, Cancelar).
- **Paginación:** 15 items por página. Navegación con números de página.
- **Polling:** refresco automático cada 30 segundos (`wire:poll.30s`) para actualizar estados en tiempo real.
- **Acciones en lote:** seleccionar varios y cancelar, o descargar comprobantes.
- **Filtros guardados:** opción de guardar combinación de filtros como "vista rápida".

### `ProcedureCreate`

Wizard de creación de trámite en 4 pasos con barra de progreso:

1. **Seleccionar Tipo:** grid de tarjetas con íconos grandes. Cada tipo de trámite tiene nombre, descripción breve, tiempo estimado, requisitos (modal al click). Categorías: Salud, Pensiones, Administrativo, Prestaciones.

2. **Llenar Datos:** formulario dinámico según el tipo de trámite seleccionado. Campos condicionales (ej. si es "Reembolso", pide monto y comprobantes). Subida de documentos requeridos con `DocumentUploader` (mínimo los obligatorios). Validación en cada paso antes de avanzar.

3. **Revisar:** resumen de todo el trámite: tipo, datos ingresados, documentos adjuntos (con preview), total a pagar si aplica. Checkbox "Declaro que los datos son verídicos".

4. **Confirmar:** mensaje de éxito con número de trámite generado (formato: `TRAM-2026-XXXXXX`). Botones: "Ir a mis trámites", "Crear otro trámite". Toast de confirmación.

- **Navegación:** botones "Anterior" y "Siguiente". No se puede saltar pasos. Datos persisten entre pasos en propiedad Livewire.
- **Abandono:** modal de confirmación si intenta salir sin terminar.

### `ProcedureDetail`

Vista detallada de un trámite:
- **Header:** número de trámite, tipo, estado actual (badge grande), fecha de creación.
- **Timeline:** `<x-timeline>` con todos los eventos: creación, asignación a funcionario, cambios de estado, observaciones, documentos subidos, aprobación/rechazo, cierre.
- **Documentos:** grid de tarjetas por documento. Cada una con nombre, tipo, fecha de subida, estado de validación, botón de descarga, botón de vista previa (modal con visor). Si el documento fue procesado por OCR, se muestran los datos extraídos.
- **Comentarios:** sección de comentarios entre asegurado y funcionario. Input de texto con botón enviar. Lista de mensajes con avatar, nombre, fecha, contenido. Nuevos mensajes aparecen con `wire:poll.5s`.
- **Acciones según rol:**
  - **Asegurado:** Subir documentos faltantes, Responder observación, Cancelar trámite (solo si está pendiente), Descargar comprobante.
  - **Funcionario:** Aprobar, Rechazar (modal con motivo obligatorio), Observar (modal con descripción), Solicitar documentos adicionales, Derivar a otro funcionario.
  - **Admin:** Todas las anteriores + Reasignar, Forzar cambio de estado.

### `ChatWidget`

Asistente virtual conversacional:
- **Burbuja flotante:** ícono de chat en esquina inferior derecha. Badge con contador de mensajes no leídos.
- **Panel de chat:** se expande desde la burbuja (ancho 380px, alto 500px). Header con nombre del asistente "Asistente Virtual EsSalud", botón minimizar, botón cerrar.
- **Área de mensajes:** scrollable, scroll automático al último mensaje. Burbujas: usuario (alineadas derecha, fondo primary), asistente (alineadas izquierda, fondo gray-100). Timestamps pequeños debajo.
- **Typing indicator:** tres puntos animados cuando el backend está procesando la respuesta.
- **Quick replies:** botones de respuestas rápidas que el asistente sugiere (ej. "Quiero saber mi estado de trámite", "¿Cómo me afilio?").
- **Feedback:** después de cada respuesta del asistente, botones thumbs-up/thumbs-down para calificar utilidad.
- **Input:** campo de texto con botón enviar (ícono de avión de papel). Soporte para Enter para enviar. Deshabilitado mientras se procesa.
- **Historial:** persiste por sesión. Al abrir muestra últimos mensajes de la sesión actual.
- **Contexto:** el asistente tiene acceso al historial de trámites del usuario autenticado para respuestas personalizadas.

### `FaqAccordion`

Preguntas frecuentes con acordeón:
- **Categorías:** tabs horizontales con scroll (Afiliación, Trámites, Cobertura, Pagos, Pensiones, Otros). Cada tab con ícono y contador de preguntas.
- **Acordeón:** múltiples items expandibles. Solo uno abierto a la vez (o múltiple con prop `multiple`). Click en pregunta expande/colapsa respuesta con animación suave de altura.
- **Búsqueda:** input superior que filtra preguntas en todas las categorías en tiempo real (resalta texto coincidente).
- **Feedback:** "¿Te fue útil esta respuesta?" con botones Sí/No al pie de cada respuesta.
- **Contacto:** al final, mensaje "¿No encontraste lo que buscabas?" con botón que abre el ChatWidget.

### `DocumentUploader`

Componente de subida de archivos:
- **Zona de drop:** área con borde dashed, ícono de nube con flecha arriba, texto "Arrastra tus archivos aquí o haz clic para seleccionar". Resaltado azul durante drag-over.
- **Formatos aceptados:** PDF, JPG, PNG, DOCX (configurable por prop `accept`). Tamaño máximo 10MB por archivo.
- **Validación client-side:** tipo de archivo y tamaño antes de subir. Mensaje de error específico.
- **Progreso:** barra de progreso por archivo con porcentaje, animada. Usa `wire:loading` con `wire:target="upload"`.
- **Preview:** thumbnail del archivo (si es imagen). Ícono de PDF/DOCX si es documento. Nombre de archivo y tamaño.
- **Archivos múltiples:** prop `multiple` permite subir varios a la vez. Array de archivos con botón X para remover cada uno.
- **Post-subida:** el backend procesa (OCR si es documento, generación de thumbnail) y el componente emite evento `$dispatch('document-uploaded', { id: docId })`.
- **Límite:** contador de archivos subidos / máximo permitido.
- **Integración:** se usa dentro de `ProcedureCreate` y `ProcedureDetail`.

### `NewsCard`

Grid de noticias:
- **Layout:** grid responsivo (1 col móvil, 2 tablet, 3 desktop, 4 wide).
- **Tarjeta:** imagen de portada (con lazy loading `loading="lazy"`), categoría (badge), título (2 líneas máximo con truncado), extracto (3 líneas), fecha (formato "hace X días"), botón "Leer más".
- **Hover:** escala sutil (1.02), sombra más pronunciada.
- **Paginación:** scroll infinito con `wire:infinite-scroll` o paginación tradicional con botón "Cargar más".
- **Filtros:** por categoría (tabs), por fecha, búsqueda.
- **Vista detalle:** página completa con imagen hero, contenido HTML, galería de imágenes, noticias relacionadas.

### `DashboardStats`

Panel de KPIs para el dashboard:
- **Fila de stat cards:** `<x-stat-card>` para cada KPI principal: Trámites del día, Trámites pendientes, Tasa de aprobación, Tiempo promedio de resolución, Usuarios activos.
- **Gráficos:** integración con Chart.js vía Alpine.js. Datos pasados desde Livewire como JSON.
  - **Gráfico de líneas:** evolución de trámites por día (últimos 30 días).
  - **Gráfico de barras:** trámites por tipo (horizontal, ordenado por cantidad).
  - **Gráfico de dona:** distribución de estados (pendiente, en revisión, aprobado, rechazado).
  - **Gráfico de barras apiladas:** trámites por mes, segmentado por tipo.
- **Filtro de período:** selector de rango (7 días, 30 días, 90 días, este año, personalizado).
- **Actualización:** polling cada 60 segundos.
- **Loading:** skeleton cards mientras cargan los datos.
- **Responsive:** gráficos se redimensionan. En móvil, stat cards en 2 columnas, gráficos uno debajo del otro.

## Estados de UI

### Loading (Skeleton)

- **Componentes:** durante la carga inicial de datos, se muestran placeholders animados (pulse animation de Tailwind) con la misma forma y tamaño del contenido final.
- **Tablas:** filas de barras grises simulando texto.
- **Tarjetas:** rectángulos grises para imagen, título y texto.
- **Botones:** spinner SVG y deshabilitados.
- **Indicador global:** barra de progreso superior fina (NProgress style) que se activa con `wire:navigate`.

### Empty State

- **Ilustración SVG:** acorde al contexto (carpeta vacía para "sin trámites", burbuja de chat para "sin mensajes", bandeja para "sin notificaciones").
- **Mensaje principal:** texto descriptivo (ej. "Aún no has creado ningún trámite").
- **Mensaje secundario:** texto más pequeño con instrucción (ej. "Crea tu primer trámite para comenzar a usar la plataforma").
- **Acción:** botón primario que lleva a la acción correspondiente (ej. "Crear trámite").
- **Posicionamiento:** centrado vertical y horizontalmente con padding generoso.

### Error State

- **Mensaje de error:** descripción clara del error ocurrido ("No pudimos cargar tus trámites. Intenta nuevamente.").
- **Detalles técnicos:** colapsados por defecto, visibles con "Ver detalles" para debuggear.
- **Acción:** botón "Reintentar" que ejecuta la acción nuevamente.
- **Error de red:** si `navigator.onLine` es false, se muestra banner persistente "Sin conexión a internet" en la parte superior.

### Success State

- **Toast notification:** notificación efímera en esquina superior derecha (o inferior en móvil). Animación slide-in desde la derecha. Auto-dismiss después de 4 segundos.
  - Verde con ícono check para éxito ("Trámite creado exitosamente").
  - Rojo con ícono x-circle para error ("Error al procesar el pago").
  - Ámbar con ícono exclamation para warning ("Tu sesión expirará en 5 minutos").
  - Azul con ícono information para info ("Nuevo mensaje del funcionario").
- **Stack de toasts:** múltiples notificaciones se apilan verticalmente sin solaparse.
- **Dismiss manual:** botón X en cada toast.

## Responsive Design

### Breakpoints Tailwind

- `sm`: 640px (móvil landscape)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop pequeño)
- `xl`: 1280px (desktop)
- `2xl`: 1536px (desktop grande)

### Comportamiento Responsive

- **Sidebar:** `lg:block` visible en desktop, oculto en móvil. Toggle con overlay y backdrop semi-transparente que cierra al click fuera o tecla Escape.
- **Modal:** `maxWidth="full"` en móvil (ocupa toda la pantalla). En desktop, anchos variables según prop.
- **Tablas:** `overflow-x-auto` con `min-width` en contenedor para scroll horizontal. Columnas no esenciales con `hidden md:table-cell`.
- **Grid de tarjetas:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.
- **Topbar:** simplificada en móvil (solo logo, notificaciones y avatar. Sin selector de rol ni nombre completo).
- **Toast notifications:** en móvil, aparecen en la parte inferior centradas para fácil acceso con el pulgar.
- **Wizard:** en móvil, los pasos se muestran como píldoras horizontales con scroll. En desktop, barra de pasos completa con líneas conectoras.
- **Touch targets:** botones y links con mínimo 44x44px en móvil para cumplir con WCAG.
- **Fuentes:** tamaño base 16px (mínimo para evitar zoom automático en iOS). Escala tipográfica responsiva con `clamp()`.

## Integración con Livewire 3

### Modo SPA (`wire:navigate`)

- Navegación entre páginas sin recarga completa del navegador.
- Barra de progreso superior durante la navegación.
- Preservación del estado del scroll.
- Precarga de páginas al hover sobre links (`wire:navigate.hover`).

### Comunicación entre Componentes

- **Eventos hacia arriba:** `$dispatch('event-name', data)` del hijo al padre.
- **Eventos hacia abajo:** `$parent.method()` o eventos dirigidos con `$dispatch('event-name', data)->to('component-class')`.
- **Listeners:** `#[On('event-name')]` atributo PHP 8 en métodos del componente.

### Validación

- Uso de `#[Validate]` atributo en propiedades del componente Livewire.
- Reglas de validación de Laravel estándar.
- Mensajes de error en español desde `lang/es/validation.php`.
- Validación en tiempo real con `#[Validate('required|email')]` y `$this->validate()` en métodos de acción.
- Errores mostrados con `@error('field')` en la vista.

### Optimización

- **Lazy loading:** componentes con `lazy` attribute se cargan solo cuando entran al viewport.
- **Defer Loading:** `wire:init` para cargar datos pesados después del render inicial.
- **Polling:** `wire:poll.30s` para actualizaciones periódicas.
- **PaginaciÃ³n:** `WithPagination` trait con `$this->resetPage()` al cambiar filtros.
