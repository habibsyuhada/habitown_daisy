import { Settings as SettingsIcon, ChevronRight, Castle, User, Bell, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

const settingsMenu = [
  {
    id: 'categories',
    name: 'Categories',
    description: 'Manage your habit categories',
    icon: Castle,
    href: '/settings/categories'
  },
  {
    id: 'profile',
    name: 'Profile',
    description: 'Update your personal information',
    icon: User,
    href: '/settings/profile'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'Configure notification preferences',
    icon: Bell,
    href: '/settings/notifications'
  }
];

export default function Settings() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <motion.button
          className="btn btn-ghost btn-circle"
          onClick={() => router.push('/')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeft size={24} />
        </motion.button>
        <span className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <SettingsIcon size={24} className="text-primary" />
        </span>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-base-content/70">Configure your app preferences</p>
        </div>
      </div>

      <div className="grid gap-4">
        {settingsMenu.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              className="w-full flex items-center gap-4 p-4 bg-base-100/50 backdrop-blur-sm rounded-xl shadow-sm hover:bg-base-200/50 transition-colors text-left"
              onClick={() => router.push(item.href)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={24} className="text-primary" />
              </span>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-base-content/70 text-sm">{item.description}</p>
              </div>
              <ChevronRight size={20} className="text-base-content/30" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
} 