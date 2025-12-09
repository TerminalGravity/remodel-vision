import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@remodelvision/ui';
import { supabase } from '../../services/supabase';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash params from the URL (Supabase uses hash-based routing for auth)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (type === 'recovery') {
          // Password recovery flow - redirect to reset password page
          navigate('/auth/reset-password');
          return;
        }

        if (accessToken && refreshToken) {
          // Set the session
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setError(error.message);
            return;
          }
        }

        // Check if we have a valid session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        if (session) {
          // Successfully authenticated, redirect to app
          navigate('/', { replace: true });
        } else {
          // No session, redirect to login
          navigate('/auth/login', { replace: true });
        }
      } catch (err) {
        setError('An error occurred during authentication.');
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <>
        <Helmet>
          <title>Authentication Error - RemodelVision</title>
        </Helmet>

        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Error</h2>
          <p className="text-slate-400 mb-8">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/auth/login')}>
              Back to Sign In
            </Button>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Authenticating... - RemodelVision</title>
      </Helmet>

      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-6" />
        <h2 className="text-xl font-semibold text-white mb-2">Completing sign in...</h2>
        <p className="text-slate-400">Please wait while we verify your credentials.</p>
      </div>
    </>
  );
};
