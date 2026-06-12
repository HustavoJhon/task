# SEGURIDAD Y AUDITORÍA - EsSalud v1.0 Empresarial

## 1. OWASP Top 10 — Mitigación

| OWASP | Riesgo | Mitigación en el Proyecto | Estado |
|:-----:|--------|---------------------------|:------:|
| **A01** | Broken Access Control | RBAC a nivel de middleware, validación por endpoint, principio de mínimo privilegio | ✅ |
| **A02** | Cryptographic Failures | JWT con RS256, bcrypt para passwords, TLS 1.3, cifrado en reposo con pgcrypto | ✅ |
| **A03** | Injection | SQLAlchemy ORM (parametrized queries), input sanitization, validación Pydantic | ✅ |
| **A04** | Insecure Design | Rate limiting, idempotency keys, validación en servidor y cliente | ✅ |
| **A05** | Security Misconfiguration | Configuración por variables de entorno, secrets management, Docker sin root | ✅ |
| **A06** | Vulnerable Components | Trivy scans en CI/CD, versiones pinneadas en requirements, Dependabot | ✅ |
| **A07** | Identification/Auth Failures | JWT con expiración, refresh tokens, bloqueo por intentos, 2FA para admin | ✅ |
| **A08** | Data Integrity Failures | Checksum SHA-256 en documentos, versionado, audit trail completo | ✅ |
| **A09** | Security Logging/Monitoring | Loki para logs estructurados, Prometheus alertas, audit_log en PostgreSQL | ✅ |
| **A10** | SSRF | Restricción de URLs en API Gateway, no permitir redirecciones sin validación | ✅ |

---

## 2. JWT — Estructura y Gestión

### 2.1 Estructura del Token

```
HEADER: {
  "alg": "RS256",
  "typ": "JWT",
  "kid": "key-v1-2025"
}

PAYLOAD: {
  "sub": "12345",
  "email": "user@essalud.gob.pe",
  "dni": "12345678",
  "full_name": "María Pérez",
  "role": "ASEG",
  "roles": ["ASEG"],
  "permissions": ["procedure:CREATE", "procedure:READ"],
  "is_active": true,
  "iat": 1718113600,
  "exp": 1718200000,
  "jti": "550e8400-e29b-41d4-a716-446655440000",
  "iss": "essalud-auth",
  "aud": "essalud-api"
}

FIRMA: RSA-SHA256(base64url(header) + "." + base64url(payload), private_key)
```

### 2.2 Gestión de Claves

```python
# Claves RSA 2048 bits
# Rotación cada 90 días
# Grace period: 7 días donde ambas claves (nueva y anterior) son válidas

KEY_STORE = {
    "key-v1-2025": {
        "private": os.environ["JWT_PRIVATE_KEY_V1"],
        "public": os.environ["JWT_PUBLIC_KEY_V1"],
        "created_at": "2025-01-01",
        "expires_at": "2025-04-01",
        "active": True,
    },
    "key-v2-2025": {
        "private": os.environ["JWT_PRIVATE_KEY_V2"],
        "public": os.environ["JWT_PUBLIC_KEY_V2"],
        "created_at": "2025-03-25",
        "expires_at": "2025-06-25",
        "active": True,  # Grace period overlap
    },
}

def verify_token(token: str) -> TokenPayload:
    header = jwt.get_unverified_header(token)
    kid = header.get("kid")
    key_data = KEY_STORE.get(kid)
    
    if not key_data or not key_data["active"]:
        raise InvalidTokenError("Unknown key ID")
    
    try:
        payload = jwt.decode(
            token,
            key_data["public"],
            algorithms=["RS256"],
            audience="essalud-api",
            issuer="essalud-auth",
            options={"require": ["exp", "iat", "sub", "jti"]}
        )
        return TokenPayload(**payload)
    except jwt.ExpiredSignatureError:
        raise TokenExpiredError()
    except jwt.InvalidTokenError:
        raise InvalidTokenError()
```

### 2.3 Políticas de Token

| Propiedad | Access Token | Refresh Token | Reset Token |
|-----------|:------------:|:-------------:|:-----------:|
| **Tiempo de vida** | 24h | 30 días | 1h |
| **Almacenamiento** | Memoria/secure storage | secure storage | URL/email |
| **Rotación** | Cada refresh | Al usar (nuevo refresh) | Un solo uso |
| **Revocación** | Redis blacklist | Base de datos | - |
| **Formato** | JWT RS256 | UUID v4 | UUID v4 |

---

## 3. RBAC — Implementación a Nivel API

```python
# middleware/auth_middleware.py
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer
from functools import wraps

security = HTTPBearer()

def require_permission(resource: str, action: str):
    """Decorator for RBAC authorization."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            request: Request = kwargs.get("request")
            if not request:
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
            
            if not request:
                raise HTTPException(500, "Request object not found")
            
            user = request.state.user
            
            # Check if user has required permission
            permission = f"{resource}:{action}"
            if permission not in user.permissions:
                raise HTTPException(
                    status_code=403,
                    detail={
                        "code": "FORBIDDEN",
                        "message": f"No tienes permiso para {action} en {resource}",
                    }
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Usage in router
@router.post("/procedures/{id}/approve")
@require_permission("procedure", "APPROVE")
async def approve_procedure(id: int, request: Request):
    # Only OPER, SADM can access this
    pass
```

