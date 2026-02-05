/**
 * Design Types - PRD-008 Complete Specification
 *
 * Complete design version schema for tracking design iterations,
 * AI generation context, specifications, and user feedback.
 */

import type { DesignStyleType, BudgetTier, CameraState } from './generation';

// ═══════════════════════════════════════════════════════════════
// DESIGN STYLE (Extended from generation.ts)
// ═══════════════════════════════════════════════════════════════

export type DesignStyle =
  | 'modern'
  | 'contemporary'
  | 'transitional'
  | 'traditional'
  | 'farmhouse'
  | 'modern-farmhouse'
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

// ═══════════════════════════════════════════════════════════════
// MATERIAL SPECIFICATION
// ═══════════════════════════════════════════════════════════════

export type MaterialCategory =
  | 'flooring'
  | 'countertop'
  | 'cabinet'
  | 'backsplash'
  | 'wall'
  | 'ceiling'
  | 'tile'
  | 'trim'
  | 'hardware'
  | 'fixture'
  | 'appliance'
  | 'furniture'
  | 'textile'
  | 'other';

/**
 * Detailed material specification for a design element
 */
export interface MaterialSpec {
  id: string;
  category: MaterialCategory;
  name: string;           // "White Oak Hardwood"
  type: string;           // "Hardwood", "Quartz", "Porcelain"
  color: string;          // "Natural", "Calacatta Gold"
  finish?: string;        // "Matte", "Polished", "Brushed"
  pattern?: string;       // "Herringbone", "Subway", "Slab"
  brand?: string;         // "Shaw", "Cambria"
  productId?: string;     // SKU or product code

  // Cost estimation
  estimatedCost?: number;
  unit?: 'sqft' | 'linear-ft' | 'each' | 'set';

  // Sourcing
  vendor?: string;
  leadTime?: string;      // "2-3 weeks"
  availability?: 'in-stock' | 'special-order' | 'discontinued';

  // Reference
  imageUrl?: string;
  productUrl?: string;
}

// ═══════════════════════════════════════════════════════════════
// PRODUCT REFERENCE
// ═══════════════════════════════════════════════════════════════

export interface Dimensions {
  width: number;
  height: number;
  depth: number;
  unit: 'in' | 'ft' | 'cm' | 'm';
}

/**
 * Reference to a specific product used in a design
 */
export interface ProductReference {
  id: string;
  name: string;           // "KitchenAid 48\" Range"
  brand: string;
  category: string;       // "Appliance", "Lighting", "Plumbing"
  sku?: string;
  modelNumber?: string;

  // Physical
  dimensions?: Dimensions;
  weight?: number;
  color?: string;
  finish?: string;

  // Cost
  price?: number;
  currency?: string;

  // Sourcing
  vendor?: string;
  vendorUrl?: string;
  leadTime?: string;

  // Media
  imageUrl?: string;
  productUrl?: string;
  specSheetUrl?: string;
}

// ═══════════════════════════════════════════════════════════════
// COST ESTIMATE
// ═══════════════════════════════════════════════════════════════

export interface CostBreakdown {
  category: string;
  description: string;
  amount: number;
  percentage: number;
  items?: Array<{
    name: string;
    quantity: number;
    unitCost: number;
    total: number;
  }>;
}

export interface CostEstimate {
  total: number;
  currency: string;
  tier: BudgetTier;
  breakdown: CostBreakdown[];

  // Range
  lowEstimate?: number;
  highEstimate?: number;

  // Context
  laborIncluded: boolean;
  permitsIncluded: boolean;
  contingencyPercentage: number;

  // Validity
  estimatedAt: string;
  validUntil?: string;

  notes?: string;
}

// ═══════════════════════════════════════════════════════════════
// GENERATION CONTEXT
// ═══════════════════════════════════════════════════════════════

/**
 * Context captured during AI image generation
 */
export interface GenerationContext {
  prompt: string;              // User's original request
  enhancedPrompt?: string;     // AI-enhanced/expanded prompt
  systemPrompt?: string;       // System context sent to model

