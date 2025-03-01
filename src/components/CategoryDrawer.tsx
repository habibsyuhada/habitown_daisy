import { X, Search, Castle, ChevronRight } from 'lucide-react';
import { Database } from '@/types/supabase';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Database['public']['Tables']['habit_categories']['Row'][];
  categoryId?: string;
}

export default function CategoryDrawer({ isOpen, onClose, categories, categoryId }: CategoryDrawerProps) {
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
          <ul className="space-y-2">
            <motion.li
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <a 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  !categoryId 
                    ? 'bg-primary text-primary-content shadow-lg shadow-primary/20' 
                    : 'text-base-content/70 hover:bg-base-200/50'
                }`}
                onClick={() => {
                  router.push('/');
                  onClose();
                }}
              >
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  !categoryId ? 'bg-primary-content/20' : 'bg-primary/10'
                }`}>
                  <Castle size={20} className={!categoryId ? 'text-primary-content' : 'text-primary'} />
                </span>
                <span className="flex-1 text-base font-medium">All Habits</span>
                <ChevronRight size={18} className={!categoryId ? 'text-primary-content/70' : 'text-base-content/30'} />
              </a>
            </motion.li>
            
            {categories.map((category, index) => (
              <motion.li 
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (index + 1) * 0.05 }}
              >
                <a 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    categoryId === category.id.toString()
                      ? 'bg-primary text-primary-content shadow-lg shadow-primary/20'
                      : 'text-base-content/70 hover:bg-base-200/50'
                  }`}
                  onClick={() => {
                    router.push(`/?category=${category.id}`);
                    onClose();
                  }}
                >
                  <span 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      categoryId === category.id.toString() 
                        ? 'bg-primary-content/20' 
                        : ''
                    }`}
                    style={{ 
                      backgroundColor: categoryId === category.id.toString() 
                        ? undefined 
                        : `${category.color}15` || '#4F46E515',
                      color: categoryId === category.id.toString() 
                        ? 'inherit'
                        : category.color || '#4F46E5'
                    }}
                  >
                    <span className="text-xl">{category.icon}</span>
                  </span>
                  <span className="flex-1 text-base font-medium">{category.name}</span>
                  <ChevronRight 
                    size={18} 
                    className={categoryId === category.id.toString() 
                      ? 'text-primary-content/70' 
                      : 'text-base-content/30'
                    } 
                  />
                </a>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
} 