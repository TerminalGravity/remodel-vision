# PRD-003: Gemini AI Full-Stack Integration

**Version:** 1.0.0
**Status:** Draft
**Created:** 2025-12-08
**Owner:** Jack Felke
**Domain:** AI Services
**Priority:** P0 (Critical Path)

---

## Overview

RemodelVision integrates the full Gemini-3 model family to provide a comprehensive AI-powered experience—from conversational design refinement to photorealistic image generation. This PRD defines the complete AI service architecture, model selection strategy, and integration patterns for achieving "best effort accurate media."

### Core Principle

> "AI content is precisely generated using the various reference context i.e. source material documents (files, links, etc.) I (user) uploads."

Every AI interaction is enhanced with:
1. **PropertyContext** - Dimensions, constraints, style preferences
2. **RoomContext** - Specific room details when applicable
3. **DesignHistory** - Previous decisions and refinements
4. **SourceDocuments** - Uploaded references and extracted data

---

## Gemini Model Family

### Model Selection Matrix

| Model | Use Case | Context | Strengths |
|-------|----------|---------|-----------|
| **gemini-2.5-flash** | Chat, quick analysis | 1M tokens | Fast, cost-effective, vision |
| **gemini-2.5-pro** | Complex reasoning | 1M tokens | Deep analysis, planning |
| **gemini-3-pro-image-preview** | Image generation | N/A | Photorealistic output |
| **gemini-3-pro-video-preview** | Video generation | N/A | Walkthrough animation |

### Current Implementation

From `services/geminiService.ts`:
```typescript
const MODELS = {
  CHAT: 'gemini-2.5-flash',       // Conversational, fast
  MODEL_RENDER: 'gemini-3-pro-image-preview', // Image generation
};
```

### Extended Model Configuration

```typescript
// services/geminiService.ts - Extended

interface ModelConfig {
  id: string;
  displayName: string;
  capabilities: ModelCapability[];
  maxInputTokens: number;
  maxOutputTokens: number;
  costPer1KInput: number;
  costPer1KOutput: number;
  latencyClass: 'fast' | 'standard' | 'slow';
}

const GEMINI_MODELS: Record<string, ModelConfig> = {
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    capabilities: ['text', 'vision', 'analysis', 'chat'],
    maxInputTokens: 1_000_000,
    maxOutputTokens: 8_192,
    costPer1KInput: 0.00025,
    costPer1KOutput: 0.0005,
    latencyClass: 'fast',
  },
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    capabilities: ['text', 'vision', 'analysis', 'chat', 'reasoning'],
    maxInputTokens: 1_000_000,
    maxOutputTokens: 32_768,
    costPer1KInput: 0.00125,
    costPer1KOutput: 0.005,
    latencyClass: 'standard',
  },
  'gemini-3-pro-image-preview': {
    id: 'gemini-3-pro-image-preview',
    displayName: 'Nano Banana Pro',
    capabilities: ['image-generation'],
    maxInputTokens: 4_096,  // Text prompt limit
    maxOutputTokens: 0,     // Image output
    costPer1KInput: 0.01,
    costPer1KOutput: 0.04,  // Per image
    latencyClass: 'slow',
  },
  'gemini-3-pro-video-preview': {
    id: 'gemini-3-pro-video-preview',
    displayName: 'Gemini Video',
    capabilities: ['video-generation'],
    maxInputTokens: 4_096,
    maxOutputTokens: 0,
    costPer1KInput: 0.02,
    costPer1KOutput: 0.10,  // Per second
    latencyClass: 'slow',
  },
};

type ModelCapability =
  | 'text'
  | 'vision'
  | 'analysis'
  | 'chat'
  | 'reasoning'
  | 'image-generation'
  | 'video-generation';
```

---

## Functional Requirements

### FR-001: Context-Aware Prompt Engineering

**Description:** Every AI interaction automatically includes relevant property and project context.

**Context Injection System:**

