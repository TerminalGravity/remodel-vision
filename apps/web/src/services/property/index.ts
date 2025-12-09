/**
 * Property Service Index
 *
 * Exports all property-related services for easy imports.
 */

// Main service
export {
  fetchPropertyData,
  fetchFromSource,
  isPropertyServiceAvailable,
  legacyMetaToContext,
  type FetchPropertyOptions,
  type FetchPropertyResult,
} from './propertyService';

// Individual scrapers
export { scrapeZillow, type ZillowScrapeResult } from './zillowScraper';
export { scrapeRedfin, type RedfinScrapeResult } from './redfinScraper';
export { scrapeCountyAssessor, type CountyAssessorScrapeResult } from './countyAssessorScraper';

// Data merger
export { mergePropertyData } from './dataMerger';

// Firecrawl client
export { firecrawlClient, FirecrawlClient, type FirecrawlConfig, type ScrapeOptions } from './firecrawlClient';
