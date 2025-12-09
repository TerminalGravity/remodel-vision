# PRD-008: Data Structures & Schema

**Version:** 1.0.0
**Status:** Draft
**Created:** 2025-12-08
**Owner:** Jack Felke
**Domain:** Data Architecture
**Priority:** P0 (Critical Path)

---

## Overview

This document defines the complete data architecture for RemodelVision—clean, accurate data structures that enable precise AI outputs and seamless cross-feature integration. Every schema is designed to be the single source of truth for its domain.

### Core Principle

> "Spawning clean accurate data structures is critical for clarity in any of my user interaction."

---

## Core Schemas

### 1. PropertyContext (Master Property Schema)

```typescript
// types/property.ts

/**
 * Complete property context - the master data structure for a property.
 * All AI interactions reference this for accurate, contextual outputs.
 */
interface PropertyContext {
  // ═══════════════════════════════════════════════════════════════
  // IDENTITY
  // ═══════════════════════════════════════════════════════════════
  id: string;                    // Unique identifier (UUID)
  version: number;               // Schema version for migrations
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp

  // ═══════════════════════════════════════════════════════════════
  // ADDRESS
  // ═══════════════════════════════════════════════════════════════
  address: {
    street: string;              // "123 Main Street"
    unit?: string;               // "Apt 4B" (if applicable)
    city: string;                // "Austin"
    state: string;               // "TX" (2-letter code)
    zip: string;                 // "78701" or "78701-1234"
    county: string;              // "Travis County"
    country: string;             // "US" (ISO 3166-1 alpha-2)
    formatted: string;           // Full formatted address
  };

  // ═══════════════════════════════════════════════════════════════
  // GEOSPATIAL
  // ═══════════════════════════════════════════════════════════════
  location: {
    lat: number;                 // Latitude (decimal degrees)
    lng: number;                 // Longitude (decimal degrees)
    elevation: number;           // Feet above sea level
    orientation: Orientation;    // Primary facing direction
    climate: ClimateZone;        // IECC climate zone
    timezone: string;            // "America/Chicago"
    sunPath: SunPathData;        // Solar position data
  };

  // ═══════════════════════════════════════════════════════════════
  // PROPERTY DETAILS
  // ═══════════════════════════════════════════════════════════════
  details: {
    propertyType: PropertyType;
    yearBuilt: number;
    yearRenovated?: number;
    stories: number;

    // Area measurements
    lotSize: AreaMeasurement;
    livingArea: AreaMeasurement;
    finishedArea: AreaMeasurement;
    unfinishedArea?: AreaMeasurement;

    // Room counts
    bedrooms: number;
    bathrooms: number;           // Full + half (e.g., 2.5)
    fullBathrooms: number;
    halfBathrooms: number;

    // Structures
    garage: GarageInfo | null;
    basement: BasementInfo | null;
    attic: AtticInfo | null;
    pool: PoolInfo | null;
    deck: DeckInfo | null;
    patio: PatioInfo | null;

    // Systems
    hvac: HVACSystem;
    electrical: ElectricalSystem;
    plumbing: PlumbingSystem;

    // Construction
    construction: ConstructionDetails;
    roof: RoofDetails;
    foundation: FoundationType;
    exterior: ExteriorDetails;
  };

  // ═══════════════════════════════════════════════════════════════
  // REGULATORY
  // ═══════════════════════════════════════════════════════════════
  regulatory: {
    zoning: string;              // "SF-1", "R-1", etc.
    zoningDescription: string;
    parcelNumber: string;
    legalDescription?: string;

    hoa: HOAInfo | null;
    historicDistrict: boolean;
    floodZone: FloodZoneInfo;
    easements: Easement[];

    setbacks: {
      front: number;             // Feet
      back: number;
      left: number;
      right: number;
    };

    permits: PermitRecord[];
    restrictions: string[];
  };

  // ═══════════════════════════════════════════════════════════════
  // VALUATION
  // ═══════════════════════════════════════════════════════════════
  valuation: {
    assessed: number;            // County assessed value
    marketEstimate: number;      // AI/Zestimate
    taxAnnual: number;

    lastSale?: {
      price: number;
      date: string;              // ISO 8601
      buyer?: string;
      seller?: string;
    };

    priceHistory: PriceHistoryEntry[];
    comparables: ComparableProperty[];
  };

  // ═══════════════════════════════════════════════════════════════
  // NEIGHBORHOOD
  // ═══════════════════════════════════════════════════════════════
  neighborhood: {
    walkScore: number;           // 0-100
    transitScore: number;        // 0-100
    bikeScore: number;           // 0-100

    schoolDistrict: string;
    schools: SchoolInfo[];

    crimeIndex?: number;         // Relative score
    noiseLevel: 'quiet' | 'moderate' | 'busy';

    nearbyAmenities: Amenity[];
    demographics?: DemographicData;
  };

  // ═══════════════════════════════════════════════════════════════
  // ROOMS (Detailed)
  // ═══════════════════════════════════════════════════════════════
  rooms: RoomContext[];

  // ═══════════════════════════════════════════════════════════════
  // SOURCES & METADATA
  // ═══════════════════════════════════════════════════════════════
  sources: SourceDocument[];

  metadata: {
    completeness: number;        // 0-100 percentage
    dataQuality: DataQualityLevel;
    lastVerified?: string;       // ISO 8601
    verifiedBy?: string;
    confidence: Record<string, number>;  // Per-field confidence
  };
}

// ═══════════════════════════════════════════════════════════════
// SUPPORTING TYPES
// ═══════════════════════════════════════════════════════════════

type Orientation = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

type ClimateZone =
  | '1A' | '1B'           // Very Hot
  | '2A' | '2B'           // Hot
  | '3A' | '3B' | '3C'    // Warm
  | '4A' | '4B' | '4C'    // Mixed
  | '5A' | '5B' | '5C'    // Cool
  | '6A' | '6B'           // Cold
  | '7' | '8';            // Very Cold

type PropertyType =
  | 'single-family'
  | 'condo'
  | 'townhouse'
  | 'multi-family'
  | 'manufactured'
  | 'commercial'
  | 'land';

type DataQualityLevel =
  | 'estimated'    // AI-estimated, lowest confidence
  | 'scraped'      // Web-scraped, medium confidence
  | 'documented'   // From uploaded docs, higher confidence
  | 'verified';    // User-verified, highest confidence

interface AreaMeasurement {
  value: number;
  unit: 'sqft' | 'acres' | 'sqm';
}

interface SunPathData {
  sunrise: { summer: string; winter: string };  // "6:15 AM"
  sunset: { summer: string; winter: string };
  solarNoon: string;
  maxAltitude: { summer: number; winter: number };  // Degrees
}
```

