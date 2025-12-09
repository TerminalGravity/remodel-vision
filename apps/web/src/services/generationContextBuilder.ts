import type { PropertyContext, RoomContext, Orientation } from '../types/property';
import type {
  GenerationContext,
  CameraState,
  DesignSpecification,
  RenderingConfig,
  SpatialContext,
  PropertyContextForGeneration,
  ContextBuilderOptions,
  BuiltPrompt,
  PromptComponents
} from '../types/generation';

// ═══════════════════════════════════════════════════════════════
// MAIN BUILDER
// ═══════════════════════════════════════════════════════════════

export function buildGenerationContext(
  property: PropertyContext,
  camera: CameraState,
  selectedRoom: string,
  design: DesignSpecification,
  referenceImages: Record<string, string>,
  rendering: RenderingConfig,
  referenceRender: string,
  options: ContextBuilderOptions = {}
): GenerationContext {
  // Find the selected room
  const room = property.rooms.find(r => r.name === selectedRoom);

  // Enrich camera with perspective analysis
  const enrichedCamera = enrichCameraState(camera);

  // Build spatial context
  const spatial = buildSpatialContext(
    room,
    enrichedCamera,
    referenceRender,
    property,
    options
  );

  // Build property context for generation
  const propertyCtx = buildPropertyContext(property, room);

  return {
    spatial,
    property: propertyCtx,
    design,
    rendering,
    references: referenceImages
  };
}

// ═══════════════════════════════════════════════════════════════
// SPATIAL CONTEXT BUILDER
// ═══════════════════════════════════════════════════════════════

function buildSpatialContext(
  room: RoomContext | undefined,
  camera: CameraState,
  referenceRender: string,
  property: PropertyContext,
  options: ContextBuilderOptions
): SpatialContext {
  // Calculate sqft from dimensions
  const width = room?.dimensions?.width || 12;
  const depth = room?.dimensions?.length || 14;
  const height = room?.dimensions?.height || 9;
  const sqft = room?.dimensions?.sqft || width * depth;

  // Find adjacent rooms if enabled
  const adjacentRooms = options.includeAdjacentRooms
    ? findAdjacentRooms(room, property.rooms)
    : undefined;

  // Estimate natural light from orientation + room type
  const naturalLight = estimateNaturalLight(
    room,
    property.location?.orientation
  );

  return {
    referenceImage: referenceRender,
    cameraParams: camera,
    roomBounds: { width, depth, height, sqft },
    roomType: room?.type || 'unknown',
    floor: room?.floor,
    adjacentRooms,
    naturalLight,
    confidence: room?.layout?.confidence || 0.4 // Tier 4 default
  };
}

// ═══════════════════════════════════════════════════════════════
// PROPERTY CONTEXT BUILDER
// ═══════════════════════════════════════════════════════════════

function buildPropertyContext(
  property: PropertyContext,
  room: RoomContext | undefined
): PropertyContextForGeneration {
  // Infer architectural style
  const architecturalStyle = inferArchitecturalStyle(
    property.details.yearBuilt,
    property.address.state,
    property.details.propertyType
  );

  // Infer climate from state
  const climate = inferClimate(property.address.state);

  // Check for restrictions
  const historicRestrictions = property.regulatory?.historicDistrict;
  const hoaRestrictions = property.regulatory?.hoa?.restrictions;

  return {
    yearBuilt: property.details.yearBuilt,
    architecturalStyle,
    region: property.address.state,
    climate,
    existingFinishes: {
      flooring: room?.currentState?.flooring,
      walls: room?.currentState?.walls,
      ceiling: room?.currentState?.ceiling,
      // Could be enriched from vision analysis of listing photos
    },
    historicRestrictions,
    hoaRestrictions
  };
}

// ═══════════════════════════════════════════════════════════════
// CAMERA ENRICHMENT
// ═══════════════════════════════════════════════════════════════

