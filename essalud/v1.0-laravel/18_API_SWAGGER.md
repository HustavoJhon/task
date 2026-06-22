# 18 - API REST y Documentacion Swagger

## Vision General

La API REST de EsSalud proporciona acceso programatico a las funcionalidades principales de la plataforma. Esta construida sobre Laravel Sanctum para autenticacion y documentada con OpenAPI 3.0 usando el paquete `darkaonline/l5-swagger`. La API sigue principios RESTful y esta versionada bajo el prefijo `/api/v1/`.

## Autenticacion API

### Laravel Sanctum

Laravel Sanctum proporciona dos metodos de autenticacion:

1. **API Tokens:** para aplicaciones mobile (iOS/Android) y clientes de terceros. Los usuarios generan tokens personales con habilidades (abilities) especificas que determinan que endpoints pueden acceder.

2. **SPA Authentication:** para el frontend Livewire/Blade. Usa cookies de sesion con proteccion CSRF. El middleware `auth:sanctum` detecta automaticamente el metodo segun la request.

### Habilidades de Token (Abilities)

Los tokens pueden tener las siguientes habilidades:

| Habilidad          | Descripcion                              |
|--------------------|------------------------------------------|
| `procedures:read`  | Leer tramites propios                    |
| `procedures:write` | Crear y modificar tramites               |
| `documents:read`   | Leer documentos                          |
| `documents:write`  | Subir y gestionar documentos             |
| `chat:write`       | Enviar mensajes al chatbot               |
| `chat:read`        | Leer historial de chat                   |
| `admin:read`       | Acceso de lectura a datos administrativos|
| `admin:write`      | Acceso de escritura administrativa       |
| `*`                | Acceso total (solo admin)                |

### Flujo de Autenticacion

```
Cliente                    Servidor
  |                           |
  |  POST /api/v1/auth/login  |
  |  {email, password, device}|
  |-------------------------->|
  |                           | Valida credenciales
  |                           | Crea token Sanctum
  |  {token, user}            |
  |<--------------------------|
  |                           |
  |  GET /api/v1/auth/me      |
  |  Authorization: Bearer XX |
  |-------------------------->|
  |                           | Verifica token
  |  {user data}              |
  |<--------------------------|
  |                           |
  |  POST /api/v1/auth/refresh|
  |  Authorization: Bearer XX |
  |-------------------------->|
  |                           | Revoca viejo, crea nuevo
  |  {token}                  |
  |<--------------------------|
```

## Rate Limiting

La API implementa rate limiting para prevenir abusos:

| Grupo de rutas              | Limite         | Ventana  |
|------------------------------|----------------|----------|
| `/api/v1/auth/*`             | 30 peticiones  | 1 minuto |
| `/api/v1/*` (general)        | 60 peticiones  | 1 minuto |
| `/api/v1/chat/message`       | 20 peticiones  | 1 minuto |
| `/api/v1/documents/upload`   | 10 peticiones  | 1 minuto |

Cuando se excede el limite, se retorna HTTP 429 Too Many Requests con headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, y `Retry-After`.

## CORS

Configuracion de CORS en `config/cors.php`:

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:8081',
        'http://localhost:3000',
        'http://localhost:5173',
        'capacitor://localhost',       // iOS
        'http://localhost',            // Android WebView
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'Retry-After',
    ],
    'max_age' => 86400,
    'supports_credentials' => true,
];
```

## Documentacion Swagger

### Instalacion y Configuracion

El paquete `darkaonline/l5-swagger` genera la UI de Swagger a partir de anotaciones OpenAPI en los controladores.

**Publicacion de configuracion:**

```bash
php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"
```

**Acceso a la documentacion:**

- Swagger UI: `http://localhost:8081/api/documentation`
- JSON OpenAPI: `http://localhost:8081/docs/api-docs.json`

**Regenerar documentacion:**

```bash
php artisan l5-swagger:generate
```

### Configuracion en `config/l5-swagger.php`