---

## 4. Rate Limiting

| Endpoint | Límite | Ventana | Acción al exceder |
|----------|:------:|:-------:|-------------------|
| `/auth/login` | 5 | 1 minuto | HTTP 429 + bloqueo 30 min |
| `/auth/register` | 3 | 10 minutos | HTTP 429 |
| `/auth/forgot-password` | 2 | 10 minutos | HTTP 429 |
| `/chat/message` | 30 | 1 minuto | HTTP 429 |
| `/procedures` (POST) | 10 | 1 minuto | HTTP 429 |
| `/documents/upload` | 5 | 1 minuto | HTTP 429 |
| `/news` (GET público) | 100 | 1 minuto | HTTP 429 |
| API general (autenticado) | 100 | 1 minuto | HTTP 429 |
| API general (no autenticado) | 30 | 1 minuto | HTTP 429 |

```python
# Implementation via Redis
async def check_rate_limit(
    redis: Redis,
    key_prefix: str,
    max_requests: int,
    window_seconds: int,
    user_id: str = None,
    ip: str = None
) -> bool:
    key = f"ratelimit:{key_prefix}:{user_id or ip}"
    current = await redis.incr(key)
    
    if current == 1:
        await redis.expire(key, window_seconds)
    
    if current > max_requests:
        ttl = await redis.ttl(key)
        raise HTTPException(
            status_code=429,
            detail={
                "code": "RATE_LIMITED",
                "message": f"Demasiadas solicitudes. Intenta en {ttl} segundos.",
                "retry_after": ttl,
            }
        )
    
    return True
```

---

## 5. Validación de Inputs

| Tipo | Validación | Herramienta |
|------|------------|-------------|
| Strings | Longitud máxima, pattern regex, no HTML | Pydantic `constr`, `validator` |
| Números | Rango, tipo, precisión | Pydantic `conint`, `confloat` |
| Fechas | Formato ISO, no futura, rango | Pydantic `datetime` validators |
| Archivos | Tipo MIME, tamaño, contenido | `python-magic` + size check |
| DNI | 8 dígitos numéricos | Custom validator |
| Email | Formato email, dominio válido | `pydantic.EmailStr` |
| Teléfono | 9 dígitos (Perú) | Regex `^9\d{8}$` |

```python
from pydantic import BaseModel, validator, Field

class RegisterRequest(BaseModel):
    dni: str = Field(pattern=r"^\d{8}$")
    email: str
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=3, max_length=255)
    
    @validator("password")
    def password_strength(cls, v):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Debe contener mayúscula")
        if not re.search(r"[0-9]", v):
            raise ValueError("Debe contener número")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Debe contener símbolo")
        return v
    
    @validator("email")
    def valid_email(cls, v):
        # Plus addressing not allowed for security
        if "+" in v.split("@")[0]:
            raise ValueError("Email no válido")
        return v.lower()
```

---

## 6. Seguridad en MinIO

| Medida | Descripción |
|--------|-------------|
| **Buckets privados** | Por defecto todos los buckets son privados, sin acceso público |
| **Presigned URLs** | Acceso temporal (15min upload, 60min download) firmado con HMAC-SHA256 |
| **CORS configurado** | Solo orígenes permitidos (api.essalud.gob.pe) |
| **Encryption at rest** | SSE-S3 con claves gestionadas por MinIO KMS |
| **Versioning** | Habilitado en buckets de documentos y backups |
| **Bucket policies** | Acceso por servicio específico, no por usuario |
| **Audit logging** | Todas las operaciones registradas en audit_log |

```python
# Generar presigned URL segura
from minio import Minio

client = Minio(
    "minio:9000",
    access_key=MINIO_ACCESS_KEY,
    secret_key=MINIO_SECRET_KEY,
    secure=True,
)

# Upload URL (expira 15 min)
upload_url = client.presigned_put_object(
    "essalud-temp-uploads",
    f"{user_id}/{uuid}.pdf",
    expires=timedelta(minutes=15),
)

# Download URL (expira 60 min)
download_url = client.presigned_get_object(
    "essalud-documents",
    storage_path,
    expires=timedelta(hours=1),
)
```

---

## 7. Cifrado en Reposo

### 7.1 PostgreSQL — pgcrypto

```sql
-- Habilitar extensión
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Cifrar datos sensibles
CREATE TABLE sensitive_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    encrypted_phone BYTEA,           -- pgp_sym_encrypt
    encrypted_address BYTEA,         -- pgp_sym_encrypt
    encryption_key_id INTEGER REFERENCES encryption_keys(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar con cifrado
INSERT INTO sensitive_data (user_id, encrypted_phone, encryption_key_id)
VALUES (
    42,
    pgp_sym_encrypt('999888777', current_setting('app.encryption_key')),
    1
);

-- Leer con descifrado
SELECT 
    user_id,
    pgp_sym_decrypt(encrypted_phone, current_setting('app.encryption_key')) AS phone
FROM sensitive_data
WHERE user_id = 42;
```

