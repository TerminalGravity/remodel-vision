/**
 * Measurement Types - PRD-008 Complete Specification
 *
 * Complete measurement data for rooms and properties.
 * Precision is critical for accurate 3D generation and material estimation.
 */

import type { Orientation } from './property';

// ═══════════════════════════════════════════════════════════════
// MEASUREMENT SOURCE & PRECISION
// ═══════════════════════════════════════════════════════════════

export type MeasurementSource =
  | 'user-input'
  | 'floor-plan'
  | 'blueprint'
  | 'photo-estimate'
  | 'ai-estimate'
  | 'lidar-scan'
  | 'matterport';

export type MeasurementPrecision = 'exact' | 'approximate' | 'estimated';

export type MeasurementUnit = 'ft' | 'in' | 'm' | 'cm';

// ═══════════════════════════════════════════════════════════════
// CORE MEASUREMENT VALUE
// ═══════════════════════════════════════════════════════════════

/**
 * A single measurement value with metadata about source and confidence.
 */
export interface Measurement {
  value: number;
  unit: MeasurementUnit;
  precision: MeasurementPrecision;
  source: MeasurementSource;
  confidence: number; // 0-1

  // Display helpers (optional, computed)
  feet?: number;    // Whole feet component
  inches?: number;  // Remaining inches
  display?: string; // "12' 6\""
}

// ═══════════════════════════════════════════════════════════════
// WALL MEASUREMENTS
// ═══════════════════════════════════════════════════════════════

/**
 * Detailed measurement for a single wall.
 * Includes structural information critical for renovation planning.
 */
export interface WallMeasurement {
  id: string;
  name: string; // "North Wall", "Wall A"
  direction: Orientation;
  length: Measurement;
  height: Measurement;

  // Features on this wall (referenced by ID)
  openings: string[];  // Opening IDs
  features: string[];  // Feature IDs

  // Construction details
  isExterior: boolean;
  isLoadBearing: boolean;
  thickness?: Measurement;

  // Material (for renovation planning)
  material?: 'drywall' | 'plaster' | 'brick' | 'concrete' | 'wood' | 'other';
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
}

// ═══════════════════════════════════════════════════════════════
// OPENING MEASUREMENTS (Windows, Doors, etc.)
// ═══════════════════════════════════════════════════════════════

export type OpeningType =
  | 'window'
  | 'door'
  | 'archway'
  | 'pass-through'
  | 'pocket-door'
  | 'slider'
  | 'french-door'
  | 'bi-fold'
  | 'garage-door';

export type SwingDirection =
  | 'in'
  | 'out'
  | 'left'
  | 'right'
  | 'bi-fold'
  | 'slide'
  | 'up'
  | 'none';

/**
 * Measurement for an opening (window, door, archway, etc.)
 */
export interface OpeningMeasurement {
  id: string;
  type: OpeningType;
  wallId: string;

  // Position on wall
  position: {
    fromLeft: Measurement;  // Distance from left edge of wall
    fromFloor: Measurement; // Sill/threshold height
  };

  // Size
  width: Measurement;
  height: Measurement;

  // Operation
  swingDirection?: SwingDirection;
  operationType?: 'fixed' | 'operable' | 'sliding' | 'casement' | 'awning' | 'hopper';

  // Connection
  connectsTo?: string; // Room ID or "exterior"

  // Additional details
  frameWidth?: Measurement;
  trimWidth?: Measurement;
  material?: string;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
}

// ═══════════════════════════════════════════════════════════════
// FEATURE MEASUREMENTS (Built-ins, Fixtures, etc.)
// ═══════════════════════════════════════════════════════════════

export type FeatureType =
  // Kitchen
  | 'island'
  | 'peninsula'
  | 'counter'
  | 'cabinet-upper'
  | 'cabinet-lower'
  | 'cabinet-tall'
  | 'appliance-space'
  // Bathroom
  | 'shower'
  | 'tub'
  | 'vanity'
  | 'toilet'
  // Living spaces
  | 'fireplace'
  | 'built-in-shelves'
  | 'entertainment-center'
  | 'window-seat'
  // Storage
  | 'closet'
  | 'pantry'
  | 'niche'
  // Structural
  | 'column'
  | 'beam'
  | 'bump-out'
  | 'stairs'
  | 'landing'
  // Utility
  | 'water-heater'
  | 'hvac-unit'
  | 'electrical-panel'
  // Other
  | 'other';

/**
 * 3D position within a room (from origin, typically SW corner at floor)
 */
export interface Position3D {
  x: Measurement; // Distance from origin along length
  y: Measurement; // Distance from floor (height)
  z: Measurement; // Distance from origin along width
}

/**
 * 3D dimensions
 */
export interface Dimensions3D {
  width: Measurement;
  depth: Measurement;
  height: Measurement;
}

/**
 * Measurement for a room feature (built-ins, fixtures, appliances, etc.)
 */
export interface FeatureMeasurement {
  id: string;
  type: FeatureType;
  name: string; // User-friendly name

  // 3D Position in room
  position: Position3D;

  // 3D Size
  dimensions: Dimensions3D;

  // Placement
  wallId?: string;      // If attached to a wall
  isFloorMounted: boolean;
  isCeilingMounted: boolean;