```php
return [
    'default' => 'default',
    'documentations' => [
        'default' => [
            'api' => ['title' => 'EsSalud API v1'],
            'routes' => [
                'api' => 'api/documentation',
                'docs' => 'docs/api-docs.json',
            ],
            'paths' => [
                'use_absolute_path' => env('L5_SWAGGER_USE_ABSOLUTE_PATH', true),
                'docs_json' => 'api-docs.json',
                'docs_yaml' => 'api-docs.yaml',
                'format_to_use_for_docs' => env('L5_FORMAT_TO_USE_FOR_DOCS', 'json'),
                'annotations' => [
                    base_path('app/Http/Controllers/Api/V1'),
                    base_path('app/Models'),
                ],
            ],
        ],
    ],
    'defaults' => [
        'routes' => [
            'docs' => 'docs',
            'oauth2_callback' => 'api/oauth2-callback',
            'middleware' => [
                'api' => [],
                'asset' => [],
                'docs' => [],
                'oauth2_callback' => [],
            ],
            'group_options' => [],
        ],
        'paths' => [
            'docs' => storage_path('api-docs'),
            'views' => base_path('resources/views/vendor/l5-swagger'),
            'base' => env('L5_SWAGGER_BASE_PATH', null),
            'swagger_ui_assets_path' => env('L5_SWAGGER_UI_ASSETS_PATH', 'vendor/swagger-api/swagger-ui/dist/'),
            'excludes' => [],
        ],
        'scanOptions' => [
            'analyser' => null,
            'analysis' => null,
            'patterns' => null,
            'exclude' => [],
            'open_api_spec_version' => env('L5_SWAGGER_OPEN_API_SPEC_VERSION', '3.0.0'),
        ],
        'securityDefinitions' => [
            'securitySchemes' => [
                'bearerAuth' => [
                    'type' => 'http',
                    'description' => 'Token Bearer. Obtenlo en POST /api/v1/auth/login',
                    'name' => 'Authorization',
                    'in' => 'header',
                    'scheme' => 'bearer',
                    'bearerFormat' => 'Sanctum Token',
                ],
            ],
            'security' => [
                ['bearerAuth' => []],
            ],
        ],
        'generate_always' => env('L5_SWAGGER_GENERATE_ALWAYS', false),
        'generate_yaml_copy' => env('L5_SWAGGER_GENERATE_YAML_COPY', false),
        'proxy' => false,
        'additional_config_url' => null,
        'operations_sort' => env('L5_SWAGGER_OPERATIONS_SORT', null),
        'validator_url' => null,
        'ui' => [
            'display' => [
                'dark_mode' => true,
                'doc_expansion' => 'list',
                'filter' => true,
                'show_extensions' => true,
                'show_common_extensions' => true,
            ],
            'authorization' => [
                'persist_authorization' => true,
            ],
        ],
    ],
];
```

## Anotaciones OpenAPI en Controladores

Cada controlador API utiliza anotaciones OpenAPI para describir sus endpoints. Ejemplo del `AuthController`:

```php
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * @OA\Tag(
 *     name="Autenticacion",
 *     description="Endpoints de autenticacion de usuarios"
 * )
 */
class AuthController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/v1/auth/login",
     *     summary="Iniciar sesion",
     *     description="Autentica al usuario y retorna un token Sanctum",
     *     operationId="authLogin",
     *     tags={"Autenticacion"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password","device_name"},
     *             @OA\Property(property="email", type="string", format="email", example="juan@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="Contrasena1"),
     *             @OA\Property(property="device_name", type="string", example="iPhone 15 Pro"),
     *             @OA\Property(property="abilities", type="array", @OA\Items(type="string"), example={"procedures:read","procedures:write"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login exitoso",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="token", type="string", example="1|abcdef123456..."),
     *                 @OA\Property(property="token_type", type="string", example="Bearer"),
     *                 @OA\Property(property="user", type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="dni", type="string", example="12345678"),
     *                     @OA\Property(property="full_name", type="string", example="Juan Perez"),
     *                     @OA\Property(property="email", type="string", example="juan@example.com"),
     *                     @OA\Property(property="roles", type="array", @OA\Items(type="string"), example={"asegurado"})
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="Credenciales invalidas"),
     *     @OA\Response(response=422, description="Error de validacion"),
     *     @OA\Response(response=429, description="Demasiados intentos")
     * )
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Credenciales invalidas. Verifica tu email y contrasena.'
            ], 401);
        }

        $token = $user->createToken(
            $request->device_name ?? 'api',
            $request->abilities ?? ['*']
        )->plainTextToken;

        return response()->json([
            'data' => [
                'token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'dni' => $user->dni,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames()->toArray(),
                ],
            ],
        ]);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/register",
     *     summary="Registrar nuevo usuario",
     *     description="Crea una cuenta de asegurado y retorna token de acceso",
     *     operationId="authRegister",
     *     tags={"Autenticacion"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"dni","full_name","email","phone","password","password_confirmation","device_name"},
     *             @OA\Property(property="dni", type="string", example="12345678"),
     *             @OA\Property(property="full_name", type="string", example="Maria Garcia Lopez"),
     *             @OA\Property(property="email", type="string", format="email", example="maria@example.com"),
     *             @OA\Property(property="phone", type="string", example="987654321"),
     *             @OA\Property(property="password", type="string", format="password", example="Contrasena1"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="Contrasena1"),
     *             @OA\Property(property="device_name", type="string", example="Samsung S24")
     *         )
     *     ),
     *     @OA\Response(response=201, description="Usuario registrado exitosamente"),
     *     @OA\Response(response=422, description="Error de validacion"),
     *     @OA\Response(response=429, description="Demasiados intentos")
     * )
     */
    public function register(RegisterRequest $request): JsonResponse { /* ... */ }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/refresh",
     *     summary="Refrescar token",
     *     description="Revoca el token actual y genera uno nuevo",
     *     operationId="authRefresh",
     *     tags={"Autenticacion"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Token refrescado exitosamente"),
     *     @OA\Response(response=401, description="No autenticado")
     * )
     */
    public function refresh(Request $request): JsonResponse { /* ... */ }

    /**
     * @OA\Post(
     *     path="/api/v1/auth/logout",
     *     summary="Cerrar sesion",
     *     description="Revoca el token de acceso actual",
     *     operationId="authLogout",
     *     tags={"Autenticacion"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(response=200, description="Sesion cerrada exitosamente"),
     *     @OA\Response(response=401, description="No autenticado")
     * )
     */
    public function logout(Request $request): JsonResponse { /* ... */ }

    /**
     * @OA\Get(
     *     path="/api/v1/auth/me",
     *     summary="Obtener usuario autenticado",
     *     description="Retorna los datos del usuario con su token actual",
     *     operationId="authMe",
     *     tags={"Autenticacion"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Datos del usuario",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer"),
     *                 @OA\Property(property="dni", type="string"),
     *                 @OA\Property(property="full_name", type="string"),
     *                 @OA\Property(property="email", type="string"),
     *                 @OA\Property(property="phone", type="string"),
     *                 @OA\Property(property="roles", type="array", @OA\Items(type="string")),
     *                 @OA\Property(property="permissions", type="array", @OA\Items(type="string")),
     *                 @OA\Property(property="stats", type="object",
     *                     @OA\Property(property="total_procedures", type="integer"),
     *                     @OA\Property(property="pending_procedures", type="integer"),
     *                     @OA\Property(property="approved_procedures", type="integer")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autenticado")
     * )
     */
    public function me(Request $request): JsonResponse { /* ... */ }
}
```

