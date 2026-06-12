# PLAN DETALLADO - Plataforma Inteligente EsSalud v1.0 Empresarial

## 1. Resumen Ejecutivo

### 1.1 Problema
EsSalud enfrenta una demanda creciente de atención al asegurado que satura sus canales tradicionales (presencial, telefónico). Los trámites documentarios requieren múltiples visitas, generando demoras de hasta 30 días hábiles. La información oficial está dispersa en PDFs no estructurados, sin capacidad de búsqueda semántica ni chatbot inteligente.

### 1.2 Solución
Plataforma digital integral que combina:
- **App móvil Flutter** para asegurados y operadores
- **Chatbot con IA RAG** que comprende +500 documentos oficiales
- **Gestión documental** con validación automática
- **Sistema de trámites** con seguimiento en tiempo real
- **Dashboard administrativo** con métricas de negocio

### 1.3 Valor del Proyecto
- **ROI estimado:** 300% en 24 meses (reducción de costos operativos)
- **Ahorro estimado:** S/2.5M anuales en atención al asegurado
- **Beneficio social:** Reducción de 60% en tiempo de atención
- **Cobertura:** 10M+ asegurados a nivel nacional

---

## 2. Objetivos SMART

| ID | Objetivo | KPI | Meta | Plazo |
|----|----------|-----|------|-------|
| O-01 | Implementar autenticación segura con JWT | Tasa de éxito login | >99.9% | Mes 3 |
| O-02 | Digitalizar trámites documentarios | Trámites online / total | >80% | Mes 9 |
| O-03 | Desplegar chatbot con RAG para FAQ | Tasa de resolución automática | >70% | Mes 8 |
| O-04 | Reducir tiempo de consulta | Tiempo promedio respuesta | <3 seg | Mes 10 |
| O-05 | Alcanzar disponibilidad del sistema | Uptime anual | >99.5% | Mes 12 |
| O-06 | Procesar +500 documentos oficiales | Documentos indexados | 500+ | Mes 7 |
| O-07 | Lograr NPS de usuario | Net Promoter Score | >70 | Mes 12 |
| O-08 | Cobertura de tests automatizados | Cobertura de código | >80% | Mes 11 |
| O-09 | Tiempo de onboarding chatbot | Usuarios activos semanales | >50K | Mes 12 |
| O-10 | Gestión documental con versionado | Documentos con versionado | 100% | Mes 8 |

---

## 3. Alcance v1.0 vs v2.0

### 3.1 Tabla Comparativa

| Dimensión | v1.0 (2025) | v2.0 (2026) |
|-----------|-------------|-------------|
| **Autenticación** | Email + DNI + JWT | Biometría facial + huella |
| **Chatbot** | FAQ + RAG sobre documentos oficiales | Asistente predictivo con historial clínico |
| **Trámites** | Afiliación, lactancia, maternidad, sepelio, subsidios | Todos los trámites EsSalud (30+) |
| **Documentos** | PDF, imágenes (JPG/PNG) | Todos los formatos Office + firma digital |
| **Dashboard** | KPIs operacionales básicos | BI avanzado con predicciones ML |
| **Notificaciones** | Email + push notifications | WhatsApp + SMS + email |
| **Escalabilidad** | Docker Compose (vertical) | Kubernetes (horizontal) |
| **Seguridad** | OWASP Top 10 + RBAC | ISO 27001 + firma digital |
| **Idiomas** | Español | Español + Quechua + Aymara |
| **Offline** | No soportado | Modo offline completo |
| **Pagos** | No incluido | Pasarela de pagos integrada |

### 3.2 Fuera de Alcance v1.0
- Integración con historia clínica electrónica
- Módulo de citas médicas en línea
- Pasarela de pagos
- BI y analytics avanzados con ML
- Versión web completa (solo mobile-first)
- Integración con otros sistemas del estado

---

## 4. Roadmap de 12 Meses — Fases Detalladas

