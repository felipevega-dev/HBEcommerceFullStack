#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  echo "Missing .env. Copy .env.production.example and fill production values."
  exit 1
fi

required_vars=(
  POSTGRES_PASSWORD
  NEXTAUTH_SECRET
  NEXTAUTH_URL
  NEXT_PUBLIC_FRONTEND_URL
  MERCADOPAGO_ACCESS_TOKEN
  NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
  RESEND_API_KEY
  RESEND_FROM_EMAIL
  BLOB_READ_WRITE_TOKEN
)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    echo "Missing required env var: $var"
    exit 1
  fi
done

echo "Building production images..."
docker compose -f docker-compose.prod.yml build

echo "Starting production stack..."
docker compose -f docker-compose.prod.yml up -d

echo "Waiting for health check..."
for _ in {1..30}; do
  if curl -fsS "http://127.0.0.1:${APP_PORT:-3000}/api/health" >/dev/null; then
    echo "App is healthy."
    exit 0
  fi
  sleep 2
done

echo "App did not become healthy in time. Check logs:"
echo "  docker compose -f docker-compose.prod.yml logs -f app"
exit 1