```typescript
// services/contextInjection.ts

interface ContextInjectionConfig {
  includePropertyMeta: boolean;
  includeRoomDetails: boolean;
  includeDesignHistory: boolean;
  includeConstraints: boolean;
  includeStyle: boolean;
  includeBudget: boolean;
  maxTokens?: number;  // Truncation limit
}

function buildContextualPrompt(
  userPrompt: string,
  config: ContextInjectionConfig,
  state: AppState
): string {
  const sections: string[] = [];

  // Property-level context
  if (config.includePropertyMeta && state.activeProperty) {
    sections.push(formatPropertyContext(state.activeProperty));
  }

  // Room-specific context
  if (config.includeRoomDetails && state.selectedRoom) {
    sections.push(formatRoomContext(state.selectedRoom));
  }

  // Design decisions history
  if (config.includeDesignHistory && state.designHistory.length > 0) {
    sections.push(formatDesignHistory(state.designHistory));
  }

  // Constraints and limitations
  if (config.includeConstraints) {
    sections.push(formatConstraints(state.activeProperty?.constraints));
  }

  // Style and budget
  if (config.includeStyle) {
    sections.push(`Design Style: ${state.projectConfig.style}`);
  }
  if (config.includeBudget) {
    sections.push(`Budget Tier: ${state.projectConfig.budget}`);
  }

  // Assemble final prompt
  const context = sections.join('\n\n');
  const truncatedContext = truncateToTokenLimit(context, config.maxTokens);

  return `
## Context
${truncatedContext}

## User Request
${userPrompt}
`;
}

function formatPropertyContext(property: PropertyContext): string {
  return `
### Property Details
Address: ${property.address.formatted}
Type: ${property.details.propertyType}
Size: ${property.details.livingArea.value} sqft
Bedrooms: ${property.details.bedrooms} | Bathrooms: ${property.details.bathrooms}
Year Built: ${property.details.yearBuilt}
Climate Zone: ${property.location.climate}
Sun Orientation: ${property.location.orientation}
Zoning: ${property.regulatory.zoning}
`;
}

function formatRoomContext(room: RoomContext): string {
  return `
### Room: ${room.name}
Type: ${room.type}
Dimensions: ${room.measurements.dimensions.length.value}' x ${room.measurements.dimensions.width.value}'
Ceiling Height: ${room.measurements.dimensions.height.value}'
Square Footage: ${room.measurements.dimensions.squareFootage} sqft
Current Condition: ${room.currentState.condition}
Flooring: ${room.currentState.flooring}
Wall Treatment: ${room.currentState.walls}
Constraints: ${room.constraints.structural.join(', ') || 'None noted'}
`;
}
```

**Acceptance Criteria:**
- [ ] Context automatically included based on active view
- [ ] User can toggle context injection on/off
- [ ] Token usage displayed in UI
- [ ] Context preview available before submission

---

### FR-002: Multi-Model Workflow Orchestration

**Description:** Different tasks use optimal models based on requirements.

**Workflow Types:**

| Workflow | Steps | Models Used |
|----------|-------|-------------|
| **Design Chat** | Chat → Refine → Clarify | gemini-2.5-flash |
| **Image Generation** | Context → Generate → Validate | flash → image-preview → flash |
| **Document Analysis** | OCR → Extract → Structure | gemini-2.5-pro |
| **Property Estimation** | Query → Reason → Format | gemini-2.5-pro |
| **Inspiration Discovery** | Style → Generate → Curate | flash → image-preview |

**Workflow Engine:**

