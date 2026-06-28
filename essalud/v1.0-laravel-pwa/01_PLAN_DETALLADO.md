# PLAN DETALLADO - Plataforma Inteligente EsSalud v1.0 Laravel PWA

## 1. Resumen Ejecutivo

### 1.1 Problema
EsSalud enfrenta una demanda creciente de atención al asegurado que satura sus canales tradicionales (presencial, telefónico). Los trámites documentarios requieren múltiples visitas, generando demoras de hasta 30 días hábiles. La información oficial está dispersa en PDFs no estructurados, sin capacidad de búsqueda semántica ni chatbot inteligente.

### 1.2 Solución
Plataforma web integral construida como **monolito modular Laravel 11** que combina:
- **Frontend Blade + Livewire 3** para asegurados y operadores (responsive, sin app móvil separada)
- **Chatbot con IA RAG** que comprende +500 documentos oficiales
- **Gestión documental** con validación automática y OCR
- **Sistema de trámites** con seguimiento en tiempo real
- **Dashboard administrativo** con Filament 3 y métricas de negocio

### 1.3 Valor del Proyecto
- **ROI estimado:** 350% en 18 meses (reducción de costos operativos + menor tiempo de desarrollo)
- **Ahorro estimado:** S/2.8M anuales en atención al asegurado
- **Beneficio social:** Reducción de 60% en tiempo de atención
- **Cobertura:** 10M+ asegurados a nivel nacional
- **Ventaja técnica:** Single codebase reduce costo de mantenimiento vs microservicios

---

## 2. Objetivos SMART

| ID | Objetivo | KPI | Meta | Plazo |
|----|----------|-----|------|-------|
| O-01 | Implementar autenticación con Laravel Sanctum | Tasa de éxito login | >99.9% | Semana 4 |
| O-02 | Digitalizar trámites documentarios | Trámites online / total | >80% | Semana 16 |
| O-03 | Desplegar chatbot con RAG para FAQ | Tasa de resolución automática | >70% | Semana 14 |
| O-04 | Reducir tiempo de consulta | Tiempo promedio respuesta | <2 seg | Semana 16 |
| O-05 | Alcanzar disponibilidad del sistema | Uptime anual | >99.5% | Semana 22 |
| O-06 | Procesar +500 documentos oficiales | Documentos indexados en Qdrant | 500+ | Semana 12 |
| O-07 | Lograr NPS de usuario web | Net Promoter Score | >70 | Semana 22 |
| O-08 | Cobertura de tests automatizados | Pest PHP coverage | >80% | Semana 18 |
| O-09 | Tiempo de onboarding | Usuarios activos semanales | >50K | Semana 22 |
| O-10 | Gestión documental con versionado | Documentos con versionado | 100% | Semana 12 |

---

## 3. Alcance v1.0 vs v2.0

### 3.1 Tabla Comparativa

| Dimensión | v1.0 (2026) | v2.0 (2027) |
|-----------|-------------|-------------|
| **Arquitectura** | Monolito Laravel 11 | Monolito + servicios satélite Node/Go |
| **Frontend** | Blade + Livewire 3 + Tailwind | Livewire + SPA Vue.js para dashboards pesados |
| **Autenticación** | Email + DNI + Sanctum SPA | Biometría facial + Passkeys |
| **Chatbot** | FAQ + RAG sobre documentos oficiales | Asistente predictivo con historial clínico |
| **Trámites** | Afiliación, lactancia, maternidad, sepelio, subsidios | Todos los trámites EsSalud (30+) |
| **Documentos** | PDF, imágenes (JPG/PNG) + OCR | Firma digital + formatos Office |
| **Dashboard** | Filament 3 con KPIs operacionales | BI avanzado con predicciones ML |
| **Admin** | Filament Resources + Widgets | Paneles custom con métricas predictivas |
| **Notificaciones** | Email + notificaciones web | WhatsApp + SMS + email + push |
| **Escalabilidad** | Monolito con caching Redis + Queue | Monolito con réplicas read + servicios satélite |
| **Seguridad** | OWASP Top 10 + Spatie RBAC + Sanctum | ISO 27001 + firma digital |
| **Idiomas** | Español | Español + Quechua + Aymara |
| **Offline** | No soportado | PWA con service worker offline |
| **Pagos** | No incluido | Pasarela de pagos integrada |

