import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  Sparkles,
  Zap,
  Eye,
  Brain,
  Shield,
  BarChart3,
  Users,
  Play,
  Check,
  Star,
} from 'lucide-react';
import { Button, Card } from '@remodelvision/ui';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Design',
    description: 'Generate stunning remodel concepts using advanced AI that understands your style preferences.',
  },
  {
    icon: Eye,
    title: '3D Visualization',
    description: 'Explore your future space in an interactive 3D dollhouse view with realistic lighting.',
  },
  {
    icon: Zap,
    title: 'Property Intelligence',
    description: 'Automatically fetch property data from Zillow, Redfin, and county records.',
  },
  {
    icon: BarChart3,
    title: 'Smart Budgeting',
    description: 'Get accurate cost estimates based on local contractor rates and material costs.',
  },
  {
    icon: Users,
    title: 'Collaboration',
    description: 'Share designs with clients, contractors, and team members in real-time.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC2 compliant with end-to-end encryption for all your project data.',
  },
];

const testimonials = [
  {
    quote: "RemodelVision cut our design iteration time by 80%. Clients love seeing their homes transformed in 3D.",
    author: 'Sarah Chen',
    role: 'Principal Designer',
    company: 'Modern Interiors Co.',
    avatar: 'SC',
  },
  {
    quote: "The property intelligence feature alone saves us hours of research. It's like having a research assistant built-in.",
    author: 'Marcus Rodriguez',
    role: 'Renovation Contractor',
    company: 'BuildRight LLC',
    avatar: 'MR',
  },
  {
    quote: "Finally, a tool that speaks both designer and contractor language. The budgeting accuracy is incredible.",
    author: 'Emily Watson',
    role: 'Interior Architect',
    company: 'Watson Design Studio',
    avatar: 'EW',
  },
];

const stats = [
  { value: '10,000+', label: 'Projects Created' },
  { value: '500+', label: 'Design Firms' },
  { value: '4.9/5', label: 'User Rating' },
  { value: '80%', label: 'Time Saved' },
];

export const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>RemodelVision - AI-Powered Remodeling Platform</title>
        <meta
          name="description"
          content="Transform your vision into reality with AI-powered design, property intelligence, and 3D visualization. The modern platform for renovation professionals."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 pattern-grid opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/50 to-slate-950" />

        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Google Gemini AI</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-slide-up">
              Transform Your{' '}
              <span className="gradient-text">Vision</span>
              <br />Into Reality
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              The AI-powered platform that combines property intelligence,
              3D visualization, and intelligent design recommendations for renovation professionals.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button size="lg" className="gap-2 text-base px-8" asChild>
                <a href="https://app.remodelvision.app/register">
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
              <Button variant="outline" size="lg" className="gap-2 text-base px-8">
                <Play className="w-5 h-5" /> Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-slate-400 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ))}
                <span className="ml-2">4.9/5 from 500+ reviews</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-slate-700" />
              <span>Trusted by 500+ design firms</span>
            </div>
          </div>

          {/* Hero Visual - Placeholder for 3D Demo */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="aspect-video max-w-5xl mx-auto rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 shadow-2xl glow-blue">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-slate-400">Interactive 3D Demo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Design Better</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              A complete platform for renovation professionals, from initial concept to final delivery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6 bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/features">
              <Button variant="outline" className="gap-2">
                Explore All Features <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-slate-400">Three simple steps to transform any space</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Enter Property Address',
                description: 'We automatically fetch property data, floor plans, and local market information.',
              },
              {
                step: '02',
                title: 'Describe Your Vision',
                description: 'Tell our AI what you want to achieve - style, budget, timeline, and preferences.',
              },
              {
                step: '03',
                title: 'Explore & Iterate',
                description: 'View AI-generated designs in 3D, refine details, and share with clients.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-8xl font-bold text-slate-800 absolute -top-8 left-0">{item.step}</div>
                <div className="relative pt-12">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-slate-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Design Professionals</h2>
            <p className="text-xl text-slate-400">See what our customers are saying</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.author} className="p-6 bg-slate-900/50 border-slate-800">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium">{testimonial.author}</div>
                    <div className="text-sm text-slate-400">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-slate-400">Start free, upgrade when you're ready</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$0',
                description: 'Perfect for trying out RemodelVision',
                features: ['5 projects/month', 'Basic AI designs', '3D visualization', 'Email support'],
                cta: 'Start Free',
                popular: false,
              },
              {
                name: 'Professional',
                price: '$49',
                description: 'For individual designers and contractors',
                features: ['Unlimited projects', 'Advanced AI designs', 'Property intelligence', 'Priority support', 'Team collaboration'],
                cta: 'Start Trial',
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For design firms and large teams',
                features: ['Everything in Pro', 'Custom integrations', 'API access', 'Dedicated success manager', 'SLA guarantee'],
                cta: 'Contact Sales',
                popular: false,
              },
            ].map((plan) => (
              <Card
                key={plan.name}
                className={`p-6 ${plan.popular ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 bg-slate-900/50'}`}
              >
                {plan.popular && (
                  <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Most Popular</div>
                )}
                <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-slate-400">/month</span>}
                </div>
                <p className="text-sm text-slate-400 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/pricing" className="text-blue-400 hover:text-blue-300 transition-colors">
              View full pricing details <ArrowRight className="w-4 h-4 inline ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Design Process?
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Join 500+ design firms already using RemodelVision to win more clients and deliver faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gap-2 text-base px-8" asChild>
              <a href="https://app.remodelvision.app/register">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="text-base px-8">
                Talk to Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
