# PRD-010: API & MCP Platform Strategy

## Overview

RemodelVision as a **platform** - exposing property intelligence, spatial reasoning, and AI-powered visualization as APIs and MCP tools for third-party developers, AI agents, and enterprise integrations.

**Vision**: Become the "Stripe for property visualization" - the default infrastructure layer that proptech companies and AI agents use for understanding and transforming spaces.

---

## The Moat: What's Hard to Replicate

| Asset | Why It's Defensible |
|-------|---------------------|
| **Spatial Reasoning Dataset** | Every property processed builds richer understanding of how spaces relate |
| **Design Decision Graph** | Connections between property features, design choices, and outcomes |
| **Localized ROI Models** | Understanding what renovations work in specific neighborhoods |
| **Context Injection Engine** | The ability to maintain coherent AI outputs across sessions |
| **Contractor Network Effects** | Real cost/timeline data from actual projects |

---

## API Architecture

### Tier 1: Property Context API

The foundation - structured property intelligence.

```typescript
// POST /api/v1/properties
interface CreatePropertyRequest {
  address: string;
  // OR
  source_documents?: SourceDocument[];
  // OR
  listing_url?: string; // Firecrawl scraping
}

// Response: Full PropertyContext
interface PropertyContextResponse {
  property_id: string;
  address: NormalizedAddress;
  spaces: SpaceContext[];
  measurements: MeasurementSet;
  style_analysis: StyleProfile;
  structural_constraints: Constraint[];
  neighborhood_context: NeighborhoodData;
  confidence_scores: Record<string, number>;
}
```

**Endpoints:**
```
POST   /api/v1/properties              # Create from address/documents
GET    /api/v1/properties/:id          # Retrieve full context
PATCH  /api/v1/properties/:id          # Update with new data
POST   /api/v1/properties/:id/scrape   # Trigger Firecrawl refresh
GET    /api/v1/properties/:id/spaces   # List spaces
GET    /api/v1/properties/:id/spaces/:space_id  # Space details
```

### Tier 2: Design Intelligence API

AI-powered design reasoning and generation.

```typescript
// POST /api/v1/designs/generate
interface GenerateDesignRequest {
  property_id: string;
  space_id: string;
  design_goals: DesignGoal[];
  style_preferences: string[];
  budget_tier: 'economy' | 'standard' | 'premium' | 'luxury';
  constraints?: string[];
}

interface GenerateDesignResponse {
  design_id: string;
  visualizations: Visualization[];
  reasoning: DesignReasoning;
  cost_estimate: CostBreakdown;
  roi_projection: ROIAnalysis;
  material_specs: MaterialSpec[];
  comparable_projects: ComparableProject[];
}

interface DesignReasoning {
  // The "why" behind every decision
  layout_rationale: string;
  style_choices: StyleChoice[];
  budget_allocations: BudgetAllocation[];
  tradeoffs_considered: Tradeoff[];
}
```

**Endpoints:**
```
POST   /api/v1/designs/generate        # Generate new design
POST   /api/v1/designs/:id/iterate     # Refine with feedback
GET    /api/v1/designs/:id             # Retrieve design details
POST   /api/v1/designs/:id/visualize   # Generate additional renders
POST   /api/v1/designs/compare         # Compare multiple designs
```

### Tier 3: Visualization API

Direct access to Nano Banana Pro rendering.

```typescript
// POST /api/v1/visualize
interface VisualizeRequest {
  property_id: string;
  space_id: string;
  camera: CameraPosition;
  style: StyleSpec;
  modifications?: SpaceModification[];
  output_format: 'png' | 'webp' | 'jpg';
  resolution: '1024x1024' | '2048x2048' | '4096x4096';
}

interface VisualizeResponse {
  image_url: string;
  image_base64?: string; // Optional inline
  generation_metadata: {
    prompt_used: string;
    model: string;
    seed: number;
    duration_ms: number;
  };
  perspective_match_score: number;
}
```

### Tier 4: Analysis API

Comparative intelligence and ROI projections.

```typescript
// POST /api/v1/analyze/roi
interface ROIAnalysisRequest {
  property_id: string;
  proposed_changes: ProposedChange[];
  market_context?: {
    zip_code: string;
    property_type: string;
  };
}

interface ROIAnalysisResponse {
  estimated_cost: MoneyRange;
  projected_value_add: MoneyRange;
  roi_percentage: NumberRange;
  time_to_recoup: string;
  comparable_renovations: ComparableRenovation[];
  market_trends: MarketTrend[];
  confidence: number;
}
```

---

## MCP (Model Context Protocol) Tools

For AI agents (Claude, GPT, custom agents) to interact with RemodelVision.

### Tool: `remodelvision_analyze_property`

