# SPEC.md

# Objetivo
Permitir a asegurados consultar información, realizar trámites y obtener respuestas oficiales mediante IA.

## Roles

### ASEGURADO
- Consultar chatbot
- Ver noticias
- Crear trámites
- Subir documentos
- Ver estado

### OPERADOR
- Revisar trámites
- Aprobar/Rechazar

### GESTOR_DOCUMENTAL
- Gestionar PDFs
- Gestionar FAQ

### SUPERVISOR
- Ver métricas
- Analizar consultas

### SUPER_ADMIN
- Acceso total

## Módulos

### Autenticación
- Login
- Recuperación contraseña
- JWT
- Refresh Token

### Chatbot
- FAQ
- RAG
- Citación de fuentes
- Historial

### Trámites
- Registro
- Adjuntos PDF
- Observaciones
- Seguimiento

### Noticias
- CRUD noticias
- Categorías

### Dashboard
- Usuarios activos
- Consultas IA
- Trámites

## Requisitos No Funcionales
- Docker
- Escalable
- API REST
- PostgreSQL
- Seguridad OWASP
- Auditoría
- Logs centralizados