function enrichCameraState(camera: CameraState): CameraState {
  const [px, py, pz] = camera.position;
  const [tx, ty, tz] = camera.target;

  // Determine perspective type based on camera height relative to target
  let perspectiveType: CameraState['perspectiveType'];
  const heightDiff = py - ty;
  if (heightDiff > 5) {
    perspectiveType = 'bird-eye';
  } else if (heightDiff < -1) {
    perspectiveType = 'low-angle';
  } else if (Math.abs(px - tx) > 3 && Math.abs(pz - tz) > 3) {
    perspectiveType = 'corner';
  } else {
    perspectiveType = 'eye-level';
  }

  // Determine facing direction from camera-to-target vector
  const dx = tx - px;
  const dz = tz - pz;
  const angle = Math.atan2(dx, dz) * (180 / Math.PI);
  let facingDirection: CameraState['facingDirection'];

  if (angle >= -22.5 && angle < 22.5) facingDirection = 'north';
  else if (angle >= 22.5 && angle < 67.5) facingDirection = 'northeast';
  else if (angle >= 67.5 && angle < 112.5) facingDirection = 'east';
  else if (angle >= 112.5 && angle < 157.5) facingDirection = 'southeast';
  else if (angle >= 157.5 || angle < -157.5) facingDirection = 'south';
  else if (angle >= -157.5 && angle < -112.5) facingDirection = 'southwest';
  else if (angle >= -112.5 && angle < -67.5) facingDirection = 'west';
  else facingDirection = 'northwest';

  return {
    ...camera,
    perspectiveType,
    facingDirection
  };
}

// ═══════════════════════════════════════════════════════════════
// ADJACENT ROOMS FINDER
// ═══════════════════════════════════════════════════════════════

function findAdjacentRooms(
  currentRoom: RoomContext | undefined,
  allRooms: RoomContext[]
): Array<{ name: string; direction: string }> {
  if (!currentRoom?.position) return [];

  const adjacent: Array<{ name: string; direction: string }> = [];
  const { x, y, z } = currentRoom.position;
  const w = currentRoom.dimensions?.width || 10;
  const l = currentRoom.dimensions?.length || 10;

  for (const room of allRooms) {
    if (room.id === currentRoom.id || !room.position) continue;

    const rx = room.position.x;
    const rz = room.position.z;
    const rw = room.dimensions?.width || 10;
    const rl = room.dimensions?.length || 10;

    // Check if rooms share an edge (with 1ft tolerance)
    if (Math.abs(rx - (x + w)) < 1) {
      adjacent.push({ name: room.name, direction: 'east' });
    } else if (Math.abs((rx + rw) - x) < 1) {
      adjacent.push({ name: room.name, direction: 'west' });
    } else if (Math.abs(rz - (z + l)) < 1) {
      adjacent.push({ name: room.name, direction: 'north' });
    } else if (Math.abs((rz + rl) - z) < 1) {
      adjacent.push({ name: room.name, direction: 'south' });
    }
  }

  return adjacent;
}

// ═══════════════════════════════════════════════════════════════
// NATURAL LIGHT ESTIMATION
// ═══════════════════════════════════════════════════════════════

function estimateNaturalLight(
  room: RoomContext | undefined,
  propertyOrientation: Orientation | undefined
): SpatialContext['naturalLight'] | undefined {
  if (!room) return undefined;

  // Estimate window count based on room type
  const windowsByType: Record<string, number> = {
    'living-room': 3,
    'primary-bedroom': 2,
    'bedroom': 2,
    'kitchen': 2,
    'dining-room': 2,
    'great-room': 4,
    'sunroom': 6,
    'office': 2,
    'bathroom': 1,
    'hallway': 0,
    'closet': 0,
    'basement': 1
  };

  const windowCount = windowsByType[room.type] ?? 1;

  // Determine primary direction
  let primaryDirection = propertyOrientation || 'S';

  // Estimate intensity based on orientation
  const southFacing = ['S', 'SE', 'SW'].includes(primaryDirection);
  const intensity: 'abundant' | 'moderate' | 'limited' =
    windowCount >= 3 && southFacing ? 'abundant' :
    windowCount >= 2 ? 'moderate' : 'limited';

  return { windowCount, primaryDirection, intensity };
}

// ═══════════════════════════════════════════════════════════════
// INFERENCE HELPERS
// ═══════════════════════════════════════════════════════════════

