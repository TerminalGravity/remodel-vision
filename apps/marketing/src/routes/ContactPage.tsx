import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Mail, Phone, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { Button, Card } from '@remodelvision/ui';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email',
    description: 'Send us an email anytime',
    value: 'hello@remodelvision.app',
    href: 'mailto:hello@remodelvision.app',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with our support team',
    value: 'Available 9am-6pm PST',
    href: '#',
  },
  {
    icon: Phone,
    title: 'Phone',
    description: 'For Enterprise customers',
    value: '+1 (555) 123-4567',
    href: 'tel:+15551234567',
  },
];

const offices = [
  {
    city: 'San Francisco',
    address: '123 Design Street, Suite 100',
    country: 'United States',
  },
  {
    city: 'New York',
    address: '456 Innovation Ave, Floor 5',
    country: 'United States',
  },
];

export const ContactPage = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    company: '',
    subject: 'general',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would submit to an API
    setSubmitted(true);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - RemodelVision</title>
        <meta
          name="description"
          content="Get in touch with the RemodelVision team. We're here to help with questions about our platform, enterprise solutions, or partnerships."
        />
      </Helmet>

      {/* Hero */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Have a question or want to learn more? We'd love to hear from you.
            Our team typically responds within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method) => (
              <Card key={method.title} className="p-6 bg-slate-900/50 border-slate-800 text-center hover:border-slate-700 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <method.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-1">{method.title}</h3>
                <p className="text-sm text-slate-400 mb-2">{method.description}</p>
                <a href={method.href} className="text-blue-400 hover:text-blue-300 transition-colors">
                  {method.value}
                </a>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
              {submitted ? (
                <Card className="p-8 bg-green-500/10 border-green-500/20 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                  <p className="text-slate-400">
                    Thanks for reaching out. We'll get back to you within 24 hours.
                  </p>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={formState.company}
                      onChange={(e) => setFormState({ ...formState, company: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Your company (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Subject *
                    </label>
                    <select
                      value={formState.subject}
                      onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="sales">Sales & Pricing</option>
                      <option value="support">Technical Support</option>
                      <option value="enterprise">Enterprise Solutions</option>
                      <option value="partnership">Partnership Opportunities</option>
                      <option value="press">Press & Media</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      placeholder="How can we help?"
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full md:w-auto">
                    Send Message
                  </Button>
                </form>
              )}
            </div>

            {/* Info */}
            <div className="space-y-8">
              {/* Response Time */}
              <Card className="p-6 bg-slate-900/50 border-slate-800">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Response Time</h3>
                    <p className="text-sm text-slate-400">Usually within 24 hours</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400">
                  For urgent issues, Enterprise customers have access to priority support
                  with guaranteed 4-hour response times.
                </p>
              </Card>

              {/* Offices */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Our Offices</h3>
                <div className="space-y-4">
                  {offices.map((office) => (
                    <Card key={office.city} className="p-4 bg-slate-900/50 border-slate-800">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="font-medium">{office.city}</h4>
                          <p className="text-sm text-slate-400">{office.address}</p>
                          <p className="text-sm text-slate-400">{office.country}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <a href="/docs" className="block text-slate-400 hover:text-white transition-colors">
                    → Documentation
                  </a>
                  <a href="/docs/api" className="block text-slate-400 hover:text-white transition-colors">
                    → API Reference
                  </a>
                  <a href="/pricing" className="block text-slate-400 hover:text-white transition-colors">
                    → Pricing
                  </a>
                  <a href="/blog" className="block text-slate-400 hover:text-white transition-colors">
                    → Blog
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
