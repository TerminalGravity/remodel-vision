import { GoogleGenAI } from "@google/genai";
import { ProjectConfig, PropertyMeta, GenerationConfig, MediaType } from "../types";
import { GroundingData } from "../types/property";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Model Constants
const MODEL_FAST = 'gemini-2.5-flash';
const MODEL_THINKING = 'gemini-3-pro-preview';
const MODEL_IMAGE = 'gemini-3-pro-image-preview'; // Placeholder for Imagen 3 via Gemini API
const MODEL_VIDEO = 'veo-2.0-generate-001'; // Placeholder for Veo

export const geminiService = {
  /**
   * Analyzes an uploaded floorplan or context image to extract architectural details.
   */
  analyzeContext: async (base64Image: string, prompt: string) => {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
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
   * Extracts structured RoomLayout data from a floor plan image.
   * Tier 3 Data Source.
   */
  extractRoomLayout: async (base64Image: string): Promise<any> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_FAST, // Flash is good for vision
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
                    { text: `
                        Analyze this floor plan image. 
                        Identify all rooms, their approximate dimensions, and connections.
                        
                        Return a valid JSON array of RoomLayout objects matching this structure:
                        {
                            "id": "string",
                            "name": "string (e.g. Kitchen, Living Room)",
                            "type": "string (valid RoomType)",
                            "confidence": number (0.0-1.0),
                            "ceilingHeight": number (default 9),
                            "walls": [
                                { "start": {"x": 0, "y": 0}, "end": {"x": 10, "y": 0}, "thickness": 0.5, "height": 9 }
                            ],
                            "openings": [
                                { "id": "string", "type": "door|window", "wallIndex": 0, "position": 2, "width": 3, "height": 7 }
                            ]
                        }

                        Coordinate System:
                        - Use feet as units.
                        - Origin (0,0) at bottom-left of the plan.
                        - Walls should form closed loops for each room.
                        - Be precise with wall connectivity.
                        
                        Return ONLY the JSON.
                    `}
                ]
            }
        });

        const text = response.text || "[]";
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Floor plan extraction failed", error);
        throw error;
    }
  },

  /**
   * Generates media (Image or Video) based on the 3D canvas snapshot and project constraints.
   */
  generateMedia: async (
    type: MediaType,
    sceneSnapshotBase64: string, 
    userPrompt: string, 
    projectContext: string,
    genConfig: GenerationConfig,
    config?: ProjectConfig
  ): Promise<{ url: string; thumbnail?: string }> => {
    try {
      // Clean base64 header if present
      const cleanBase64 = sceneSnapshotBase64.replace(/^data:image\/(png|jpeg);base64,/, "");

      // Construct specific context from project config
      const styleContext = config 
        ? `\nPROJECT CONFIGURATION:\n- Style: ${config.style}\n- Budget Tier: ${config.budget}\n- Location: ${config.location.address}\n- Preferences: ${config.preferences}`
        : "";

      const fullPrompt = `
        You are an expert senior architect and interior designer. 
        ${type === 'video' ? 'Generate a cinematic walkthrough video' : 'Render a photorealistic renovation'} of the provided room view.
        
        INPUT CONTEXT:
        1. The image provided is a raw 3D viewport screenshot. Keep the perspective and geometry EXACTLY matches the input image.
        2. Architectural Constraints: ${projectContext || "None provided. Rely on visual geometry."}
        ${styleContext}
        
        USER REQUEST: 
        "${userPrompt}"
        
        REQUIREMENTS:
        - High fidelity, photorealistic lighting and materials.
        - Strictly adhere to the architectural constraints.
        - Apply the requested "${config?.style || 'modern'}" design language.
        ${genConfig.thinkingMode ? "- THINK DEEPLY: Analyze building codes, structural integrity, and material feasibility before generating." : ""}
      `;

      if (type === 'video') {
        // Veo generation simulation (or actual call if SDK supports it directly in this version)
        // Note: Actual Veo API might differ, simulating for now or using available endpoint
        // Assuming video generation returns a URL
        
        // For prototype, we might mock this or use a video model endpoint
        console.log("Generating video with model:", MODEL_VIDEO);
        
        // Mock response for video to avoid failures if model not accessable in this env
        // In real impl: 
        /*
        const response = await ai.models.generateContent({
            model: MODEL_VIDEO,
            contents: ...
        })
        */
       
        // For now, return a placeholder or similar if real API isn't live for this key
        return { 
            url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", // Placeholder video
            thumbnail: sceneSnapshotBase64 // Use input as thumb
        }; 
      }

      // Image Generation
      const response = await ai.models.generateContent({
        model: MODEL_IMAGE, // gemini-3-pro-image-preview
        contents: {
          parts: [
            { text: fullPrompt },
            { inlineData: { mimeType: 'image/png', data: cleanBase64 } }
          ]
        },
        config: {
          // @ts-ignore - SDK types might lag behind experimental features
          generationConfig: {
            aspectRatio: genConfig.aspectRatio, 
            sampleCount: 1,
          }
        }
      });

      // Extract image from response
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return { url: `data:image/png;base64,${part.inlineData.data}` };
        }
      }
      throw new Error("No image generated");
    } catch (error) {
      console.error("Media generation failed", error);
      throw error;
    }
  },

  /**
   * Retrieves/Estimates property data using Gemini 3 with Grounding (Search/Maps).
   */
  getPropertyDetails: async (address: string, thinkingMode: boolean = false): Promise<PropertyMeta> => {
    try {
      const model = thinkingMode ? MODEL_THINKING : MODEL_FAST;
      
      const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [{
                text: `Provide a structured JSON-like summary of the likely property characteristics for a home at: ${address}. 
                Use Google Search/Maps grounding to find real data if possible.
                Return ONLY valid JSON with these keys: "zoning" (string), "lotSize" (string), "yearBuilt" (string), "sunExposure" (string), "schoolDistrict" (string), "walkScore" (number).`
            }]
        },
        config: {
            // @ts-ignore
            tools: [{ googleSearch: {} }] // Enable Grounding
        }
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
   * Retrieves comprehensive property data using Google Grounding (Search/Maps).
   * Used for the data merger workflow.
   */
  getGroundingData: async (address: string): Promise<GroundingData> => {
    try {
      // Use Thinking mode if possible for better research, otherwise fast model
      // Grounding is key here.
      const response = await ai.models.generateContent({
        model: MODEL_THINKING, // Prefer thinking for deep research
        contents: {
            parts: [{
                text: `Research the property at ${address} using Google Search and Maps.
                Extract accurate data for the following fields. If exact data isn't found, estimate based on the neighborhood but mark as estimated in your internal logic (not strictly needed in JSON).
                
                Return a valid JSON object matching this TypeScript interface:
                {
                  address: string;
                  zoning: string;
                  yearBuilt: number;
                  propertyType: string;
                  sqft: number;
                  lotSize: string;
                  bedrooms: number;
                  bathrooms: number;
                  estimatedValue: number;
                  schoolDistrict: string;
                  schools: { name: string; rating: number; distance: string; type: string }[];
                  amenities: string[];
                  neighborhoodVibe: string;
                  walkScore: number;
                  floodZone: string;
                }
                
                Ensure keys match exactly. Return ONLY the JSON.`
            }]
        },
        config: {
            // @ts-ignore
            tools: [{ googleSearch: {} }] // Enable Grounding
        }
      });

      const text = response.text || "{}";
      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr) as GroundingData;
    } catch (error) {
      console.error("Grounding data fetch failed", error);
      return {};
    }
  },

  /**
   * Chat with "Thinking" capability for GC-level analysis.
   */
  chat: async (history: string[], newMessage: string, thinkingMode: boolean = false) => {
    try {
      const model = thinkingMode ? MODEL_THINKING : MODEL_FAST;
      
      const response = await ai.models.generateContent({
        model: model,
        contents: {
            parts: [{ 
                text: `Previous context: ${history.join('\n')}\nUser: ${newMessage}\n\n${thinkingMode ? "Act as a General Contractor. Analyze building codes, costs, and feasibility deeply." : ""}` 
            }]
        }
      });
      return response.text;
    } catch (error) {
      console.error("Chat failed", error);
      return "I'm having trouble connecting to the design mainframe.";
    }
  }
};
