import { useQuery } from '@tanstack/react-query';

interface HabitStats {
  weeklyCompletion: number;
  monthlyCompletion: number;
  currentStreak: number;
  totalCompletions: number;
}

interface Habit {
  id: number;
  name: string;
}

export default function HabitStats({ habit }: { habit: Habit | null }) {
  const { data: stats, isLoading } = useQuery<HabitStats>({
    queryKey: ['habitStats', habit?.id],
    queryFn: () => 
      habit 
        ? fetch(`/api/habits/${habit.id}/stats`).then(res => res.json())
        : Promise.reject('No habit selected'),
    enabled: !!habit
  });

  if (!habit) return <div>Select a habit to view statistics</div>;
  if (isLoading) return <div>Loading statistics...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{habit.name} Statistics</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title">Weekly Progress</h3>
            <p className="text-4xl font-bold">{stats?.weeklyCompletion}</p>
            <p>completions this week</p>
          </div>
        </div>

        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title">Monthly Progress</h3>
            <p className="text-4xl font-bold">{stats?.monthlyCompletion}</p>
            <p>completions this month</p>
          </div>
        </div>

        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title">Current Streak</h3>
            <p className="text-4xl font-bold">{stats?.currentStreak}</p>
            <p>days in a row</p>
          </div>
        </div>

        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title">Total Completions</h3>
            <p className="text-4xl font-bold">{stats?.totalCompletions}</p>
            <p>times completed</p>
          </div>
        </div>
      </div>
    </div>
  );
} 