## Endpoints Documentados Completos

### Autenticacion

#### `POST /api/v1/auth/login`

Inicia sesion y retorna un token de acceso.

**Request Body:**
```json
{
    "email": "usuario@example.com",
    "password": "contrasena123",
    "device_name": "iPhone 15",
    "abilities": ["procedures:read", "procedures:write"]
}
```

**Response 200:**
```json
{
    "data": {
        "token": "1|abcdef1234567890abcdef1234567890",
        "token_type": "Bearer",
        "user": {
            "id": 1,
            "dni": "12345678",
            "full_name": "Juan Perez",
            "email": "juan@example.com",
            "roles": ["asegurado"]
        }
    }
}
```

**Response 422 (Validacion):**
```json
{
    "message": "Los datos proporcionados no son validos.",
    "errors": {
        "email": ["El campo email es obligatorio."],
        "password": ["El campo password es obligatorio."]
    }
}
```

**Response 401 (Credenciales invalidas):**
```json
{
    "message": "Credenciales invalidas. Verifica tu email y contrasena."
}
```

**Rate Limit:** 30 peticiones por minuto.

---

#### `POST /api/v1/auth/register`

Registra un nuevo usuario asegurado.

**Request Body:**
```json
{
    "dni": "12345678",
    "full_name": "Maria Garcia Lopez",
    "email": "maria@example.com",
    "phone": "987654321",
    "password": "Contrasena1",
    "password_confirmation": "Contrasena1",
    "device_name": "Samsung S24"
}
```

**Response 201:**
```json
{
    "data": {
        "token": "2|fedcba0987654321fedcba0987654321",
        "token_type": "Bearer",
        "user": {
            "id": 42,
            "dni": "12345678",
            "full_name": "Maria Garcia Lopez",
            "email": "maria@example.com",
            "roles": ["asegurado"]
        }
    },
    "message": "Usuario registrado exitosamente. Bienvenida a EsSalud."
}
```

**Validaciones:**
- DNI: 8 digitos, unico en el sistema.
- Email: formato valido, unico.
- Password: minimo 8 caracteres, al menos una mayuscula, una minuscula y un numero.
- Phone: 9 digitos.

---

#### `POST /api/v1/auth/refresh`

Refresca el token actual (revoca el anterior, crea uno nuevo).

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
    "data": {
        "token": "3|newtoken1234567890newtoken1234567890"
    }
}
```

---

#### `POST /api/v1/auth/logout`

Cierra sesion revocando el token actual.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
    "message": "Sesion cerrada exitosamente."
}
```

---

