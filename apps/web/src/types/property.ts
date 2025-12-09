/**
 * Property Context Types
 *
 * Complete property context - the master data structure for a property.
 * All AI interactions reference this for accurate, contextual outputs.
 * Based on PRD-008: Data Structures & Schema
 */

// ═══════════════════════════════════════════════════════════════
// CORE PROPERTY CONTEXT
// ═══════════════════════════════════════════════════════════════

export interface PropertyContext {
  // Identity
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;

  // Address
  address: PropertyAddress;

  // Geospatial
  location: PropertyLocation;

  // Property Details
  details: PropertyDetails;

  // Regulatory
  regulatory: RegulatoryInfo;

  // Valuation
  valuation: ValuationInfo;

  // Neighborhood
  neighborhood: NeighborhoodInfo;

  // Rooms (Detailed)
  rooms: RoomContext[];

  // Sources & Metadata
  sources: SourceReference[];
  metadata: PropertyMetadata;
}

// ═══════════════════════════════════════════════════════════════
// ADDRESS
// ═══════════════════════════════════════════════════════════════

export interface PropertyAddress {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  country: string;
  formatted: string;
}

// ═══════════════════════════════════════════════════════════════
// GEOSPATIAL
// ═══════════════════════════════════════════════════════════════

export type Orientation = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export type ClimateZone =
  | '1A' | '1B'           // Very Hot
  | '2A' | '2B'           // Hot
  | '3A' | '3B' | '3C'    // Warm
  | '4A' | '4B' | '4C'    // Mixed
  | '5A' | '5B' | '5C'    // Cool
  | '6A' | '6B'           // Cold
  | '7' | '8';            // Very Cold

export interface SunPathData {
  sunrise: { summer: string; winter: string };
  sunset: { summer: string; winter: string };
  solarNoon: string;
  maxAltitude: { summer: number; winter: number };
}

export interface PropertyLocation {
  lat: number;
  lng: number;
  elevation?: number;
  orientation?: Orientation;
  climate?: ClimateZone;
  timezone?: string;
  sunPath?: SunPathData;
}

// ═══════════════════════════════════════════════════════════════
// PROPERTY DETAILS
// ═══════════════════════════════════════════════════════════════

export type PropertyType =
  | 'single-family'
  | 'condo'
  | 'townhouse'
  | 'multi-family'
  | 'manufactured'
  | 'commercial'
  | 'land';

export interface AreaMeasurement {
  value: number;
  unit: 'sqft' | 'acres' | 'sqm';
}

export interface GarageInfo {
  type: 'attached' | 'detached' | 'carport';
  spaces: number;
  sqft?: number;
}

export interface BasementInfo {
  type: 'full' | 'partial' | 'crawl' | 'none';
  finished: boolean;
  sqft?: number;
}

export interface AtticInfo {
  finished: boolean;
  sqft?: number;
}

export interface PoolInfo {
  type: 'in-ground' | 'above-ground';
  heated: boolean;
  dimensions?: string;
}

export interface DeckInfo {
  material: string;
  sqft: number;
  covered: boolean;
}

export interface PatioInfo {
  material: string;
  sqft: number;
  covered: boolean;
}

export interface HVACSystem {
  heating: string;
  cooling: string;
  fuel: string;
  age?: number;
}

export interface ElectricalSystem {
  amperage: number;
  panel: string;
  updated?: number;
}

export interface PlumbingSystem {
  material: string;
  waterHeater: string;
  updated?: number;
}

export interface ConstructionDetails {
  style: string;
  framing: string;
  insulation?: string;
}

export interface RoofDetails {
  type: string;
  material: string;
  age?: number;
  condition?: string;
}

export type FoundationType = 'slab' | 'crawl' | 'basement' | 'pier' | 'other';

export interface ExteriorDetails {
  siding: string;
  windows?: string;
  doors?: string;
}

export interface PropertyDetails {
  propertyType: PropertyType;
  yearBuilt: number;
  yearRenovated?: number;
  stories: number;

  // Area measurements
  lotSize: AreaMeasurement;
  livingArea: AreaMeasurement;
  finishedArea?: AreaMeasurement;
  unfinishedArea?: AreaMeasurement;

  // Room counts
  bedrooms: number;
  bathrooms: number;
  fullBathrooms?: number;
  halfBathrooms?: number;

  // Structures
  garage?: GarageInfo | null;
  basement?: BasementInfo | null;
  attic?: AtticInfo | null;
  pool?: PoolInfo | null;
  deck?: DeckInfo | null;
  patio?: PatioInfo | null;

