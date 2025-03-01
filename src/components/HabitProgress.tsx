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
export default function HabitProgress({ habit, onUpdate }: HabitProgressProps) {
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
      {/* Today&apos;s Progress */}
      <div className="bg-base-100/50 backdrop-blur-sm rounded-xl p-4 shadow-sm">
        <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Trophy size={18} className="text-primary" />
          </span>
          Today&apos;s Progress
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-2/3">
            <div className="h-4 bg-base-200/50 rounded-full overflow-hidden">
              <motion.div
                className={`h-full relative overflow-hidden ${
                  isCompleted ? 'bg-success' : 'bg-primary'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((habit.todayRecord?.value || 0) / habit.target) * 100, 100)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.1)_100%)] animate-shine" />
              </motion.div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              className="btn btn-circle btn-sm bg-base-200 hover:bg-base-300 border-0"
              onClick={() => handleUpdateValue((habit.todayRecord?.value || 0) - 1)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Minus size={16} />
            </motion.button>
            <span className="text-2xl font-bold min-w-[80px] text-center">
              {habit.todayRecord?.value || 0}/{habit.target}
            </span>
            <motion.button
              className="btn btn-circle btn-sm bg-base-200 hover:bg-base-300 border-0"
              onClick={() => handleUpdateValue((habit.todayRecord?.value || 0) + 1)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={isCompleted}
            >
              <Plus size={16} />
            </motion.button>
            <motion.button
              className={`btn btn-circle btn-sm ${
                isCompleted 
                  ? 'bg-success/90 hover:bg-success text-success-content border-0' 
                  : 'bg-base-200 hover:bg-success/20 hover:text-success border-0'
              }`}
              onClick={() => handleUpdateValue(habit.target)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              disabled={isCompleted}
            >
              <CheckCircle2 size={16} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-base-100/50 backdrop-blur-sm rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar size={18} className="text-primary" />
            </span>
            <h4 className="text-base font-semibold">Completion Rate</h4>
          </div>
          <p className="text-2xl font-bold">{Math.round(completionRate)}%</p>
          <p className="text-sm text-base-content/70">in the last 90 days</p>
        </div>

        <div className="bg-base-100/50 backdrop-blur-sm rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-primary" />
            </span>
            <h4 className="text-base font-semibold">Current Streak</h4>
          </div>
          <p className="text-2xl font-bold">{currentStreak} days</p>
          <p className="text-sm text-base-content/70">keep it going!</p>
        </div>

        <div className="bg-base-100/50 backdrop-blur-sm rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp size={18} className="text-primary" />
            </span>
            <h4 className="text-base font-semibold">Longest Streak</h4>
          </div>
          <p className="text-2xl font-bold">{longestStreak} days</p>
          <p className="text-sm text-base-content/70">your best record</p>
        </div>

        <div className="bg-base-100/50 backdrop-blur-sm rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Award size={18} className="text-primary" />
            </span>
            <h4 className="text-base font-semibold">Total Days</h4>
          </div>
          <p className="text-2xl font-bold">{completedDays} days</p>
          <p className="text-sm text-base-content/70">completed overall</p>
        </div>
      </div>

      {/* Activity Graph */}
      <div className="bg-base-100/50 backdrop-blur-sm rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <CheckCircle2 size={18} className="text-primary" />
          </span>
          <h4 className="text-base font-semibold">Activity History</h4>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-0">
            <div className="grid grid-flow-col gap-1 auto-cols-fr">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-rows-7 gap-1">
                  {week.map((day, dayIndex) => {
                    const intensity = day.value > 0 ? (day.value / habit.target) * 100 : 0;
                    const boxColor = intensity > 0
                      ? intensity >= 100
                        ? '#4ADE80' // success color
                        : '#4F46E5' // primary color
                      : '#e5e7eb'; // gray color
                    const boxOpacity = intensity > 0
                      ? intensity >= 100
                        ? 0.8 // Success opacity
                        : intensity >= 80
                          ? 0.8 // High intensity
                          : intensity >= 50
                            ? 0.5 // Medium intensity
                            : 0.3 // Low intensity
                      : 1; // Default gray opacity
                    
                    return (
                      <div key={dayIndex} className="group relative">
                        <motion.div
                          className={`w-4 h-4 rounded-sm cursor-pointer ${
                            day.isToday
                              ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100'
                              : ''
                          }`}
                          style={{
                            backgroundColor: '#e5e7eb' // default gray
                          }}
                          animate={{ 
                            backgroundColor: boxColor,
                            opacity: boxOpacity
                          }}
                          transition={{ duration: 0.5 }}
                        />
                        <div className={`absolute ${
                          dayIndex === 0 
                            ? 'top-full mt-2' // Kotak di baris pertama, tooltip di bawah
                            : 'bottom-full mb-2' // Kotak di baris lain, tooltip di atas
                        } px-2 py-1 bg-base-300 text-base-content text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 ${
                          weekIndex === 0 
                            ? 'left-0' // Kotak paling kiri
                            : weekIndex === 12 
                              ? 'right-0' // Kotak paling kanan
                              : 'left-1/2 -translate-x-1/2' // Kotak di tengah
                        }`}>
                          {format(day.date, 'MMM d, yyyy')}
                          <br />
                          Progress: {day.value} of {habit.target}
                          <div className={`absolute ${
                            dayIndex === 0
                              ? 'top-0 -translate-y-full border-b-base-300' // Panah mengarah ke atas untuk tooltip di bawah
                              : 'bottom-0 border-t-base-300' // Panah mengarah ke bawah untuk tooltip di atas
                          } border-4 border-transparent ${
                            weekIndex === 0 
                              ? 'left-1' // Panah untuk kotak paling kiri
                              : weekIndex === 12 
                                ? 'right-1' // Panah untuk kotak paling kanan
                                : 'left-1/2 -translate-x-1/2' // Panah untuk kotak di tengah
                          }`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-base-content/70">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#e5e7eb' }} />
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#4F46E5', opacity: 0.3 }} />
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#4F46E5', opacity: 0.5 }} />
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#4F46E5', opacity: 0.8 }} />
            <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: '#4ADE80', opacity: 0.8 }} />
          </div>
          <span>More</span>
        </div>
      </div>
    </motion.div>
  );
} 