#### `GET /api/v1/auth/me`

Obtiene la informacion del usuario autenticado.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
    "data": {
        "id": 1,
        "dni": "12345678",
        "full_name": "Juan Perez",
        "email": "juan@example.com",
        "phone": "987654321",
        "email_verified_at": "2026-01-15T10:30:00.000000Z",
        "roles": ["asegurado"],
        "permissions": ["procedures:read", "procedures:write"],
        "created_at": "2026-01-15T10:00:00.000000Z",
        "stats": {
            "total_procedures": 5,
            "pending_procedures": 2,
            "approved_procedures": 3
        }
    }
}
```

---

### Tramites

#### `GET /api/v1/procedures`

Lista los tramites del usuario autenticado con filtros y paginacion.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

| Parametro   | Tipo   | Default    | Descripcion                                              |
|-------------|--------|------------|----------------------------------------------------------|
| `page`      | int    | 1          | Pagina actual                                            |
| `per_page`  | int    | 15         | Resultados por pagina (max 100)                          |
| `status`    | string | null       | Filtrar por estado: pendiente, en_revision, aprobado, rechazado, completado, cancelado |
| `type_id`   | int    | null       | Filtrar por tipo de tramite                              |
| `search`    | string | null       | Busqueda por texto en campos del tramite                 |
| `date_from` | date   | null       | Fecha de inicio (Y-m-d)                                  |
| `date_to`   | date   | null       | Fecha de fin (Y-m-d)                                     |
| `sort_by`   | string | created_at | Campo de ordenamiento                                    |
| `sort_dir`  | string | desc       | Direccion: asc, desc                                     |

**Response 200:**
```json
{
    "data": [
        {
            "id": 1,
            "code": "TRAM-2026-000001",
            "type": {
                "id": 3,
                "name": "Reembolso de Medicamentos",
                "category": "Salud"
            },
            "status": {
                "code": "pendiente",
                "label": "Pendiente de Revision",
                "color": "amber"
            },
            "fields": {
                "monto_solicitado": 150.00,
                "fecha_atencion": "2026-06-15",
                "establecimiento": "Hospital Rebagliati"
            },
            "documents_count": 2,
            "comments_count": 1,
            "created_at": "2026-06-18T14:30:00.000000Z",
            "updated_at": "2026-06-18T14:30:00.000000Z"
        }
    ],
    "links": {
        "first": "http://localhost:8081/api/v1/procedures?page=1",
        "last": "http://localhost:8081/api/v1/procedures?page=3",
        "prev": null,
        "next": "http://localhost:8081/api/v1/procedures?page=2"
    },
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 3,
        "per_page": 15,
        "to": 15,
        "total": 42
    }
}
```

---

#### `POST /api/v1/procedures`

Crea un nuevo tramite.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
    "procedure_type_id": 3,
    "fields": {
        "monto_solicitado": 150.00,
        "fecha_atencion": "2026-06-15",
        "establecimiento": "Hospital Rebagliati",
        "diagnostico": "Infeccion respiratoria aguda"
    },
    "documents": [5, 12]
}
```

**Response 201:**
```json
{
    "data": {
        "id": 43,
        "code": "TRAM-2026-000043",
        "status": "pendiente",
        "message": "Tramite creado exitosamente. Tu numero de tramite es TRAM-2026-000043."
    }
}
```

**Validaciones:**
- `procedure_type_id`: requerido, debe existir en la tabla de tipos.
- `fields`: requerido, array con campos dinamicos validados segun el tipo.

---

#### `GET /api/v1/procedures/{id}`

Obtiene el detalle completo de un tramite.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
    "data": {
        "id": 1,
        "code": "TRAM-2026-000001",
        "type": {
            "id": 3,
            "name": "Reembolso de Medicamentos",
            "category": "Salud",
            "estimated_days": 15,
            "description": "Solicitud de reembolso por compra de medicamentos..."
        },
        "status": {
            "code": "en_revision",
            "label": "En Revision",
            "color": "blue",
            "assigned_to": {
                "id": 10,
                "full_name": "Funcionario Lopez"
            }
        },
        "fields": {
            "monto_solicitado": 150.00,
            "fecha_atencion": "2026-06-15",
            "establecimiento": "Hospital Rebagliati",
            "diagnostico": "Infeccion respiratoria aguda"
        },
        "documents": [
            {
                "id": 5,
                "name": "receta_medica.pdf",
                "type": "Receta Medica",
                "size_bytes": 245760,
                "status": "validado",
                "uploaded_at": "2026-06-18T14:35:00.000000Z",
                "download_url": "http://localhost:8081/api/v1/documents/5/download"
            }
        ],
        "timeline": [
            {
                "status": "creado",
                "label": "Tramite Creado",
                "description": "Tramite registrado en el sistema",
                "by": "Juan Perez",
                "at": "2026-06-18T14:30:00.000000Z"
            },
            {
                "status": "en_revision",
                "label": "Asignado a Revision",
                "description": "Asignado al funcionario Lopez",
                "by": "Sistema",
                "at": "2026-06-19T09:00:00.000000Z"
            }
        ],
        "comments": [
            {
                "id": 1,
                "user": { "name": "Funcionario Lopez", "role": "funcionario" },
                "content": "Por favor adjuntar el comprobante de pago original.",
                "created_at": "2026-06-19T09:15:00.000000Z"
            }
        ],
        "created_at": "2026-06-18T14:30:00.000000Z",
        "updated_at": "2026-06-19T09:15:00.000000Z"
    }
}
```

---

#### `POST /api/v1/procedures/{id}/submit`

Envia un tramite a revision (cambia de borrador a pendiente).

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
    "data": {
        "id": 1,
        "status": "pendiente",
        "message": "Tramite enviado a revision exitosamente."
    }
}
```

