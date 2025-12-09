/**
 * Design Generation Service
 *
 * Uses Gemini 3 Pro Image (gemini-3-pro-image-preview) for photorealistic design visualization.
 * Leverages the @google/genai SDK with multi-reference support for consistency.
 *
 * Key capabilities:
 * - Up to 14 reference images for consistency
 * - Native spatial control from camera parameters
 * - Physics-accurate lighting and materials
 */

import { GoogleGenAI } from "@google/genai";
import type {
  GenerationContext,
  GenerationRequest,
  GenerationResponse,
  GeneratedResult,
  BuiltPrompt
} from '../types/generation';
import { buildPrompt } from './generationContextBuilder';

// Initialize AI client
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || import.meta.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Model configuration - ONLY gemini-3-pro-image-preview
const MODEL_IMAGE = 'gemini-3-pro-image-preview';
const MAX_REFERENCES = 14;
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

// ═══════════════════════════════════════════════════════════════
// RETRY UTILITY
// ═══════════════════════════════════════════════════════════════

interface RetryOptions {
  maxRetries?: number;
  initialBackoffMs?: number;
  maxBackoffMs?: number;
  shouldRetry?: (error: Error) => boolean;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = MAX_RETRIES,
    initialBackoffMs = INITIAL_BACKOFF_MS,
    maxBackoffMs = 30000,
    shouldRetry = isRetryableError
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry this error
      if (attempt >= maxRetries || !shouldRetry(lastError)) {
        throw lastError;
      }

      // Exponential backoff with jitter
      const backoffMs = Math.min(
        initialBackoffMs * Math.pow(2, attempt) + Math.random() * 1000,
        maxBackoffMs
      );

      console.warn(
        `Generation attempt ${attempt + 1} failed, retrying in ${Math.round(backoffMs)}ms:`,
        lastError.message
      );

      await sleep(backoffMs);
    }
  }

  throw lastError;
}

