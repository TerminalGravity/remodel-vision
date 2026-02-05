/**
 * Zod Validation Schemas - PRD-008 Complete Specification
 *
 * Runtime validation schemas for all core data structures.
 * These schemas enforce type safety at API boundaries and for user inputs.
 */

import { z } from 'zod';

// ═══════════════════════════════════════════════════════════════
// SHARED PRIMITIVES
// ═══════════════════════════════════════════════════════════════

const isoDateSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Invalid ISO 8601 date string' }
);

const hexColorSchema = z.string().regex(
  /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  { message: 'Invalid hex color code' }
);

const confidenceSchema = z.number().min(0).max(1);

// ═══════════════════════════════════════════════════════════════
// MEASUREMENT SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const MeasurementSourceSchema = z.enum([
  'user-input',
  'floor-plan',
  'blueprint',
  'photo-estimate',
  'ai-estimate',
  'lidar-scan',
  'matterport',
]);

export const MeasurementPrecisionSchema = z.enum(['exact', 'approximate', 'estimated']);

export const MeasurementUnitSchema = z.enum(['ft', 'in', 'm', 'cm']);

export const MeasurementSchema = z.object({
  value: z.number(),
  unit: MeasurementUnitSchema,
  precision: MeasurementPrecisionSchema,
  source: MeasurementSourceSchema,
  confidence: confidenceSchema,
  feet: z.number().optional(),
  inches: z.number().optional(),
  display: z.string().optional(),
});

export const OrientationSchema = z.enum(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']);

export const WallMeasurementSchema = z.object({
  id: z.string(),
  name: z.string(),
  direction: OrientationSchema,
  length: MeasurementSchema,
  height: MeasurementSchema,
  openings: z.array(z.string()),
  features: z.array(z.string()),
  isExterior: z.boolean(),
  isLoadBearing: z.boolean(),
  thickness: MeasurementSchema.optional(),
  material: z.enum(['drywall', 'plaster', 'brick', 'concrete', 'wood', 'other']).optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
});

export const OpeningTypeSchema = z.enum([
  'window', 'door', 'archway', 'pass-through', 'pocket-door',
  'slider', 'french-door', 'bi-fold', 'garage-door',
]);

export const SwingDirectionSchema = z.enum([
  'in', 'out', 'left', 'right', 'bi-fold', 'slide', 'up', 'none',
]);

export const OpeningMeasurementSchema = z.object({
  id: z.string(),
  type: OpeningTypeSchema,
  wallId: z.string(),
  position: z.object({
    fromLeft: MeasurementSchema,
    fromFloor: MeasurementSchema,
  }),
  width: MeasurementSchema,
  height: MeasurementSchema,
  swingDirection: SwingDirectionSchema.optional(),
  operationType: z.enum(['fixed', 'operable', 'sliding', 'casement', 'awning', 'hopper']).optional(),
  connectsTo: z.string().optional(),
  frameWidth: MeasurementSchema.optional(),
  trimWidth: MeasurementSchema.optional(),
  material: z.string().optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
});

export const FeatureTypeSchema = z.enum([
  // Kitchen
  'island', 'peninsula', 'counter', 'cabinet-upper', 'cabinet-lower',
  'cabinet-tall', 'appliance-space',
  // Bathroom
  'shower', 'tub', 'vanity', 'toilet',
  // Living spaces
  'fireplace', 'built-in-shelves', 'entertainment-center', 'window-seat',
  // Storage
  'closet', 'pantry', 'niche',
  // Structural
  'column', 'beam', 'bump-out', 'stairs', 'landing',
  // Utility
  'water-heater', 'hvac-unit', 'electrical-panel',
  // Other
  'other',
]);

export const Position3DSchema = z.object({
  x: MeasurementSchema,
  y: MeasurementSchema,
  z: MeasurementSchema,
});

export const Dimensions3DSchema = z.object({
  width: MeasurementSchema,
  depth: MeasurementSchema,
  height: MeasurementSchema,
});

export const FeatureMeasurementSchema = z.object({
  id: z.string(),
  type: FeatureTypeSchema,
  name: z.string(),
  position: Position3DSchema,
  dimensions: Dimensions3DSchema,
  wallId: z.string().optional(),
  isFloorMounted: z.boolean(),
  isCeilingMounted: z.boolean(),
  material: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  condition: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
  isRemovable: z.boolean(),
  requiresPermit: z.boolean().optional(),
  estimatedRemovalCost: z.number().optional(),
});

export const ClearanceMeasurementSchema = z.object({
  name: z.string(),
  between: z.tuple([z.string(), z.string()]),
  distance: MeasurementSchema,
  minimumRequired: MeasurementSchema.optional(),
  codeReference: z.string().optional(),
  isAdequate: z.boolean(),
  deficiency: MeasurementSchema.optional(),
  category: z.enum(['egress', 'accessibility', 'work-zone', 'circulation', 'safety', 'other']),
});

export const MeasurementSetSchema = z.object({
  roomId: z.string(),
  capturedAt: isoDateSchema,
  source: MeasurementSourceSchema,
  dimensions: z.object({
    length: MeasurementSchema,
    width: MeasurementSchema,
    height: MeasurementSchema,
    squareFootage: z.number(),
    cubicFootage: z.number(),
    perimeter: z.number(),
  }),
  walls: z.array(WallMeasurementSchema),
  openings: z.array(OpeningMeasurementSchema),
  features: z.array(FeatureMeasurementSchema),
  clearances: z.array(ClearanceMeasurementSchema),
  metadata: z.object({
    version: z.number(),
    confidence: confidenceSchema,
    lastUpdated: isoDateSchema,
    updatedBy: z.string().optional(),
    notes: z.string().optional(),
  }),
});

// ═══════════════════════════════════════════════════════════════
// PROPERTY SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const PropertyAddressSchema = z.object({
  street: z.string().min(1),
  unit: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zip: z.string().min(1),
  county: z.string(),
  country: z.string(),
  formatted: z.string(),
});