### Fase 1: Descubrimiento (Semanas 1-6)
**Objetivo:** Definir requisitos, clasificar documentación y establecer base técnica.

| Semana | Actividades | Entregables | Responsable |
|--------|-------------|-------------|-------------|
| 1-2 | Levantamiento de requisitos con stakeholders | Documento de requisitos v1.0 | Product Manager |
| 3 | Clasificación documental EsSalud (500+ PDFs) | Taxonomía documental | IA Engineer |
| 4 | Definición de arquitectura base | ADR-001 a ADR-005 | Arquitecto |
| 5 | Setup repositorio y CI/CD base | Pipeline CI/CD funcional | DevOps |
| 6 | Revisión y aprobación de documentación | Documentos firmados | Todos |

**Duración:** 42 días
**Equipo:** Product Manager, Arquitecto, DevOps, IA Engineer

### Fase 2: Infraestructura Base (Semanas 7-10)
**Objetivo:** Setup de infraestructura con Docker Compose y servicios base.

| Semana | Actividades | Entregables | Responsable |
|--------|-------------|-------------|-------------|
| 7 | Docker Compose base (servicios core) | docker-compose.yml | DevOps |
| 8 | PostgreSQL + migraciones iniciales | Schema v1.0 en base | Backend |
| 9 | MinIO + Qdrant + Redis setup | Servicios operativos | DevOps |
| 10 | Monitoring base (Prometheus + Grafana) | Dashboard infra | DevOps |

**Duración:** 28 días

### Fase 3: Backend Core (Semanas 11-22)
**Objetivo:** Implementar todos los microservicios del backend.

| Semana | Servicio | Actividades | Endpoints |
|--------|----------|-------------|-----------|
| 11-13 | Auth Service | Login, registro, refresh token, logout | 6 endpoints |
| 14-15 | User Service + RBAC | CRUD usuarios, roles, permisos | 8 endpoints |
| 16-18 | Procedure Service | CRUD trámites, workflow estados | 10 endpoints |
| 19-20 | Document Service | Upload, versionado, validación automática | 6 endpoints |
| 21-22 | News Service | CRUD noticias con categorías | 5 endpoints |

**Duración:** 84 días
**Dependencias:** Fase 2 completada

### Fase 4: Frontend Flutter MVP (Semanas 15-24)
**Objetivo:** App móvil funcional con módulos core.

| Semana | Módulo | Pantallas |
|--------|--------|-----------|
| 15-16 | Setup Flutter + arquitectura | Proyecto base con Riverpod |
| 17 | Auth screens | Login, registro, recuperación contraseña |
| 18 | Home + Noticias | Dashboard principal, feed noticias |
| 19-21 | Trámites | Lista, detalle, creación, estado actual |
| 22 | Subida de documentos | Upload con preview |
| 23-24 | Perfil y configuración | Edición perfil, settings |

**Duración:** 70 días
**Dependencias:** Auth Service operativo

### Fase 5: IA y RAG (Semanas 18-30)
**Objetivo:** Pipeline de IA para FAQ automáticas y RAG.

| Semana | Componente | Actividades |
|--------|------------|-------------|
| 18-20 | Pipeline ingestión PDFs | Validación, chunking, embedding worker |
| 21-22 | FAQ Engine | FAQ clasificadas, matching semántico |
| 23-25 | RAG Engine | Qdrant collection, retrieval, prompt templates |
| 26-27 | Chatbot UI Flutter | Burbujas chat, typing indicator, citación |
| 28-29 | Citación de fuentes | Referenciar documento origen |
| 30 | Testing RAG | Métricas recall, precisión, latencia |

**Duración:** 91 días
**Dependencias:** Document Service, Qdrant operativo

### Fase 6: Dashboard Admin (Semanas 30-36)
**Objetivo:** Panel administrativo con KPIs y gestión documental.