function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();

  // Retry on rate limits, timeouts, and transient server errors
  return (
    message.includes('rate limit') ||
    message.includes('quota') ||
    message.includes('timeout') ||
    message.includes('503') ||
    message.includes('502') ||
    message.includes('429') ||
    message.includes('temporarily unavailable') ||
    message.includes('resource exhausted')
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════════════
// SDK RESPONSE TYPES (moved here for TypeScript ordering)
// ═══════════════════════════════════════════════════════════════

interface InlineDataPart {
  inlineData?: {
    data: string;
    mimeType: string;
  };
  text?: string;
}

interface ContentPart {
  parts?: InlineDataPart[];
}

interface Candidate {
  content?: ContentPart;
  finishReason?: string;
  safetyRatings?: Array<{
    category: string;
    probability: string;
  }>;
}

interface GenerateContentResponse {
  candidates?: Candidate[];
  promptFeedback?: {
    blockReason?: string;
  };
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  // Imagen-style response (different model family)
  generatedImages?: Array<{
    image: string;
    mimeType?: string;
  }>;
}

interface UsageMetrics {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

// Pricing per 1K tokens (approximate, varies by model)
const COST_PER_1K_INPUT = 0.0025;   // $2.50 per 1M input tokens
const COST_PER_1K_OUTPUT = 0.01;    // $10.00 per 1M output tokens
const COST_PER_IMAGE = 0.04;        // Approximate per-image cost

function extractUsageMetadata(response: GenerateContentResponse): UsageMetrics {
  const usage = response.usageMetadata;

  const promptTokens = usage?.promptTokenCount || 0;
  const completionTokens = usage?.candidatesTokenCount || 0;
  const totalTokens = usage?.totalTokenCount || (promptTokens + completionTokens);

  // Calculate estimated cost
  const inputCost = (promptTokens / 1000) * COST_PER_1K_INPUT;
  const outputCost = (completionTokens / 1000) * COST_PER_1K_OUTPUT;
  const estimatedCost = inputCost + outputCost + COST_PER_IMAGE;

  return {
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCost: Math.round(estimatedCost * 10000) / 10000  // Round to 4 decimal places
  };
}

function extractImageFromResponse(response: GenerateContentResponse): string | null {
  // Navigate through response structure to find image data
  const candidates = response.candidates || [];

  for (const candidate of candidates) {
    const parts = candidate.content?.parts || [];

    for (const part of parts) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }
  }

  // Also check direct response properties (varies by model)
  const firstImage = response.generatedImages?.[0];
  if (firstImage?.image) {
    return `data:image/png;base64,${firstImage.image}`;
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════
// MAIN GENERATION FUNCTION
// ═══════════════════════════════════════════════════════════════

export async function generateDesignVisualization(
  context: GenerationContext,
  options: {
    seed?: number;
    variations?: number;
    negativePrompt?: string;
  } = {}
): Promise<GeneratedResult> {
  const startTime = Date.now();

  // Build the structured prompt
  const builtPrompt = buildPrompt(context);

  // Build multi-part request for Gemini
  const parts = buildRequestParts(context, builtPrompt, options.negativePrompt);

  // Wrap API call with retry logic for transient failures
  const response = await withRetry(
    async () => {
      const res = await ai.models.generateContent({
        model: MODEL_IMAGE,
        contents: [{ role: 'user', parts }],
        config: {
          responseModalities: ['IMAGE', 'TEXT'],
        }
      });
      return res;
    },
    { maxRetries: MAX_RETRIES, initialBackoffMs: INITIAL_BACKOFF_MS }
  );

  // Extract generated image from response
  const imageData = extractImageFromResponse(response as GenerateContentResponse);

  if (!imageData) {
    throw new Error("No image generated in response");
  }

  // Extract usage metadata from response
  const usage = extractUsageMetadata(response as GenerateContentResponse);

  // Build result
  const result: GeneratedResult = {
    id: crypto.randomUUID(),
    image: imageData,
    prompt: builtPrompt.main,
    designSpec: context.design,
    generationContext: context,
    timestamp: Date.now(),
    metadata: {
      model: MODEL_IMAGE,
      generationTime: Date.now() - startTime,
      seed: options.seed,
      resolution: context.rendering.quality.resolution,
      aspectRatio: context.rendering.quality.aspectRatio,
      // Usage metrics
      tokensUsed: usage.totalTokens,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      estimatedCost: usage.estimatedCost
    },
    // Compatibility fields
    type: 'image',
    generatedUrl: imageData,
    originalImage: context.spatial.referenceImage
  };

  return result;
}

// ═══════════════════════════════════════════════════════════════
// BATCH GENERATION
// ═══════════════════════════════════════════════════════════════

export async function generateDesignVariations(
  request: GenerationRequest,
  options: {
    parallel?: boolean;
    maxConcurrent?: number;
  } = {}
): Promise<GenerationResponse> {
  const startTime = Date.now();
  const { context, variations = 1, seed, negativePrompt } = request;
  const { parallel = true, maxConcurrent = 2 } = options;

  const variationCount = Math.min(variations, 4);

  try {
    let results: GeneratedResult[];

    if (parallel && variationCount > 1) {
      // Parallel generation with concurrency control
      results = await generateInParallel(
        variationCount,
        (i) => generateDesignVisualization(context, {
          seed: seed ? seed + i : undefined,
          negativePrompt
        }),
        maxConcurrent
      );
    } else {
      // Sequential generation (safer for rate limits)
      results = [];
      for (let i = 0; i < variationCount; i++) {
        const variationSeed = seed ? seed + i : undefined;
        const result = await generateDesignVisualization(context, {
          seed: variationSeed,
          negativePrompt
        });
        results.push(result);
      }
    }

    // Calculate total tokens from all results
    const totalTokens = results.reduce((sum, r) =>
      sum + (r.metadata.tokensUsed || 0), 0
    );

    return {
      success: true,
      images: results,
      usage: {
        tokensUsed: totalTokens,
        imagesGenerated: results.length
      }
    };
  } catch (error) {
    return {
      success: false,
      images: [],
      error: error instanceof Error ? error.message : 'Generation failed',
      usage: {
        tokensUsed: 0,
        imagesGenerated: 0
      }
    };
  }
}

/**
 * Execute async functions in parallel with concurrency control
 */
async function generateInParallel<T>(
  count: number,
  generator: (index: number) => Promise<T>,
  maxConcurrent: number
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < count; i++) {
    const promise = generator(i).then(result => {
      results[i] = result;
    });

    executing.push(promise);

    // If we've hit max concurrency, wait for one to complete
    if (executing.length >= maxConcurrent) {
      await Promise.race(executing);
      // Remove completed promises
      const completed = executing.filter(p => {
        let isResolved = false;
        p.then(() => { isResolved = true; }).catch(() => { isResolved = true; });
        return !isResolved;
      });
      executing.length = 0;
      executing.push(...completed);
    }
  }

  // Wait for remaining promises
  await Promise.all(executing);

  return results;
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function buildRequestParts(
  context: GenerationContext,
  prompt: BuiltPrompt,
  negativePrompt?: string
): Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> {
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

  // 1. Add spatial reference image (the 3D render) - MOST IMPORTANT
  const spatialImage = cleanBase64(context.spatial.referenceImage);
  parts.push({
    inlineData: {
      mimeType: 'image/png',
      data: spatialImage
    }
  });

  // 2. Add design reference images (up to MAX_REFERENCES - 1)
  let refCount = 1;
  const references = context.references;

  if (references) {
    // Handle both Record<string, string> and ReferenceImage[] formats
    const refEntries = Array.isArray(references)
      ? references.map(r => [r.category || r.type, r.imageData])
      : Object.entries(references);

    for (const [_key, imageData] of refEntries) {
      if (refCount >= MAX_REFERENCES) break;
      if (!imageData || typeof imageData !== 'string') continue;

      const cleanData = cleanBase64(imageData);
      parts.push({
        inlineData: {
          mimeType: detectMimeType(cleanData),
          data: cleanData
        }
      });
      refCount++;
    }
  }

  // 3. Add the structured prompt
  let fullPrompt = prompt.main;

  // Add negative prompt if provided
  if (negativePrompt || prompt.negative) {
    fullPrompt += `\n\n## AVOID\n${negativePrompt || prompt.negative}`;
  }

  parts.push({ text: fullPrompt });

  return parts;
}

function cleanBase64(data: string): string {
  // Remove data URL prefix if present
  return data.replace(/^data:image\/\w+;base64,/, '');
}

function detectMimeType(base64Data: string): string {
  // Check first few bytes to determine image type
  if (base64Data.startsWith('/9j/')) return 'image/jpeg';
  if (base64Data.startsWith('iVBOR')) return 'image/png';
  if (base64Data.startsWith('R0lGOD')) return 'image/gif';
  if (base64Data.startsWith('UklGR')) return 'image/webp';
  return 'image/jpeg'; // Default fallback
}

function mapAspectRatio(ratio?: string): string {
  const mapping: Record<string, string> = {
    '16:9': '16:9',
    '4:3': '4:3',
    '1:1': '1:1',
    '9:16': '9:16',
    '3:4': '3:4'
  };
  return mapping[ratio || '16:9'] || '16:9';
}

// ═══════════════════════════════════════════════════════════════
// LEGACY COMPATIBILITY
// ═══════════════════════════════════════════════════════════════

/**
 * Legacy function for backwards compatibility with existing code
 * @deprecated Use generateDesignVisualization instead
 */
export async function generateDesign(
  context: GenerationContext
): Promise<string> {
  const result = await generateDesignVisualization(context);
  return result.image;
}

// Export types for convenience
export type { GenerationContext, GeneratedResult, GenerationResponse };