function inferArchitecturalStyle(
  yearBuilt: number,
  state: string,
  propertyType: string
): string {
  // Regional modifiers
  const coastalStates = ['CA', 'FL', 'HI', 'SC', 'NC'];
  const southwestStates = ['AZ', 'NM', 'NV', 'UT'];
  const newEnglandStates = ['MA', 'CT', 'RI', 'NH', 'VT', 'ME'];

  // Base style from era
  let baseStyle: string;
  if (yearBuilt < 1920) baseStyle = 'Victorian/Craftsman';
  else if (yearBuilt < 1940) baseStyle = 'Traditional Colonial';
  else if (yearBuilt < 1970) baseStyle = 'Mid-Century Modern';
  else if (yearBuilt < 1990) baseStyle = 'Contemporary';
  else if (yearBuilt < 2010) baseStyle = 'Transitional';
  else baseStyle = 'Modern';

  // Regional adjustments
  if (coastalStates.includes(state) && yearBuilt >= 1990) {
    return 'Coastal Modern';
  }
  if (southwestStates.includes(state)) {
    return yearBuilt < 1970 ? 'Spanish Colonial' : 'Desert Modern';
  }
  if (newEnglandStates.includes(state) && yearBuilt < 1950) {
    return 'New England Colonial';
  }

  return baseStyle;
}

function inferClimate(state: string): string {
  const climateZones: Record<string, string> = {
    // Hot-Humid
    FL: 'hot-humid', GA: 'hot-humid', LA: 'hot-humid', MS: 'hot-humid',
    AL: 'hot-humid', SC: 'hot-humid', TX: 'hot-humid', HI: 'tropical',
    // Hot-Dry
    AZ: 'hot-dry', NV: 'hot-dry', NM: 'hot-dry', UT: 'hot-dry',
    // Marine
    WA: 'marine', OR: 'marine', CA: 'marine',
    // Cold
    MN: 'cold', WI: 'cold', MI: 'cold', ND: 'cold', SD: 'cold',
    MT: 'cold', WY: 'cold', ME: 'cold', VT: 'cold', NH: 'cold',
    // Mixed-Humid
    VA: 'mixed-humid', NC: 'mixed-humid', TN: 'mixed-humid',
    KY: 'mixed-humid', MD: 'mixed-humid', DC: 'mixed-humid',
    // Mixed-Dry
    CO: 'mixed-dry', OK: 'mixed-dry', KS: 'mixed-dry',
  };
  return climateZones[state] || 'mixed-humid';
}

// ═══════════════════════════════════════════════════════════════
// PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════

export function buildPrompt(context: GenerationContext): BuiltPrompt {
  const { spatial, property, design, rendering } = context;

  // Build individual components
  const components: PromptComponents = {
    spatial: buildSpatialPrompt(spatial),
    style: buildStylePrompt(design, property),
    materials: buildMaterialsPrompt(design),
    lighting: buildLightingPrompt(rendering, spatial),
    mood: buildMoodPrompt(design),
    technical: buildTechnicalPrompt(rendering)
  };

  // Assemble main prompt
  const main = `
Transform this ${spatial.roomType} while maintaining exact room geometry and perspective.

## SPATIAL CONTROL (Preserve exactly)
${components.spatial}

## PROPERTY CONTEXT
${components.style}

## MATERIALS & FINISHES
${components.materials}

## LIGHTING
${components.lighting}

## MOOD & ATMOSPHERE
${components.mood}

## TECHNICAL REQUIREMENTS
${components.technical}

Apply the design elements from the reference images to this room, maintaining photorealistic material physics, accurate reflections, and consistent lighting throughout.
`.trim();

  // Build negative prompt
  const negative = buildNegativePrompt(design);

  return { main, negative, components };
}

