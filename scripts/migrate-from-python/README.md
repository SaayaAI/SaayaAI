# Python Bot → Node.js Migration

The legacy Flask bot (`bot.py`) can be migrated in Phase 7.

## memory.json import (planned)

```bash
pnpm tsx scripts/migrate-from-python/import-memory.ts
```

This script will:
1. Read `memory.json` from the repo root
2. Create `users` records by phone number
3. Import name and other facts into `user_memories`

## Webhook cutover

1. Deploy Node.js API to production
2. Update Meta webhook URL to new `/webhook` endpoint
3. Keep `VERIFY_TOKEN` consistent during transition
4. Monitor `webhook_events` table for errors
5. Decommission `bot.py` after 48h stable operation
