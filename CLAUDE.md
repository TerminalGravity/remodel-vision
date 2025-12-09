# RemodelVision - Claude Code Configuration

## Project Overview
Property remodeling visualization platform with AI-powered 3D rendering, image generation, and context-aware design assistance.

**Owner**: Jack Felke (Property Investor persona - multi-project focus)
**Goal**: Ship fast AF - personal tool + product + **platform**

## Tech Stack (Ship Fast)
```
Frontend:     React 19 + TypeScript + Vite
3D:           Three.js + @react-three/fiber + @react-three/drei
State:        Zustand (client) + Supabase (server)
AI:           Google Gemini (full family) + Nano Banana Pro (Imagen 3)
Backend:      Supabase (Auth, DB, Storage, Edge Functions)
Hosting:      Vercel (Frontend + API Routes)
Data:         Firecrawl API (property scraping)
Platform:     MCP Server + SDK for third-party integrations
```

## Monorepo Structure
```
/
├── apps/
│   └── web/                 # Main React app (@remodelvision/web)
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── services/    # API integrations
│       │   ├── store/       # Zustand stores
│       │   ├── hooks/       # Custom hooks
│       │   └── types/       # TypeScript definitions
│       ├── index.html
│       └── vite.config.ts
│
├── packages/
│   ├── sdk/                 # JavaScript/TypeScript SDK (@remodelvision/sdk)
│   │   └── src/
│   │       ├── client.ts    # API client
│   │       ├── types.ts     # Shared types
│   │       └── index.ts     # Exports
│   │
│   └── mcp-server/          # MCP Server (@remodelvision/mcp-server)
│       └── src/
│           └── index.ts     # MCP tool definitions
│
├── supabase/
│   ├── migrations/          # SQL migrations
│   ├── functions/           # Edge Functions
│   └── seed.sql             # Dev seed data
│
├── .taskmaster/
│   ├── docs/                # PRDs and Personas
│   └── tasks/               # Task definitions
│
└── .claude/
    ├── commands/            # Custom slash commands
    └── settings.local.json  # Claude Code permissions
```

## Critical Commands
```bash
# Development (from root)
pnpm dev                     # Start web app dev server
pnpm build                   # Build all packages
pnpm build:web              # Build web app only
pnpm build:sdk              # Build SDK only
pnpm build:mcp              # Build MCP server only

# From apps/web/
cd apps/web && pnpm dev      # Direct dev server

# Supabase (from apps/web)
pnpm supabase:start          # Local Supabase
pnpm supabase:gen            # Generate types
pnpm supabase:push           # Push migrations

# Deployment
pnpm vercel:deploy           # Deploy preview
pnpm vercel:prod             # Deploy production

# Taskmaster
task list                    # Show tasks
task next                    # Get next task
task set-status <id> done    # Complete task
```

## Platform API (PRD-010)

### MCP Tools (for AI Agents)
```
remodelvision_analyze_property   # Extract property context from address/listing
remodelvision_generate_design    # Create AI design visualizations
remodelvision_estimate_cost      # Get renovation cost breakdowns
remodelvision_compare_options    # Compare design alternatives
remodelvision_get_contractor_specs  # Generate professional specs
```

### SDK Usage
```typescript
import { RemodelVision } from '@remodelvision/sdk';

const rv = new RemodelVision({ apiKey: '...' });

// Analyze property
const property = await rv.properties.analyze({
  address: '123 Main St, Austin TX'
});

// Generate design
const design = await rv.designs.generate({
  propertyId: property.id,
  space: 'kitchen',
  style: 'modern-farmhouse',
  budgetTier: 'premium'
});
```

## Coding Standards

### TypeScript
- **Strict mode always** - no `any` types
- Use Zod for runtime validation at boundaries
- Prefer `interface` for objects, `type` for unions/primitives
- Shared types go in `packages/sdk/src/types.ts`
- App-specific types in `apps/web/src/types/`

### React Patterns
```typescript
// Prefer function components with explicit return types
export function PropertyCard({ property }: PropertyCardProps): React.ReactElement {
  if (!property) return <Skeleton />;
  return <Card>...</Card>;
}

// Zustand store pattern
export const usePropertyStore = create<PropertyStore>()((set, get) => ({
  properties: [],
  activeProperty: null,
  setActiveProperty: (id) => set({ activeProperty: id }),
  fetchProperties: async () => { ... },
}));
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

# RemodelVision API (for SDK/MCP testing)
REMODELVISION_API_KEY=
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
api_keys          -- Developer API keys
usage_logs        -- API usage tracking
```

## Taskmaster Integration
- PRDs in `.taskmaster/docs/PRD-*.md`
- Personas in `.taskmaster/docs/PERSONA-*.md`
- Tasks in `.taskmaster/tasks/tasks.json`

### Key PRDs
| PRD | Focus |
|-----|-------|
| PRD-000 | Master Vision & Architecture |
| PRD-001 | Property Context Intelligence |
| PRD-002 | 3D Dollhouse & Spatial Computing |
| PRD-003 | Gemini AI Integration |
| PRD-004 | Image Generation (Nano Banana Pro) |
| PRD-005 | Source Document Processing |
| PRD-008 | Data Structures & Schema |
| PRD-010 | **API & MCP Platform Strategy** |

## Shipping Philosophy
1. **Working > Perfect** - Ship incrementally
2. **Context is King** - PropertyContext drives everything
3. **AI-First** - Let Gemini do heavy lifting
4. **Type Safety** - Catch errors at compile time
5. **Platform Thinking** - Build for extensibility

## Common Patterns

### Property Context Flow
```
User enters address
    → Firecrawl fetches listing data
    → Gemini Vision extracts from images
    → Data merged into PropertyContext
    → Stored in Supabase
    → Drives 3D scene + AI prompts
    → Available via API/MCP for third parties
```

### Image Generation Flow
```
User requests design
    → Build prompt with full context
    → Match camera perspective
    → Generate via Nano Banana Pro
    → Store version in Supabase Storage
    → Display in comparison view
    → Expose via API for integrations
```

## Don't
- Don't over-engineer - ship the simplest thing
- Don't add features not in PRDs
- Don't skip TypeScript types
- Don't hardcode API keys
- Don't ignore Supabase RLS
- Don't break the SDK/MCP contract

## Do
- Do use Supabase for everything backend
- Do inject PropertyContext into all AI calls
- Do use Taskmaster to track progress
- Do deploy frequently to Vercel
- Do commit working code often
- Do keep SDK types in sync with API responses
