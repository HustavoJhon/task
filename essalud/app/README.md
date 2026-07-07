# EsSalud - App Móvil de Atención al Asegurado v1.0 (Flutter)

## Que es?

Una aplicacion nativa para **iOS y Android** que permite a los asegurados de EsSalud realizar tramites en linea, consultar un chatbot inteligente con IA, ver noticias y acceder a preguntas frecuentes. Todo desde la comodidad de su movil o tablet.

Construido con **Flutter** (Dart), se conecta a un backend de **microservicios** con bases de datos **MySQL**, motor de busqueda vectorial **Qdrant** y **Docker** para infraestructura.

---

## Como funciona?

### Vista del asegurado (usuario normal)

```
1. Abre la app ve la pantalla de bienvenida
2. Se registra con su DNI, nombre, email y contrasena
3. Inicia sesion ve su dashboard personal
4. Puede:
   - Crear un tramite (afiliacion, maternidad, lactancia, etc.)
   - Subir documentos (PDF, JPG, PNG) desde la camara o galeria
   - Ver el estado de sus tramites (aprobado, rechazado, en revision...)
   - Chatear con el asistente virtual (responde con FAQ o IA)
   - Ver noticias de EsSalud
   - Consultar preguntas frecuentes (204 cargadas)
   - Recibir notificaciones push sobre cambios en sus tramites
```

### Vista del operador (empleado EsSalud)

```
1. Inicia sesion con su cuenta de operador
2. Ve los tramites asignados a el
3. Puede:
   - Aprobar o rechazar tramites
   - Solicitar subsanacion (pedir correcciones)
   - Agregar comentarios
```

### Vista del admin (supervisor)

```
1. Ve todos los tramites del sistema
2. Dashboard con estadisticas (KPIs)
3. Asigna tramites a operadores
4. Gestiona usuarios y roles
5. Exporta reportes
```

---

## Stack tecnologico

| Componente | Tecnologia | Para que? |
|---|---|---|
| **Lenguaje** | Dart 3.x | Todo el codigo de la app |
| **Framework** | Flutter 3.x | UI nativa iOS y Android |
| **Arquitectura** | Clean Architecture + BLoC | Separacion de responsabilidades |
| **Routing** | GoRouter | Navegacion declarativa |
| **HTTP** | Dio + Retrofit | Consumo de APIs REST |
| **Estado** | BLoC / Cubit | Manejo de estado reactivo |
| **Inyeccion** | GetIt | Dependency injection |
| **Almacen local** | floor (SQLite) | Cache offline |
| **Seguridad** | flutter_secure_storage | Tokens y datos sensibles |
| **Backend** | Microservicios REST | API principal |
| **Busqueda vectorial** | Qdrant | Chatbot RAG |
| **IA** | OpenAI API | Embeddings + respuestas inteligentes |
| **Notificaciones** | Firebase Cloud Messaging | Push notifications |
| **Autenticacion** | JWT + refresh tokens | Sesion segura |

---

## Requisitos para desarrollo

```bash
# 1. Clonar el proyecto
git clone git@github.com:HustavoJhon/EsSalud-Flutter.git
cd EsSalud-Flutter

# 2. Instalar dependencias
flutter pub get

# 3. Generar modelos y codigo (si usas build_runner)
dart run build_runner build --delete-conflicting-outputs

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con las URLs del backend y credenciales

# 5. Ejecutar en modo debug
flutter run
```

**Dispositivos soportados:**
- iOS 15+ (iPhone, iPad)
- Android 8.0+ (API 26+)
- Tablets con adaptacion de pantalla

---

## Estructura del proyecto

```
essalud_flutter/
├── lib/
│   ├── main.dart                    # Punto de entrada
│   ├── app/
│   │   ├── app.dart                 # Widget raiz MaterialApp
│   │   └── router.dart              # GoRouter configuration
│   ├── core/
│   │   ├── constants/               # Colores, URLs, constantes
│   │   ├── enums/                   # Estados, roles
│   │   ├── errors/                  # Excepciones personalizadas
│   │   ├── extensions/              # Helpers de contexto
│   │   ├── network/                 # Dio client, interceptors
│   │   ├── router/                  # Route names, guards
│   │   ├── storage/                 # Secure storage, preferences
│   │   └── utils/                   # Validators, formatters
│   ├── features/                    # Modulos (auth, procedures, chat...)
│   │   ├── auth/
│   │   │   ├── data/                # Datasources, DTOs, repositories
│   │   │   ├── domain/              # Entidades, repositorios abstractos
│   │   │   └── presentation/        # BLoC, widgets, pantallas
│   │   ├── procedures/              # Tramites
│   │   ├── chat/                    # Chatbot
│   │   ├── documents/               # Documentos
│   │   ├── news/                    # Noticias
│   │   ├── faq/                     # Preguntas frecuentes
│   │   └── dashboard/               # Dashboard personal
│   └── l10n/                        # Traducciones (es, en)
├── test/                            # Pruebas unitarias y de widget
├── integration_test/                # Pruebas de integracion
├── android/                         # Configuracion nativa Android
├── ios/                             # Configuracion nativa iOS
├── assets/                          # Imagenes, fuentes, JSON
└── pubspec.yaml                     # Dependencias
```

---

## Arquitectura: Clean Architecture + BLoC

```
UI (Widgets) --> BLoC/Cubit --> Repository --> DataSource (API/SQLite)
```

- **UI**: Widgets que escuchan estados del BLoC
- **BLoC**: Maneja eventos y emite estados
- **Repository**: Unifica datos remotos y locales
- **DataSource**: API remota (Dio) o local (floor)

---

## Documentacion completa

Este directorio contiene **27 archivos de documentacion** detallada:

| Archivo | Descripcion |
|---|---|
| `00_INDICE.md` | Indice maestro con navegacion centralizada |
| `01_PLAN_DETALLADO.md` | Plan estrategico con roadmap de 12 meses |
| `02_SPEC_DETALLADO.md` | Especificacion funcional con 40+ funcionalidades |
| `03_DESIGN_DETALLADO.md` | Decisiones arquitectonicas y patrones de diseno |
| `04_ARQUITECTURA_C4.md` | Modelo C4 completo (contexto, contenedores, componentes, codigo) |
| `05_MICROSERVICIOS.md` | Arquitectura de 6 microservicios |
| ... | ... y 21 documentos mas |

Consulta `00_INDICE.md` para la navegacion completa.

---

## Credenciales de prueba (backend)

| Rol | Email | Contrasena |
|---|---|---|
| Admin | admin@essalud.pe | Admin123! |
| Asegurado | aseg@essalud.pe | Aseg123! |
| Operador | oper@essalud.pe | Oper123! |

---

## Version del proyecto

| Version | Fecha | Cambios |
|---|---|---|
| 1.0 | Jun 2025 | Documentacion inicial Flutter App completa |
