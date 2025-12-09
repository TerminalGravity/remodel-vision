# PRD-004: Image Generation Pipeline (Nano Banana Pro)

**Version:** 1.0.0
**Status:** Draft
**Created:** 2025-12-08
**Owner:** Jack Felke
**Domain:** AI Visualization
**Priority:** P0 (Critical Path)

---

## Overview

Image generation is the core differentiator of RemodelVision—transforming abstract design ideas into photorealistic visualizations that "look and feel like the real thing." Using Google's Gemini 3 Pro Image Preview (codenamed "Nano Banana Pro"), we generate interior designs, exterior renders, and schematic overlays that are precise to the user's property context.

### Core Principle

> "Nano Banana Pro makes images that look and feel like the real thing by default."

The image generation pipeline ensures:
1. **Photorealism** - Outputs indistinguishable from professional photography
2. **Context Accuracy** - Respects room dimensions, lighting, and constraints
3. **Style Fidelity** - Matches user's aesthetic preferences exactly
4. **Product Precision** - Renders specific materials and products accurately

---

## Current Implementation

From `services/geminiService.ts`:

```typescript
export async function generateRemodel(
  sceneSnapshotBase64: string,
  userPrompt: string,
  projectContext: ProjectConfig,
  config?: GenerationConfig
): Promise<GeneratedImage> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-pro-image-preview',
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  const prompt = `
You are RemodelVision's expert interior visualization engine.
Given a 3D viewport and design instructions, generate a PHOTOREALISTIC render.

## Context
Style: ${projectContext.style}
Budget: ${projectContext.budget}
Location: ${projectContext.location.address}

## Instructions
${userPrompt}

## Requirements
- Maintain the exact camera perspective from the viewport
- Apply materials and finishes appropriate for the budget tier
- Consider natural lighting based on location and orientation
- Output as a photorealistic interior photograph

Aspect ratio: 4:3
Resolution: 1024x768
`;

  const response = await model.generateContent([
    { inlineData: { mimeType: 'image/png', data: sceneSnapshotBase64 } },
    prompt,
  ]);

  return extractImageFromResponse(response);
}
```

---

## Functional Requirements

### FR-001: Perspective-Matched Generation

**Description:** Generated images must maintain the exact camera perspective from the 3D viewport capture.

**Technical Implementation:**

```typescript
// services/perspectiveMatching.ts

interface CameraMetadata {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  fov: number;
  aspect: number;
  near: number;
  far: number;
  up: { x: number; y: number; z: number };
}

interface ViewportCapture {
  image: string;  // Base64 PNG
  camera: CameraMetadata;
  roomId: string;
  roomDimensions: Dimensions;
  lightingCondition: 'morning' | 'afternoon' | 'evening' | 'artificial';
}

function buildPerspectivePrompt(capture: ViewportCapture): string {
  return `
## Camera Perspective (MUST MATCH EXACTLY)
- Camera position: (${capture.camera.position.x.toFixed(1)}, ${capture.camera.position.y.toFixed(1)}, ${capture.camera.position.z.toFixed(1)})
- Looking at: (${capture.camera.target.x.toFixed(1)}, ${capture.camera.target.y.toFixed(1)}, ${capture.camera.target.z.toFixed(1)})
- Field of view: ${capture.camera.fov}°
- This is a ${describePerspective(capture.camera)} view

## Room Dimensions
- Width: ${capture.roomDimensions.width}ft
- Length: ${capture.roomDimensions.length}ft
- Height: ${capture.roomDimensions.height}ft

## Lighting
- Time of day: ${capture.lightingCondition}
- Natural light source: ${describeLightSource(capture)}
`;
}

function describePerspective(camera: CameraMetadata): string {
  const height = camera.position.y;
  const angle = Math.atan2(
    camera.target.y - camera.position.y,
    Math.sqrt(
      Math.pow(camera.target.x - camera.position.x, 2) +
      Math.pow(camera.target.z - camera.position.z, 2)
    )
  ) * (180 / Math.PI);

  if (height > 8 && angle < -30) return 'elevated dollhouse';
  if (height > 6) return 'standing eye-level';
  if (height > 4) return 'seated eye-level';
  return 'low-angle dramatic';
}
```