---

### 2. RoomContext (Detailed Room Schema)

```typescript
// types/room.ts

/**
 * Complete context for a single room.
 * Drives 3D geometry generation and AI understanding.
 */
interface RoomContext {
  // ═══════════════════════════════════════════════════════════════
  // IDENTITY
  // ═══════════════════════════════════════════════════════════════
  id: string;
  propertyId: string;            // Parent property
  name: string;                  // User-friendly name
  type: RoomType;
  floor: number;                 // 0 = basement, 1 = ground, etc.
  zone?: string;                 // "Primary Suite", "Guest Wing"

  // ═══════════════════════════════════════════════════════════════
  // MEASUREMENTS
  // ═══════════════════════════════════════════════════════════════
  measurements: MeasurementSet;

  // ═══════════════════════════════════════════════════════════════
  // CURRENT STATE
  // ═══════════════════════════════════════════════════════════════
  currentState: {
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    lastUpdated?: string;        // ISO 8601

    flooring: {
      type: FlooringType;
      material: string;          // "White Oak Hardwood"
      condition: 'excellent' | 'good' | 'fair' | 'poor';
    };

    walls: {
      type: 'drywall' | 'plaster' | 'paneling' | 'tile' | 'other';
      finish: string;            // "Painted - Benjamin Moore OC-17"
      condition: 'excellent' | 'good' | 'fair' | 'poor';
    };

    ceiling: {
      type: 'flat' | 'tray' | 'coffered' | 'vaulted' | 'cathedral' | 'beamed';
      height: Measurement;
      finish: string;
    };

    lighting: LightingFixture[];
    photos: RoomPhoto[];
  };

  // ═══════════════════════════════════════════════════════════════
  // FEATURES
  // ═══════════════════════════════════════════════════════════════
  features: {
    windows: WindowFeature[];
    doors: DoorFeature[];
    builtIns: BuiltInFeature[];
    fixtures: FixtureFeature[];      // Plumbing, electrical
    appliances: ApplianceFeature[];  // Kitchen/laundry
  };

  // ═══════════════════════════════════════════════════════════════
  // CONNECTIONS
  // ═══════════════════════════════════════════════════════════════
  connections: {
    adjacentRooms: RoomConnection[];
    externalAccess?: ExternalAccess[];  // Doors to outside
  };

  // ═══════════════════════════════════════════════════════════════
  // CONSTRAINTS
  // ═══════════════════════════════════════════════════════════════
  constraints: {
    structural: StructuralConstraint[];
    mechanical: MechanicalConstraint[];
    regulatory: RegulatoryConstraint[];
    other: string[];
  };

  // ═══════════════════════════════════════════════════════════════
  // REMODEL SCOPE
  // ═══════════════════════════════════════════════════════════════
  remodelScope: {
    included: boolean;
    priority: 'high' | 'medium' | 'low';
    targetStyle?: string;
    estimatedBudget?: number;
    notes: string;
    wishlist: string[];
    mustHaves: string[];
    avoid: string[];
  };
}

// ═══════════════════════════════════════════════════════════════
// ROOM TYPES
// ═══════════════════════════════════════════════════════════════

type RoomType =
  // Living Spaces
  | 'living-room'
  | 'family-room'
  | 'great-room'
  | 'den'
  | 'office'
  | 'library'

  // Dining
  | 'dining-room'
  | 'breakfast-nook'

  // Kitchen
  | 'kitchen'
  | 'kitchenette'
  | 'pantry'
  | 'butler-pantry'

  // Bedrooms
  | 'primary-bedroom'
  | 'bedroom'
  | 'guest-bedroom'
  | 'nursery'

  // Bathrooms
  | 'primary-bathroom'
  | 'full-bathroom'
  | 'three-quarter-bathroom'
  | 'half-bathroom'
  | 'powder-room'

  // Utility
  | 'laundry'
  | 'mudroom'
  | 'utility-room'
  | 'mechanical-room'

  // Storage
  | 'closet'
  | 'walk-in-closet'
  | 'storage'

  // Circulation
  | 'hallway'
  | 'foyer'
  | 'stairway'
  | 'landing'

  // Garage
  | 'garage'
  | 'carport'

  // Outdoor
  | 'covered-patio'
  | 'sunroom'
  | 'screened-porch'

  // Other
  | 'basement'
  | 'attic'
  | 'bonus-room'
  | 'flex-space'
  | 'other';
```

