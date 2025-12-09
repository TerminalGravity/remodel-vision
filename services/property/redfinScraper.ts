/**
 * Redfin Property Scraper
 *
 * Scrapes property data from Redfin using Firecrawl API.
 * Redfin often has different/complementary data to Zillow.
 */

import { firecrawlClient, type ScrapeOptions } from './firecrawlClient';
import type { RedfinScrapedData, SourceReference } from '../../types/property';

// Redfin extraction schema
const REDFIN_EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    listingId: {
      type: 'string',
      description: 'Redfin listing ID',
    },
    address: {
      type: 'string',
      description: 'Full property address',
    },
    price: {
      type: 'number',
      description: 'Current listing price or last sold price in USD',
    },
    estimate: {
      type: 'number',
      description: 'Redfin estimated market value',
    },
    bedrooms: {
      type: 'number',
      description: 'Number of bedrooms',
    },
    bathrooms: {
      type: 'number',
      description: 'Number of bathrooms (can be decimal)',
    },
    sqft: {
      type: 'number',
      description: 'Living area square footage',
    },
    lotSize: {
      type: 'string',
      description: 'Lot size with units',
    },
    yearBuilt: {
      type: 'number',
      description: 'Year built',
    },
    propertyType: {
      type: 'string',
      description: 'Property type (Single Family Residential, Condo, etc.)',
    },
    status: {
      type: 'string',
      description: 'Listing status',
    },
    description: {
      type: 'string',
      description: 'Property description',
    },
    features: {
      type: 'array',
      items: { type: 'string' },
      description: 'Property features and amenities',
    },
    taxInfo: {
      type: 'object',
      properties: {
        annualAmount: { type: 'number' },
        assessedValue: { type: 'number' },
      },
      description: 'Property tax information',
    },
    hoa: {
      type: 'object',
      properties: {
        fee: { type: 'number' },
        frequency: { type: 'string' },
      },
      description: 'HOA fee information if applicable',
    },
    latitude: {
      type: 'number',
      description: 'Latitude coordinate',
    },
    longitude: {
      type: 'number',
      description: 'Longitude coordinate',
    },
  },
};

/**
 * Build Redfin search URL
 */
function buildRedfinSearchUrl(address: string): string {
  // Redfin uses a search-based approach
  const query = encodeURIComponent(address);
  return `https://www.redfin.com/search?q=${query}`;
}

/**
 * Search Redfin for property URL
 */
async function searchRedfin(address: string): Promise<string | null> {
  const searchResult = await firecrawlClient.search(
    `site:redfin.com "${address}"`,
    { limit: 3 }
  );

  if (searchResult.success && searchResult.data?.length) {
    // Look for property detail pages
    const propertyPage = searchResult.data.find(
      (r) =>
        r.url.includes('/home/') ||
        r.url.match(/\/\d+$/) || // Ends with listing ID
        !r.url.includes('/search')
    );
    return propertyPage?.url || null;
  }

  return null;
}

export interface RedfinScrapeResult {
  success: boolean;
  data?: RedfinScrapedData;
  source?: SourceReference;
  error?: string;
  url?: string;
}

/**
 * Scrape property data from Redfin
 */
export async function scrapeRedfin(address: string): Promise<RedfinScrapeResult> {
  if (!firecrawlClient.isConfigured()) {
    return {
      success: false,
      error: 'Firecrawl API not configured',
    };
  }

  // Redfin requires searching to find the right URL
  const url = await searchRedfin(address);

  if (!url) {
    return {
      success: false,
      error: 'Could not find property on Redfin',
    };
  }

  const scrapeOptions: ScrapeOptions = {
    formats: ['markdown'],
    onlyMainContent: true,
    waitFor: 2000,
    extract: {
      schema: REDFIN_EXTRACTION_SCHEMA,
      systemPrompt:
        'You are extracting structured property data from a Redfin listing page. Extract all available information accurately. For numeric values, extract only the number. For missing data, use null.',
    },
  };

  const result = await firecrawlClient.scrape<RedfinScrapedData>(url, scrapeOptions);

  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Failed to scrape Redfin',
      url,
    };
  }

  const extractedData = result.data?.extract;

  if (!extractedData) {
    return {
      success: false,
      error: 'No data extracted from Redfin page',
      url,
    };
  }

  const confidence = calculateConfidence(extractedData);

  return {
    success: true,
    data: extractedData,
    url,
    source: {
      source: 'redfin',
      url,
      scrapedAt: new Date().toISOString(),
      confidence,
      fields: Object.keys(extractedData).filter(
        (k) => extractedData[k as keyof RedfinScrapedData] !== null &&
               extractedData[k as keyof RedfinScrapedData] !== undefined
      ),
    },
  };
}

/**
 * Calculate confidence score
 */
function calculateConfidence(data: RedfinScrapedData): number {
  const criticalFields = ['address', 'bedrooms', 'bathrooms', 'sqft', 'yearBuilt'];
  const importantFields = ['price', 'estimate', 'lotSize', 'propertyType'];
  const bonusFields = ['taxInfo', 'hoa', 'features'];

  let score = 0;
  let maxScore = 0;

  criticalFields.forEach((field) => {
    maxScore += 3;
    if (data[field as keyof RedfinScrapedData] !== null &&
        data[field as keyof RedfinScrapedData] !== undefined) {
      score += 3;
    }
  });

  importantFields.forEach((field) => {
    maxScore += 2;
    if (data[field as keyof RedfinScrapedData] !== null &&
        data[field as keyof RedfinScrapedData] !== undefined) {
      score += 2;
    }
  });

  bonusFields.forEach((field) => {
    maxScore += 1;
    const value = data[field as keyof RedfinScrapedData];
    if (value !== null && value !== undefined) {
      if (Array.isArray(value) && value.length > 0) {
        score += 1;
      } else if (typeof value === 'object' && Object.keys(value).length > 0) {
        score += 1;
      }
    }
  });

  return Math.round((score / maxScore) * 100) / 100;
}

export { buildRedfinSearchUrl, searchRedfin };
