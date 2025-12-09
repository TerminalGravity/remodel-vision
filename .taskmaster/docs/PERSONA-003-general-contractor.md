# PERSONA-003: General Contractor

**Version:** 1.0.0
**Status:** Active
**Created:** 2025-12-08
**Domain:** User Research
**Priority:** P1 (Professional User Segment)

---

## Persona Overview

### Meet Mike Torres

**Age:** 42
**Occupation:** Licensed General Contractor, Owner of Torres Remodeling LLC
**Location:** Phoenix, Arizona
**Business:** 15-person crew, $2-5M annual revenue
**Specialization:** Residential remodels, kitchen/bath focus
**Experience:** 18 years in construction, 8 years as GC

---

## Profile Summary

Mike runs a successful mid-size remodeling company. He's constantly managing 5-8 active projects while bidding on new work. His biggest pain points are client communication (explaining options, managing expectations) and the gap between client "Pinterest vision" and construction reality. He needs tools that help him speak the client's language while maintaining professional-grade precision.

### The Quote

> "Half my job is translating what homeowners think they want into something buildable. If they showed me a proper render with measurements, I could give them an accurate quote in 10 minutes instead of going back and forth for 2 weeks."

---

## Demographic Profile

| Attribute | Details |
|-----------|---------|
| **Age Range** | 35-55 |
| **Business Size** | Solo to 25 employees |
| **Annual Revenue** | $500K - $10M |
| **Technical Savvy** | Moderate (uses industry software, learning new tech) |
| **License** | State-licensed General Contractor |
| **Certifications** | Often: EPA Lead-Safe, OSHA, specialty certs |
| **Time Availability** | Extremely limited (on-site + management) |
| **Decision Style** | Practical, schedule-driven, risk-aware |

---

## Goals & Motivations

### Primary Goals

1. **Accurate Bidding**
   - Clear scope with precise specifications
   - Reduce change orders from miscommunication
   - Win more bids with professional presentations

2. **Client Expectation Management**
   - Show clients exactly what they're getting
   - Document approvals to prevent disputes
   - Visualize trade-offs (budget vs. features)

3. **Efficient Project Communication**
   - Single source of truth for all stakeholders
   - Reduce phone calls and texts
   - Clear handoffs between trades

4. **Trade Coordination**
   - Schematic overlays for plumbing, electrical
   - Measurements that trades can use directly
   - Clash detection before issues arise on-site

5. **Professional Differentiation**
   - Stand out from competitors in proposals
   - Justify premium pricing with better service
   - Build reputation for quality

### Secondary Goals

- Train junior project managers with clear documentation
- Build a library of successful project templates
- Reduce liability through better documentation
- Upsell clients with visual options

---

## Pain Points & Frustrations

### Current Workflow Failures

| Pain Point | Current Workaround | Impact |
|------------|-------------------|--------|
| **"Pinterest photo" quotes** | Multiple site visits, guesswork | Low-ball bids, scope creep |
| **Unclear measurements** | Re-measure everything | Wasted time, ordering delays |
| **Client indecision** | Endless back-and-forth | Project delays, frustration |
| **Trade miscommunication** | Phone calls, markup photos | Rework, cost overruns |
| **Change order disputes** | Paper trail, hope for the best | Unpaid work, bad reviews |
| **Proposal competition** | Basic spreadsheet bids | Losing to flashier competitors |
| **Documentation gaps** | Photos, notes, memory | Liability exposure |

### The Communication Gap

