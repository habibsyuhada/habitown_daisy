import { useEffect, useState, useCallback } from 'react';
import { Plus, Loader2, BarChart2, Home, Search, Castle, Settings } from 'lucide-react';
import HabitProgress from './HabitProgress';
import AddHabitForm from './AddHabitForm';
import HabitCard from './HabitCard';
import EmptyHabitList from './EmptyHabitList';
import CategoryDrawer from './CategoryDrawer';
import { useRouter } from 'next/router';

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

interface HabitListProps {
  categoryId?: string;
}

export default function HabitList({ categoryId }: HabitListProps) {
  const router = useRouter();
  const [habits, setHabits] = useState<EditingHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [showStatsDrawer, setShowStatsDrawer] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchHabits = useCallback(async () => {
    try {
      const url = categoryId ? `/api/habits?categoryId=${categoryId}` : '/api/habits';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch habits');
      const habitsData = await response.json();

      // Fetch today's records for each habit
      const today = new Date().toISOString().split('T')[0];
      const recordsResponse = await fetch(`/api/habit-records?date=${today}`);
      if (!recordsResponse.ok) throw new Error('Failed to fetch records');
      const recordsData = await recordsResponse.json();

      // Map records to habits
      const habitsWithRecords = habitsData.map((habit: Habit) => {
        const todayRecord = recordsData.find(
          (record: HabitRecord) => record.habit_id === habit.id
        );
        return {
          ...habit,
          todayRecord,
        };
      });

      setHabits(habitsWithRecords);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching habits:', error);
      setLoading(false);
    }
  }, [categoryId]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
    fetchCategories();
  }, [categoryId, fetchHabits, fetchCategories]);

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
        const currentValue = habit.todayRecord.value || 0;
        const newValue = currentValue < habit.target ? currentValue + 1 : 0;
        
        if (newValue === 0) {
          // If resetting to 0, delete the record
          const response = await fetch(`/api/habit-records/${habit.todayRecord.id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to delete record:', {
              status: response.status,
              statusText: response.statusText,
              error: errorText
            });
            throw new Error(`Failed to delete record: ${errorText}`);
          }
        } else {
          // Update today's record by incrementing value
          const response = await fetch(`/api/habit-records/${habit.todayRecord.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              value: newValue,
            }),
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to update record:', {
              status: response.status,
              statusText: response.statusText,
              error: errorText
            });
            throw new Error(`Failed to update record: ${errorText}`);
          }
        }
      } else {
        // Create new record for today starting with value 1
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0] + ' 00:00:00'; // Format: YYYY-MM-DD HH:mm:ss

        const requestBody = {
          habit_id: habit.id,
          date: todayStr,
          value: 1 // Always start with 1
        };
        
        const response = await fetch('/api/habit-records', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          let error;
          try {
            error = JSON.parse(errorText);
          } catch {
            error = errorText;
          }

          console.error('Failed to create record:', {
            status: response.status,
            statusText: response.statusText,
            error,
            requestBody
          });

          throw new Error(`Failed to create record: ${errorText}`);
        }
      }
      
      await fetchHabits(); // Refresh data
    } catch (error) {
      console.error('Error in handleToggleComplete:', error);
      // Re-fetch habits to ensure UI is in sync
      await fetchHabits();
    }
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 mb-16 lg:mb-0">
        <div className="w-full lg:w-2/5 bg-base-100/50 backdrop-blur-sm rounded-2xl shadow-sm">
          <div className="flex justify-between items-center p-4 border-b border-base-200/50">
            <h2 className="text-base font-semibold text-base-content flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Castle size={18} className="text-primary" />
              </span>
              My Habits
            </h2>
            <button
              className="btn btn-ghost btn-sm bg-white hover:bg-base-200"
              onClick={() => setIsAddHabitOpen(true)}
            >
              <Plus size={16} />
              <span className="ml-1 text-sm font-medium">Add Habit</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="animate-spin text-primary w-6 h-6" />
            </div>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-1 gap-2">
                {habits.length === 0 ? (
                  <EmptyHabitList />
                ) : (
                  habits.map((habit) => (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      isSelected={selectedHabit?.id === habit.id}
                      onSelect={setSelectedHabit}
                      onComplete={handleToggleComplete}
                      onEdit={setSelectedHabit}
                      onDelete={handleDeleteHabit}
                      onMobileClick={(habit) => {
                        setSelectedHabit(habit);
                        setShowStatsDrawer(true);
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:block w-full lg:w-3/5 bg-base-100/50 backdrop-blur-sm rounded-2xl shadow-sm">
          <div className="p-4 border-b border-base-200/50">
            <h3 className="text-base font-semibold text-base-content flex items-center gap-2">
              <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <BarChart2 size={18} className="text-primary" />
              </span>
              Progress Tracking
            </h3>
          </div>
          <div className="p-4">
            {selectedHabit ? (
              <HabitProgress 
                habit={selectedHabit} 
                onUpdate={fetchHabits}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[500px] text-base-content/50">
                <div className="w-16 h-16 bg-white/50 rounded-2xl flex items-center justify-center mb-4">
                  <BarChart2 size={32} className="text-base-content/20" />
                </div>
                <p className="text-sm font-medium mb-1">Select a habit to view progress</p>
                <p className="text-xs text-center text-base-content/40">
                  Track your progress and stay motivated!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Stats Drawer */}
      <div className={`lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
        showStatsDrawer ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div 
          className={`fixed inset-x-0 bottom-0 bg-base-100 rounded-t-3xl transition-transform duration-300 transform ${
            showStatsDrawer ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ maxHeight: '90vh', overflowY: 'auto' }}
        >
          <div className="sticky top-0 bg-base-100 z-10 px-4 py-3 border-b border-base-200/50">
            <div className="w-12 h-1 bg-base-300 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-base-content flex items-center gap-2">
                <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart2 size={18} className="text-primary" />
                </span>
                Progress Tracking
              </h3>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setShowStatsDrawer(false)}
              >
                Close
              </button>
            </div>
          </div>
          <div className="p-4">
            {selectedHabit && (
              <HabitProgress 
                habit={selectedHabit} 
                onUpdate={() => {
                  fetchHabits();
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Footer Navigation */}
      <div className="btm-nav btm-nav-sm lg:hidden bg-base-100/80 backdrop-blur border-t border-base-200/50">
        <button 
          className={`${router.pathname === '/' ? 'text-primary' : 'text-base-content/50'} active:bg-primary/5`}
          onClick={() => router.push('/')}
        >
          <Home size={18} />
        </button>
        <button
          onClick={() => setIsCategoryDrawerOpen(true)}
          className={`${isCategoryDrawerOpen ? 'text-primary' : 'text-base-content/50'} active:bg-primary/5`}
        >
          <Search size={18} />
        </button>
        <button
          className={`${router.pathname === '/town' ? 'text-primary' : 'text-base-content/50'} active:bg-primary/5`}
          onClick={() => router.push('/town')}
        >
          <Castle size={18} />
        </button>
        <button
          className={`${router.pathname === '/settings' ? 'text-primary' : 'text-base-content/50'} active:bg-primary/5`}
          onClick={() => router.push('/settings')}
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Category Drawer */}
      <CategoryDrawer 
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        categories={categories}
        categoryId={categoryId}
      />

      {/* Add/Edit Habit Modal */}
      {(isAddHabitOpen || selectedHabit) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="modal-box w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              {selectedHabit ? 'Edit Habit' : 'Add New Habit'}
            </h3>
            <AddHabitForm
              onClose={() => {
                setIsAddHabitOpen(false);
                setSelectedHabit(null);
                fetchHabits();
              }}
              editingHabit={selectedHabit}
            />
          </div>
        </div>
      )}
    </>
  );
} 