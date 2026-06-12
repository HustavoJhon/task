# DESIGN.md

# Arquitectura

```text
Flutter App
     |
API Gateway
     |
+-------------------+
| Backend API       |
| Chatbot Service   |
| Admin Service     |
+-------------------+
     |
+-------------------+
| PostgreSQL        |
| Redis             |
| Qdrant            |
| MinIO             |
+-------------------+
```

## Stack

### Frontend
- Flutter
- Riverpod
- GoRouter

### Backend
- Spring Boot o NestJS
- JWT
- Swagger

### IA
- RAG
- Qdrant
- OpenAI/Gemini/Ollama

### Almacenamiento
- PostgreSQL
- MinIO

## Entidades

### User
- id
- dni
- email
- password_hash
- role

### News
- id
- title
- content

### Document
- id
- name
- version

### FAQ
- id
- question
- answer

### Procedure
- id
- user_id
- status

### ChatHistory
- id
- user_id
- question
- answer

## Docker

Servicios:
- nginx
- api
- chatbot
- postgres
- redis
- qdrant
- minio

## Seguridad
- JWT
- RBAC
- Auditoría
- Logs
- Rate limiting
