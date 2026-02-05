/**
 * Project Types - PRD-008 Complete Specification
 *
 * Complete project configuration and user preferences schema.
 * Guides all AI-generated content and design suggestions.
 */

import type { RoomType } from './property';

// ═══════════════════════════════════════════════════════════════
// PROJECT STATUS & PHASE
// ═══════════════════════════════════════════════════════════════

export type ProjectStatus =
  | 'draft'
  | 'planning'
  | 'designing'
  | 'bidding'
  | 'permitting'
  | 'in-progress'
  | 'on-hold'
  | 'completed'
  | 'archived';

export type ProjectPhase =
  | 'inspiration'
  | 'space-planning'
  | 'design-development'
  | 'documentation'
  | 'procurement'
  | 'construction'
  | 'install'
  | 'punch-list'
  | 'complete';

// ═══════════════════════════════════════════════════════════════
// CLIENT INFO
// ═══════════════════════════════════════════════════════════════

export interface ClientInfo {
  name: string;
  email?: string;
  phone?: string;
  notes?: string;

  // Optional extended info
  company?: string;
  address?: string;
  preferredContact?: 'email' | 'phone' | 'text';
}

// ═══════════════════════════════════════════════════════════════
// DESIGN STYLE & PREFERENCES
// ═══════════════════════════════════════════════════════════════

export type DesignStyleType =
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

export type WoodPreference =
  | 'oak'
  | 'walnut'
  | 'maple'
  | 'cherry'
  | 'ash'
  | 'teak'
  | 'mahogany'
  | 'pine'
  | 'hickory'
  | 'birch'
  | 'reclaimed'
  | 'white-oak'
  | 'rift-sawn-oak';

export type StonePreference =
  | 'marble'
  | 'granite'
  | 'quartzite'
  | 'soapstone'
  | 'limestone'
  | 'travertine'
  | 'slate'
  | 'bluestone'
  | 'concrete'
  | 'terrazzo';

export type MetalFinish =
  | 'polished-nickel'
  | 'brushed-nickel'
  | 'polished-chrome'
  | 'satin-brass'
  | 'antique-brass'
  | 'oil-rubbed-bronze'
  | 'matte-black'
  | 'polished-brass'
  | 'copper'
  | 'stainless-steel'
  | 'gunmetal'
  | 'champagne-bronze';

export type ColorTemperature = 'warm' | 'neutral' | 'cool';

/**
 * Color palette for a project
 */
export interface ColorPalette {
  primary: string[];   // Hex codes
  accent: string[];
  neutral: string[];
}

/**
 * Material preferences that define the project's material DNA
 */
export interface MaterialPreferences {
  wood: WoodPreference[];
  stone: StonePreference[];
  metal: MetalFinish[];
  fabric: string[]; // Free-form: "linen", "velvet", "leather", etc.
}

/**
 * Design DNA - The aesthetic blueprint for all AI generations
 */
export interface DesignDNA {
  primaryStyle: DesignStyleType;
  secondaryStyle?: DesignStyleType;
  colorTemperature: ColorTemperature;

  colorPalette?: ColorPalette;
  materialPreferences: MaterialPreferences;

  // Keywords that guide AI generation
  aestheticKeywords: string[];   // "collected", "minimal", "cozy", "sophisticated"
  avoidKeywords: string[];       // "industrial", "stark", "ornate", "cluttered"

  // Reference images for style matching
  inspirationImages: string[];   // URLs or asset IDs
}

// ═══════════════════════════════════════════════════════════════
// BUDGET
// ═══════════════════════════════════════════════════════════════

export type BudgetTier =
  | 'economy'     // $50-100/sqft
  | 'standard'    // $100-200/sqft
  | 'premium'     // $200-400/sqft
  | 'luxury';     // $400+/sqft

/**
 * Budget breakdown by category
 */
