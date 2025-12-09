/**
 * Firecrawl API Client
 *
 * Low-level client for Firecrawl API operations.
 * Handles authentication, rate limiting, and error recovery.
 */

export interface FirecrawlConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface ScrapeOptions {
  formats?: ('markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot')[];
  onlyMainContent?: boolean;
  includeTags?: string[];
  excludeTags?: string[];
  waitFor?: number;
  extract?: {
    schema: Record<string, unknown>;
    systemPrompt?: string;
    prompt?: string;
  };
}

export interface ScrapeResult<T = unknown> {
  success: boolean;
  data?: {
    markdown?: string;
    html?: string;
    rawHtml?: string;
    links?: string[];
    screenshot?: string;
    extract?: T;
    metadata?: {
      title?: string;
      description?: string;
      language?: string;
      sourceURL?: string;
      statusCode?: number;
    };
  };
  error?: string;
}

export interface SearchOptions {
  limit?: number;
  lang?: string;
  country?: string;
  scrapeOptions?: ScrapeOptions;
}

export interface SearchResult<T = unknown> {
  success: boolean;
  data?: Array<{
    url: string;
    title?: string;
    description?: string;
    markdown?: string;
    extract?: T;
  }>;
  error?: string;
}

const DEFAULT_CONFIG: Partial<FirecrawlConfig> = {
  baseUrl: 'https://api.firecrawl.dev/v1',
  timeout: 60000,
  retries: 2,
};

class FirecrawlClient {
  private config: FirecrawlConfig;

  constructor(config: Partial<FirecrawlConfig> = {}) {
    const apiKey = config.apiKey || import.meta.env.VITE_FIRECRAWL_API_KEY || '';

    if (!apiKey) {
      console.warn('Firecrawl API key not configured. Property scraping will be disabled.');
    }

    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      apiKey,
    } as FirecrawlConfig;
  }

  /**
   * Check if the client is properly configured
   */
  isConfigured(): boolean {
    return Boolean(this.config.apiKey);
  }

  /**
   * Scrape a single URL with optional extraction
   */
  async scrape<T = unknown>(url: string, options: ScrapeOptions = {}): Promise<ScrapeResult<T>> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Firecrawl API key not configured',
      };
    }

    const maxRetries = this.config.retries || 2;
    let lastError: string | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.config.baseUrl}/scrape`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({
            url,
            ...options,
          }),
          signal: AbortSignal.timeout(this.config.timeout || 60000),
        });

        if (!response.ok) {
          const errorBody = await response.text();

          // Rate limiting - wait and retry
          if (response.status === 429) {
            const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
            await this.sleep(retryAfter * 1000);
            continue;
          }

          throw new Error(`Firecrawl API error: ${response.status} - ${errorBody}`);
        }

        const result = await response.json();
        return result as ScrapeResult<T>;
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';

        if (attempt < maxRetries) {
          await this.sleep(Math.pow(2, attempt) * 1000); // Exponential backoff
        }
      }
    }

    return {
      success: false,
      error: lastError || 'Max retries exceeded',
    };
  }

  /**
   * Search the web and optionally scrape results
   */
  async search<T = unknown>(query: string, options: SearchOptions = {}): Promise<SearchResult<T>> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Firecrawl API key not configured',
      };
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          query,
          ...options,
        }),
        signal: AbortSignal.timeout(this.config.timeout || 60000),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Firecrawl search error: ${response.status} - ${errorBody}`);
      }

      const result = await response.json();
      return result as SearchResult<T>;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const firecrawlClient = new FirecrawlClient();

// Export class for custom instances
export { FirecrawlClient };