```
CLIENT VISION              vs.           CONSTRUCTION REALITY
────────────────                        ────────────────────
Pinterest photo of                      • Load-bearing wall in the way
open-concept kitchen                    • HVAC duct runs through ceiling
                                        • Electrical panel on wrong wall
                                        • Budget is 40% of what's needed
          │                                       │
          │        CONTRACTOR STUCK               │
          ▼        IN THE MIDDLE                  ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   "I need to explain why their $25K budget doesn't          │
│    match their $75K expectations, and I only have           │
│    phone photos to work with."                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Specific Frustrations

1. **"They show me a magazine photo and ask 'how much?'"**
   - No dimensions, no context, impossible to quote
   - Ballpark becomes binding in client's mind

2. **"I draw it out by hand and they still don't understand"**
   - Sketches don't convey finished look
   - Clients can't visualize 3D from 2D plans

3. **"My plumber and electrician need different views"**
   - Manually creating trade-specific markups
   - Information gets lost in translation

4. **"Client approved this, but now claims they didn't"**
   - Verbal approvals, email chains buried
   - Need clear documentation trail

5. **"I spend more time on proposals than actual building"**
   - Multiple revisions before winning bid
   - Losing bids to contractors with better visuals

---

## User Journey: Project Lifecycle

### Phase 1: Lead Qualification

```
┌────────────────────────────────────────────────────────────────────────────┐
│  📞 INCOMING LEAD                                                          │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Client: "We want to remodel our kitchen. Saw your work on Houzz."         │
│                                                                             │
│  TRADITIONAL PROCESS:                   REMODELVISION PROCESS:             │
│  ─────────────────────                  ──────────────────────             │
│  1. Schedule site visit (2-3 days)      1. "Share your RemodelVision link" │
│  2. Drive to property (30-60 min)       2. Review their design (5 min)     │
│  3. Measure everything (60-90 min)      3. Ballpark quote instantly        │
│  4. Go back to office, create quote     4. Schedule if qualified           │
│  5. Send quote (24-48 hours later)                                         │
│  6. Follow up, revise, repeat                                              │
│                                                                             │
│  TIME INVESTED: 4-8 hours               TIME INVESTED: 15-30 minutes       │
│  CONVERSION: ~25%                       CONVERSION: Higher (qualified)     │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### Phase 2: Proposal Development

