# Docker Deployment Guide

## Quick Start

### 1. Prerequisites
- Docker Desktop installed and running
- Docker Compose v2.0+

### 2. Build and Run

```bash
# From the task-manager root directory

# Build and start all services
docker-compose up --build

# Run in detached mode (background)
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **PostgreSQL**: localhost:5432

### 4. Run Database Migrations

```bash
# After services are running
docker-compose exec backend npx prisma migrate deploy
```

## Production Deployment

### Environment Variables

Create a `.env` file in the root directory:

```env
JWT_SECRET=your-super-secret-random-string-minimum-32-characters
NODE_ENV=production
```

### Build for Production

```bash
# Build images
docker-compose build

# Tag images
docker tag taskmanager-backend:latest your-registry/taskmanager-backend:v1.0.0
docker tag taskmanager-frontend:latest your-registry/taskmanager-frontend:v1.0.0

# Push to registry
docker push your-registry/taskmanager-backend:v1.0.0
docker push your-registry/taskmanager-frontend:v1.0.0
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs

# Rebuild without cache
docker-compose build --no-cache

# Remove all containers and start fresh
docker-compose down -v
docker-compose up --build
```

### Database connection issues
```bash
# Check if postgres is healthy
docker-compose ps

# Verify DATABASE_URL
docker-compose exec backend env | grep DATABASE_URL
```

### Port conflicts
```bash
# Change ports in docker-compose.yml
# For example, change "3000:80" to "8080:80" for frontend
```

## Development with Docker

### Hot Reload (Development Mode)

Create `docker-compose.dev.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
    command: npm run dev
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      NODE_ENV: development

  frontend:
    build:
      context: ./frontend
      target: build
    command: npm run dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "5173:5173"
```

Run with:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Backend health
curl http://localhost:5000/api/v1/health

# Frontend health
curl http://localhost:3000/health
```

## Performance Optimization

### Image Size

Current sizes:
- Backend: ~200MB (Alpine-based)
- Frontend: ~25MB (nginx Alpine)
- PostgreSQL: ~250MB (Official Alpine)

### Build Cache

Docker layers are optimized:
- Dependencies are cached separately
- Source code changes don't invalidate dependency layers
- Multi-stage builds minimize final image size

## Security Notes

- Change default database password in production
- Use secrets management for JWT_SECRET
- Enable SSL/TLS in production
- Run containers as non-root user (already configured)
- Keep base images updated

## Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres taskmanager > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres taskmanager < backup.sql
```