export const PropertyLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  elevation: z.number().optional(),
  orientation: OrientationSchema.optional(),
  climate: z.string().optional(),
  timezone: z.string().optional(),
  sunPath: z.object({
    sunrise: z.object({ summer: z.string(), winter: z.string() }),
    sunset: z.object({ summer: z.string(), winter: z.string() }),
    solarNoon: z.string(),
    maxAltitude: z.object({ summer: z.number(), winter: z.number() }),
  }).optional(),
});

export const PropertyTypeSchema = z.enum([
  'single-family', 'condo', 'townhouse', 'multi-family',
  'manufactured', 'commercial', 'land',
]);

export const AreaMeasurementSchema = z.object({
  value: z.number().nonnegative(),
  unit: z.enum(['sqft', 'acres', 'sqm']),
});

export const RoomTypeSchema = z.enum([
  // Living Spaces
  'living-room', 'family-room', 'great-room', 'den', 'office', 'library',
  // Dining
  'dining-room', 'breakfast-nook',
  // Kitchen
  'kitchen', 'kitchenette', 'pantry', 'butler-pantry',
  // Bedrooms
  'primary-bedroom', 'bedroom', 'guest-bedroom', 'nursery',
  // Bathrooms
  'primary-bathroom', 'full-bathroom', 'three-quarter-bathroom', 'half-bathroom', 'powder-room',
  // Utility
  'laundry', 'mudroom', 'utility-room', 'mechanical-room',
  // Storage
  'closet', 'walk-in-closet', 'storage',
  // Circulation
  'hallway', 'foyer', 'stairway', 'landing',
  // Garage
  'garage', 'carport',
  // Outdoor
  'covered-patio', 'sunroom', 'screened-porch',
  // Other
  'basement', 'attic', 'bonus-room', 'flex-space', 'other',
]);

