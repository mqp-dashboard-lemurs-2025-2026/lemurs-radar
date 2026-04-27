#!/bin/bash

# Exit if a command fails, if an unset variable is used,
# or if a command in a pipeline fails.
set -euo pipefail

# Stop existing containers and remove volumes so the database resets.
docker compose down -v

# Build and start the containers in the background.
docker compose up -d --build

# Wait for the tunnel service to print a public Cloudflare URL.
url=""
max_retries=30

for ((i=1; i<=max_retries; i++)); do
  sleep 1

  # Look through the tunnel logs for a trycloudflare URL.
  url=$(docker compose logs tunnel 2>&1 | grep -Eo 'https://[^[:space:]]+\.trycloudflare\.com' | head -n 1 || true)

  # Stop checking once a URL is found.
  if [ -n "$url" ]; then
    break
  fi

  echo "Waiting for tunnel URL... ($i/$max_retries)"
done

# Print the URL if found, otherwise show an error message.
if [ -n "$url" ]; then
  echo "Application is online."
  echo "Public URL: $url"
else
  echo "Timed out waiting for Cloudflare Tunnel URL."
  echo "Check logs with: docker compose logs tunnel"
  exit 1
fi