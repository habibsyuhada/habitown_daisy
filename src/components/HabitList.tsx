import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AddHabitForm from './AddHabitForm';

interface Habit {
  id: number;
  name: string;
  description: string | null;
}

export default function HabitList({ onHabitSelect }: { onHabitSelect: (habit: Habit) => void }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: habits, isLoading, error } = useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: async () => {
      const response = await fetch('/api/habits');
      if (!response.ok) {
        throw new Error('Failed to fetch habits');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  if (isLoading) return <div>Loading habits...</div>;
  if (error) return <div>Error loading habits</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Habits</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Add Habit
        </button>
      </div>

      <div className="space-y-2">
        {habits && habits.length > 0 ? (
          habits.map(habit => (
            <button
              key={habit.id}
              className="btn btn-outline w-full text-left"
              onClick={() => onHabitSelect(habit)}
            >
              {habit.name}
            </button>
          ))
        ) : (
          <div className="text-center text-gray-500 py-4">
            No habits found. Click "Add Habit" to create your first habit!
          </div>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add New Habit</h3>
            <AddHabitForm onClose={() => setIsAddModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
} 