export const OpeningSchema = z.object({
  id: z.string(),
  type: z.enum(['door', 'window', 'opening']),
  wallIndex: z.number().int().nonnegative(),
  position: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  sillHeight: z.number().optional(),
});

export const WallSchema = z.object({
  start: z.object({ x: z.number(), y: z.number() }),
  end: z.object({ x: z.number(), y: z.number() }),
  thickness: z.number().positive(),
  height: z.number().positive(),
});

export const RoomLayoutSchema = z.object({
  walls: z.array(WallSchema),
  openings: z.array(OpeningSchema),
  ceilingHeight: z.number().positive(),
  confidence: confidenceSchema,
  source: z.enum(['heuristic', 'vision_floor_plan', 'user_measured', 'lidar']),
  id: z.string().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
});

export const RoomContextSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  name: z.string().min(1),
  type: RoomTypeSchema,
  floor: z.number().int(),
  zone: z.string().optional(),
  dimensions: z.object({
    length: z.number().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    sqft: z.number().optional(),
  }).optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }).optional(),
  currentState: z.object({
    condition: z.enum(['excellent', 'good', 'fair', 'poor']),
    flooring: z.string().optional(),
    walls: z.string().optional(),
    ceiling: z.string().optional(),
  }).optional(),
  layout: RoomLayoutSchema.optional(),
});

export const DataSourceSchema = z.enum([
  'zillow', 'redfin', 'county-assessor', 'mls',
  'user-input', 'ai-estimate', 'document', 'google-grounding',
]);

export const SourceReferenceSchema = z.object({
  source: DataSourceSchema,
  url: z.string().url().optional(),
  scrapedAt: isoDateSchema,
  confidence: confidenceSchema,
  fields: z.array(z.string()),
});

export const DataQualityLevelSchema = z.enum(['estimated', 'scraped', 'documented', 'verified']);

export const PropertyMetadataSchema = z.object({
  completeness: z.number().min(0).max(100),
  dataQuality: DataQualityLevelSchema,
  lastVerified: isoDateSchema.optional(),
  verifiedBy: z.string().optional(),
  confidence: z.record(z.string(), confidenceSchema),
});

// Simplified PropertyContext schema (full version would be very large)
export const PropertyContextSchema = z.object({
  id: z.string(),
  version: z.number().int().positive(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
  address: PropertyAddressSchema,
  location: PropertyLocationSchema,
  details: z.object({
    propertyType: PropertyTypeSchema,
    yearBuilt: z.number().int().min(1600).max(2100),
    yearRenovated: z.number().int().optional(),
    stories: z.number().int().positive(),
    lotSize: AreaMeasurementSchema,
    livingArea: AreaMeasurementSchema,
    finishedArea: AreaMeasurementSchema.optional(),
    unfinishedArea: AreaMeasurementSchema.optional(),
    bedrooms: z.number().int().nonnegative(),
    bathrooms: z.number().nonnegative(),
    fullBathrooms: z.number().int().optional(),
    halfBathrooms: z.number().int().optional(),
  }).passthrough(), // Allow additional fields
  regulatory: z.object({
    zoning: z.string(),
    zoningDescription: z.string().optional(),
    parcelNumber: z.string().optional(),
    legalDescription: z.string().optional(),
  }).passthrough(),
  valuation: z.object({
    assessed: z.number().optional(),
    marketEstimate: z.number().optional(),
    taxAnnual: z.number().optional(),
  }).passthrough(),
  neighborhood: z.object({
    walkScore: z.number().int().min(0).max(100).optional(),
    transitScore: z.number().int().min(0).max(100).optional(),
    bikeScore: z.number().int().min(0).max(100).optional(),
    schoolDistrict: z.string().optional(),
  }).passthrough(),
  rooms: z.array(RoomContextSchema),
  sources: z.array(SourceReferenceSchema),
  metadata: PropertyMetadataSchema,
});

// ═══════════════════════════════════════════════════════════════
// DESIGN SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const DesignStyleSchema = z.enum([
  'modern', 'contemporary', 'transitional', 'traditional', 'farmhouse',
  'modern-farmhouse', 'industrial', 'scandinavian', 'japandi', 'mid-century',
  'coastal', 'mediterranean', 'bohemian', 'minimalist', 'maximalist',
  'art-deco', 'craftsman', 'rustic', 'french-country', 'organic-modern',
]);