---

#### `POST /api/v1/procedures/{id}/approve`

Aprueba un tramite (requiere rol funcionario o admin).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
    "observations": "Documentacion completa y correcta. Procede el reembolso.",
    "resolution_number": "RES-2026-001234"
}
```

**Response 200:**
```json
{
    "data": {
        "id": 1,
        "status": "aprobado",
        "message": "Tramite aprobado exitosamente."
    }
}
```

---

#### `POST /api/v1/procedures/{id}/reject`

Rechaza un tramite (requiere rol funcionario o admin).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
    "reason": "Documentacion incompleta. Falta el comprobante de pago original.",
    "resolution_number": "RES-2026-001235"
}
```

**Validacion:** `reason` es requerido, minimo 20 caracteres.

**Response 200:**
```json
{
    "data": {
        "id": 1,
        "status": "rechazado",
        "message": "Tramite rechazado. Se ha notificado al asegurado."
    }
}
```

---

### Chat (Asistente Virtual)

#### `POST /api/v1/chat/message`

Envia un mensaje al asistente virtual y obtiene respuesta RAG.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
    "message": "Cuales son los requisitos para solicitar un reembolso?",
    "session_id": null
}
```

**Response 200:**
```json
{
    "data": {
        "id": 1234,
        "session_id": "chat_session_a1b2c3d4",
        "message": "Para solicitar un reembolso de medicamentos en EsSalud necesitas:\n\n1. Receta medica original\n2. Comprobante de pago (boleta o factura)\n3. Documento de identidad (DNI)\n4. Formulario de solicitud\n\nEl plazo maximo es de 30 dias calendario desde la fecha de atencion.",
        "sources": [
            {
                "title": "Guia de Reembolsos EsSalud 2026",
                "section": "3.2 Requisitos para Reembolso",
                "relevance": 0.95
            }
        ],
        "quick_replies": [
            "Cuanto demora el reembolso?",
            "Donde presento la solicitud?",
            "Puedo hacerlo online?"
        ],
        "created_at": "2026-06-21T10:30:00.000000Z"
    }
}
```

**Rate Limit:** 20 peticiones por minuto.

---

#### `GET /api/v1/chat/sessions`

Lista las sesiones de chat del usuario autenticado.

**Headers:** `Authorization: Bearer {token}`

**Response 200:**
```json
{
    "data": [
        {
            "id": "chat_session_a1b2c3d4",
            "title": "Consulta sobre Reembolsos",
            "last_message": "Cuanto demora el reembolso?",
            "message_count": 5,
            "created_at": "2026-06-21T10:25:00.000000Z",
            "updated_at": "2026-06-21T10:30:00.000000Z"
        }
    ]
}
```

---

#### `POST /api/v1/chat/feedback`

Envia feedback sobre una respuesta del asistente.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
    "message_id": 1234,
    "rating": "up",
    "comment": "Muy util, gracias."
}
```

**Response 200:**
```json
{
    "message": "Gracias por tu feedback."
}
```

---

### FAQ

#### `GET /api/v1/faq`

Lista preguntas frecuentes con filtros y busqueda.

**Query Parameters:**

| Parametro     | Tipo   | Default | Descripcion                          |
|---------------|--------|---------|--------------------------------------|
| `category_id` | int    | null    | Filtrar por categoria                |
| `search`      | string | null    | Busqueda por texto en preguntas/respuestas |
| `page`        | int    | 1       | Pagina actual                        |
| `per_page`    | int    | 20      | Resultados por pagina                |