**Contractor Proposal View:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│  📋 PROPOSAL BUILDER: Smith Kitchen Remodel                                 │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Client Design: ✓ Imported from RemodelVision                              │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                                                                    │    │
│  │  [CLIENT'S 3D DESIGN WITH CONTRACTOR ANNOTATIONS]                 │    │
│  │                                                                    │    │
│  │  ⚠️ Load-bearing wall                                              │    │
│  │     └── Requires engineer ($1,500) + beam install ($3,200)        │    │
│  │                                                                    │    │
│  │  📍 Electrical panel location                                      │    │
│  │     └── 40-amp circuit addition for range ($800)                  │    │
│  │                                                                    │    │
│  │  📍 Plumbing rough-in                                              │    │
│  │     └── Island sink requires under-slab work (+$2,400)            │    │
│  │                                                                    │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  SCOPE BREAKDOWN                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ CATEGORY            │ LABOR      │ MATERIAL   │ SUBTOTAL           │    │
│  │─────────────────────┼────────────┼────────────┼───────────────────│    │
│  │ Demolition          │ $1,800     │ $200       │ $2,000            │    │
│  │ Structural          │ $3,200     │ $1,500     │ $4,700            │    │
│  │ Electrical          │ $2,400     │ $800       │ $3,200            │    │
│  │ Plumbing            │ $3,600     │ $1,200     │ $4,800            │    │
│  │ Cabinets (install)  │ $2,800     │ $12,400    │ $15,200           │    │
│  │ Countertops         │ $1,200     │ $4,800     │ $6,000            │    │
│  │ Flooring            │ $1,600     │ $2,400     │ $4,000            │    │
│  │ Tile (backsplash)   │ $1,400     │ $1,800     │ $3,200            │    │
│  │ Fixtures/Finishes   │ $800       │ $2,600     │ $3,400            │    │
│  │ Painting            │ $1,200     │ $400       │ $1,600            │    │
│  │─────────────────────┼────────────┼────────────┼───────────────────│    │
│  │ SUBTOTAL            │ $20,000    │ $28,100    │ $48,100           │    │
│  │ Overhead (15%)      │            │            │ $7,215            │    │
│  │ Profit (10%)        │            │            │ $5,532            │    │
│  │─────────────────────┼────────────┼────────────┼───────────────────│    │
│  │ TOTAL               │            │            │ $60,847           │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  [📄 Generate Proposal PDF] [💬 Discuss with Client] [📊 Compare Options]  │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 3: Construction Documentation

**Trade-Specific Views:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│  🔧 TRADE DOCUMENTATION: Smith Kitchen                                      │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  View: [All] [🔌 Electrical] [🚿 Plumbing] [🔨 Framing] [📦 Cabinets]       │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                                                                    │    │
│  │  [SCHEMATIC OVERLAY - ELECTRICAL]                                 │    │
│  │                                                                    │    │
│  │  ────────────────────────────────────────────────────────────     │    │
│  │  │                        ○ GFCI                              │    │    │
│  │  │    ┌──────────┐       ○ GFCI        ○──── 20A circuit      │    │    │
│  │  │    │  RANGE   │                     (island outlets)       │    │    │
│  │  │    │  40A     │                                            │    │    │
│  │  │    └──────────┘                     ○ Pendant x3           │    │    │
│  │  │                                      (new 15A circuit)     │    │    │
│  │  │    ○ Under-cabinet LED                                     │    │    │
│  │  │      (hardwired, dimmer)            ○ Recessed x6         │    │    │
│  │  │                                      (existing circuit)    │    │    │
│  │  ────────────────────────────────────────────────────────────     │    │
│  │                                                                    │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ELECTRICAL SCOPE NOTES:                                                    │
│  • New 40A circuit for induction range (from panel, 35' run)               │
│  • New 20A circuit for island GFCI outlets                                 │
│  • Add dimmer switches: under-cabinet, pendants, recessed                  │
│  • Verify panel capacity before rough-in                                   │
│                                                                             │
│  [📤 Send to Electrician] [✏️ Add Note] [📸 Site Photo Overlay]            │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 4: Change Order Management

```
┌────────────────────────────────────────────────────────────────────────────┐
│  📝 CHANGE ORDER REQUEST                                                    │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Project: Smith Kitchen  │  Date: Dec 8, 2025  │  CO#: 003                 │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  ORIGINAL DESIGN          │        REQUESTED CHANGE               │    │
│  │                           │                                       │    │
│  │  [3D: Standard backsplash]│  [3D: Full-height backsplash]        │    │
│  │                           │                                       │    │
│  │  Backsplash: 4" height    │  Backsplash: Counter to cabinet      │    │
│  │  Tile qty: 28 sqft        │  Tile qty: 52 sqft                   │    │
│  │                           │                                       │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  COST IMPACT:                                                               │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ Additional tile (24 sqft @ $18/sqft)              │ $432          │    │
│  │ Additional labor (4 hours @ $65/hr)               │ $260          │    │
│  │ Subtotal                                          │ $692          │    │
│  │ Markup (25%)                                      │ $173          │    │
│  │ CHANGE ORDER TOTAL                                │ $865          │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  SCHEDULE IMPACT: +1 day for tile installation                             │
│                                                                             │
│  ☐ Client Approval Required                                                │
│                                                                             │
│  [📧 Send for Approval] [💬 Discuss Alternative] [❌ Decline Request]       │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Feature Prioritization for Contractors

### Must Have (P0)

| Feature | Why Critical |
|---------|--------------|
| Import client designs | Receive RemodelVision files from homeowners |
| Measurement extraction | Accurate scope from client's 3D model |
| Annotation system | Add notes, callouts, warnings |
| Trade-specific views | Separate layers for electrical, plumbing, etc. |
| Proposal PDF export | Professional client-facing documents |
| Change order documentation | Visual before/after with cost impact |

### Should Have (P1)

| Feature | Why Important |
|---------|---------------|
| Cost estimation integration | Tie visuals to pricing database |
| Timeline overlay | Show construction phases on design |
| Client approval tracking | Sign-offs with timestamps |
| Photo documentation | Overlay site photos on design |
| Subcontractor sharing | Send specific views to trades |

### Nice to Have (P2)

| Feature | Why Desirable |
|---------|---------------|
| Bid comparison | Multiple material options with pricing |
| Scheduling integration | Connect to project management tools |
| Permit documentation | Generate code-compliant drawings |
| Walk-through videos | Animated client presentations |

---

## Schematic Overlay System

### Overlay Types

```typescript
interface SchematicOverlay {
  id: string;
  type: OverlayType;
  elements: OverlayElement[];
  visibility: boolean;
  printable: boolean;
}

type OverlayType =
  | 'electrical'     // Outlets, switches, circuits, panel
  | 'plumbing'       // Supply, drain, vents, fixtures
  | 'hvac'           // Ducts, vents, equipment
  | 'framing'        // Studs, headers, load-bearing
  | 'demolition'     // What gets removed
  | 'measurements'   // Dimensions, heights
  | 'annotations'    // Notes, warnings, callouts
  | 'materials'      // Product specs, SKUs
  | 'timeline';      // Construction sequence

interface OverlayElement {
  id: string;
  type: ElementType;
  position: Vector3;
  label: string;
  details: string;
  linkedProducts?: ProductReference[];
  warnings?: string[];
}
```

### Visual Callout System

```
┌────────────────────────────────────────────────────────────────────────────┐
│  CALLOUT TYPES                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ⚠️ WARNING                    ℹ️ INFO                    📍 LOCATION        │
│  └── Critical issues          └── General notes         └── Reference pts  │
│      Load-bearing walls          Product specs             Outlet locations │
│      Code violations             Alternatives              Fixture centers  │
│                                                                             │
│  📐 DIMENSION                   🔧 TRADE NOTE              💰 COST           │
│  └── Measurements              └── Trade-specific        └── Pricing info   │
│      Room sizes                   Electrical load          Material cost    │
│      Clearances                   Pipe sizes               Labor estimate   │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Integration Requirements

### Industry Tool Integrations

| Tool Category | Examples | Integration Priority |
|---------------|----------|---------------------|
| Estimating Software | Buildertrend, CoConstruct | P1 |
| Project Management | Monday, Asana, Basecamp | P2 |
| Accounting | QuickBooks, Xero | P2 |
| CAD Software | AutoCAD, SketchUp (export) | P2 |
| Material Suppliers | Home Depot Pro, ABC Supply | P1 |

### Data Exchange Formats

| Format | Purpose |
|--------|---------|
| PDF | Client proposals, trade docs |
| DXF/DWG | CAD compatibility |
| IFC | BIM interoperability |
| CSV | Takeoff quantities |
| JSON | API integrations |

---

## Success Metrics (Contractor Segment)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Proposal Win Rate** | +15% improvement | Before/after comparison |
| **Time to Quote** | 50% reduction | Workflow timing |
| **Change Orders** | 30% reduction | Miscommunication-related |
| **Trade Exports/Month** | 20+ | Feature adoption |
| **Client Disputes** | 50% reduction | Documentation coverage |
| **Referral Rate** | 40%+ | Growth indicator |

---

## Pricing Model (Contractor Tier)

### Professional Plans

| Tier | Price | Features |
|------|-------|----------|
| **Contractor Basic** | $29/month | 10 projects, PDF exports, annotations |
| **Contractor Pro** | $79/month | Unlimited, trade views, cost integration |
| **Contractor Team** | $149/month | 5 seats, client portal, API access |

### Value Justification

- "Save 5 hours per bid = $500+ in labor cost"
- "Win 2 more bids per month = $10K+ revenue"
- "Avoid 1 dispute = $5K+ in lost time/reputation"

---

## User Quotes (Research Synthesis)

> "If homeowners came to me with a RemodelVision file instead of a Pinterest board, I could give them a real quote instead of a guess." — Mike, GC, 18 years

> "I need my electrician to see exactly where outlets go, not describe it over the phone." — Dave, GC, 12 years

> "Change orders are where I lose money. If they signed off on a 3D render, they can't claim they didn't know." — Sarah, GC, 8 years

> "The contractors with the best presentations win the bids. I'm losing to guys with worse work but better marketing." — Tom, GC, 22 years

> "I want one document that shows the client what they're getting, the plumber where pipes go, and my crew what to demo." — Rosa, GC, 15 years

---

## Appendix: Contractor-Specific Terminology

| Term | Definition |
|------|------------|
| **Rough-in** | Initial installation of electrical/plumbing before walls closed |
| **Takeoff** | Quantity calculations from plans |
| **Scope creep** | Unauthorized expansion of project work |
| **Change order (CO)** | Formal modification to contract |
| **Punch list** | Final items to complete before project close |
| **Trade** | Specialized subcontractor (electrician, plumber, etc.) |
| **Bid** | Formal price proposal for work |
| **Walk-through** | On-site review with client |

---

*Document maintained by RemodelVision Team*
