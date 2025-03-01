import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Settings size={64} className="text-primary mb-4" />
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-base-content/70 text-center">
        Settings page is under construction. Check back later!
      </p>
    </div>
  );
} 