export const MaterialCategorySchema = z.enum([
  'flooring', 'countertop', 'cabinet', 'backsplash', 'wall', 'ceiling',
  'tile', 'trim', 'hardware', 'fixture', 'appliance', 'furniture', 'textile', 'other',
]);

export const MaterialSpecSchema = z.object({
  id: z.string(),
  category: MaterialCategorySchema,
  name: z.string().min(1),
  type: z.string(),
  color: z.string(),
  finish: z.string().optional(),
  pattern: z.string().optional(),
  brand: z.string().optional(),
  productId: z.string().optional(),
  estimatedCost: z.number().optional(),
  unit: z.enum(['sqft', 'linear-ft', 'each', 'set']).optional(),
  vendor: z.string().optional(),
  leadTime: z.string().optional(),
  availability: z.enum(['in-stock', 'special-order', 'discontinued']).optional(),
  imageUrl: z.string().url().optional(),
  productUrl: z.string().url().optional(),
});

export const ProductReferenceSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  brand: z.string(),
  category: z.string(),
  sku: z.string().optional(),
  modelNumber: z.string().optional(),
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
    depth: z.number(),
    unit: z.enum(['in', 'ft', 'cm', 'm']),
  }).optional(),
  weight: z.number().optional(),
  color: z.string().optional(),
  finish: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  vendor: z.string().optional(),
  vendorUrl: z.string().url().optional(),
  leadTime: z.string().optional(),
  imageUrl: z.string().url().optional(),
  productUrl: z.string().url().optional(),
  specSheetUrl: z.string().url().optional(),
});

export const BudgetTierSchema = z.enum(['economy', 'standard', 'premium', 'luxury']);

export const CostBreakdownSchema = z.object({
  category: z.string(),
  description: z.string(),
  amount: z.number(),
  percentage: z.number(),
  items: z.array(z.object({
    name: z.string(),
    quantity: z.number(),
    unitCost: z.number(),
    total: z.number(),
  })).optional(),
});

export const CostEstimateSchema = z.object({
  total: z.number(),
  currency: z.string(),
  tier: BudgetTierSchema,
  breakdown: z.array(CostBreakdownSchema),
  lowEstimate: z.number().optional(),
  highEstimate: z.number().optional(),
  laborIncluded: z.boolean(),
  permitsIncluded: z.boolean(),
  contingencyPercentage: z.number(),
  estimatedAt: isoDateSchema,
  validUntil: isoDateSchema.optional(),
  notes: z.string().optional(),
});

export const GenerationContextSchema = z.object({
  prompt: z.string().min(1),
  enhancedPrompt: z.string().optional(),
  systemPrompt: z.string().optional(),
  viewportCapture: z.string().optional(),
  referenceImages: z.array(z.string()).optional(),
  model: z.string(),
  modelVersion: z.string().optional(),
  requestedAt: isoDateSchema,
  completedAt: isoDateSchema,
  duration: z.number().nonnegative(),
  seed: z.number().optional(),
  temperature: z.number().min(0).max(2).optional(),
  guidanceScale: z.number().optional(),
  negativePrompt: z.string().optional(),
  tokensUsed: z.number().optional(),
  estimatedCost: z.number().optional(),
});

