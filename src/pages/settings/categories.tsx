import { Castle, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import CategoryManager from '@/components/CategoryManager';

export default function CategoriesSettings() {
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
          <Castle size={24} className="text-primary" />
        </span>
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-base-content/70">Manage your habit categories</p>
        </div>
      </div>

      <CategoryManager />
    </div>
  );
} 