# Requisitos del Sistema

## Requisitos Mínimos

| Componente | Requisito |
|---|---|
| **PHP** | 8.3+ (8.4 recomendado) |
| **Composer** | 2.x |
| **Node.js** | 20+ |
| **NPM** | 10+ |
| **Docker** | 24+ (para entorno completo) |
| **Docker Compose** | v2+ |
| **Espacio en disco** | 2 GB (imágenes Docker) + 500 MB (proyecto) |
| **RAM** | 4 GB mínimo (8 GB recomendado) |

## Extensiones PHP Requeridas

- `sqlsrv` / `pdo_sqlsrv` (Microsoft SQL Server)
- `gd` (procesamiento de imágenes)
- `zip` (instalación de paquetes)
- `intl` (localización)
- `opcache` (caché de opcodes)
- `pcntl` (colas de procesos)
- `mbstring` (cadenas multibyte)
- `curl` (peticiones HTTP)
- `xml` (procesamiento XML)

## Puertos Usados por Docker

| Puerto | Servicio |
|---|---|
| `8080` | Nginx (aplicación) |
| `1433` | SQL Server |
| `6379` | Redis |
| `9000` | MinIO (API S3) |
| `9001` | MinIO (Consola Web) |
| `8025` | Mailpit (Web UI) |
| `1025` | Mailpit (SMTP) |
