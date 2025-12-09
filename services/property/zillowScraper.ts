/**
 * Zillow Property Scraper
 *
 * Scrapes property data from Zillow using Firecrawl API.
 * Handles URL construction, extraction schema, and data normalization.
 */

import { firecrawlClient, type ScrapeOptions } from './firecrawlClient';
import type { ZillowScrapedData, SourceReference } from '../../types/property';

// Zillow extraction schema for LLM-powered extraction
const ZILLOW_EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    zpid: {
      type: 'string',
      description: 'Zillow Property ID',
    },
    address: {
      type: 'string',
      description: 'Full property address',
    },
    price: {
      type: 'number',
      description: 'Current listing price or last sold price in USD',
    },
    zestimate: {
      type: 'number',
      description: 'Zillow estimated market value',
    },
    rentZestimate: {
      type: 'number',
      description: 'Zillow estimated rental value per month',
    },
    bedrooms: {
      type: 'number',
      description: 'Number of bedrooms',
    },
    bathrooms: {
      type: 'number',
      description: 'Number of bathrooms (can be decimal like 2.5)',
    },
    sqft: {
      type: 'number',
      description: 'Living area square footage',
    },
    lotSize: {
      type: 'string',
      description: 'Lot size with units (e.g., "0.25 acres" or "10,890 sqft")',
    },
    yearBuilt: {
      type: 'number',
      description: 'Year the property was built',
    },
    propertyType: {
      type: 'string',
      description: 'Type of property (Single Family, Condo, Townhouse, etc.)',
    },
    homeStatus: {
      type: 'string',
      description: 'Current status (For Sale, Sold, Off Market, etc.)',
    },
    description: {
      type: 'string',
      description: 'Property description text',
    },
    facts: {
      type: 'array',
      items: { type: 'string' },
      description: 'Key facts about the property (heating, cooling, parking, etc.)',
    },
    taxHistory: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          year: { type: 'number' },
          tax: { type: 'number' },
          assessment: { type: 'number' },
        },
      },
      description: 'Property tax history',
    },
    priceHistory: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          price: { type: 'number' },
          event: { type: 'string' },
        },
      },
      description: 'Price history events (sold, listed, price changes)',
    },
    schools: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          rating: { type: 'number' },
          distance: { type: 'string' },
          type: { type: 'string' },
        },
      },
      description: 'Nearby schools with ratings',
    },
    walkScore: {
      type: 'number',
      description: 'Walk Score (0-100)',
    },
    transitScore: {
      type: 'number',
      description: 'Transit Score (0-100)',
    },
    bikeScore: {
      type: 'number',
      description: 'Bike Score (0-100)',
    },
    latitude: {
      type: 'number',
      description: 'Property latitude coordinate',
    },
    longitude: {
      type: 'number',
      description: 'Property longitude coordinate',
    },
  },
};

/**
 * Build Zillow URL from address
 */
function buildZillowUrl(address: string): string {
  // Format address for Zillow URL
  // "123 Main St, Austin, TX 78701" -> "123-Main-St-Austin-TX-78701"
  const formatted = address
    .replace(/[,#]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-');

  return `https://www.zillow.com/homes/${encodeURIComponent(formatted)}_rb/`;
}

/**
 * Alternative: Search Zillow for the property
 */
async function searchZillow(address: string): Promise<string | null> {
  const searchResult = await firecrawlClient.search(
    `site:zillow.com "${address}"`,
    { limit: 3 }
  );

  if (searchResult.success && searchResult.data?.length) {
    // Find the most relevant result (property page, not search results)
    const propertyPage = searchResult.data.find(
      (r) => r.url.includes('/homedetails/') || r.url.includes('_zpid')
    );
    return propertyPage?.url || searchResult.data[0]?.url || null;
  }

  return null;
}

export interface ZillowScrapeResult {
  success: boolean;
  data?: ZillowScrapedData;
  source?: SourceReference;
  error?: string;
  url?: string;
}

/**
 * Scrape property data from Zillow
 */
export async function scrapeZillow(address: string): Promise<ZillowScrapeResult> {
  if (!firecrawlClient.isConfigured()) {
    return {
      success: false,
      error: 'Firecrawl API not configured',
    };
  }

  // Try direct URL first
  let url = buildZillowUrl(address);

  const scrapeOptions: ScrapeOptions = {
    formats: ['markdown'],
    onlyMainContent: true,
    waitFor: 2000, // Wait for dynamic content
    extract: {
      schema: ZILLOW_EXTRACTION_SCHEMA,
      systemPrompt:
        'You are extracting structured property data from a Zillow listing page. Extract all available information accurately. For numeric values, extract only the number without currency symbols or units. For missing data, use null.',
    },
  };

  let result = await firecrawlClient.scrape<ZillowScrapedData>(url, scrapeOptions);

  // If direct URL fails, try searching
  if (!result.success || !result.data?.extract) {
    const searchUrl = await searchZillow(address);
    if (searchUrl) {
      url = searchUrl;
      result = await firecrawlClient.scrape<ZillowScrapedData>(url, scrapeOptions);
    }
  }

  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Failed to scrape Zillow',
      url,
    };
  }

  const extractedData = result.data?.extract;

  if (!extractedData) {
    return {
      success: false,
      error: 'No data extracted from Zillow page',
      url,
    };
  }

  // Calculate confidence based on data completeness
  const confidence = calculateConfidence(extractedData);

  return {
    success: true,
    data: extractedData,
    url,
    source: {
      source: 'zillow',
      url,
      scrapedAt: new Date().toISOString(),
      confidence,
      fields: Object.keys(extractedData).filter(
        (k) => extractedData[k as keyof ZillowScrapedData] !== null &&
               extractedData[k as keyof ZillowScrapedData] !== undefined
      ),
    },
  };
}

/**
 * Calculate confidence score based on data completeness
 */
function calculateConfidence(data: ZillowScrapedData): number {
  const criticalFields = ['address', 'bedrooms', 'bathrooms', 'sqft', 'yearBuilt'];
  const importantFields = ['price', 'zestimate', 'lotSize', 'propertyType'];
  const bonusFields = ['walkScore', 'schools', 'taxHistory', 'priceHistory'];

  let score = 0;
  let maxScore = 0;

  // Critical fields (weight: 3)
  criticalFields.forEach((field) => {
    maxScore += 3;
    if (data[field as keyof ZillowScrapedData] !== null &&
        data[field as keyof ZillowScrapedData] !== undefined) {
      score += 3;
    }
  });

  // Important fields (weight: 2)
  importantFields.forEach((field) => {
    maxScore += 2;
    if (data[field as keyof ZillowScrapedData] !== null &&
        data[field as keyof ZillowScrapedData] !== undefined) {
      score += 2;
    }
  });

  // Bonus fields (weight: 1)
  bonusFields.forEach((field) => {
    maxScore += 1;
    const value = data[field as keyof ZillowScrapedData];
    if (value !== null && value !== undefined) {
      if (Array.isArray(value) && value.length > 0) {
        score += 1;
      } else if (!Array.isArray(value)) {
        score += 1;
      }
    }
  });

  return Math.round((score / maxScore) * 100) / 100;
}

export { buildZillowUrl, searchZillow };
