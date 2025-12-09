<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# RemodelVision

AI-powered property remodeling visualization platform with 3D dollhouse views and photorealistic design generation.

## Features

- **Property Intelligence Engine** - Fetches real property data from Zillow, Redfin, and County Assessors using Firecrawl
- **3D Dollhouse View** - Interactive Three.js visualization of property layouts
- **AI Design Generation** - Gemini-powered photorealistic remodel renders
- **Smart Data Merging** - Combines multiple data sources with confidence scoring

## Tech Stack

- **Frontend**: React 19, TypeScript 5.8, Vite 6, Tailwind CSS
- **3D Engine**: Three.js 0.181, React Three Fiber, Drei
- **State**: Zustand 5.0 with persistence
- **AI**: Google Gemini 2.5 Flash
- **Data**: Firecrawl for web scraping

## Project Structure

```
remodel-vision/
├── apps/
│   └── web/              # Main Vite React application
├── packages/
│   ├── sdk/              # Core domain models and API clients
│   ├── ui/               # Shared UI components
│   └── mcp-server/       # MCP server for Claude integration
└── vercel.json           # Vercel deployment config
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm 9.15.0+

### Installation

```bash
# Clone the repository
git clone https://github.com/TerminalGravity/remodel-vision.git
cd remodel-vision

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Required: Google AI API key
VITE_GEMINI_API_KEY=your-google-ai-api-key

# Required for property data fetching
VITE_FIRECRAWL_API_KEY=your-firecrawl-api-key
```

Get your API keys:
- **Gemini**: https://aistudio.google.com/apikey
- **Firecrawl**: https://firecrawl.dev/

## Vercel Deployment

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FTerminalGravity%2Fremodel-vision&env=VITE_GEMINI_API_KEY,VITE_FIRECRAWL_API_KEY&envDescription=API%20keys%20required%20for%20the%20application&project-name=remodel-vision&repository-name=remodel-vision)

### Manual Deployment

1. **Connect Repository**: Link your GitHub repo in Vercel dashboard
2. **Configure Settings**:
   - Framework Preset: **Vite**
   - Root Directory: **Leave empty** (uses root vercel.json)
   - Build Command: `pnpm build:web`
   - Output Directory: `apps/web/dist`
   - Install Command: `corepack enable && pnpm install`

3. **Add Environment Variables**:
   | Variable | Description |
   |----------|-------------|
   | `VITE_GEMINI_API_KEY` | Google AI Studio API key |
   | `VITE_FIRECRAWL_API_KEY` | Firecrawl API key for property scraping |

4. **Deploy**: Click "Deploy" and wait for build to complete

## Development

```bash
# Run all packages in dev mode
pnpm dev

# Build all packages
pnpm build

# Type check
pnpm type-check

# Lint
pnpm lint
```

## License

MIT
