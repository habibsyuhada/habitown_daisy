import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';

export default function Auth() {
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    const handleAuth = async () => {
      if (!token) {
        console.log('No token provided');
        router.replace('/auth/error?error=No token provided');
        return;
      }

      try {
        console.log('Starting authentication with token');
        console.log('Token length:', token.length);
        
        // Sign in using next-auth credentials provider with the token
        const result = await signIn('credentials', {
          token: token,
          isTokenAuth: 'true', // Make sure this is a string 'true'
          redirect: false,
          callbackUrl: '/',
        });

        console.log('Sign in result:', result);

        if (result?.error) {
          throw new Error(result.error);
        }

        if (result?.url) {
          // Use replace instead of push to prevent back button from returning to auth page
          router.replace(result.url);
        } else {
          router.replace('/');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        // Redirect to error page with error message
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        router.replace(`/auth/error?error=${encodeURIComponent(errorMessage)}`);
      }
    };

    // Only run if token is available and is a string
    if (typeof token === 'string') {
      handleAuth();
    }
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="mt-4">Authenticating...</p>
      </div>
    </div>
  );
} 