**Acceptance Criteria:**
- [ ] Generated image matches viewport within 5° perspective tolerance
- [ ] Room proportions preserved accurately
- [ ] Vanishing points align with 3D model
- [ ] Lighting direction consistent with capture

---

### FR-002: Style-Aware Material Rendering

**Description:** Apply materials and finishes that match the specified design style and budget tier.

**Style-Material Mapping:**

```typescript
// config/styleMaterials.ts

interface StyleMaterialPalette {
  style: DesignStyle;
  materials: {
    flooring: MaterialOption[];
    countertops: MaterialOption[];
    cabinetry: MaterialOption[];
    hardware: MaterialOption[];
    lighting: MaterialOption[];
    textiles: MaterialOption[];
  };
  colorPalette: ColorPalette;
  textures: TexturePreference[];
}

const STYLE_PALETTES: Record<DesignStyle, StyleMaterialPalette> = {
  'modern': {
    style: 'modern',
    materials: {
      flooring: [
        { name: 'Large format porcelain', budget: ['premium', 'luxury'] },
        { name: 'Engineered hardwood', budget: ['standard', 'premium'] },
        { name: 'Polished concrete', budget: ['premium', 'luxury'] },
      ],
      countertops: [
        { name: 'Quartz (Silestone, Caesarstone)', budget: ['standard', 'premium'] },
        { name: 'Marble (Calacatta, Statuario)', budget: ['luxury'] },
        { name: 'Sintered stone (Dekton)', budget: ['premium', 'luxury'] },
      ],
      cabinetry: [
        { name: 'Flat-panel lacquered', budget: ['premium', 'luxury'] },
        { name: 'Slab with integrated pulls', budget: ['standard', 'premium'] },
        { name: 'High-gloss acrylic', budget: ['standard'] },
      ],
      hardware: [
        { name: 'Integrated/hidden', budget: ['premium', 'luxury'] },
        { name: 'Linear bar pulls (matte black)', budget: ['standard', 'premium'] },
        { name: 'Brushed nickel minimal', budget: ['standard'] },
      ],
      lighting: [
        { name: 'Recessed/cove lighting', budget: ['standard', 'premium', 'luxury'] },
        { name: 'Pendant clusters', budget: ['premium', 'luxury'] },
        { name: 'LED strips integrated', budget: ['standard', 'premium'] },
      ],
      textiles: [
        { name: 'Performance fabrics', budget: ['premium', 'luxury'] },
        { name: 'Linen/cotton blends', budget: ['standard', 'premium'] },
        { name: 'Leather accents', budget: ['premium', 'luxury'] },
      ],
    },
    colorPalette: {
      primary: ['#FFFFFF', '#F5F5F5', '#1A1A1A'],
      accent: ['#C9A962', '#4A6741', '#2C4A7C'],
      neutrals: ['#E0E0E0', '#BDBDBD', '#757575'],
    },
    textures: ['smooth', 'matte', 'subtle-grain'],
  },

  'farmhouse': {
    style: 'farmhouse',
    materials: {
      flooring: [
        { name: 'Wide-plank reclaimed wood', budget: ['premium', 'luxury'] },
        { name: 'Distressed hardwood', budget: ['standard', 'premium'] },
        { name: 'Wood-look tile', budget: ['economy', 'standard'] },
      ],
      countertops: [
        { name: 'Butcher block', budget: ['economy', 'standard'] },
        { name: 'Honed marble', budget: ['premium', 'luxury'] },
        { name: 'Soapstone', budget: ['premium'] },
      ],
      cabinetry: [
        { name: 'Shaker style painted', budget: ['standard', 'premium'] },
        { name: 'Beadboard accent', budget: ['economy', 'standard'] },
        { name: 'Inset framed', budget: ['premium', 'luxury'] },
      ],
      hardware: [
        { name: 'Oil-rubbed bronze', budget: ['standard', 'premium'] },
        { name: 'Antique brass', budget: ['premium', 'luxury'] },
        { name: 'Iron bin pulls', budget: ['economy', 'standard'] },
      ],
      lighting: [
        { name: 'Lantern pendants', budget: ['standard', 'premium'] },
        { name: 'Shaded chandeliers', budget: ['premium', 'luxury'] },
        { name: 'Mason jar fixtures', budget: ['economy'] },
      ],
      textiles: [
        { name: 'Linen', budget: ['standard', 'premium', 'luxury'] },
        { name: 'Cotton ticking', budget: ['economy', 'standard'] },
        { name: 'Grain sack', budget: ['standard', 'premium'] },
      ],
    },
    colorPalette: {
      primary: ['#FFFEF7', '#F5F1E6', '#3D3D3D'],
      accent: ['#6B8E6B', '#8B7355', '#9B2335'],
      neutrals: ['#D4C4A8', '#C8B897', '#A89070'],
    },
    textures: ['weathered', 'natural-grain', 'distressed'],
  },

  // ... additional styles
};

function getMaterialsForBudget(
  style: DesignStyle,
  budget: BudgetTier,
  category: keyof StyleMaterialPalette['materials']
): MaterialOption[] {
  const palette = STYLE_PALETTES[style];
  return palette.materials[category].filter(m =>
    m.budget.includes(budget)
  );
}
```