export interface BudgetBreakdown {
  materials: number;
  labor: number;
  design: number;
  permits: number;
  contingency: number;

  // Detailed breakdown by room/area
  byRoom?: Record<string, number>;
  byCategory?: Record<string, number>;
}

/**
 * Complete budget configuration
 */
export interface ProjectBudget {
  tier: BudgetTier;
  total?: number;        // Total budget in dollars
  currency?: string;     // Default: 'USD'
  breakdown?: BudgetBreakdown;

  // Priority allocation
  priorityAreas: string[];   // Room IDs in priority order
  flexibleAreas: string[];   // Areas where budget can flex

  // Tracking
  spent?: number;
  remaining?: number;
  lastUpdated?: string;
}

// ═══════════════════════════════════════════════════════════════
// SCOPE & WORK TYPES
// ═══════════════════════════════════════════════════════════════

export type ScopeType =
  | 'cosmetic'        // Paint, fixtures, minor updates
  | 'renovation'      // Updates to existing systems/finishes
  | 'remodel'         // Layout changes, new features
  | 'addition'        // Adding square footage
  | 'gut-renovation'; // Down to studs

export type WorkType =
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

/**
 * Room scope definition
 */
export interface RoomScope {
  roomId: string;
  type: RoomType;
  workTypes: WorkType[];
  excludedWork: WorkType[];
  notes?: string;
}

/**
 * Complete project scope
 */
export interface ProjectScope {
  rooms: RoomScope[];
  type: ScopeType;
  workTypes: WorkType[];      // Global work types
  excludedWork: WorkType[];   // Globally excluded
}

// ═══════════════════════════════════════════════════════════════
// CONSTRAINTS
// ═══════════════════════════════════════════════════════════════

export type OccupancyStatus = 'vacant' | 'occupied' | 'partial';

/**
 * Timeline constraint for the project
 */
export interface TimelineConstraint {
  type: 'flexible' | 'soft-deadline' | 'hard-deadline';
  startDate?: string;      // ISO 8601
  endDate?: string;
  milestones?: Array<{
    name: string;
    date: string;
    required: boolean;
  }>;
  blackoutDates?: string[]; // Dates work cannot be done
  notes?: string;
}

/**
 * Noise restriction details
 */
export interface NoiseRestriction {
  restricted: boolean;
  allowedHours?: string;   // "8am-6pm"
  allowedDays?: string[];  // ["Mon", "Tue", "Wed", "Thu", "Fri"]
  notes?: string;
}

/**
 * Project constraints
 */
export interface ProjectConstraints {
  timeline: TimelineConstraint;
  occupancy: OccupancyStatus;
  noise: NoiseRestriction;

  // Access restrictions
  access: string[];          // "Rear entry only", "No parking on street"

  // Regulatory
  permits: string[];         // Required permits
  hoa: string[];             // HOA requirements
  historicRequirements?: string[];

  // Other constraints
  other: string[];
}

// ═══════════════════════════════════════════════════════════════
// TEAM CONTACTS
// ═══════════════════════════════════════════════════════════════

export type TeamRole =
  | 'owner'
  | 'designer'
  | 'architect'
  | 'general-contractor'
  | 'project-manager'
  | 'electrician'
  | 'plumber'
  | 'hvac'
  | 'painter'
  | 'flooring'
  | 'cabinet'
  | 'tile'
  | 'other';

/**
 * Team contact information
 */
export interface TeamContact {
  id: string;
  role: TeamRole;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  notes?: string;
  isPrimary?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// LOCATION
// ═══════════════════════════════════════════════════════════════

export interface ProjectLocation {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  timezone?: string;
}

// ═══════════════════════════════════════════════════════════════
// PROJECT CONFIG (Complete Schema)
// ═══════════════════════════════════════════════════════════════

/**
 * Complete project configuration per PRD-008.
 * Guides all AI-generated content and suggestions.
 */
export interface ProjectConfig {
  id: string;
  propertyId: string;
  name: string;

