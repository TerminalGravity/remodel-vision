import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@remodelvision/ui';

export const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>Page Not Found - RemodelVision</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>

      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="text-center max-w-lg">
          {/* 404 Visual */}
          <div className="mb-8">
            <div className="text-9xl font-bold gradient-text inline-block">404</div>
          </div>

          <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
          <p className="text-slate-400 mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
            Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild className="gap-2">
              <Link to="/">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>

          {/* Quick Links */}
          <div className="mt-12 pt-8 border-t border-slate-800">
            <p className="text-sm text-slate-500 mb-4">Looking for something specific?</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/features" className="text-slate-400 hover:text-white transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="text-slate-400 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link to="/docs" className="text-slate-400 hover:text-white transition-colors">
                Documentation
              </Link>
              <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
