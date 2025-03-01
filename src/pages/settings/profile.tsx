import { User, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

export default function ProfileSettings() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <motion.button
          className="btn btn-ghost btn-circle"
          onClick={() => router.push('/settings')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={24} />
        </motion.button>
        <span className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <User size={24} className="text-primary" />
        </span>
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-base-content/70">Update your personal information</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[400px] bg-base-100/50 backdrop-blur-sm rounded-xl p-8">
        <User size={64} className="text-primary/20 mb-4" />
        <p className="text-base-content/70 text-center">
          Profile settings coming soon!
        </p>
      </div>
    </div>
  );
} 