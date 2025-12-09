# PRD-001: Property Context Intelligence

**Version:** 1.0.0
**Status:** Draft
**Created:** 2025-12-08
**Owner:** Jack Felke
**Domain:** Context Management
**Priority:** P0 (Critical Path)

---

## Overview

Property Context Intelligence is the foundational data layer that maintains comprehensive, accurate information about each property in the user's portfolio. This module enables all AI-generated outputs to be precise and contextually relevant by farming, structuring, and persisting property data from multiple sources.

### Problem Statement

> "I don't have the patience to keep the right context to get the best outputs from the models."

Current AI tools require users to repeatedly provide context about their property—measurements, constraints, style preferences—leading to:
- Inconsistent outputs across sessions
- Generic suggestions that don't fit the space
- Manual re-entry of the same information
- Lost design decisions and rationale

### Solution

A persistent, intelligent context layer that:
1. **Automatically farms** property data from public sources
2. **Parses and structures** user-uploaded documents
3. **Maintains accuracy** through validation and user corrections
4. **Injects context** into every AI interaction seamlessly

---

## Functional Requirements

### FR-001: Address-Based Property Discovery

**Description:** Given only a property address, automatically discover and populate property details.

**Data Sources (Priority Order):**
| Source | Data Types | API/Method |
|--------|-----------|------------|
| Zillow | Lot size, year built, beds/baths, Zestimate | Firecrawl scrape |
| Redfin | Floor plans, photos, history | Firecrawl scrape |
| County Assessor | Zoning, tax records, permits | Firecrawl scrape |
| Google Maps | Street view, satellite imagery, orientation | Maps API |
| Walk Score | Walkability, transit, bike scores | Walk Score API |
| School Digger | School district, ratings | Firecrawl scrape |

**Acceptance Criteria:**
- [ ] User enters address → system returns structured PropertyContext within 30 seconds
- [ ] At least 80% of fields populated from public sources
- [ ] User can override any auto-populated field
- [ ] Fallback to Gemini estimation if scraping fails

---

### FR-002: Source Document Parsing

**Description:** Extract and structure property information from user-uploaded documents.

**Supported Document Types:**
| Type | Extraction Targets |
|------|-------------------|
| Floor Plans (PDF/Image) | Room dimensions, layout, square footage |
| Blueprints | Structural elements, measurements, annotations |
| Inspection Reports | Property condition, issues, recommendations |
| Appraisal Documents | Valuation, comparables, features |
| Permit Applications | Scope of work, contractor info, timelines |
| Photos | Room identification, current state, features |
| Listing PDFs | Marketing descriptions, feature lists |
| Material Specs | Product names, SKUs, dimensions |

**Acceptance Criteria:**
- [ ] Drag-and-drop upload interface
- [ ] AI-powered extraction with Gemini Vision
- [ ] Structured output mapped to PropertyContext schema
- [ ] User review and correction interface
- [ ] Version history for uploaded documents

---

### FR-003: Measurement Capture System

**Description:** Capture, validate, and persist precise room measurements.

**Measurement Types:**
```typescript
interface MeasurementSet {
  roomId: string;
  roomName: string;
  dimensions: {
    length: Measurement;
    width: Measurement;
    height: Measurement;
    squareFootage: number;
    cubicFootage: number;
  };
  features: FeatureMeasurement[];
  openings: OpeningMeasurement[];
  fixtures: FixtureMeasurement[];
}

interface Measurement {
  value: number;
  unit: 'ft' | 'in' | 'm' | 'cm';
  source: 'user' | 'document' | 'estimated';
  confidence: number; // 0-1
}

interface FeatureMeasurement {
  type: 'window' | 'door' | 'closet' | 'niche' | 'bump-out';
  location: WallPosition;
  dimensions: { width: Measurement; height: Measurement };
}

interface OpeningMeasurement {
  type: 'doorway' | 'archway' | 'pass-through';
  connectsTo: string; // roomId
  dimensions: { width: Measurement; height: Measurement };
}
```

**Acceptance Criteria:**
- [ ] Manual measurement entry with unit conversion
- [ ] AI extraction from floor plan images
- [ ] Validation for impossible dimensions
- [ ] Visual overlay on 3D dollhouse
- [ ] Export to standard formats (CSV, JSON)

---

### FR-004: Context Injection Engine

**Description:** Automatically inject relevant property context into AI prompts.

**Injection Levels:**
| Level | Context Included | Use Cases |
|-------|-----------------|-----------|
| Minimal | Address, style, budget | Quick suggestions |
| Standard | + Room dimensions, constraints | Design generation |
| Full | + All measurements, history, preferences | Detailed renders |
| Custom | User-selected fields | Specialized queries |

**Prompt Construction:**
```typescript
function buildContextualPrompt(
  userPrompt: string,
  property: PropertyContext,
  room?: RoomContext,
  level: InjectionLevel = 'standard'
): string {
  const context = extractContext(property, room, level);
  return `
## Property Context
${formatContext(context)}

## User Request
${userPrompt}

## Constraints
- Maintain architectural style: ${property.config.style}
- Budget tier: ${property.config.budget}
- Location considerations: ${property.location.climate}, ${property.location.region}
`;
}
```