---

### 3. MeasurementSet (Precise Measurements)

```typescript
// types/measurements.ts

/**
 * Complete measurement data for a room.
 * Precision is critical for accurate 3D generation and material estimation.
 */
interface MeasurementSet {
  roomId: string;
  capturedAt: string;            // ISO 8601
  source: MeasurementSource;

  // ═══════════════════════════════════════════════════════════════
  // PRIMARY DIMENSIONS
  // ═══════════════════════════════════════════════════════════════
  dimensions: {
    // Length is the longer dimension, width is shorter
    length: Measurement;
    width: Measurement;
    height: Measurement;

    // Calculated
    squareFootage: number;
    cubicFootage: number;
    perimeter: number;           // Linear feet
  };

  // ═══════════════════════════════════════════════════════════════
  // WALLS (Detailed per wall)
  // ═══════════════════════════════════════════════════════════════
  walls: WallMeasurement[];

  // ═══════════════════════════════════════════════════════════════
  // OPENINGS
  // ═══════════════════════════════════════════════════════════════
  openings: OpeningMeasurement[];

  // ═══════════════════════════════════════════════════════════════
  // FEATURES
  // ═══════════════════════════════════════════════════════════════
  features: FeatureMeasurement[];

  // ═══════════════════════════════════════════════════════════════
  // CLEARANCES (Important for layout)
  // ═══════════════════════════════════════════════════════════════
  clearances: ClearanceMeasurement[];
}

interface Measurement {
  value: number;
  unit: 'ft' | 'in' | 'm' | 'cm';
  precision: 'exact' | 'approximate' | 'estimated';
  source: MeasurementSource;
  confidence: number;            // 0-1

  // Display helpers
  feet?: number;                 // Whole feet
  inches?: number;               // Remaining inches
  display?: string;              // "12' 6\""
}

type MeasurementSource =
  | 'user-input'
  | 'floor-plan'
  | 'blueprint'
  | 'photo-estimate'
  | 'ai-estimate'
  | 'lidar-scan'
  | 'matterport';

interface WallMeasurement {
  id: string;
  name: string;                  // "North Wall", "Wall A"
  direction: Orientation;
  length: Measurement;
  height: Measurement;

  // Features on this wall
  openings: string[];            // Opening IDs
  features: string[];            // Feature IDs

  // Construction
  isExterior: boolean;
  isLoadBearing: boolean;
  thickness?: Measurement;
}

interface OpeningMeasurement {
  id: string;
  type: 'window' | 'door' | 'archway' | 'pass-through' | 'pocket-door' | 'slider';
  wallId: string;

  // Position on wall
  position: {
    fromLeft: Measurement;       // Distance from left edge of wall
    fromFloor: Measurement;      // Sill/threshold height
  };

  // Size
  width: Measurement;
  height: Measurement;

  // Additional
  swingDirection?: 'in' | 'out' | 'left' | 'right' | 'bi-fold' | 'slide';
  connectsTo?: string;           // Room ID or "exterior"
}

interface FeatureMeasurement {
  id: string;
  type: FeatureType;
  name: string;

  // Position
  position: {
    x: Measurement;              // From origin (typically SW corner)
    y: Measurement;
    z?: Measurement;             // Height from floor
  };

  // Size
  dimensions: {
    width: Measurement;
    depth: Measurement;
    height: Measurement;
  };

  // Metadata
  material?: string;
  brand?: string;
  model?: string;
}

type FeatureType =
  | 'island'
  | 'peninsula'
  | 'counter'
  | 'cabinet-upper'
  | 'cabinet-lower'
  | 'closet'
  | 'fireplace'
  | 'built-in-shelves'
  | 'niche'
  | 'bump-out'
  | 'column'
  | 'beam'
  | 'stairs'
  | 'shower'
  | 'tub'
  | 'vanity'
  | 'toilet'
  | 'other';

interface ClearanceMeasurement {
  name: string;                  // "Island to counter", "Door swing"
  between: [string, string];     // Feature/wall IDs
  distance: Measurement;
  minimumRequired?: Measurement; // Code requirement
  isAdequate: boolean;
}
```

