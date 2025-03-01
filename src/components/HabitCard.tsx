import { useRef, useState } from 'react';
import { Check, Edit2, Trash2, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

type HabitRecord = {
  id: number;
  habit_id: number;
  date: string;
  value: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

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

type BaseHabit = {
  id: number;
  name: string;
  description: string | null;
  frequency: string;
  target: number;
  uom: string;
  category_id: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

interface Habit extends BaseHabit {
  category: Category | null;
  todayRecord?: HabitRecord | null;
}

interface EditingHabit extends Habit {
  isEditing?: boolean;
}

interface HabitCardProps {
  habit: EditingHabit;
  isSelected: boolean;
  onSelect: (habit: EditingHabit) => void;
  onComplete: (habit: EditingHabit, e: React.MouseEvent) => void;
  onEdit: (habit: EditingHabit) => void;
  onDelete: (id: number) => void;
  onMobileClick?: (habit: EditingHabit) => void;
}

export default function HabitCard({
  habit,
  isSelected,
  onSelect,
  onComplete,
  onEdit,
  onDelete,
  onMobileClick,
}: HabitCardProps) {
  const isCompleted = (habit.todayRecord?.value || 0) >= habit.target;
  const progress = ((habit.todayRecord?.value || 0) / habit.target) * 100;
  
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = startX - e.touches[0].clientX;
    if ((diff > 0 && diff < 90) || (currentX < 0 && diff >= -90)) {
      setCurrentX(-diff);
    }
  };

  const handleTouchEnd = () => {
    if (currentX < -40) {
      setCurrentX(-90);
    } else if (currentX > 40) {
      setCurrentX(0);
    } else {
      setCurrentX(currentX < -45 ? -90 : 0);
    }
  };

  const handleClick = () => {
    if (window.innerWidth < 1024) {  // lg breakpoint
      onMobileClick?.(habit);
    } else {
      onSelect(habit);
    }
  };

  return (
    <motion.div 
      className="relative overflow-hidden mb-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main card */}
      <div
        ref={cardRef}
        className="relative flex transition-transform duration-200"
        style={{ transform: `translateX(${currentX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div 
          className={`flex w-full rounded-2xl transition-all duration-300 ${
            isCompleted 
              ? isSelected
                ? 'bg-base-300/90 text-base-content/70 shadow-lg'
                : 'bg-base-200/50 hover:bg-base-200/80 text-base-content/50'
              : isSelected
                ? 'bg-gradient-to-r from-primary/80 to-primary text-primary-content shadow-lg shadow-primary/20'
                : 'bg-gradient-to-br from-base-100 to-base-200/50 hover:to-base-200 shadow-lg border border-base-200/50'
          }`}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Complete button column */}
          <div className={`flex items-center pl-4 pr-3 ${
            isSelected 
              ? isCompleted 
                ? 'border-r border-base-content/10'
                : 'border-r border-primary-content/10' 
              : ''
          }`}>
            <motion.button
              className={`btn btn-circle btn-sm ${
                isCompleted
                  ? 'bg-base-content/10 border-0 text-base-content/40'
                  : (habit.todayRecord?.value || 0) > 0
                  ? 'bg-primary-content/20 border-0 text-primary-content hover:bg-primary-content/30'
                  : 'bg-base-200/50 text-base-content/30 hover:bg-base-200'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onComplete(habit, e);
              }}
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9, rotate: -10 }}
            >
              {isCompleted ? (
                <Check size={16} className="text-base-content/40" />
              ) : (
                <Plus size={16} className={`${(habit.todayRecord?.value || 0) > 0 ? 'text-primary-content' : ''} ${!isSelected && 'text-primary'}`} />
              )}
            </motion.button>
          </div>

          {/* Body column */}
          <div 
            className="flex-1 py-4 px-3 cursor-pointer"
            onClick={handleClick}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div>
                  <h3 className={`text-base font-semibold ${
                    isCompleted 
                      ? isSelected
                        ? 'text-base-content/70'
                        : 'text-base-content/50'
                      : isSelected
                        ? 'text-primary-content'
                        : 'text-base-content'
                  }`}>
                    {habit.name}
                  </h3>
                  {habit.description && (
                    <p className={`text-sm mt-1 line-clamp-1 ${
                      isSelected 
                        ? isCompleted
                          ? 'text-base-content/50'
                          : 'text-primary-content/70' 
                        : 'text-base-content/50'
                    }`}>
                      {habit.description}
                    </p>
                  )}
                </div>
                {habit.category && (
                  <span 
                    className={`text-lg w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isSelected ? isCompleted ? 'bg-base-content/10' : 'bg-primary-content/20' : ''
                    }`}
                    style={{ 
                      backgroundColor: isSelected 
                        ? undefined
                        : isCompleted 
                          ? '#94A3B810'
                          : `${habit.category.color}10` || '#4F46E510',
                      color: isSelected
                        ? 'inherit'
                        : isCompleted
                          ? '#94A3B8'
                          : habit.category.color || '#4F46E5'
                    }}
                  >
                    {habit.category.icon}
                  </span>
                )}
              </div>
              
              {/* Desktop action buttons */}
              <div className={`hidden lg:flex items-center gap-2 pl-4 ml-4 ${
                isSelected 
                  ? isCompleted
                    ? 'border-l border-base-content/10'
                    : 'border-l border-primary-content/10'
                  : ''
              }`}>
                <motion.button
                  className={`btn btn-circle btn-sm ${
                    isSelected 
                      ? isCompleted
                        ? 'btn-ghost text-base-content/40 hover:bg-base-content/10'
                        : 'btn-ghost text-primary-content hover:bg-primary-content/20'
                      : 'btn-ghost text-base-content/40 hover:text-primary hover:bg-primary/10'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(habit);
                  }}
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.9, rotate: -10 }}
                >
                  <Edit2 size={16} />
                </motion.button>
                <motion.button
                  className={`btn btn-circle btn-sm ${
                    isSelected 
                      ? isCompleted
                        ? 'btn-ghost text-base-content/40 hover:bg-base-content/10'
                        : 'btn-ghost text-primary-content hover:bg-primary-content/20'
                      : 'btn-ghost text-base-content/40 hover:text-error hover:bg-error/10'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(habit.id);
                  }}
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  whileTap={{ scale: 0.9, rotate: 10 }}
                >
                  <Trash2 size={16} />
                </motion.button>
                <motion.div
                  className={`w-6 h-6 flex items-center justify-center ${
                    isSelected 
                      ? isCompleted
                        ? 'text-base-content/40'
                        : 'text-primary-content/70'
                      : 'text-base-content/30'
                  }`}
                  animate={{ rotate: isSelected ? 90 : 0 }}
                >
                  <ChevronRight size={20} />
                </motion.div>
              </div>
            </div>
            
            {/* Progress bar and value */}
            <div className="mt-3 flex items-center gap-4">
              <div className="flex-1 h-2 bg-base-200/50 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full transition-all duration-300 relative overflow-hidden ${
                    isCompleted 
                      ? isSelected
                        ? 'bg-base-content/30'
                        : 'bg-base-content/20'
                      : isSelected
                        ? 'bg-primary-content'
                        : 'bg-primary'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.1)_100%)] animate-shine" />
                </motion.div>
              </div>
              <div className={`text-sm font-medium min-w-[60px] text-right ${
                isCompleted 
                  ? isSelected
                    ? 'text-base-content/70'
                    : 'text-base-content/50'
                  : isSelected
                    ? 'text-primary-content/90'
                    : (habit.todayRecord?.value || 0) > 0
                      ? 'text-primary'
                      : 'text-base-content/50'
              }`}>
                {habit.todayRecord?.value || 0}/{habit.target}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile action buttons (revealed on swipe) */}
      <div 
        className="absolute top-0 h-full block lg:hidden transition-transform duration-200"
        style={{ 
          right: '-90px',
          transform: currentX < -20 ? 'translateX(-90px)' : 'none'
        }}
      >
        <div className="flex h-full items-center gap-1 px-2 bg-base-200/80 backdrop-blur-sm rounded-r-xl shadow-lg">
          <motion.button
            className="btn btn-circle btn-sm btn-ghost text-primary hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(habit);
              setCurrentX(0);
            }}
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.9, rotate: -10 }}
          >
            <Edit2 size={16} />
          </motion.button>
          <motion.button
            className="btn btn-circle btn-sm btn-ghost text-error hover:bg-error/10"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(habit.id);
              setCurrentX(0);
            }}
            whileHover={{ scale: 1.1, rotate: -10 }}
            whileTap={{ scale: 0.9, rotate: 10 }}
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
} 