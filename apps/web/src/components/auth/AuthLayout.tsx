import { Outlet, Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left side - Brand/Decoration */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-2 text-white">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">RemodelVision</span>
          </Link>

          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-white mb-4">
              Transform your space with AI-powered design
            </h1>
            <p className="text-white/80 text-lg">
              Join thousands of homeowners and design professionals creating stunning
              visualizations for their renovation projects.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10k+</div>
              <div className="text-sm text-white/70">Projects</div>
            </div>
            <div className="w-px h-12 bg-white/30" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">500+</div>
              <div className="text-sm text-white/70">Firms</div>
            </div>
            <div className="w-px h-12 bg-white/30" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">4.9/5</div>
              <div className="text-sm text-white/70">Rating</div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/4 right-8 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-8 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-white">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Home className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">RemodelVision</span>
            </Link>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};
