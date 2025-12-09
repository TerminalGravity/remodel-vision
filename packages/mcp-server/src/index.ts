/**
 * RemodelVision MCP Server
 *
 * Exposes property intelligence and visualization capabilities
 * to AI agents via Model Context Protocol.
 *
 * Tools:
 * - remodelvision_analyze_property: Extract context from address/listing
 * - remodelvision_generate_design: Create AI-powered design visualizations
 * - remodelvision_estimate_cost: Get renovation cost breakdowns
 * - remodelvision_compare_options: Compare design alternatives
 * - remodelvision_get_contractor_specs: Generate professional specs
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Tool input schemas
const AnalyzePropertySchema = z.object({
  address: z.string().optional().describe('Full street address of the property'),
  listing_url: z.string().url().optional().describe('URL to property listing'),
  focus_areas: z.array(z.string()).optional().describe('Specific areas to analyze'),
}).refine(data => data.address || data.listing_url, {
  message: 'Either address or listing_url is required',
});

const GenerateDesignSchema = z.object({
  property_id: z.string().describe('Property ID from analyze_property'),
  space: z.string().describe('Room to redesign: kitchen, bathroom, living_room'),
  style: z.string().describe('Design style: modern, farmhouse, industrial'),
  budget_tier: z.enum(['economy', 'standard', 'premium', 'luxury']),
  goals: z.array(z.string()).optional().describe('Design goals'),
});

const EstimateCostSchema = z.object({
  property_id: z.string().optional(),
  design_id: z.string().optional(),
  changes: z.array(z.object({
    category: z.string(),
    description: z.string(),
    scope: z.enum(['minor', 'moderate', 'major', 'gut']).optional(),
  })).optional(),
  include_labor: z.boolean().default(true),
  include_permits: z.boolean().default(true),
});

const CompareOptionsSchema = z.object({
  property_id: z.string(),
  options: z.array(z.object({
    name: z.string(),
    design_id: z.string().optional(),
    description: z.string().optional(),
  })).min(2).max(5),
  comparison_criteria: z.array(
    z.enum(['cost', 'roi', 'timeline', 'disruption', 'resale_value'])
  ).optional(),
});

const GetContractorSpecsSchema = z.object({
  design_id: z.string(),
  output_format: z.enum(['pdf', 'markdown', 'json']).default('markdown'),
  include_sections: z.array(z.string()).optional(),
  trade_specific: z.enum([
    'general', 'electrical', 'plumbing', 'hvac', 'flooring', 'cabinetry'
  ]).optional(),
});

// Tool definitions
const TOOLS = [
  {
    name: 'remodelvision_analyze_property',
    description:
      'Analyze a property address or listing URL to extract comprehensive context ' +
      'including room dimensions, architectural style, structural constraints, and ' +
      'renovation opportunities. Returns a property_id for use with other tools.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        address: {
          type: 'string',
          description: 'Full street address (e.g., "123 Main St, Austin TX 78701")',
        },
        listing_url: {
          type: 'string',
          description: 'URL to Zillow, Redfin, Realtor.com, or MLS listing',
        },
        focus_areas: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific areas: "kitchen", "bathroom", "layout", "curb_appeal"',
        },
      },
    },
  },
  {
    name: 'remodelvision_generate_design',
    description:
      'Generate a photorealistic visualization of a remodeled space with ' +
      'AI-powered design reasoning. Returns visualization URL, cost estimate, ' +
      'ROI projection, and detailed rationale for design decisions.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        property_id: {
          type: 'string',
          description: 'Property ID from analyze_property',
        },
        space: {
          type: 'string',
          description: 'Room: "kitchen", "master_bath", "living_room", "basement"',
        },
        style: {
          type: 'string',
          description: 'Style: "modern", "farmhouse", "industrial", "coastal"',
        },
        budget_tier: {
          type: 'string',
          enum: ['economy', 'standard', 'premium', 'luxury'],
        },
        goals: {
          type: 'array',
          items: { type: 'string' },
          description: 'Goals: "more_storage", "open_concept", "natural_light"',
        },
      },
      required: ['property_id', 'space', 'style', 'budget_tier'],
    },
  },
  {
    name: 'remodelvision_estimate_cost',
    description:
      'Get detailed cost breakdown for proposed renovations with local market ' +
      'pricing, labor costs, permit fees, and material specifications.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        property_id: { type: 'string' },
        design_id: { type: 'string' },
        changes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              description: { type: 'string' },
              scope: { type: 'string', enum: ['minor', 'moderate', 'major', 'gut'] },
            },
          },
        },
        include_labor: { type: 'boolean', default: true },
        include_permits: { type: 'boolean', default: true },
      },
    },
  },
  {
    name: 'remodelvision_compare_options',
    description:
      'Compare multiple design or renovation options side-by-side with ' +
      'cost/benefit analysis, ROI projections, and timeline estimates.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        property_id: { type: 'string' },
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              design_id: { type: 'string' },
              description: { type: 'string' },
            },
          },
          minItems: 2,
          maxItems: 5,
        },
        comparison_criteria: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['cost', 'roi', 'timeline', 'disruption', 'resale_value'],
          },
        },
      },
      required: ['property_id', 'options'],
    },
  },
  {
    name: 'remodelvision_get_contractor_specs',
    description:
      'Generate professional specification documents for contractors including ' +
      'measurements, materials, scope of work, and trade-specific details.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        design_id: { type: 'string' },
        output_format: {
          type: 'string',
          enum: ['pdf', 'markdown', 'json'],
          default: 'markdown',
        },
        include_sections: {
          type: 'array',
          items: { type: 'string' },
        },
        trade_specific: {
          type: 'string',
          enum: ['general', 'electrical', 'plumbing', 'hvac', 'flooring', 'cabinetry'],
        },
      },
      required: ['design_id'],
    },
  },
];

// Server implementation
class RemodelVisionMCPServer {
  private server: Server;
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.REMODELVISION_API_KEY || '';
    this.baseUrl = process.env.REMODELVISION_API_URL || 'https://api.remodelvision.app';

    this.server = new Server(
      {
        name: 'remodelvision',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'remodelvision_analyze_property':
            return await this.analyzeProperty(args);
          case 'remodelvision_generate_design':
            return await this.generateDesign(args);
          case 'remodelvision_estimate_cost':
            return await this.estimateCost(args);
          case 'remodelvision_compare_options':
            return await this.compareOptions(args);
          case 'remodelvision_get_contractor_specs':
            return await this.getContractorSpecs(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [{ type: 'text', text: `Error: ${message}` }],
          isError: true,
        };
      }
    });
  }

  private async analyzeProperty(args: unknown) {
    const input = AnalyzePropertySchema.parse(args);

    // TODO: Replace with actual API call
    const mockResult = {
      property_id: `prop_${Date.now()}`,
      address: {
        street: input.address || 'Extracted from listing',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
      },
      spaces: [
        {
          id: 'kitchen_1',
          type: 'kitchen',
          dimensions: { width: 12, length: 15, height: 9 },
          features: ['island', 'pantry', 'breakfast_nook'],
          style_compatibility: ['modern', 'transitional', 'farmhouse'],
        },
      ],
      style_analysis: {
        current_style: 'traditional',
        architectural_era: '1990s',
        condition: 'dated_but_functional',
      },
      renovation_opportunities: [
        {
          space: 'kitchen',
          opportunity: 'Open concept conversion',
          estimated_roi: 0.72,
          complexity: 'moderate',
        },
      ],
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(mockResult, null, 2),
      }],
    };
  }

  private async generateDesign(args: unknown) {
    const input = GenerateDesignSchema.parse(args);

    // TODO: Replace with actual Gemini + Nano Banana Pro call
    const mockResult = {
      design_id: `design_${Date.now()}`,
      property_id: input.property_id,
      space: input.space,
      style: input.style,
      visualization_url: 'https://placeholder.remodelvision.app/design.png',
      reasoning: {
        layout_rationale:
          `Maintained ${input.space} footprint while maximizing functionality for ${input.budget_tier} budget.`,
        style_choices: [
          {
            element: 'Countertops',
            choice: input.budget_tier === 'luxury' ? 'Quartzite' : 'Quartz',
            rationale: 'Durability meets aesthetic for budget tier',
          },
        ],
        budget_allocations: {
          cabinetry: 0.35,
          countertops: 0.20,
          appliances: 0.25,
          flooring: 0.10,
          lighting: 0.10,
        },
      },
      cost_estimate: {
        low: input.budget_tier === 'economy' ? 15000 : 35000,
        mid: input.budget_tier === 'economy' ? 22000 : 50000,
        high: input.budget_tier === 'economy' ? 30000 : 75000,
        currency: 'USD',
      },
      roi_projection: {
        value_add_low: 20000,
        value_add_high: 45000,
        roi_percentage: 0.65,
        payback_scenario: 'At sale within 5 years',
      },
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(mockResult, null, 2),
      }],
    };
  }

  private async estimateCost(args: unknown) {
    const input = EstimateCostSchema.parse(args);

    const mockResult = {
      estimate_id: `est_${Date.now()}`,
      total: {
        low: 25000,
        mid: 35000,
        high: 48000,
      },
      breakdown: [
        { category: 'Materials', amount: 15000, percentage: 0.43 },
        { category: 'Labor', amount: 12000, percentage: 0.34 },
        { category: 'Permits & Fees', amount: 2000, percentage: 0.06 },
        { category: 'Contingency', amount: 6000, percentage: 0.17 },
      ],
      labor_included: input.include_labor,
      permits_included: input.include_permits,
      market_context: {
        location: 'Austin, TX',
        cost_index: 1.15,
        market_condition: 'competitive',
      },
      timeline_estimate: '4-6 weeks',
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(mockResult, null, 2),
      }],
    };
  }

  private async compareOptions(args: unknown) {
    const input = CompareOptionsSchema.parse(args);

    const mockResult = {
      comparison_id: `cmp_${Date.now()}`,
      property_id: input.property_id,
      options: input.options.map((opt, i) => ({
        ...opt,
        scores: {
          cost: 3 + i,
          roi: 5 - i,
          timeline: 4,
          disruption: 2 + i,
          resale_value: 4 - i * 0.5,
        },
        recommendation_rank: i + 1,
      })),
      recommendation: input.options[0].name,
      recommendation_rationale:
        'Best balance of cost efficiency and ROI for your goals.',
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(mockResult, null, 2),
      }],
    };
  }

  private async getContractorSpecs(args: unknown) {
    const input = GetContractorSpecsSchema.parse(args);

    const mockSpecs = `# Contractor Specifications
## Design ID: ${input.design_id}

### Scope of Work
- Kitchen remodel - moderate scope
- Preserve existing footprint
- Update all surfaces and fixtures

### Measurements
- Room: 12' x 15' (180 sq ft)
- Ceiling: 9'
- Island: 4' x 6'

### Materials Specification
| Item | Specification | Quantity |
|------|---------------|----------|
| Countertops | Quartz, 3cm | 45 sq ft |
| Cabinets | Shaker style, soft-close | 24 linear ft |
| Flooring | LVP, wood-look | 180 sq ft |

### Trade Requirements
${input.trade_specific === 'electrical' ? `
#### Electrical
- 20A dedicated circuit for island
- Under-cabinet LED lighting
- Update to GFCI outlets
` : input.trade_specific === 'plumbing' ? `
#### Plumbing
- Relocate sink to island
- New supply lines for dishwasher
- Garbage disposal upgrade
` : `
- General contractor coordination required
- Subcontractors: electrical, plumbing
`}

### Timeline
- Demolition: 2 days
- Rough-in: 5 days
- Installation: 10 days
- Finishing: 3 days

---
Generated by RemodelVision
`;

    return {
      content: [{
        type: 'text',
        text: input.output_format === 'json'
          ? JSON.stringify({ specs: mockSpecs, format: 'markdown' })
          : mockSpecs,
      }],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('RemodelVision MCP server running on stdio');
  }
}

// Main entry point
const server = new RemodelVisionMCPServer();
server.run().catch(console.error);
