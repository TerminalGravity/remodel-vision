# PRD-005: Source Document Processing

**Version:** 1.0.0
**Status:** Draft
**Created:** 2025-12-08
**Owner:** Jack Felke
**Domain:** Data Ingestion
**Priority:** P1 (Core Feature)

---

## Overview

Source Document Processing is the intelligent data extraction layer that transforms user-provided documents, web pages, and files into structured PropertyContext data. Using Firecrawl for web scraping and Gemini AI for document analysis, the system "farms" property context from multiple sources to build comprehensive, accurate project data.

### Core Principle

> "Use crawlers & scrapers (Firecrawl API) techniques overridden by parsing uploaded source documents via AI Workflows and use case specific agents to farm as much context from the property context sources ad nauseam for all the tasks, spawning clean accurate data structures."

---

## Document Types & Sources

### Supported Input Types

| Category | File Types | Extraction Targets |
|----------|-----------|-------------------|
| **Floor Plans** | PDF, PNG, JPG, DWG | Room dimensions, layout, room count |
| **Blueprints** | PDF, DWG, DXF | Structural details, MEP systems |
| **Photos** | JPG, PNG, HEIC | Room identification, conditions, features |
| **Listing Documents** | PDF, HTML | Property details, descriptions, pricing |
| **Inspection Reports** | PDF | Condition assessments, issues, recommendations |
| **Permits** | PDF | Scope of work, contractor info, dates |
| **Appraisals** | PDF | Valuations, comparables, features |
| **Material Specs** | PDF, CSV | Products, SKUs, quantities, pricing |
| **Web Pages** | URL | Property listings, product pages |

### Source Priority Hierarchy

```
User-Verified Data (highest priority)
        │
        ▼
Uploaded Documents (floor plans, photos)
        │
        ▼
AI-Extracted from Documents
        │
        ▼
Web-Scraped Data (Firecrawl)
        │
        ▼
AI-Estimated Data (lowest priority)
```

---

## Functional Requirements

### FR-001: Firecrawl Web Scraping Integration

**Description:** Automatically extract property data from real estate websites given an address.

**Supported Sources:**

| Source | Data Extracted | Method |
|--------|---------------|--------|
| Zillow | Lot size, beds/baths, year built, Zestimate | Firecrawl extract |
| Redfin | Photos, floor plans, history | Firecrawl crawl |
| Realtor.com | MLS data, features, descriptions | Firecrawl extract |
| County Assessor | Tax records, zoning, permits | Firecrawl crawl |
| Google Maps | Lat/lng, street view, orientation | API |
| Walk Score | Walk/transit/bike scores | API |

**Implementation:**

```typescript
// services/firecrawlService.ts

import Firecrawl from '@mendable/firecrawl-js';

const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

interface ScrapingResult {
  source: string;
  success: boolean;
  data: Partial<PropertyContext>;
  confidence: number;
  timestamp: number;
  rawHtml?: string;
}

async function scrapePropertyData(address: string): Promise<ScrapingResult[]> {
  const sources = [
    { name: 'zillow', url: buildZillowUrl(address) },
    { name: 'redfin', url: buildRedfinUrl(address) },
    { name: 'county', url: buildCountyUrl(address) },
  ];

  const results = await Promise.allSettled(
    sources.map(async (source) => {
      try {
        const response = await firecrawl.scrapeUrl(source.url, {
          formats: ['extract', 'markdown'],
          extract: {
            schema: getSchemaForSource(source.name),
            prompt: getPromptForSource(source.name),
          },
          timeout: 30000,
        });

        return {
          source: source.name,
          success: true,
          data: normalizeExtractedData(source.name, response.extract),
          confidence: calculateConfidence(response),
          timestamp: Date.now(),
        };
      } catch (error) {
        return {
          source: source.name,
          success: false,
          data: {},
          confidence: 0,
          timestamp: Date.now(),
          error: error.message,
        };
      }
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<ScrapingResult> => r.status === 'fulfilled')
    .map(r => r.value);
}

function getSchemaForSource(source: string): object {
  const schemas: Record<string, object> = {
    zillow: {
      address: 'string',
      price: 'number',
      bedrooms: 'number',
      bathrooms: 'number',
      squareFeet: 'number',
      lotSize: 'string',
      yearBuilt: 'number',
      propertyType: 'string',
      zestimate: 'number',
      photos: 'array',
      description: 'string',
    },
    redfin: {
      address: 'string',
      price: 'number',
      bedrooms: 'number',
      bathrooms: 'number',
      squareFeet: 'number',
      lotSize: 'string',
      yearBuilt: 'number',
      features: 'array',
      floorPlan: 'string',
      virtualTour: 'string',
      priceHistory: 'array',
    },
    county: {
      parcelNumber: 'string',
      ownerName: 'string',
      assessedValue: 'number',
      taxAmount: 'number',
      zoning: 'string',
      lotSize: 'string',
      yearBuilt: 'number',
      permits: 'array',
    },
  };

  return schemas[source] || {};
}
```

