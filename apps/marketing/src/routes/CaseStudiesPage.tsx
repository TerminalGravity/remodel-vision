import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, TrendingUp, Clock } from 'lucide-react';
import { Button, Card } from '@remodelvision/ui';

// Mock case studies - in production, fetch from Supabase
const caseStudies = [
  {
    id: '1',
    slug: 'modern-interiors-co',
    title: 'How Modern Interiors Co. Increased Close Rate by 40%',
    client: 'Modern Interiors Co.',
    industry: 'Interior Design',
    location: 'San Francisco, CA',
    excerpt: 'A boutique interior design firm transformed their client presentations with 3D visualization, dramatically improving their sales process.',
    metrics: {
      roi: '40%',
      roiLabel: 'Close Rate Increase',
      time: '60%',
      timeLabel: 'Time Saved',
      projects: '3x',
      projectsLabel: 'More Projects',
    },
    testimonial: {
      quote: 'RemodelVision completely changed how we present designs to clients. They can actually see their future home before we start any work.',
      author: 'Sarah Chen',
      role: 'Principal Designer',
    },
    featured: true,
  },
  {
    id: '2',
    slug: 'buildright-llc',
    title: 'BuildRight LLC: Streamlining Renovation Proposals',
    client: 'BuildRight LLC',
    industry: 'Renovation Contractor',
    location: 'Austin, TX',
    excerpt: 'A general contractor used property intelligence to create more accurate estimates and win more bids.',
    metrics: {
      roi: '25%',
      roiLabel: 'More Accurate Bids',
      time: '4hrs',
      timeLabel: 'Saved Per Project',
      projects: '2x',
      projectsLabel: 'Bid Volume',
    },
    testimonial: {
      quote: 'The property intelligence feature alone saves us hours of research on every project.',
      author: 'Marcus Rodriguez',
      role: 'Owner',
    },
    featured: true,
  },
  {
    id: '3',
    slug: 'watson-design-studio',
    title: 'Watson Design Studio: Scaling with AI',
    client: 'Watson Design Studio',
    industry: 'Residential Architecture',
    location: 'Denver, CO',
    excerpt: 'An architecture firm used AI-powered design generation to handle 3x more projects without adding staff.',
    metrics: {
      roi: '3x',
      roiLabel: 'Project Capacity',
      time: '80%',
      timeLabel: 'Faster Concepts',
      projects: '$2M',
      projectsLabel: 'New Revenue',
    },
    testimonial: {
      quote: 'We can now show clients 10 design options in the time it used to take us to create one.',
      author: 'Emily Watson',
      role: 'Interior Architect',
    },
    featured: false,
  },
  {
    id: '4',
    slug: 'home-harmony-designs',
    title: 'Home Harmony: Remote Client Collaboration',
    client: 'Home Harmony Designs',
    industry: 'E-Design',
    location: 'Remote',
    excerpt: 'An e-design firm used RemodelVision to serve clients nationwide with immersive 3D presentations.',
    metrics: {
      roi: '5x',
      roiLabel: 'Client Reach',
      time: '90%',
      timeLabel: 'Less Travel',
      projects: '150+',
      projectsLabel: 'Remote Projects',
    },
    testimonial: {
      quote: 'We went from serving just our local market to working with clients across the country.',
      author: 'Jennifer Park',
      role: 'Founder',
    },
    featured: false,
  },
];

export const CaseStudiesPage = () => {
  const featuredStudies = caseStudies.filter((s) => s.featured);
  const otherStudies = caseStudies.filter((s) => !s.featured);

  return (
    <>
      <Helmet>
        <title>Case Studies - RemodelVision</title>
        <meta
          name="description"
          content="See how design professionals are transforming their businesses with RemodelVision. Real results from real customers."
        />
      </Helmet>

      {/* Hero */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Case Studies</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            See how design professionals are transforming their businesses with RemodelVision.
            Real results from real customers.
          </p>
        </div>
      </section>

      {/* Featured Case Studies */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-8">
            {featuredStudies.map((study) => (
              <Card key={study.id} className="overflow-hidden bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                <div className="grid lg:grid-cols-2">
                  {/* Image */}
                  <div className="aspect-video lg:aspect-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-white/20">{study.client.charAt(0)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded">
                        {study.industry}
                      </span>
                      <span className="text-sm text-slate-500">{study.location}</span>
                    </div>
                    <h2 className="text-2xl font-bold mb-3">{study.title}</h2>
                    <p className="text-slate-400 mb-6">{study.excerpt}</p>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <div className="text-2xl font-bold text-green-400">{study.metrics.roi}</div>
                        <div className="text-xs text-slate-500">{study.metrics.roiLabel}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-400">{study.metrics.time}</div>
                        <div className="text-xs text-slate-500">{study.metrics.timeLabel}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-400">{study.metrics.projects}</div>
                        <div className="text-xs text-slate-500">{study.metrics.projectsLabel}</div>
                      </div>
                    </div>

                    {/* Testimonial */}
                    <blockquote className="border-l-2 border-blue-500 pl-4 mb-6">
                      <p className="text-slate-300 italic mb-2">&ldquo;{study.testimonial.quote}&rdquo;</p>
                      <footer className="text-sm text-slate-500">
                        — {study.testimonial.author}, {study.testimonial.role}
                      </footer>
                    </blockquote>

                    <Link to={`/case-studies/${study.slug}`}>
                      <Button variant="outline" className="gap-2">
                        Read Full Story <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Other Case Studies */}
      <section className="py-16 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">More Success Stories</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {otherStudies.map((study) => (
              <Link key={study.id} to={`/case-studies/${study.slug}`}>
                <Card className="h-full overflow-hidden bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors group">
                  <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-700" />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-blue-400">{study.industry}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-500">{study.location}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                      {study.title}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">{study.excerpt}</p>

                    {/* Compact Metrics */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-green-400">
                        <TrendingUp className="w-4 h-4" />
                        <span>{study.metrics.roi}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-400">
                        <Clock className="w-4 h-4" />
                        <span>{study.metrics.time}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Write Your Success Story?</h2>
          <p className="text-xl text-slate-400 mb-8">
            Join hundreds of design professionals who've transformed their business with RemodelVision.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gap-2" asChild>
              <a href="https://app.remodelvision.app/register">
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                Talk to Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
