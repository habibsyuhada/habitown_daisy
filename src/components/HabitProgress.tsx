import { useEffect, useState } from 'react';
import { format, startOfDay, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Zap, TrendingUp, Award, CheckCircle2, Plus, Minus } from 'lucide-react';

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

interface HabitProgressProps {
  habit: Habit;
  onUpdate?: () => void;
}

/* eslint-disable react-hooks/rules-of-hooks */
function HabitProgress({ habit, onUpdate }: HabitProgressProps) {
  const [records, setRecords] = useState<HabitRecord[]>([]);
  const isCompleted = (habit.todayRecord?.value || 0) >= habit.target;

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const startDate = format(subDays(new Date(), 90), 'yyyy-MM-dd');
        const response = await fetch(`/api/habit-records?habit_id=${habit.id}&start_date=${startDate}`);
        if (!response.ok) throw new Error('Failed to fetch records');
        const data = await response.json();
        setRecords(data);
      } catch (error) {
        console.error('Error fetching records:', error);
      }
    };

    fetchRecords();
  }, [habit.id, habit.todayRecord]);

  const handleUpdateValue = async (newValue: number) => {
    try {
      if (newValue < 0) newValue = 0;
      if (newValue > habit.target) newValue = habit.target;

      if (newValue === 0 && habit.todayRecord) {
        // Delete today's record
        const response = await fetch(`/api/habit-records/${habit.todayRecord.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete record');
      } else if (newValue > 0) {
        if (habit.todayRecord) {
          // Update today's record
          const response = await fetch(`/api/habit-records/${habit.todayRecord.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              value: newValue,
            }),
          });
          if (!response.ok) throw new Error('Failed to update record');
        } else {
          // Create new record for today
          const response = await fetch('/api/habit-records', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              habit_id: habit.id,
              date: new Date().toISOString().split('T')[0] + ' 00:00:00',
              value: newValue,
            }),
          });
          if (!response.ok) throw new Error('Failed to create record');
        }
      }
      
      // Notify parent component about the update
      onUpdate?.();
    } catch (error) {
      console.error('Error updating record:', error);
    }
  };

  // Generate last 90 days for activity graph
  const days = Array.from({ length: 90 }, (_, i) => {
    const date = subDays(new Date(), 89 - i);
    const record = records.find(r => 
      startOfDay(new Date(r.date)).toISOString() === startOfDay(date).toISOString()
    );
    return {
      date,
      value: record?.value || 0,
      isToday: startOfDay(date).toISOString() === startOfDay(new Date()).toISOString(),
    };
  });

  // Group days by week for the grid layout
  const weeks = Array.from({ length: 13 }, (_, i) => 
    days.slice(i * 7, (i + 1) * 7)
  );

  // Calculate completion rate
  const completedDays = records.length;
  const totalDays = 90;
  const completionRate = (completedDays / totalDays) * 100;

  // Get current streak
  let currentStreak = 0;
  let i = days.length - 1;
  while (i >= 0 && days[i].value > 0) {
    currentStreak++;
    i--;
  }

  // Get longest streak
  let longestStreak = 0;
  let currentCount = 0;
  days.forEach(day => {
    if (day.value > 0) {
      currentCount++;
      longestStreak = Math.max(longestStreak, currentCount);
    } else {
      currentCount = 0;
    }
  });

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Today's Progress */}
      <motion.div 
        className={`relative overflow-hidden card bg-gradient-to-br p-6 rounded-3xl ${
          isCompleted 
            ? 'from-success/5 via-success/20 to-success/40 shadow-2xl shadow-success/10 border border-success/20' 
            : 'from-base-200/50 via-base-200 to-base-300 border border-base-300/20'
        }`}
        whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
        whileTap={{ scale: 0.98 }}
      >
        {isCompleted && (
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,255,0,0.1),transparent_70%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-2xl font-bold mb-2">{habit.name}</h4>
            {habit.description && (
              <p className="text-base opacity-70 mb-2 max-w-xl">{habit.description}</p>
            )}
            <div className="flex items-center gap-3">
              {habit.category && (
                <span 
                  className="text-lg px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium"
                  style={{ 
                    backgroundColor: `${habit.category.color}15` || '#4F46E515',
                    color: habit.category.color || '#4F46E5'
                  }}
                >
                  <span>{habit.category.icon}</span>
                  <span>{habit.category.name}</span>
                </span>
              )}
              <span className="text-sm opacity-70">Today&apos;s Progress: {habit.todayRecord?.value || 0}/{habit.target}</span>
            </div>
          </div>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transform transition-all duration-300 ${
            isCompleted 
              ? 'bg-success/10 rotate-12' 
              : 'bg-base-100 rotate-0'
          }`}>
            <CheckCircle2 
              size={32} 
              className={`transform transition-all duration-300 ${
                isCompleted 
                  ? 'text-success -rotate-12' 
                  : 'text-base-content/30 rotate-0'
              }`} 
            />
          </div>
        </div>
        <div className="flex gap-4">
          <motion.button
            className="btn btn-lg flex-1 gap-3 rounded-xl h-16 bg-base-100 hover:bg-error/10 hover:text-error border border-base-300/50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleUpdateValue((habit.todayRecord?.value || 0) - 1)}
            disabled={!habit.todayRecord?.value}
          >
            <Minus size={24} />
            <span className="text-lg">Decrease</span>
          </motion.button>
          <motion.button
            className="btn btn-lg flex-1 gap-3 rounded-xl h-16 bg-base-100 hover:bg-primary/10 hover:text-primary border border-base-300/50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleUpdateValue((habit.todayRecord?.value || 0) + 1)}
            disabled={isCompleted}
          >
            <Plus size={24} />
            <span className="text-lg">Increase</span>
          </motion.button>
          <motion.button
            className={`btn btn-lg flex-1 gap-3 rounded-xl h-16 ${
              isCompleted 
                ? 'bg-success/90 hover:bg-success text-success-content border-0 shadow-lg shadow-success/20' 
                : 'bg-base-100 hover:bg-success/10 hover:text-success border border-base-300/50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleUpdateValue(habit.target)}
          >
            <CheckCircle2 size={24} />
            <span className="text-lg">Complete</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          className="card bg-gradient-to-br from-primary/5 via-primary/10 to-primary/20 p-6 rounded-3xl border border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 20px 40px rgba(79, 70, 229, 0.1)'
          }}
        >
          <Trophy size={32} className="text-primary mb-4" />
          <div className="text-4xl font-bold text-primary mb-2">{completedDays}</div>
          <div className="text-sm text-primary/70">Days Completed</div>
        </motion.div>

        <motion.div 
          className="card bg-gradient-to-br from-warning/5 via-warning/10 to-warning/20 p-6 rounded-3xl border border-warning/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 20px 40px rgba(234, 179, 8, 0.1)'
          }}
        >
          <Zap size={32} className="text-warning mb-4" />
          <div className="text-4xl font-bold text-warning mb-2">{currentStreak}</div>
          <div className="text-sm text-warning/70">Current Streak</div>
        </motion.div>

        <motion.div 
          className="card bg-gradient-to-br from-info/5 via-info/10 to-info/20 p-6 rounded-3xl border border-info/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 20px 40px rgba(34, 211, 238, 0.1)'
          }}
        >
          <Award size={32} className="text-info mb-4" />
          <div className="text-4xl font-bold text-info mb-2">{longestStreak}</div>
          <div className="text-sm text-info/70">Longest Streak</div>
        </motion.div>

        <motion.div 
          className="card bg-gradient-to-br from-secondary/5 via-secondary/10 to-secondary/20 p-6 rounded-3xl border border-secondary/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 20px 40px rgba(249, 115, 22, 0.1)'
          }}
        >
          <TrendingUp size={32} className="text-secondary mb-4" />
          <div className="text-4xl font-bold text-secondary mb-2">{completionRate.toFixed(0)}%</div>
          <div className="text-sm text-secondary/70">Success Rate</div>
        </motion.div>
      </div>

      {/* Activity Graph */}
      <motion.div 
        className="card bg-gradient-to-br from-base-100 via-base-100 to-base-200 p-8 rounded-3xl shadow-xl border border-base-200/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-2xl font-bold mb-2">Activity History</h4>
            <p className="text-base opacity-70">Your journey over the last 90 days</p>
          </div>
          <div className="badge badge-lg badge-primary badge-outline gap-2 px-4 py-4">
            <Calendar size={18} />
            <span className="text-base">90 Days</span>
          </div>
        </div>
        <div className="flex gap-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-2">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={dayIndex}
                  className={`w-6 h-6 rounded-xl transition-all duration-300 ${
                    day.value > 0
                      ? 'bg-primary shadow-lg shadow-primary/20'
                      : day.isToday
                      ? 'bg-base-300 ring-2 ring-primary ring-offset-2'
                      : 'bg-base-300'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: 0.6 + (weekIndex * 7 + dayIndex) * 0.01,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  whileHover={{ 
                    scale: 1.3,
                    transition: { duration: 0.2 }
                  }}
                  title={`${format(day.date, 'MMM d, yyyy')}: ${
                    day.value > 0 ? 'Completed' : 'Not completed'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between">
          <span className="text-base opacity-70">Less Active</span>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-xl bg-base-300" />
            <div className="w-6 h-6 rounded-xl bg-primary opacity-30" />
            <div className="w-6 h-6 rounded-xl bg-primary opacity-60" />
            <div className="w-6 h-6 rounded-xl bg-primary shadow-lg" />
          </div>
          <span className="text-base opacity-70">More Active</span>
        </div>
      </motion.div>

      {/* Overall Progress */}
      <motion.div 
        className="card bg-gradient-to-br from-base-100 via-base-100 to-base-200 p-8 rounded-3xl shadow-xl border border-base-200/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-2xl font-bold mb-2">Overall Progress</h4>
            <p className="text-base opacity-70">Your journey to success</p>
          </div>
          <div className="text-4xl font-bold text-primary">{completionRate.toFixed(0)}%</div>
        </div>
        <div className="w-full bg-base-300 rounded-full h-6 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-primary/80 to-primary h-full rounded-full relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.1)_100%)] animate-shine" />
          </motion.div>
        </div>
        <div className="flex justify-between mt-4">
          <div className="text-base">
            <span className="opacity-70">Progress: </span>
            <span className="font-semibold">{completedDays} / {totalDays} days</span>
          </div>
          <div className="text-base">
            <span className="opacity-70">Target: </span>
            <span className="font-semibold">100%</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default HabitProgress; 