  // Systems
  hvac?: HVACSystem;
  electrical?: ElectricalSystem;
  plumbing?: PlumbingSystem;

  // Construction
  construction?: ConstructionDetails;
  roof?: RoofDetails;
  foundation?: FoundationType;
  exterior?: ExteriorDetails;
}

// ═══════════════════════════════════════════════════════════════
// REGULATORY
// ═══════════════════════════════════════════════════════════════

export interface HOAInfo {
  name: string;
  fee: number;
  frequency: 'monthly' | 'quarterly' | 'annual';
  restrictions?: string[];
}

export interface FloodZoneInfo {
  zone: string;
  inFloodplain: boolean;
  insuranceRequired: boolean;
}

export interface Easement {
  type: string;
  description: string;
}

export interface PermitRecord {
  number: string;
  type: string;
  date: string;
  status: string;
  description?: string;
}

export interface RegulatoryInfo {
  zoning: string;
  zoningDescription?: string;
  parcelNumber?: string;
  legalDescription?: string;

  hoa?: HOAInfo | null;
  historicDistrict?: boolean;
  floodZone?: FloodZoneInfo;
  easements?: Easement[];

  setbacks?: {
    front: number;
    back: number;
    left: number;
    right: number;
  };

  permits?: PermitRecord[];
  restrictions?: string[];
}

// ═══════════════════════════════════════════════════════════════
// VALUATION
// ═══════════════════════════════════════════════════════════════

export interface PriceHistoryEntry {
  date: string;
  price: number;
  event: 'sold' | 'listed' | 'delisted' | 'price-change';
}

export interface ComparableProperty {
  address: string;
  price: number;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  soldDate?: string;
  distance?: number;
}

export interface ValuationInfo {
  assessed?: number;
  marketEstimate?: number;
  taxAnnual?: number;

  lastSale?: {
    price: number;
    date: string;
    buyer?: string;
    seller?: string;
  };

  priceHistory?: PriceHistoryEntry[];
  comparables?: ComparableProperty[];
}

// ═══════════════════════════════════════════════════════════════
// NEIGHBORHOOD
// ═══════════════════════════════════════════════════════════════

export interface SchoolInfo {
  name: string;
  type: 'elementary' | 'middle' | 'high' | 'private';
  rating?: number;
  distance?: number;
}

export interface Amenity {
  name: string;
  type: string;
  distance: number;
}

export interface DemographicData {
  medianIncome?: number;
  medianAge?: number;
  ownerOccupied?: number;
}

export interface NeighborhoodInfo {
  walkScore?: number;
  transitScore?: number;
  bikeScore?: number;

  schoolDistrict?: string;
  schools?: SchoolInfo[];

  crimeIndex?: number;
  noiseLevel?: 'quiet' | 'moderate' | 'busy';

  nearbyAmenities?: Amenity[];
  demographics?: DemographicData;
}

// ═══════════════════════════════════════════════════════════════
// ROOM CONTEXT (Simplified for property context)
// ═══════════════════════════════════════════════════════════════

export type RoomType =
  // Living Spaces
  | 'living-room' | 'family-room' | 'great-room' | 'den' | 'office' | 'library'
  // Dining
  | 'dining-room' | 'breakfast-nook'
  // Kitchen
  | 'kitchen' | 'kitchenette' | 'pantry' | 'butler-pantry'
  // Bedrooms
  | 'primary-bedroom' | 'bedroom' | 'guest-bedroom' | 'nursery'
  // Bathrooms
  | 'primary-bathroom' | 'full-bathroom' | 'three-quarter-bathroom' | 'half-bathroom' | 'powder-room'
  // Utility
  | 'laundry' | 'mudroom' | 'utility-room' | 'mechanical-room'
  // Storage
  | 'closet' | 'walk-in-closet' | 'storage'
  // Circulation
  | 'hallway' | 'foyer' | 'stairway' | 'landing'
  // Garage
  | 'garage' | 'carport'
  // Outdoor
  | 'covered-patio' | 'sunroom' | 'screened-porch'
  // Other
  | 'basement' | 'attic' | 'bonus-room' | 'flex-space' | 'other';

export interface RoomContext {
  id: string;
  propertyId: string;
  name: string;
  type: RoomType;
  floor: number;
  zone?: string;

  // Simplified measurements
  dimensions?: {
    length?: number; // x-axis dimension
    width?: number;  // z-axis dimension
    height?: number; // y-axis dimension
    sqft?: number;
  };

  // Position relative to house origin (bottom-left-front corner)
  position?: {
    x: number;
    y: number;
    z: number;
  };

