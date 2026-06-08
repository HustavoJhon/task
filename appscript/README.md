# Hotel Luxe — Sistema de Gestión Hotelera

Aplicación web desarrollada con Google Apps Script y Google Sheets como base de datos. Permite administrar huéspedes, habitaciones, reservas, pagos y servicios de un hotel de forma centralizada.

## ✨ Funcionalidades

- **Dashboard** con métricas en tiempo real (ocupación, ingresos, reservas del mes)
- **Gestión de Huéspedes** — CRUD completo con búsqueda y paginación
- **Gestión de Habitaciones** — Vista en tarjetas con filtro por estado
- **Gestión de Reservas** — Creación con cálculo automático de noches y monto
- **Gestión de Pagos** — Registro con múltiples métodos de pago
- **Gestión de Servicios** — Catálogo de servicios del hotel
- **Reportes** — Gráficos de top clientes, tipos de habitación y distribución de pagos
- **Autenticación** — Login con usuarios desde Google Sheets
- **Chatbot** — Asistente virtual LuxeBot para consultas rápidas
- **Landing Page** — Página de presentación con hero, habitaciones, equipo y contacto

## 🛠 Tecnologías

- **Google Apps Script** — Backend y publicación como Web App
- **Google Sheets** — Base de datos
- **HTML + CSS + JavaScript** — Frontend (vanilla)
- **Chart.js** — Gráficos del dashboard
- **SweetAlert2** — Alertas y diálogos interactivos
- **Font Awesome** — Iconos

## 📁 Estructura del Proyecto

```
appscript/
├── Code.gs              # Backend — funciones del servidor
├── Index.html           # Frontend — interfaz de usuario
└── data-csv/            # CSVs de ejemplo para poblar las hojas
    ├── Huespedes.csv
    ├── Habitaciones.csv
    ├── Reservas.csv
    ├── Pagos.csv
    ├── Servicios.csv
    └── Usuarios.csv
```

## 🚀 Despliegue

1. Ve a [script.google.com](https://script.google.com) y crea un nuevo proyecto
2. Copia el contenido de `Code.gs` en el editor de código
3. Copia el contenido de `Index.html` (crea un archivo HTML en el editor)
4. Conecta el proyecto a tu Google Sheet (Extensiones → Apps Script → vincular)
5. Haz clic en **Implementar → Nueva implementación**
   - Tipo: **Web App**
   - Ejecutar como: **Yo**
   - Acceso: **Cualquier usuario**
6. Copia la URL generada para acceder al sistema

## 📊 Hojas de Google

El sistema usa las siguientes hojas dentro del mismo archivo:

| Hoja | Columnas |
|------|----------|
| `Huespedes` | HuespedID, Nombre, Apellido, FechaNacimiento, Nacionalidad, TipoDocumento, NumeroDocumento, Email, Telefono, Direccion |
| `Habitaciones` | HabitacionID, NumeroHabitacion, TipoHabitacion, Capacidad, PrecioPorNoche, Estado, Descripcion |
| `Reservas` | ReservaID, HuespedID, HabitacionID, FechaLlegada, FechaSalida, FechaReserva, EstadoReserva, NumeroAdultos, NumeroNinos, MontoTotal, Notas |
| `Pagos` | PagoID, ReservaID, FechaPago, Monto, MetodoPago, Estado |
| `Servicios` | ServicioID, NombreServicio, Precio, Descripcion |
| `Usuarios` | UsuarioID, Nombre, Correo, Password, Rol, Estado |
| `Contactos` | ContactoID, Nombre, Correo, Telefono, Mensaje, Fecha |

Usa el botón **Inicializar Sheets** en la sección Configuración del dashboard para crear la estructura automáticamente.

## 🔑 Credenciales de Prueba

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin@hotel.com | admin123 | Administrador |
| recep@hotel.com | recep123 | Recepcionista |

## 📸 Capturas

*(Agrega aquí capturas de pantalla del dashboard, formularios y landing page)*

## 📝 Requisitos

- Una cuenta de Google
- Google Sheets
- Navegador web moderno

---

Desarrollado como proyecto académico — Hotel Luxe © 2025
