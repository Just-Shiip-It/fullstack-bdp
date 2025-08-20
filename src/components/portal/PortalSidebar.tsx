'use client';

import Link from 'next/link';
import LifeDropLogo from '@/components/ui/LifeDropLogo';

interface PortalSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

export default function PortalSidebar({ activeTab, onTabChange, user, onLogout }: PortalSidebarProps) {
  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'schedule', icon: '🗓️', label: 'Schedule' },
    { id: 'history', icon: '🧾', label: 'History' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <aside className="glass border-r border-white/10 p-4 lg:p-6 flex flex-col gap-4">
      <Link href="/" className="flex items-center gap-2">
        <LifeDropLogo />
      </Link>
      
      <nav className="mt-2 grid gap-1 text-sm">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`px-3 py-2 rounded-lg hover:bg-white/5 flex items-center gap-2 text-left ${
              activeTab === item.id ? 'bg-white/10 border border-white/10' : ''
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      
      <div className="mt-auto grid gap-2 text-xs text-slate-300">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blood-500/40 to-rose-500/40 grid place-items-center">
            💧
          </div>
          <div className="leading-tight">
            <div className="font-semibold">{user?.name || 'Donor'}</div>
            <div className="text-slate-400">
              {user?.group ? `${user.group} • ${user.city || ''}` : (user?.city || '—')}
            </div>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