function buildSpatialPrompt(spatial: SpatialContext): string {
  const { roomBounds, cameraParams, naturalLight, adjacentRooms } = spatial;
  let prompt = `- Room dimensions: ${roomBounds.width}ft × ${roomBounds.depth}ft, ${roomBounds.height}ft ceilings (${roomBounds.sqft} sqft)
- Camera: ${cameraParams.perspectiveType || 'eye-level'} view facing ${cameraParams.facingDirection || 'forward'}
- Preserve: Wall positions, window locations, door placements, overall proportions`;

  if (naturalLight) {
    prompt += `\n- Natural light: ${naturalLight.intensity} from ${naturalLight.primaryDirection}-facing windows`;
  }

  if (adjacentRooms && adjacentRooms.length > 0) {
    prompt += `\n- Adjacent spaces: ${adjacentRooms.map(r => `${r.name} (${r.direction})`).join(', ')}`;
  }

  return prompt;
}

function buildStylePrompt(design: DesignSpecification, property: PropertyContextForGeneration): string {
  let prompt = `- Era: Built ${property.yearBuilt}
- Architectural style: ${property.architecturalStyle}
- Region: ${property.region}${property.climate ? ` (${property.climate} climate)` : ''}
- Design style: ${design.style}`;

  if (design.budgetTier) {
    prompt += `\n- Budget tier: ${design.budgetTier}`;
  }

  if (property.historicRestrictions) {
    prompt += `\n- Note: Historic district - maintain period-appropriate details`;
  }

  return prompt;
}

function buildMaterialsPrompt(design: DesignSpecification): string {
  const materials: string[] = [];

  for (const [element, spec] of Object.entries(design.elements)) {
    if (!spec) continue;
    let line = `- ${element}: ${spec.style}`;
    if (spec.material) line += `, ${spec.material}`;
    if (spec.color) line += ` in ${spec.color}`;
    if (spec.finish) line += ` (${spec.finish} finish)`;
    if (spec.pattern) line += `, ${spec.pattern} pattern`;
    materials.push(line);
  }

  if (design.colorPalette) {
    materials.push(`\nColor Palette:
- Primary: ${design.colorPalette.primary}
- Secondary: ${design.colorPalette.secondary}
- Accent: ${design.colorPalette.accent}
- Neutral: ${design.colorPalette.neutral}`);
  }

  return materials.join('\n');
}

function buildLightingPrompt(rendering: RenderingConfig, spatial: SpatialContext): string {
  const { lighting } = rendering;
  let prompt = `- Time: ${lighting.time}`;
  prompt += `\n- Style: ${lighting.style}`;

  if (lighting.direction) {
    prompt += `\n- Direction: ${lighting.direction}`;
  }

  if (lighting.artificialLighting) {
    prompt += `\n- Artificial lights: ${lighting.artificialLighting}`;
  }

  if (lighting.shadowSoftness) {
    prompt += `\n- Shadows: ${lighting.shadowSoftness}`;
  }

  if (lighting.season) {
    prompt += `\n- Season: ${lighting.season}`;
  }

  return prompt;
}

function buildMoodPrompt(design: DesignSpecification): string {
  const moods = design.mood || ['warm', 'inviting'];
  let prompt = `Atmosphere: ${moods.join(', ')}`;

  if (design.focalPoint) {
    prompt += `\nFocal point: ${design.focalPoint}`;
  }

  return prompt;
}

function buildTechnicalPrompt(rendering: RenderingConfig): string {
  const { quality, staging, showPeople, showPets } = rendering;
  let prompt = `- Resolution: ${quality.resolution}`;
  prompt += `\n- Style: ${quality.style}`;

  if (quality.aspectRatio) {
    prompt += `\n- Aspect ratio: ${quality.aspectRatio}`;
  }

  if (staging) {
    prompt += `\n- Staging: ${staging}`;
  }

  if (showPeople === false) {
    prompt += `\n- No people in frame`;
  }

  if (showPets === false) {
    prompt += `\n- No pets in frame`;
  }

  return prompt;
}

function buildNegativePrompt(design: DesignSpecification): string {
  const negatives = [
    'blurry',
    'distorted proportions',
    'inconsistent perspective',
    'unrealistic lighting',
    'floating objects',
    'clipped geometry',
    'visible seams'
  ];

  if (design.removeElements && design.removeElements.length > 0) {
    negatives.push(...design.removeElements);
  }

  return negatives.join(', ');
}

