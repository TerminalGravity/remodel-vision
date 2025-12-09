import { GoogleGenAI } from "@google/genai";
import { ProjectConfig, PropertyMeta } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Models
const MODEL_CHAT = 'gemini-2.5-flash';
const MODEL_VISION = 'gemini-2.5-flash'; 
const MODEL_RENDER = 'gemini-3-pro-image-preview'; // High fidelity model

export const geminiService = {
  /**
   * Analyzes an uploaded floorplan or context image to extract architectural details.
   */
  analyzeContext: async (base64Image: string, prompt: string) => {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_VISION,
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: `Analyze this floorplan/image. Extract room names, dimensions if visible, and structural constraints. Return a concise summary suitable for a design context. ${prompt}` }
          ]
        }
      });
      return response.text;
    } catch (error) {
      console.error("Context analysis failed", error);
      throw error;
    }
  },

  /**
   * Generates the "After" visualization using the 3D canvas snapshot and project constraints.
   */
  generateRemodel: async (
    sceneSnapshotBase64: string, 
    userPrompt: string, 
    projectContext: string,
    config?: ProjectConfig
  ): Promise<string> => {
    try {
      // Clean base64 header if present
      const cleanBase64 = sceneSnapshotBase64.replace(/^data:image\/(png|jpeg);base64,/, "");

      // Construct specific context from project config
      const styleContext = config 
        ? `\nPROJECT CONFIGURATION:\n- Style: ${config.style}\n- Budget Tier: ${config.budget}\n- Location: ${config.location.address}\n- Preferences: ${config.preferences}`
        : "";

      const fullPrompt = `
        You are an expert senior architect and interior designer. 
        Render a photorealistic renovation of the provided room view.
        
        INPUT CONTEXT:
        1. The image provided is a raw 3D viewport screenshot. Keep the perspective and geometry EXACTLY matches the input image.
        2. Architectural Constraints: ${projectContext || "None provided. Rely on visual geometry."}
        ${styleContext}
        
        USER REQUEST: 
        "${userPrompt}"
        
        REQUIREMENTS:
        - High fidelity, photorealistic lighting and materials (8k resolution style).
        - Strictly adhere to the architectural constraints.
        - Apply the requested "${config?.style || 'modern'}" design language.
      `;

      const response = await ai.models.generateContent({
        model: MODEL_RENDER,
        contents: {
          parts: [
            { text: fullPrompt },
            { inlineData: { mimeType: 'image/png', data: cleanBase64 } }
          ]
        },
        config: {
          imageConfig: {
            aspectRatio: "4:3", 
            imageSize: "1K"
          }
        }
      });

      // Extract image from response
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image generated");
    } catch (error) {
      console.error("Remodel generation failed", error);
      throw error;
    }
  },

  /**
   * Retrieves/Estimates property data based on address using LLM knowledge.
   * Simulates a "Real Property Data" API fetch.
   */
  getPropertyDetails: async (address: string): Promise<PropertyMeta> => {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_CHAT,
        contents: `Provide a structured JSON-like summary of the likely property characteristics for a home at: ${address}. 
        Return ONLY valid JSON with these keys: "zoning" (string, e.g. R1), "lotSize" (string e.g. 5000 sqft), "yearBuilt" (string e.g. 1995), "sunExposure" (string, e.g. South-Facing), "schoolDistrict" (string), "walkScore" (number).
        Infer based on general neighborhood knowledge if specific data is unavailable. Do not add markdown blocks.`
      });

      const text = response.text || "{}";
      // Sanitize potential markdown
      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr) as PropertyMeta;
    } catch (error) {
      console.warn("Property data fetch failed, using defaults", error);
      return {
        zoning: "Residential (R1)",
        lotSize: "Unknown",
        yearBuilt: "Unknown",
        sunExposure: "Variable",
        schoolDistrict: "Local District",
        walkScore: 50
      };
    }
  },

  /**
   * Simple chat for the sidebar to refine ideas
   */
  chat: async (history: string[], newMessage: string) => {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_CHAT,
        contents: `Previous context: ${history.join('\n')}\nUser: ${newMessage}`
      });
      return response.text;
    } catch (error) {
      console.error("Chat failed", error);
      return "I'm having trouble connecting to the design mainframe.";
    }
  }
};