**Prompt Construction for Materials:**

```typescript
function buildMaterialPrompt(
  style: DesignStyle,
  budget: BudgetTier,
  room: RoomContext
): string {
  const palette = STYLE_PALETTES[style];
  const materials = {
    flooring: getMaterialsForBudget(style, budget, 'flooring')[0],
    countertops: getMaterialsForBudget(style, budget, 'countertops')[0],
    cabinetry: getMaterialsForBudget(style, budget, 'cabinetry')[0],
    hardware: getMaterialsForBudget(style, budget, 'hardware')[0],
    lighting: getMaterialsForBudget(style, budget, 'lighting')[0],
  };

  return `
## Material Specifications
Apply the following materials for a ${style} ${room.type}:

- Flooring: ${materials.flooring?.name || 'appropriate for style'}
- Countertops: ${materials.countertops?.name || 'appropriate for style'}
- Cabinetry: ${materials.cabinetry?.name || 'appropriate for style'}
- Hardware: ${materials.hardware?.name || 'appropriate for style'}
- Lighting: ${materials.lighting?.name || 'appropriate for style'}

## Color Palette
Primary colors: ${palette.colorPalette.primary.join(', ')}
Accent colors: ${palette.colorPalette.accent.join(', ')}
Texture feel: ${palette.textures.join(', ')}

## Budget Context
This is a ${budget} tier renovation. Materials should reflect appropriate quality
without over-specifying luxury finishes for lower budgets.
`;
}
```

**Acceptance Criteria:**
- [ ] Materials match specified style vocabulary
- [ ] Budget tier reflected in material quality
- [ ] Color palette consistent with style
- [ ] Textures rendered with appropriate detail

---

### FR-003: Product Reference Integration

**Description:** When users specify products by name or image, render them accurately in the visualization.

**Product Reference System:**

```typescript
// services/productReference.ts

interface ProductReference {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  sku?: string;
  dimensions: Dimensions;
  colors: string[];
  materials: string[];
  referenceImages: string[];  // URLs or Base64
  price?: number;
  vendor?: string;
}

interface ProductPlacement {
  product: ProductReference;
  position: Vector3;
  rotation: Euler;
  scale: number;
  room: string;
}

async function renderWithProducts(
  viewport: ViewportCapture,
  placements: ProductPlacement[],
  context: ProjectContext
): Promise<GeneratedImage> {
  const productDescriptions = placements.map(p => `
- ${p.product.name} by ${p.product.brand}
  Category: ${p.product.category}
  Dimensions: ${p.product.dimensions.width}"W x ${p.product.dimensions.depth}"D x ${p.product.dimensions.height}"H
  Materials: ${p.product.materials.join(', ')}
  Colors: ${p.product.colors.join(', ')}
  Position: ${describePosition(p.position, viewport.roomDimensions)}
