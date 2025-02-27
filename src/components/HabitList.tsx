import { useEffect, useState } from 'react';
import { Database } from '@/types/supabase';
import { Plus, Loader2, Target, BarChart2, Edit2, Trash2, Check } from 'lucide-react';
import HabitProgress from './HabitProgress';
import AddHabitForm from './AddHabitForm';
import { format } from 'date-fns';

type HabitRecord = Database['public']['Tables']['habit_records']['Row'];

type Habit = Database['public']['Tables']['habit']['Row'] & {
  category: Database['public']['Tables']['habit_categories']['Row'] | null;
  uom?: string;
};

interface EditingHabit extends Habit {
  isEditing?: boolean;
  todayRecord?: HabitRecord | null;
}

interface HabitListProps {
  categoryId?: string;
}

export default function HabitList({ categoryId }: HabitListProps) {
  const [habits, setHabits] = useState<EditingHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<EditingHabit | null>(null);
  const [editingHabit, setEditingHabit] = useState<EditingHabit | null>(null);

  useEffect(() => {
    fetchHabits();
  }, [categoryId]);

  async function fetchHabits() {
    try {
      const url = categoryId ? `/api/habits?categoryId=${categoryId}` : '/api/habits';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch habits');
      const data = await response.json();

      // Fetch today's records for all habits
      const today = format(new Date(), 'yyyy-MM-dd');
      const recordsResponse = await fetch(`/api/habit-records?start_date=${today}&end_date=${today}`);
      if (!recordsResponse.ok) throw new Error('Failed to fetch records');
      const records = await recordsResponse.json();

      // Combine habits with their today's records
      const habitsWithRecords = data.map((habit: Habit) => ({
        ...habit,
        todayRecord: records.find((r: HabitRecord) => r.habit_id === habit.id),
      }));

      setHabits(habitsWithRecords);
      
      // If there's only one habit, select it automatically
      if (habitsWithRecords && habitsWithRecords.length === 1) {
        setSelectedHabit(habitsWithRecords[0]);
      }
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteHabit(habitId: number) {
    if (!confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/habits/${habitId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete habit');
      
      if (selectedHabit?.id === habitId) {
        setSelectedHabit(null);
      }
      fetchHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  }

  async function handleToggleComplete(habit: EditingHabit, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      if (habit.todayRecord) {
        // Update today's record by incrementing the value
        const response = await fetch(`/api/habit-records/${habit.todayRecord.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            value: (habit.todayRecord.value || 0) + 1,
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
            date: new Date().toISOString(),
            value: 1,
          }),
        });
        if (!response.ok) throw new Error('Failed to create record');
      }
      fetchHabits();
    } catch (error) {
      console.error('Error updating record:', error);
    }
  }

  return (
    <>
      <div className="flex flex-1 gap-6">
        <div className="w-2/3 bg-base-100 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Habits
            </h2>
            <button
              className="btn btn-primary gap-2"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={20} /> Add Habit
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="animate-spin text-primary w-12 h-12" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {habits.length === 0 ? (
                <div className="col-span-2 text-center py-12 bg-base-200 rounded-xl">
                  <BarChart2 size={64} className="mx-auto mb-4 opacity-50 text-primary" />
                  <p className="text-xl font-medium mb-2">No habits found</p>
                  <p className="text-base-content/70">Click &quot;Add Habit&quot; to create your first habit!</p>
                </div>
              ) : (
                habits.map((habit) => (
                  <div
                    key={habit.id}
                    className={`card ${
                      (habit.todayRecord?.value || 0) >= habit.target 
                        ? 'bg-base-300 opacity-75' 
                        : 'bg-base-200'
                    } group cursor-pointer hover:bg-base-300 transition-all duration-300 transform hover:scale-[1.02] ${
                      selectedHabit?.id === habit.id ? 'ring-2 ring-primary shadow-lg' : 'shadow'
                    }`}
                    onClick={() => setSelectedHabit(habit)}
                  >
                    <div className="card-body relative p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-1">{habit.name}</h3>
                          <div className="flex gap-2 mt-2 text-sm">
                            <span className="flex items-center gap-1 bg-base-300/50 px-2 py-1 rounded-full">
                              <Target size={14} className="text-primary" />
                              <span>
                                {habit.todayRecord?.value || 0}/{habit.target} {habit.uom || 'times'} today
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 min-w-[120px]">
                          {habit.category && (
                            <div
                              className="badge gap-1 p-2"
                              style={{ 
                                backgroundColor: habit.category.color || '#4F46E5',
                                color: '#fff',
                                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                              }}
                            >
                              <span>{habit.category.icon}</span>
                              {habit.category.name}
                            </div>
                          )}
                          <div className="flex gap-1">
                            <button
                              className={`btn btn-circle btn-sm ${
                                (habit.todayRecord?.value || 0) >= habit.target
                                  ? 'btn-success text-white opacity-50 cursor-not-allowed'
                                  : (habit.todayRecord?.value || 0) > 0
                                  ? 'btn-success text-white'
                                  : 'btn-outline'
                              }`}
                              onClick={(e) => handleToggleComplete(habit, e)}
                              disabled={(habit.todayRecord?.value || 0) >= habit.target}
                            >
                              <Check size={16} />
                            </button>
                            <button
                              className="btn btn-circle btn-xs btn-ghost bg-base-100 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingHabit(habit);
                              }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-circle btn-xs btn-ghost bg-base-100 text-error hover:bg-error hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteHabit(habit.id);
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="w-1/3 bg-base-100 p-6 rounded-xl shadow-lg">
          {selectedHabit ? (
            <>
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Progress Tracking
              </h3>
              <HabitProgress habit={selectedHabit} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-base-content/50">
              <BarChart2 size={64} className="mb-4 text-primary/30" />
              <p className="text-lg font-medium mb-2">Select a habit to view progress</p>
              <p className="text-sm text-center text-base-content/50">
                Track your progress and stay motivated!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Habit Modal */}
      {(showAddForm || editingHabit) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal-box w-11/12 max-w-3xl">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {editingHabit ? 'Edit Habit' : 'Add New Habit'}
            </h3>
            <AddHabitForm
              onClose={() => {
                setShowAddForm(false);
                setEditingHabit(null);
                fetchHabits();
              }}
              editingHabit={editingHabit}
            />
          </div>
        </div>
      )}
    </>
  );
} 