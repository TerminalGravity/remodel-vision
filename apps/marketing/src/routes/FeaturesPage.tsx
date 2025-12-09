import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  Brain,
  Eye,
  Zap,
  BarChart3,
  Users,
  Shield,
  Globe,
  Database,
  Code,
  Cpu,
} from 'lucide-react';
import { Button, Card } from '@remodelvision/ui';

const featureCategories = [
  {
    id: 'ai-design',
    icon: Brain,
    title: 'AI-Powered Design',
    description: 'Generate stunning remodel concepts using advanced AI that understands your style preferences.',
    features: [
      'Natural language design prompts',
      'Style matching from reference images',
      'Budget-aware recommendations',
      'Multiple design variations',
      'Real-time design iteration',
      'Design history & versioning',
    ],
    color: 'blue',
  },
  {
    id: '3d-visualization',
    icon: Eye,
    title: '3D Visualization',
    description: 'Explore your future space in an interactive 3D dollhouse view with realistic lighting.',
    features: [
      'Interactive 3D dollhouse view',
      'Walk-through mode',
      'Realistic lighting simulation',
      'Material previews',
      'Before/after comparisons',
      'VR-ready exports',
    ],
    color: 'purple',
  },
  {
    id: 'property-intel',
    icon: Zap,
    title: 'Property Intelligence',
    description: 'Automatically fetch property data from Zillow, Redfin, and county records.',
    features: [
      'Automatic property lookup',
      'Square footage & room count',
      'Lot size & zoning info',
      'Historical sale data',
      'Comparable properties',
      'Market value estimates',
    ],
    color: 'green',
  },
  {
    id: 'budgeting',
    icon: BarChart3,
    title: 'Smart Budgeting',
    description: 'Get accurate cost estimates based on local contractor rates and material costs.',
    features: [
      'Line-item cost breakdown',
      'Local labor rates',
      'Material cost database',
      'Contingency planning',
      'ROI projections',
      'Export to Excel/PDF',
    ],
    color: 'orange',
  },
  {
    id: 'collaboration',
    icon: Users,
    title: 'Team Collaboration',
    description: 'Share designs with clients, contractors, and team members in real-time.',
    features: [
      'Real-time collaboration',
      'Comments & annotations',
      'Version control',
      'Role-based permissions',
      'Client presentation mode',
      'Email sharing & links',
    ],
    color: 'pink',
  },
  {
    id: 'integrations',
    icon: Globe,
    title: 'Integrations',
    description: 'Connect with your favorite tools and services.',
    features: [
      'Zapier integration',
      'QuickBooks sync',
      'Google Calendar',
      'Slack notifications',
      'CRM connections',
      'REST API access',
    ],
    color: 'cyan',
  },
];

const enterpriseFeatures = [
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC2 Type II certified with end-to-end encryption and audit logs.',
  },
  {
    icon: Database,
    title: 'Custom Data Retention',
    description: 'Configure data retention policies to meet your compliance requirements.',
  },
  {
    icon: Code,
    title: 'API & SDK Access',
    description: 'Full programmatic access with TypeScript SDK and MCP server integration.',
  },
  {
    icon: Cpu,
    title: 'Dedicated Infrastructure',
    description: 'Private cloud deployment options with guaranteed uptime SLA.',
  },
];

export const FeaturesPage = () => {
  return (
    <>
      <Helmet>
        <title>Features - RemodelVision</title>
        <meta
          name="description"
          content="Explore RemodelVision's powerful features: AI-powered design, 3D visualization, property intelligence, smart budgeting, and team collaboration."
        />
      </Helmet>

      {/* Hero */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Powerful Features for <span className="gradient-text">Modern Design</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10">
            Everything you need to transform renovation projects from concept to completion.
            Built for designers, contractors, and homeowners.
          </p>
          <Button size="lg" className="gap-2" asChild>
            <a href="https://app.remodelvision.app/register">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </a>
          </Button>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-24">
            {featureCategories.map((category, index) => (
              <div
                key={category.id}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className={`w-14 h-14 rounded-2xl bg-${category.color}-500/10 flex items-center justify-center mb-6`}>
                    <category.icon className={`w-7 h-7 text-${category.color}-400`} />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">{category.title}</h2>
                  <p className="text-lg text-slate-400 mb-8">{category.description}</p>
                  <ul className="grid grid-cols-2 gap-4">
                    {category.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <Card className="aspect-video bg-slate-900/50 border-slate-800 flex items-center justify-center">
                    <div className="text-center">
                      <category.icon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-600">Feature Preview</p>
                    </div>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Enterprise Ready</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Built for scale with security, compliance, and customization options for large organizations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {enterpriseFeatures.map((feature) => (
              <Card key={feature.title} className="p-6 bg-slate-900/50 border-slate-800">
                <feature.icon className="w-10 h-10 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/contact">
              <Button variant="outline" size="lg" className="gap-2">
                Contact Enterprise Sales <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Experience the Future of Design?
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Start your free trial today and see why thousands of professionals choose RemodelVision.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gap-2" asChild>
              <a href="https://app.remodelvision.app/register">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
            <Link to="/pricing">
              <Button variant="outline" size="lg">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
