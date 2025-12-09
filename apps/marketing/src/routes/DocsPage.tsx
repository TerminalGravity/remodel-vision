import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Book, Code, Zap, Terminal, Copy, Check, ExternalLink, ChevronRight } from 'lucide-react';
import { Card } from '@remodelvision/ui';

const docSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Book,
    items: [
      { id: 'introduction', title: 'Introduction' },
      { id: 'quickstart', title: 'Quick Start Guide' },
      { id: 'authentication', title: 'Authentication' },
    ],
  },
  {
    id: 'api',
    title: 'API Reference',
    icon: Code,
    items: [
      { id: 'overview', title: 'API Overview' },
      { id: 'designs', title: 'Designs Endpoint' },
      { id: 'properties', title: 'Properties Endpoint' },
      { id: 'projects', title: 'Projects Endpoint' },
      { id: 'webhooks', title: 'Webhooks' },
    ],
  },
  {
    id: 'sdk',
    title: 'SDK Guide',
    icon: Zap,
    items: [
      { id: 'installation', title: 'Installation' },
      { id: 'configuration', title: 'Configuration' },
      { id: 'examples', title: 'Code Examples' },
      { id: 'types', title: 'TypeScript Types' },
    ],
  },
  {
    id: 'mcp',
    title: 'MCP Integration',
    icon: Terminal,
    items: [
      { id: 'what-is-mcp', title: 'What is MCP?' },
      { id: 'setup', title: 'Setup Guide' },
      { id: 'tools', title: 'Available Tools' },
      { id: 'examples', title: 'Usage Examples' },
    ],
  },
];

