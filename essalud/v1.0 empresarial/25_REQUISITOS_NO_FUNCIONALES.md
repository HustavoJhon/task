# REQUISITOS NO FUNCIONALES - EsSalud v1.0 Empresarial

## 1. Rendimiento

| RNF | Descripción | Métrica | Target | Herramienta de Medición |
|:---:|-------------|:-------:|:------:|------------------------|
| RNF-001 | Tiempo de respuesta de API (p50) | Latencia promedio de endpoints | < 500ms | Prometheus + Grafana |
| RNF-002 | Tiempo de respuesta de API (p95) | Percentil 95 de latencia | < 2s | Prometheus + Grafana |
| RNF-003 | Tiempo de respuesta de API (p99) | Percentil 99 de latencia | < 5s | Prometheus + Grafana |
| RNF-004 | Tiempo de respuesta del chatbot FAQ | Desde que el usuario envía hasta que recibe respuesta FAQ | < 1s | Chatbot metrics |
| RNF-005 | Tiempo de respuesta del chatbot RAG | Desde que el usuario envía hasta que recibe respuesta RAG | < 5s | Chatbot metrics |
| RNF-006 | Tiempo de generación de embedding | Latencia del endpoint de embeddings OpenAI | < 500ms | Prometheus |
| RNF-007 | Tiempo de búsqueda en Qdrant | Latencia de búsqueda vectorial | < 300ms | Prometheus |
| RNF-008 | Tiempo de subida de documento | Tiempo hasta que el archivo está en MinIO | < 10s para 10MB | Document metrics |
| RNF-009 | Tiempo de validación de documento | Pipeline de validación automática | < 5s | Document metrics |
| RNF-010 | Tiempo de indexación de documento | Chunking + embedding + Qdrant upsert | < 3min para 50 págs | Celery metrics |
| RNF-011 | Throughput de API | Requests por segundo sostenidos | > 500 req/s | Prometheus |
| RNF-012 | Throughput del chatbot | Consultas por minuto sostenidas | > 100 consultas/min | Chatbot metrics |
| RNF-013 | Carga de página inicial (app) | Tiempo hasta primer contenido pintado | < 3s | Flutter DevTools |
| RNF-014 | Sincronización de datos | Tiempo entre cambio de estado y notificación al usuario | < 5min | E2E tests |

---

## 2. Disponibilidad

| RNF | Descripción | Métrica | Target |
|:---:|-------------|:-------:|:------:|
| RNF-015 | Disponibilidad del sistema general | Uptime anual | ≥ 99.5% (≈ 44h downtime/año) |
| RNF-016 | Disponibilidad de la API | Uptime de servicios core | ≥ 99.9% |
| RNF-017 | Disponibilidad del chatbot | Uptime del chatbot service | ≥ 99.5% |
| RNF-018 | Ventana de mantenimiento programado | Sin afectar disponibilidad | Domingo 2-4 AM |
| RNF-019 | Tiempo máximo de inactividad no planificada | RTO (Recovery Time Objective) | < 2 horas |
| RNF-020 | Pérdida máxima de datos aceptable | RPO (Recovery Point Objective) | < 15 minutos |
| RNF-021 | SLA de resolución de incidentes críticos | Tiempo hasta restauración | < 4 horas |
| RNF-022 | SLA de resolución de incidentes altos | Tiempo hasta mitigación | < 8 horas |

---

## 3. Escalabilidad

| RNF | Descripción | Métrica | Target |
|:---:|-------------|:-------:|:------:|
| RNF-023 | Escalabilidad horizontal | Número de réplicas por servicio | Hasta 5 (v1.0 Docker) / Ilimitado (v2.0 K8s) |
| RNF-024 | Usuarios concurrentes | Sesiones simultáneas | > 5,000 |
| RNF-025 | Usuarios registrados totales | Cuentas en el sistema | > 500,000 en primer año |
| RNF-026 | Documentos indexados | Documentos en Qdrant | > 5,000 documentos (~500K chunks) |
| RNF-027 | Trámites simultáneos | Trámites en estado activo | > 1,000 |
| RNF-028 | Crecimiento de base de datos | Tamaño estimado PostgreSQL | < 50GB primer año |
| RNF-029 | Escalado de Qdrant | Puntos vectoriales | > 500K puntos |
| RNF-030 | Auto-scaling | Respuesta a picos de demanda | Horizontal con Docker Compose (manual) |

### Límites de Carga

| Componente | Límite Actual | Límite Escalado | Estrategia de Escalado |
|------------|:-------------:|:---------------:|------------------------|
| API Gateway | 500 req/s | 2000 req/s | +réplicas Nginx |
| Auth Service | 200 req/s | 1000 req/s | +réplicas + Redis cluster |
| Chatbot Service | 100 req/s | 500 req/s | +réplicas + Qdrant cluster |
| Procedure Service | 200 req/s | 800 req/s | +réplicas |
| Document Service | 50 req/s | 200 req/s | +réplicas + MinIO HA |
| PostgreSQL | 500 conexiones | 2000 conexiones | PgBouncer + réplica lectura |
| Redis | 10000 ops/s | 50000 ops/s | Redis Cluster |
| Qdrant | 5000 búsquedas/s | 25000 búsquedas/s | Qdrant cluster |

---

## 4. Seguridad

