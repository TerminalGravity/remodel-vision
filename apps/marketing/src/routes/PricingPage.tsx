import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Check, X, ArrowRight, HelpCircle } from 'lucide-react';
import { Button, Card } from '@remodelvision/ui';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for trying out RemodelVision',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: {
      projects: '5 projects/month',
      aiDesigns: 'Basic AI designs',
      visualization: '3D visualization',
      propertyIntel: false,
      collaboration: false,
      apiAccess: false,
      support: 'Email support',
      storage: '1 GB storage',
    },
    cta: 'Start Free',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For individual designers and contractors',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: {
      projects: 'Unlimited projects',
      aiDesigns: 'Advanced AI designs',
      visualization: '3D visualization + VR export',
      propertyIntel: 'Full property intelligence',
      collaboration: 'Team collaboration (5 seats)',
      apiAccess: false,
      support: 'Priority support',
      storage: '50 GB storage',
    },
    cta: 'Start Trial',
    popular: true,
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For growing design teams',
    monthlyPrice: 99,
    yearlyPrice: 79,
    features: {
      projects: 'Unlimited projects',
      aiDesigns: 'Advanced AI + custom models',
      visualization: 'All visualization features',
      propertyIntel: 'Full property intelligence',
      collaboration: 'Unlimited team members',
      apiAccess: 'API access (10k calls/mo)',
      support: 'Priority + phone support',
      storage: '200 GB storage',
    },
    cta: 'Start Trial',
    popular: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyPrice: null,
    yearlyPrice: null,
    features: {
      projects: 'Unlimited everything',
      aiDesigns: 'Custom AI training',
      visualization: 'White-label options',
      propertyIntel: 'Custom data sources',
      collaboration: 'SSO + advanced permissions',
      apiAccess: 'Unlimited API access',
      support: 'Dedicated success manager',
      storage: 'Unlimited storage',
    },
    cta: 'Contact Sales',
    popular: false,
  },
];

const comparisonFeatures = [
  { name: 'Projects per month', starter: '5', professional: 'Unlimited', team: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'AI design generations', starter: '20/mo', professional: '500/mo', team: '2,000/mo', enterprise: 'Unlimited' },
  { name: '3D Visualization', starter: true, professional: true, team: true, enterprise: true },
  { name: 'Property Intelligence', starter: false, professional: true, team: true, enterprise: true },
  { name: 'Team members', starter: '1', professional: '5', team: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Storage', starter: '1 GB', professional: '50 GB', team: '200 GB', enterprise: 'Unlimited' },
  { name: 'API access', starter: false, professional: false, team: true, enterprise: true },
  { name: 'Custom branding', starter: false, professional: false, team: false, enterprise: true },
  { name: 'SSO/SAML', starter: false, professional: false, team: false, enterprise: true },
  { name: 'SLA guarantee', starter: false, professional: false, team: false, enterprise: true },
  { name: 'Dedicated support', starter: false, professional: false, team: false, enterprise: true },
];

const faqs = [
  {
    question: 'Can I try RemodelVision for free?',
    answer: 'Yes! Our Starter plan is completely free and includes 5 projects per month. No credit card required to get started.',
  },
  {
    question: 'What happens when I exceed my project limit?',
    answer: 'On the Starter plan, you\'ll need to wait until the next month or upgrade. Paid plans have unlimited projects so you never have to worry about limits.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Absolutely. You can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer: 'Yes! Annual billing saves you 20% compared to monthly billing. The discount is automatically applied when you choose annual billing.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, Amex) and can arrange invoicing for Enterprise customers.',
  },
  {
    question: 'Is there a discount for non-profits or educational institutions?',
    answer: 'Yes! We offer 50% off for verified non-profits and educational institutions. Contact us to learn more.',
  },
];

export const PricingPage = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <>
      <Helmet>
        <title>Pricing - RemodelVision</title>
        <meta
          name="description"
          content="Simple, transparent pricing for RemodelVision. Start free, upgrade when you're ready. Plans for individuals, teams, and enterprises."
        />
      </Helmet>

      {/* Hero */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Start free, upgrade when you're ready. No hidden fees, no surprises.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 p-1 bg-slate-900 rounded-full border border-slate-800">
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                billingPeriod === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => setBillingPeriod('yearly')}
            >
              Yearly <span className="text-green-400 ml-1">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`p-6 flex flex-col ${
                  plan.popular
                    ? 'border-blue-500 bg-blue-500/5 relative'
                    : 'border-slate-800 bg-slate-900/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-slate-400">{plan.description}</p>
                </div>
                <div className="mb-6">
                  {plan.monthlyPrice !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        ${billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span className="text-slate-400">/month</span>
                    </div>
                  ) : (
                    <div className="text-4xl font-bold">Custom</div>
                  )}
                  {billingPeriod === 'yearly' && plan.monthlyPrice !== null && plan.monthlyPrice > 0 && (
                    <p className="text-sm text-slate-500 mt-1">
                      Billed annually (${plan.yearlyPrice * 12}/year)
                    </p>
                  )}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {Object.entries(plan.features).map(([key, value]) => (
                    <li key={key} className="flex items-start gap-2 text-sm">
                      {value === false ? (
                        <X className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                      ) : (
                        <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      )}
                      <span className={value === false ? 'text-slate-600' : 'text-slate-300'}>
                        {typeof value === 'string' ? value : key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  className="w-full"
                  asChild={plan.id !== 'enterprise'}
                >
                  {plan.id === 'enterprise' ? (
                    <Link to="/contact">{plan.cta}</Link>
                  ) : (
                    <a href="https://app.remodelvision.app/register">{plan.cta}</a>
                  )}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Compare Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-4 px-4 font-medium text-slate-400">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center py-4 px-4 font-medium">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature) => (
                  <tr key={feature.name} className="border-b border-slate-800/50">
                    <td className="py-4 px-4 text-slate-300">{feature.name}</td>
                    {['starter', 'professional', 'team', 'enterprise'].map((planId) => (
                      <td key={planId} className="text-center py-4 px-4">
                        {typeof feature[planId as keyof typeof feature] === 'boolean' ? (
                          feature[planId as keyof typeof feature] ? (
                            <Check className="w-5 h-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-slate-600 mx-auto" />
                          )
                        ) : (
                          <span className="text-slate-300">{feature[planId as keyof typeof feature]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-900/30">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <Card key={faq.question} className="p-6 bg-slate-900/50 border-slate-800">
                <h3 className="text-lg font-semibold mb-2 flex items-start gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                  {faq.question}
                </h3>
                <p className="text-slate-400 pl-7">{faq.answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Start with our free plan and upgrade when you're ready. No credit card required.
          </p>
          <Button size="lg" className="gap-2" asChild>
            <a href="https://app.remodelvision.app/register">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </a>
          </Button>
        </div>
      </section>
    </>
  );
};
