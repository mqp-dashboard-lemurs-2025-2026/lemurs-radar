# LEMURS RADAR

LEMURS RADAR is a Next.js and FastAPI dashboard for viewing synthetic student risk, alert, appointment, and health metric data. The app is intended as a demo/prototype and is backed by a seeded PostgreSQL database.

For production and VM-specific steps, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Project Layout

```text
backend/
  app/
    main.py                 FastAPI app setup and router registration
    db.py                   asyncpg database pool setup
    deps.py                 shared FastAPI database dependency
    routers/                API routes for students, alerts, clinicians, metrics, and scores
    schemas/                Pydantic request models
    utils/                  backend display formatting helpers
  datagen/gen.py            synthetic data generator for SQL seed files
  sql/init.sql              schema and seed data used by Docker/Postgres
  requirements.txt          Python dependencies

frontend/
  app/                      Next.js app routes
  app/page.tsx              main dashboard
  app/student_id/[app_user_id]/page.tsx
                            individual student profile page
  app/alerts/page.tsx       alerts page
  app/landing/page.tsx      public project landing page
  components/               shared dashboard UI components and graphs
  public/                   icons, profile pictures, team photos, and deliverables
  utils/                    shared frontend types and formatting helpers
  next.config.ts            rewrites from frontend paths to backend API routes

docker-compose.yml          local development stack
start.sh                    helper that resets the DB, starts Docker, and prints a tunnel URL
DEPLOYMENT.md               production deployment runbook
```

## Running With Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Development Startup Instructions

From the repo root:

```bash
docker compose down -v
docker compose up -d --build
docker compose watch
```

The local services are:

- `frontend`: Next.js dev server on `http://localhost:3000`
- `backend`: FastAPI server on `http://localhost:8000`
- `db`: PostgreSQL seeded from `backend/sql/init.sql`
- `tunnel`: Cloudflare tunnel for sharing the local frontend

### Cloudflare Deployment Instructions

On systems that can run shell scripts:

```bash
./start.sh
```

`start.sh` runs `docker compose down -v`, rebuilds the stack, and prints the Cloudflare Tunnel URL when it is ready. Because it removes volumes, it resets the database every time.

## Database And Seed Data

The Docker Postgres service loads:

```text
backend/sql/init.sql
```

This file defines the schema and inserts synthetic demo data. It only runs when the Postgres Docker volume is first created. Use `docker compose down -v` when you need Docker to recreate the database from the seed file.

## Data Generation

The generator lives at:

```text
backend/datagen/gen.py
```

Example:

```bash
cd backend/datagen
python gen.py --out ../sql/init.sql --seed 158350 --users 100
```

Current options:

```text
--out
--seed
--users
--max-alerts-per-user
--danger-alert-rate
--health-days
--health-days-back
--alerts-window-days
--clinicians
--include-schema
--truncate
```

If you regenerate `backend/sql/init.sql`, reset the database volume before expecting Docker to use the new seed data.