---

### 4. ProjectConfig (User Preferences)

```typescript
// types/project.ts

/**
 * Project configuration and user preferences.
 * Guides all AI-generated content and suggestions.
 */
interface ProjectConfig {
  id: string;
  propertyId: string;
  name: string;

  // ═══════════════════════════════════════════════════════════════
  // CLIENT INFO
  // ═══════════════════════════════════════════════════════════════
  client: {
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
  };

  // ═══════════════════════════════════════════════════════════════
  // STATUS
  // ═══════════════════════════════════════════════════════════════
  status: ProjectStatus;
  phase: ProjectPhase;
  startDate?: string;            // ISO 8601
  targetCompletion?: string;

  // ═══════════════════════════════════════════════════════════════
  // DESIGN PREFERENCES (Design DNA)
  // ═══════════════════════════════════════════════════════════════
  designDNA: {
    primaryStyle: DesignStyle;
    secondaryStyle?: DesignStyle;
    colorTemperature: 'warm' | 'neutral' | 'cool';

    colorPalette?: {
      primary: string[];         // Hex codes
      accent: string[];
      neutral: string[];
    };

    materialPreferences: {
      wood: WoodPreference[];
      stone: StonePreference[];
      metal: MetalFinish[];
      fabric: string[];
    };

    aestheticKeywords: string[]; // "collected", "minimal", "cozy"
    avoidKeywords: string[];     // "industrial", "stark", "ornate"

    inspirationImages: string[]; // URLs or asset IDs
  };

  // ═══════════════════════════════════════════════════════════════
  // BUDGET
  // ═══════════════════════════════════════════════════════════════
  budget: {
    tier: BudgetTier;
    total?: number;
    breakdown?: BudgetBreakdown;
    priorityAreas: string[];     // Room IDs in priority order
    flexibleAreas: string[];
  };

  // ═══════════════════════════════════════════════════════════════
  // SCOPE
  // ═══════════════════════════════════════════════════════════════
  scope: {
    rooms: string[];             // Room IDs in scope
    type: 'cosmetic' | 'renovation' | 'remodel' | 'addition' | 'gut-renovation';
    workTypes: WorkType[];
    excludedWork: WorkType[];
  };

  // ═══════════════════════════════════════════════════════════════
  // CONSTRAINTS
  // ═══════════════════════════════════════════════════════════════
  constraints: {
    timeline: TimelineConstraint;
    occupancy: 'vacant' | 'occupied' | 'partial';
    noise: { restricted: boolean; hours?: string };
    access: string[];            // Access restrictions
    permits: string[];           // Required permits
    hoa: string[];               // HOA requirements
    other: string[];
  };

  // ═══════════════════════════════════════════════════════════════
  // TEAM
  // ═══════════════════════════════════════════════════════════════
  team?: {
    contractor?: ContactInfo;
    designer?: ContactInfo;
    architect?: ContactInfo;
    other: TeamMember[];
  };
}

type ProjectStatus =
  | 'draft'
  | 'planning'
  | 'designing'
  | 'bidding'
  | 'permitting'
  | 'in-progress'
  | 'on-hold'
  | 'completed'
  | 'archived';

type ProjectPhase =
  | 'inspiration'
  | 'space-planning'
  | 'design-development'
  | 'documentation'
  | 'procurement'
  | 'construction'
  | 'install'
  | 'punch-list'
  | 'complete';

type DesignStyle =
  | 'modern'
  | 'contemporary'
  | 'transitional'
  | 'traditional'
  | 'farmhouse'
  | 'industrial'
  | 'scandinavian'
  | 'japandi'
  | 'mid-century'
  | 'coastal'
  | 'mediterranean'
  | 'bohemian'
  | 'minimalist'
  | 'maximalist'
  | 'art-deco'
  | 'craftsman'
  | 'rustic'
  | 'french-country'
  | 'organic-modern';

type BudgetTier =
  | 'economy'      // $50-100/sqft
  | 'standard'     // $100-200/sqft
  | 'premium'      // $200-400/sqft
  | 'luxury';      // $400+/sqft

type WorkType =
  | 'demolition'
  | 'framing'
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'insulation'
  | 'drywall'
  | 'flooring'
  | 'tile'
  | 'cabinetry'
  | 'countertops'
  | 'painting'
  | 'trim'
  | 'fixtures'
  | 'appliances'
  | 'landscaping'
  | 'roofing'
  | 'siding'
  | 'windows'
  | 'doors';
```

