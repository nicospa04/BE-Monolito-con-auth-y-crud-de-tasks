# NestJS Learning API

Equivalent NestJS version of the Spring Boot learning project.

## Features

- User registration with BCrypt password hashing
- `USER` and `ADMIN` roles
- JWT access tokens with refresh-token rotation and logout revocation
- Private Tasks CRUD with ownership, pagination and status filtering
- Role-protected admin endpoint
- PostgreSQL with versioned TypeORM migrations
- In-memory cache by default and Redis when `REDIS_URL` is configured
- Swagger/OpenAPI
- Unit and end-to-end tests

## Run

```bash
npm install
$env:DATABASE_URL="postgres://learning:learning@localhost:5433/nest_learning"
$env:JWT_SECRET="replace-with-a-long-random-secret"
npm run migration:run
npm run start:dev
```

Swagger: <http://localhost:3000/swagger>

## Docker Compose

Copy `.env.example` to `.env` and replace `JWT_SECRET` with a long random
secret. If you previously started the manual `nest-learning-postgres`
container, stop and remove that container first because Compose uses host port
`5433` for its PostgreSQL service:

```powershell
docker stop nest-learning-postgres
docker rm nest-learning-postgres
docker compose up --build
```

Compose starts PostgreSQL, Redis and the API. The API waits for both backing
services to become healthy, runs pending migrations, then starts on port 3000.
The API reaches PostgreSQL as `postgres:5432` and Redis as `redis:6379` inside
the Docker network; `localhost` would refer to the API container itself.

To stop the stack without deleting data:

```powershell
docker compose down
```

## Endpoints

- `POST /api/auth/register` - public
- `POST /api/auth/login` - public; returns access and refresh tokens
- `POST /api/auth/refresh` - rotates a valid refresh token
- `POST /api/auth/logout` - revokes a valid refresh token
- `GET /api/auth/me` - bearer JWT required
- `GET /api/admin/health` - bearer JWT and `ADMIN` role required
- `POST /api/tasks` - creates a task for the authenticated user
- `GET /api/tasks?page=1&limit=20&status=TODO` - lists only that user's tasks
- `GET/PATCH/DELETE /api/tasks/:id` - operates only on that user's task

For `GET /api/auth/me` and the admin endpoint, pass the access token as
`Authorization: Bearer <accessToken>`. The access token lasts 15 minutes. The
refresh token lasts seven days, is stored hashed in the database, and is rotated
on every refresh. This learning implementation stores one active refresh token
per user, so logging in on a second device replaces the first session. Never
commit `JWT_SECRET`; it is mandatory in production.

## Task cache

Only an individual task lookup is cached, using a key scoped to its owner. Lists
are intentionally read from the database because paginated/filterable list cache
invalidation is more complex. Updating or deleting a task invalidates its cached
lookup, so the next `GET /api/tasks/:id` reads the current database state.

Public registration always assigns `USER`; never accept an administrator role from an unauthenticated request.

## Redis

The default cache is in memory. To use Redis from PowerShell:

```powershell
docker run --name learning-redis -p 6379:6379 redis:7-alpine
$env:REDIS_URL="redis://localhost:6379"
npm run start:dev
```

Cached user entries expire after ten minutes.

## PostgreSQL and migrations

Copy `.env.example` to `.env` and configure `DATABASE_URL` and `JWT_SECRET`.
Development and production use PostgreSQL with `synchronize: false`; SQLite is
used only by e2e tests through an in-memory database.

```bash
npm run migration:run
npm run start:dev
```

To generate a migration after changing an entity, run PostgreSQL locally with
the target schema applied, then use:

```bash
npm run migration:generate -- src/infrastructure/persistence/migrations/add-priority
```

## Verification

```bash
npm run build
npm test
npm run test:e2e
```

Migrations are the source of truth for the PostgreSQL schema.

## Continuous integration

GitHub Actions runs on every push and pull request using Node.js 20. It installs
the locked dependencies with `npm ci`, then runs lint without auto-fixing,
unit tests, e2e tests and the production build. The e2e tests use in-memory
SQLite, so this CI workflow does not need Docker services.
