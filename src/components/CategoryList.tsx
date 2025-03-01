import { ChevronRight, Castle } from 'lucide-react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

type Category = {
  id: number;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

interface CategoryListProps {
  categories: Category[];
  categoryId?: string;
  onCategoryClick?: (categoryId: string | null) => void;
  variant: 'mobile' | 'desktop';
  className?: string;
  onAddClick?: () => void;
  onEditClick?: React.Dispatch<React.SetStateAction<Category | null>>;
  onDeleteClick?: (categoryId: number) => Promise<void>;
}

export default function CategoryList({ 
  categories, 
  categoryId, 
  onCategoryClick, 
  variant, 
  className = '',
  onAddClick,
  onEditClick,
  onDeleteClick
}: CategoryListProps) {
  const router = useRouter();
  const isDesktop = variant === 'desktop';

  const handleCategoryClick = (id: number | null) => {
    if (id?.toString() === categoryId && !isDesktop && onCategoryClick) {
      onCategoryClick(id?.toString() || null);
      return;
    }

    if (onCategoryClick) {
      onCategoryClick(id ? id.toString() : null);
    } else {
      router.push(id ? `/?categoryId=${id}` : '/');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <motion.button
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          !categoryId 
            ? 'bg-primary text-primary-content shadow-lg shadow-primary/20' 
            : 'text-base-content/70 hover:bg-base-200/50'
        }`}
        onClick={() => handleCategoryClick(null)}
        whileHover={isDesktop ? { scale: 1.02 } : undefined}
        whileTap={isDesktop ? { scale: 0.98 } : undefined}
      >
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          !categoryId ? 'bg-primary-content/20' : 'bg-primary/10'
        }`}>
          <Castle size={20} className={!categoryId ? 'text-primary-content' : 'text-primary'} />
        </span>
        <span className="flex-1 text-base font-medium text-left">All Habits</span>
        <ChevronRight size={18} className={!categoryId ? 'text-primary-content/70' : 'text-base-content/30'} />
      </motion.button>

      {categories.map((category, index) => (
        <motion.button
          key={category.id}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            categoryId === category.id.toString()
              ? 'bg-primary text-primary-content shadow-lg shadow-primary/20'
              : 'text-base-content/70 hover:bg-base-200/50'
          }`}
          onClick={() => handleCategoryClick(category.id)}
          initial={isDesktop ? { opacity: 0, y: 10 } : undefined}
          animate={isDesktop ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.1 + index * 0.05 }}
          whileHover={isDesktop ? { scale: 1.02 } : undefined}
          whileTap={isDesktop ? { scale: 0.98 } : undefined}
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
          <span className="flex-1 text-base font-medium text-left">{category.name}</span>
          <ChevronRight 
            size={18} 
            className={categoryId === category.id.toString() 
              ? 'text-primary-content/70' 
              : 'text-base-content/30'
            } 
          />
        </motion.button>
      ))}
      
      {/* Management buttons - only shown if the props are provided */}
      {isDesktop && (onAddClick || onEditClick || onDeleteClick) && (
        <div className="mt-4 flex flex-col gap-2">
          {onAddClick && (
            <button 
              onClick={onAddClick}
              className="btn btn-sm btn-outline w-full"
            >
              Add Category
            </button>
          )}
        </div>
      )}
    </div>
  );
} 