---

### 5. DesignVersion (Design History)

```typescript
// types/design.ts

/**
 * A single version/iteration of a design.
 * Enables full design history and comparison.
 */
interface DesignVersion {
  id: string;
  projectId: string;
  roomId: string;

  // ═══════════════════════════════════════════════════════════════
  // VERSION INFO
  // ═══════════════════════════════════════════════════════════════
  version: number;
  name?: string;                 // "Option A", "Final", etc.
  createdAt: string;
  createdBy: 'user' | 'ai' | 'designer';

  // ═══════════════════════════════════════════════════════════════
  // GENERATION CONTEXT
  // ═══════════════════════════════════════════════════════════════
  generation: {
    prompt: string;              // User's original request
    enhancedPrompt?: string;     // AI-enhanced prompt
    viewportCapture?: string;    // Base64 of 3D viewport
    model: string;               // "gemini-3-pro-image-preview"
    duration: number;            // Generation time in ms
  };

  // ═══════════════════════════════════════════════════════════════
  // OUTPUT
  // ═══════════════════════════════════════════════════════════════
  output: {
    image: string;               // Base64 or URL
    thumbnail?: string;
    resolution: { width: number; height: number };
    format: 'png' | 'jpg' | 'webp';
  };

  // ═══════════════════════════════════════════════════════════════
  // SPECIFICATIONS (What's in this design)
  // ═══════════════════════════════════════════════════════════════
  specifications: {
    style: DesignStyle;
    colorPalette: string[];
    materials: MaterialSpec[];
    products: ProductReference[];
    estimatedCost?: CostEstimate;
  };

  // ═══════════════════════════════════════════════════════════════
  // USER FEEDBACK
  // ═══════════════════════════════════════════════════════════════
  feedback: {
    rating?: 1 | 2 | 3 | 4 | 5;
    isFavorite: boolean;
    isApproved: boolean;
    approvedBy?: string;
    approvedAt?: string;
    notes?: string;
    tags: string[];
  };

  // ═══════════════════════════════════════════════════════════════
  // RELATIONSHIPS
  // ═══════════════════════════════════════════════════════════════
  parentVersion?: string;        // Previous iteration
  childVersions: string[];       // Refinements
}

interface MaterialSpec {
  category: 'flooring' | 'countertop' | 'cabinet' | 'backsplash' | 'wall' | 'ceiling' | 'other';
  name: string;
  type: string;                  // "Hardwood", "Quartz", etc.
  color: string;
  finish?: string;
  brand?: string;
  productId?: string;
  estimatedCost?: number;
  unit?: 'sqft' | 'linear-ft' | 'each';
}

interface ProductReference {
  id: string;
  name: string;
  brand: string;
  category: string;
  sku?: string;
  dimensions?: Dimensions;
  price?: number;
  vendor?: string;
  leadTime?: string;
  imageUrl?: string;
  productUrl?: string;
}
```