  // Current state
  currentState?: {
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    flooring?: string;
    walls?: string;
    ceiling?: string;
  };

  // Detailed Layout (for 3D viz)
  layout?: RoomLayout;
}

// ═══════════════════════════════════════════════════════════════
// ROOM LAYOUT (Unified Tier 3/4 Data Structure)
// ═══════════════════════════════════════════════════════════════

export interface Opening {
  id: string;
  type: 'door' | 'window' | 'opening';
  wallIndex: number; // Index of the wall this opening is on
  position: number;  // Distance from wall start
  width: number;
  height: number;
  sillHeight?: number; // Distance from floor
}

export interface Wall {
  start: { x: number; y: number };
  end: { x: number; y: number };
  thickness: number;
  height: number;
}

export interface RoomLayout {
  walls: Wall[];
  openings: Opening[];
  ceilingHeight: number;
  confidence: number; // 0.0 - 1.0 (Tier 4 ~0.4, Tier 3 ~0.8, Tier 2 ~0.98)
  source: 'heuristic' | 'vision_floor_plan' | 'user_measured' | 'lidar';
}

// ═══════════════════════════════════════════════════════════════
// SOURCES & METADATA
// ═══════════════════════════════════════════════════════════════

export type DataSource = 'zillow' | 'redfin' | 'county-assessor' | 'mls' | 'user-input' | 'ai-estimate' | 'document' | 'google-grounding';

export interface SourceReference {
  source: DataSource;
  url?: string;
  scrapedAt: string;
  confidence: number;
  fields: string[];
}

export type DataQualityLevel = 'estimated' | 'scraped' | 'documented' | 'verified';

export interface PropertyMetadata {
  completeness: number;
  dataQuality: DataQualityLevel;
  lastVerified?: string;
  verifiedBy?: string;
  confidence: Record<string, number>;
}

// ═══════════════════════════════════════════════════════════════
// SCRAPED DATA TYPES (From Firecrawl)
// ═══════════════════════════════════════════════════════════════

export interface ZillowScrapedData {
  zpid?: string;
  address?: string;
  price?: number;
  zestimate?: number;
  rentZestimate?: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  lotSize?: string;
  yearBuilt?: number;
  propertyType?: string;
  homeStatus?: string;
  description?: string;
  facts?: string[];
  taxHistory?: Array<{ year: number; tax: number; assessment: number }>;
  priceHistory?: Array<{ date: string; price: number; event: string }>;
  schools?: Array<{ name: string; rating: number; distance: string; type: string }>;
  walkScore?: number;
  transitScore?: number;
  bikeScore?: number;
  latitude?: number;
  longitude?: number;
}

export interface RedfinScrapedData {
  listingId?: string;
  address?: string;
  price?: number;
  estimate?: number;
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  lotSize?: string;
  yearBuilt?: number;
  propertyType?: string;
  status?: string;
  description?: string;
  features?: string[];
  taxInfo?: { annualAmount: number; assessedValue: number };
  hoa?: { fee: number; frequency: string };
  latitude?: number;
  longitude?: number;
}

export interface CountyAssessorScrapedData {
  parcelNumber?: string;
  ownerName?: string;
  legalDescription?: string;
  zoning?: string;
  assessedValue?: number;
  landValue?: number;
  improvementValue?: number;
  taxAmount?: number;
  lotSize?: string;
  lotDimensions?: string;
  yearBuilt?: number;
  sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  stories?: number;
  construction?: string;
  foundation?: string;
  roofType?: string;
  heating?: string;
  cooling?: string;
  garage?: string;
  basement?: string;
  permitHistory?: Array<{ date: string; type: string; description: string }>;
}

export interface GroundingData {
  address?: string;
  zoning?: string;
  yearBuilt?: number;
  propertyType?: string;
  sqft?: number;
  lotSize?: string;
  bedrooms?: number;
  bathrooms?: number;
  estimatedValue?: number;
  schoolDistrict?: string;
  schools?: Array<{ name: string; rating: number; distance: string; type: string }>;
  amenities?: string[];
  neighborhoodVibe?: string;
  walkScore?: number;
  floodZone?: string;
}

// ═══════════════════════════════════════════════════════════════
// MERGE RESULT
// ═══════════════════════════════════════════════════════════════

export interface PropertyDataMergeResult {
  property: PropertyContext;
  sources: SourceReference[];
  conflicts: DataConflict[];
  completeness: number;
}

export interface DataConflict {
  field: string;
  values: Array<{ source: DataSource; value: unknown; confidence: number }>;
  resolved: unknown;
  resolution: 'highest-confidence' | 'most-recent' | 'user-verified' | 'average';
}