| Semana | Módulo | Componentes |
|--------|--------|-------------|
| 30-31 | Panel métricas | KPI cards, gráficos tiempo real |
| 32-33 | Gestión de trámites | Aprobación/rechazo, filtros avanzados |
| 34-35 | Gestión documental | FAQ editor, documentos por revisar |
| 36 | Alertas y exportación | Reportes PDF/CSV, alertas configurables |

**Duración:** 49 días
**Dependencias:** Procedure Service, Document Service

### Fase 7: Hardening (Semanas 36-44)
**Objetivo:** Seguridad, testing y performance.

| Semana | Actividad | Métrica |
|--------|-----------|---------|
| 36-38 | Auditoría y seguridad avanzada | OWASP, SAST (Bandit) |
| 39-40 | Tests de integración completos | 80% cobertura |
| 41-42 | Performance tuning | Latencia p95 <500ms |
| 43-44 | Observabilidad completa | Dashboards + alertas |

**Duración:** 63 días

### Fase 8: Producción (Semanas 44-52)
**Objetivo:** UAT, correcciones y go-live.

| Semana | Actividad | Criterios de éxito |
|--------|-----------|-------------------|
| 44-45 | UAT con 100 usuarios reales | <10 bugs críticos |
| 46-47 | Correcciones UAT | 100% bugs críticos resueltos |
| 48-49 | Deploy producción | Rollback plan ready |
| 50 | Documentación usuario final | Manuales + videos |
| 51-52 | Soport post-producción | SLA <4h respuesta |

**Duración:** 63 días

---

## 5. Equipo y Roles del Proyecto

| Rol | Perfil | Dedicación | Cantidad | Costo Mensual (USD) |
|-----|--------|------------|----------|--------------------|
| **Product Manager** | Senior con experiencia en salud digital | 100% | 1 | $8,000 |
| **Tech Lead / Arquitecto** | Full-stack + cloud, 8+ años exp. | 100% | 1 | $10,000 |
| **Backend Developer** | Python/FastAPI senior | 100% | 2 | $7,000 c/u |
| **Backend Developer** | Python/FastAPI semi-senior | 100% | 1 | $5,500 |
| **Frontend Developer** | Flutter senior | 100% | 2 | $7,000 c/u |
| **DevOps Engineer** | Docker/K8s CI/CD | 50% | 1 | $6,500 |
| **IA/ML Engineer** | RAG, NLP, LangChain | 100% | 1 | $9,000 |
| **QA Engineer** | Automatización + manual | 100% | 1 | $5,500 |
| **UX/UI Designer** | Diseño móvil healthcare | 50% (Mes 1-6) | 1 | $5,000 |
| **Security Officer** | Seguridad de aplicaciones | 25% (Mes 8-12) | 1 | $6,000 |

**Total equipo mensual promedio:** ~$62,500 USD

---

## 6. Presupuesto Estimado

| Concepto | Monto (USD) | % del Total |
|----------|-------------|-------------|
| **Recursos Humanos** | $390,000 | 65% |
| **Infraestructura Cloud** | $60,000 | 10% |
| **Herramientas y Licencias** | $30,000 | 5% |
| **APIs Externas (OpenAI, etc.)** | $36,000 | 6% |
| **Consultorías Especializadas** | $24,000 | 4% |
| **Testing y QA** | $30,000 | 5% |
| **Contingencia (15%)** | $85,500 | 15% |
| **TOTAL** | **~$600,000** | 100% |

### 6.1 Costos Operativos Mensuales (post-producción)

| Servicio | Costo Mensual (USD) |
|----------|--------------------|
| Servidores cloud (AWS/GCP) | $4,500 |
| APIs IA (OpenAI Embeddings + Chat) | $3,000 |
| Monitoreo (Grafana Cloud) | $500 |
| Almacenamiento (MinIO/Backups) | $800 |
| **Total mensual** | **$8,800** |

---

## 7. KPIs y Métricas de Éxito

