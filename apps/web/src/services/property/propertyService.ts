/**
 * Property Service
 *
 * Main service for fetching and managing property data.
 * Orchestrates scraping from multiple sources and merges into PropertyContext.
 */

import { scrapeZillow, type ZillowScrapeResult } from './zillowScraper';
import { scrapeRedfin, type RedfinScrapeResult } from './redfinScraper';
import { scrapeCountyAssessor, type CountyAssessorScrapeResult } from './countyAssessorScraper';
import { mergePropertyData } from './dataMerger';
import { firecrawlClient } from './firecrawlClient';
import type {
  PropertyContext,
  PropertyDataMergeResult,
  SourceReference,
  DataSource,
} from '../../types/property';

export interface FetchPropertyOptions {
  sources?: DataSource[];
  parallel?: boolean;
  timeout?: number;
  county?: string;
}

export interface FetchPropertyResult {
  success: boolean;
  property?: PropertyContext;
  mergeResult?: PropertyDataMergeResult;
  errors: Array<{ source: DataSource; error: string }>;
  timing: {
    total: number;
    bySource: Record<DataSource, number>;
  };
}

const DEFAULT_OPTIONS: FetchPropertyOptions = {
  sources: ['zillow', 'redfin', 'county-assessor'],
  parallel: true,
  timeout: 60000,
};

/**
 * Fetch property data from all configured sources
 */
export async function fetchPropertyData(
  address: string,
  options: FetchPropertyOptions = {}
): Promise<FetchPropertyResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();
  const errors: Array<{ source: DataSource; error: string }> = [];
  const timing: Record<DataSource, number> = {
    zillow: 0,
    redfin: 0,
    'county-assessor': 0,
    mls: 0,
    'user-input': 0,
    'ai-estimate': 0,
    document: 0,
  };

  // Check if Firecrawl is configured
  if (!firecrawlClient.isConfigured()) {
    return {
      success: false,
      errors: [{ source: 'zillow', error: 'Firecrawl API not configured. Set VITE_FIRECRAWL_API_KEY.' }],
      timing: { total: 0, bySource: timing },
    };
  }

  // Determine which sources to fetch
  const sources = opts.sources || [];

  // Fetch data from sources
  let zillowResult: ZillowScrapeResult | undefined;
  let redfinResult: RedfinScrapeResult | undefined;
  let countyResult: CountyAssessorScrapeResult | undefined;

  if (opts.parallel) {
    // Parallel fetching
    const promises: Promise<void>[] = [];

    if (sources.includes('zillow')) {
      promises.push(
        (async () => {
          const start = Date.now();
          zillowResult = await scrapeZillow(address);
          timing.zillow = Date.now() - start;
          if (!zillowResult.success) {
            errors.push({ source: 'zillow', error: zillowResult.error || 'Unknown error' });
          }
        })()
      );
    }

    if (sources.includes('redfin')) {
      promises.push(
        (async () => {
          const start = Date.now();
          redfinResult = await scrapeRedfin(address);
          timing.redfin = Date.now() - start;
          if (!redfinResult.success) {
            errors.push({ source: 'redfin', error: redfinResult.error || 'Unknown error' });
          }
        })()
      );
    }

    if (sources.includes('county-assessor')) {
      promises.push(
        (async () => {
          const start = Date.now();
          countyResult = await scrapeCountyAssessor(address, opts.county);
          timing['county-assessor'] = Date.now() - start;
          if (!countyResult.success) {
            errors.push({ source: 'county-assessor', error: countyResult.error || 'Unknown error' });
          }
        })()
      );
    }

    await Promise.all(promises);
  } else {
    // Sequential fetching
    if (sources.includes('zillow')) {
      const start = Date.now();
      zillowResult = await scrapeZillow(address);
      timing.zillow = Date.now() - start;
      if (!zillowResult.success) {
        errors.push({ source: 'zillow', error: zillowResult.error || 'Unknown error' });
      }
    }

    if (sources.includes('redfin')) {
      const start = Date.now();
      redfinResult = await scrapeRedfin(address);
      timing.redfin = Date.now() - start;
      if (!redfinResult.success) {
        errors.push({ source: 'redfin', error: redfinResult.error || 'Unknown error' });
      }
    }

    if (sources.includes('county-assessor')) {
      const start = Date.now();
      countyResult = await scrapeCountyAssessor(address, opts.county);
      timing['county-assessor'] = Date.now() - start;
      if (!countyResult.success) {
        errors.push({ source: 'county-assessor', error: countyResult.error || 'Unknown error' });
      }
    }
  }

  // Check if we got any data
  const hasData =
    zillowResult?.success ||
    redfinResult?.success ||
    countyResult?.success;

  if (!hasData) {
    return {
      success: false,
      errors,
      timing: { total: Date.now() - startTime, bySource: timing },
    };
  }

  // Merge data from all sources
  const mergeResult = mergePropertyData(
    address,
    {
      zillow: zillowResult?.data,
      redfin: redfinResult?.data,
      countyAssessor: countyResult?.data,
    },
    {
      zillow: zillowResult?.source,
      redfin: redfinResult?.source,
      countyAssessor: countyResult?.source,
    }
  );

  return {
    success: true,
    property: mergeResult.property,
    mergeResult,
    errors,
    timing: { total: Date.now() - startTime, bySource: timing },
  };
}

/**
 * Fetch property data from a single source
 */
export async function fetchFromSource(
  address: string,
  source: DataSource
): Promise<{
  success: boolean;
  data?: unknown;
  source?: SourceReference;
  error?: string;
}> {
  switch (source) {
    case 'zillow':
      return scrapeZillow(address);
    case 'redfin':
      return scrapeRedfin(address);
    case 'county-assessor':
      return scrapeCountyAssessor(address);
    default:
      return {
        success: false,
        error: `Unsupported source: ${source}`,
      };
  }
}

/**
 * Check if property service is available
 */
export function isPropertyServiceAvailable(): boolean {
  return firecrawlClient.isConfigured();
}

/**
 * Convert legacy PropertyMeta to PropertyContext
 */
export function legacyMetaToContext(
  meta: {
    zoning: string;
    lotSize: string;
    yearBuilt: string;
    sunExposure: string;
    schoolDistrict: string;
    walkScore: number;
  },
  address: string
): Partial<PropertyContext> {
  return {
    address: {
      formatted: address,
      street: address.split(',')[0] || address,
      city: '',
      state: '',
      zip: '',
      county: '',
      country: 'US',
    },
    regulatory: {
      zoning: meta.zoning,
    },
    details: {
      propertyType: 'single-family',
      yearBuilt: parseInt(meta.yearBuilt) || 0,
      stories: 1,
      lotSize: { value: 0, unit: 'sqft' },
      livingArea: { value: 0, unit: 'sqft' },
      bedrooms: 0,
      bathrooms: 0,
    },
    neighborhood: {
      walkScore: meta.walkScore,
      schoolDistrict: meta.schoolDistrict,
    },
    location: {
      lat: 0,
      lng: 0,
      orientation: meta.sunExposure.includes('South')
        ? 'S'
        : meta.sunExposure.includes('North')
        ? 'N'
        : meta.sunExposure.includes('East')
        ? 'E'
        : meta.sunExposure.includes('West')
        ? 'W'
        : undefined,
    },
  };
}

// Export individual scrapers for direct use
export { scrapeZillow } from './zillowScraper';
export { scrapeRedfin } from './redfinScraper';
export { scrapeCountyAssessor } from './countyAssessorScraper';
export { mergePropertyData } from './dataMerger';
export { firecrawlClient } from './firecrawlClient';
