# PERSONA-004: Interior Designer

**Version:** 1.0.0
**Status:** Active
**Created:** 2025-12-08
**Domain:** User Research
**Priority:** P1 (Professional User Segment)

---

## Persona Overview

### Meet Ava Mitchell

**Age:** 38
**Occupation:** Principal, Ava Mitchell Interiors
**Location:** Seattle, Washington
**Business:** Solo practitioner with freelance support
**Specialization:** Residential interiors, high-end kitchen/bath, whole-home renovations
**Experience:** 12 years, ASID certified
**Annual Revenue:** $150K-300K (design fees, not including product sales)

---

## Profile Summary

Ava is a seasoned interior designer who serves high-end residential clients. Her work involves deep creative direction, curated product specification, and close contractor coordination. She charges a premium for her expertise and needs tools that reinforce her professional value—not replace it. Her ideal tool makes her more efficient while maintaining the bespoke feel of her service.

### The Quote

> "My clients pay for vision, not software. But if AI can help me produce twice as many concepts in half the time, I can serve more clients without sacrificing quality. I just need it to understand that a $50,000 kitchen isn't the same as a $150,000 kitchen."

---

## Demographic Profile

| Attribute | Details |
|-----------|---------|
| **Age Range** | 30-55 |
| **Business Model** | Hourly ($150-400/hr) or Flat fee + markup on products |
| **Client Base** | Affluent homeowners, $500K+ projects common |
| **Technical Savvy** | High (Adobe Creative Suite, SketchUp, 3D tools) |
| **Design Education** | Degree or certification (ASID, NCIDQ) |
| **Project Duration** | 6-18 months typical |
| **Vendor Relationships** | Deep (trade-only showrooms, custom fabricators) |

---

## Goals & Motivations

### Primary Goals

1. **Efficient Concept Development**
   - Generate multiple design directions quickly
   - Iterate with clients without starting from scratch
   - Explore "what-if" scenarios in real-time

2. **Photorealistic Visualization**
   - Present designs that look real, not "rendery"
   - Match actual products, materials, finishes
   - Convey atmosphere, lighting, mood

3. **Precise Product Specification**
   - Link designs to actual SKUs and vendors
   - Track lead times and availability
   - Manage budgets against product selections

4. **Client Communication**
   - Share professional presentations
   - Gather approvals with documentation
   - Reduce revision cycles

5. **Contractor Coordination**
   - Hand off clear specifications
   - Ensure design intent is executed
   - Reduce site RFIs (Requests for Information)

### Secondary Goals

- Build a library of reusable room concepts
- Differentiate from "Pinterest board" amateur designers
- Justify premium pricing with superior deliverables
- Scale practice without adding full-time staff

---

## Pain Points & Frustrations

### Current Workflow Failures

| Pain Point | Current Workaround | Impact |
|------------|-------------------|--------|
| **Time-intensive rendering** | SketchUp + Photoshop, or expensive render farms | 4-8 hours per room |
| **Generic 3D assets** | Hunt for accurate product models | Designs look fake |
| **Client indecision loops** | Produce 3-5 full concepts | Scope creep, unpaid work |
| **Specification errors** | Manual spreadsheets | Ordering wrong items |
| **Contractor misinterpretation** | Detailed notes, site visits | Design intent lost |
| **Budget tracking** | Excel, hope | Awkward client conversations |
| **Inspiration organization** | Folders, mood boards | Hard to reference |

### The Visualization Gap

