/**
 * RemodelVision SDK Types
 */

// Budget tiers
export type BudgetTier = 'economy' | 'standard' | 'premium' | 'luxury';

// Design styles
export type DesignStyle =
  | 'modern'
  | 'farmhouse'
  | 'industrial'
  | 'transitional'
  | 'coastal'
  | 'traditional'
  | 'contemporary'
  | 'mid-century'
  | 'scandinavian'
  | 'bohemian';

// Design goals
export type DesignGoal =
  | 'more_storage'
  | 'open_concept'
  | 'natural_light'
  | 'better_flow'
  | 'aging_in_place'
  | 'family_friendly'
  | 'entertaining'
  | 'work_from_home'
  | 'energy_efficiency'
  | 'low_maintenance';

// Address
export interface NormalizedAddress {
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  formatted: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Measurements
export interface Dimensions {
  width: number;
  length: number;
  height: number;
  unit: 'ft' | 'm';
}

export interface MeasurementSet {
  room_dimensions: Dimensions;
  window_count: number;
  door_count: number;
  ceiling_type: 'flat' | 'vaulted' | 'tray' | 'coffered';
  flooring_sqft: number;
  wall_sqft: number;
}

// Space context
export interface SpaceContext {
  id: string;
  type: string;
  name?: string;
  dimensions: Dimensions;
  features: string[];
  style_compatibility: DesignStyle[];
  constraints: string[];
  current_condition: 'excellent' | 'good' | 'fair' | 'dated' | 'needs_work';
  measurements?: MeasurementSet;
}

// Style profile
export interface StyleProfile {
  current_style: DesignStyle;
  architectural_era: string;
  condition: string;
  recommended_styles: DesignStyle[];
  neighborhood_context?: string;
}

// Property context
export interface PropertyContext {
  id: string;
  address: NormalizedAddress;
  property_type: 'single_family' | 'condo' | 'townhouse' | 'multi_family';
  year_built?: number;
  square_footage?: number;
  lot_size?: number;
  spaces: SpaceContext[];
  style_analysis: StyleProfile;
  structural_constraints: string[];
  renovation_opportunities: RenovationOpportunity[];
  confidence_scores: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface RenovationOpportunity {
  space: string;
  opportunity: string;
  estimated_roi: number;
  complexity: 'minor' | 'moderate' | 'major' | 'gut';
  estimated_cost_range: {
    low: number;
    high: number;
  };
}

// Design types
export interface StyleChoice {
  element: string;
  choice: string;
  rationale: string;
  alternatives?: string[];
}

export interface BudgetAllocation {
  category: string;
  percentage: number;
  amount_range: {
    low: number;
    high: number;
  };
}

export interface DesignReasoning {
  layout_rationale: string;
  style_choices: StyleChoice[];
  budget_allocations: BudgetAllocation[];
  tradeoffs_considered: string[];
  constraints_addressed: string[];
}

export interface Visualization {
  id: string;
  url: string;
  thumbnail_url?: string;
  camera_position: string;
  resolution: string;
  created_at: string;
}

export interface Design {
  id: string;
  property_id: string;
  space_id: string;
  style: DesignStyle;
  budget_tier: BudgetTier;
  goals: DesignGoal[];
  visualizations: Visualization[];
  reasoning: DesignReasoning;
  cost_estimate: CostEstimate;
  roi_projection: ROIAnalysis;
  material_specs: MaterialSpec[];
  created_at: string;
}

// Cost types
export interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
  items?: {
    name: string;
    quantity: number;
    unit_cost: number;
    total: number;
  }[];
}

export interface CostEstimate {
  id: string;
  total: {
    low: number;
    mid: number;
    high: number;
  };
  currency: string;
  breakdown: CostBreakdown[];
  labor_included: boolean;
  permits_included: boolean;
  contingency_percentage: number;
  timeline_weeks: {
    low: number;
    high: number;
  };
  market_context: {
    location: string;
    cost_index: number;
    market_condition: 'buyers' | 'neutral' | 'sellers';
  };
  valid_until: string;
}

export interface ROIAnalysis {
  value_add: {
    low: number;
    mid: number;
    high: number;
  };
  roi_percentage: number;
  payback_scenario: string;
  comparable_sales: {
    address: string;
    renovation_type: string;
    cost: number;
    value_increase: number;
    roi: number;
  }[];
  market_trends: string[];
  confidence: number;
}

// Comparison types
export interface ComparisonOption {
  id: string;
  name: string;
  design_id?: string;
  description?: string;
  scores: Record<string, number>;
  recommendation_rank: number;
}

export interface ComparisonResult {
  id: string;
  property_id: string;
  options: ComparisonOption[];
  criteria: string[];
  recommendation: string;
  recommendation_rationale: string;
  created_at: string;
}

// Material specs
export interface MaterialSpec {
  id: string;
  category: string;
  name: string;
  brand?: string;
  model?: string;
  color?: string;
  finish?: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
  supplier?: string;
  lead_time_days?: number;
  alternatives?: MaterialSpec[];
}

// Contractor specs
export interface ContractorSpecs {
  id: string;
  design_id: string;
  format: 'markdown' | 'pdf' | 'json';
  sections: string[];
  trade?: string;
  content: string;
  measurements: MeasurementSet;
  materials: MaterialSpec[];
  scope_of_work: string[];
  timeline: {
    phase: string;
    duration_days: number;
    dependencies: string[];
  }[];
  permits_required: string[];
  created_at: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  meta?: {
    request_id: string;
    processing_time_ms: number;
  };
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