```typescript
// services/workflowEngine.ts

interface WorkflowStep {
  id: string;
  name: string;
  model: string;
  input: (context: WorkflowContext) => Promise<string>;
  output: (response: string) => Promise<WorkflowOutput>;
  onError?: (error: Error) => WorkflowAction;
}

interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  onComplete: (results: WorkflowOutput[]) => void;
}

class WorkflowEngine {
  async execute(workflow: Workflow, initialContext: WorkflowContext): Promise<void> {
    let context = initialContext;

    for (const step of workflow.steps) {
      try {
        // Build input for this step
        const input = await step.input(context);

        // Execute with appropriate model
        const response = await this.callModel(step.model, input);

        // Process output
        const output = await step.output(response);

        // Update context for next step
        context = { ...context, [step.id]: output };

        // Emit progress
        this.emit('step-complete', { step, output });

      } catch (error) {
        if (step.onError) {
          const action = step.onError(error);
          if (action === 'retry') continue;
          if (action === 'skip') continue;
          if (action === 'abort') throw error;
        }
        throw error;
      }
    }

    workflow.onComplete(Object.values(context));
  }
}

// Example: Image Generation Workflow
const imageGenerationWorkflow: Workflow = {
  id: 'generate-remodel',
  name: 'Generate Remodel Visualization',
  steps: [
    {
      id: 'build-prompt',
      name: 'Build Generation Prompt',
      model: 'gemini-2.5-flash',
      input: async (ctx) => `
        Enhance this user request for image generation:
        "${ctx.userPrompt}"

        Context: ${ctx.roomContext}
        Style: ${ctx.style}
        Budget: ${ctx.budget}

        Output a detailed, vivid description for image generation.
      `,
      output: async (response) => ({ enhancedPrompt: response }),
    },
    {
      id: 'generate-image',
      name: 'Generate Visualization',
      model: 'gemini-3-pro-image-preview',
      input: async (ctx) => ctx.enhancedPrompt,
      output: async (response) => ({ image: response }),
    },
    {
      id: 'validate-result',
      name: 'Validate Output',
      model: 'gemini-2.5-flash',
      input: async (ctx) => `
        Analyze this generated image for accuracy:
        - Does it match the requested style: ${ctx.style}?
        - Does it respect room dimensions: ${ctx.roomContext}?
        - Rate quality 1-10 and explain any issues.
      `,
      output: async (response) => ({ validation: response }),
    },
  ],
  onComplete: (results) => {
    console.log('Image generation complete', results);
  },
};
```

**Acceptance Criteria:**
- [ ] Workflows execute steps in sequence
- [ ] Each step uses optimal model
- [ ] Errors handled with retry/skip/abort options
- [ ] Progress visible to user

---

### FR-003: Streaming Response Handler

**Description:** Stream long responses for better UX, especially for chat.

**Implementation:**

```typescript
// services/streamingService.ts

async function* streamChat(
  prompt: string,
  context: ContextInjectionConfig,
  state: AppState
): AsyncGenerator<string> {
  const fullPrompt = buildContextualPrompt(prompt, context, state);

  const model = genAI.getGenerativeModel({
    model: MODELS.CHAT,
    generationConfig: { temperature: 0.7 },
  });

  const result = await model.generateContentStream(fullPrompt);

  for await (const chunk of result.stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}

// Usage in component
function ChatInterface() {
  const [message, setMessage] = useState('');
  const [streaming, setStreaming] = useState(false);

  const handleSend = async () => {
    setStreaming(true);
    let fullResponse = '';

    try {
      for await (const chunk of streamChat(userInput, config, state)) {
        fullResponse += chunk;
        setMessage(fullResponse);  // Update UI progressively
      }
    } finally {
      setStreaming(false);
      addMessage({ role: 'model', content: fullResponse });
    }
  };
}
```

**Acceptance Criteria:**
- [ ] Chat responses stream character-by-character
- [ ] User sees typing indicator during generation
- [ ] Stream can be cancelled by user
- [ ] Error recovery doesn't lose partial response

---

### FR-004: Vision Analysis Pipeline

**Description:** Analyze uploaded images (floor plans, photos, inspiration) to extract context.

**Analysis Types:**

| Type | Input | Output |
|------|-------|--------|
| **Floor Plan** | PDF/Image | Room names, dimensions, layout |
| **Room Photo** | Image | Current state, features, condition |
| **Inspiration** | Image | Style, colors, materials, products |
| **Document** | PDF/Image | Text extraction, structured data |

**Implementation:**

```typescript
// services/visionAnalysis.ts

interface AnalysisResult {
  type: AnalysisType;
  confidence: number;
  extracted: Record<string, unknown>;
  suggestions: string[];
  warnings: string[];
}

async function analyzeFloorPlan(
  image: string,  // Base64
  existingContext?: PropertyContext
): Promise<AnalysisResult> {
  const prompt = `
Analyze this floor plan image and extract:

1. Room Identification
   - List all rooms visible
   - Room types (kitchen, bedroom, bathroom, etc.)

2. Dimensions
   - Any measurements shown (in feet or meters)
   - Estimated square footage per room if not labeled

3. Features
   - Windows (location, approximate size)
   - Doors (swing direction if visible)
   - Built-ins, closets, stairs

4. Layout Relationships
   - Which rooms connect to which
   - Traffic flow patterns

