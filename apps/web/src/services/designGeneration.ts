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

import { GoogleGenAI, Type } from "@google/genai";
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

  try {
    // Call Gemini 3 Pro Image generation
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: [{ role: 'user', parts }],
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      }
    });

    // Extract generated image from response
    const imageData = extractImageFromResponse(response);

    if (!imageData) {
      throw new Error("No image generated in response");
    }

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
        aspectRatio: context.rendering.quality.aspectRatio
      },
      // Compatibility fields
      type: 'image',
      generatedUrl: imageData,
      originalImage: context.spatial.referenceImage
    };

    return result;
  } catch (error) {
    console.error("Design generation failed:", error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// BATCH GENERATION
// ═══════════════════════════════════════════════════════════════

export async function generateDesignVariations(
  request: GenerationRequest
): Promise<GenerationResponse> {
  const startTime = Date.now();
  const { context, variations = 1, seed, negativePrompt } = request;

  try {
    const results: GeneratedResult[] = [];

    // Generate each variation
    // Note: If the model supports batch generation, this could be optimized
    for (let i = 0; i < Math.min(variations, 4); i++) {
      const variationSeed = seed ? seed + i : undefined;
      const result = await generateDesignVisualization(context, {
        seed: variationSeed,
        negativePrompt
      });
      results.push(result);
    }

    return {
      success: true,
      images: results,
      usage: {
        tokensUsed: 0, // Would come from response metadata
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

function extractImageFromResponse(response: any): string | null {
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
  if (response.generatedImages?.[0]?.image) {
    return `data:image/png;base64,${response.generatedImages[0].image}`;
  }

  return null;
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