---

### 6. SourceDocument (Document Tracking)

```typescript
// types/source.ts

/**
 * Tracks uploaded documents and their extracted data.
 */
interface SourceDocument {
  id: string;
  propertyId: string;

  // ═══════════════════════════════════════════════════════════════
  // FILE INFO
  // ═══════════════════════════════════════════════════════════════
  file: {
    name: string;
    type: string;                // MIME type
    size: number;                // Bytes
    extension: string;
    hash: string;                // For deduplication
  };

  // ═══════════════════════════════════════════════════════════════
  // CLASSIFICATION
  // ═══════════════════════════════════════════════════════════════
  classification: {
    type: DocumentType;
    confidence: number;
    detectedAt: string;
  };

  // ═══════════════════════════════════════════════════════════════
  // PROCESSING
  // ═══════════════════════════════════════════════════════════════
  processing: {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    startedAt?: string;
    completedAt?: string;
    duration?: number;
    error?: string;
    retryCount: number;
  };

  // ═══════════════════════════════════════════════════════════════
  // EXTRACTION
  // ═══════════════════════════════════════════════════════════════
  extraction: {
    rawText?: string;
    structuredData: Partial<PropertyContext>;
    confidence: Record<string, number>;  // Per-field confidence
    annotations: ExtractionAnnotation[];
    needsReview: boolean;
    reviewedAt?: string;
    reviewedBy?: string;
  };

  // ═══════════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════════
  metadata: {
    uploadedAt: string;
    uploadedBy: string;
    source: 'upload' | 'url' | 'email' | 'api';
    originalUrl?: string;
    notes?: string;
  };
}

type DocumentType =
  | 'floor-plan'
  | 'blueprint'
  | 'room-photo'
  | 'exterior-photo'
  | 'listing-pdf'
  | 'inspection-report'
  | 'permit'
  | 'appraisal'
  | 'material-spec'
  | 'invoice'
  | 'contract'
  | 'unknown';

interface ExtractionAnnotation {
  id: string;
  field: string;
  value: any;
  boundingBox?: BoundingBox;
  confidence: number;
  source: 'ocr' | 'vision' | 'inference';
  verified: boolean;
}
```

---

## Schema Validation

### Zod Schemas