```typescript
{
  name: "remodelvision_analyze_property",
  description: "Analyze a property address or listing URL to extract comprehensive context including room dimensions, style, constraints, and renovation opportunities",
  inputSchema: {
    type: "object",
    properties: {
      address: {
        type: "string",
        description: "Full street address of the property"
      },
      listing_url: {
        type: "string",
        description: "URL to Zillow, Redfin, or MLS listing"
      },
      focus_areas: {
        type: "array",
        items: { type: "string" },
        description: "Specific areas to analyze: 'kitchen', 'bathroom', 'layout', 'curb_appeal'"
      }
    },
    oneOf: [
      { required: ["address"] },
      { required: ["listing_url"] }
    ]
  }
}
```

### Tool: `remodelvision_generate_design`

```typescript
{
  name: "remodelvision_generate_design",
  description: "Generate a photorealistic visualization of a remodeled space with AI-powered design reasoning",
  inputSchema: {
    type: "object",
    properties: {
      property_id: {
        type: "string",
        description: "Property ID from previous analyze_property call"
      },
      space: {
        type: "string",
        description: "Room or area to redesign: 'kitchen', 'master_bath', 'living_room'"
      },
      style: {
        type: "string",
        description: "Design style: 'modern', 'farmhouse', 'industrial', 'transitional', 'coastal'"
      },
      budget_tier: {
        type: "string",
        enum: ["economy", "standard", "premium", "luxury"],
        description: "Budget level affecting materials and scope"
      },
      goals: {
        type: "array",
        items: { type: "string" },
        description: "Design goals: 'more_storage', 'open_concept', 'natural_light', 'aging_in_place'"
      }
    },
    required: ["property_id", "space", "style", "budget_tier"]
  }
}
```

### Tool: `remodelvision_estimate_cost`

```typescript
{
  name: "remodelvision_estimate_cost",
  description: "Get detailed cost breakdown for proposed renovations with local market pricing",
  inputSchema: {
    type: "object",
    properties: {
      property_id: { type: "string" },
      design_id: { type: "string" },
      // OR specify changes directly
      changes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            category: { type: "string" },
            description: { type: "string" },
            scope: { type: "string", enum: ["minor", "moderate", "major", "gut"] }
          }
        }
      },
      include_labor: { type: "boolean", default: true },
      include_permits: { type: "boolean", default: true }
    }
  }
}
```

### Tool: `remodelvision_compare_options`

```typescript
{
  name: "remodelvision_compare_options",
  description: "Compare multiple design or renovation options side-by-side with cost/benefit analysis",
  inputSchema: {
    type: "object",
    properties: {
      property_id: { type: "string" },
      options: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            design_id: { type: "string" },
            description: { type: "string" }
          }
        },
        minItems: 2,
        maxItems: 5
      },
      comparison_criteria: {
        type: "array",
        items: {
          type: "string",
          enum: ["cost", "roi", "timeline", "disruption", "resale_value"]
        }
      }
    },
    required: ["property_id", "options"]
  }
}
```

### Tool: `remodelvision_get_contractor_specs`

```typescript
{
  name: "remodelvision_get_contractor_specs",
  description: "Generate professional specification documents for contractors including materials, measurements, and scope of work",
  inputSchema: {
    type: "object",
    properties: {
      design_id: { type: "string" },
      output_format: {
        type: "string",
        enum: ["pdf", "markdown", "json"],
        default: "markdown"
      },
      include_sections: {
        type: "array",
        items: {
          type: "string",
          enum: ["measurements", "materials", "scope", "timeline", "permits", "electrical", "plumbing"]
        }
      },
      trade_specific: {
        type: "string",
        enum: ["general", "electrical", "plumbing", "hvac", "flooring", "cabinetry"],
        description: "Generate specs for a specific trade"
      }
    },
    required: ["design_id"]
  }
}
```

---

## SDK Design

### JavaScript/TypeScript SDK

```typescript
import { RemodelVision } from '@remodelvision/sdk';

const rv = new RemodelVision({
  apiKey: process.env.REMODELVISION_API_KEY,
  // Optional: cache responses locally
  cache: true,
});

// Analyze a property
const property = await rv.properties.analyze({
  address: '123 Main St, Austin TX 78701'
});

// Generate a design
const design = await rv.designs.generate({
  propertyId: property.id,
  space: 'kitchen',
  style: 'modern-farmhouse',
  budgetTier: 'premium',
  goals: ['more-storage', 'better-flow']
});

// Get visualization
const image = await rv.visualize({
  designId: design.id,
  camera: 'perspective-1',
  resolution: '2048x2048'
});

// Streaming for long operations
const stream = await rv.designs.generateStream({...});
for await (const update of stream) {
  console.log(update.stage, update.progress);
}
```

### Python SDK

