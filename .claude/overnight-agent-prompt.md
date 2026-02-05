# RemodelVision Overnight Development Agent Prompt

## Mission
You are an autonomous development agent working overnight on RemodelVision, a property remodeling visualization platform. Your goal is to implement as many features as possible while maintaining code quality and ensuring the application remains functional.

---

## Project Context

### What RemodelVision Does
- Property remodeling visualization with AI-powered 3D rendering
- Fetches property data via Firecrawl (Zillow, Redfin, county records)
- Generates photorealistic design renders using Gemini 3 Pro Image (`gemini-3-pro-image-preview`)
- Maintains rich PropertyContext for context-aware AI generation
- Three.js 3D "dollhouse" view for spatial visualization

### Tech Stack
```
Frontend:     React 19 + TypeScript + Vite
3D:           Three.js + @react-three/fiber + @react-three/drei
State:        Zustand (client) + Supabase (server - not yet integrated)
AI:           Google Gemini (gemini-2.5-flash for chat, gemini-3-pro-image-preview for images ONLY)
Data:         Firecrawl API (property scraping)
Monorepo:     pnpm workspaces
```

### Key Files You'll Work With
```
apps/web/src/
├── components/
│   ├── canvas/DollhouseScene.tsx    # 3D scene rendering
│   ├── ui/Sidebar.tsx               # Main chat/generation UI
│   └── workspace/PropertyIntelligence.tsx
├── services/
│   ├── designGeneration.ts          # AI image generation (RECENTLY IMPROVED)
│   ├── designIntentParser.ts        # NLP → DesignSpec (NEW)
│   ├── generationContextBuilder.ts  # Builds context for AI
│   ├── geminiService.ts             # Chat/vision AI
│   └── property/                    # Firecrawl integration
├── store/useStore.ts                # Zustand global state
└── types/
    ├── generation.ts                # Generation context types
    └── property.ts                  # Property data types
```

---

## Current State (What's Done)

### Recently Completed
1. ✅ GenerationContext pipeline - bridges PropertyContext → AI generation
2. ✅ Design intent parser - NLP user input → structured DesignSpecification
3. ✅ Retry logic with exponential backoff in designGeneration.ts
4. ✅ Reference image uploads - users can upload inspiration images
5. ✅ Typed SDK responses - proper TypeScript interfaces
6. ✅ Parallel batch generation with concurrency control
7. ✅ Token/cost tracking in generation metadata

### What's Working
- 3D dollhouse scene renders rooms from PropertyContext
- Property data fetching via Firecrawl (Zillow, Redfin)
- Chat interface with Gemini 2.5 Flash
- Image generation triggers (but generation flow needs end-to-end testing)
- Room selection and camera capture for generation

---

## Priority Tasks (Work on These)

### HIGH PRIORITY - Core Features

#### 1. Supabase Integration (PRD-008)
**Files to create/modify:**
- `apps/web/src/services/supabase.ts` (new)
- `supabase/migrations/` (new)
- `apps/web/src/store/useStore.ts`

**Requirements:**
- Set up Supabase client with env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- Create tables: `properties`, `projects`, `design_versions`, `user_preferences`
- Migrate Zustand persistence from localStorage to Supabase
- Add auth flow (magic link or OAuth)

**Schema hint:**
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  address JSONB NOT NULL,
  details JSONB,
  valuation JSONB,
  rooms JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE design_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  room_name TEXT,
  design_spec JSONB,
  generated_image TEXT, -- base64 or storage URL
  prompt TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. Gallery View Component (UI)
**Files to create:**
- `apps/web/src/components/workspace/Gallery.tsx` (new)

**Requirements:**
- Grid layout showing all `generatedResults` from store
- Before/after comparison view (original snapshot vs generated)
- Click to view full-size
- Delete/favorite actions
- Filter by room, date, style
- Wire up to `workspaceView === 'GALLERY'` tab

#### 3. Cost Dashboard Widget
**Files to modify:**
- `apps/web/src/components/ui/Sidebar.tsx` or new component

**Requirements:**
- Display accumulated `estimatedCost` from all generations
- Show token usage breakdown
- Session vs all-time tracking
- Store in Zustand and persist

