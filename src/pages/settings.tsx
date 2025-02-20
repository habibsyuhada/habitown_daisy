import { useState } from 'react';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import SearchDrawer from '@/components/SearchDrawer';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setTheme } from '@/store/themeSlice';
import type { RootState } from '@/store/store';

const themes = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 
  'garden', 'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 
  'wireframe', 'black', 'luxury', 'dracula', 'cmyk', 'autumn', 
  'business', 'acid', 'lemonade', 'night', 'coffee', 'winter'
] as const;

export default function Settings() {
  const [isSearchDrawerOpen, setIsSearchDrawerOpen] = useState(false);
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector((state: RootState) => state.theme.current);

  return (
    <div className="min-h-screen bg-base-100">
      <TopBar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 p-4 lg:ml-64">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title mb-4">Theme Settings</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {themes.map((themeName) => (
                  <button
                    key={themeName}
                    className={`btn ${currentTheme === themeName ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => dispatch(setTheme(themeName))}
                  >
                    {themeName}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Preview:</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <button className="btn">Default</button>
                    <button className="btn btn-primary">Primary</button>
                    <button className="btn btn-secondary">Secondary</button>
                    <button className="btn btn-accent">Accent</button>
                  </div>
                  <div className="flex gap-2">
                    <div className="badge">Default</div>
                    <div className="badge badge-primary">Primary</div>
                    <div className="badge badge-secondary">Secondary</div>
                    <div className="badge badge-accent">Accent</div>
                  </div>
                  <div className="flex gap-2">
                    <input type="checkbox" className="toggle" checked readOnly />
                    <input type="checkbox" className="toggle toggle-primary" checked readOnly />
                    <input type="checkbox" className="toggle toggle-secondary" checked readOnly />
                    <input type="checkbox" className="toggle toggle-accent" checked readOnly />
                  </div>
                </div>
              </div>
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
  );
} 