**Acceptance Criteria:**
- [ ] Context automatically included in all AI calls
- [ ] User can toggle context injection on/off
- [ ] Visual indicator showing active context
- [ ] Token usage optimization for large contexts

---

### FR-005: Property Portfolio Management

**Description:** Manage multiple properties with quick context switching.

**Features:**
- Property list with thumbnails and key metrics
- Quick-switch dropdown in header
- Property-specific settings and preferences
- Cross-property comparison views
- Bulk operations (archive, export, duplicate)

**Acceptance Criteria:**
- [ ] Support 50+ properties per account
- [ ] Context switch in <500ms
- [ ] Offline access to property data
- [ ] Search and filter by address, status, budget

---

## Data Schema

### PropertyContext (Complete)

```typescript
interface PropertyContext {
  // Identity
  id: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    formatted: string;
  };

  // Geospatial
  location: {
    lat: number;
    lng: number;
    orientation: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
    elevation: number;
    climate: ClimateZone;
    sunPath: SunPathData;
  };

  // Property Details
  details: {
    propertyType: 'single-family' | 'condo' | 'townhouse' | 'multi-family' | 'commercial';
    yearBuilt: number;
    yearRenovated?: number;
    lotSize: { value: number; unit: 'sqft' | 'acres' };
    livingArea: { value: number; unit: 'sqft' };
    stories: number;
    bedrooms: number;
    bathrooms: number;
    garage: { type: 'attached' | 'detached' | 'none'; cars: number };
    basement: { type: 'full' | 'partial' | 'crawl' | 'none'; finished: boolean };
    pool: boolean;
    hvac: HVACSystem;
    roofType: string;
    foundationType: string;
  };

  // Regulatory
  regulatory: {
    zoning: string;
    zoningDescription: string;
    hoa: { exists: boolean; fee?: number; restrictions?: string[] };
    historicDistrict: boolean;
    permits: PermitRecord[];
    setbacks: { front: number; back: number; side: number };
  };

  // Valuation
  valuation: {
    assessed: number;
    estimated: number;
    taxAnnual: number;
    lastSalePrice?: number;
    lastSaleDate?: string;
  };

  // Neighborhood
  neighborhood: {
    walkScore: number;
    transitScore: number;
    bikeScore: number;
    schoolDistrict: string;
    nearbySchools: SchoolInfo[];
    crimeIndex: number;
    noiseLevel: 'quiet' | 'moderate' | 'busy';
  };

  // Rooms (Detailed)
  rooms: RoomContext[];

  // Systems
  systems: {
    electrical: ElectricalSystem;
    plumbing: PlumbingSystem;
    hvac: HVACSystem;
    structural: StructuralNotes;
  };

  // Sources
  sources: SourceDocument[];

  // Metadata
  metadata: {
    createdAt: string;
    updatedAt: string;
    completeness: number; // 0-100
    dataQuality: 'estimated' | 'scraped' | 'verified';
  };
}
```

### RoomContext

```typescript
interface RoomContext {
  id: string;
  name: string;
  type: RoomType;
  floor: number;
  measurements: MeasurementSet;

  // Current State
  currentState: {
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    flooring: string;
    walls: string;
    ceiling: string;
    lighting: LightingFixture[];
    photos: string[]; // URLs
  };

  // Remodel Scope
  remodelScope: {
    included: boolean;
    priority: 'high' | 'medium' | 'low';
    estimatedBudget: number;
    targetStyle: string;
    notes: string;
  };

  // Features
  features: {
    windows: WindowFeature[];
    doors: DoorFeature[];
    builtIns: BuiltInFeature[];
    fixtures: FixtureFeature[];
  };

  // Constraints
  constraints: {
    structural: string[]; // e.g., "load-bearing wall on north side"
    mechanical: string[]; // e.g., "main HVAC duct runs through ceiling"
    regulatory: string[]; // e.g., "egress window required"
  };
}

type RoomType =
  | 'kitchen' | 'bathroom' | 'bedroom' | 'living-room'
  | 'dining-room' | 'office' | 'laundry' | 'garage'
  | 'basement' | 'attic' | 'hallway' | 'closet'
  | 'mudroom' | 'pantry' | 'outdoor';
```

---

## User Interface

### Property Intelligence Panel

