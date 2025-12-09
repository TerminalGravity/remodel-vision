/**
 * County Assessor Property Scraper
 *
 * Scrapes property data from county assessor websites.
 * This is often the most authoritative source for property details.
 * Since county sites vary widely, we use a generic search approach.
 */

import { firecrawlClient, type ScrapeOptions } from './firecrawlClient';
import type { CountyAssessorScrapedData, SourceReference } from '../../types/property';

// Generic extraction schema for county assessor sites
const ASSESSOR_EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    parcelNumber: {
      type: 'string',
      description: 'Parcel number, APN, or property ID',
    },
    ownerName: {
      type: 'string',
      description: 'Current property owner name',
    },
    legalDescription: {
      type: 'string',
      description: 'Legal description of the property',
    },
    zoning: {
      type: 'string',
      description: 'Zoning classification (e.g., R-1, SF-3)',
    },
    assessedValue: {
      type: 'number',
      description: 'Total assessed value for tax purposes',
    },
    landValue: {
      type: 'number',
      description: 'Assessed land value',
    },
    improvementValue: {
      type: 'number',
      description: 'Assessed improvement/building value',
    },
    taxAmount: {
      type: 'number',
      description: 'Annual property tax amount',
    },
    lotSize: {
      type: 'string',
      description: 'Lot size (acres or sqft)',
    },
    lotDimensions: {
      type: 'string',
      description: 'Lot dimensions if available',
    },
    yearBuilt: {
      type: 'number',
      description: 'Year the structure was built',
    },
    sqft: {
      type: 'number',
      description: 'Building square footage',
    },
    bedrooms: {
      type: 'number',
      description: 'Number of bedrooms',
    },
    bathrooms: {
      type: 'number',
      description: 'Number of bathrooms',
    },
    stories: {
      type: 'number',
      description: 'Number of stories',
    },
    construction: {
      type: 'string',
      description: 'Construction type (wood frame, masonry, etc.)',
    },
    foundation: {
      type: 'string',
      description: 'Foundation type (slab, crawl, basement)',
    },
    roofType: {
      type: 'string',
      description: 'Roof type and material',
    },
    heating: {
      type: 'string',
      description: 'Heating system type',
    },
    cooling: {
      type: 'string',
      description: 'Cooling system type',
    },
    garage: {
      type: 'string',
      description: 'Garage details (type, size)',
    },
    basement: {
      type: 'string',
      description: 'Basement details if applicable',
    },
    permitHistory: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          type: { type: 'string' },
          description: { type: 'string' },
        },
      },
      description: 'Building permit history',
    },
  },
};

// Known county assessor URL patterns by state/county
const COUNTY_ASSESSOR_PATTERNS: Record<string, (address: string, county?: string) => string> = {
  // Texas
  'travis-tx': (address) =>
    `https://traviscad.org/property-search?address=${encodeURIComponent(address)}`,
  'harris-tx': (address) =>
    `https://hcad.org/property-search/property-search/?address=${encodeURIComponent(address)}`,

  // California
  'los-angeles-ca': (address) =>
    `https://portal.assessor.lacounty.gov/parceldetail/${encodeURIComponent(address)}`,

  // Illinois
  'cook-il': (address) =>
    `https://www.cookcountyassessor.com/search?address=${encodeURIComponent(address)}`,

  // Generic fallback - Google search for county assessor
  default: (address, county) =>
    `site:gov "${address}" ${county || ''} property assessor parcel`,
};

/**
 * Determine county from address (simplified)
 */
function extractCountyFromAddress(address: string): string | undefined {
  // This is a simplified approach - in production, you'd use a geocoding API
  const parts = address.split(',').map((p) => p.trim());

  // Try to find county in address
  for (const part of parts) {
    if (part.toLowerCase().includes('county')) {
      return part.replace(/county/i, '').trim();
    }
  }

  return undefined;
}

/**
 * Search for county assessor page
 */
async function searchCountyAssessor(
  address: string,
  county?: string
): Promise<string | null> {
  const searchQuery = `"${address}" property record assessor ${county || ''} site:gov`;

  const searchResult = await firecrawlClient.search(searchQuery, { limit: 5 });

  if (searchResult.success && searchResult.data?.length) {
    // Prefer .gov sites
    const govSite = searchResult.data.find(
      (r) => r.url.includes('.gov') && !r.url.includes('google')
    );
    return govSite?.url || searchResult.data[0]?.url || null;
  }

  return null;
}

