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

export default function Sidebar() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="hidden lg:flex flex-col w-64 bg-base-200 fixed top-16 left-0 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4 sticky top-0 bg-base-200 z-20">
        <input
          type="text"
          placeholder="Search menu..."
          className="input input-bordered w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <ul className="menu p-4">
        {filteredMenuItems.map((item) => (
          <li key={item.name}>
            <Link href={item.href}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
} 