**Firecrawl Crawl for Deep Extraction:**

```typescript
async function deepCrawlProperty(address: string): Promise<DeepCrawlResult> {
  // Find the listing URL first
  const searchResult = await firecrawl.scrapeUrl(
    `https://www.zillow.com/homes/${encodeURIComponent(address)}_rb/`,
    { formats: ['links'] }
  );

  const listingUrl = findListingLink(searchResult.links);
  if (!listingUrl) throw new Error('Listing not found');

  // Deep crawl the listing and related pages
  const crawlResult = await firecrawl.crawlUrl(listingUrl, {
    limit: 10,
    scrapeOptions: {
      formats: ['extract', 'markdown'],
      extract: {
        schema: {
          rooms: 'array',
          features: 'array',
          photos: 'array',
          floorPlan: 'object',
          priceHistory: 'array',
          taxHistory: 'array',
          neighborhood: 'object',
        },
      },
    },
  });

  return processDeepCrawl(crawlResult);
}
```

**Acceptance Criteria:**
- [ ] Address input → property data within 30 seconds
- [ ] Multiple sources queried in parallel
- [ ] Data merged with conflict resolution
- [ ] Confidence scores for each field
- [ ] Fallback to AI estimation if scraping fails

---

### FR-002: Document Upload & Analysis Pipeline

**Description:** Process uploaded documents to extract structured property data.

**Pipeline Architecture:**

```
Upload ──▶ Type Detection ──▶ Preprocessing ──▶ AI Extraction ──▶ Validation ──▶ Merge
   │            │                  │                 │              │           │
   │            │                  │                 │              │           │
   ▼            ▼                  ▼                 ▼              ▼           ▼
File      Classify by          Optimize for      Gemini Pro     User        PropertyContext
Buffer    content/format       AI processing     Vision API    Review       Update
```

**Implementation:**

```typescript
// services/documentProcessor.ts

interface DocumentProcessingResult {
  documentId: string;
  type: DocumentType;
  extractedData: Partial<PropertyContext>;
  confidence: Record<string, number>;
  rawText?: string;
  annotations: Annotation[];
  processingTime: number;
  requiresReview: boolean;
}

type DocumentType =
  | 'floor-plan'
  | 'blueprint'
  | 'room-photo'
  | 'listing-pdf'
  | 'inspection-report'
  | 'permit'
  | 'appraisal'
  | 'material-spec'
  | 'unknown';

async function processDocument(
  file: File,
  existingContext?: PropertyContext
): Promise<DocumentProcessingResult> {
  const startTime = Date.now();
  const documentId = generateId();

  // Step 1: Detect document type
  const type = await detectDocumentType(file);

  // Step 2: Preprocess based on type
  const processed = await preprocessDocument(file, type);

  // Step 3: Extract data using appropriate agent
  const extraction = await extractWithAgent(processed, type, existingContext);

  // Step 4: Validate extracted data
  const validation = await validateExtraction(extraction, type);

  return {
    documentId,
    type,
    extractedData: extraction.data,
    confidence: extraction.confidence,
    rawText: extraction.text,
    annotations: extraction.annotations,
    processingTime: Date.now() - startTime,
    requiresReview: validation.hasLowConfidenceFields,
  };
}

async function detectDocumentType(file: File): Promise<DocumentType> {
  // Check file extension first
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'dwg' || ext === 'dxf') return 'blueprint';

  // For PDFs and images, use AI classification
  const base64 = await fileToBase64(file);
  const prompt = `
Classify this document into one of these categories:
- floor-plan: Architectural floor plan showing room layout
- blueprint: Technical construction drawing
- room-photo: Photograph of a room interior
- listing-pdf: Real estate listing document
- inspection-report: Home inspection report
- permit: Building permit or application
- appraisal: Property appraisal document
- material-spec: Material or product specification sheet
- unknown: Cannot determine

Respond with just the category name.
`;

  const response = await gemini.analyzeImage(base64, prompt);
  return response.trim() as DocumentType;
}
```

**Type-Specific Extraction Agents:**

```typescript
// services/extractionAgents.ts

