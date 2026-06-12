# MATRIZ DE RIESGOS - EsSalud v1.0 Empresarial

## 1. Identificación de Riesgos

### R-001 a R-005: Riesgos Técnicos

| ID | Categoría | Descripción | Prob (1-5) | Impacto (1-5) | Exposición (P×I) |
|:--:|:---------:|-------------|:----------:|:--------------:|:----------------:|
| R-001 | Técnico | **Caída de OpenAI API** — El servicio de embeddings o chat no está disponible, afectando todo el sistema RAG | 3 | 5 | **15** |
| R-002 | Técnico | **Performance RAG insuficiente** — La latencia de recuperación + LLM supera los 5 segundos, afectando UX | 3 | 3 | **9** |
| R-003 | Técnico | **Migración de base de datos falla** — Error en migraciones que causa pérdida de datos o downtime prolongado | 2 | 5 | **10** |
| R-004 | Técnico | **Qdrant saturado** — La colección vectorial crece más de lo esperado, afectando velocidad de búsqueda | 2 | 3 | **6** |
| R-005 | Técnico | **Bug crítico en producción** — Error no detectado en QA que afecta funcionalidad core (login, trámites) | 2 | 5 | **10** |

### R-006 a R-010: Riesgos de Seguridad

| ID | Categoría | Descripción | Prob (1-5) | Impacto (1-5) | Exposición (P×I) |
|:--:|:---------:|-------------|:----------:|:--------------:|:----------------:|
| R-006 | Seguridad | **Brecha de datos** — Exposición de datos personales de asegurados (DNI, email, documentos) | 2 | 5 | **10** |
| R-007 | Seguridad | **Ataque de fuerza bruta** — Intentos automatizados de login que comprometen cuentas | 4 | 3 | **12** |
| R-008 | Seguridad | **Inyección de prompts** — Manipulación del LLM para generar respuestas no autorizadas | 3 | 3 | **9** |
| R-009 | Seguridad | **Dependencia vulnerable** — Librería con vulnerabilidad conocida (Supply chain attack) | 3 | 4 | **12** |
| R-010 | Seguridad | **Token JWT comprometido** — Filtración de clave privada o robo de tokens | 1 | 5 | **5** |

### R-011 a R-015: Riesgos de Proyecto

| ID | Categoría | Descripción | Prob (1-5) | Impacto (1-5) | Exposición (P×I) |
|:--:|:---------:|-------------|:----------:|:--------------:|:----------------:|
| R-011 | Proyecto | **Rotación de personal clave** — Salida del arquitecto o tech lead sin transferencia de conocimiento | 3 | 4 | **12** |
| R-012 | Proyecto | **Cambio de alcance frecuente** — Stakeholders agregan requisitos no planificados | 4 | 3 | **12** |
| R-013 | Proyecto | **Subestimación de esfuerzo** — Tareas toman más tiempo del estimado, retrasando el roadmap | 4 | 3 | **12** |
| R-014 | Proyecto | **Problemas de comunicación** — Mala coordinación entre backend y frontend | 3 | 2 | **6** |
| R-015 | Proyecto | **Falta de entorno de pruebas** — Sin ambiente de staging representativo, bugs pasan a producción | 2 | 4 | **8** |

### R-016 a R-020: Riesgos de Integración

| ID | Categoría | Descripción | Prob (1-5) | Impacto (1-5) | Exposición (P×I) |
|:--:|:---------:|-------------|:----------:|:--------------:|:----------------:|
| R-016 | Integración | **API RENIEC no disponible** — No se pueden validar DNIs, bloqueando registro de usuarios | 3 | 4 | **12** |
| R-017 | Integración | **APIs EsSalud legacy incompatibles** — Datos históricos no coinciden con el modelo nuevo | 4 | 3 | **12** |
| R-018 | Integración | **Límites de API OpenAI excedidos** — El consumo supera el tier contratado, causando throttling | 3 | 3 | **9** |
| R-019 | Integración | **Problemas de conectividad con MinIO** — Latencia alta en almacenamiento de objetos | 2 | 3 | **6** |
| R-020 | Integración | **Dependencia de servicios cloud** — Corte de servicio del proveedor cloud afecta disponibilidad | 2 | 4 | **8** |

### R-021 a R-025: Riesgos de Negocio