**Response 200:**
```json
{
    "data": [
        {
            "id": 1,
            "question": "Como me afilio a EsSalud?",
            "answer": "Para afiliarte a EsSalud debes presentar tu DNI vigente...",
            "category": {
                "id": 1,
                "name": "Afiliacion",
                "icon": "user-plus"
            },
            "helpful_count": 245,
            "not_helpful_count": 12,
            "updated_at": "2026-03-15T00:00:00.000000Z"
        }
    ],
    "categories": [
        { "id": 1, "name": "Afiliacion", "question_count": 8 },
        { "id": 2, "name": "Tramites", "question_count": 15 },
        { "id": 3, "name": "Cobertura", "question_count": 12 },
        { "id": 4, "name": "Pagos", "question_count": 6 },
        { "id": 5, "name": "Pensiones", "question_count": 10 }
    ],
    "links": {},
    "meta": { "current_page": 1, "total": 51 }
}
```

#### `POST /api/v1/faq/feedback`

Envia feedback sobre la utilidad de una pregunta frecuente.

**Request Body:**
```json
{
    "faq_id": 1,
    "helpful": true
}
```

**Response 200:**
```json
{
    "message": "Gracias por tu feedback."
}
```

---

### Documentos

#### `POST /api/v1/documents/upload`

Sube uno o mas documentos.

**Headers:** `Authorization: Bearer {token}`, `Content-Type: multipart/form-data`

**Request (multipart):**

| Campo              | Tipo   | Descripcion                                    |
|--------------------|--------|------------------------------------------------|
| `file`             | file   | Archivo a subir (PDF, JPG, PNG, max 10MB)      |
| `procedure_id`     | int    | ID del tramite al que pertenece (opcional)     |
| `document_type_id` | int    | Tipo de documento                              |
| `description`      | string | Descripcion opcional del documento             |

**Response 201:**
```json
{
    "data": {
        "id": 25,
        "name": "receta_medica.pdf",
        "mime_type": "application/pdf",
        "size_bytes": 245760,
        "document_type": "Receta Medica",
        "status": "pendiente_validacion",
        "uploaded_at": "2026-06-21T11:00:00.000000Z"
    },
    "message": "Documento subido exitosamente. Sera procesado en breve."
}
```

**Rate Limit:** 10 peticiones por minuto.

---

#### `GET /api/v1/documents`

Lista documentos del usuario autenticado.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

| Parametro      | Tipo   | Descripcion                    |
|----------------|--------|--------------------------------|
| `procedure_id` | int    | Filtrar por tramite            |
| `status`       | string | pendiente_validacion, validado, rechazado |
| `page`         | int    | Pagina actual                  |
| `per_page`     | int    | Resultados por pagina          |

**Response 200:**
```json
{
    "data": [
        {
            "id": 25,
            "name": "receta_medica.pdf",
            "mime_type": "application/pdf",
            "size_bytes": 245760,
            "document_type": "Receta Medica",
            "status": "validado",
            "ocr_data": {
                "paciente": "Juan Perez",
                "medico": "Dr. Garcia",
                "fecha": "2026-06-15"
            },
            "procedure": {
                "id": 1,
                "code": "TRAM-2026-000001"
            },
            "download_url": "http://localhost:8081/api/v1/documents/25/download",
            "uploaded_at": "2026-06-21T11:00:00.000000Z"
        }
    ],
    "meta": { "current_page": 1, "total": 12 }
}
```

---

#### `GET /api/v1/documents/{id}/download`

Descarga el archivo del documento.

**Headers:** `Authorization: Bearer {token}`

**Response 200:** Stream del archivo con headers Content-Type y Content-Disposition apropiados.

**Response 404:**
```json
{
    "message": "Documento no encontrado o no tienes permiso para acceder a el."
}
```

---

### Noticias

#### `GET /api/v1/news`

Lista noticias publicadas.

**Query Parameters:**

| Parametro      | Tipo   | Default | Descripcion                    |
|----------------|--------|---------|--------------------------------|
| `category_id`  | int    | null    | Filtrar por categoria          |
| `search`       | string | null    | Busqueda por titulo/contenido  |
| `page`         | int    | 1       | Pagina actual                  |
| `per_page`     | int    | 12      | Resultados por pagina          |

**Response 200:**
```json
{
    "data": [
        {
            "id": 1,
            "title": "Nuevo servicio de citas en linea",
            "excerpt": "EsSalud lanza plataforma digital para programar citas medicas...",
            "content": "<p>Contenido HTML completo...</p>",
            "image_url": "http://localhost:8081/storage/news/noticia-citas.jpg",
            "category": {
                "id": 1,
                "name": "Institucional"
            },
            "published_at": "2026-06-20T08:00:00.000000Z",
            "created_at": "2026-06-20T08:00:00.000000Z"
        }
    ],
    "links": {},
    "meta": { "current_page": 1, "total": 25 }
}
```

