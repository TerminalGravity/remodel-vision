import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Sparkles } from 'lucide-react';
import { Button } from '@remodelvision/ui';

const navLinks = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  {
    label: 'Resources',
    children: [
      { label: 'Blog', href: '/blog' },
      { label: 'Case Studies', href: '/case-studies' },
      { label: 'Documentation', href: '/docs' },
    ],
  },
  { label: 'About', href: '/about' },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="sticky top-0 z-50 glass">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-shadow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">
            Remodel<span className="text-blue-400">Vision</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.children ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setDropdownOpen(link.label)}
                onMouseLeave={() => setDropdownOpen(null)}
              >
                <button className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors py-2">
                  {link.label}
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen === link.label ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen === link.label && (
                  <div className="absolute top-full left-0 pt-2">
                    <div className="glass rounded-lg py-2 min-w-[180px] shadow-xl">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                to={link.href!}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href!) ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="https://app.remodelvision.app/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </a>
          <Button asChild>
            <a href="https://app.remodelvision.app/register">
              Start Free Trial
            </a>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-slate-300 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-slate-800">
          <div className="px-6 py-4 space-y-4">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="space-y-2">
                  <span className="text-sm font-medium text-slate-400">{link.label}</span>
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      to={child.href}
                      className="block pl-4 py-2 text-slate-300 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={link.href}
                  to={link.href!}
                  className="block py-2 text-slate-300 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <a
                href="https://app.remodelvision.app/login"
                className="block py-2 text-slate-300 hover:text-white"
              >
                Sign In
              </a>
              <Button className="w-full" asChild>
                <a href="https://app.remodelvision.app/register">
                  Start Free Trial
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