| RNF | Descripción | Estándar | Target |
|:---:|-------------|:---------:|:------:|
| RNF-031 | Autenticación | JWT con RS256 | Tokens firmados con RSA 2048 bits |
| RNF-032 | Autorización | RBAC a nivel de API | Middleware por endpoint + permiso |
| RNF-033 | Cifrado en tránsito | TLS 1.3 | Todas las comunicaciones externas cifradas |
| RNF-034 | Cifrado en reposo | pgcrypto / MinIO SSE | Datos sensibles cifrados |
| RNF-035 | Hash de contraseñas | bcrypt | Cost factor ≥ 12 |
| RNF-036 | Rate limiting | Por endpoint + IP | Límites configurables por rol |
| RNF-037 | OWASP Top 10 | Mitigación de los 10 riesgos | 10/10 mitigados (ver [[21_SEGURIDAD_AUDITORIA]]) |
| RNF-038 | Headers de seguridad | HSTS, X-Frame, XSS | Configurados en Nginx |
| RNF-039 | CORS | Restricción de orígenes | Solo dominios autorizados |
| RNF-040 | Auditoría de accesos | audit_log | 100% de acciones críticas registradas |

---

## 5. Mantenibilidad

| RNF | Descripción | Métrica | Target |
|:---:|-------------|:-------:|:------:|
| RNF-041 | Cobertura de tests unitarios | % de líneas cubiertas | ≥ 80% |
| RNF-042 | Cobertura de tests de integración | % de endpoints cubiertos | ≥ 70% |
| RNF-043 | Cobertura de tests Flutter | % de widgets cubiertos | ≥ 70% |
| RNF-044 | Deuda técnica máxima | Horas estimadas de refactor | < 40 horas |
| RNF-045 | Complejidad ciclomática máxima | Por función/método | ≤ 15 |
| RNF-046 | Duplicación de código | % de código duplicado | ≤ 5% |
| RNF-047 | Convenciones de código | Ruff / Dart format | 100% del código formateado |
| RNF-048 | Documentación de API | OpenAPI spec | 100% de endpoints documentados |
| RNF-049 | Logging estructurado | JSON logging | Todos los servicios |
| RNF-050 | Tiempo de onboarding de nuevo dev | Hasta primer commit productivo | < 5 días |

---

## 6. Portabilidad

| RNF | Descripción | Versión Mínima |
|:---:|-------------|:--------------:|
| RNF-051 | Python runtime | Python 3.11+ |
| RNF-052 | Flutter SDK | Flutter 3.19+ |
| RNF-053 | Dart SDK | Dart 3.3+ |
| RNF-054 | PostgreSQL | 15+ |
| RNF-055 | Redis | 7+ |
| RNF-056 | Qdrant | 1.7+ |
| RNF-057 | MinIO | RELEASE.2024+ |
| RNF-058 | Docker | 24+ |
| RNF-059 | Docker Compose | 2.24+ |
| RNF-060 | Nginx | 1.25+ |
| RNF-061 | iOS Mínimo | iOS 15+ |
| RNF-062 | Android Mínimo | Android 8.0 (API 26) |

---

## 7. Usabilidad

| RNF | Descripción | Estándar | Target |
|:---:|-------------|:---------:|:------:|
| RNF-063 | Tiempo de aprendizaje | Tiempo hasta completar primera tarea | < 3 minutos |
| RNF-064 | Accesibilidad | WCAG 2.1 Nivel AA | Contraste, lectores pantalla, focus |
| RNF-065 | Tamaño mínimo de fuente | Legibilidad en dispositivos móviles | 14px body text |
| RNF-066 | Touch targets | Área mínima táctil | 48x48px |
| RNF-067 | Feedback visual | Indicación de acciones en curso | Loading, success, error states |
| RNF-068 | Mensajes de error | Claros y accionables | No técnicos, con solución sugerida |
| RNF-069 | NPS objetivo | Net Promoter Score | > 70 puntos |
| RNF-070 | Tasa de finalización de trámites | Trámites completados / iniciados | > 85% |

---

## 8. Capacidad

| RNF | Descripción | Estimación v1.0 | Crecimiento Anual |
|:---:|-------------|:---------------:|:-----------------:|
| RNF-071 | Usuarios registrados | 100,000 | +200% |
| RNF-072 | Consultas chatbot/día | 5,000 | +150% |
| RNF-073 | Trámites/día | 500 | +100% |
| RNF-074 | Documentos/día | 1,000 | +100% |
| RNF-075 | Documentos indexados totales | 5,000 | +500 |
| RNF-076 | Almacenamiento MinIO | 50 GB | +100% |
| RNF-077 | Almacenamiento PostgreSQL | 10 GB | +100% |
| RNF-078 | Ancho de banda estimado | 100 Mbps | +100% |

---

## 9. Tabla Resumen

| Categoría | Cantidad RNFs | Críticos para v1.0 | Pospuestos a v2.0 |
|-----------|:-------------:|:------------------:|:-----------------:|
| Rendimiento | 14 | 12 | 2 |
| Disponibilidad | 8 | 8 | 0 |
| Escalabilidad | 8 | 6 | 2 |
| Seguridad | 10 | 10 | 0 |
| Mantenibilidad | 10 | 8 | 2 |
| Portabilidad | 12 | 12 | 0 |
| Usabilidad | 8 | 6 | 2 |
| Capacidad | 8 | 6 | 2 |
| **Total** | **78** | **68** | **10** |

---

## 10. Referencias Cruzadas

| Archivo | Relación |
|---------|----------|
| [[24_REQUISITOS_FUNCIONALES.md]] | Requisitos funcionales vinculados |
| [[21_SEGURIDAD_AUDITORIA.md]] | Seguridad RNF-031 a RNF-040 |
| [[20_OBSERVABILIDAD.md]] | Monitoreo RNF-001 a RNF-014 |
| [[22_ROADMAP.md]] | Plan de implementación de RNF |
| [[01_PLAN_DETALLADO.md]] | SLAs y métricas de éxito |

---

#requisitos #no_funcionales #rfn #rendimiento #escalabilidad #essalud #v1.0
