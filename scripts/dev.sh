#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "Starting PostgreSQL and Redis..."
docker compose -f infra/docker/docker-compose.yml up -d postgres redis

echo "Waiting for services..."
sleep 3

if [ ! -f .env ]; then
  echo "Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠️  Update .env with your WhatsApp and OpenAI credentials"
fi

echo "Installing dependencies..."
pnpm install

echo "Generating Prisma client..."
pnpm db:generate

echo "Running database migrations..."
pnpm db:push

echo "Seeding database..."
pnpm db:seed

echo ""
echo "✓ Phase 0 setup complete!"
echo ""
echo "Start development:"
echo "  Terminal 1: pnpm --filter @saaya/api dev"
echo "  Terminal 2: pnpm --filter @saaya/api worker"
echo "  Terminal 3: pnpm --filter @saaya/admin dev"
echo ""
echo "URLs:"
echo "  API:    http://localhost:3000"
echo "  Admin:  http://localhost:5173"
echo "  Health: http://localhost:3000/health/ready"
