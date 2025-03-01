import { BarChart2 } from 'lucide-react';

export default function EmptyHabitList() {
  return (
    <div className="col-span-full text-center py-12 bg-base-200 rounded-xl">
      <BarChart2 size={64} className="mx-auto mb-4 opacity-50 text-primary" />
      <p className="text-xl font-medium mb-2">No habits found</p>
      <p className="text-base-content/70">Click &quot;Add Habit&quot; to create your first habit!</p>
    </div>
  );
} 