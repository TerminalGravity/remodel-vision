/**
 * Generation Context Types
 *
 * Types for bridging PropertyContext to AI image generation.
 * Packages spatial anchors, design intent, and rendering parameters
 * for consistent Gemini 3 Pro Image (Nano Banana Pro) outputs.
 *
 * Key capability: Gemini 3 supports up to 14 reference inputs with
 * consistency tracking, native spatial control, and physics simulation.
 */

import type { RoomType } from './property';

// ═══════════════════════════════════════════════════════════════
// TYPE ALIASES
// ═══════════════════════════════════════════════════════════════

export type DesignStyleType =
  | 'modern'
  | 'contemporary'
  | 'transitional'
  | 'traditional'
  | 'industrial'
  | 'farmhouse'
  | 'modern-farmhouse'
  | 'coastal'
  | 'mediterranean'
  | 'scandinavian'
  | 'mid-century-modern'
  | 'bohemian'
  | 'minimalist'
  | 'rustic'
  | 'art-deco'
  | 'craftsman';

export type BudgetTier = 'economy' | 'standard' | 'premium' | 'luxury';
export type TimeOfDay = 'morning' | 'midday' | 'afternoon' | 'golden-hour' | 'evening' | 'night';
export type LightingStyleType = 'natural' | 'dramatic' | 'soft' | 'bright' | 'moody';
export type AspectRatio = '16:9' | '4:3' | '1:1' | '9:16' | '3:4';
export type Resolution = '1080p' | '2k' | '4k';
export type RenderStyle = 'photorealistic' | 'editorial' | 'architectural' | 'sketch' | 'watercolor';

// ═══════════════════════════════════════════════════════════════
// CAMERA & SPATIAL
// ═══════════════════════════════════════════════════════════════

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  aspect: number;
  up: [number, number, number];
  // Derived for prompting
  perspectiveType?: 'bird-eye' | 'eye-level' | 'low-angle' | 'corner';
  facingDirection?: 'north' | 'south' | 'east' | 'west' | 'northeast' | 'northwest' | 'southeast' | 'southwest';
}

export interface RoomBounds {
  width: number;   // X-axis (feet)
  depth: number;   // Z-axis (feet)
  height: number;  // Y-axis (feet)
  sqft?: number;
}

export interface SpatialContext {
  referenceImage: string;  // Base64 PNG from Three.js capture
  cameraParams: CameraState;
  roomBounds: RoomBounds;
  roomType: RoomType | string;
  floor?: number;
  adjacentRooms?: Array<{ name: string; direction: string }>;
  naturalLight?: {
    windowCount: number;
    primaryDirection: string;
    intensity: 'abundant' | 'moderate' | 'limited';
  };
  confidence: number;  // 0.0-1.0 spatial accuracy
}

// ═══════════════════════════════════════════════════════════════
// DESIGN SPECIFICATION
// ═══════════════════════════════════════════════════════════════

export interface DesignElement {
  style: string;
  material?: string;
  color?: string;
  finish?: string;
  pattern?: string;
  brand?: string;
  reference?: string;  // Base64 reference image
  pricePoint?: BudgetTier;
  description?: string;
}

export interface DesignSpecification {
  style: string;  // "Modern Farmhouse", "Contemporary", etc.
  budgetTier?: BudgetTier;
  colorPalette?: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
  };
  elements: {
    sink?: DesignElement;
    countertop?: DesignElement;
    backsplash?: DesignElement;
    cabinets?: DesignElement;
    fixtures?: DesignElement;
    lighting?: DesignElement;
    flooring?: DesignElement;
    walls?: DesignElement;
    ceiling?: DesignElement;
    furniture?: DesignElement;
    appliances?: DesignElement;
    hardware?: DesignElement;
    [key: string]: DesignElement | undefined;
  };
  preserveElements: string[];  // Elements to keep unchanged
  removeElements?: string[];   // Elements to explicitly remove
  mood?: string[];             // e.g., ["warm", "inviting", "sophisticated"]
  focalPoint?: string;         // e.g., "fireplace", "kitchen island"
}

// ═══════════════════════════════════════════════════════════════
// LIGHTING & RENDERING
// ═══════════════════════════════════════════════════════════════

export interface LightingConfig {
  time: TimeOfDay;
  style: LightingStyleType;
  direction?: string;          // "from window on left"
  artificialLighting?: 'on' | 'off' | 'accent-only' | 'ambient';
  shadowSoftness?: 'hard' | 'soft' | 'very-soft';
  season?: 'spring' | 'summer' | 'fall' | 'winter';
}

