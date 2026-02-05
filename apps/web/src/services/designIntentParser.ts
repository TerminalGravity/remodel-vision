/**
 * Design Intent Parser
 *
 * Uses Gemini to parse natural language user input into structured DesignSpecification.
 * Extracts specific element changes, style preferences, and mood from conversational input.
 */

import { GoogleGenAI } from "@google/genai";
import type { DesignSpecification, DesignElement } from '../types/generation';

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || import.meta.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_PARSE = 'gemini-2.0-flash'; // Fast model for parsing

// ═══════════════════════════════════════════════════════════════
// MAIN PARSER
// ═══════════════════════════════════════════════════════════════

export async function parseDesignIntent(
  userInput: string,
  baseStyle: string,
  roomType: string
): Promise<Partial<DesignSpecification>> {
  if (!userInput.trim()) {
    return { style: baseStyle, elements: {}, preserveElements: [] };
  }

  const prompt = buildParsePrompt(userInput, baseStyle, roomType);

  try {
    const response = await ai.models.generateContent({
      model: MODEL_PARSE,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);

    return validateAndNormalize(parsed, baseStyle);
  } catch (error) {
    console.warn('Design intent parsing failed, using defaults:', error);
    // Fallback: extract basic keywords
    return extractBasicIntent(userInput, baseStyle);
  }
}

// ═══════════════════════════════════════════════════════════════
// PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════

function buildParsePrompt(userInput: string, baseStyle: string, roomType: string): string {
  return `Parse this renovation request into structured design elements.

User Request: "${userInput}"
Room Type: ${roomType}
Base Style: ${baseStyle}

Extract and return JSON with this exact structure:
{
  "style": "detected style or '${baseStyle}' if not specified",
  "elements": {
    "countertop": { "material": "...", "color": "...", "finish": "..." },
    "cabinets": { "style": "...", "color": "...", "finish": "..." },
    "flooring": { "material": "...", "pattern": "...", "color": "..." },
    "backsplash": { "material": "...", "pattern": "...", "color": "..." },
    "lighting": { "style": "...", "color": "..." },
    "walls": { "color": "...", "finish": "..." },
    "fixtures": { "style": "...", "finish": "..." },
    "appliances": { "style": "...", "color": "..." }
  },
  "colorPalette": {
    "primary": "main color",
    "secondary": "secondary color",
    "accent": "accent color",
    "neutral": "neutral color"
  },
  "mood": ["adjective1", "adjective2"],
  "preserveElements": ["element names to keep unchanged"],
  "removeElements": ["element names to remove"],
  "focalPoint": "main visual focus if mentioned"
}

Rules:
- Only include elements explicitly mentioned or strongly implied
- Use null for unspecified properties within elements
- For colors, use descriptive names (e.g., "warm white", "charcoal gray")
- For materials, be specific (e.g., "Carrara marble", "white oak hardwood")
- Extract mood adjectives (warm, modern, cozy, bright, etc.)
- If user says "keep the X", add to preserveElements
- If user says "remove/no X", add to removeElements

Return ONLY valid JSON, no explanation.`;
}

// ═══════════════════════════════════════════════════════════════
// VALIDATION & NORMALIZATION
// ═══════════════════════════════════════════════════════════════

function validateAndNormalize(
  parsed: any,
  baseStyle: string
): Partial<DesignSpecification> {
  const result: Partial<DesignSpecification> = {
    style: typeof parsed.style === 'string' ? parsed.style : baseStyle,
    elements: {},
    preserveElements: [],
  };

  // Validate elements
  if (parsed.elements && typeof parsed.elements === 'object') {
    const validElements = [
      'sink', 'countertop', 'backsplash', 'cabinets', 'fixtures',
      'lighting', 'flooring', 'walls', 'ceiling', 'furniture',
      'appliances', 'hardware'
    ];

    for (const key of validElements) {
      if (parsed.elements[key] && typeof parsed.elements[key] === 'object') {
        const elem = parsed.elements[key];
        const cleanElem: DesignElement = { style: elem.style || '' };

        if (elem.material) cleanElem.material = elem.material;
        if (elem.color) cleanElem.color = elem.color;
        if (elem.finish) cleanElem.finish = elem.finish;
        if (elem.pattern) cleanElem.pattern = elem.pattern;

        // Only add if has meaningful content
        if (cleanElem.style || cleanElem.material || cleanElem.color) {
          result.elements![key] = cleanElem;
        }
      }
    }
  }

  // Validate color palette
  if (parsed.colorPalette && typeof parsed.colorPalette === 'object') {
    const cp = parsed.colorPalette;
    if (cp.primary || cp.secondary || cp.accent || cp.neutral) {
      result.colorPalette = {
        primary: cp.primary || 'white',
        secondary: cp.secondary || 'gray',
        accent: cp.accent || 'black',
        neutral: cp.neutral || 'beige'
      };
    }
  }

  // Validate mood
  if (Array.isArray(parsed.mood) && parsed.mood.length > 0) {
    result.mood = parsed.mood.filter((m: any) => typeof m === 'string').slice(0, 5);
  }

  // Validate preserve/remove
  if (Array.isArray(parsed.preserveElements)) {
    result.preserveElements = parsed.preserveElements.filter((e: any) => typeof e === 'string');
  }
  if (Array.isArray(parsed.removeElements)) {
    result.removeElements = parsed.removeElements.filter((e: any) => typeof e === 'string');
  }

  // Validate focal point
  if (typeof parsed.focalPoint === 'string' && parsed.focalPoint.trim()) {
    result.focalPoint = parsed.focalPoint;
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════
// FALLBACK KEYWORD EXTRACTION
// ═══════════════════════════════════════════════════════════════

function extractBasicIntent(
  userInput: string,
  baseStyle: string
): Partial<DesignSpecification> {
  const input = userInput.toLowerCase();
  const result: Partial<DesignSpecification> = {
    style: baseStyle,
    elements: {},
    preserveElements: [],
    mood: []
  };

  // Material keywords
  const materials: Record<string, { element: string; material: string }> = {
    'marble': { element: 'countertop', material: 'marble' },
    'granite': { element: 'countertop', material: 'granite' },
    'quartz': { element: 'countertop', material: 'quartz' },
    'butcher block': { element: 'countertop', material: 'butcher block' },
    'hardwood': { element: 'flooring', material: 'hardwood' },
    'tile': { element: 'flooring', material: 'tile' },
    'subway tile': { element: 'backsplash', material: 'subway tile' },
    'shaker': { element: 'cabinets', material: 'shaker style' },
  };

  for (const [keyword, spec] of Object.entries(materials)) {
    if (input.includes(keyword)) {
      result.elements![spec.element] = {
        style: spec.material,
        material: spec.material
      };
    }
  }

  // Color keywords
  const colors = ['white', 'black', 'gray', 'grey', 'navy', 'blue', 'green', 'wood', 'natural', 'cream', 'beige'];
  for (const color of colors) {
    if (input.includes(color)) {
      // Try to associate with nearby element
      if (input.includes(`${color} cabinet`) || input.includes(`cabinet`) && input.includes(color)) {
        result.elements!['cabinets'] = { ...(result.elements!['cabinets'] || { style: '' }), color };
      }
      if (input.includes(`${color} counter`) || input.includes(`${color} countertop`)) {
        result.elements!['countertop'] = { ...(result.elements!['countertop'] || { style: '' }), color };
      }
    }
  }

  // Mood keywords
  const moods = ['modern', 'warm', 'cozy', 'bright', 'minimal', 'rustic', 'elegant', 'industrial', 'coastal'];
  for (const mood of moods) {
    if (input.includes(mood)) {
      (result.mood as string[]).push(mood);
    }
  }

  // Style detection
  const styles: Record<string, string> = {
    'farmhouse': 'Modern Farmhouse',
    'modern': 'Contemporary',
    'traditional': 'Traditional',
    'industrial': 'Industrial',
    'coastal': 'Coastal',
    'minimalist': 'Minimalist',
    'mid-century': 'Mid-Century Modern',
    'scandinavian': 'Scandinavian'
  };

  for (const [keyword, style] of Object.entries(styles)) {
    if (input.includes(keyword)) {
      result.style = style;
      break;
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════
// MERGE HELPER
// ═══════════════════════════════════════════════════════════════

export function mergeDesignSpecs(
  base: DesignSpecification,
  parsed: Partial<DesignSpecification>
): DesignSpecification {
  return {
    style: parsed.style || base.style,
    budgetTier: base.budgetTier,
    colorPalette: parsed.colorPalette || base.colorPalette,
    elements: {
      ...base.elements,
      ...parsed.elements
    },
    preserveElements: [
      ...base.preserveElements,
      ...(parsed.preserveElements || [])
    ],
    removeElements: parsed.removeElements,
    mood: parsed.mood || base.mood,
    focalPoint: parsed.focalPoint || base.focalPoint
  };
}