const CodeBlock = ({ code, language: _language }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-slate-900 border border-slate-800 rounded-lg p-4 overflow-x-auto">
        <code className="text-sm text-slate-300">{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
};

export const DocsPage = () => {
  const { section } = useParams();
  const activeSection = section || 'getting-started';

  return (
    <>
      <Helmet>
        <title>Documentation - RemodelVision</title>
        <meta
          name="description"
          content="Complete documentation for the RemodelVision API, SDK, and MCP integration. Get started with our developer tools."
        />
      </Helmet>

      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-[280px_1fr] gap-12">
            {/* Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                <div>
                  <h2 className="text-lg font-bold mb-4">Documentation</h2>
                  <nav className="space-y-6">
                    {docSections.map((section) => (
                      <div key={section.id}>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-2">
                          <section.icon className="w-4 h-4" />
                          {section.title}
                        </div>
                        <ul className="space-y-1 pl-6 border-l border-slate-800">
                          {section.items.map((item) => (
                            <li key={item.id}>
                              <Link
                                to={`/docs/${section.id}#${item.id}`}
                                className={`block py-1.5 text-sm transition-colors ${
                                  activeSection === section.id
                                    ? 'text-blue-400'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                              >
                                {item.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </nav>
                </div>

                {/* Quick Links */}
                <Card className="p-4 bg-slate-900/50 border-slate-800">
                  <h3 className="text-sm font-semibold mb-3">Resources</h3>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a href="#" className="flex items-center gap-2 text-slate-400 hover:text-white">
                        <ExternalLink className="w-4 h-4" />
                        GitHub Repository
                      </a>
                    </li>
                    <li>
                      <a href="#" className="flex items-center gap-2 text-slate-400 hover:text-white">
                        <ExternalLink className="w-4 h-4" />
                        NPM Package
                      </a>
                    </li>
                    <li>
                      <a href="#" className="flex items-center gap-2 text-slate-400 hover:text-white">
                        <ExternalLink className="w-4 h-4" />
                        API Status
                      </a>
                    </li>
                  </ul>
                </Card>
              </div>
            </aside>

            {/* Main Content */}
            <main className="min-w-0">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                <Link to="/docs" className="hover:text-white">Docs</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">Getting Started</span>
              </div>

              {/* Content */}
              <article className="prose prose-invert max-w-none">
                <h1 className="text-4xl font-bold mb-4">Getting Started with RemodelVision</h1>
                <p className="text-xl text-slate-400 mb-8">
                  Welcome to the RemodelVision developer documentation. Learn how to integrate
                  AI-powered design generation into your applications.
                </p>

                <section id="introduction" className="mb-12">
                  <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                  <p className="text-slate-300 mb-4">
                    RemodelVision provides a comprehensive API and SDK for integrating AI-powered
                    home design capabilities into your applications. Whether you're building a
                    design tool, a real estate platform, or a contractor management system, our
                    API gives you access to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-300 mb-6">
                    <li>AI-powered design generation using natural language prompts</li>
                    <li>Property intelligence from Zillow, Redfin, and county records</li>
                    <li>3D visualization and rendering capabilities</li>
                    <li>Cost estimation and budgeting tools</li>
                  </ul>
                </section>

                <section id="quickstart" className="mb-12">
                  <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
                  <p className="text-slate-300 mb-4">
                    Get up and running in minutes with our TypeScript SDK:
                  </p>

                  <h3 className="text-lg font-semibold mb-3">1. Install the SDK</h3>
                  <CodeBlock code="npm install @remodelvision/sdk" />

                  <h3 className="text-lg font-semibold mb-3 mt-6">2. Initialize the Client</h3>
                  <CodeBlock
                    code={`import { RemodelVision } from '@remodelvision/sdk';

const client = new RemodelVision({
  apiKey: process.env.REMODELVISION_API_KEY,
});`}
                  />

                  <h3 className="text-lg font-semibold mb-3 mt-6">3. Generate Your First Design</h3>
                  <CodeBlock
                    code={`const design = await client.designs.generate({
  prompt: 'Modern kitchen with white cabinets and marble countertops',
  style: 'contemporary',
  budget: 'medium',
});

console.log(design.imageUrl);
console.log(design.estimatedCost);`}
                  />
                </section>

                <section id="authentication" className="mb-12">
                  <h2 className="text-2xl font-bold mb-4">Authentication</h2>
                  <p className="text-slate-300 mb-4">
                    All API requests require authentication using an API key. You can find your
                    API key in the <a href="#" className="text-blue-400 hover:text-blue-300">Dashboard Settings</a>.
                  </p>

                  <Card className="p-4 bg-yellow-500/10 border-yellow-500/20 mb-6">
                    <p className="text-sm text-yellow-200">
                      <strong>Important:</strong> Keep your API key secure. Never expose it in
                      client-side code or commit it to version control.
                    </p>
                  </Card>

                  <h3 className="text-lg font-semibold mb-3">Using the API Key</h3>
                  <p className="text-slate-300 mb-4">
                    Include your API key in the <code className="bg-slate-800 px-1 rounded">Authorization</code> header:
                  </p>
                  <CodeBlock
                    code={`curl https://api.remodelvision.app/v1/designs \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                  />
                </section>

                {/* Next Steps */}
                <section className="mt-16 pt-8 border-t border-slate-800">
                  <h2 className="text-xl font-bold mb-6">Next Steps</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Link to="/docs/api">
                      <Card className="p-4 bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors group">
                        <div className="flex items-center gap-3">
                          <Code className="w-8 h-8 text-blue-400" />
                          <div>
                            <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                              API Reference
                            </h3>
                            <p className="text-sm text-slate-400">
                              Explore all available endpoints
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                    <Link to="/docs/sdk">
                      <Card className="p-4 bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors group">
                        <div className="flex items-center gap-3">
                          <Zap className="w-8 h-8 text-purple-400" />
                          <div>
                            <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                              SDK Guide
                            </h3>
                            <p className="text-sm text-slate-400">
                              Learn the TypeScript SDK
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </div>
                </section>
              </article>
            </main>
          </div>
        </div>
      </div>
    </>
  );
};
