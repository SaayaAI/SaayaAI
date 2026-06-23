# Saaya AI — Local Development

## Prerequisites

Copy environment file and fill in credentials:

```bash
cp .env.example .env
```

Required variables for API startup:
- `WHATSAPP_TOKEN`
- `PHONE_NUMBER_ID`
- `OPENAI_API_KEY`
- `DATABASE_URL`
- `REDIS_URL`

## Start Infrastructure

```bash
docker compose -f infra/docker/docker-compose.yml up -d postgres redis
```

## Database Setup

```bash
pnpm db:generate
pnpm db:push
pnpm db:seed
```

## Run Services

Three terminals required:

```bash
pnpm --filter @saaya/api dev      # API on :3000
pnpm --filter @saaya/api worker     # BullMQ worker
pnpm --filter @saaya/admin dev      # Admin on :5173
```

## Verify

```bash
curl http://localhost:3000/health
curl http://localhost:3000/health/ready
```

## WhatsApp Local Testing

```bash
ngrok http 3000
# Set Meta webhook URL to: https://<ngrok-id>.ngrok.io/webhook
```
