import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';

export default function Auth() {
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    const handleAuth = async () => {
      if (!token) {
        router.replace('/auth/error?error=No token provided');
        return;
      }

      try {
        // Sign in using next-auth credentials provider with the token
        const result = await signIn('credentials', {
          token: token,
          isTokenAuth: 'true',
          redirect: false,
          callbackUrl: '/',
        });

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
      <div className="animate-pulse">
        Authenticating...
      </div>
    </div>
  );
} 