${existingContext ? `
Current property data for reference:
${JSON.stringify(existingContext, null, 2)}
` : ''}

Output as structured JSON matching our RoomContext schema.
`;

  const response = await genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
    .generateContent([
      { inlineData: { mimeType: 'image/png', data: image } },
      prompt,
    ]);

  return parseAnalysisResponse(response.text());
}

async function analyzeRoomPhoto(
  image: string,
  roomType?: RoomType
): Promise<AnalysisResult> {
  const prompt = `
Analyze this room photo for a remodeling project.

${roomType ? `This is a ${roomType}.` : 'Identify the room type.'}

Extract:
1. Current State
   - Overall condition (excellent/good/fair/poor)
   - Flooring type and condition
   - Wall treatment (paint, wallpaper, tile)
   - Ceiling type and condition

2. Features Visible
   - Windows (style, condition)
   - Doors (type, hardware)
   - Built-ins, cabinetry
   - Fixtures (lighting, plumbing)

3. Measurements (estimated)
   - Room dimensions if determinable
   - Ceiling height estimate
   - Window/door sizes

4. Design Observations
   - Current style
   - Natural light quality
   - Potential constraints for remodel

5. Remodel Suggestions
   - Quick wins for improvement
   - Potential challenges

Output as structured JSON.
`;

  const response = await genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
    .generateContent([
      { inlineData: { mimeType: 'image/jpeg', data: image } },
      prompt,
    ]);

  return parseAnalysisResponse(response.text());
}

async function analyzeInspiration(
  image: string
): Promise<InspirationAnalysis> {
  const prompt = `
Analyze this interior design inspiration image.

Extract:
1. Style Classification
   - Primary style (modern, traditional, farmhouse, etc.)
   - Secondary influences

2. Color Palette
   - Primary colors (hex codes if possible)
   - Accent colors
   - Overall temperature (warm/cool/neutral)

3. Materials Visible
   - Wood types and finishes
   - Stone/tile types
   - Metal finishes
   - Fabrics/textiles

4. Key Products (if identifiable)
   - Furniture pieces
   - Lighting fixtures
   - Hardware
   - Decor items

5. Design Elements
   - Layout principles
   - Focal points
   - Texture balance
   - Lighting approach

6. Budget Estimation
   - Approximate tier (economy/standard/premium/luxury)
   - Key cost drivers

Output as structured JSON for design guidance.
`;

  const response = await genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
    .generateContent([
      { inlineData: { mimeType: 'image/jpeg', data: image } },
      prompt,
    ]);

  return parseInspirationResponse(response.text());
}
```

**Acceptance Criteria:**
- [ ] Floor plans → structured room data
- [ ] Photos → condition assessment
- [ ] Inspiration → style extraction
- [ ] Confidence scores for all extractions
- [ ] User can correct/override extracted data

---

### FR-005: "Discover Inspiration" Content Generation

**Description:** Generate textual and visual inspiration content tailored to user's property and preferences.

**Content Types:**

| Type | Description | Model |
|------|-------------|-------|
| **Style Guide** | Written description of design direction | gemini-2.5-flash |
| **Product Suggestions** | Curated list of specific items | gemini-2.5-pro |
| **Mood Board** | Grid of generated concept images | gemini-3-pro-image |
| **Trend Report** | Market-specific design trends | gemini-2.5-pro |
| **Budget Breakdown** | Cost-tier alternatives | gemini-2.5-flash |

**Inspiration Engine:**

```typescript
// services/inspirationEngine.ts

interface InspirationRequest {
  property: PropertyContext;
  room?: RoomContext;
  style: string;
  budget: BudgetTier;
  preferences: string[];
  excludeStyles?: string[];
}

interface InspirationResult {
  styleGuide: StyleGuide;
  moodBoard: MoodBoardImage[];
  productSuggestions: ProductSuggestion[];
  budgetAlternatives: BudgetOption[];
  trendInsights: TrendInsight[];
}

async function generateInspiration(
  request: InspirationRequest
): Promise<InspirationResult> {
  // Parallel generation for efficiency
  const [styleGuide, moodBoard, products, trends] = await Promise.all([
    generateStyleGuide(request),
    generateMoodBoard(request),
    generateProductSuggestions(request),
    generateTrendInsights(request),
  ]);

  // Budget alternatives computed from products
  const budgetAlternatives = computeBudgetAlternatives(products, request.budget);

  return {
    styleGuide,
    moodBoard,
    productSuggestions: products,
    budgetAlternatives,
    trendInsights: trends,
  };
}

async function generateStyleGuide(request: InspirationRequest): Promise<StyleGuide> {
  const prompt = `