```
┌─────────────────────────────────────────────────────────────┐
│  📍 123 Main Street, Austin, TX 78701                       │
│  ───────────────────────────────────────────────────────── │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ 🏠 2,450 sqft   │  │ 🛏 4 bed / 2.5 ba│                  │
│  │ Living Area     │  │ Bedrooms/Baths  │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ 📅 Built 1985   │  │ 🌡 Zone 8b       │                  │
│  │ Year Built      │  │ Climate Zone    │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  Context Completeness ████████░░ 78%                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔍 Missing Data                                      │   │
│  │ • Kitchen measurements (upload floor plan)          │   │
│  │ • Electrical panel capacity                         │   │
│  │ • HVAC system age                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [📎 Upload Document] [🔄 Refresh Data] [✏️ Edit Manually] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Document Upload Flow

```
Step 1: Upload                Step 2: AI Analysis         Step 3: Review & Confirm
┌──────────────────┐         ┌──────────────────┐       ┌──────────────────┐
│                  │         │                  │       │                  │
│  ┌────────────┐  │         │  Analyzing...    │       │  Extracted Data  │
│  │            │  │         │                  │       │                  │
│  │  📄 Drop   │  │  ───▶   │  ████░░░ 65%    │ ───▶  │  Kitchen: 12x14  │
│  │   Files    │  │         │                  │       │  ☑ Confirm       │
│  │            │  │         │  Found:          │       │                  │
│  └────────────┘  │         │  • Floor plan    │       │  Island: 4x6     │
│                  │         │  • 3 rooms       │       │  ☑ Confirm       │
│  PDF, PNG, JPG   │         │  • Measurements  │       │                  │
│                  │         │                  │       │  [Save All]      │
└──────────────────┘         └──────────────────┘       └──────────────────┘
```

---

## Technical Implementation

### Firecrawl Integration

```typescript
// services/propertyDataService.ts

import Firecrawl from '@mendable/firecrawl-js';

const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

interface PropertyDataSource {
  name: string;
  urlPattern: (address: string) => string;
  extractionSchema: object;
}

const PROPERTY_SOURCES: PropertyDataSource[] = [
  {
    name: 'zillow',
    urlPattern: (addr) => `https://www.zillow.com/homes/${encodeURIComponent(addr)}`,
    extractionSchema: {
      lotSize: 'string',
      yearBuilt: 'number',
      livingArea: 'number',
      bedrooms: 'number',
      bathrooms: 'number',
      zestimate: 'number',
    },
  },
  {
    name: 'redfin',
    urlPattern: (addr) => `https://www.redfin.com/search?q=${encodeURIComponent(addr)}`,
    extractionSchema: {
      photos: 'array',
      floorPlan: 'string',
      propertyHistory: 'array',
    },
  },
  // ... additional sources
];

export async function fetchPropertyData(address: string): Promise<PropertyContext> {
  const results = await Promise.allSettled(
    PROPERTY_SOURCES.map(async (source) => {
      const url = source.urlPattern(address);
      const response = await firecrawl.scrapeUrl(url, {
        formats: ['extract'],
        extract: { schema: source.extractionSchema },
      });
      return { source: source.name, data: response.extract };
    })
  );

  return mergePropertyData(results);
}
```

### Document Processing Pipeline

```typescript
// services/documentProcessor.ts

import { geminiService } from './geminiService';

interface ProcessedDocument {
  type: DocumentType;
  extractedData: Partial<PropertyContext>;
  confidence: number;
  rawText?: string;
  annotations?: Annotation[];
}

export async function processDocument(
  file: File,
  existingContext: PropertyContext
): Promise<ProcessedDocument> {
  const base64 = await fileToBase64(file);

  const prompt = `
Analyze this document for a property remodel project.
Extract all relevant information including:
- Room dimensions and measurements
- Property features and fixtures
- Material specifications
- Any numerical data

Current property context for reference:
${JSON.stringify(existingContext, null, 2)}

Return a JSON object with extracted data mapped to our schema.
`;

  const response = await geminiService.analyzeContext(base64, prompt);

  return {
    type: detectDocumentType(file, response),
    extractedData: parseExtraction(response),
    confidence: calculateConfidence(response),
  };
}
```

---

## Integration Points

### With 3D Dollhouse (PRD-002)
- Room measurements drive 3D model accuracy
- Property orientation affects lighting simulation
- Structural constraints displayed as overlays

### With Gemini AI (PRD-003)
- Context injection for all prompts
- Document analysis via Gemini Vision
- Fallback estimation when scraping fails

### With Image Generation (PRD-004)
- Room dimensions ensure accurate renders
- Style preferences guide aesthetic
- Constraint awareness prevents impossible designs

### With Project Management (PRD-006)
- Property data feeds timeline planning
- Permit status affects milestone dates
- Budget tied to property valuation

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Context Completeness | >80% fields populated | Automated score |
| Data Accuracy | >95% correct after verification | User corrections |
| Fetch Time | <30 seconds for address lookup | API latency |
| Document Processing | <60 seconds per document | Processing time |
| User Corrections | <5 per property | Manual edits logged |

---

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Firecrawl API | External | Required |
| Gemini Vision | External | Implemented |
| Google Maps API | External | Optional |
| Walk Score API | External | Optional |
| Zustand Store | Internal | Implemented |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scraping blocked | Data gaps | Multiple sources, Gemini fallback |
| Inaccurate extraction | Bad AI outputs | User verification, confidence scores |
| Large documents | Slow processing | Chunked processing, progress UI |
| Token limits | Truncated context | Smart context selection, summarization |

---

## Future Enhancements

1. **AR Measurement Capture** - Use device camera to capture room measurements
2. **MLS Integration** - Direct API access to listing data
3. **Permit API** - Real-time permit status from municipalities
4. **3D Scan Import** - Matterport/similar scan integration
5. **Contractor Network** - Verified property data from licensed contractors

---

*Document maintained by RemodelVision Team*