| ID | Categoría | Descripción | Prob (1-5) | Impacto (1-5) | Exposición (P×I) |
|:--:|:---------:|-------------|:----------:|:--------------:|:----------------:|
| R-021 | Negocio | **Baja adopción de usuarios** — Menos del 10% de asegurados usan la plataforma en el primer año | 3 | 4 | **12** |
| R-022 | Negocio | **Calidad insuficiente del RAG** — El chatbot no resuelve las consultas, generando mala experiencia | 3 | 3 | **9** |
| R-023 | Negocio | **Costo operativo mayor al estimado** — APIs OpenAI + infraestructura superan el presupuesto | 3 | 3 | **9** |
| R-024 | Negocio | **Cambio regulatorio** — Nueva normativa de salud digital que requiere cambios en el sistema | 2 | 4 | **8** |
| R-025 | Negocio | **Resistencia al cambio del personal** — Operadores no adoptan el sistema digital | 3 | 3 | **9** |

---

## 2. Tabla Semáforo de Riesgos

| Exposición | Color | Cantidad de Riesgos |
|:----------:|:-----:|:-------------------:|
| **> 15** | 🔴 Rojo | 1 (R-001) |
| **8 - 15** | 🟡 Amarillo | 17 (R-002 a R-022) |
| **< 8** | 🟢 Verde | 7 (R-004, R-014, R-019, etc.) |

### Mapa de Calor (Matriz 5×5)

| Probabilidad | Impacto 1 | Impacto 2 | Impacto 3 | Impacto 4 | Impacto 5 |
|:------------:|:---------:|:---------:|:---------:|:---------:|:---------:|
| **5 — Muy Alta** | 🟢 | 🟡 | 🟡 | 🔴 | 🔴 |
| **4 — Alta** | 🟢 | 🟡 | 🟡 R-007, R-012, R-013, R-017 | 🔴 | 🔴 |
| **3 — Media** | 🟢 | 🟡 R-014, R-022 | 🟡 R-008, R-018, R-023, R-025 | 🟡 R-011, R-016 | 🔴 R-001 |
| **2 — Baja** | 🟢 | 🟢 | 🟡 R-019, R-015 | 🟡 R-024, R-020 | 🔴 R-003, R-005, R-006 |
| **1 — Muy Baja** | 🟢 | 🟢 | 🟢 | 🟢 | 🟡 R-010 |

---

## 3. Plan de Mitigación y Contingencia

