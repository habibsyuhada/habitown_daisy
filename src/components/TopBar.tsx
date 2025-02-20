import Link from 'next/link';

export default function TopBar() {
  return (
    <div className="navbar bg-base-100 lg:flex hidden fixed top-0 z-30 w-full">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">HabiTown</Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/town">Town</Link></li>
          <li><Link href="/settings">Settings</Link></li>
        </ul>
      </div>
    </div>
  );
} 