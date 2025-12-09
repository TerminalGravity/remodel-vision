// Environment Configuration
export const env = {
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  FIRECRAWL_API_KEY: import.meta.env.VITE_FIRECRAWL_API_KEY || '',
  ZILLOW_API_KEY: import.meta.env.VITE_ZILLOW_API_KEY || '', // Placeholder
  GOOGLE_MAPS_KEY: import.meta.env.VITE_GOOGLE_MAPS_KEY || '',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
};

// Type-safe env check
export const checkEnv = () => {
  const missing = [];
  if (!env.GEMINI_API_KEY) missing.push('GEMINI_API_KEY');
  // Firecrawl optional for now
  
  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }
};

