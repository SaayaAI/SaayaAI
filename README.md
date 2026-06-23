# Saaya AI

WhatsApp-native intelligent assistant platform — Hindi, English, and multi-language support with AI-powered conversations, document analysis, and admin management.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Fastify, TypeScript |
| Database | PostgreSQL, Prisma |
| Cache / Queue | Redis, BullMQ |
| AI | OpenAI API |
| Messaging | WhatsApp Cloud API |
| Admin UI | React, Vite, TypeScript |
| Infrastructure | Docker, Docker Compose |

## Project Structure

```
Saaya_AI/
├── apps/
│   ├── api/                 # Node.js backend (webhook, AI, workers)
│   └── admin/               # React admin dashboard
├── packages/
│   ├── database/            # Prisma schema & client
│   ├── shared/              # Shared types & constants
│   └── whatsapp-types/      # WhatsApp API TypeScript types
├── infra/
│   ├── docker/              # Docker Compose configs
│   └── nginx/               # Reverse proxy configs
├── docs/                    # Architecture & guides
├── scripts/                 # Dev & migration scripts
├── landing/                 # Marketing landing page
└── bot.py                   # Legacy Python bot (Phase 7 migration)
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### 1. Clone and configure

```bash
cp .env.example .env
# Edit .env — add WHATSAPP_TOKEN, PHONE_NUMBER_ID, OPENAI_API_KEY
```

### 2. Run setup script

```bash
chmod +x scripts/dev.sh
./scripts/dev.sh
```

Or manually:

```bash
pnpm install
pnpm docker:up          # Starts PostgreSQL + Redis
pnpm db:generate
pnpm db:push
pnpm db:seed
```

### 3. Start development servers

```bash
# Terminal 1 — API server
pnpm --filter @saaya/api dev

# Terminal 2 — Message worker (required for WhatsApp replies)
pnpm --filter @saaya/api worker

# Terminal 3 — Admin dashboard
pnpm --filter @saaya/admin dev
```

### URLs

| Service | URL |
|---------|-----|
| API | http://localhost:3000 |
| Health | http://localhost:3000/health/ready |
| Webhook | http://localhost:3000/webhook |
| Admin | http://localhost:5173 |

## WhatsApp Webhook Setup

1. Create a [Meta Developer App](https://developers.facebook.com/) with WhatsApp product
2. Set webhook URL: `https://your-domain.com/webhook`
3. Set verify token to match `VERIFY_TOKEN` in `.env`
4. Subscribe to `messages` field

For local development, use [ngrok](https://ngrok.com/):

```bash
ngrok http 3000
```

## Docker (Full Stack)

```bash
docker compose -f infra/docker/docker-compose.yml up -d
```

Services: `postgres`, `redis`, `api`, `worker`, `admin` (port 8080)

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all packages |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed plans and admin user |
| `pnpm docker:up` | Start PostgreSQL + Redis |
| `pnpm docker:down` | Stop Docker services |

## Phase 0 Deliverables

- [x] Monorepo scaffold (pnpm + Turborepo)
- [x] PostgreSQL schema (users, plans, messages, webhooks)
- [x] Redis + BullMQ message queue
- [x] WhatsApp webhook (verify + receive)
- [x] OpenAI text chat integration
- [x] Async message worker
- [x] Health check endpoints
- [x] Admin dashboard shell
- [x] Docker Compose setup
- [x] Environment validation (Zod)

## Phase 1 Deliverables

- [x] Long-term memory system (PostgreSQL + Redis sessions)
- [x] User profile service (name, city, interests, business)
- [x] Multi-language support (hi, en, gu, mr, ur, hinglish)
- [x] Emotion detection + tone adaptation
- [x] Conversation context engine
- [x] Personality prompt system
- [x] Explicit + inferred memory extraction
- [x] Context-aware personalized replies

See [Phase 1 docs](docs/PHASE1_MEMORY.md).

## Documentation

- [Architecture Blueprint](docs/ARCHITECTURE.md)

## License

Private — All rights reserved.