interface ExtractionAgent {
  type: DocumentType;
  extract: (doc: ProcessedDocument, context?: PropertyContext) => Promise<ExtractionResult>;
}

const EXTRACTION_AGENTS: Record<DocumentType, ExtractionAgent> = {
  'floor-plan': {
    type: 'floor-plan',
    extract: async (doc, context) => {
      const prompt = `
Analyze this floor plan and extract:

1. ROOMS
   For each room visible:
   - Name/type (kitchen, bedroom, bathroom, etc.)
   - Dimensions if labeled (format: W'xL')
   - Estimated square footage
   - Floor level (1st, 2nd, basement)

2. FEATURES
   - Windows (location on wall, size if shown)
   - Doors (interior/exterior, swing direction)
   - Closets and built-ins
   - Stairs (location, direction)

3. LAYOUT
   - Which rooms connect to which
   - Main entry location
   - Traffic flow patterns

4. SCALE
   - Any scale indicator
   - Reference dimensions for calibration

${context ? `
EXISTING CONTEXT (validate against):
${JSON.stringify(context.rooms, null, 2)}
` : ''}

Output as structured JSON matching RoomContext[] schema.
`;

      return executeExtraction(doc, prompt);
    },
  },

  'room-photo': {
    type: 'room-photo',
    extract: async (doc, context) => {
      const prompt = `
Analyze this room photograph for remodeling context:

1. ROOM IDENTIFICATION
   - Room type (kitchen, bathroom, bedroom, etc.)
   - Approximate dimensions (estimate based on standard references)

2. CURRENT STATE
   - Overall condition (excellent/good/fair/poor)
   - Flooring type and condition
   - Wall treatment (paint color, wallpaper, tile)
   - Ceiling type and condition

3. FEATURES
   - Windows (count, style, condition)
   - Doors (style, hardware)
   - Lighting fixtures
   - Cabinetry (if applicable)
   - Countertops (if applicable)
   - Plumbing fixtures (if applicable)

4. REMODEL CONSIDERATIONS
   - Potential constraints visible
   - Items that appear dated
   - Natural light quality
   - Space utilization

Output as RoomContext JSON with currentState populated.
`;

      return executeExtraction(doc, prompt);
    },
  },

  'inspection-report': {
    type: 'inspection-report',
    extract: async (doc, context) => {
      const prompt = `
Extract key information from this home inspection report:

1. PROPERTY INFO
   - Address
   - Inspection date
   - Inspector name/company

2. SYSTEMS ASSESSMENT
   For each system (HVAC, Electrical, Plumbing, Roof, Foundation):
   - Current condition
   - Age if mentioned
   - Issues identified
   - Recommendations

3. ROOM-BY-ROOM NOTES
   - Any room-specific observations
   - Measurements if provided

4. PRIORITY ISSUES
   - Safety concerns
   - Items needing immediate attention
   - Deferred maintenance items

5. COST ESTIMATES
   - Any repair cost estimates mentioned

Output as structured JSON with systems and issues arrays.
`;

      return executeExtraction(doc, prompt);
    },
  },

  // ... additional agents for each document type
};
```

**Acceptance Criteria:**
- [ ] All listed document types processed correctly
- [ ] Extraction accuracy >90% for labeled data
- [ ] Processing time <60 seconds per document
- [ ] User review interface for low-confidence fields
- [ ] Version tracking for uploaded documents

---

### FR-003: OCR & Text Extraction

**Description:** Extract text from scanned documents and images for processing.

**OCR Pipeline:**

```typescript
// services/ocrService.ts

interface OCRResult {
  text: string;
  blocks: TextBlock[];
  confidence: number;
  language: string;
  tables: Table[];
}

interface TextBlock {
  text: string;
  boundingBox: BoundingBox;
  confidence: number;
  type: 'paragraph' | 'heading' | 'list' | 'table-cell';
}

