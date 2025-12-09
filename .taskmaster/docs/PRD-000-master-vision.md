# PRD-000: RemodelVision Master Vision & Architecture

**Version:** 1.0.0
**Status:** Draft
**Created:** 2025-12-08
**Owner:** Jack Felke
**Domain:** Core Architecture

---

## Executive Summary

RemodelVision is a next-generation property remodeling visualization platform that combines 3D spatial computing with Generative AI to help busy property investors and homeowners visualize, plan, and manage remodel projects across their portfolio. The platform maintains rich property context to generate precise, actionable outputs—from photorealistic interior designs to architectural schematics.

### Core Value Proposition

> "I as a busy business owner with multiple remodel projects both personal and investments need remodel-vision to have a full suite of modern and cutting edge tools integrated closely with Gemini AI."

**Pain Points Solved:**
1. **Context Loss** - Users lose track of property details, measurements, and design decisions across sessions
2. **Imprecise AI Outputs** - Generic AI tools lack property-specific context for accurate generation
3. **Fragmented Tooling** - Multiple disconnected tools for design, planning, and project management
4. **Professional Gap** - Tools either too consumer-simple or too enterprise-complex

---

## Target Users

### Primary Personas

| Persona | Description | Key Needs |
|---------|-------------|-----------|
| **Property Investor (You)** | Manages multiple remodel projects (personal + investment) | Portfolio view, quick context switching, ROI-focused decisions |
| **General Contractor** | Professional managing multiple client projects | Schematics, annotations, timeline tracking, subcontractor communication |
| **Interior Designer** | Creates detailed room designs with product specifications | Product references, mood boards, precise measurements |
| **Homeowner DIYer** | Single property focus, needs guidance | Inspiration discovery, step-by-step planning, budget tracking |

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         REMODELVISION PLATFORM                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────────┐ │
│  │  PROPERTY        │  │  DESIGN          │  │  PROJECT              │ │
│  │  INTELLIGENCE    │  │  STUDIO          │  │  MANAGEMENT           │ │
│  │                  │  │                  │  │                       │ │
│  │  • Context Farm  │  │  • 3D Dollhouse  │  │  • Timeline           │ │
│  │  • Doc Parsing   │  │  • Image Gen     │  │  • Revisions          │ │
│  │  • Web Crawling  │  │  • Annotations   │  │  • Contractor View    │ │
│  │  • Measurements  │  │  • Comparisons   │  │  • Status Tracking    │ │
│  └────────┬─────────┘  └────────┬─────────┘  └───────────┬───────────┘ │
│           │                     │                        │             │
│           └─────────────────────┼────────────────────────┘             │
│                                 │                                       │
│                    ┌────────────▼────────────┐                         │
│                    │   UNIFIED CONTEXT       │                         │
│                    │   STORE (Zustand)       │                         │
│                    │                         │                         │
│                    │   PropertyContext       │                         │
│                    │   ProjectConfig         │                         │
│                    │   DesignHistory         │                         │
│                    │   AssetLibrary          │                         │
│                    └────────────┬────────────┘                         │
│                                 │                                       │
│           ┌─────────────────────┼─────────────────────┐                │
│           │                     │                     │                │
│  ┌────────▼────────┐  ┌────────▼────────┐  ┌────────▼────────┐       │
│  │  GEMINI AI      │  │  FIRECRAWL      │  │  WebGPU         │       │
│  │  ENGINE         │  │  ENGINE         │  │  RENDERER       │       │
│  │                 │  │                 │  │                 │       │
│  │  • gemini-3-pro │  │  • Web Scraper  │  │  • 3D Compute   │       │
│  │  • Flash/Lite   │  │  • PDF Parser   │  │  • Real-time    │       │
│  │  • Nano Banana  │  │  • Image OCR    │  │  • Shaders      │       │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Modules

### Module 1: Property Context Intelligence
**PRD Reference:** PRD-001
**Priority:** P0 (Critical Path)

Farms and maintains rich property context from multiple sources:
- Address-based web crawling (Firecrawl API)
- User-uploaded source documents (PDFs, images, links)
- AI extraction and structuring
- Measurement capture and validation

### Module 2: 3D Dollhouse Spatial Computing
**PRD Reference:** PRD-002
**Priority:** P1

Interactive 3D visualization that:
- Renders property layout from structured data
- Supports interior and exterior views
- Enables room-by-room navigation
- Captures viewport for AI processing

### Module 3: Gemini AI Full-Stack Integration
**PRD Reference:** PRD-003
**Priority:** P0 (Critical Path)

Complete integration with Gemini-3 model family:
- Text generation and chat refinement
- Image understanding and analysis
- Photorealistic image generation (Nano Banana Pro)
- Video generation for walkthroughs (future)

### Module 4: Image Generation Pipeline
**PRD Reference:** PRD-004
**Priority:** P0 (Critical Path)

Nano Banana Pro integration for:
- Interior design visualizations
- Exterior architectural renders
- Schematic overlays
- Before/after comparisons

