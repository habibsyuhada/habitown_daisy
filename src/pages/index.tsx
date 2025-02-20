import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import SearchDrawer from '@/components/SearchDrawer';
import HabitList from '@/components/HabitList';
import HabitStats from '@/components/HabitStats';

const queryClient = new QueryClient();

interface Habit {
  id: number;
  name: string;
  description: string | null;
}

export default function Home() {
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-base-100">
        <TopBar />
        <div className="flex pt-16">
          <Sidebar />
          <main className="flex-1 p-4 lg:ml-64">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Your Habits</h2>
                <HabitList onHabitSelect={setSelectedHabit} />
              </div>
              <div>
                <HabitStats habit={selectedHabit} />
              </div>
            </div>
          </main>
        </div>
        <BottomNav onSearchClick={() => setIsSearchDrawerOpen(true)} />
        <SearchDrawer 
          isOpen={isSearchDrawerOpen} 
          onClose={() => setIsSearchDrawerOpen(false)} 
        />
      </div>
    </QueryClientProvider>
  );
}