  // Visual context
  viewportCapture?: string;    // Base64 of 3D viewport at generation time
  referenceImages?: string[];  // Base64 reference images used

  // Model info
  model: string;               // "gemini-2.0-flash-exp"
  modelVersion?: string;

  // Timing
  requestedAt: string;
  completedAt: string;
  duration: number;            // Generation time in ms

  // Parameters
  seed?: number;
  temperature?: number;
  guidanceScale?: number;
  negativePrompt?: string;

  // Tokens/cost
  tokensUsed?: number;
  estimatedCost?: number;
}

// ═══════════════════════════════════════════════════════════════
// OUTPUT DETAILS
// ═══════════════════════════════════════════════════════════════

export type ImageFormat = 'png' | 'jpg' | 'webp';

/**
 * Details about the generated output
 */
export interface OutputDetails {
  image: string;               // Base64 or URL
  thumbnail?: string;          // Smaller version for galleries

  resolution: {
    width: number;
    height: number;
  };

  format: ImageFormat;
  sizeBytes?: number;

  // Storage
  storageUrl?: string;         // Cloud storage URL
  storageProvider?: 'supabase' | 's3' | 'local';

  // Processing
  postProcessed?: boolean;
  filters?: string[];
}

// ═══════════════════════════════════════════════════════════════
// DESIGN SPECIFICATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Detailed specifications of what's in a design
 */
export interface DesignSpecifications {
  style: DesignStyle;
  secondaryStyle?: DesignStyle;

  colorPalette: {
    primary: string[];    // Hex codes
    secondary: string[];
    accent: string[];
    neutral: string[];
  };

  // Materials used
  materials: MaterialSpec[];

  // Products specified
  products: ProductReference[];

  // Cost
  estimatedCost?: CostEstimate;

  // Style keywords
  mood?: string[];             // "warm", "inviting", "sophisticated"
  aestheticKeywords?: string[];

  // Focus
  focalPoint?: string;         // "kitchen island", "fireplace"
  keyChanges?: string[];       // Summary of major changes
}

// ═══════════════════════════════════════════════════════════════
// USER FEEDBACK
// ═══════════════════════════════════════════════════════════════

export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

/**
 * User feedback on a design version
 */
export interface UserFeedback {
  rating?: FeedbackRating;

  // Favorites & approval
  isFavorite: boolean;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;

  // Comments
  notes?: string;

  // Categorization
  tags: string[];              // "finalist", "client-pick", "budget-friendly"

  // Specific feedback
  likes?: string[];            // What they liked
  dislikes?: string[];         // What they didn't like
  changeRequests?: string[];   // Requested modifications
}

// ═══════════════════════════════════════════════════════════════
// DESIGN VERSION (Complete Schema)
// ═══════════════════════════════════════════════════════════════

export type DesignCreator = 'user' | 'ai' | 'designer' | 'system';

/**
 * A single version/iteration of a design.
 * This is the complete DesignVersion schema per PRD-008.
 */
export interface DesignVersion {
  id: string;
  projectId: string;
  roomId: string;
  propertyId?: string;

  // ═══════════════════════════════════════════════════════════════
  // VERSION INFO
  // ═══════════════════════════════════════════════════════════════
  version: number;
  name?: string;               // "Option A", "Final", "Client Revision 2"
  description?: string;

  createdAt: string;           // ISO 8601
  updatedAt: string;
  createdBy: DesignCreator;
  createdByUserId?: string;

  // ═══════════════════════════════════════════════════════════════
  // GENERATION CONTEXT
  // ═══════════════════════════════════════════════════════════════
  generation: GenerationContext;

  // ═══════════════════════════════════════════════════════════════
  // OUTPUT
  // ═══════════════════════════════════════════════════════════════
  output: OutputDetails;

  // ═══════════════════════════════════════════════════════════════
  // SPECIFICATIONS
  // ═══════════════════════════════════════════════════════════════
  specifications: DesignSpecifications;

