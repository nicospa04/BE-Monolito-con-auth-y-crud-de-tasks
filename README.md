# NestJS Learning API

Equivalent NestJS version of the Spring Boot learning project.

## Features

- User registration with BCrypt password hashing
- `USER` and `ADMIN` roles
- HTTP Basic authentication
- Role-protected admin endpoint
- TypeORM with SQLite for local development
- In-memory cache by default and Redis when `REDIS_URL` is configured
- Swagger/OpenAPI
- Unit and end-to-end tests

## Run

```bash
npm install
npm run start:dev
```

Swagger: <http://localhost:3000/swagger>

## Endpoints

- `POST /api/auth/register` - public
- `GET /api/auth/me` - HTTP Basic authentication
- `GET /api/admin/health` - requires the `ADMIN` role

Public registration always assigns `USER`; never accept an administrator role from an unauthenticated request.

## Redis

The default cache is in memory. To use Redis from PowerShell:

```powershell
docker run --name learning-redis -p 6379:6379 redis:7-alpine
$env:REDIS_URL="redis://localhost:6379"
npm run start:dev
```

Cached user entries expire after ten minutes.

## Verification

```bash
npm run build
npm test
npm run test:e2e
```

`synchronize` is enabled only outside production for learning convenience. Use migrations in a production project.
