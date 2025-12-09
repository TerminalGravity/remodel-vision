/**
 * Property Data Merger
 *
 * Merges property data from multiple sources (Zillow, Redfin, County Assessor)
 * into a unified PropertyContext with confidence scoring and conflict resolution.
 */

import type {
  PropertyContext,
  PropertyAddress,
  PropertyLocation,
  PropertyDetails,
  RegulatoryInfo,
  ValuationInfo,
  NeighborhoodInfo,
  PropertyMetadata,
  SourceReference,
  DataSource,
  DataConflict,
  PropertyDataMergeResult,
  ZillowScrapedData,
  RedfinScrapedData,
  CountyAssessorScrapedData,
  PropertyType,
  AreaMeasurement,
} from '../../types/property';

// Source priority for different data categories
const SOURCE_PRIORITY: Record<string, DataSource[]> = {
  // Legal/regulatory data - county assessor is most authoritative
  parcelNumber: ['county-assessor', 'zillow', 'redfin'],
  zoning: ['county-assessor', 'zillow', 'redfin'],
  assessedValue: ['county-assessor', 'zillow', 'redfin'],
  taxAmount: ['county-assessor', 'zillow', 'redfin'],
  legalDescription: ['county-assessor'],
  permits: ['county-assessor'],

  // Building characteristics - county assessor has official records
  yearBuilt: ['county-assessor', 'zillow', 'redfin'],
  sqft: ['county-assessor', 'zillow', 'redfin'],
  bedrooms: ['county-assessor', 'zillow', 'redfin'],
  bathrooms: ['county-assessor', 'zillow', 'redfin'],
  stories: ['county-assessor', 'zillow', 'redfin'],
  construction: ['county-assessor'],
  foundation: ['county-assessor'],

  // Market data - listing sites are more current
  price: ['zillow', 'redfin', 'county-assessor'],
  marketEstimate: ['zillow', 'redfin'],
  priceHistory: ['zillow', 'redfin'],

  // Location/scores - Zillow has best data
  walkScore: ['zillow', 'redfin'],
  transitScore: ['zillow'],
  bikeScore: ['zillow'],
  schools: ['zillow', 'redfin'],

  // Coordinates
  latitude: ['zillow', 'redfin'],
  longitude: ['zillow', 'redfin'],

  // HOA
  hoa: ['redfin', 'zillow'],

  // Default
  default: ['county-assessor', 'zillow', 'redfin'],
};

interface SourceData {
  zillow?: ZillowScrapedData;
  redfin?: RedfinScrapedData;
  countyAssessor?: CountyAssessorScrapedData;
}