### 3.2 Fuera de Alcance v1.0
- Integración con historia clínica electrónica
- Módulo de citas médicas en línea
- Pasarela de pagos en línea
- BI y analytics avanzados con ML predictivo
- Aplicación móvil nativa (se usa responsive web)
- Integración con otros sistemas del estado peruano

---

## 4. Roadmap de 22 Semanas — Fases Detalladas

### Fase 1: Setup y Configuración (Semanas 1-2)
**Objetivo:** Instalar Laravel 11, configurar entorno Docker, establecer base técnica.

| Semana | Actividades | Entregables | Responsable |
|--------|-------------|-------------|-------------|
| 1 | Instalación Laravel 11 + Sail + configuración IDE | Proyecto base funcional | Laravel Dev |
| 1 | Configuración MySQL 8 + Redis + MinIO + Qdrant | docker-compose.yml funcional | DevOps |
| 1 | Instalación de paquetes: Livewire 3, Filament 3, Spatie Permissions, Laravel Sanctum | composer.json completo | Laravel Dev |
| 2 | Configuración de módulos (app/Modules/) | Estructura de carpetas modular | Laravel Dev |
| 2 | Setup CI/CD base con GitHub Actions | Pipeline funcional | DevOps |
| 2 | Configuración Laravel Pint + PHPStan + Pest | Herramientas de calidad | Laravel Dev |

**Duración:** 14 días
**Equipo:** Laravel Dev, DevOps

### Fase 2: Auth y Gestión de Usuarios (Semanas 3-4)
**Objetivo:** Sistema de autenticación completo con roles y permisos.

| Semana | Actividades | Entregables | Responsable |
|--------|-------------|-------------|-------------|
| 3 | Laravel Sanctum SPA auth (login, registro, logout) | API auth funcional | Laravel Dev |
| 3 | Recuperación de contraseña + verificación email | Flujo de recuperación completo | Laravel Dev |
| 3 | Spatie Permissions: roles ASEG, OPER, SUPV, GESDOC, SADM | RBAC implementado | Laravel Dev |
| 4 | Livewire componentes auth (LoginForm, RegisterForm) | Pantallas auth con Blade | Laravel Dev |
| 4 | Perfil de usuario + cambio de contraseña | Gestión de perfil funcional | Laravel Dev |
| 4 | Middleware de autorización por rol + rate limiting | Seguridad de rutas | Laravel Dev |

**Duración:** 14 días
**Dependencias:** Fase 1 completada

### Fase 3: Trámites y Documentos (Semanas 5-7)
**Objetivo:** Sistema de trámites con workflow de estados y gestión documental.

| Semana | Actividades | Entregables | Responsable |
|--------|-------------|-------------|-------------|
| 5 | Modelos Eloquent: Procedure, ProcedureType, ProcedureHistory, ProcedureComment | Modelos con relaciones | Laravel Dev |
| 5 | Workflow Engine de trámites (Service + State Machine) | Lógica de transiciones | Laravel Dev |
| 6 | CRUD trámites: crear, listar, ver detalle, enviar | Pantallas de trámite funcionales | Laravel Dev |
| 6 | Documentos: upload con Livewire (drag & drop), validación | Sistema de upload completo | Laravel Dev |
| 7 | Versionado de documentos + almacenamiento en MinIO | Versionado con MinIO | Laravel Dev |
| 7 | Jobs: ProcessOcr, ValidateDocument con Laravel Queue + Redis | Procesamiento asíncrono | Laravel Dev |

**Duración:** 21 días
**Dependencias:** Fase 2 completada

### Fase 4: Noticias y FAQ (Semanas 8-9)
**Objetivo:** Sistema de contenido informativo y base de conocimiento.

| Semana | Actividades | Entregables | Responsable |
|--------|-------------|-------------|-------------|
| 8 | Modelos Eloquent para News, NewsCategory, Faq, FaqCategory | Modelos de contenido | Laravel Dev |
| 8 | CRUD noticias con categorías y búsqueda full-text | Módulo noticias funcional | Laravel Dev |
| 8 | Livewire: NewsList, NewsDetail, NewsSearch | Componentes Livewire | Laravel Dev |
| 9 | CRUD FAQ con categorías y búsqueda | Módulo FAQ funcional | Laravel Dev |
| 9 | Livewire: FaqAccordion, FaqSearch, FaqCategoryFilter | Componentes FAQ Livewire | Laravel Dev |
| 9 | Seeders con datos de ejemplo + migraciones finales | Datos de prueba | Laravel Dev |