---

#### `GET /api/v1/news/{id}`

Obtiene el detalle completo de una noticia.

**Response 200:**
```json
{
    "data": {
        "id": 1,
        "title": "Nuevo servicio de citas en linea",
        "excerpt": "EsSalud lanza plataforma digital para programar citas medicas...",
        "content": "<p>Contenido HTML completo con imagenes...</p>",
        "image_url": "http://localhost:8081/storage/news/noticia-citas.jpg",
        "category": { "id": 1, "name": "Institucional" },
        "author": { "id": 5, "name": "Oficina de Comunicaciones" },
        "tags": ["citas", "digital", "servicio"],
        "related_news": [
            {
                "id": 3,
                "title": "EsSalud digitaliza sus servicios",
                "image_url": "http://localhost:8081/storage/news/digital.jpg"
            }
        ],
        "published_at": "2026-06-20T08:00:00.000000Z"
    }
}
```

---

### Notificaciones

#### `GET /api/v1/notifications`

Lista notificaciones del usuario autenticado.

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**

| Parametro   | Tipo    | Default | Descripcion                    |
|-------------|---------|---------|--------------------------------|
| `unread`    | boolean | null    | Solo no leidas si true         |
| `type`      | string  | null    | status_change, comment, document, system |

**Response 200:**
```json
{
    "data": [
        {
            "id": 42,
            "type": "status_change",
            "title": "Tramite actualizado",
            "message": "Tu tramite TRAM-2026-000001 ha sido aprobado.",
            "data": {
                "procedure_id": 1,
                "procedure_code": "TRAM-2026-000001",
                "old_status": "en_revision",
                "new_status": "aprobado"
            },
            "read_at": null,
            "created_at": "2026-06-21T09:00:00.000000Z"
        }
    ],
    "meta": {
        "unread_count": 3,
        "total": 25
    }
}
```

#### `POST /api/v1/notifications/{id}/read`

Marca una notificacion como leida.

**Response 200:**
```json
{
    "message": "Notificacion marcada como leida."
}
```

#### `POST /api/v1/notifications/read-all`

Marca todas las notificaciones como leidas.

**Response 200:**
```json
{
    "message": "Todas las notificaciones marcadas como leidas.",
    "data": { "marked_count": 5 }
}
```

---

### Busqueda RAG

#### `POST /api/v1/search`

