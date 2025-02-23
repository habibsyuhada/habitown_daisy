import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AuthError() {
  const router = useRouter();
  const { error } = router.query;

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100">
      <div className="card w-96 bg-base-200 shadow-xl">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-error">Authentication Error</h2>
          <p className="py-4">{error || 'An error occurred during authentication.'}</p>
          <div className="card-actions">
            <Link href="/" className="btn btn-primary">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 