Create a personalized interior design style guide for:

Property: ${request.property.address.formatted}
Room: ${request.room?.name || 'Whole home'}
Preferred Style: ${request.style}
Budget Tier: ${request.budget}
User Preferences: ${request.preferences.join(', ')}
${request.excludeStyles ? `Avoid: ${request.excludeStyles.join(', ')}` : ''}

Location considerations:
- Climate: ${request.property.location.climate}
- Regional style influences: Consider what's popular in ${request.property.address.city}

Write a 300-500 word style guide that:
1. Defines the overall aesthetic direction
2. Recommends specific materials and finishes
3. Suggests a color palette with hex codes
4. Identifies key furniture/fixture styles
5. Notes how to incorporate local/regional elements
6. Addresses the specific room constraints

Tone: Warm, approachable, professional interior designer voice.
`;

  const response = await genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    .generateContent(prompt);

  return parseStyleGuide(response.text());
}

async function generateMoodBoard(request: InspirationRequest): Promise<MoodBoardImage[]> {
  const concepts = [
    `${request.style} ${request.room?.type || 'living space'} with ${request.preferences[0]}`,
    `${request.style} detail: ${request.preferences[1] || 'materials and textures'}`,
    `${request.style} furniture arrangement for ${request.room?.measurements.dimensions.squareFootage || 200} sqft`,
    `${request.style} lighting and atmosphere`,
  ];

  const images = await Promise.all(
    concepts.map(concept => generateImage({
      prompt: `Interior design mood board image: ${concept}. Photorealistic, editorial quality.`,
      aspectRatio: '1:1',
      style: 'photorealistic',
    }))
  );

  return images.map((img, idx) => ({
    url: img.url,
    concept: concepts[idx],
    style: request.style,
  }));
}
```

**Acceptance Criteria:**
- [ ] Style guide generated based on property context
- [ ] Mood board with 4-6 concept images
- [ ] Product suggestions with real SKUs when possible
- [ ] Budget alternatives across tiers
- [ ] Location-aware trend insights

---

## API Design

### GeminiService Interface

```typescript
// services/geminiService.ts - Complete Interface

interface GeminiService {
  // Chat
  chat(history: ChatMessage[], newMessage: string): Promise<string>;
  streamChat(history: ChatMessage[], newMessage: string): AsyncGenerator<string>;

  // Vision Analysis
  analyzeContext(image: string, prompt: string): Promise<string>;
  analyzeFloorPlan(image: string): Promise<FloorPlanAnalysis>;
  analyzeRoomPhoto(image: string, roomType?: RoomType): Promise<RoomPhotoAnalysis>;
  analyzeInspiration(image: string): Promise<InspirationAnalysis>;
  extractDocumentData(document: string, type: DocumentType): Promise<ExtractedData>;

  // Property Intelligence
  getPropertyDetails(address: string): Promise<PropertyMeta>;
  estimateRenovationCost(scope: RenovationScope): Promise<CostEstimate>;
  suggestDesignOptions(context: DesignContext): Promise<DesignOption[]>;

  // Image Generation
  generateRemodel(
    viewport: string,
    prompt: string,
    context: ProjectContext,
    config: GenerationConfig
  ): Promise<GeneratedImage>;
  generateMoodBoard(style: string, preferences: string[]): Promise<MoodBoardImage[]>;
  generateProductVisualization(product: Product, room: RoomContext): Promise<GeneratedImage>;

  // Inspiration
  discoverInspiration(request: InspirationRequest): Promise<InspirationResult>;

  // Utility
  summarizeConversation(history: ChatMessage[]): Promise<string>;
  extractActionItems(conversation: string): Promise<ActionItem[]>;
}
```

### Error Handling

