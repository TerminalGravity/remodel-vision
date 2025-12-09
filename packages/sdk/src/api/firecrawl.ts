import { env } from '../config/env';

export interface CrawlResult {
  url: string;
  title?: string;
  markdown?: string;
  metadata?: Record<string, any>;
}

export class FirecrawlClient {
  async scrapeUrl(url: string): Promise<CrawlResult> {
    if (!env.FIRECRAWL_API_KEY) {
       console.warn("Firecrawl API Key missing, returning mock data");
       return { url, title: "Mock Page", markdown: "# Mock Content" };
    }

    const endpoint = 'https://api.firecrawl.dev/v1/scrape';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) throw new Error(`Firecrawl Error: ${response.statusText}`);
    
    const data = await response.json();
    return {
      url: data.data?.metadata?.sourceURL || url,
      title: data.data?.metadata?.title,
      markdown: data.data?.markdown,
      metadata: data.data?.metadata
    };
  }
}

export const firecrawlClient = new FirecrawlClient();