export const OutputDetailsSchema = z.object({
  image: z.string(),
  thumbnail: z.string().optional(),
  resolution: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  format: z.enum(['png', 'jpg', 'webp']),
  sizeBytes: z.number().optional(),
  storageUrl: z.string().url().optional(),
  storageProvider: z.enum(['supabase', 's3', 'local']).optional(),
  postProcessed: z.boolean().optional(),
  filters: z.array(z.string()).optional(),
});

export const FeedbackRatingSchema = z.union([
  z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5),
]);

export const UserFeedbackSchema = z.object({
  rating: FeedbackRatingSchema.optional(),
  isFavorite: z.boolean(),
  isApproved: z.boolean(),
  approvedBy: z.string().optional(),
  approvedAt: isoDateSchema.optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()),
  likes: z.array(z.string()).optional(),
  dislikes: z.array(z.string()).optional(),
  changeRequests: z.array(z.string()).optional(),
});

export const DesignSpecificationsSchema = z.object({
  style: DesignStyleSchema,
  secondaryStyle: DesignStyleSchema.optional(),
  colorPalette: z.object({
    primary: z.array(z.string()),
    secondary: z.array(z.string()),
    accent: z.array(z.string()),
    neutral: z.array(z.string()),
  }),
  materials: z.array(MaterialSpecSchema),
  products: z.array(ProductReferenceSchema),
  estimatedCost: CostEstimateSchema.optional(),
  mood: z.array(z.string()).optional(),
  aestheticKeywords: z.array(z.string()).optional(),
  focalPoint: z.string().optional(),
  keyChanges: z.array(z.string()).optional(),
});

export const CameraStateSchema = z.object({
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  target: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  fov: z.number().optional(),
  zoom: z.number().optional(),
});

export const DesignCreatorSchema = z.enum(['user', 'ai', 'designer', 'system']);

export const DesignVersionSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  roomId: z.string(),
  propertyId: z.string().optional(),
  version: z.number().int().positive(),
  name: z.string().optional(),
  description: z.string().optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
  createdBy: DesignCreatorSchema,
  createdByUserId: z.string().optional(),
  generation: GenerationContextSchema,
  output: OutputDetailsSchema,
  specifications: DesignSpecificationsSchema,
  feedback: UserFeedbackSchema,
  parentVersion: z.string().optional(),
  childVersions: z.array(z.string()),
  comparisonGroup: z.string().optional(),
  status: z.enum(['draft', 'reviewing', 'approved', 'rejected', 'archived']),
  cameraState: CameraStateSchema.optional(),
});

// ═══════════════════════════════════════════════════════════════
// SOURCE DOCUMENT SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const DocumentTypeSchema = z.enum([
  'floor-plan', 'blueprint', 'room-photo', 'exterior-photo', 'listing-pdf',
  'inspection-report', 'permit', 'appraisal', 'survey', 'deed', 'hoa-docs',
  'material-spec', 'invoice', 'contract', 'warranty', 'manual', 'receipt', 'unknown',
]);

export const DocumentSourceSchema = z.enum(['upload', 'url', 'email', 'api', 'scan', 'screenshot']);

export const FileInfoSchema = z.object({
  name: z.string().min(1),
  type: z.string(),
  size: z.number().nonnegative(),
  extension: z.string(),
  hash: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  pageCount: z.number().optional(),
  storagePath: z.string().optional(),
  storageUrl: z.string().url().optional(),
});

export const DocumentClassificationSchema = z.object({
  type: DocumentTypeSchema,
  confidence: confidenceSchema,
  detectedAt: isoDateSchema,
  model: z.string().optional(),
  alternativeTypes: z.array(z.object({
    type: DocumentTypeSchema,
    confidence: confidenceSchema,
  })).optional(),
  containsFloorPlan: z.boolean().optional(),
  containsMeasurements: z.boolean().optional(),
  containsPhotos: z.boolean().optional(),
  language: z.string().optional(),
});

export const ProcessingStatusSchema = z.enum([
  'pending', 'queued', 'processing', 'completed', 'failed', 'cancelled',
]);

