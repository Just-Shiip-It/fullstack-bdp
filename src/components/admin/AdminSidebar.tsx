'use client';

import Link from 'next/link';
import LifeDropLogo from '@/components/ui/LifeDropLogo';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export default function AdminSidebar({ activeTab, onTabChange, onLogout }: AdminSidebarProps) {
  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'donors', icon: '👥', label: 'Donors' },
    { id: 'appointments', icon: '📅', label: 'Appointments' },
    { id: 'donation-process', icon: '🩸', label: 'Donation Process' },
    { id: 'inventory', icon: '📦', label: 'Inventory' },
    { id: 'reports', icon: '📈', label: 'Reports' },
  ];


  return (
    <aside className="admin-sidebar glass border-r border-white/10 p-4 lg:p-6 flex flex-col gap-4">
      <Link href="/" className="flex items-center gap-2">
        <LifeDropLogo />
        <span className="text-lg font-extrabold">Admin</span>
      </Link>

      <nav className="admin-nav grid gap-1 text-sm">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={activeTab === item.id ? 'active' : ''}
            data-route={item.id}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto text-xs text-slate-400">
        © {new Date().getFullYear()} LifeDrop
      </div>
    </aside>
  );
}