Realiza una busqueda semantica en la base de conocimiento de EsSalud usando Qdrant + embeddings de OpenAI.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
    "query": "requisitos para pension de jubilacion",
    "top_k": 5
}
```

**Response 200:**
```json
{
    "data": {
        "query": "requisitos para pension de jubilacion",
        "results": [
            {
                "id": "doc_42",
                "title": "Guia de Pensiones - Jubilacion",
                "content": "Para solicitar la pension de jubilacion en EsSalud, el asegurado debe cumplir...",
                "source": "resolucion_123_2025.pdf",
                "section": "Articulo 15 - Requisitos",
                "score": 0.94,
                "metadata": {
                    "document_type": "normativa",
                    "year": 2025
                }
            },
            {
                "id": "faq_8",
                "title": "Como solicito mi pension de jubilacion?",
                "content": "Debes presentar tu DNI, ultimas 12 boletas de pago...",
                "source": "faq",
                "section": null,
                "score": 0.87,
                "metadata": {
                    "document_type": "faq",
                    "category": "Pensiones"
                }
            }
        ],
        "took_ms": 45
    }
}
```

## Formato de Respuesta Estandarizado

Todas las respuestas de la API siguen un formato consistente:

### Respuesta Exitosa

```json
{
    "data": { /* datos especificos del endpoint */ },
    "message": "Mensaje descriptivo (opcional)",
    "links": { /* links de paginacion (si aplica) */ },
    "meta": { /* metadatos de paginacion (si aplica) */ }
}
```

### Respuesta de Error de Validacion (422)

```json
{
    "message": "Los datos proporcionados no son validos.",
    "errors": {
        "field_name": ["Mensaje de error especifico"]
    }
}
```

### Respuesta de Error General (400, 401, 403, 404, 500)

```json
{
    "message": "Descripcion clara del error en espanol.",
    "error_code": "CODIGO_ERROR_OPCIONAL",
    "debug": { /* Solo en entorno local/debug */ }
}
```

## Headers de Respuesta Comunes

| Header                | Descripcion                                    |
|-----------------------|------------------------------------------------|
| `Content-Type`        | `application/json`                             |
| `X-Request-Id`        | UUID unico de la request para trazabilidad     |
| `X-RateLimit-Limit`   | Numero maximo de peticiones en la ventana     |
| `X-RateLimit-Remaining`| Peticiones restantes en la ventana actual     |
| `Retry-After`         | Segundos a esperar si se excede rate limit     |
| `X-Response-Time`     | Tiempo de respuesta en milisegundos (debug)    |

## Codigos de Error

| Codigo HTTP | Significado                                              |
|-------------|----------------------------------------------------------|
| 200         | Operacion exitosa                                        |
| 201         | Recurso creado exitosamente                              |
| 204         | Operacion exitosa sin contenido de respuesta             |
| 400         | Peticion mal formada o parametros invalidos              |
| 401         | No autenticado. Token ausente, invalido o expirado       |
| 403         | Prohibido. El usuario no tiene permisos suficientes      |
| 404         | Recurso no encontrado                                    |
| 413         | Archivo demasiado grande (upload)                        |
| 415         | Tipo de archivo no soportado                             |
| 422         | Error de validacion de datos                             |
| 429         | Demasiadas peticiones (rate limit)                       |
| 500         | Error interno del servidor                               |
| 503         | Servicio no disponible (mantenimiento)                    |

## API Routes en `routes/api.php`

```php
<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProcedureController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\FaqController;
use App\Http\Controllers\Api\V1\DocumentController;
use App\Http\Controllers\Api\V1\NewsController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\SearchController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Rutas publicas (sin auth)
    Route::post('auth/login', [AuthController::class, 'login'])
        ->middleware('throttle:30,1');
    Route::post('auth/register', [AuthController::class, 'register'])
        ->middleware('throttle:30,1');

    // Noticias y FAQ publicas
    Route::get('news', [NewsController::class, 'index']);
    Route::get('news/{id}', [NewsController::class, 'show']);
    Route::get('faq', [FaqController::class, 'index']);
    Route::post('faq/feedback', [FaqController::class, 'feedback']);

    // Rutas protegidas (auth:sanctum)
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('auth/refresh', [AuthController::class, 'refresh']);
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me', [AuthController::class, 'me']);

        // Tramites
        Route::get('procedures', [ProcedureController::class, 'index']);
        Route::post('procedures', [ProcedureController::class, 'store']);
        Route::get('procedures/{id}', [ProcedureController::class, 'show']);
        Route::post('procedures/{id}/submit', [ProcedureController::class, 'submit']);

        // Tramites - solo funcionario/admin
        Route::middleware('role:funcionario|admin')->group(function () {
            Route::post('procedures/{id}/approve', [ProcedureController::class, 'approve']);
            Route::post('procedures/{id}/reject', [ProcedureController::class, 'reject']);
        });

        // Chat
        Route::post('chat/message', [ChatController::class, 'sendMessage'])
            ->middleware('throttle:20,1');
        Route::get('chat/sessions', [ChatController::class, 'sessions']);
        Route::get('chat/sessions/{sessionId}/messages', [ChatController::class, 'messages']);
        Route::post('chat/feedback', [ChatController::class, 'feedback']);

        // Documentos
        Route::post('documents/upload', [DocumentController::class, 'upload'])
            ->middleware('throttle:10,1');
        Route::get('documents', [DocumentController::class, 'index']);
        Route::get('documents/{id}/download', [DocumentController::class, 'download']);

        // Busqueda RAG
        Route::post('search', [SearchController::class, 'search']);

        // Notificaciones
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    });
});
```

## Versionado de API

La API usa versionado por URI (`/api/v1/`). Para futuras versiones:

1. Se crea un nuevo namespace `Api\V2` con sus propios controllers.
2. Se duplican las rutas con prefijo `v2`.
3. Se mantiene `v1` por al menos 12 meses con aviso de deprecacion.
4. Headers de deprecacion: `Sunset: Sat, 31 Dec 2027 23:59:59 GMT`, `Deprecation: true`.

## Buenas Practicas de la API

1. **Idempotencia:** `GET`, `PUT`, `DELETE` son idempotentes. `POST` no lo es.
2. **Plural nouns:** `/procedures` en lugar de `/procedure`.
3. **HATEOAS basico:** links de paginacion y relaciones incluidas en respuestas.
4. **Filtrado:** parametros query para filtros, no cuerpos en GET.
5. **Compresion:** gzip habilitado en Nginx para respuestas > 1KB.
6. **Caching:** headers `ETag` y `Last-Modified` en respuestas GET cacheables (noticias, FAQ).
7. **Paginacion consistente:** formato `links` y `meta` estandar en todas las colecciones.
8. **Sanitizacion:** todos los inputs son validados, escapados y sanitizados.
9. **Logging:** cada request API se loguea con `X-Request-Id` para trazabilidad.
10. **Timeout:** maximo 30 segundos para requests normales, 60 segundos para uploads.