### Module 5: Source Document Processing
**PRD Reference:** PRD-005
**Priority:** P1

AI workflow pipelines for:
- Document ingestion and parsing
- Context extraction and structuring
- Property detail enrichment
- Measurement validation

### Module 6: Project Management Interface
**PRD Reference:** PRD-006
**Priority:** P2

Contractor-grade project tracking:
- Timeline and milestone management
- Revision history and versioning
- Status tracking per room/zone
- Subcontractor coordination (future)

### Module 7: General Contractor Intelligence
**PRD Reference:** PRD-007
**Priority:** P2

Professional-grade features:
- Schematic annotation overlays
- Callout and labeling system
- Trade-specific views (plumbing, electrical)
- Takeoff and estimation aids

### Module 8: Data Structures & Schema
**PRD Reference:** PRD-008
**Priority:** P0 (Critical Path)

Clean, accurate data architecture:
- PropertyContext schema
- MeasurementSet schema
- DesignRevision schema
- AssetReference schema

### Module 9: User Interaction Patterns
**PRD Reference:** PRD-009
**Priority:** P1

Intuitive interaction design:
- Context-preserving workflows
- Multi-project switching
- Design history navigation
- Export and sharing

---

## Technology Stack

### Frontend
| Layer | Technology | Version |
|-------|------------|---------|
| Framework | React | 19.2.1 |
| Language | TypeScript | 5.8.2 |
| Build | Vite | 6.2.0 |
| Styling | Tailwind CSS | CDN |
| State | Zustand | 5.0.9 |
| Icons | Lucide React | 0.556.0 |

### 3D Engine
| Layer | Technology | Version |
|-------|------------|---------|
| Core | Three.js | 0.181.2 |
| React Binding | @react-three/fiber | 9.4.2 |
| Helpers | @react-three/drei | 10.7.7 |
| Compute | WebGPU | (Future) |

### AI Services
| Service | Provider | Model |
|---------|----------|-------|
| Chat/Vision | Google | gemini-2.5-flash |
| Image Gen | Google | gemini-3-pro-image-preview |
| Research | Perplexity | sonar-pro |
| Fallback | Anthropic | claude-sonnet-4.5 |

### External APIs
| Service | Purpose | Priority |
|---------|---------|----------|
| Firecrawl | Web scraping/crawling | P0 |
| Zillow/Redfin | Property data | P1 |
| Google Maps | Geocoding/Street View | P1 |
| Product APIs | Furniture/Materials | P2 |

---

## Success Metrics

### User Experience
- **Context Retention:** 100% of property details preserved across sessions
- **Generation Accuracy:** 90%+ match to user intent on first attempt
- **Time to Visualization:** <30 seconds from prompt to render

### Business Impact
- **Projects Managed:** Support 10+ concurrent projects per user
- **Decision Speed:** 50% faster design decisions with AI suggestions
- **Professional Adoption:** Features usable by licensed contractors

---

## Implementation Phases

### Phase 1: Context Foundation (Weeks 1-3)
- [ ] Property Context Intelligence module
- [ ] Source document processing pipeline
- [ ] Data structures and schema
- [ ] Firecrawl integration

### Phase 2: AI Generation (Weeks 4-6)
- [ ] Gemini-3 full model family integration
- [ ] Nano Banana Pro image pipeline
- [ ] Context injection system
- [ ] Result comparison overlay

### Phase 3: 3D Enhancement (Weeks 7-9)
- [ ] 3D dollhouse accuracy improvements
- [ ] WebGPU compute integration
- [ ] Property data-driven generation
- [ ] Measurement visualization

### Phase 4: Professional Features (Weeks 10-12)
- [ ] GC intelligence overlays
- [ ] Project management timeline
- [ ] Revision tracking system
- [ ] Export and sharing

---

## Related Documents

| PRD | Title | Status |
|-----|-------|--------|
| PRD-001 | Property Context Intelligence | Draft |
| PRD-002 | 3D Dollhouse & Spatial Computing | Draft |
| PRD-003 | Gemini AI Full-Stack Integration | Draft |
| PRD-004 | Image Generation Pipeline | Draft |
| PRD-005 | Source Document Processing | Draft |
| PRD-006 | Project Management Interface | Draft |
| PRD-007 | General Contractor Intelligence | Draft |
| PRD-008 | Data Structures & Schema | Draft |
| PRD-009 | User Interaction Patterns | Draft |

---

## Appendix: Key Terminology

| Term | Definition |
|------|------------|
| **Property Context** | Complete structured data about a property (measurements, features, constraints) |
| **Nano Banana Pro** | Gemini's photorealistic image generation capability |
| **Dollhouse View** | 3D visualization showing property layout from above |
| **Context Farming** | Extracting and structuring data from multiple sources |
| **Design DNA** | User preferences and constraints that guide AI generation |

---

*Document maintained by RemodelVision Team*
