import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Target, Heart, Zap, Users, MapPin, Mail } from 'lucide-react';
import { Button, Card } from '@remodelvision/ui';

const values = [
  {
    icon: Target,
    title: 'Mission-Driven',
    description: 'We believe everyone deserves to visualize their dream home before making costly renovation decisions.',
  },
  {
    icon: Heart,
    title: 'User-First',
    description: 'Every feature we build starts with understanding the real pain points of designers and homeowners.',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'We leverage cutting-edge AI to solve problems that were previously impossible or prohibitively expensive.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'We\'re building a community of design professionals who share knowledge and best practices.',
  },
];

const team = [
  { name: 'Alex Chen', role: 'CEO & Co-Founder', avatar: 'AC' },
  { name: 'Sarah Kim', role: 'CTO & Co-Founder', avatar: 'SK' },
  { name: 'Marcus Johnson', role: 'Head of Design', avatar: 'MJ' },
  { name: 'Emily Rodriguez', role: 'Head of Product', avatar: 'ER' },
  { name: 'David Park', role: 'Head of Engineering', avatar: 'DP' },
  { name: 'Lisa Wang', role: 'Head of Customer Success', avatar: 'LW' },
];

const milestones = [
  { year: '2023', title: 'Founded', description: 'RemodelVision was founded with a vision to democratize design.' },
  { year: '2023', title: 'Seed Round', description: 'Raised $2M to build the first version of our platform.' },
  { year: '2024', title: 'Public Launch', description: 'Launched to the public with 3D visualization and AI design.' },
  { year: '2024', title: '10K Users', description: 'Reached 10,000 registered users and 500+ paying customers.' },
  { year: '2025', title: 'Series A', description: 'Raised $15M to expand our team and product offerings.' },
];

export const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Us - RemodelVision</title>
        <meta
          name="description"
          content="Learn about RemodelVision's mission to democratize home design through AI-powered visualization and property intelligence."
        />
      </Helmet>

      {/* Hero */}
      <section className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Making Design <span className="gradient-text">Accessible</span> to Everyone
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            We're on a mission to help homeowners and designers visualize renovation possibilities
            before making costly decisions. Founded in 2023, we're building the future of home design.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-slate-800">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              Home renovation is a $500B industry, yet the design process hasn't changed in decades.
              Homeowners struggle to visualize changes, designers spend hours on manual mockups,
              and contractors deal with miscommunication. We're using AI and 3D technology to make
              design visualization instant, accurate, and accessible to everyone—whether you're a
              first-time homeowner or a seasoned design professional.
            </p>
          </Card>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="p-6 bg-slate-900/50 border-slate-800 text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-slate-400">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-slate-400">
              A passionate team of designers, engineers, and product builders.
            </p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {member.avatar}
                </div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-slate-400">{member.role}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/careers">
              <Button variant="outline" className="gap-2">
                Join Our Team <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 border-2 border-blue-500 flex items-center justify-center text-sm font-bold text-blue-400">
                    {milestone.year.slice(-2)}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-slate-800 my-2" />
                  )}
                </div>
                <div className="pt-2">
                  <h3 className="font-semibold mb-1">{milestone.title}</h3>
                  <p className="text-slate-400">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
              <p className="text-slate-400 mb-8">
                Have questions about RemodelVision? We'd love to hear from you.
                Our team is here to help.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-300">San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <a href="mailto:hello@remodelvision.app" className="text-slate-300 hover:text-white">
                    hello@remodelvision.app
                  </a>
                </div>
              </div>
            </div>
            <Card className="p-8 bg-slate-900/50 border-slate-800">
              <h3 className="text-xl font-semibold mb-4">Send us a message</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
                <textarea
                  placeholder="Your message"
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                />
                <Button className="w-full">Send Message</Button>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};