export interface CountyAssessorScrapeResult {
  success: boolean;
  data?: CountyAssessorScrapedData;
  source?: SourceReference;
  error?: string;
  url?: string;
}

/**
 * Scrape property data from county assessor
 */
export async function scrapeCountyAssessor(
  address: string,
  county?: string
): Promise<CountyAssessorScrapeResult> {
  if (!firecrawlClient.isConfigured()) {
    return {
      success: false,
      error: 'Firecrawl API not configured',
    };
  }

  // Try to determine county
  const detectedCounty = county || extractCountyFromAddress(address);

  // Search for the assessor page
  const url = await searchCountyAssessor(address, detectedCounty);

  if (!url) {
    return {
      success: false,
      error: 'Could not find county assessor record',
    };
  }

  const scrapeOptions: ScrapeOptions = {
    formats: ['markdown'],
    onlyMainContent: true,
    waitFor: 3000, // County sites can be slow
    extract: {
      schema: ASSESSOR_EXTRACTION_SCHEMA,
      systemPrompt: `You are extracting structured property data from a county assessor or tax records page.
        Extract all available property information accurately.
        Pay attention to:
        - Parcel/APN numbers
        - Assessed values (land, improvements, total)
        - Building characteristics (sqft, bedrooms, bathrooms, year built)
        - Construction details (framing, foundation, roof)
        - Tax information
        - Permit history if available
        For numeric values, extract only the number. For missing data, use null.`,
    },
  };

  const result = await firecrawlClient.scrape<CountyAssessorScrapedData>(
    url,
    scrapeOptions
  );

  if (!result.success) {
    return {
      success: false,
      error: result.error || 'Failed to scrape county assessor',
      url,
    };
  }

  const extractedData = result.data?.extract;

  if (!extractedData) {
    return {
      success: false,
      error: 'No data extracted from county assessor page',
      url,
    };
  }

  const confidence = calculateConfidence(extractedData);

  return {
    success: true,
    data: extractedData,
    url,
    source: {
      source: 'county-assessor',
      url,
      scrapedAt: new Date().toISOString(),
      confidence,
      fields: Object.keys(extractedData).filter(
        (k) =>
          extractedData[k as keyof CountyAssessorScrapedData] !== null &&
          extractedData[k as keyof CountyAssessorScrapedData] !== undefined
      ),
    },
  };
}

/**
 * Calculate confidence score - county assessor data is generally more reliable
 */
function calculateConfidence(data: CountyAssessorScrapedData): number {
  const criticalFields = ['parcelNumber', 'assessedValue', 'yearBuilt', 'sqft'];
  const importantFields = [
    'zoning',
    'lotSize',
    'bedrooms',
    'bathrooms',
    'taxAmount',
  ];
  const bonusFields = [
    'construction',
    'foundation',
    'heating',
    'cooling',
    'permitHistory',
  ];

  let score = 0;
  let maxScore = 0;

  criticalFields.forEach((field) => {
    maxScore += 3;
    if (
      data[field as keyof CountyAssessorScrapedData] !== null &&
      data[field as keyof CountyAssessorScrapedData] !== undefined
    ) {
      score += 3;
    }
  });

  importantFields.forEach((field) => {
    maxScore += 2;
    if (
      data[field as keyof CountyAssessorScrapedData] !== null &&
      data[field as keyof CountyAssessorScrapedData] !== undefined
    ) {
      score += 2;
    }
  });

  bonusFields.forEach((field) => {
    maxScore += 1;
    const value = data[field as keyof CountyAssessorScrapedData];
    if (value !== null && value !== undefined) {
      if (Array.isArray(value) && value.length > 0) {
        score += 1;
      } else if (!Array.isArray(value)) {
        score += 1;
      }
    }
  });

  // County assessor data gets a slight confidence boost (1.1x, capped at 1.0)
  const baseConfidence = score / maxScore;
  return Math.min(Math.round(baseConfidence * 1.1 * 100) / 100, 1.0);
}

export { extractCountyFromAddress, searchCountyAssessor };