export const ProcessingStateSchema = z.object({
  status: ProcessingStatusSchema,
  queuedAt: isoDateSchema.optional(),
  startedAt: isoDateSchema.optional(),
  completedAt: isoDateSchema.optional(),
  duration: z.number().optional(),
  currentStep: z.string().optional(),
  stepsCompleted: z.number().optional(),
  totalSteps: z.number().optional(),
  progressPercent: z.number().min(0).max(100).optional(),
  error: z.string().optional(),
  errorCode: z.string().optional(),
  errorDetails: z.record(z.unknown()).optional(),
  retryCount: z.number().int().nonnegative(),
  maxRetries: z.number().optional(),
  nextRetryAt: isoDateSchema.optional(),
  tokensUsed: z.number().optional(),
  costEstimate: z.number().optional(),
});

export const BoundingBoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  unit: z.enum(['normalized', 'pixels']),
  page: z.number().optional(),
  rotation: z.number().optional(),
});

export const ExtractionSourceSchema = z.enum(['ocr', 'vision', 'inference', 'manual', 'api']);

export const ExtractionAnnotationSchema = z.object({
  id: z.string(),
  field: z.string(),
  value: z.unknown(),
  displayValue: z.string().optional(),
  boundingBox: BoundingBoxSchema.optional(),
  pageNumber: z.number().optional(),
  snippet: z.string().optional(),
  confidence: confidenceSchema,
  source: ExtractionSourceSchema,
  model: z.string().optional(),
  verified: z.boolean(),
  verifiedAt: isoDateSchema.optional(),
  verifiedBy: z.string().optional(),
  correctedValue: z.unknown().optional(),
  reasoning: z.string().optional(),
});

export const ExtractionDataSchema = z.object({
  rawText: z.string().optional(),
  rawHtml: z.string().optional(),
  structuredData: z.record(z.unknown()),
  confidence: z.record(z.string(), confidenceSchema),
  annotations: z.array(ExtractionAnnotationSchema),
  needsReview: z.boolean(),
  reviewPriority: z.enum(['high', 'medium', 'low']).optional(),
  reviewNotes: z.string().optional(),
  reviewedAt: isoDateSchema.optional(),
  reviewedBy: z.string().optional(),
  conflicts: z.array(z.object({
    field: z.string(),
    existingValue: z.unknown(),
    extractedValue: z.unknown(),
    resolution: z.enum(['keep-existing', 'use-extracted', 'manual']).optional(),
  })).optional(),
});

export const DocumentMetadataSchema = z.object({
  uploadedAt: isoDateSchema,
  uploadedBy: z.string(),
  source: DocumentSourceSchema,
  originalUrl: z.string().url().optional(),
  emailSubject: z.string().optional(),
  emailFrom: z.string().optional(),
  folder: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  isPublic: z.boolean().optional(),
  sharedWith: z.array(z.string()).optional(),
  expiresAt: isoDateSchema.optional(),
  retentionPolicy: z.string().optional(),
});

export const SourceDocumentSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  projectId: z.string().optional(),
  file: FileInfoSchema,
  classification: DocumentClassificationSchema,
  processing: ProcessingStateSchema,
  extraction: ExtractionDataSchema,
  metadata: DocumentMetadataSchema,
  relatedDocuments: z.array(z.string()).optional(),
  supersedes: z.string().optional(),
  supersededBy: z.string().optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

// ═══════════════════════════════════════════════════════════════
// PROJECT CONFIG SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const ProjectStatusSchema = z.enum([
  'draft', 'planning', 'designing', 'bidding', 'permitting',
  'in-progress', 'on-hold', 'completed', 'archived',
]);

export const ProjectPhaseSchema = z.enum([
  'inspiration', 'space-planning', 'design-development', 'documentation',
  'procurement', 'construction', 'install', 'punch-list', 'complete',
]);