interface SourceMeta {
  zillow?: SourceReference;
  redfin?: SourceReference;
  countyAssessor?: SourceReference;
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `prop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Parse lot size string to AreaMeasurement
 */
function parseLotSize(lotSize: string | undefined): AreaMeasurement | undefined {
  if (!lotSize) return undefined;

  const normalized = lotSize.toLowerCase().replace(/,/g, '');

  // Check for acres
  const acresMatch = normalized.match(/([\d.]+)\s*acres?/);
  if (acresMatch) {
    return { value: parseFloat(acresMatch[1]), unit: 'acres' };
  }

  // Check for sqft
  const sqftMatch = normalized.match(/([\d.]+)\s*(?:sq\s*ft|sqft|sf)/);
  if (sqftMatch) {
    return { value: parseFloat(sqftMatch[1]), unit: 'sqft' };
  }

  // Try to parse as number (assume sqft)
  const numMatch = normalized.match(/([\d.]+)/);
  if (numMatch) {
    return { value: parseFloat(numMatch[1]), unit: 'sqft' };
  }

  return undefined;
}

/**
 * Normalize property type
 */
function normalizePropertyType(type: string | undefined): PropertyType {
  if (!type) return 'single-family';

  const normalized = type.toLowerCase();

  if (normalized.includes('condo')) return 'condo';
  if (normalized.includes('townhouse') || normalized.includes('town home')) return 'townhouse';
  if (normalized.includes('multi') || normalized.includes('duplex') || normalized.includes('triplex'))
    return 'multi-family';
  if (normalized.includes('manufactured') || normalized.includes('mobile')) return 'manufactured';
  if (normalized.includes('commercial')) return 'commercial';
  if (normalized.includes('land') || normalized.includes('lot')) return 'land';

  return 'single-family';
}

/**
 * Parse address string into components
 */
function parseAddress(addressStr: string): PropertyAddress {
  // Simple parsing - in production, use a geocoding API
  const parts = addressStr.split(',').map((p) => p.trim());

  let street = parts[0] || addressStr;
  let city = '';
  let state = '';
  let zip = '';

  if (parts.length >= 2) {
    city = parts[1];
  }

  if (parts.length >= 3) {
    // "TX 78701" or "TX" or "78701"
    const stateZip = parts[2].trim();
    const match = stateZip.match(/([A-Z]{2})?\s*(\d{5}(?:-\d{4})?)?/i);
    if (match) {
      state = match[1]?.toUpperCase() || '';
      zip = match[2] || '';
    }
  }

  return {
    street,
    city,
    state,
    zip,
    county: '',
    country: 'US',
    formatted: addressStr,
  };
}

/**
 * Get best value for a field from multiple sources
 */
function getBestValue<T>(
  field: string,
  sources: Array<{ source: DataSource; value: T | undefined; confidence: number }>
): { value: T | undefined; source: DataSource; confidence: number } {
  const priority = SOURCE_PRIORITY[field] || SOURCE_PRIORITY.default;

  // Filter to non-null values
  const validSources = sources.filter(
    (s) => s.value !== null && s.value !== undefined
  );

  if (validSources.length === 0) {
    return { value: undefined, source: 'zillow', confidence: 0 };
  }

  // Sort by priority first, then by confidence
  validSources.sort((a, b) => {
    const aPriority = priority.indexOf(a.source);
    const bPriority = priority.indexOf(b.source);

    // If both in priority list, use priority order
    if (aPriority !== -1 && bPriority !== -1) {
      return aPriority - bPriority;
    }

    // If only one in priority list, prefer it
    if (aPriority !== -1) return -1;
    if (bPriority !== -1) return 1;

    // Fall back to confidence
    return b.confidence - a.confidence;
  });

  return validSources[0];
}

/**
 * Check if values are in conflict
 */
function hasConflict(values: unknown[]): boolean {
  const validValues = values.filter((v) => v !== null && v !== undefined);
  if (validValues.length <= 1) return false;

  // For numbers, allow 5% variance
  if (validValues.every((v) => typeof v === 'number')) {
    const nums = validValues as number[];
    const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
    return nums.some((n) => Math.abs(n - avg) / avg > 0.05);
  }

  // For strings, check equality (case-insensitive)
  if (validValues.every((v) => typeof v === 'string')) {
    const strs = validValues.map((v) => (v as string).toLowerCase().trim());
    return new Set(strs).size > 1;
  }

  return false;
}

/**
 * Main merge function
 */
export function mergePropertyData(
  address: string,
  data: SourceData,
  meta: SourceMeta
): PropertyDataMergeResult {
  const conflicts: DataConflict[] = [];
  const now = new Date().toISOString();

  // Helper to track conflicts
  const trackField = <T>(
    field: string,
    values: Array<{ source: DataSource; value: T | undefined; confidence: number }>
  ): T | undefined => {
    const best = getBestValue(field, values);
    const validValues = values.filter((v) => v.value !== null && v.value !== undefined);

    if (validValues.length > 1 && hasConflict(validValues.map((v) => v.value))) {
      conflicts.push({
        field,
        values: validValues.map((v) => ({
          source: v.source,
          value: v.value,
          confidence: v.confidence,
        })),
        resolved: best.value,
        resolution: 'highest-confidence',
      });
    }

    return best.value;
  };

  // Build sources array
  const sources: SourceReference[] = [];
  if (meta.zillow) sources.push(meta.zillow);
  if (meta.redfin) sources.push(meta.redfin);
  if (meta.countyAssessor) sources.push(meta.countyAssessor);

  // Confidence helpers
  const zConf = meta.zillow?.confidence || 0;
  const rConf = meta.redfin?.confidence || 0;
  const cConf = meta.countyAssessor?.confidence || 0;

  // Build address
  const bestAddress =
    data.zillow?.address || data.redfin?.address || address;
  const parsedAddress = parseAddress(bestAddress);

  // Merge location
  const location: PropertyLocation = {
    lat: trackField('latitude', [
      { source: 'zillow', value: data.zillow?.latitude, confidence: zConf },
      { source: 'redfin', value: data.redfin?.latitude, confidence: rConf },
    ]) || 0,
    lng: trackField('longitude', [
      { source: 'zillow', value: data.zillow?.longitude, confidence: zConf },
      { source: 'redfin', value: data.redfin?.longitude, confidence: rConf },
    ]) || 0,
  };

  // Merge details
  const lotSizeStr = trackField('lotSize', [
    { source: 'county-assessor', value: data.countyAssessor?.lotSize, confidence: cConf },
    { source: 'zillow', value: data.zillow?.lotSize, confidence: zConf },
    { source: 'redfin', value: data.redfin?.lotSize, confidence: rConf },
  ]);

  const sqft = trackField('sqft', [
    { source: 'county-assessor', value: data.countyAssessor?.sqft, confidence: cConf },
    { source: 'zillow', value: data.zillow?.sqft, confidence: zConf },
    { source: 'redfin', value: data.redfin?.sqft, confidence: rConf },
  ]);

  const details: PropertyDetails = {
    propertyType: normalizePropertyType(
      trackField('propertyType', [
        { source: 'zillow', value: data.zillow?.propertyType, confidence: zConf },
        { source: 'redfin', value: data.redfin?.propertyType, confidence: rConf },
      ])
    ),
    yearBuilt: trackField('yearBuilt', [
      { source: 'county-assessor', value: data.countyAssessor?.yearBuilt, confidence: cConf },
      { source: 'zillow', value: data.zillow?.yearBuilt, confidence: zConf },
      { source: 'redfin', value: data.redfin?.yearBuilt, confidence: rConf },
    ]) || 0,
    stories: trackField('stories', [
      { source: 'county-assessor', value: data.countyAssessor?.stories, confidence: cConf },
    ]) || 1,
    lotSize: parseLotSize(lotSizeStr) || { value: 0, unit: 'sqft' },
    livingArea: { value: sqft || 0, unit: 'sqft' },
    bedrooms: trackField('bedrooms', [
      { source: 'county-assessor', value: data.countyAssessor?.bedrooms, confidence: cConf },
      { source: 'zillow', value: data.zillow?.bedrooms, confidence: zConf },
      { source: 'redfin', value: data.redfin?.bedrooms, confidence: rConf },
    ]) || 0,
    bathrooms: trackField('bathrooms', [
      { source: 'county-assessor', value: data.countyAssessor?.bathrooms, confidence: cConf },
      { source: 'zillow', value: data.zillow?.bathrooms, confidence: zConf },
      { source: 'redfin', value: data.redfin?.bathrooms, confidence: rConf },
    ]) || 0,
  };

  // Add construction details from county assessor
  if (data.countyAssessor) {
    if (data.countyAssessor.construction) {
      details.construction = {
        style: '',
        framing: data.countyAssessor.construction,
      };
    }
    if (data.countyAssessor.foundation) {
      details.foundation = data.countyAssessor.foundation.toLowerCase().includes('slab')
        ? 'slab'
        : data.countyAssessor.foundation.toLowerCase().includes('basement')
        ? 'basement'
        : data.countyAssessor.foundation.toLowerCase().includes('crawl')
        ? 'crawl'
        : 'other';
    }
    if (data.countyAssessor.roofType) {
      details.roof = {
        type: data.countyAssessor.roofType,
        material: data.countyAssessor.roofType,
      };
    }
    if (data.countyAssessor.heating || data.countyAssessor.cooling) {
      details.hvac = {
        heating: data.countyAssessor.heating || 'Unknown',
        cooling: data.countyAssessor.cooling || 'Unknown',
        fuel: 'Unknown',
      };
    }
    if (data.countyAssessor.garage) {
      details.garage = {
        type: 'attached',
        spaces: 2, // Default
      };
    }
    if (data.countyAssessor.basement) {
      details.basement = {
        type: 'full',
        finished: data.countyAssessor.basement.toLowerCase().includes('finished'),
      };
    }
  }

  // Merge regulatory
  const regulatory: RegulatoryInfo = {
    zoning: trackField('zoning', [
      { source: 'county-assessor', value: data.countyAssessor?.zoning, confidence: cConf },
    ]) || 'Unknown',
    parcelNumber: data.countyAssessor?.parcelNumber,
    legalDescription: data.countyAssessor?.legalDescription,
  };

  // Add permits if available
  if (data.countyAssessor?.permitHistory?.length) {
    regulatory.permits = data.countyAssessor.permitHistory.map((p) => ({
      number: '',
      type: p.type,
      date: p.date,
      status: 'completed',
      description: p.description,
    }));
  }

  // Add HOA from Redfin
  if (data.redfin?.hoa) {
    regulatory.hoa = {
      name: 'HOA',
      fee: data.redfin.hoa.fee,
      frequency: (data.redfin.hoa.frequency as 'monthly' | 'quarterly' | 'annual') || 'monthly',
    };
  }

  // Merge valuation
  const valuation: ValuationInfo = {
    assessed: trackField('assessedValue', [
      { source: 'county-assessor', value: data.countyAssessor?.assessedValue, confidence: cConf },
    ]),
    marketEstimate: trackField('marketEstimate', [
      { source: 'zillow', value: data.zillow?.zestimate, confidence: zConf },
      { source: 'redfin', value: data.redfin?.estimate, confidence: rConf },
    ]),
    taxAnnual: trackField('taxAmount', [
      { source: 'county-assessor', value: data.countyAssessor?.taxAmount, confidence: cConf },
      { source: 'redfin', value: data.redfin?.taxInfo?.annualAmount, confidence: rConf },
    ]),
  };

  // Add price history from Zillow
  if (data.zillow?.priceHistory?.length) {
    valuation.priceHistory = data.zillow.priceHistory.map((h) => ({
      date: h.date,
      price: h.price,
      event: h.event.toLowerCase().includes('sold')
        ? 'sold'
        : h.event.toLowerCase().includes('list')
        ? 'listed'
        : 'price-change',
    }));
  }

  // Merge neighborhood
  const neighborhood: NeighborhoodInfo = {
    walkScore: trackField('walkScore', [
      { source: 'zillow', value: data.zillow?.walkScore, confidence: zConf },
    ]),
    transitScore: trackField('transitScore', [
      { source: 'zillow', value: data.zillow?.transitScore, confidence: zConf },
    ]),
    bikeScore: trackField('bikeScore', [
      { source: 'zillow', value: data.zillow?.bikeScore, confidence: zConf },
    ]),
  };

  // Add schools from Zillow
  if (data.zillow?.schools?.length) {
    neighborhood.schools = data.zillow.schools.map((s) => ({
      name: s.name,
      type: s.type.toLowerCase().includes('elementary')
        ? 'elementary'
        : s.type.toLowerCase().includes('middle')
        ? 'middle'
        : s.type.toLowerCase().includes('high')
        ? 'high'
        : 'private',
      rating: s.rating,
      distance: parseFloat(s.distance) || undefined,
    }));
  }

  // Calculate completeness
  const totalFields = 25; // Key fields we track
  const populatedFields = [
    location.lat,
    location.lng,
    details.yearBuilt,
    details.livingArea.value,
    details.bedrooms,
    details.bathrooms,
    details.lotSize.value,
    details.propertyType,
    regulatory.zoning,
    regulatory.parcelNumber,
    valuation.assessed,
    valuation.marketEstimate,
    valuation.taxAnnual,
    neighborhood.walkScore,
    parsedAddress.street,
    parsedAddress.city,
    parsedAddress.state,
    parsedAddress.zip,
  ].filter((v) => v !== null && v !== undefined && v !== 0 && v !== '').length;

  const completeness = Math.round((populatedFields / totalFields) * 100);

  // Build metadata
  const metadata: PropertyMetadata = {
    completeness,
    dataQuality: completeness > 70 ? 'scraped' : 'estimated',
    confidence: {
      overall: Math.max(zConf, rConf, cConf),
      zillow: zConf,
      redfin: rConf,
      countyAssessor: cConf,
    },
  };

  // Build final property context
  const property: PropertyContext = {
    id: generateId(),
    version: 1,
    createdAt: now,
    updatedAt: now,
    address: parsedAddress,
    location,
    details,
    regulatory,
    valuation,
    neighborhood,
    rooms: [], // Rooms are added separately
    sources,
    metadata,
  };

  return {
    property,
    sources,
    conflicts,
    completeness,
  };
}

export { getBestValue, hasConflict, parseAddress, parseLotSize, normalizePropertyType };
