
import { geminiService } from './geminiService';
import { RoomLayout, RoomContext } from '../types/property';
import { v4 as uuidv4 } from 'uuid';

export const floorPlanService = {
  /**
   * Extracts room layout from a floor plan image.
   * This is the entry point for Tier 3 data acquisition.
   */
  extractRoomLayout: async (imageUrl: string): Promise<RoomLayout[]> => {
    try {
      // 1. Convert URL to base64 if needed (assuming base64 passed for now or handle fetching)
      // For this implementation, we assume the UI handles file reading and passes a base64 string
      // If it's a URL, we'd need to fetch it.
      let base64Image = imageUrl;
      
      if (imageUrl.startsWith('http')) {
        // Simple fetch for external URLs (cors dependent)
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        base64Image = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
      }
      
      // Remove data:image/jpeg;base64, prefix if present for Gemini
      const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|webp);base64,/, "");

      // 2. Call Gemini Vision
      const layouts = await geminiService.extractRoomLayout(cleanBase64);
      
      // 3. Post-process / Validate
      // Ensure IDs are present
      return layouts.map((layout: any) => ({
        ...layout,
        id: layout.id || uuidv4(),
        source: 'vision_floor_plan',
        // Ensure strictly typed fields if AI drifts
        walls: layout.walls || [],
        openings: layout.openings || [],
        confidence: layout.confidence || 0.7 // Default Tier 3 confidence
      }));

    } catch (error) {
      console.error("Failed to extract room layout", error);
      return [];
    }
  }
};

