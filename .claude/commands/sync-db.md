---
description: Sync Supabase types and migrations
---

# Supabase Sync

1. **Generate types**: Run `pnpm supabase:gen` to update TypeScript types from database schema
2. **Push migrations**: If there are new migrations, run `pnpm supabase:push`
3. **Verify**: Check that `src/types/supabase.ts` is updated

Always regenerate types after schema changes to maintain type safety.