async function performOCR(image: string): Promise<OCRResult> {
  // Use Gemini Vision for OCR
  const prompt = `
Perform OCR on this document image.

Extract ALL text visible, maintaining:
1. Spatial relationships (headings, paragraphs, lists)
2. Table structures (rows and columns)
3. Numeric data with units
4. Labels and annotations

For each text block, note:
- The text content
- Approximate bounding box (top, left, width, height as percentages)
- Text type (heading, paragraph, list item, table cell)
- Confidence level

Special attention to:
- Measurements (feet, inches, square feet)
- Prices and costs
- Dates
- Technical specifications

Output as structured JSON.
`;

  const response = await gemini.analyzeImage(image, prompt);
  return parseOCRResponse(response);
}

async function extractTablesFromDocument(pdf: Buffer): Promise<Table[]> {
  // Convert PDF pages to images
  const pages = await pdfToImages(pdf);

  // Extract tables from each page
  const tables: Table[] = [];
  for (const page of pages) {
    const pageOCR = await performOCR(page);
    tables.push(...pageOCR.tables);
  }

  return tables;
}
```

**Acceptance Criteria:**
- [ ] Text extraction accuracy >95% for clear documents
- [ ] Table structure preservation
- [ ] Measurement and number extraction
- [ ] Multi-page PDF support
- [ ] Handwritten text basic support

---

### FR-004: Data Merging & Conflict Resolution

**Description:** Combine data from multiple sources with intelligent conflict resolution.

**Merge Strategy:**

```typescript
// services/dataMerger.ts

interface MergeResult {
  merged: PropertyContext;
  conflicts: DataConflict[];
  sources: SourceAttribution[];
}

interface DataConflict {
  field: string;
  values: { value: any; source: string; confidence: number }[];
  resolution: 'auto' | 'user-required';
  resolved?: any;
}

interface SourceAttribution {
  field: string;
  source: string;
  confidence: number;
  timestamp: number;
}

function mergePropertyData(
  existing: PropertyContext | null,
  newData: Partial<PropertyContext>[],
  sources: string[]
): MergeResult {
  const conflicts: DataConflict[] = [];
  const attributions: SourceAttribution[] = [];

  // Priority order for automatic resolution
  const sourcePriority: Record<string, number> = {
    'user-verified': 100,
    'uploaded-document': 80,
    'ai-extracted': 60,
    'web-scraped': 40,
    'ai-estimated': 20,
  };

  // Merge each field
  const merged: PropertyContext = existing ? { ...existing } : createEmptyContext();

  for (const [idx, data] of newData.entries()) {
    const source = sources[idx];
    const priority = sourcePriority[getSourceType(source)] || 0;

    for (const [field, value] of Object.entries(data)) {
      if (value === undefined || value === null) continue;

      const existingValue = getNestedValue(merged, field);
      const existingAttribution = attributions.find(a => a.field === field);

      if (existingValue === undefined) {
        // No existing value, just set
        setNestedValue(merged, field, value);
        attributions.push({
          field,
          source,
          confidence: data.confidence?.[field] || 0.5,
          timestamp: Date.now(),
        });
      } else if (!deepEqual(existingValue, value)) {
        // Conflict detected
        const existingPriority = sourcePriority[getSourceType(existingAttribution?.source || '')] || 0;

        if (priority > existingPriority) {
          // New source has higher priority, auto-resolve
          setNestedValue(merged, field, value);
          attributions.push({
            field,
            source,
            confidence: data.confidence?.[field] || 0.5,
            timestamp: Date.now(),
          });
        } else if (priority === existingPriority) {
          // Same priority, needs user resolution
          conflicts.push({
            field,
            values: [
              { value: existingValue, source: existingAttribution?.source || 'unknown', confidence: existingAttribution?.confidence || 0 },
              { value, source, confidence: data.confidence?.[field] || 0.5 },
            ],
            resolution: 'user-required',
          });
        }
        // If new source has lower priority, ignore
      }
    }
  }

  return { merged, conflicts, sources: attributions };
}
```

**Conflict Resolution UI:**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ⚠️ DATA CONFLICTS DETECTED                                                 │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  Property: 123 Main Street                                                  │
│  Sources: Zillow, Uploaded Floor Plan, User Input                          │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ Field: Square Footage                                                 │ │
│  │                                                                       │ │
│  │   ○ 2,150 sqft  (Zillow - 40% confidence)                            │ │
│  │   ● 2,245 sqft  (Floor Plan - 85% confidence) ✓ RECOMMENDED          │ │
│  │   ○ Custom value: [________]                                         │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ Field: Year Built                                                     │ │
│  │                                                                       │ │
│  │   ● 1985  (Zillow - 95% confidence) ✓ RECOMMENDED                    │ │
│  │   ○ 1984  (County Records - 90% confidence)                          │ │
│  │   ○ Custom value: [________]                                         │ │
│  │                                                                       │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  [Accept Recommendations] [Review All] [Skip for Now]                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Priority-based auto-resolution works correctly
- [ ] Conflicts clearly presented to user
- [ ] User can override any resolved value
- [ ] Source attribution tracked for all fields
- [ ] Merge history maintained

---

### FR-005: AI Workflow Agents

**Description:** Specialized AI agents for domain-specific data extraction tasks.

**Agent Architecture:**

```typescript
// services/workflowAgents.ts