`).join('\n');

  const referenceImages = placements
    .flatMap(p => p.product.referenceImages)
    .slice(0, 3);  // Max 3 reference images

  const prompt = `
## Product Specifications (Render these EXACT products)
${productDescriptions}

## Important
- Match the product appearances exactly to the reference images provided
- Maintain proper scale based on specified dimensions
- Position products as described relative to room layout
`;

  const content = [
    { inlineData: { mimeType: 'image/png', data: viewport.image } },
    ...referenceImages.map(img => ({
      inlineData: { mimeType: 'image/jpeg', data: img }
    })),
    prompt,
  ];

  return generateWithModel(content);
}
```

**Acceptance Criteria:**
- [ ] Named products recognizable in output
- [ ] Reference images influence appearance
- [ ] Dimensions respected (±10% tolerance)
- [ ] Product placement matches specification

---

### FR-004: Before/After Comparison System

**Description:** Generate comparisons showing current state versus proposed design.

**Implementation:**

```typescript
// components/ResultOverlay.tsx - Enhanced

interface ComparisonResult {
  before: string;  // Current state image/capture
  after: string;   // Generated design
  annotations?: ComparisonAnnotation[];
  changesSummary: string;
}

interface ComparisonAnnotation {
  id: string;
  position: { x: number; y: number };  // Percentage coordinates
  label: string;
  description: string;
  type: 'addition' | 'removal' | 'modification';
}

function ComparisonOverlay({ comparison }: { comparison: ComparisonResult }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [showAnnotations, setShowAnnotations] = useState(true);

  return (
    <div className="comparison-container">
      <div className="comparison-slider" style={{ '--position': `${sliderPosition}%` }}>
        <div className="before-image">
          <img src={comparison.before} alt="Before" />
          <span className="label">BEFORE</span>
        </div>
        <div className="after-image">
          <img src={comparison.after} alt="After" />
          <span className="label">AFTER</span>
        </div>
        <div
          className="slider-handle"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <ChevronLeft />
          <ChevronRight />
        </div>
      </div>

      {showAnnotations && comparison.annotations?.map(ann => (
        <AnnotationMarker
          key={ann.id}
          annotation={ann}
          visible={sliderPosition > ann.position.x}
        />
      ))}

      <div className="changes-summary">
        <h4>Changes in This Design</h4>
        <p>{comparison.changesSummary}</p>
      </div>

      <div className="actions">
        <button onClick={handleExport}>📥 Export</button>
        <button onClick={handleShare}>📤 Share</button>
        <button onClick={handleRevise}>✏️ Revise</button>
      </div>
    </div>
  );
}
```

**Auto-Generated Annotations:**

```typescript
async function generateComparisonAnnotations(
  before: string,
  after: string,
  context: ProjectContext
): Promise<ComparisonAnnotation[]> {
  const prompt = `
Analyze these before and after interior images.
Identify and locate the key changes:

1. What was ADDED (new elements not in before)
2. What was REMOVED (elements from before not in after)
3. What was MODIFIED (same elements, different appearance)

For each change, provide:
- Position as percentage coordinates (x: 0-100, y: 0-100)
- Brief label (2-4 words)
- Description (1 sentence)
- Type: addition, removal, or modification

Output as JSON array.
`;

  const response = await analyzeImages(before, after, prompt);
  return parseAnnotations(response);
}
```

**Acceptance Criteria:**
- [ ] Smooth slider interaction
- [ ] Mobile touch support
- [ ] Annotations positioned accurately
- [ ] Export as single comparison image
- [ ] Share link functionality

---

### FR-005: Schematic Overlay Generation

**Description:** Generate professional schematic overlays for contractor communication.

**Overlay Types:**