```
DESIGN INTENT                  vs.           3D RENDERING REALITY
────────────────                             ────────────────────────
Curated, atmospheric                         Sterile, over-lit
Real materials (that specific marble)        Generic "marble texture"
Custom furniture pieces                      Off-the-shelf 3D models
Lived-in, styled feel                        Empty, catalog-like
        │                                           │
        │        DESIGNER STUCK                     │
        ▼        IN THE MIDDLE                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   "I spend more time trying to make renders look like my vision    │
│    than I do actually designing. The tools fight me."               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Specific Frustrations

1. **"SketchUp looks like a video game, not a real room"**
   - Clients can't see past the graphics
   - Endless explaining that "it will look better in reality"

2. **"I can't find a 3D model for this specific sofa"**
   - Forced to use approximations
   - Design loses authenticity

3. **"Client loves the concept but wants to swap every single item"**
   - Each swap requires re-rendering
   - Spirals into endless revisions

4. **"My contractor installed the wrong tile pattern"**
   - Spec sheet wasn't clear enough
   - Costly fix, relationship strain

5. **"I know this living room needs something, but I can't visualize it"**
   - AI could suggest options
   - Current tools don't understand design language

---

## User Journey: Design Project Lifecycle

### Phase 1: Discovery & Programming

**Initial Client Meeting → Design Brief**

```
┌────────────────────────────────────────────────────────────────────────────┐
│  📋 PROJECT INTAKE: Williams Residence                                      │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  CLIENT PREFERENCES (imported from questionnaire)                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Style Direction:    Contemporary with warm, organic elements        │   │
│  │ Color Palette:      Neutrals, warm whites, natural wood tones       │   │
│  │ Must-Haves:         Natural light, uncluttered, art display         │   │
│  │ Avoid:              Industrial, overly minimal, gray tones          │   │
│  │ Inspiration:        [3 client-uploaded images]                      │   │
│  │ Budget:             $125,000 (furniture + finishes)                 │   │
│  │ Timeline:           Complete by June 2026                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  SPACE ANALYSIS (from property context)                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Room: Living Room                                                   │   │
│  │ Dimensions: 18' x 22' (396 sqft), 10' ceiling                       │   │
│  │ Windows: 3 south-facing (excellent natural light)                    │   │
│  │ Fireplace: Existing, centered on west wall                          │   │
│  │ Flooring: Existing hardwood (to be refinished)                       │   │
│  │ Constraints: HVAC vent ceiling-mounted, cannot move                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [✨ Generate Concept Directions] [📐 Start Space Plan] [📁 Add Inspiration]│
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 2: Concept Development

**AI-Assisted Concept Generation:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│  🎨 CONCEPT DIRECTIONS: Williams Living Room                                │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Prompt: "Generate 3 concept directions for this living room. Style is     │
│  contemporary with warm, organic elements. Feature the fireplace as focal  │
│  point. Budget range is $80-100K for furnishings. South-facing light."     │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │                 │  │                 │  │                 │             │
│  │  [AI RENDER 1]  │  │  [AI RENDER 2]  │  │  [AI RENDER 3]  │             │
│  │                 │  │                 │  │                 │             │
│  │  CONCEPT A:     │  │  CONCEPT B:     │  │  CONCEPT C:     │             │
│  │  Japandi Calm   │  │  Organic Modern │  │  Warm Minimal   │             │
│  │                 │  │                 │  │                 │             │
│  │  Low-slung      │  │  Sculptural     │  │  Clean lines    │             │
│  │  Natural        │  │  curves +       │  │  Caramel        │             │
│  │  materials      │  │  natural stone  │  │  leather accent │             │
│  │                 │  │                 │  │                 │             │
│  │  Est: $85,000   │  │  Est: $98,000   │  │  Est: $82,000   │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  AI Design Notes:                                                           │
│  "Given the south-facing windows, I've oriented seating to capture the     │
│   natural light while maintaining the fireplace as the focal point. Each   │
│   concept uses a 9x12 area rug to define the conversation zone."           │
│                                                                             │
│  [📥 Save All] [🔄 Regenerate] [✏️ Refine Concept B] [📤 Share with Client]│
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 3: Specification & Sourcing