interface WorkflowAgent {
  id: string;
  name: string;
  description: string;
  inputTypes: DocumentType[];
  outputSchema: object;
  execute: (input: AgentInput) => Promise<AgentOutput>;
}

const WORKFLOW_AGENTS: WorkflowAgent[] = [
  {
    id: 'measurement-extractor',
    name: 'Measurement Extraction Agent',
    description: 'Extracts precise measurements from floor plans and blueprints',
    inputTypes: ['floor-plan', 'blueprint'],
    outputSchema: MeasurementSetSchema,
    execute: async (input) => {
      const prompt = `
You are a precise measurement extraction agent.

Analyze this ${input.documentType} and extract ALL measurements:

1. ROOM DIMENSIONS
   - Length and width for each room
   - Convert all to feet (if shown in meters or inches)
   - Note which measurements are labeled vs estimated

2. FEATURES
   - Window sizes (width x height)
   - Door widths
   - Closet dimensions
   - Counter/island sizes

3. HEIGHTS
   - Ceiling heights if noted
   - Counter heights
   - Window sill heights

4. CLEARANCES
   - Walkway widths
   - Distances between elements

For each measurement, provide:
- Value (in feet and inches)
- Location/description
- Confidence (labeled: 100%, scaled: 80%, estimated: 50%)

Output as MeasurementSet JSON.
`;

      return executeAgent(input, prompt);
    },
  },

  {
    id: 'cost-estimator',
    name: 'Renovation Cost Estimation Agent',
    description: 'Estimates renovation costs from scope documents',
    inputTypes: ['permit', 'material-spec', 'appraisal'],
    outputSchema: CostEstimateSchema,
    execute: async (input) => {
      const prompt = `
You are a renovation cost estimation agent.

Analyze this document and extract/estimate costs:

1. ITEMIZED COSTS
   - Materials (with quantities and unit costs)
   - Labor estimates
   - Permits and fees

2. COST CATEGORIES
   - Demolition
   - Structural
   - Electrical
   - Plumbing
   - HVAC
   - Finishes
   - Fixtures

3. TOTALS
   - Subtotals by category
   - Contingency recommendations
   - Overall estimate range

Consider regional pricing for: ${input.context?.location || 'United States average'}
Budget tier: ${input.context?.budget || 'standard'}

Output as CostEstimate JSON.
`;

      return executeAgent(input, prompt);
    },
  },

  {
    id: 'product-identifier',
    name: 'Product Identification Agent',
    description: 'Identifies specific products from photos and spec sheets',
    inputTypes: ['room-photo', 'material-spec'],
    outputSchema: ProductReferenceSchema,
    execute: async (input) => {
      const prompt = `
You are a product identification agent for interior design.

Analyze this image/document and identify products:

1. FURNITURE
   - Identify brand and model if recognizable
   - Describe style and materials
   - Estimate dimensions

2. FIXTURES
   - Lighting (pendants, chandeliers, sconces)
   - Plumbing (faucets, sinks, toilets)
   - Hardware (cabinet pulls, door handles)

3. FINISHES
   - Flooring type and pattern
   - Countertop material
   - Tile patterns and sizes
   - Paint colors (estimate)

4. DECOR
   - Art and accessories
   - Textiles (rugs, curtains, pillows)

For each product, provide:
- Name/description
- Brand if identifiable
- Approximate price range
- Where to purchase (if known)

Output as ProductReference[] JSON.
`;

      return executeAgent(input, prompt);
    },
  },
];