  // ═══════════════════════════════════════════════════════════════
  // CLIENT INFO
  // ═══════════════════════════════════════════════════════════════
  client: ClientInfo;

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
  designDNA: DesignDNA;

  // ═══════════════════════════════════════════════════════════════
  // BUDGET
  // ═══════════════════════════════════════════════════════════════
  budget: ProjectBudget;

  // ═══════════════════════════════════════════════════════════════
  // SCOPE
  // ═══════════════════════════════════════════════════════════════
  scope: ProjectScope;

  // ═══════════════════════════════════════════════════════════════
  // CONSTRAINTS
  // ═══════════════════════════════════════════════════════════════
  constraints: ProjectConstraints;

  // ═══════════════════════════════════════════════════════════════
  // TEAM
  // ═══════════════════════════════════════════════════════════════
  team: TeamContact[];

  // ═══════════════════════════════════════════════════════════════
  // LOCATION
  // ═══════════════════════════════════════════════════════════════
  location: ProjectLocation;

  // ═══════════════════════════════════════════════════════════════
  // TIMESTAMPS
  // ═══════════════════════════════════════════════════════════════
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// PROJECT CONFIG SUMMARY (for lists)
// ═══════════════════════════════════════════════════════════════

export type ProjectConfigSummary = Pick<
  ProjectConfig,
  'id' | 'propertyId' | 'name' | 'status' | 'phase' | 'createdAt' | 'updatedAt'
> & {
  clientName: string;
  thumbnailUrl?: string;
  budgetTier: BudgetTier;
  primaryStyle: DesignStyleType;
  roomCount?: number;
};

// ═══════════════════════════════════════════════════════════════
// LEGACY COMPATIBILITY
// ═══════════════════════════════════════════════════════════════

/**
 * Legacy ProjectConfig for backwards compatibility with existing store.
 * Use ProjectConfig for new implementations.
 */
export interface LegacyProjectConfig {
  style: string;
  budget: 'Economy' | 'Standard' | 'Premium' | 'Luxury';
  timeline: string;
  preferences: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

/**
 * Legacy Project interface for backwards compatibility.
 * Use ProjectConfig for new implementations.
 */
export interface LegacyProject {
  id: string;
  name: string;
  clientName: string;
  status: 'planning' | 'in-progress' | 'completed';
  lastModified: number;
  thumbnail?: string;
  config: LegacyProjectConfig;
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new ProjectConfig with sensible defaults
 */
export function createProjectConfig(
  name: string,
  propertyId: string,
  clientName: string,
  location: ProjectLocation
): ProjectConfig {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    propertyId,
    name,
    client: { name: clientName },
    status: 'draft',
    phase: 'inspiration',
    designDNA: {
      primaryStyle: 'transitional',
      colorTemperature: 'neutral',
      materialPreferences: {
        wood: [],
        stone: [],
        metal: [],
        fabric: [],
      },
      aestheticKeywords: [],
      avoidKeywords: [],
      inspirationImages: [],
    },
    budget: {
      tier: 'standard',
      priorityAreas: [],
      flexibleAreas: [],
    },
    scope: {
      rooms: [],
      type: 'renovation',
      workTypes: [],
      excludedWork: [],
    },
    constraints: {
      timeline: { type: 'flexible' },
      occupancy: 'vacant',
      noise: { restricted: false },
      access: [],
      permits: [],
      hoa: [],
      other: [],
    },
    team: [],
    location,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Convert legacy project config to new format
 */
export function migrateFromLegacy(
  legacy: LegacyProject,
  propertyId: string
): ProjectConfig {
  const now = new Date().toISOString();

  // Map legacy budget to tier
  const budgetMap: Record<string, BudgetTier> = {
    'Economy': 'economy',
    'Standard': 'standard',
    'Premium': 'premium',
    'Luxury': 'luxury',
  };

  // Map legacy status to new status
  const statusMap: Record<string, ProjectStatus> = {
    'planning': 'planning',
    'in-progress': 'in-progress',
    'completed': 'completed',
  };

  return {
    id: legacy.id,
    propertyId,
    name: legacy.name,
    client: { name: legacy.clientName },
    status: statusMap[legacy.status] || 'draft',
    phase: legacy.status === 'completed' ? 'complete' : 'inspiration',
    designDNA: {
      primaryStyle: parseDesignStyle(legacy.config.style),
      colorTemperature: 'neutral',
      materialPreferences: {
        wood: [],
        stone: [],
        metal: [],
        fabric: [],
      },
      aestheticKeywords: legacy.config.preferences.split(',').map(s => s.trim()).filter(Boolean),
      avoidKeywords: [],
      inspirationImages: [],
    },
    budget: {
      tier: budgetMap[legacy.config.budget] || 'standard',
      priorityAreas: [],
      flexibleAreas: [],
    },
    scope: {
      rooms: [],
      type: 'renovation',
      workTypes: [],
      excludedWork: [],
    },
    constraints: {
      timeline: {
        type: 'flexible',
        notes: legacy.config.timeline,
      },
      occupancy: 'vacant',
      noise: { restricted: false },
      access: [],
      permits: [],
      hoa: [],
      other: [],
    },
    team: [],
    location: {
      lat: legacy.config.location.lat,
      lng: legacy.config.location.lng,
      address: legacy.config.location.address,
    },
    createdAt: new Date(legacy.lastModified).toISOString(),
    updatedAt: now,
  };
}

/**
 * Parse a design style string to DesignStyleType
 */
function parseDesignStyle(style: string): DesignStyleType {
  const normalized = style.toLowerCase().replace(/\s+/g, '-');
  const validStyles: DesignStyleType[] = [
    'modern', 'contemporary', 'transitional', 'traditional', 'farmhouse',
    'modern-farmhouse', 'industrial', 'scandinavian', 'japandi', 'mid-century',
    'coastal', 'mediterranean', 'bohemian', 'minimalist', 'maximalist',
    'art-deco', 'craftsman', 'rustic', 'french-country', 'organic-modern'
  ];

  const found = validStyles.find(s => normalized.includes(s));
  return found || 'transitional';
}

/**
 * Calculate budget totals from breakdown
 */
export function calculateBudgetTotal(breakdown: BudgetBreakdown): number {
  return (
    breakdown.materials +
    breakdown.labor +
    breakdown.design +
    breakdown.permits +
    breakdown.contingency
  );
}

/**
 * Get project progress percentage based on phase
 */
export function getProjectProgress(phase: ProjectPhase): number {
  const phases: ProjectPhase[] = [
    'inspiration',
    'space-planning',
    'design-development',
    'documentation',
    'procurement',
    'construction',
    'install',
    'punch-list',
    'complete',
  ];

  const index = phases.indexOf(phase);
  if (index === -1) return 0;

  return Math.round((index / (phases.length - 1)) * 100);
}

/**
 * Check if project is in design phases
 */
export function isInDesignPhase(phase: ProjectPhase): boolean {
  return ['inspiration', 'space-planning', 'design-development'].includes(phase);
}

/**
 * Check if project is in construction phases
 */
export function isInConstructionPhase(phase: ProjectPhase): boolean {
  return ['construction', 'install', 'punch-list'].includes(phase);
}

/**
 * Get rooms in scope by type
 */
export function getRoomsByType(scope: ProjectScope, type: RoomType): RoomScope[] {
  return scope.rooms.filter(r => r.type === type);
}

/**
 * Check if a work type is included in scope
 */
export function isWorkTypeInScope(scope: ProjectScope, workType: WorkType): boolean {
  if (scope.excludedWork.includes(workType)) return false;
  return scope.workTypes.includes(workType);
}