**Product Specification Interface:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│  🛋️ PRODUCT SPECIFICATION: Living Room - Concept B                         │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                                                                    │    │
│  │  [3D VIEW - Clickable hotspots on each product]                   │    │
│  │                                                                    │    │
│  │       ○ Pendant                                                   │    │
│  │                          ○ Art                                    │    │
│  │     ○ Sofa                                                        │    │
│  │                ○ Coffee Table                                     │    │
│  │         ○ Rug                          ○ Accent Chair             │    │
│  │                                                                    │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  SELECTED: Sofa                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │  AI-Suggested Match:                                               │    │
│  │                                                                    │    │
│  │  [IMG]  B&B Italia Tufty-Time Sofa                                 │    │
│  │         Fabric: Elitis "Wabi" - Chalk                              │    │
│  │         Dimensions: 108"W x 42"D x 28"H                            │    │
│  │         Lead Time: 12-14 weeks                                     │    │
│  │         Trade Price: $14,800                                       │    │
│  │                                                                    │    │
│  │  ─────────────────────────────────────────────────────────────     │    │
│  │                                                                    │    │
│  │  Alternatives (similar style, different price points):             │    │
│  │                                                                    │    │
│  │  [IMG] Restoration Hardware    [IMG] Article Sven     [IMG] Custom│    │
│  │        Cloud Modular                 Sectional              Local │    │
│  │        $9,400                        $2,400                 $7,200│    │
│  │        8-10 weeks                    2 weeks               16 wks │    │
│  │                                                                    │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  [✓ Confirm Selection] [🔄 See More Options] [💬 Ask AI for Alternatives]  │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 4: Client Presentation

**Client Presentation Portal:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│  👁️ CLIENT VIEW: Williams Living Room - Concept B                          │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                                                                    │    │
│  │  [HERO RENDER - Photorealistic, atmospheric]                      │    │
│  │                                                                    │    │
│  │  "Organic Modern"                                                 │    │
│  │  A living room that breathes. Sculptural forms meet natural       │    │
│  │  materials, centered around your stunning fireplace.              │    │
│  │                                                                    │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  VIEW OPTIONS:                                                              │
│  [🌅 Morning Light] [☀️ Afternoon] [🌙 Evening] [📐 Floor Plan]             │
│                                                                             │
│  FEATURED PIECES:                                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│  │   Sofa   │ │  Table   │ │  Chair   │ │  Rug     │                       │
│  │ B&B Ital │ │ Cass+Lev │ │  Moroso  │ │  Armadil │                       │
│  │ $14,800  │ │  $4,200  │ │  $3,800  │ │  $8,500  │                       │
│  │ [♡ Save] │ │ [♡ Save] │ │ [♡ Save] │ │ [♡ Save] │                       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘                       │
│                                                                             │
│  FEEDBACK                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 💬 Leave comments on specific areas or products                     │   │
│  │ [Click anywhere on the image to add a note]                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [✓ Approve Concept] [🔄 Request Changes] [📥 Download Presentation]       │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Feature Prioritization for Designers

### Must Have (P0)

| Feature | Why Critical |
|---------|--------------|
| Photorealistic AI rendering | Core value, replaces expensive rendering |
| Style-aware generation | Understands design vocabulary |
| Product suggestion/matching | Links inspiration to real products |
| Multiple lighting conditions | Shows space throughout day |
| Client presentation mode | Professional client-facing output |
| Budget tracking by room | Project financial management |

### Should Have (P1)

| Feature | Why Important |
|---------|---------------|
| Furniture library with trade products | Accurate specifications |
| Material/finish previews | Swap surfaces realistically |
| Revision history | Track design evolution |
| Contractor handoff package | Seamless execution |
| Lead time tracking | Procurement planning |
| Mood board integration | Capture inspiration |

### Nice to Have (P2)

| Feature | Why Desirable |
|---------|---------------|
| Custom furniture modeling | Bespoke pieces |
| AR client preview | On-site visualization |
| Vendor API integration | Real-time pricing/availability |
| Portfolio presentation | Marketing materials |
| Color palette extraction | From inspiration images |

---

## Design Vocabulary Understanding

### Style Categories