async function executeAgentPipeline(
  document: ProcessedDocument,
  context: PropertyContext
): Promise<AgentPipelineResult> {
  // Determine which agents are applicable
  const applicableAgents = WORKFLOW_AGENTS.filter(
    agent => agent.inputTypes.includes(document.type)
  );

  // Execute agents in parallel
  const results = await Promise.all(
    applicableAgents.map(agent =>
      agent.execute({ document, context, documentType: document.type })
    )
  );

  // Merge agent outputs
  return mergeAgentResults(results);
}
```

**Acceptance Criteria:**
- [ ] Agents correctly matched to document types
- [ ] Parallel execution for efficiency
- [ ] Results properly merged
- [ ] Agent errors don't crash pipeline
- [ ] Clear output attribution per agent

---

## User Interface

### Document Upload Panel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📎 DOCUMENT CENTER                                                         │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │            📄 Drop files here or click to upload                    │   │
│  │                                                                     │   │
│  │     Floor plans • Photos • PDFs • Permits • Specs                  │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Or paste a URL: [https://zillow.com/...                        ] [Fetch]  │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  UPLOADED DOCUMENTS                                                         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📐 floor-plan-main.pdf            ✓ Processed                       │   │
│  │    Extracted: 6 rooms, 12 measurements                              │   │
│  │    [View] [Re-analyze] [Delete]                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📷 kitchen-photo.jpg              ⚠️ Needs Review                    │   │
│  │    Extracted: Kitchen details, low confidence on dimensions         │   │
│  │    [Review] [Re-analyze] [Delete]                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 🔗 zillow.com/homedetails/...     ⏳ Processing...                  │   │
│  │    Scraping property data...                                        │   │
│  │    [████████░░░░░░░░░░] 65%                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Extraction Review Interface

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  👁️ REVIEW EXTRACTION: kitchen-photo.jpg                                    │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐    │
│  │                              │  │                                  │    │
│  │   [ORIGINAL PHOTO]           │  │  EXTRACTED DATA                  │    │
│  │                              │  │                                  │    │
│  │   Kitchen interior           │  │  Room Type: Kitchen ✓            │    │
│  │   showing cabinets,          │  │                                  │    │
│  │   island, appliances         │  │  Dimensions:                     │    │
│  │                              │  │  Width:  [12'] ⚠️ Low confidence │    │
│  │   [Click to annotate]        │  │  Length: [14'] ⚠️ Low confidence │    │
│  │                              │  │  Height: [9']  ✓ Standard        │    │
│  │                              │  │                                  │    │
│  │                              │  │  Condition: Good ✓               │    │
│  │                              │  │                                  │    │
│  │                              │  │  Features:                       │    │
│  │                              │  │  ☑ Island (60" x 48")           │    │
│  │                              │  │  ☑ White shaker cabinets        │    │
│  │                              │  │  ☑ Quartz countertops           │    │
│  │                              │  │  ☑ Pendant lighting (3)         │    │
│  │                              │  │  ☑ Stainless appliances         │    │
│  │                              │  │                                  │    │
│  └──────────────────────────────┘  └──────────────────────────────────┘    │
│                                                                             │
│  [Confirm All] [Edit & Confirm] [Re-analyze with Notes] [Discard]          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Integration Points

### With Property Context (PRD-001)
- Extracted data populates PropertyContext
- Merge with existing context data
- Source attribution tracking

### With Gemini AI (PRD-003)
- Document analysis via Vision API
- OCR and extraction prompts
- Confidence scoring

### With 3D Dollhouse (PRD-002)
- Floor plan measurements → geometry
- Room photos → condition documentation
- Product identification → model suggestions

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Extraction Accuracy** | >90% for labeled data | Manual validation |
| **Processing Time** | <60 seconds per document | API timing |
| **User Correction Rate** | <20% of fields | Edit tracking |
| **Source Coverage** | 80%+ of property fields | Completeness check |
| **Conflict Resolution** | 90%+ auto-resolved | Conflict tracking |

---

## Security & Privacy

| Concern | Mitigation |
|---------|------------|
| Uploaded documents | Processed and discarded, not stored long-term |
| PII in documents | Redacted before external API calls |
| API keys | Environment variables, not in code |
| Scraped data | Respect robots.txt, rate limits |

---

*Document maintained by RemodelVision Team*