  // Details
  material?: string;
  brand?: string;
  model?: string;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';

  // Renovation flags
  isRemovable: boolean;
  requiresPermit?: boolean;
  estimatedRemovalCost?: number;
}

// ═══════════════════════════════════════════════════════════════
// CLEARANCE MEASUREMENTS (Code Compliance)
// ═══════════════════════════════════════════════════════════════

/**
 * Clearance measurement for code compliance and accessibility.
 * Essential for renovation planning and permit applications.
 */
export interface ClearanceMeasurement {
  name: string; // "Island to counter", "Door swing", "Toilet clearance"
  between: [string, string]; // Feature/wall IDs

  // Measured distance
  distance: Measurement;

  // Code requirements
  minimumRequired?: Measurement; // Per building code
  codeReference?: string;        // "IRC R305.1", "ADA 4.2.4"

  // Compliance status
  isAdequate: boolean;
  deficiency?: Measurement; // How much short of minimum

  // Categories
  category: 'egress' | 'accessibility' | 'work-zone' | 'circulation' | 'safety' | 'other';
}

// ═══════════════════════════════════════════════════════════════
// COMPLETE MEASUREMENT SET
// ═══════════════════════════════════════════════════════════════

/**
 * Complete measurement data for a room.
 * This is the comprehensive measurement schema per PRD-008.
 */
export interface MeasurementSet {
  roomId: string;
  capturedAt: string; // ISO 8601
  source: MeasurementSource;

  // ═══════════════════════════════════════════════════════════════
  // PRIMARY DIMENSIONS
  // ═══════════════════════════════════════════════════════════════
  dimensions: {
    length: Measurement;       // Longer dimension
    width: Measurement;        // Shorter dimension
    height: Measurement;       // Ceiling height (average if varies)

    // Calculated values
    squareFootage: number;
    cubicFootage: number;
    perimeter: number;         // Linear feet
  };

  // ═══════════════════════════════════════════════════════════════
  // DETAILED WALL DATA
  // ═══════════════════════════════════════════════════════════════
  walls: WallMeasurement[];

  // ═══════════════════════════════════════════════════════════════
  // OPENINGS (Windows, Doors, etc.)
  // ═══════════════════════════════════════════════════════════════
  openings: OpeningMeasurement[];

  // ═══════════════════════════════════════════════════════════════
  // FEATURES (Built-ins, Fixtures, etc.)
  // ═══════════════════════════════════════════════════════════════
  features: FeatureMeasurement[];

  // ═══════════════════════════════════════════════════════════════
  // CLEARANCES (Code Compliance)
  // ═══════════════════════════════════════════════════════════════
  clearances: ClearanceMeasurement[];

  // ═══════════════════════════════════════════════════════════════
  // METADATA
  // ═══════════════════════════════════════════════════════════════
  metadata: {
    version: number;
    confidence: number; // Overall confidence 0-1
    lastUpdated: string;
    updatedBy?: string;
    notes?: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Convert a measurement to feet with inches display string
 */
export function formatMeasurement(m: Measurement): string {
  if (m.display) return m.display;

  if (m.unit === 'ft') {
    const feet = Math.floor(m.value);
    const inches = Math.round((m.value - feet) * 12);
    return inches > 0 ? `${feet}' ${inches}"` : `${feet}'`;
  }

  if (m.unit === 'in') {
    const feet = Math.floor(m.value / 12);
    const inches = Math.round(m.value % 12);
    return feet > 0
      ? inches > 0
        ? `${feet}' ${inches}"`
        : `${feet}'`
      : `${inches}"`;
  }

  if (m.unit === 'm') {
    return `${m.value.toFixed(2)}m`;
  }

  if (m.unit === 'cm') {
    return `${Math.round(m.value)}cm`;
  }

  return `${m.value} ${m.unit}`;
}

/**
 * Convert measurement to feet (normalized)
 */
export function toFeet(m: Measurement): number {
  switch (m.unit) {
    case 'ft':
      return m.value;
    case 'in':
      return m.value / 12;
    case 'm':
      return m.value * 3.28084;
    case 'cm':
      return m.value * 0.0328084;
    default:
      return m.value;
  }
}

/**
 * Create a measurement with standard defaults
 */
export function createMeasurement(
  value: number,
  unit: MeasurementUnit = 'ft',
  source: MeasurementSource = 'user-input',
  precision: MeasurementPrecision = 'approximate'
): Measurement {
  return {
    value,
    unit,
    precision,
    source,
    confidence: precision === 'exact' ? 1.0 : precision === 'approximate' ? 0.8 : 0.5,
    display: formatMeasurement({ value, unit, precision, source, confidence: 0.8 }),
  };
}

/**
 * Calculate square footage from length and width measurements
 */
export function calculateSquareFootage(length: Measurement, width: Measurement): number {
  return toFeet(length) * toFeet(width);
}

/**
 * Calculate cubic footage from dimensions
 */
export function calculateCubicFootage(
  length: Measurement,
  width: Measurement,
  height: Measurement
): number {
  return toFeet(length) * toFeet(width) * toFeet(height);
}

/**
 * Calculate perimeter from length and width
 */
export function calculatePerimeter(length: Measurement, width: Measurement): number {
  return 2 * (toFeet(length) + toFeet(width));
}