**Duración:** 14 días
**Dependencias:** Fase 2 completada

### Fase 5: Chatbot IA + RAG (Semanas 10-13)
**Objetivo:** Chatbot inteligente con RAG sobre documentos oficiales.

| Semana | Actividades | Entregables | Responsable |
|--------|-------------|-------------|-------------|
| 10 | Integración Qdrant (vector store) + Service Provider | Conexión Qdrant funcional | Laravel Dev |
| 10 | Servicio OpenAIService: embeddings + chat completion | Integración OpenAI | Laravel Dev |
| 11 | Pipeline ingestión PDFs: chunking + embedding + indexación en Qdrant | Job GenerateEmbeddings funcional | Laravel Dev |
| 11 | RAG Engine Service: retrieval + prompt building + response | Lógica RAG completa | Laravel Dev |
| 12 | FAQ Engine: matching semántico con embedding de preguntas | Motor FAQ con Redis cache | Laravel Dev |
| 12 | Livewire: ChatBubble, ChatInput, ChatHistory, TypingIndicator | Componentes de chat | Laravel Dev |
| 13 | Citación de fuentes: extraer referencias de chunks | Fuentes en respuestas | Laravel Dev |
| 13 | Escalamiento a operador humano cuando RAG confidence < 0.6 | Sistema de escalamiento | Laravel Dev |
| 13 | Testing RAG: métricas recall, precisión, latencia | Reporte de calidad RAG | Laravel Dev |

**Duración:** 28 días
**Dependencias:** Fase 3 (Documentos), Qdrant operativo

### Fase 6: Dashboard Admin (Semanas 14-16)
**Objetivo:** Panel administrativo con Filament 3 para gestión y monitoreo.

| Semana | Actividades | Entregables | Responsable |
|--------|-------------|-------------|-------------|
| 14 | Instalación y configuración Filament 3 | Panel /admin funcional | Laravel Dev |
| 14 | Filament Resources: UserResource, ProcedureResource, DocumentResource | CRUDs administrativos | Laravel Dev |
| 15 | Filament Resources: NewsResource, FaqResource, RoleResource | Gestión de contenido | Laravel Dev |
| 15 | Filament Widgets: KPIs, gráficos de trámites, usuarios activos | Dashboard widgets | Laravel Dev |
| 16 | Reportes exportables: PDF/CSV/Excel con Laravel Excel | Exportación de reportes | Laravel Dev |
| 16 | Auditoría: Laravel Auditable + logs de acciones | Sistema de auditoría | Laravel Dev |
| 16 | Alertas configurables: umbrales, notificaciones | Alertas administrativas | Laravel Dev |

**Duración:** 21 días
**Dependencias:** Fases 3, 4, 5 completadas

### Fase 7: Hardening y Pruebas (Semanas 17-19)
**Objetivo:** Seguridad, testing exhaustivo y optimización de rendimiento.

| Semana | Actividad | Métrica | Responsable |
|--------|-----------|---------|-------------|
| 17 | Auditoría de seguridad: OWASP Top 10, CSRF, XSS, SQLi | 0 vulnerabilidades críticas | Laravel Dev |
| 17 | SAST con PHPStan nivel 8 + Larastan | 0 errores | Laravel Dev |
| 18 | Tests de integración con Pest: Auth, Trámites, Documentos | >80% cobertura | QA |
| 18 | Tests de feature: Flujos completos de usuario | Todos los flujos cubiertos | QA |
| 19 | Performance tuning: eager loading, query optimization, Redis cache | p95 <300ms | Laravel Dev |
| 19 | Laravel Octane (opcional, evaluar necesidad) | Benchmark de rendimiento | Laravel Dev |
| 19 | Optimización de assets: Vite + Tailwind purge + lazy loading | Lighthouse score >90 | Laravel Dev |

**Duración:** 21 días
**Dependencias:** Todas las fases previas

### Fase 8: Producción (Semanas 20-22)
**Objetivo:** UAT, correcciones, deploy y go-live.

