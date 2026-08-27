# NestJS Learning API

Equivalent NestJS version of the Spring Boot learning project.

## Features

- User registration with BCrypt password hashing
- `USER` and `ADMIN` roles
- JWT access tokens with refresh-token rotation and logout revocation
- Role-protected admin endpoint
- TypeORM with SQLite for local development
- In-memory cache by default and Redis when `REDIS_URL` is configured
- Swagger/OpenAPI
- Unit and end-to-end tests

## Run

```bash
npm install
$env:JWT_SECRET="replace-with-a-long-random-secret"
npm run start:dev
```

Swagger: <http://localhost:3000/swagger>

## Endpoints

- `POST /api/auth/register` - public
- `POST /api/auth/login` - public; returns access and refresh tokens
- `POST /api/auth/refresh` - rotates a valid refresh token
- `POST /api/auth/logout` - revokes a valid refresh token
- `GET /api/auth/me` - bearer JWT required
- `GET /api/admin/health` - bearer JWT and `ADMIN` role required

For `GET /api/auth/me` and the admin endpoint, pass the access token as
`Authorization: Bearer <accessToken>`. The access token lasts 15 minutes. The
refresh token lasts seven days, is stored hashed in the database, and is rotated
on every refresh. This learning implementation stores one active refresh token
per user, so logging in on a second device replaces the first session. Never
commit `JWT_SECRET`; it is mandatory in production.

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
