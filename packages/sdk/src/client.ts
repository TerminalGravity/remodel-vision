/**
 * RemodelVision API Client
 */

import type {
  PropertyContext,
  Design,
  CostEstimate,
  ComparisonResult,
  ContractorSpecs,
  Visualization,
  BudgetTier,
  DesignStyle,
  DesignGoal,
  ApiResponse,
  ApiError,
} from './types.js';

export interface RemodelVisionConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cache?: boolean;
}

interface AnalyzePropertyOptions {
  address?: string;
  listingUrl?: string;
  focusAreas?: string[];
  sourceDocuments?: File[];
}

interface GenerateDesignOptions {
  propertyId: string;
  spaceId: string;
  style: DesignStyle;
  budgetTier: BudgetTier;
  goals?: DesignGoal[];
  constraints?: string[];
}

interface EstimateCostOptions {
  propertyId?: string;
  designId?: string;
  changes?: {
    category: string;
    description: string;
    scope?: 'minor' | 'moderate' | 'major' | 'gut';
  }[];
  includeLabor?: boolean;
  includePermits?: boolean;
}

interface CompareOptionsRequest {
  propertyId: string;
  options: {
    name: string;
    designId?: string;
    description?: string;
  }[];
  criteria?: ('cost' | 'roi' | 'timeline' | 'disruption' | 'resale_value')[];
}

interface GetSpecsOptions {
  designId: string;
  format?: 'markdown' | 'pdf' | 'json';
  sections?: string[];
  tradeSpecific?: 'general' | 'electrical' | 'plumbing' | 'hvac' | 'flooring' | 'cabinetry';
}

interface VisualizeOptions {
  propertyId: string;
  spaceId: string;
  designId?: string;
  cameraPosition?: string;
  resolution?: '1024x1024' | '2048x2048' | '4096x4096';
  outputFormat?: 'png' | 'webp' | 'jpg';
}

class RemodelVisionError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'RemodelVisionError';
  }
}

export class RemodelVision {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private cache: Map<string, { data: unknown; timestamp: number }>;
  private cacheEnabled: boolean;
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  constructor(config: RemodelVisionConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.remodelvision.app';
    this.timeout = config.timeout || 30000;
    this.cacheEnabled = config.cache ?? true;
    this.cache = new Map();
  }

  // Properties API
  properties = {
    analyze: async (options: AnalyzePropertyOptions): Promise<PropertyContext> => {
      return this.request<PropertyContext>('POST', '/v1/properties', {
        address: options.address,
        listing_url: options.listingUrl,
        focus_areas: options.focusAreas,
      });
    },

    get: async (propertyId: string): Promise<PropertyContext> => {
      return this.request<PropertyContext>('GET', `/v1/properties/${propertyId}`);
    },

    update: async (
      propertyId: string,
      updates: Partial<PropertyContext>
    ): Promise<PropertyContext> => {
      return this.request<PropertyContext>('PATCH', `/v1/properties/${propertyId}`, updates);
    },

    refresh: async (propertyId: string): Promise<PropertyContext> => {
      return this.request<PropertyContext>('POST', `/v1/properties/${propertyId}/scrape`);
    },

    listSpaces: async (propertyId: string) => {
      const property = await this.properties.get(propertyId);
      return property.spaces;
    },
  };

  // Designs API
  designs = {
    generate: async (options: GenerateDesignOptions): Promise<Design> => {
      return this.request<Design>('POST', '/v1/designs/generate', {
        property_id: options.propertyId,
        space_id: options.spaceId,
        style: options.style,
        budget_tier: options.budgetTier,
        goals: options.goals,
        constraints: options.constraints,
      });
    },

    get: async (designId: string): Promise<Design> => {
      return this.request<Design>('GET', `/v1/designs/${designId}`);
    },

    iterate: async (
      designId: string,
      feedback: string,
      constraints?: string[]
    ): Promise<Design> => {
      return this.request<Design>('POST', `/v1/designs/${designId}/iterate`, {
        feedback,
        constraints_to_maintain: constraints,
      });
    },

    compare: async (designIds: string[]): Promise<ComparisonResult> => {
      return this.request<ComparisonResult>('POST', '/v1/designs/compare', {
        design_ids: designIds,
      });
    },
  };

  // Cost API
  costs = {
    estimate: async (options: EstimateCostOptions): Promise<CostEstimate> => {
      return this.request<CostEstimate>('POST', '/v1/costs/estimate', {
        property_id: options.propertyId,
        design_id: options.designId,
        changes: options.changes,
        include_labor: options.includeLabor ?? true,
        include_permits: options.includePermits ?? true,
      });
    },
  };

  // Comparison API
  compare = async (options: CompareOptionsRequest): Promise<ComparisonResult> => {
    return this.request<ComparisonResult>('POST', '/v1/compare', {
      property_id: options.propertyId,
      options: options.options,
      comparison_criteria: options.criteria,
    });
  };

  // Visualization API
  visualize = async (options: VisualizeOptions): Promise<Visualization> => {
    return this.request<Visualization>('POST', '/v1/visualize', {
      property_id: options.propertyId,
      space_id: options.spaceId,
      design_id: options.designId,
      camera_position: options.cameraPosition,
      resolution: options.resolution || '2048x2048',
      output_format: options.outputFormat || 'webp',
    });
  };

  // Contractor Specs API
  specs = {
    generate: async (options: GetSpecsOptions): Promise<ContractorSpecs> => {
      return this.request<ContractorSpecs>('POST', '/v1/specs/generate', {
        design_id: options.designId,
        output_format: options.format || 'markdown',
        include_sections: options.sections,
        trade_specific: options.tradeSpecific,
      });
    },
  };

  // HTTP request helper
  private async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    // Check cache for GET requests
    if (method === 'GET' && this.cacheEnabled) {
      const cached = this.cache.get(url);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return cached.data as T;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-SDK-Version': '0.1.0',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          code: 'UNKNOWN_ERROR',
          message: response.statusText,
        }));
        throw new RemodelVisionError(error.message, error.code, error.details);
      }

      const result: ApiResponse<T> = await response.json();

      // Cache successful GET requests
      if (method === 'GET' && this.cacheEnabled) {
        this.cache.set(url, { data: result.data, timestamp: Date.now() });
      }

      return result.data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof RemodelVisionError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new RemodelVisionError('Request timeout', 'TIMEOUT');
      }

      throw new RemodelVisionError(
        error instanceof Error ? error.message : 'Unknown error',
        'NETWORK_ERROR'
      );
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }
}