export const WoodPreferenceSchema = z.enum([
  'oak', 'walnut', 'maple', 'cherry', 'ash', 'teak', 'mahogany',
  'pine', 'hickory', 'birch', 'reclaimed', 'white-oak', 'rift-sawn-oak',
]);

export const StonePreferenceSchema = z.enum([
  'marble', 'granite', 'quartzite', 'soapstone', 'limestone',
  'travertine', 'slate', 'bluestone', 'concrete', 'terrazzo',
]);

export const MetalFinishSchema = z.enum([
  'polished-nickel', 'brushed-nickel', 'polished-chrome', 'satin-brass',
  'antique-brass', 'oil-rubbed-bronze', 'matte-black', 'polished-brass',
  'copper', 'stainless-steel', 'gunmetal', 'champagne-bronze',
]);

export const ColorTemperatureSchema = z.enum(['warm', 'neutral', 'cool']);

export const DesignDNASchema = z.object({
  primaryStyle: DesignStyleSchema,
  secondaryStyle: DesignStyleSchema.optional(),
  colorTemperature: ColorTemperatureSchema,
  colorPalette: z.object({
    primary: z.array(z.string()),
    accent: z.array(z.string()),
    neutral: z.array(z.string()),
  }).optional(),
  materialPreferences: z.object({
    wood: z.array(WoodPreferenceSchema),
    stone: z.array(StonePreferenceSchema),
    metal: z.array(MetalFinishSchema),
    fabric: z.array(z.string()),
  }),
  aestheticKeywords: z.array(z.string()),
  avoidKeywords: z.array(z.string()),
  inspirationImages: z.array(z.string()),
});

export const ScopeTypeSchema = z.enum([
  'cosmetic', 'renovation', 'remodel', 'addition', 'gut-renovation',
]);

export const WorkTypeSchema = z.enum([
  'demolition', 'framing', 'electrical', 'plumbing', 'hvac', 'insulation',
  'drywall', 'flooring', 'tile', 'cabinetry', 'countertops', 'painting',
  'trim', 'fixtures', 'appliances', 'landscaping', 'roofing', 'siding',
  'windows', 'doors',
]);

export const OccupancyStatusSchema = z.enum(['vacant', 'occupied', 'partial']);

export const TeamRoleSchema = z.enum([
  'owner', 'designer', 'architect', 'general-contractor', 'project-manager',
  'electrician', 'plumber', 'hvac', 'painter', 'flooring', 'cabinet', 'tile', 'other',
]);

export const TeamContactSchema = z.object({
  id: z.string(),
  role: TeamRoleSchema,
  name: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

export const ProjectConfigSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  name: z.string().min(1),
  client: z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    notes: z.string().optional(),
    company: z.string().optional(),
    address: z.string().optional(),
    preferredContact: z.enum(['email', 'phone', 'text']).optional(),
  }),
  status: ProjectStatusSchema,
  phase: ProjectPhaseSchema,
  startDate: isoDateSchema.optional(),
  targetCompletion: isoDateSchema.optional(),
  designDNA: DesignDNASchema,
  budget: z.object({
    tier: BudgetTierSchema,
    total: z.number().optional(),
    currency: z.string().optional(),
    breakdown: z.object({
      materials: z.number(),
      labor: z.number(),
      design: z.number(),
      permits: z.number(),
      contingency: z.number(),
      byRoom: z.record(z.number()).optional(),
      byCategory: z.record(z.number()).optional(),
    }).optional(),
    priorityAreas: z.array(z.string()),
    flexibleAreas: z.array(z.string()),
    spent: z.number().optional(),
    remaining: z.number().optional(),
    lastUpdated: isoDateSchema.optional(),
  }),
  scope: z.object({
    rooms: z.array(z.object({
      roomId: z.string(),
      type: RoomTypeSchema,
      workTypes: z.array(WorkTypeSchema),
      excludedWork: z.array(WorkTypeSchema),
      notes: z.string().optional(),
    })),
    type: ScopeTypeSchema,
    workTypes: z.array(WorkTypeSchema),
    excludedWork: z.array(WorkTypeSchema),
  }),
  constraints: z.object({
    timeline: z.object({
      type: z.enum(['flexible', 'soft-deadline', 'hard-deadline']),
      startDate: isoDateSchema.optional(),
      endDate: isoDateSchema.optional(),
      milestones: z.array(z.object({
        name: z.string(),
        date: isoDateSchema,
        required: z.boolean(),
      })).optional(),
      blackoutDates: z.array(isoDateSchema).optional(),
      notes: z.string().optional(),
    }),
    occupancy: OccupancyStatusSchema,
    noise: z.object({
      restricted: z.boolean(),
      allowedHours: z.string().optional(),
      allowedDays: z.array(z.string()).optional(),
      notes: z.string().optional(),
    }),
    access: z.array(z.string()),
    permits: z.array(z.string()),
    hoa: z.array(z.string()),
    historicRequirements: z.array(z.string()).optional(),
    other: z.array(z.string()),
  }),
  team: z.array(TeamContactSchema),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    timezone: z.string().optional(),
  }),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