| ID | Estrategia | Mitigación | Contingencia | Responsable | Estado |
|:--:|:----------:|------------|--------------|:-----------:|:------:|
| R-001 | Mitigar | Fallback a modelo local (Ollama/Mistral), cache de embeddings comunes | Activar FAQ-only mode + mensaje de servicio limitado | IA Engineer | 🟡 Activo |
| R-002 | Mitigar | Optimizar chunking, reducir top_k, implementar cache de respuestas frecuentes | Aumentar timeout de frontend, mostrar loading state | Backend Lead | 🟡 Activo |
| R-003 | Mitigar | Backup automático diario, migraciones probadas en staging primero | Restore desde backup, rollback de schema | DevOps | 🟢 Controlado |
| R-004 | Mitigar | Monitoreo de tamaño de colección, escalado horizontal de Qdrant | Aumentar recursos del contenedor Qdrant | DevOps | 🟢 Controlado |
| R-005 | Mitigar | CI/CD con tests automáticos, code review obligatorio, QA en staging | Rollback inmediato, hotfix en <4h | QA Lead | 🟡 Activo |
| R-006 | Mitigar | Cifrado en reposo, presigned URLs, bucket policies, auditoría | Rotar claves, notificar a DPO, análisis forense | Security | 🟢 Controlado |
| R-007 | Mitigar | Rate limiting en login, bloqueo por intentos, 2FA para admin | Revisión manual de intentos sospechosos | Backend Lead | 🟢 Controlado |
| R-008 | Mitigar | System prompt hardening, validación de output, límite de contexto | Revisión manual de respuestas anómalas | IA Engineer | 🟡 Activo |
| R-009 | Mitigar | Dependabot, Trivy scans en CI/CD, versiones pinneadas | Actualización urgente de dependencia | DevOps | 🟢 Controlado |
| R-010 | Mitigar | Rotación de claves cada 90 días, almacenamiento seguro | Revocar todos los tokens, regenerar claves | Security | 🟢 Controlado |
| R-011 | Mitigar | Documentación detallada, pairing programación, overlap en transición | Contratar reemplazo con documentación existente | PM | 🟡 Activo |
| R-012 | Mitigar | Comité de cambios, backlog priorizado por trimestre, MVP scope | Postergar a v2.0, negociar con stakeholders | PM | 🟡 Activo |
| R-013 | Mitigar | Buffer de 20% en estimaciones, sprints de 2 semanas, revisión semanal | Replanificar sprints, reducir alcance no crítico | PM | 🟡 Activo |
| R-014 | Mitigar | Reuniones diarias (standup), especificación OpenAPI compartida | Sprint review con todo el equipo | Tech Lead | 🟢 Controlado |
| R-015 | Mitigar | Ambiente staging idéntico a producción, CI/CD deploy automático | Deploy manual controlado | DevOps | 🟢 Controlado |
| R-016 | Mitigar | Cache de validación RENIEC, reintento con backoff | Validación manual con DNI escaneado | Backend Lead | 🟡 Activo |
| R-017 | Mitigar | Bridge API con adaptadores, mapeo de datos | Carga manual batch, limpieza de datos | Backend Lead | 🟡 Activo |
| R-018 | Mitigar | Monitoreo de uso, cache de embeddings, tier adecuado | Upgrade de tier, reducir consumo | IA Engineer | 🟢 Controlado |
| R-019 | Mitigar | Health checks de MinIO, conexión redundante | Failover a bucket secundario | DevOps | 🟢 Controlado |
| R-020 | Mitigar | Multi-AZ deployment, backup local | Migración temporal a proveedor alternativo | DevOps | 🟡 Activo |
| R-021 | Mitigar | Campaña de comunicación, onboarding guiado, incentivos | Focus groups, mejora continua de UX | Product Mgr | 🟡 Activo |
| R-022 | Mitigar | Evaluación continua de calidad RAG, mejora de prompts | Aumentar FAQ curada por gestores | IA Engineer | 🟡 Activo |
| R-023 | Mitigar | Monitoreo de costos, alertas de consumo, optimización de tokens | Reducir uso de OpenAI en horarios valle | PM | 🟢 Controlado |
| R-024 | Mitigar | Seguimiento de normativa, arquitectura flexible | Adaptación del sistema con buffer de tiempo | PM | 🟢 Controlado |
| R-025 | Mitigar | Capacitación, soporte cercano, UI intuitiva | Programa de embajadores digitales | Product Mgr | 🟡 Activo |

---

## 4. Resumen de Riesgos por Categoría

| Categoría | Total | 🔴 Rojo | 🟡 Amarillo | 🟢 Verde |
|:---------:|:----:|:-------:|:-----------:|:--------:|
| Técnico | 5 | 1 | 2 | 2 |
| Seguridad | 5 | 0 | 3 | 2 |
| Proyecto | 5 | 0 | 4 | 1 |
| Integración | 5 | 0 | 4 | 1 |
| Negocio | 5 | 0 | 4 | 1 |
| **Total** | **25** | **1** | **17** | **7** |

---

## 5. Plan de Monitoreo de Riesgos

| Actividad | Frecuencia | Responsable |
|-----------|:----------:|:-----------:|
| Revisión de riesgos activos | Semanal (cada sprint) | PM + Tech Lead |
| Actualización de matriz | Mensual | PM |
| Revisión de riesgos técnicos | Quincenal | Tech Lead |
| Revisión de seguridad | Mensual | Security Officer |
| Monitoreo de costos cloud | Semanal | DevOps |
| Análisis de calidad RAG | Semanal | IA Engineer |
| Reporte ejecutivo de riesgos | Mensual | PM |

---

## 6. Referencias Cruzadas

| Archivo | Relación |
|---------|----------|
| [[01_PLAN_DETALLADO.md]] | Plan de contingencia del proyecto |
| [[22_ROADMAP.md]] | Roadmap afectado por riesgos |
| [[21_SEGURIDAD_AUDITORIA.md]] | Riesgos de seguridad mitigados |
| [[20_OBSERVABILIDAD.md]] | Monitoreo para detección temprana |

---

#riesgos #matriz #riesgos #contingencia #essalud #v1.0
