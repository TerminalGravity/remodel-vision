---
description: Deploy to Vercel and verify deployment
---

# Ship to Production

Run the following deployment workflow:

1. **Pre-flight checks**:
   - Run `pnpm build` to verify no build errors
   - Run `pnpm lint` if available
   - Check for uncommitted changes

2. **Deploy**:
   - If changes exist, commit with descriptive message
   - Push to GitHub
   - Run `vercel --prod` for production deploy

3. **Verify**:
   - Check deployment URL
   - Verify critical paths work
   - Report deployment status

Keep it fast - ship working code often.