// ═══════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════

import type { PropertyContext } from '../../types/property';
import type { MeasurementSet } from '../../types/measurements';
import type { DesignVersion } from '../../types/design';
import type { SourceDocument } from '../../types/source';
import type { ProjectConfig } from '../../types/project';

/**
 * Safely parse and validate unknown input as PropertyContext
 * @throws ZodError if validation fails
 */
export function validatePropertyContext(data: unknown): PropertyContext {
  return PropertyContextSchema.parse(data) as PropertyContext;
}

/**
 * Safely parse and validate unknown input as MeasurementSet
 * @throws ZodError if validation fails
 */
export function validateMeasurementSet(data: unknown): MeasurementSet {
  return MeasurementSetSchema.parse(data) as MeasurementSet;
}

/**
 * Safely parse and validate unknown input as DesignVersion
 * @throws ZodError if validation fails
 */
export function validateDesignVersion(data: unknown): DesignVersion {
  return DesignVersionSchema.parse(data) as DesignVersion;
}

/**
 * Safely parse and validate unknown input as SourceDocument
 * @throws ZodError if validation fails
 */
export function validateSourceDocument(data: unknown): SourceDocument {
  return SourceDocumentSchema.parse(data) as SourceDocument;
}

/**
 * Safely parse and validate unknown input as ProjectConfig
 * @throws ZodError if validation fails
 */
export function validateProjectConfig(data: unknown): ProjectConfig {
  return ProjectConfigSchema.parse(data) as ProjectConfig;
}

/**
 * Safe parse that returns a result object instead of throwing
 */
export function safeValidatePropertyContext(data: unknown) {
  return PropertyContextSchema.safeParse(data);
}

export function safeValidateMeasurementSet(data: unknown) {
  return MeasurementSetSchema.safeParse(data);
}

export function safeValidateDesignVersion(data: unknown) {
  return DesignVersionSchema.safeParse(data);
}

export function safeValidateSourceDocument(data: unknown) {
  return SourceDocumentSchema.safeParse(data);
}

export function safeValidateProjectConfig(data: unknown) {
  return ProjectConfigSchema.safeParse(data);
}

// ═══════════════════════════════════════════════════════════════
// TYPE EXPORTS (Inferred from Zod schemas)
// ═══════════════════════════════════════════════════════════════

export type MeasurementInput = z.input<typeof MeasurementSchema>;
export type MeasurementSetInput = z.input<typeof MeasurementSetSchema>;
export type PropertyContextInput = z.input<typeof PropertyContextSchema>;
export type DesignVersionInput = z.input<typeof DesignVersionSchema>;
export type SourceDocumentInput = z.input<typeof SourceDocumentSchema>;
export type ProjectConfigInput = z.input<typeof ProjectConfigSchema>;