| KPI | Fórmula / Definición | Meta | Frecuencia |
|-----|----------------------|------|------------|
| **Tasa de adopción** | Usuarios registrados / total asegurados | >25% en 12 meses | Mensual |
| **Resolución automática chatbot** | Consultas resueltas sin escalar / total | >70% | Semanal |
| **Tiempo de respuesta chatbot** | Tiempo entre mensaje y respuesta | <2 segundos | Diario |
| **Tasa de finalización trámites** | Trámites completados / iniciados | >85% | Mensual |
| **NPS** | Encuesta: "Recomendarías la app?" | >70 puntos | Trimestral |
| **SLA de disponibilidad** | Uptime / tiempo total | >99.5% | Mensual |
| **Tiempo de aprobación trámites** | Días entre creación y aprobación | <5 días hábiles | Semanal |
| **Cobertura de tests** | Líneas cubiertas / total líneas | >80% | Quincenal |
| **Deuda técnica** | Horas estimadas de refactor | <40 horas | Sprint |
| **Velocidad del equipo** | Story points entregados / sprint | >50 puntos | Por Sprint |

---

## 8. Dependencias Externas

| Dependencia | Tipo | Impacto si falla | Plan B |
|-------------|------|------------------|--------|
| **API RENIEC** | Validación DNI | No se puede registrar usuarios | Validación manual con DNI escaneado |
| **OpenAI API** | Embeddings + Chat | RAG no funciona | Fallback a FAQ engine + Ollama local |
| **GitHub** | CI/CD, container registry | No deploy automático | Deploy manual desde local |
| **Docker Hub** | Imágenes base | No build | Cache local de imágenes |
| **Cloud Provider** | Hosting producción | Sistema caído | Failover a proveedor secundario |
| **SMTP Provider** | Notificaciones email | Sin notificaciones | Log + reintento cada 15min |
| **APIs EsSalud Legacy** | Datos de asegurados | Datos inconsistentes | Carga manual batch |
| **Tesseract OCR** | PDFs escaneados | No procesamiento OCR | Servicio OCR cloud (Google Vision) |

---

## 9. Plan de Contingencia

### 9.1 Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Contingencia |
|--------|-------------|---------|--------------|
| Caída de OpenAI API | Media | Alto | Fallback a modelo local (Ollama/Mistral) |
| Performance RAG < umbral | Media | Medio | Optimizar chunking + cache de embeddings |
| Bug crítico en producción | Baja | Alto | Rollback inmediato + hotfix en <4h |
| Migración DB falla | Baja | Alto | Restore desde backup + rollback schema |

### 9.2 Riesgos de Proyecto

| Riesgo | Probabilidad | Impacto | Contingencia |
|--------|-------------|---------|--------------|
| Rotación de personal | Media | Medio | Documentación de conocimiento + overlap |
| Cambio de alcance | Alta | Medio | Comité de cambios + priorización trimestral |
| Retraso en dependencias externas | Media | Alto | Buffer de 2 semanas por fase |
| Subestimación de esfuerzo | Media | Alto | Sprint 0 de refactor + buffer 20% |

---

## 10. Referencias Cruzadas

| Archivo | Relación |
|---------|----------|
| [[22_ROADMAP.md]] | Roadmap detallado con Gantt y milestones |
| [[23_MATRIZ_RIESGOS.md]] | Matriz de riesgos expandida |
| [[24_REQUISITOS_FUNCIONALES.md]] | Catálogo RF vinculados a fases |
| [[25_REQUISITOS_NO_FUNCIONALES.md]] | SLAs y métricas de performance |
| [[02_SPEC_DETALLADO.md]] | Especificación funcional completa |
| [[03_DESIGN_DETALLADO.md]] | Decisiones arquitectónicas |
| [[26_KANBAN_GANTT.md]] | Gestión de tareas y sprints |

---

#plan #essalud #roadmap #v1.0 #gestion
