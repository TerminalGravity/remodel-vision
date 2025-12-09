import { env } from '../config/env';
import { GoogleGenAI } from '@google/genai';

export class GeminiClient {
  private client: GoogleGenAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    }
  }

  private getClient(): GoogleGenAI {
    if (!this.client) {
      if (env.GEMINI_API_KEY) {
        this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      } else {
        throw new Error("Gemini API Key missing");
      }
    }
    return this.client!;
  }

  async generateText(prompt: string, modelId = 'gemini-2.5-flash'): Promise<string> {
    const client = this.getClient();
    const response = await client.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: prompt }]
      }
    });
    return response.text || '';
  }

  async analyzeImage(base64Image: string, prompt: string, modelId = 'gemini-2.5-flash'): Promise<string> {
    const client = this.getClient();
    // Strip header if present
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
    
    const response = await client.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }
        ]
      }
    });
    return response.text || '';
  }
}

export const geminiClient = new GeminiClient();
