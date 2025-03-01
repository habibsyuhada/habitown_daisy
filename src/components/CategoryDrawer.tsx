import { X, Search } from 'lucide-react';
import { Database } from '@/types/supabase';
import { motion } from 'framer-motion';
import CategoryList from './CategoryList';
import { useRouter } from 'next/router';

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Database['public']['Tables']['habit_categories']['Row'][];
  categoryId?: string;
}

export default function CategoryDrawer({ 
  isOpen, 
  onClose, 
  categories, 
  categoryId
}: CategoryDrawerProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <motion.div 
      className="fixed inset-0 z-50 lg:hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        className="absolute right-0 top-0 h-full w-80 bg-gradient-to-b from-base-100 to-base-200 shadow-xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="flex items-center justify-between p-6 border-b border-base-200/20">
          <h3 className="text-lg font-semibold text-base-content flex items-center gap-3">
            <span className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Search size={20} className="text-primary" />
            </span>
            Categories
          </h3>
          <button 
            className="btn btn-circle btn-ghost btn-sm text-base-content/50 hover:bg-base-200/50"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4">
          <CategoryList
            categories={categories}
            categoryId={categoryId}
            variant="mobile"
            onCategoryClick={(categoryId) => {
              router.push(categoryId ? `/?categoryId=${categoryId}` : '/');
              onClose();
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
} 