```python
from remodelvision import RemodelVision

rv = RemodelVision(api_key=os.environ["REMODELVISION_API_KEY"])

# Analyze property
property = rv.properties.analyze(
    address="123 Main St, Austin TX 78701"
)

# Generate design with context manager for cleanup
async with rv.designs.generate(
    property_id=property.id,
    space="kitchen",
    style="modern-farmhouse",
    budget_tier="premium"
) as design:
    # Stream progress
    async for update in design.progress:
        print(f"{update.stage}: {update.percent}%")

    result = await design.result()
    print(result.visualization_url)
```

---

## Pricing Model

### Free Tier (Developers/Hobbyists)
- 100 property analyses/month
- 50 design generations/month
- 256x256 visualizations
- Community support
- Rate limited: 10 req/min

### Pro Tier ($99/mo)
- 1,000 property analyses/month
- 500 design generations/month
- 2048x2048 visualizations
- Priority support
- Webhooks
- Rate limited: 100 req/min

### Business Tier ($499/mo)
- 10,000 property analyses/month
- 5,000 design generations/month
- 4096x4096 visualizations
- Dedicated support
- Custom integrations
- SLA: 99.9% uptime
- Rate limited: 500 req/min

### Enterprise (Custom)
- Unlimited usage
- White-label options
- On-premise deployment
- Custom model training
- Dedicated infrastructure
- SLA: 99.99% uptime

---

## Integration Patterns

### Real Estate Platforms (Zillow, Redfin, etc.)
```
Listing Page → RemodelVision Widget → "See potential renovations"
                    ↓
              Generate 3-5 design options
                    ↓
              Show ROI projections
                    ↓
              Connect to contractors (lead gen)
```

### Contractor Software (BuilderTrend, CoConstruct)
```
Project Intake → Pull PropertyContext → Auto-generate scope
                         ↓
              Trade-specific specs exported
                         ↓
              Material takeoffs generated
                         ↓
              Client-facing visualizations
```

### AI Agents (Claude, GPT, Custom)
```
User: "I want to update my 1970s kitchen for under $30k"
         ↓
Agent calls: remodelvision_analyze_property
         ↓
Agent calls: remodelvision_generate_design(budget_tier="standard")
         ↓
Agent calls: remodelvision_estimate_cost
         ↓
Agent: "Based on your kitchen's layout and the $30k budget,
        here's what I recommend..." [shows visualization]
```

### Home Improvement Retail (Home Depot, Lowe's)
```
Customer uploads photo → Analyze space → Recommend products
                              ↓
                    Generate "after" visualization
                              ↓
                    Shopping list with affiliate links
                              ↓
                    Installation service booking
```

---

## Data Network Effects

Every API call makes the platform smarter:

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Flywheel                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Properties Analyzed → Better Space Understanding          │
│            ↓                                                │
│   Designs Generated → Improved Style Recommendations        │
│            ↓                                                │
│   Cost Estimates → More Accurate Pricing Models             │
│            ↓                                                │
│   Completed Projects → Real ROI Validation                  │
│            ↓                                                │
│   Market Data → Localized Intelligence                      │
│            ↓                                                │
│   (Loop back to better property analysis)                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## MCP Server Implementation

```typescript
// packages/mcp-server/src/index.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { RemodelVisionClient } from '@remodelvision/sdk';

const server = new McpServer({
  name: 'remodelvision',
  version: '1.0.0',
});

const client = new RemodelVisionClient({
  apiKey: process.env.REMODELVISION_API_KEY,
});

// Register tools
server.tool(
  'remodelvision_analyze_property',
  'Analyze a property to extract context',
  {
    address: { type: 'string', description: 'Property address' },
    listing_url: { type: 'string', description: 'Listing URL' },
  },
  async ({ address, listing_url }) => {
    const result = await client.properties.analyze({
      address,
      listingUrl: listing_url,
    });
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2),
      }],
    };
  }
);

// ... register other tools

export default server;
```

---

## Success Metrics

| Metric | Target (Year 1) |
|--------|-----------------|
| API Developers | 1,000+ |
| Monthly API Calls | 1M+ |
| MCP Installations | 500+ |
| Enterprise Customers | 10+ |
| Developer NPS | 50+ |
| API Uptime | 99.9% |
| Avg Response Time | <2s for analysis, <10s for generation |

---

## Roadmap

### Phase 1: Foundation (Now)
- Core PropertyContext API
- Basic visualization endpoint
- JavaScript SDK
- Developer documentation

### Phase 2: Intelligence (Month 2-3)
- Design generation API
- Cost estimation API
- MCP server package
- Python SDK

### Phase 3: Platform (Month 4-6)
- ROI analysis API
- Contractor specs API
- Webhook system
- White-label options

### Phase 4: Ecosystem (Month 6+)
- Marketplace for integrations
- Partner program
- Custom model training
- Enterprise features

---

## Related Documents
- PRD-001: Property Context Intelligence
- PRD-003: Gemini AI Integration
- PRD-004: Image Generation Pipeline
- PRD-008: Data Structures & Schema
