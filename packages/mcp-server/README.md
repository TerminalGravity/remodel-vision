# @remodelvision/mcp-server

MCP (Model Context Protocol) server for RemodelVision - bringing property intelligence to AI agents.

## Installation

### For Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "remodelvision": {
      "command": "npx",
      "args": ["-y", "@remodelvision/mcp-server"],
      "env": {
        "REMODELVISION_API_KEY": "your-api-key"
      }
    }
  }
}
```

### For Claude Code

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "remodelvision": {
      "command": "npx",
      "args": ["-y", "@remodelvision/mcp-server"],
      "env": {
        "REMODELVISION_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Available Tools

### `remodelvision_analyze_property`

Analyze a property to extract comprehensive context.

```
Input:
- address: "123 Main St, Austin TX 78701"
- OR listing_url: "https://zillow.com/..."
- focus_areas: ["kitchen", "bathroom"] (optional)

Output:
- property_id (use with other tools)
- spaces with dimensions
- style analysis
- renovation opportunities
```

### `remodelvision_generate_design`

Generate photorealistic renovation visualizations.

```
Input:
- property_id: from analyze_property
- space: "kitchen", "bathroom", etc.
- style: "modern", "farmhouse", "industrial"
- budget_tier: "economy" | "standard" | "premium" | "luxury"
- goals: ["more_storage", "open_concept"]

Output:
- visualization_url
- design reasoning
- cost estimate
- ROI projection
```

### `remodelvision_estimate_cost`

Get detailed renovation cost breakdowns.

```
Input:
- property_id or design_id
- changes (optional): specific modifications
- include_labor: true/false
- include_permits: true/false

Output:
- Total cost range (low/mid/high)
- Breakdown by category
- Timeline estimate
- Market context
```

### `remodelvision_compare_options`

Compare multiple design options side-by-side.

```
Input:
- property_id
- options: [{ name, design_id, description }]
- comparison_criteria: ["cost", "roi", "timeline"]

Output:
- Scored comparison
- Recommendation with rationale
```

### `remodelvision_get_contractor_specs`

Generate professional specification documents.

```
Input:
- design_id
- output_format: "markdown" | "pdf" | "json"
- trade_specific: "electrical" | "plumbing" | etc.

Output:
- Complete specification document
- Measurements, materials, scope
- Trade-specific requirements
```

## Example Conversation

**User**: I'm thinking about renovating my kitchen at 456 Oak Ave, Denver CO. What would a modern farmhouse style cost?

**Agent** (using RemodelVision):
1. Calls `remodelvision_analyze_property` with address
2. Calls `remodelvision_generate_design` with style="farmhouse", budget_tier="standard"
3. Returns visualization and cost estimate

**Response**: Based on your kitchen's 12x14 layout, a modern farmhouse renovation would cost approximately $35,000-$48,000. Here's a visualization of the design... [shows image]

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `REMODELVISION_API_KEY` | Yes | Your RemodelVision API key |
| `REMODELVISION_API_URL` | No | Custom API endpoint (default: api.remodelvision.app) |

## Get an API Key

Visit [remodelvision.app/developers](https://remodelvision.app/developers) to get your API key.

## License

MIT