#### 4. Room-Specific Generation
**Files to modify:**
- `apps/web/src/components/canvas/DollhouseScene.tsx`
- `apps/web/src/store/useStore.ts`

**Requirements:**
- When user clicks a room in 3D view, zoom camera to that room
- Auto-select room context for generation
- Pass room-specific data to generation context
- Show room name in generation prompt

### MEDIUM PRIORITY - Enhanced Features

#### 5. Design History Timeline
**Files to create:**
- `apps/web/src/components/workspace/DesignTimeline.tsx`

**Requirements:**
- Visual timeline of all design generations for a property
- Ability to restore/compare old versions
- Branching support (fork from a previous design)

#### 6. Product Reference Integration
**Files to modify:**
- `apps/web/src/services/designIntentParser.ts`
- `apps/web/src/types/generation.ts`

**Requirements:**
- Parse product references from user input ("use Kohler faucet K-22032")
- Lookup product images/specs from API or cache
- Include product references in generation prompt

#### 7. Export Features
**Files to create:**
- `apps/web/src/services/exportService.ts`

**Requirements:**
- Export design as high-res image
- Generate PDF report with property context + design
- Share link generation

### LOW PRIORITY - Polish

#### 8. Loading States & Error Handling
- Add skeleton loaders for property fetch
- Toast notifications for errors
- Retry UI for failed generations

#### 9. Mobile Responsive
- Test and fix sidebar on mobile
- Touch-friendly 3D controls

---

## Constraints & Rules

### MUST Follow
1. **gemini-3-pro-image-preview ONLY** for image generation - no other models, no fallbacks
2. **TypeScript strict mode** - no `any` types, all interfaces defined
3. **Zustand patterns** - follow existing store structure
4. **Error handling** - always wrap API calls in try/catch
5. **Environment variables** - never hardcode API keys

### Code Style
```typescript
// Prefer function components with explicit return types
export function ComponentName({ prop }: Props): React.ReactElement {
  // ...
}

// Zustand store pattern
export const useStore = create<StoreType>()((set, get) => ({
  state: initialValue,
  action: (param) => set({ state: newValue }),
}));

// Service pattern with retry
async function apiCall() {
  return withRetry(async () => {
    const response = await api.call();
    return response;
  });
}
```

### Don't Do
- Don't add features not listed above
- Don't refactor working code unnecessarily
- Don't create new packages without clear need
- Don't skip TypeScript types
- Don't commit broken builds

---

## Development Workflow

### Before Starting Any Task
1. Read the relevant existing files
2. Check types in `types/*.ts`
3. Understand the Zustand store structure
4. Plan the implementation

### After Completing Each Task
1. Run `pnpm exec tsc --noEmit` - must pass
2. Run `pnpm dev` and test manually if possible
3. Commit with descriptive message
4. Move to next task

### Commit Message Format
```
feat: Add Gallery view with before/after comparison

- Grid layout for generated results
- Before/after toggle view
- Delete and favorite actions
- Filter by room and date

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## Testing Commands
```bash
# Type check
cd apps/web && pnpm exec tsc --noEmit

# Dev server
pnpm dev

# Build (catches more errors)
pnpm build

# Lint
pnpm lint
```

---

## Environment Variables Needed
```bash
# Already configured
VITE_GOOGLE_API_KEY=xxx
VITE_FIRECRAWL_API_KEY=xxx

# Need to add for Supabase
VITE_SUPABASE_URL=xxx
VITE_SUPABASE_ANON_KEY=xxx
```

---

## Success Criteria

By morning, the codebase should have:
1. [ ] At least 3 HIGH priority tasks completed
2. [ ] All code type-checks without errors
3. [ ] App builds successfully
4. [ ] Clean git history with logical commits
5. [ ] No regressions in existing functionality

---

## Emergency Contacts

If you get stuck:
- Check existing patterns in similar files
- Look at PRDs in `.taskmaster/docs/`
- Fall back to simpler implementation
- Leave TODO comments for complex decisions

---

## Start Here

1. Run `pnpm dev` to verify current state works
2. Start with **Task 2: Gallery View** (self-contained, high impact)
3. Then **Task 3: Cost Dashboard** (builds on recent work)
4. Then **Task 1: Supabase** (larger, save for later)

Good luck! Ship fast, ship working.