```typescript
// services/schematicGenerator.ts

type SchematicType =
  | 'electrical-plan'
  | 'plumbing-diagram'
  | 'demolition-plan'
  | 'dimension-callouts'
  | 'material-legend'
  | 'elevation-view';

interface SchematicRequest {
  room: RoomContext;
  type: SchematicType;
  baseImage?: string;  // Overlay on existing image
  annotations: SchematicAnnotation[];
  style: 'technical' | 'presentation';
}

async function generateSchematicOverlay(
  request: SchematicRequest
): Promise<GeneratedImage> {
  const prompt = buildSchematicPrompt(request);

  if (request.style === 'technical') {
    return generateTechnicalSchematic(request);
  } else {
    return generatePresentationSchematic(request);
  }
}

function buildSchematicPrompt(request: SchematicRequest): string {
  const typeDescriptions: Record<SchematicType, string> = {
    'electrical-plan': `
Generate a professional electrical plan overlay showing:
- Outlet locations with circuit designations
- Switch locations with type (single, 3-way, dimmer)
- Lighting fixture positions
- Circuit runs with wire gauge
- Panel location and capacity
Use standard electrical symbols (ANSI/IEEE).
`,
    'plumbing-diagram': `
Generate a plumbing diagram overlay showing:
- Supply lines (hot=red, cold=blue)
- Drain lines (green or gray)
- Vent lines (dashed)
- Fixture connections
- Shut-off valve locations
Use standard plumbing symbols.
`,
    'demolition-plan': `
Generate a demolition plan overlay showing:
- Elements to be removed (hatched red)
- Elements to remain (solid black outline)
- New openings (dashed green)
- Protection areas (blue boundary)
Include clear legend.
`,
    'dimension-callouts': `
Add professional dimension callouts showing:
- Room dimensions (length x width)
- Ceiling height
- Window and door openings
- Clearances between elements
- Important heights (counter, cabinet, etc.)
Use architectural dimension style.
`,
    'material-legend': `
Create a material legend overlay showing:
- Finish schedule with numbers
- Material samples with labels
- Product specifications
- Installation notes
Professional presentation format.
`,
    'elevation-view': `
Generate an elevation view showing:
- Wall elements at true scale
- Vertical dimensions
- Material indications
- Fixture heights
- Architectural detailing
Professional drafting style.
`,
  };

  return `
## Schematic Generation: ${request.type}
${typeDescriptions[request.type]}

## Room Specifications
${JSON.stringify(request.room.measurements, null, 2)}

## Annotations to Include
${request.annotations.map(a => `- ${a.label}: ${a.description}`).join('\n')}

## Style
${request.style === 'technical' ? 'Technical drafting style, black & white with standard symbols' : 'Clean presentation style suitable for client review'}
`;
}
```

**Acceptance Criteria:**
- [ ] Standard symbols used correctly
- [ ] Dimensions accurate to source data
- [ ] Clear legends included
- [ ] Professional presentation quality
- [ ] Export as PDF with layers

---

### FR-006: Generation Queue & History

**Description:** Manage multiple generation requests and maintain version history.

**Queue Management:**

```typescript
// services/generationQueue.ts

interface GenerationJob {
  id: string;
  type: 'interior' | 'exterior' | 'schematic' | 'comparison';
  prompt: string;
  context: ProjectContext;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  completedAt?: number;
  result?: GeneratedImage;
  error?: string;
  retryCount: number;
}

class GenerationQueue {
  private jobs: Map<string, GenerationJob> = new Map();
  private processing: Set<string> = new Set();
  private maxConcurrent = 2;

  async enqueue(job: Omit<GenerationJob, 'id' | 'status' | 'createdAt' | 'retryCount'>): Promise<string> {
    const id = generateId();
    const fullJob: GenerationJob = {
      ...job,
      id,
      status: 'queued',
      createdAt: Date.now(),
      retryCount: 0,
    };

    this.jobs.set(id, fullJob);
    this.emit('job-queued', fullJob);
    this.processNext();

    return id;
  }

  private async processNext(): Promise<void> {
    if (this.processing.size >= this.maxConcurrent) return;

    const nextJob = this.getNextQueued();
    if (!nextJob) return;

    this.processing.add(nextJob.id);
    nextJob.status = 'processing';
    this.emit('job-started', nextJob);

    try {
      const result = await this.executeGeneration(nextJob);
      nextJob.status = 'completed';
      nextJob.completedAt = Date.now();
      nextJob.result = result;
      this.emit('job-completed', nextJob);
    } catch (error) {
      if (nextJob.retryCount < 3) {
        nextJob.retryCount++;
        nextJob.status = 'queued';
        this.emit('job-retry', nextJob);
      } else {
        nextJob.status = 'failed';
        nextJob.error = error.message;
        this.emit('job-failed', nextJob);
      }
    } finally {
      this.processing.delete(nextJob.id);
      this.processNext();
    }
  }
}
```