| Semana | Actividad | Criterios de éxito | Responsable |
|--------|-----------|-------------------|-------------|
| 20 | UAT con 50 usuarios reales de EsSalud | <10 bugs críticos | QA |
| 20 | Pruebas de carga: simulación de 500 usuarios concurrentes | <5% errores bajo carga | DevOps |
| 21 | Correcciones UAT + ajustes finales | 100% bugs críticos resueltos | Laravel Dev |
| 21 | Documentación de usuario final (manuales + videos) | Manuales entregados | Laravel Dev |
| 22 | Deploy producción: servidor VPS/dedicado + SSL + dominio | Sistema en producción | DevOps |
| 22 | Configuración Laravel Horizon para monitoreo de colas | Horizon dashboard | DevOps |
| 22 | Soporte post-producción (2 semanas de hypercare) | SLA <4h respuesta | Todo el equipo |

**Duración:** 21 días
**Dependencias:** Fase 7 completada

---

## 5. Equipo y Roles del Proyecto

| Rol | Perfil | Dedicación | Cantidad | Costo Mensual (USD) |
|-----|--------|------------|----------|--------------------|
| **Product Manager** | Senior con experiencia en salud digital | 50% | 1 | $4,000 |
| **Full-Stack Laravel Dev** | Laravel 11 + Livewire 3 + Filament, 5+ años exp. | 100% | 1 | $8,000 |
| **QA Engineer** | Automatización Pest + manual | 50% | 1 | $2,750 |
| **DevOps Engineer** | Docker, CI/CD, servidores Linux | 25% | 1 | $3,250 |
| **IA/ML Consultant** | RAG, OpenAI, Qdrant | 25% (Semanas 10-13) | 1 | $5,000 |
| **UX/UI Designer** | Diseño web healthcare + Tailwind | 25% (Semanas 1-8) | 1 | $3,000 |

**Total equipo mensual promedio:** ~$18,000 USD
**Costo total del equipo (22 semanas):** ~$90,000 USD

---

## 6. Presupuesto Estimado

| Concepto | Monto (USD) | % del Total |
|----------|-------------|-------------|
| **Recursos Humanos** | $108,000 | 32% |
| **Infraestructura Cloud/Servidores** | $36,000 | 11% |
| **Herramientas y Licencias** | $18,000 | 5% |
| **APIs Externas (OpenAI, RENIEC)** | $42,000 | 13% |
| **Consultorías Especializadas** | $24,000 | 7% |
| **Testing y QA** | $18,000 | 5% |
| **Documentación y Capacitación** | $12,000 | 4% |
| **Contingencia (20%)** | $52,000 | 16% |
| **TOTAL** | **~$310,000** | 100% |

### 6.1 Costos Operativos Mensuales (post-producción)

| Servicio | Costo Mensual (USD) |
|----------|--------------------|
| Servidor VPS/Dedicado (16GB RAM, 8 vCPU) | $400 |
| MySQL 8 (managed o VPS) | $100 |
| Redis (managed o VPS) | $50 |
| MinIO (almacenamiento S3-compatible) | $80 |
| Qdrant Cloud o VPS dedicado | $120 |
| APIs IA (OpenAI Embeddings + Chat) | $2,000 |
| Monitoreo (Grafana Cloud) | $50 |
| Dominio + SSL + CDN | $30 |
| Backups y retención | $50 |
| **Total mensual** | **~$2,880** |

---

## 7. KPIs y Métricas de Éxito

| KPI | Fórmula / Definición | Meta | Frecuencia |
|-----|----------------------|------|------------|
| **Tasa de adopción** | Usuarios registrados / total asegurados | >20% en 12 meses | Mensual |
| **Resolución automática chatbot** | Consultas resueltas sin escalar / total | >70% | Semanal |
| **Tiempo de respuesta chatbot** | Tiempo entre mensaje y respuesta | <2 segundos | Diario |
| **Tasa de finalización trámites** | Trámites completados / iniciados | >85% | Mensual |
| **NPS** | Encuesta: "Recomendarías la plataforma?" | >70 puntos | Trimestral |
| **SLA de disponibilidad** | Uptime / tiempo total | >99.5% | Mensual |
| **Tiempo de aprobación trámites** | Días entre creación y aprobación | <5 días hábiles | Semanal |
| **Cobertura de tests** | Líneas cubiertas / total líneas (Pest) | >80% | Quincenal |
| **Deuda técnica** | Issues PHPStan nivel 8 abiertos | 0 issues | Sprint |
| **Velocidad del equipo** | Story points entregados / sprint | >30 puntos | Por Sprint |
| **Tiempo de carga de página** | LCP (Largest Contentful Paint) | <2.5 segundos | Diario |
| **Puntuación Lighthouse** | Performance / Accessibility / Best Practices | >90 / >95 / >90 | Semanal |

