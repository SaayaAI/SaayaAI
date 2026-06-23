# Phase 1 — Memory & Personality System

## Overview

Phase 1 adds long-term memory, multi-language support, emotion-aware responses, and personalized conversations.

## Architecture

```
User Message
    │
    ├─► Message Analyzer (language + emotion)
    ├─► Memory Extractor (explicit facts)
    ├─► Fixed Replies (creator, name recall)
    │
    ├─► Context Engine
    │     ├─ User Profile Service
    │     ├─ Redis Session (last 20 turns)
    │     ├─ PostgreSQL Memories
    │     └─ Prompt Builder
    │
    ├─► OpenAI Chat (personalized)
    │
    └─► Memory Inference (background, inferred facts)
```

## Database

### Extended `users` table
- `city` — user city
- `last_emotion` — most recent detected emotion
- `last_active_at` — last message timestamp

### Extended `user_memories` table
- `category` — PROFILE | INTEREST | BUSINESS | FACT | PREFERENCE
- `source` — EXPLICIT | INFERRED | ADMIN
- `updated_at` — last update time

### Migration
```bash
pnpm db:push
# or
pnpm db:migrate
```

## Memory Keys

| Key | Category | Example |
|-----|----------|---------|
| `name` | profile | "Rahul" |
| `city` | profile | "Mumbai" |
| `interests` | interest | "cricket, music" |
| `business_name` | business | "Malviya Traders" |
| `business_type` | business | "retail" |
| `business_details` | business | "sells electronics" |
| `gstin` | business | "27AAAAA0000A1Z5" |

## Supported Languages

Hindi, English, Gujarati, Marathi, Urdu, Hinglish

Detection: script heuristics + OpenAI analysis fallback.

## Emotions

joy, sadness, anger, anxiety, excitement, gratitude, frustration, neutral

Each emotion adapts Saaya's tone in the system prompt.

## Example Interactions

**Set name:**
> User: mera naam Rahul hai
> Saaya: Thik hai! Main yaad rakhungi ki aapka naam Rahul hai. 😊

**Recall name:**
> User: mera naam kya hai
> Saaya: Aapka naam Rahul hai. Main yaad rakhti hoon! 😊

**Creator question:**
> User: who created you?
> Saaya: Saaya AI was created by DGX. Founder: Dhiraj Kumar Malviya. Support and development assistance: Sonu Malviya.

## Modules

| Module | Path |
|--------|------|
| Memory Service | `apps/api/src/modules/memory/memory.service.ts` |
| Session Store | `apps/api/src/modules/memory/session.store.ts` |
| Memory Extractor | `apps/api/src/modules/memory/memory.extractor.ts` |
| Memory Inference | `apps/api/src/modules/memory/memory.inference.ts` |
| Context Engine | `apps/api/src/modules/memory/context.engine.ts` |
| User Profile | `apps/api/src/modules/users/user-profile.service.ts` |
| Message Analyzer | `apps/api/src/modules/router/message.analyzer.ts` |
| Prompt Builder | `apps/api/src/modules/ai/prompt.builder.ts` |
| Personality | `apps/api/src/prompts/personality.txt` |

## Environment

```env
OPENAI_ANALYSIS_MODEL=gpt-4o-mini  # language + emotion + inference
OPENAI_MODEL=gpt-4o-mini           # main chat
```