**History Management:**

```typescript
// store/generationHistory.ts

interface GenerationVersion {
  id: string;
  projectId: string;
  roomId: string;
  timestamp: number;
  prompt: string;
  image: string;
  metadata: {
    style: string;
    budget: string;
    products: string[];
    duration: number;
  };
  userRating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  isFavorite: boolean;
}

interface GenerationHistoryStore {
  versions: GenerationVersion[];
  addVersion: (version: Omit<GenerationVersion, 'id'>) => void;
  getVersionsForRoom: (roomId: string) => GenerationVersion[];
  getFavorites: () => GenerationVersion[];
  deleteVersion: (id: string) => void;
  rateVersion: (id: string, rating: number) => void;
}
```

**Acceptance Criteria:**
- [ ] Multiple generations queue properly
- [ ] Progress visible for each job
- [ ] Failed jobs retry automatically
- [ ] Full version history per room
- [ ] Favorites and rating system
- [ ] Compare any two versions

---

## Generation Quality Controls

### Prompt Engineering Best Practices

```typescript
// services/promptEngineering.ts

interface QualityEnhancement {
  category: string;
  additions: string[];
}

const QUALITY_ENHANCEMENTS: QualityEnhancement[] = [
  {
    category: 'photorealism',
    additions: [
      'photorealistic, professional interior photography',
      'natural lighting with soft shadows',
      'shallow depth of field where appropriate',
      'accurate material textures and reflections',
    ],
  },
  {
    category: 'atmosphere',
    additions: [
      'lived-in feel with subtle styling',
      'ambient occlusion for depth',
      'warm color temperature for comfort',
      'realistic window light diffusion',
    ],
  },
  {
    category: 'technical',
    additions: [
      'architecturally accurate proportions',
      'correct perspective and vanishing points',
      'appropriate scale for all furniture',
      'realistic ceiling height representation',
    ],
  },
];

function enhancePrompt(basePrompt: string, room: RoomContext): string {
  const enhancements = QUALITY_ENHANCEMENTS
    .flatMap(e => e.additions)
    .join(', ');

  return `
${basePrompt}

## Quality Requirements
${enhancements}

## Technical Constraints
- Room dimensions: ${room.measurements.dimensions.length}'L x ${room.measurements.dimensions.width}'W x ${room.measurements.dimensions.height}'H
- Maintain these exact proportions
- Respect structural constraints: ${room.constraints.structural.join(', ') || 'None'}
`;
}
```

### Output Validation

```typescript
// services/outputValidation.ts

interface ValidationResult {
  passed: boolean;
  score: number;  // 0-100
  issues: ValidationIssue[];
  suggestions: string[];
}

interface ValidationIssue {
  type: 'perspective' | 'proportion' | 'style' | 'quality' | 'content';
  severity: 'critical' | 'warning' | 'info';
  description: string;
}

async function validateGeneratedImage(
  image: string,
  request: GenerationRequest,
  context: ProjectContext
): Promise<ValidationResult> {
  const prompt = `
Analyze this generated interior design image for quality and accuracy.

Expected specifications:
- Style: ${context.style}
- Budget tier: ${context.budget}
- Room type: ${request.room.type}
- Room dimensions: ${request.room.measurements.dimensions.length}' x ${request.room.measurements.dimensions.width}'

Evaluate:
1. Perspective accuracy (does it look like the specified room dimensions?)
2. Style consistency (does it match the requested style?)
3. Material quality (appropriate for budget tier?)
4. Photorealism (could this be mistaken for a real photo?)
5. Technical issues (artifacts, distortions, impossible elements?)

