# RemodelVision - Claude Code Configuration

## Project Overview
Property remodeling visualization platform with AI-powered 3D rendering, image generation, and context-aware design assistance.

**Owner**: Jack Felke (Property Investor persona - multi-project focus)
**Goal**: Ship fast AF - personal tool + product

## Tech Stack (Ship Fast)
```
Frontend:     React 19 + TypeScript + Vite
3D:           Three.js + @react-three/fiber + @react-three/drei
State:        Zustand (client) + Supabase (server)
AI:           Google Gemini (full family) + Nano Banana Pro
Backend:      Supabase (Auth, DB, Storage, Edge Functions)
Hosting:      Vercel (Frontend + API Routes)
Data:         Firecrawl API (property scraping)
```

## Directory Structure
```
/
├── src/
│   ├── components/       # React components
│   │   ├── 3d/          # Three.js scene components
│   │   ├── ui/          # Shadcn/UI components
│   │   └── workspace/   # Main workspace views
│   ├── services/        # API integrations
│   │   ├── gemini/      # Gemini AI service
│   │   ├── supabase/    # Supabase client + hooks
│   │   ├── firecrawl/   # Property data scraping
│   │   └── nanoBanana/  # Image generation
│   ├── store/           # Zustand stores
│   ├── hooks/           # Custom React hooks
│   ├── types/           # TypeScript definitions
│   ├── lib/             # Utilities + helpers
│   └── api/             # Vercel API routes (if needed)
├── supabase/
│   ├── migrations/      # SQL migrations
│   ├── functions/       # Edge Functions
│   └── seed.sql         # Dev seed data
├── public/              # Static assets
└── .taskmaster/         # Project docs + tasks
```

## Critical Commands
```bash
# Development
pnpm dev                 # Start dev server
pnpm build              # Production build
pnpm preview            # Preview prod build

# Supabase
pnpm supabase:start     # Local Supabase
pnpm supabase:gen       # Generate types
pnpm supabase:push      # Push migrations
pnpm supabase:pull      # Pull remote changes

# Deployment
pnpm vercel             # Deploy preview
pnpm vercel --prod      # Deploy production

# Taskmaster
task list               # Show tasks
task next               # Get next task
task set-status <id> done  # Complete task
```

## Coding Standards

### TypeScript
- **Strict mode always** - no `any` types
- Use Zod for runtime validation at boundaries
- Prefer `interface` for objects, `type` for unions/primitives
- Export types from `src/types/` barrel file

### React Patterns
```typescript
// Prefer function components with explicit return types
export function PropertyCard({ property }: PropertyCardProps): React.ReactElement {
  // Use early returns for loading/error states
  if (!property) return <Skeleton />;

  return <Card>...</Card>;
}

// Zustand store pattern
export const usePropertyStore = create<PropertyStore>()((set, get) => ({
  // State
  properties: [],
  activeProperty: null,

  // Actions - prefix with verb
  setActiveProperty: (id) => set({ activeProperty: id }),
  fetchProperties: async () => { ... },
}));
```

### Supabase Patterns
```typescript
// Always use generated types
import type { Database } from '@/types/supabase';
type Property = Database['public']['Tables']['properties']['Row'];

// Use hooks for data fetching
const { data, error, isLoading } = useQuery(['property', id], () =>
  supabase.from('properties').select('*').eq('id', id).single()
);

// RLS policies handle auth - trust them
```

### AI Integration
```typescript
// Context injection pattern - ALWAYS include property context
const prompt = buildPrompt({
  base: userQuery,
  context: {
    property: activeProperty,
    room: activeRoom,
    measurements: getMeasurements(activeRoom),
    style: userPreferences.style,
    budget: userPreferences.budgetTier,
  },
});

// Model selection by task
const models = {
  chat: 'gemini-2.0-flash',           // Fast responses
  reasoning: 'gemini-2.5-pro',         // Complex analysis
  vision: 'gemini-2.0-flash',          // Image understanding
  generation: 'imagen-3',              // Nano Banana Pro
};
```

## Environment Variables
Required in `.env.local` (never commit):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google AI
GOOGLE_API_KEY=
GOOGLE_CLOUD_PROJECT=

# Firecrawl
FIRECRAWL_API_KEY=

# Vercel (auto-injected)
VERCEL_URL=
```

## Database Schema (Supabase)
Core tables - see PRD-008 for full schema:
```sql
properties        -- Property records with address, metadata
rooms             -- Rooms within properties
measurements      -- Room dimensions, features
projects          -- User projects (multi-property)
design_versions   -- Generated designs with history
user_preferences  -- Style, budget, saved materials
```

## Taskmaster Integration
- PRDs in `.taskmaster/docs/PRD-*.md`
- Personas in `.taskmaster/docs/PERSONA-*.md`
- Tasks in `.taskmaster/tasks/tasks.json`
- Use `task` CLI or MCP tools for management

### Task Workflow
1. `task next` - Get highest priority pending task
2. Implement the task
3. `task set-status <id> done` - Mark complete
4. Repeat

## Shipping Philosophy
1. **Working > Perfect** - Ship incrementally
2. **Context is King** - PropertyContext drives everything
3. **AI-First** - Let Gemini do heavy lifting
4. **Type Safety** - Catch errors at compile time
5. **Edge Functions** - Keep backend thin, use Supabase

## Common Patterns

### Property Context Flow
```
User enters address
    → Firecrawl fetches listing data
    → Gemini Vision extracts from images
    → Data merged into PropertyContext
    → Stored in Supabase
    → Drives 3D scene + AI prompts
```

### Image Generation Flow
```
User requests design
    → Build prompt with full context
    → Match camera perspective
    → Generate via Nano Banana Pro
    → Store version in Supabase Storage
    → Display in comparison view
```

## Don't
- Don't over-engineer - ship the simplest thing
- Don't add features not in PRDs
- Don't skip TypeScript types
- Don't hardcode API keys
- Don't ignore Supabase RLS

## Do
- Do use Supabase for everything backend
- Do inject PropertyContext into all AI calls
- Do use Taskmaster to track progress
- Do deploy frequently to Vercel
- Do commit working code often
