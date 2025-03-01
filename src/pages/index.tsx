import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Sidebar from '@/components/Sidebar';
import HabitList from '@/components/HabitList';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { categoryId } = router.query;

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="flex">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <main className="flex-1 p-8">
          <HabitList categoryId={categoryId as string} />
        </main>
      </div>
    </div>
  );
}