Output JSON with:
- passed: boolean
- score: 0-100
- issues: array of {type, severity, description}
- suggestions: array of improvement suggestions
`;

  const response = await analyzeImage(image, prompt);
  return parseValidationResult(response);
}
```

---

## Performance Optimization

### Caching Strategy

```typescript
// services/generationCache.ts

interface CacheEntry {
  key: string;
  image: string;
  prompt: string;
  context: string;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

class GenerationCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize = 50;  // MB
  private currentSize = 0;

  private generateKey(prompt: string, context: ProjectContext): string {
    const normalized = {
      prompt: prompt.toLowerCase().trim(),
      style: context.style,
      budget: context.budget,
      room: context.room?.id,
    };
    return hash(JSON.stringify(normalized));
  }

  async get(prompt: string, context: ProjectContext): Promise<string | null> {
    const key = this.generateKey(prompt, context);
    const entry = this.cache.get(key);

    if (entry) {
      entry.accessCount++;
      entry.lastAccessed = Date.now();
      return entry.image;
    }

    return null;
  }

  async set(prompt: string, context: ProjectContext, image: string): Promise<void> {
    const key = this.generateKey(prompt, context);
    const size = estimateSize(image);

    // Evict if needed
    while (this.currentSize + size > this.maxSize * 1024 * 1024) {
      this.evictLRU();
    }

    this.cache.set(key, {
      key,
      image,
      prompt,
      context: JSON.stringify(context),
      createdAt: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now(),
    });

    this.currentSize += size;
  }
}
```

### Progressive Loading

```typescript
// components/GeneratedImageView.tsx

function GeneratedImageView({ jobId }: Props) {
  const [stage, setStage] = useState<'loading' | 'preview' | 'full'>('loading');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fullUrl, setFullUrl] = useState<string | null>(null);

  useEffect(() => {
    // Stage 1: Show placeholder/skeleton
    setStage('loading');

    // Stage 2: Load low-res preview
    loadPreview(jobId).then(url => {
      setPreviewUrl(url);
      setStage('preview');
    });

    // Stage 3: Load full resolution
    loadFullImage(jobId).then(url => {
      setFullUrl(url);
      setStage('full');
    });
  }, [jobId]);

  return (
    <div className="image-container">
      {stage === 'loading' && <Skeleton className="image-skeleton" />}
      {stage === 'preview' && (
        <img src={previewUrl} className="preview blur-sm" alt="Preview" />
      )}
      {stage === 'full' && (
        <img src={fullUrl} className="full" alt="Generated design" />
      )}
    </div>
  );
}
```

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Generation Success Rate** | >98% | Jobs completed / jobs started |
| **Average Generation Time** | <30 seconds | API response time |
| **User Satisfaction** | >4.2/5 average rating | In-app ratings |
| **Perspective Accuracy** | >90% validated | Automated validation |
| **First-Attempt Acceptance** | >70% | Users who don't request revisions |
| **Cache Hit Rate** | >20% | Similar prompts served from cache |

---

## Integration Points

### With 3D Dollhouse (PRD-002)
- Viewport capture as generation input
- Camera metadata for perspective matching
- Room dimensions for proportion accuracy

### With Gemini AI (PRD-003)
- Model orchestration for generation
- Prompt enhancement pipeline
- Validation analysis

### With Property Context (PRD-001)
- Room measurements for accuracy
- Style preferences for generation
- Constraint awareness

### With Project Management (PRD-006)
- Version history tracking
- Design decision documentation
- Contractor package generation

---

## Future Enhancements

1. **Video Walkthroughs** - Animated room tours using Gemini Video
2. **Real-time Style Transfer** - Instant style changes on viewport
3. **Product Placement AR** - Preview specific products in real space
4. **Collaborative Generation** - Multiple users refining same image
5. **Print-Ready Outputs** - High-resolution exports for printing
6. **Time-of-Day Animation** - Show lighting throughout day

---

*Document maintained by RemodelVision Team*