```typescript
type DesignStyle =
  | 'contemporary'     // Clean lines, neutral palette, current
  | 'modern'           // Mid-century influence, iconic pieces
  | 'transitional'     // Traditional + contemporary blend
  | 'traditional'      // Classic, formal, ornate details
  | 'farmhouse'        // Rustic, reclaimed, cozy
  | 'industrial'       // Raw materials, exposed structure
  | 'scandinavian'     // Light, minimal, functional
  | 'japandi'          // Japanese + Scandinavian fusion
  | 'bohemian'         // Eclectic, layered, global
  | 'coastal'          // Light, airy, natural textures
  | 'mediterranean'    // Warm, terracotta, textured
  | 'art-deco'         // Geometric, glamorous, bold
  | 'maximalist'       // Bold patterns, rich colors, layered
  | 'organic-modern';  // Natural materials, sculptural, warm

interface MaterialFinish {
  category: 'wood' | 'stone' | 'metal' | 'fabric' | 'leather' | 'tile' | 'paint';
  name: string;        // e.g., "White Oak", "Calacatta Marble"
  finish: string;      // e.g., "Wire-brushed", "Honed", "Brushed"
  color: string;       // e.g., "Natural", "Warm Gray"
  vendor?: string;     // e.g., "Ann Sacks", "Kravet"
  sku?: string;
}
```

### AI Prompt Understanding

The system should understand professional design language:

```
Designer says:                    AI understands:
────────────────                  ────────────────
"Warm minimal"                    Clean lines + natural materials + warmth
"Collected, not decorated"        Eclectic with intention, layered
"Organic shapes"                  Curved, sculptural, nature-inspired
"Quiet luxury"                    High-end but understated
"Lived-in feel"                   Styled, not staged; comfortable
"Ground the space"                Anchor with rug, low furniture
"Draw the eye up"                 Tall elements, vertical emphasis
"Create conversation zones"       Multiple seating arrangements
```

---

## Success Metrics (Designer Segment)

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Render Time** | <5 min vs. 4+ hours | Efficiency gain |
| **Concept Iterations** | 3x more concepts per project | Output volume |
| **Client Approval Rate** | +20% faster | Revision reduction |
| **Specification Errors** | 50% reduction | Order accuracy |
| **Project Capacity** | +30% projects per year | Practice growth |
| **Client Satisfaction** | 95%+ approval rating | NPS |

---

## Pricing Model (Designer Tier)

### Professional Plans

| Tier | Price | Features |
|------|-------|----------|
| **Designer Starter** | $49/month | 5 projects, AI renders, product matching |
| **Designer Pro** | $129/month | Unlimited, client portal, trade catalogs |
| **Design Studio** | $299/month | Team (5 seats), API, white-label presentations |

### Value Justification

- "One 3D render = $500-1500 outsourced. AI unlimited = $129/month."
- "Serve 3 more clients per year = $30K+ additional revenue"
- "Win projects with better presentations"

---

## User Quotes (Research Synthesis)

> "I don't want AI to replace my creativity. I want it to visualize my ideas faster so I can spend more time on the creative part." — Ava, Interior Designer

> "When I can show a client exactly what that sofa looks like in their space with afternoon light, they stop second-guessing." — James, Designer

> "Product sourcing takes forever. If AI could suggest real products that match my concept, I'd save hours per project." — Michelle, Designer

> "I need renders that look real, not like a Sims game. My clients can tell the difference." — David, Designer

> "My differentiator is taste, not software skills. I want tools that amplify my taste." — Priya, Designer

---

## Appendix: Designer-Specific Terminology

| Term | Definition |
|------|------------|
| **COM** | Customer's Own Material - client provides fabric |
| **Trade pricing** | Designer-only wholesale rates |
| **Lead time** | Weeks from order to delivery |
| **FF&E** | Furniture, Fixtures & Equipment |
| **Procurement** | Product sourcing and ordering |
| **Install** | Final furniture delivery and styling |
| **Punch list** | Final touch-ups after install |
| **Mood board** | Visual collage of design direction |
| **Concept direction** | Overall design approach/theme |
| **Spec sheet** | Detailed product specifications |

---

*Document maintained by RemodelVision Team*