---

## 8. Dependencias Externas

| Dependencia | Tipo | Impacto si falla | Plan B |
|-------------|------|------------------|--------|
| **API RENIEC** | Validación DNI | No se puede registrar usuarios | Validación manual con DNI escaneado |
| **OpenAI API** | Embeddings + Chat | RAG no funciona | Fallback a FAQ engine + Ollama local |
| **GitHub** | CI/CD, repositorio | No deploy automático | Deploy manual desde backup local |
| **Docker Hub** | Imágenes base (Laravel Sail) | No build | Cache local de imágenes |
| **Cloud/VPS Provider** | Hosting producción | Sistema caído | Failover a proveedor secundario |
| **SMTP Provider** | Notificaciones email | Sin notificaciones | Log + reintento cada 15min (Queue retry) |
| **APIs EsSalud Legacy** | Datos de asegurados | Datos inconsistentes | Carga manual batch |
| **Tesseract OCR** | PDFs escaneados | No procesamiento OCR | Servicio OCR cloud (Google Vision) |
| **Qdrant Cloud** | Vector store | RAG caído | FAQ-only mode (degradación gracefully) |

---

## 9. Plan de Contingencia

### 9.1 Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Contingencia |
|--------|-------------|---------|--------------|
| Caída de OpenAI API | Media | Alto | Fallback a modelo local (Ollama/Mistral en VPS) |
| Performance RAG < umbral | Media | Medio | Optimizar chunking + cache de embeddings en Redis |
| Bug crítico en producción | Baja | Alto | Rollback inmediato vía deploy script + hotfix en <4h |
| Migración DB falla | Baja | Alto | Restore desde backup + rollback de migraciones |
| Curva de aprendizaje Livewire 3 | Media | Medio | Capacitación intensiva semana 1 + pair programming |
| Límite de rate de OpenAI | Media | Medio | Implementar caching agresivo + cola de prioridad |

### 9.2 Riesgos de Proyecto

| Riesgo | Probabilidad | Impacto | Contingencia |
|--------|-------------|---------|--------------|
| Rotación de personal | Baja | Alto | Documentación exhaustiva de código + onboarding doc |
| Cambio de alcance | Media | Medio | Comité de cambios + buffer de 1 sprint por fase |
| Retraso en dependencias externas | Media | Alto | Buffer de 1 semana por fase |
| Subestimación de esfuerzo en Livewire | Media | Medio | Sprint 0 de refactor + buffer 20% en estimaciones |
| Problemas de integración con APIs legacy | Alta | Medio | Early spike en semana 2 para validar integraciones |

---

## 10. Ventajas del Enfoque Monolito Laravel

| Ventaja | Detalle |
|---------|---------|
| **Menor costo de desarrollo** | 1 solo dev full-stack vs equipo de 5-6 para microservicios |
| **Menor complejidad operativa** | Un solo deploy, una sola base de datos, sin orquestación de servicios |
| **Transacciones ACID nativas** | Sin necesidad de Sagas ni consistencia eventual entre servicios |
| **Ecosistema integrado** | Sanctum, Horizon, Telescope, Spatie, Filament — todo en un composer.json |
| **Menor latencia** | Sin llamadas HTTP entre servicios, todo es en-proceso |
| **Debugging simplificado** | Un solo stack trace, Laravel Telescope, Laravel Debugbar |
| **Migración progresiva** | Si se necesita escalar, extraer módulos a servicios gradualmente |

---

## 11. Referencias Cruzadas

| Archivo | Relación |
|---------|----------|
| [[22_ROADMAP.md]] | Roadmap detallado con Gantt y milestones |
| [[23_MATRIZ_RIESGOS.md]] | Matriz de riesgos expandida |
| [[24_REQUISITOS_FUNCIONALES.md]] | Catálogo RF vinculados a fases |
| [[25_REQUISITOS_NO_FUNCIONALES.md]] | SLAs y métricas de performance |
| [[02_SPEC_DETALLADO.md]] | Especificación funcional completa |
| [[04_ARQUITECTURA.md]] | Arquitectura del monolito modular |
| [[03_DESIGN_DETALLADO.md]] | UI/UX Blade + Livewire |
| [[26_KANBAN_GANTT.md]] | Gestión de tareas y sprints |

---

#plan #essalud #laravel #roadmap #v1.0 #gestion #livewire #monolito