export interface RenderingConfig {
  lighting: LightingConfig;
  camera: {
    angle: string;
    focusDepth: 'deep' | 'shallow' | 'selective';
    focusTarget?: string;
  };
  quality: {
    resolution: Resolution;
    aspectRatio?: AspectRatio;
    style: RenderStyle;
  };
  staging?: 'fully-furnished' | 'minimal' | 'empty' | 'construction';
  showPeople?: boolean;
  showPets?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// PROPERTY CONTEXT FOR GENERATION
// ═══════════════════════════════════════════════════════════════

export interface PropertyContextForGeneration {
  yearBuilt: number;
  architecturalStyle: string;
  region: string;
  climate?: string;
  existingFinishes: {
    flooring?: string;
    walls?: string;
    counters?: string;
    cabinets?: string;
    ceiling?: string;
    trim?: string;
  };
  historicRestrictions?: boolean;
  hoaRestrictions?: string[];
}

// ═══════════════════════════════════════════════════════════════
// REFERENCE IMAGES (Gemini 3 supports up to 14)
// ═══════════════════════════════════════════════════════════════

export interface ReferenceImage {
  id: string;
  type: 'style' | 'material' | 'element' | 'layout' | 'existing-condition' | 'inspiration';
  category?: string;      // Links to specific element
  imageData: string;      // Base64
  weight?: number;        // 0.0-1.0 influence strength
  description: string;    // What this reference represents
}

// ═══════════════════════════════════════════════════════════════
// MASTER GENERATION CONTEXT
// ═══════════════════════════════════════════════════════════════

export interface GenerationContext {
  // Spatial grounding
  spatial: {
    referenceImage: string;  // Base64
    cameraParams: CameraState;
    roomBounds: {
      width: number;
      depth: number;
      height: number;
    };
    roomType: string;
    confidence: number;
  };

  // Property context
  property: {
    yearBuilt: number;
    architecturalStyle: string;
    region: string;
    existingFinishes: {
      flooring?: string;
      walls?: string;
      counters?: string;
      cabinets?: string;
    };
  };

  // Design intent
  design: DesignSpecification;

  // Rendering parameters
  rendering: RenderingConfig;

  // Reference images for Gemini 3 multi-reference
  references: Record<string, string>;  // element name → base64
}

export interface GeneratedResult {
  id: string;
  image: string;  // Base64 or URL
  prompt: string;
  designSpec: DesignSpecification;
  generationContext: GenerationContext;
  timestamp: number;
  metadata: {
    model: string;
    generationTime: number;
    seed?: number;
    resolution?: string;
    aspectRatio?: string;
    // Usage metrics from API response
    tokensUsed?: number;
    promptTokens?: number;
    completionTokens?: number;
    estimatedCost?: number;
  };

  // Compatibility fields for existing UI components
  type?: 'image' | 'video'; // Default to 'image'
  generatedUrl?: string;    // Alias for 'image'
  originalImage?: string;   // Alias for generationContext.spatial.referenceImage
  thumbnailUrl?: string;    // For video support
}

// ═══════════════════════════════════════════════════════════════
// GENERATION REQUEST & RESPONSE
// ═══════════════════════════════════════════════════════════════

export interface GenerationRequest {
  context: GenerationContext;
  variations?: number;        // How many variations to generate (1-4)
  seed?: number;              // For reproducibility
  guidanceScale?: number;     // How closely to follow prompt (1-20)
  negativePrompt?: string;    // What to avoid
}

export interface GenerationResponse {
  success: boolean;
  images: GeneratedResult[];
  error?: string;
  usage?: {
    tokensUsed: number;
    imagesGenerated: number;
    cost?: number;
  };
}

// ═══════════════════════════════════════════════════════════════
// PROMPT BUILDING
// ═══════════════════════════════════════════════════════════════

export interface PromptComponents {
  spatial: string;        // "Corner view of a 12x15ft kitchen..."
  style: string;          // "Modern farmhouse aesthetic with warm neutrals..."
  materials: string;      // "White oak hardwood flooring in herringbone pattern..."
  lighting: string;       // "Natural morning light from east-facing windows..."
  mood: string;           // "Warm, inviting atmosphere..."
  technical: string;      // "Photorealistic rendering at 4K resolution..."
}

export interface BuiltPrompt {
  main: string;
  system?: string;
  negative?: string;
  components: PromptComponents;
}

// ═══════════════════════════════════════════════════════════════
// CONTEXT BUILDER OPTIONS
// ═══════════════════════════════════════════════════════════════

export interface ContextBuilderOptions {
  includeAdjacentRooms?: boolean;
  autoDetectLighting?: boolean;
  enrichFromListingPhotos?: boolean;
  confidenceThreshold?: number;
}

