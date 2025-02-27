import { useEffect, useState } from 'react';
import { Database } from '@/types/supabase';
import { format, startOfDay, subDays } from 'date-fns';

type Habit = Database['public']['Tables']['habit']['Row'] & {
  category: Database['public']['Tables']['habit_categories']['Row'] | null;
};

type HabitRecord = Database['public']['Tables']['habit_records']['Row'];

interface HabitProgressProps {
  habit: Habit;
}

export default function HabitProgress({ habit }: HabitProgressProps) {
  const [records, setRecords] = useState<HabitRecord[]>([]);
  const [todayRecord, setTodayRecord] = useState<HabitRecord | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [habit.id]);

  async function fetchRecords() {
    try {
      const startDate = format(subDays(new Date(), 90), 'yyyy-MM-dd');
      const response = await fetch(`/api/habit-records?habit_id=${habit.id}&start_date=${startDate}`);
      if (!response.ok) throw new Error('Failed to fetch records');
      const data = await response.json();
      setRecords(data);

      // Find today's record
      const today = startOfDay(new Date()).toISOString();
      const todayRec = data.find((r: HabitRecord) => 
        startOfDay(new Date(r.date)).toISOString() === today
      );
      setTodayRecord(todayRec);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  }

  async function handleToggleToday() {
    try {
      if (todayRecord) {
        // Delete today's record
        const response = await fetch(`/api/habit-records?id=${todayRecord.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete record');
      } else {
        // Create new record for today
        const response = await fetch('/api/habit-records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            habit_id: habit.id,
            date: new Date().toISOString(),
            value: 1,
          }),
        });
        if (!response.ok) throw new Error('Failed to create record');
      }
      fetchRecords();
    } catch (error) {
      console.error('Error updating record:', error);
    }
  }

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
    <div className="space-y-6">
      {/* Today's Progress */}
      <div className="card bg-base-200 p-4">
        <h4 className="font-medium mb-4">Today&apos;s Progress</h4>
        <button
          className={`btn btn-lg w-full ${todayRecord ? 'btn-success' : 'btn-outline'}`}
          onClick={handleToggleToday}
        >
          {todayRecord ? 'Completed ✓' : 'Mark as Complete'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-base-200 p-4 text-center">
          <div className="text-2xl font-bold text-primary">{completedDays}</div>
          <div className="text-sm text-base-content/70">Days Completed</div>
        </div>
        <div className="card bg-base-200 p-4 text-center">
          <div className="text-2xl font-bold text-primary">{currentStreak}</div>
          <div className="text-sm text-base-content/70">Current Streak</div>
        </div>
        <div className="card bg-base-200 p-4 text-center">
          <div className="text-2xl font-bold text-primary">{longestStreak}</div>
          <div className="text-sm text-base-content/70">Longest Streak</div>
        </div>
      </div>

      {/* Activity Graph */}
      <div className="card bg-base-200 p-4">
        <h4 className="font-medium mb-4">Activity in Last 90 Days</h4>
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm transition-colors ${
                    day.value > 0
                      ? 'bg-primary'
                      : day.isToday
                      ? 'bg-base-300 ring-1 ring-primary ring-offset-1'
                      : 'bg-base-300'
                  }`}
                  title={`${format(day.date, 'MMM d, yyyy')}: ${
                    day.value > 0 ? 'Completed' : 'Not completed'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-base-content/70">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-base-300" />
            <div className="w-3 h-3 rounded-sm bg-primary opacity-30" />
            <div className="w-3 h-3 rounded-sm bg-primary opacity-60" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="card bg-base-200 p-4">
        <h4 className="font-medium mb-4">Overall Completion Rate</h4>
        <div className="w-full bg-base-300 rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <div className="text-right mt-2 text-sm text-base-content/70">
          {completionRate.toFixed(1)}%
        </div>
      </div>
    </div>
  );
} 