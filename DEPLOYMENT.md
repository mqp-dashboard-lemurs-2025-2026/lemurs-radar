# LEMURS Radar Deployment Runbook

This document covers how to run the LEMURS Radar site locally and how to update the production VM at `lemurs-radar.wpi.edu`.

## Current Production Shape

Production runs on the WPI VM at:

```bash
/var/www/lemurs-radar
```

The public HTTPS certificate is handled by Apache on the VM. Apache listens on `80` and `443`, redirects HTTP to HTTPS, and proxies HTTPS traffic to the Next.js container on `127.0.0.1:3000`.

Docker Compose runs three services:

- `frontend`: Next.js production server, bound to `127.0.0.1:3000`
- `backend`: FastAPI, available only on the Docker network
- `db`: Postgres, available only on the Docker network

Ports `8000` and `5432` should not be published on the host.

The demo is intended to be read-only. Keep public write routes disabled unless you intentionally want visitors to be able to change demo data.

## Local Development

From the repo root, the dev stack can be started with:

```bash
docker compose up -d --build
docker compose watch
```

The dev Compose file runs the frontend in development mode and includes the Cloudflare tunnel service. It is for local development and demos, not production.

If you need to reset the local development database back to the seed data:

```bash
docker compose down -v
docker compose up -d --build
```

The `start.sh` helper also resets the database volume. Do not use `start.sh` on the production VM unless you explicitly want reset behavior and have checked what it will remove.

## Production Update Flow

Make changes locally, then commit and push them:

```bash
git status
git add <changed-files>
git commit -m "Describe the change"
git push
```

Then SSH to the VM and deploy:

```bash
cd /var/www/lemurs-radar
git pull
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
```

Check the public site and API rewrites:

```bash
curl -I https://lemurs-radar.wpi.edu
curl -sS -o /dev/null -w '%{http_code}\n' https://lemurs-radar.wpi.edu/clinicians
curl -sS -o /dev/null -w '%{http_code}\n' 'https://lemurs-radar.wpi.edu/umass_id?limit=1'
```

Expected results are `200` responses for the HTTPS site and API routes.

## Production Files On The VM

The VM has a production-only env file:

```bash
/var/www/lemurs-radar/.env.prod
```

This file contains the Postgres username, password, and database name. Do not commit it or paste its contents into chat or logs.

Production Compose commands should include the env file:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
docker compose -f docker-compose.prod.yml --env-file .env.prod logs backend --tail=100
docker compose -f docker-compose.prod.yml --env-file .env.prod logs frontend --tail=100
```

If you omit `--env-file .env.prod`, Compose may warn that `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` are unset.

## Frontend Changes

Frontend code lives in:

```bash
frontend/
```

For production, the Docker build runs:

```bash
npm ci
npm run build
npm run start
```

`npm run build` performs stricter TypeScript checks than the development server. If a VM deploy fails during the frontend build, fix the TypeScript error locally, commit it, push it, then rerun the production update flow.

Useful frontend checks on the VM:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod logs frontend --tail=100
curl -I http://127.0.0.1:3000
```

## Backend Changes

Backend code lives in:

```bash
backend/
```

The backend is a FastAPI service. In production it is not published to the host; the frontend reaches it through Next.js rewrites in:

```bash
frontend/next.config.ts
```

Useful backend checks on the VM:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod logs backend --tail=100
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/clinicians
```

Keep public write endpoints disabled for the read-only demo unless you intentionally change that policy.

## Database Changes

The seed/schema file is:

```bash
backend/sql/init.sql
```

Postgres uses a named Docker volume in production. `init.sql` only runs when the database volume is first created. If you change `init.sql`, it will not automatically apply to an existing production database.

For a read-only demo reset, you can intentionally recreate the production database volume:

```bash
cd /var/www/lemurs-radar
docker compose -f docker-compose.prod.yml --env-file .env.prod down -v
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

This deletes the existing production database data and reseeds from `backend/sql/init.sql`.

For a non-reset database change, write and apply a targeted SQL migration instead of relying on `init.sql`. Example pattern:

```bash
cd /var/www/lemurs-radar
docker compose -f docker-compose.prod.yml --env-file .env.prod exec db psql -U lemurs -d lemurs
```

Then run the SQL changes carefully inside `psql`.

## Apache Proxy

Apache site config is enabled from:

```bash
/etc/apache2/sites-enabled/lemurs-radar.wpi.edu.conf
```

The actual file is:

```bash
/etc/apache2/sites-available/lemurs-radar.wpi.edu.conf
```

The HTTPS virtual host should proxy to the local Next.js port:

```apache
ProxyRequests Off
ProxyPreserveHost On

RequestHeader set X-Forwarded-Proto "https"

ProxyPass / http://127.0.0.1:3000/
ProxyPassReverse / http://127.0.0.1:3000/
```

After Apache config changes:

```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## Health Checks

Use these after a deploy:

```bash
cd /var/www/lemurs-radar
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
curl -I https://lemurs-radar.wpi.edu
curl -sS -o /dev/null -w '%{http_code}\n' https://lemurs-radar.wpi.edu/clinicians
curl -sS -o /dev/null -w '%{http_code}\n' 'https://lemurs-radar.wpi.edu/umass_id?limit=1'
sudo ss -tulpn | egrep ':80|:443|:3000|:8000|:5432'
```

Expected port shape:

- Apache listens publicly on `80` and `443`
- Docker binds frontend to `127.0.0.1:3000`
- Nothing is publicly listening on `8000` or `5432`

## Troubleshooting

View logs:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod logs backend --tail=100
docker compose -f docker-compose.prod.yml --env-file .env.prod logs frontend --tail=100
docker compose -f docker-compose.prod.yml --env-file .env.prod logs db --tail=100
```

Restart the production stack:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod restart
```

Rebuild after code changes:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

If the VM is low on memory, confirm swap exists:

```bash
free -h
```

The VM should have a swap file. Building the Next.js production app may fail on the small VM without swap.