```typescript
// services/geminiErrors.ts

class GeminiError extends Error {
  constructor(
    message: string,
    public code: GeminiErrorCode,
    public retryable: boolean,
    public details?: Record<string, unknown>
  ) {
    super(message);
  }
}

type GeminiErrorCode =
  | 'RATE_LIMIT'      // Too many requests
  | 'QUOTA_EXCEEDED'  // Monthly quota hit
  | 'INVALID_INPUT'   // Bad prompt/image
  | 'CONTENT_FILTER'  // Safety filter triggered
  | 'MODEL_OVERLOAD'  // Temporary capacity issue
  | 'TIMEOUT'         // Request took too long
  | 'NETWORK'         // Connection issue
  | 'UNKNOWN';

const ERROR_HANDLERS: Record<GeminiErrorCode, (error: GeminiError) => void> = {
  RATE_LIMIT: async (error) => {
    await delay(error.details?.retryAfter || 5000);
    // Retry
  },
  QUOTA_EXCEEDED: (error) => {
    showNotification({
      type: 'warning',
      message: 'AI usage limit reached. Upgrade plan or wait until reset.',
    });
  },
  CONTENT_FILTER: (error) => {
    showNotification({
      type: 'info',
      message: 'Request adjusted for content guidelines. Please rephrase.',
    });
  },
  // ... other handlers
};
```

---

## Cost Management

### Token Tracking

```typescript
// services/tokenTracking.ts

interface TokenUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  timestamp: number;
}

interface UsageTracker {
  track(usage: TokenUsage): void;
  getDaily(): TokenUsage[];
  getMonthly(): TokenUsage[];
  getCost(period: 'day' | 'week' | 'month'): number;
  getProjection(): MonthlyProjection;
}

// Display in UI
function TokenUsageWidget() {
  const usage = useTokenUsage();

  return (
    <div className="token-usage">
      <div className="today">
        Today: {formatTokens(usage.daily)} tokens (${usage.dailyCost.toFixed(2)})
      </div>
      <div className="month">
        This month: ${usage.monthlyCost.toFixed(2)} / $50.00 limit
      </div>
      <progress value={usage.monthlyCost} max={50} />
    </div>
  );
}
```

### Cost Optimization Strategies

| Strategy | Implementation | Savings |
|----------|---------------|---------|
| Model selection | Use Flash for simple tasks | 60-80% |
| Context truncation | Summarize long histories | 30-50% |
| Caching | Cache property estimations | 90%+ |
| Batching | Combine related requests | 20-30% |
| Prompt optimization | Shorter, clearer prompts | 10-20% |

---

## Integration Points

### With Property Context (PRD-001)
- Property data injected into all prompts
- AI estimation fallback for missing data
- Document extraction enriches context

### With 3D Dollhouse (PRD-002)
- Viewport capture → AI input
- Generated images → texture application
- Camera metadata → perspective guidance

### With Image Generation (PRD-004)
- Orchestrates Nano Banana Pro calls
- Context preparation for generation
- Result validation and refinement

### With Source Processing (PRD-005)
- Document analysis workflows
- OCR and extraction pipelines
- Context structuring

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Response Quality** | 90%+ user satisfaction | Feedback buttons |
| **Context Accuracy** | 95%+ relevant context used | Prompt analysis |
| **Generation Success** | 98%+ images generated | Error rate |
| **Latency - Chat** | <2 seconds first token | Response time |
| **Latency - Image** | <30 seconds | Generation time |
| **Cost Efficiency** | <$0.05 per user session | Cost tracking |

---

## Security & Privacy

### Data Handling

| Data Type | Handling | Retention |
|-----------|----------|-----------|
| Prompts | Sent to API, not logged | Session only |
| Images | Base64 transmitted | Session only |
| Responses | Stored locally | User-controlled |
| Property Data | Injected into prompts | Not sent to logs |

### API Key Management

```typescript
// Secure key handling
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Never log or expose
if (!GEMINI_API_KEY) {
  console.warn('Gemini API key not configured');
}

// Rotate keys via environment
// Never commit keys to repository
```

---

## Future Enhancements

1. **Gemini Agents** - Autonomous design agents for complex workflows
2. **Fine-tuning** - Custom model for remodel-specific vocabulary
3. **Multi-modal Streaming** - Stream images as they generate
4. **Collaborative AI** - Multiple users interacting with same AI session
5. **Voice Interface** - Hands-free design conversation
6. **AR Integration** - AI suggestions in real-time AR view

---

*Document maintained by RemodelVision Team*
