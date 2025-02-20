import { useState } from 'react';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import SearchDrawer from '@/components/SearchDrawer';

export default function Home() {
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-base-100">
      <TopBar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-4 lg:ml-64">
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
          <h1 className="text-2xl font-bold mb-4">Welcome to HabiTown</h1>
          <p>This is your dashboard. Start building your habits!</p>
        </main>
      </div>
      <BottomNav onSearchClick={() => setIsSearchDrawerOpen(true)} />
      <SearchDrawer 
        isOpen={isSearchDrawerOpen} 
        onClose={() => setIsSearchDrawerOpen(false)} 
      />
    </div>
  );
}
