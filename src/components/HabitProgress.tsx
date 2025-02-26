import { useEffect, useState } from 'react';
import { Database } from '@/types/supabase';
import { Check, X, Loader2 } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';

type Habit = Database['public']['Tables']['habit']['Row'];
type HabitRecord = Database['public']['Tables']['habit_records']['Row'];

interface HabitProgressProps {
  habit: Habit;
}

export default function HabitProgress({ habit }: HabitProgressProps) {
  const [records, setRecords] = useState<HabitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [value, setValue] = useState(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchRecords();
  }, [habit.id]);

  async function fetchRecords() {
    try {
      const startDate = startOfWeek(new Date());
      const response = await fetch(
        `/api/habit-records?habit_id=${habit.id}&start_date=${format(startDate, 'yyyy-MM-dd')}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch records');
      
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRecordProgress() {
    try {
      const response = await fetch('/api/habit-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          habit_id: habit.id,
          date: format(selectedDate, 'yyyy-MM-dd'),
          value,
          notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to record progress');

      setValue(1);
      setNotes('');
      fetchRecords();
    } catch (error) {
      console.error('Error recording progress:', error);
    }
  }

  function getWeekDays() {
    const start = startOfWeek(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i);
      const record = records.find(r => 
        isSameDay(new Date(r.date), date)
      );
      return { date, record };
    });
  }

  const weekDays = getWeekDays();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Progress Tracking</h3>
        <div className="badge badge-primary">{habit.frequency}</div>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(({ date, record }) => (
              <button
                key={date.toISOString()}
                className={`p-2 rounded-lg text-center transition-colors ${
                  isSameDay(date, selectedDate)
                    ? 'bg-primary text-primary-content'
                    : record
                    ? 'bg-success/20'
                    : 'bg-base-200 hover:bg-base-300'
                }`}
                onClick={() => setSelectedDate(date)}
              >
                <div className="text-xs">{format(date, 'EEE')}</div>
                <div className="text-sm font-medium">{format(date, 'd')}</div>
                {record && (
                  <div className="mt-1">
                    {record.value >= habit.target ? (
                      <Check size={16} className="mx-auto text-success" />
                    ) : (
                      <X size={16} className="mx-auto text-error" />
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>

          <div className="card bg-base-200 p-4">
            <h4 className="font-medium mb-4">
              Record for {format(selectedDate, 'MMMM d, yyyy')}
            </h4>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Value</span>
                  <span className="label-text-alt">Target: {habit.target}</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={value}
                  onChange={(e) => setValue(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Notes</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about your progress..."
                />
              </div>
              <button
                className="btn btn-primary w-full"
                onClick={handleRecordProgress}
              >
                Record Progress
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 