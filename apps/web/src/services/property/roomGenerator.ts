
import { v4 as uuidv4 } from 'uuid';
import { 
  PropertyDetails, 
  RoomContext, 
  RoomType,
  RoomLayout
} from '../../types/property';

const CEILING_HEIGHT = 9; // ft

/**
 * Generates synthetic room data based on property details.
 * This is a heuristic approach to populate the dollhouse view
 * when no floor plan data is available.
 */
export function generateRoomsFromDetails(details: PropertyDetails): RoomContext[] {
  const rooms: RoomContext[] = [];
  
  // 1. Basic Dimensions
  const totalSqft = details.livingArea.value || 2000;
  const numStories = details.stories || 1;
  const sqftPerStory = totalSqft / numStories;
  
  // 2. Identify required rooms
  const bedroomCount = details.bedrooms || 3;
  const bathroomCount = details.bathrooms || 2;
  
  // 3. Distribution Logic
  // Common areas (always present)
  // Types must match RoomType union in property.ts
  const commonRooms: { type: RoomType, name: string, weight: number }[] = [
    { type: 'living-room', name: 'Living Room', weight: 0.35 },
    { type: 'kitchen', name: 'Kitchen', weight: 0.25 },
    { type: 'dining-room', name: 'Dining Room', weight: 0.15 },
    { type: 'foyer', name: 'Entry', weight: 0.10 },
    { type: 'half-bathroom', name: 'Powder Room', weight: 0.10 }
  ];

  // Bedroom distribution
  const bedrooms: { type: RoomType, name: string, weight: number }[] = [];
  for (let i = 0; i < bedroomCount; i++) {
    const isPrimary = i === 0;
    bedrooms.push({
      type: isPrimary ? 'primary-bedroom' : 'bedroom',
      name: isPrimary ? 'Primary Bedroom' : `Bedroom ${i + 1}`,
      weight: isPrimary ? 0.35 : 0.2
    });
  }

  // Bathroom distribution
  const bathrooms: { type: RoomType, name: string, weight: number }[] = [];
  const fullBaths = Math.floor(bathroomCount);
  for (let i = 0; i < fullBaths; i++) {
     const isPrimary = i === 0;
     bathrooms.push({
       type: isPrimary ? 'primary-bathroom' : 'full-bathroom',
       name: isPrimary ? 'Primary Bath' : `Bath ${i + 1}`,
       weight: isPrimary ? 0.2 : 0.15
     });
  }

  // 4. Assign rooms to floors
  const floors: { level: number, rooms: any[] }[] = [];
  
  if (numStories === 1) {
    // All on floor 1
    // Mix them up a bit so we don't get all beds on one side necessarily, 
    // but typically living areas are together.
    floors.push({ 
      level: 1, 
      rooms: [...commonRooms.filter(r => r.type !== 'half-bathroom'), ...bedrooms, ...bathrooms] 
    });
  } else {
    // Multi-story split
    floors.push({ 
      level: 1, 
      rooms: commonRooms 
    });
    
    // Floor 2
    floors.push({ 
      level: 2, 
      rooms: [...bedrooms, ...bathrooms] 
    });
  }

  // 5. Calculate dimensions and positions
  const floorSide = Math.sqrt(sqftPerStory);
  const colWidth = floorSide / 2;
  
  floors.forEach(floor => {
    const floorRooms = floor.rooms;
    
    // Normalize weights
    const totalWeight = floorRooms.reduce((sum, r) => sum + r.weight, 0);
    
    // Track Z position for two columns
    // colZ[0] is for Left Column, colZ[1] is for Right Column
    const colZ = [0, 0];
    
    floorRooms.forEach((roomTemplate, index) => {
      // Calculate target area
      const weight = roomTemplate.weight / totalWeight;
      const roomArea = sqftPerStory * weight;
      
      // Assign column (alternating)
      const colIndex = index % 2; 
      
      // Dimensions
      // Width is fixed to column width
      // Length is calculated from area
      const roomWidth = colWidth;
      const roomLength = roomArea / roomWidth;
      
      // Position
      // X: 0 or colWidth
      // Y: based on floor level
      // Z: current stack height for this column
      const x = colIndex === 0 ? 0 : colWidth;
      const y = (floor.level - 1) * CEILING_HEIGHT;
      const z = colZ[colIndex];
      
      // Update Z cursor for this column
      colZ[colIndex] += roomLength;

      // Create Heuristic Layout
      const layout: RoomLayout = {
        confidence: 0.4,
        source: 'heuristic',
        ceilingHeight: CEILING_HEIGHT,
        walls: [
            // Standard rectangle counter-clockwise
            { start: { x: 0, y: 0 }, end: { x: roomWidth, y: 0 }, thickness: 0.5, height: CEILING_HEIGHT },
            { start: { x: roomWidth, y: 0 }, end: { x: roomWidth, y: roomLength }, thickness: 0.5, height: CEILING_HEIGHT },
            { start: { x: roomWidth, y: roomLength }, end: { x: 0, y: roomLength }, thickness: 0.5, height: CEILING_HEIGHT },
            { start: { x: 0, y: roomLength }, end: { x: 0, y: 0 }, thickness: 0.5, height: CEILING_HEIGHT }
        ],
        openings: [
            // Dummy door on first wall
            { 
                id: uuidv4(), 
                type: 'door', 
                wallIndex: 0, 
                position: roomWidth / 2, 
                width: 3, 
                height: 7 
            }
        ]
      };

      rooms.push({
        id: uuidv4(),
        propertyId: details.livingArea.value ? 'generated' : 'default', // Placeholder
        name: roomTemplate.name,
        type: roomTemplate.type,
        floor: floor.level,
        dimensions: {
          length: roomLength, // Z dimension
          width: roomWidth,   // X dimension
          height: CEILING_HEIGHT,
          sqft: roomArea
        },
        position: {
          x: x,
          y: y,
          z: z
        },
        layout: layout
      });
    });
  });

  return rooms;
}