### 7.2 Datos Cifrados

| Columna | Tabla | Método | Justificación |
|---------|-------|--------|---------------|
| `password_hash` | users | bcrypt (one-way) | No debe ser reversible |
| `phone` | users | pgp_sym_encrypt (opcional v2.0) | Dato sensible |
| `token_hash` | refresh_tokens | SHA-256 (one-way) | No debe ser reversible |
| `content` | documents.ocr_text | Cifrado en reposo MinIO | Documentos sensibles |

---

## 8. Auditoría

### 8.1 Qué se Loguea en audit_log

| Evento | Datos Capturados | Retención | Severidad |
|--------|------------------|:---------:|:---------:|
| **Login exitoso** | user_id, IP, user_agent, timestamp | 90 días | INFO |
| **Login fallido** | email, IP, intento #, timestamp | 90 días | WARNING |
| **Registro** | user_id, DNI, email, IP | 90 días | INFO |
| **Creación de trámite** | user_id, procedure_id, type | 90 días | INFO |
| **Aprobación/rechazo** | user_id (operador), procedure_id, nuevo estado | 1 año | INFO |
| **Subida de documento** | user_id, document_id, file_name, size | 1 año | INFO |
| **Cambio de rol** | admin_id, target_user_id, rol_anterior, rol_nuevo | 1 año | CRITICAL |
| **Config change** | admin_id, key, valor_anterior, valor_nuevo | 1 año | CRITICAL |
| **Rate limit excedido** | IP, user_id (si auth), endpoint | 30 días | WARNING |
| **Error 5xx** | request_id, service, endpoint, traceback | 30 días | ERROR |

### 8.2 Implementación

```python
async def log_audit(
    db: AsyncSession,
    user_id: int | None,
    action: str,
    resource_type: str,
    resource_id: int | None,
    details: dict | None,
    ip_address: str | None,
    severity: str = "INFO",
):
    entry = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
        severity=severity,
    )
    db.add(entry)
    await db.commit()
    
    # Also emit structured log
    logger.info(
        "Audit event",
        extra={
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "user_id": user_id,
            "severity": severity,
        }
    )
```

---

## 9. Plan de Respuesta a Incidentes

### Runbook Básico

```
1. DETECCIÓN
   - Alerta de monitoring (PagerDuty, Email)
   - Reporte de usuario (soporte@essalud.gob.pe)
   - Escaneo de seguridad automático

2. CLASIFICACIÓN
   - 🔴 CRITICAL: Brecha de datos, caída total, pérdida de datos
   - 🟡 HIGH: Performance degradado, error en funcionalidad core
   - 🟢 LOW: Bug menor, error cosmético

3. CONTENCIÓN (CRITICAL)
   - Activar modo mantenimiento en Nginx
   - Revocar tokens JWT activos
   - Aislar servicio afectado
   - Iniciar backup restore si necesario

4. ERRADICACIÓN
   - Aplicar hotfix
   - Rotar claves/secrets comprometidas
   - Escanear vulnerabilidades

5. RECUPERACIÓN
   - Restaurar desde backup
   - Verificar integridad de datos
   - Health check completo
   - Reanudar servicio

6. LECCIONES APRENDIDAS
   - Post-mortem en 48h
   - Actualizar runbook
   - Implementar prevención
```

---

## 10. Checklist de Seguridad Pre-Producción

- [ ] Todas las claves y secrets rotados (no usar defaults)
- [ ] TLS 1.3 habilitado en Nginx
- [ ] Rate limiting configurado en todos los endpoints públicos
- [ ] CORS configurado solo para orígenes permitidos
- [ ] Headers de seguridad HTTP configurados (HSTS, X-Frame-Options, etc.)
- [ ] JWT con RS256 y expiración configurada
- [ ] RBAC verificado para todos los endpoints
- [ ] Validación de inputs en todas las APIs
- [ ] Logs de auditoría habilitados para eventos críticos
- [ ] MinIO buckets sin acceso público
- [ ] Base de datos sin puertos expuestos públicamente
- [ ] Contenedores Docker sin ejecución como root
- [ ] Pruebas de penetración realizadas
- [ ] SAST y DAST scans sin findings críticos
- [ ] Backup automático configurado y probado
- [ ] Monitoreo y alertas configuradas
- [ ] Plan de respuesta a incidentes documentado

---

## 11. Referencias Cruzadas

| Archivo | Relación |
|---------|----------|
| [[07_ROLES_PERMISOS.md]] | RBAC y matriz de permisos |
| [[20_OBSERVABILIDAD.md]] | Monitoreo y alertas de seguridad |
| [[19_CICD.md]] | Seguridad en el pipeline CI/CD |
| [[17_DOCKER_COMPOSE.md]] | Network security, firewalls |

---

#seguridad #auditoría #jwt #owasp #rbac #essalud #v1.0