```typescript
// validation/schemas.ts

import { z } from 'zod';

export const MeasurementSchema = z.object({
  value: z.number().positive(),
  unit: z.enum(['ft', 'in', 'm', 'cm']),
  precision: z.enum(['exact', 'approximate', 'estimated']),
  source: z.string(),
  confidence: z.number().min(0).max(1),
});

export const RoomContextSchema = z.object({
  id: z.string().uuid(),
  propertyId: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum([/* all RoomType values */]),
  floor: z.number().int(),
  measurements: MeasurementSetSchema,
  currentState: CurrentStateSchema,
  features: FeaturesSchema,
  connections: ConnectionsSchema,
  constraints: ConstraintsSchema,
  remodelScope: RemodelScopeSchema,
});

export const PropertyContextSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().positive(),
  address: AddressSchema,
  location: LocationSchema,
  details: PropertyDetailsSchema,
  regulatory: RegulatorySchema,
  valuation: ValuationSchema,
  neighborhood: NeighborhoodSchema,
  rooms: z.array(RoomContextSchema),
  sources: z.array(SourceDocumentSchema),
  metadata: MetadataSchema,
});

// Validation helper
export function validatePropertyContext(data: unknown): PropertyContext {
  return PropertyContextSchema.parse(data);
}
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA FLOW ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INPUTS                    PROCESSING                    OUTPUTS            │
│  ───────                   ──────────                    ───────            │
│                                                                             │
│  ┌──────────┐             ┌──────────────┐             ┌──────────┐        │
│  │ Address  │─────────────│              │             │ PropertyContext  │
│  └──────────┘             │              │             └──────────┘        │
│                           │  CONTEXT     │                   │             │
│  ┌──────────┐             │  BUILDER     │                   ▼             │
│  │Documents │─────────────│              │             ┌──────────┐        │
│  │ (PDFs,   │             │  - Merge     │─────────────│ RoomContext[]    │
│  │  photos) │             │  - Validate  │             └──────────┘        │
│  └──────────┘             │  - Enrich    │                   │             │
│                           │              │                   ▼             │
│  ┌──────────┐             │              │             ┌──────────┐        │
│  │ Web      │─────────────│              │             │ MeasurementSet  │
│  │ Scraping │             └──────────────┘             └──────────┘        │
│  └──────────┘                    │                                         │
│                                  │                                         │
│  ┌──────────┐                    ▼                     ┌──────────┐        │
│  │ User     │             ┌──────────────┐             │ Design-  │        │
│  │ Input    │─────────────│ STORE        │─────────────│ Version  │        │
│  └──────────┘             │ (Zustand)    │             └──────────┘        │
│                           └──────────────┘                   │             │
│                                  │                           │             │
│                                  ▼                           ▼             │
│                           ┌──────────────┐             ┌──────────┐        │
│                           │ AI SERVICES  │             │ 3D Scene │        │
│                           │              │             │ (Three.js)│       │
│                           │ - Gemini     │             └──────────┘        │
│                           │ - Generation │                                 │
│                           │ - Analysis   │                                 │
│                           └──────────────┘                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Storage Strategy

### Local (Zustand + IndexedDB)

```typescript
// store/persistence.ts

interface PersistenceConfig {
  name: 'remodelvision-store';
  version: 1;

  // What to persist
  partialize: (state: AppState) => Partial<AppState>;

  // Migration strategy
  migrate: (persistedState: unknown, version: number) => AppState;
}

const persistConfig: PersistenceConfig = {
  name: 'remodelvision-store',
  version: 1,

  partialize: (state) => ({
    projects: state.projects,
    properties: state.properties,
    designHistory: state.designHistory,
    userPreferences: state.userPreferences,
  }),

  migrate: (persisted, version) => {
    // Handle schema migrations
    if (version === 0) {
      return migrateV0ToV1(persisted);
    }
    return persisted as AppState;
  },
};
```

### Cloud (Future)

```typescript
// api/sync.ts

interface SyncConfig {
  endpoint: string;
  auth: AuthConfig;

  // Conflict resolution
  strategy: 'last-write-wins' | 'merge' | 'manual';

  // Sync triggers
  triggers: ('save' | 'timer' | 'online')[];
  interval?: number;
}
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Schema Completeness** | 100% of fields typed | TypeScript compilation |
| **Validation Coverage** | 100% of inputs validated | Zod parsing |
| **Data Accuracy** | 95%+ correct after extraction | User corrections |
| **Query Performance** | <50ms for common queries | Profiling |
| **Storage Efficiency** | <10MB per property | Size monitoring |

---

*Document maintained by RemodelVision Team*
