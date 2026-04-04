# Acquisitions API Docker Setup

This application uses Neon in two different modes:

- Development uses Neon Local in Docker, which exposes a local Postgres-compatible endpoint and creates an ephemeral Neon branch when the container starts.
- Production uses the real Neon cloud database directly through `DATABASE_URL`. There is no Neon Local proxy in production.

## Files

- `Dockerfile`: container image for the Express app.
- `docker-compose.dev.yml`: local development stack with the app and Neon Local.
- `docker-compose.prod.yml`: production app container that connects to Neon cloud.
- `.env.development`: local Docker development settings.
- `.env.production`: production environment settings.

## Development with Neon Local

Neon Local is a proxy container, not a standalone Postgres database. The app still talks to Neon, but through a stable local endpoint inside Docker:

- Postgres URL: `postgres://neon:npg@neon-local:5432/neondb`
- Neon serverless driver HTTP endpoint: `http://neon-local:5432/sql`

### 1. Configure development secrets

Edit `.env.development` and set:

- `NEON_API_KEY`
- `NEON_PROJECT_ID`

`DATABASE_URL` and `NEON_LOCAL_FETCH_ENDPOINT` are already set for the Docker network and should usually stay as-is.

### 2. Start the local stack

```bash
docker compose --env-file .env.development -f docker-compose.dev.yml up --build
```

What this does:

- Starts `neon-local` from `neondatabase/neon_local:latest`
- Exposes the proxy on port `5432`
- Starts the app on port `3000`
- Runs `npm run db:migrate` against the fresh ephemeral branch before the app starts

### 3. Stop the stack

```bash
docker compose --env-file .env.development -f docker-compose.dev.yml down
```

By default, Neon Local deletes the ephemeral branch when the container stops.

## Production with Neon Cloud

Production connects directly to Neon Cloud. There is no database container in `docker-compose.prod.yml` because Neon is a managed external service, not something you run inside Docker Compose.

### 1. Configure production secrets

Edit `.env.production` and set:

- `DATABASE_URL=postgresql://...neon.tech/...`
- `JWT_SECRET`
- Any other runtime secrets your application needs

### 2. Start the production container

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up --build -d
```

This starts only the app container. On boot it runs migrations against the production Neon database and then starts the Express server.

## How environment switching works

Development:

- `DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb`
- `NEON_LOCAL_FETCH_ENDPOINT=http://neon-local:5432/sql`
- `NEON_API_KEY` and `NEON_PROJECT_ID` are provided to the Neon Local container

Production:

- `DATABASE_URL=postgresql://...neon.tech/...`
- `NEON_LOCAL_FETCH_ENDPOINT` is not set
- The app talks directly to Neon Cloud

The application code checks `NEON_LOCAL_FETCH_ENDPOINT` in `src/config/database.js`. When it is present, the Neon serverless driver is configured to send HTTP queries to the Neon Local proxy. When it is absent, the same app uses the production Neon database URL directly.

## Notes

- The local setup is meant for containerized development. Inside Docker Compose, the hostname is `neon-local`.
- If you want to run the app outside Docker against Neon Local, switch the host from `neon-local` to `localhost`.
- Keep real secrets out of source control. The `.env`, `.env.development`, and `.env.production` files are ignored by Git.
