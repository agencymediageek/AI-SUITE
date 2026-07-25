---
name: Supabase → PostgreSQL migration complete
description: All supabaseAdmin calls removed from production code; zero remaining references
---

## Status: 100% complete

All production code paths use PostgreSQL via `query()` from `@/lib/pg` or `db.*` from `@/lib/db`.

## Files migrated
- `src/lib/db.ts` — 36 functions rewritten as raw SQL
- `src/lib/rag.ts` — vector search uses pgvector natively
- `app/api/banners/route.ts` — raw SQL SELECT with date range
- `app/api/admin/banners/route.ts` — full CRUD in PostgreSQL
- `app/api/documents/upload/route.ts` — file storage uses local /tmp (no Supabase Storage)
- `app/api/admin/migrate-i18n/route.ts` — checks PostgreSQL tables directly

## Key patterns
- `import { query } from "@/lib/pg"` for raw SQL
- `import { db } from "@/lib/db"` for higher-level helpers
- Documents upload: `Buffer.from(await file.arrayBuffer())` → write to `os.tmpdir()` → process → delete
- The `supabase.ts` and `supabase-client.ts` files still exist for signaling/realtime features (non-production path); do not remove them

**Why:** Self-hosted PostgreSQL = zero vendor cost per niche clone; team familiar with it; no vendor lock-in.
