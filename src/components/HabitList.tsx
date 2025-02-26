import { useEffect, useState } from 'react';
import { Database } from '@/types/supabase';
import { Plus, Loader2, Calendar, Target, BarChart2 } from 'lucide-react';
import HabitProgress from './HabitProgress';

type Habit = Database['public']['Tables']['habit']['Row'] & {
  category: Database['public']['Tables']['habit_categories']['Row'] | null;
};

interface HabitListProps {
  categoryId?: string;
}

export default function HabitList({ categoryId }: HabitListProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    target: 1,
    category_id: categoryId ? parseInt(categoryId) : null,
  });

  useEffect(() => {
    fetchHabits();
  }, [categoryId]);

  async function fetchHabits() {
    try {
      const url = categoryId ? `/api/habits?categoryId=${categoryId}` : '/api/habits';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch habits');
      const data = await response.json();
      setHabits(data);
      
      // If there's only one habit, select it automatically
      if (data && data.length === 1) {
        setSelectedHabit(data[0]);
      }
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddHabit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newHabit),
      });

      if (!response.ok) throw new Error('Failed to create habit');
      
      const habit = await response.json();
      
      setNewHabit({
        name: '',
        description: '',
        frequency: 'daily',
        target: 1,
        category_id: categoryId ? parseInt(categoryId) : null,
      });
      setShowAddForm(false);
      setHabits(prev => [habit, ...prev]);
      setSelectedHabit(habit);
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  }

  return (
    <div className="flex flex-1 gap-4">
      <div className="w-2/3 bg-base-100 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Habits</h2>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus size={20} /> Add Habit
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddHabit} className="mb-6 card bg-base-200 p-4">
            <div className="form-control gap-4">
              <input
                type="text"
                placeholder="Habit name"
                className="input input-bordered"
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="textarea textarea-bordered"
                value={newHabit.description}
                onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
              />
              <div className="flex gap-4">
                <select
                  className="select select-bordered flex-1"
                  value={newHabit.frequency}
                  onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
                <input
                  type="number"
                  placeholder="Target"
                  className="input input-bordered w-24"
                  value={newHabit.target}
                  onChange={(e) => setNewHabit({ ...newHabit, target: parseInt(e.target.value) })}
                  min="1"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Add Habit</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {habits.length === 0 ? (
              <div className="text-center py-8 text-base-content/70">
                <BarChart2 size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No habits found</p>
                <p className="text-sm">Click "Add Habit" to create your first habit!</p>
              </div>
            ) : (
              habits.map((habit) => (
                <div
                  key={habit.id}
                  className={`card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors ${
                    selectedHabit?.id === habit.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedHabit(habit)}
                >
                  <div className="card-body">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="card-title">{habit.name}</h3>
                        {habit.description && (
                          <p className="text-base-content/70">{habit.description}</p>
                        )}
                      </div>
                      {habit.category && (
                        <div
                          className="badge"
                          style={{ backgroundColor: habit.category.color || '#4F46E5' }}
                        >
                          {habit.category.icon} {habit.category.name}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4 mt-2 text-sm text-base-content/70">
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {habit.frequency}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target size={16} />
                        Target: {habit.target}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="w-1/3 bg-base-100 p-4 rounded-lg">
        {selectedHabit ? (
          <HabitProgress habit={selectedHabit} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-base-content/50">
            <BarChart2 size={48} />
            <p className="mt-4">Select a habit to view progress</p>
          </div>
        )}
      </div>
    </div>
  );
} 