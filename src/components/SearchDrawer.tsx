import { useState } from 'react';
import Link from 'next/link';

const menuItems = [
  { name: 'Dashboard', href: '/' },
  { name: 'My Town', href: '/town' },
  { name: 'Statistics', href: '/stats' },
  { name: 'Achievements', href: '/achievements' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
  { name: 'Friends', href: '/friends' },
];

export default function SearchDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="drawer z-50">
      <input 
        id="search-drawer" 
        type="checkbox" 
        className="drawer-toggle" 
        checked={isOpen}
        onChange={onClose}
      />
      <div className="drawer-side">
        <label htmlFor="search-drawer" className="drawer-overlay"></label>
        <div className="menu p-4 w-80 min-h-full bg-base-200">
          <div className="mb-4 flex items-center justify-between">
            <input
              type="text"
              placeholder="Search menu..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ul>
            {filteredMenuItems.map((item) => (
              <li key={item.name}>
                <Link href={item.href} onClick={onClose}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 