  // ═══════════════════════════════════════════════════════════════
  // USER FEEDBACK
  // ═══════════════════════════════════════════════════════════════
  feedback: UserFeedback;

  // ═══════════════════════════════════════════════════════════════
  // VERSION RELATIONSHIPS
  // ═══════════════════════════════════════════════════════════════
  parentVersion?: string;      // Previous iteration this was based on
  childVersions: string[];     // Refinements/variations of this version

  // Comparison grouping
  comparisonGroup?: string;    // Group ID for A/B comparisons

  // ═══════════════════════════════════════════════════════════════
  // STATUS
  // ═══════════════════════════════════════════════════════════════
  status: 'draft' | 'reviewing' | 'approved' | 'rejected' | 'archived';

  // ═══════════════════════════════════════════════════════════════
  // CAMERA STATE (for regeneration)
  // ═══════════════════════════════════════════════════════════════
  cameraState?: CameraState;
}

// ═══════════════════════════════════════════════════════════════
// DESIGN VERSION SUMMARY (for lists)
// ═══════════════════════════════════════════════════════════════

export type DesignVersionSummary = Pick<
  DesignVersion,
  'id' | 'version' | 'name' | 'createdAt' | 'createdBy' | 'status'
> & {
  thumbnailUrl?: string;
  rating?: FeedbackRating;
  isFavorite?: boolean;
};

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new DesignVersion with sensible defaults
 */
export function createDesignVersion(
  projectId: string,
  roomId: string,
  generation: GenerationContext,
  output: OutputDetails,
  specifications: Partial<DesignSpecifications> = {}
): DesignVersion {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    projectId,
    roomId,
    version: 1,
    createdAt: now,
    updatedAt: now,
    createdBy: 'ai',
    generation,
    output,
    specifications: {
      style: 'modern',
      colorPalette: { primary: [], secondary: [], accent: [], neutral: [] },
      materials: [],
      products: [],
      ...specifications,
    },
    feedback: {
      isFavorite: false,
      isApproved: false,
      tags: [],
    },
    childVersions: [],
    status: 'draft',
  };
}

/**
 * Create a child version (refinement) of an existing design
 */
export function createChildVersion(
  parent: DesignVersion,
  generation: GenerationContext,
  output: OutputDetails
): DesignVersion {
  const now = new Date().toISOString();

  return {
    ...parent,
    id: crypto.randomUUID(),
    version: parent.version + 1,
    name: undefined, // Clear name for new version
    createdAt: now,
    updatedAt: now,
    generation,
    output,
    parentVersion: parent.id,
    childVersions: [],
    feedback: {
      isFavorite: false,
      isApproved: false,
      tags: [],
    },
    status: 'draft',
  };
}

/**
 * Calculate total estimated cost from specifications
 */
export function calculateTotalCost(specs: DesignSpecifications): number {
  let total = 0;

  // Sum material costs
  for (const material of specs.materials) {
    if (material.estimatedCost) {
      total += material.estimatedCost;
    }
  }

  // Sum product costs
  for (const product of specs.products) {
    if (product.price) {
      total += product.price;
    }
  }

  // Add explicit estimate if present
  if (specs.estimatedCost?.total) {
    return specs.estimatedCost.total;
  }

  return total;
}

/**
 * Get average rating across multiple versions
 */
export function getAverageRating(versions: DesignVersion[]): number | null {
  const ratings = versions
    .map(v => v.feedback.rating)
    .filter((r): r is FeedbackRating => r !== undefined);

  if (ratings.length === 0) return null;

  return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
}

/**
 * Get all approved versions
 */
export function getApprovedVersions(versions: DesignVersion[]): DesignVersion[] {
  return versions.filter(v => v.feedback.isApproved);
}

/**
 * Get favorites
 */
export function getFavoriteVersions(versions: DesignVersion[]): DesignVersion[] {
  return versions.filter(v => v.feedback.isFavorite);
}
