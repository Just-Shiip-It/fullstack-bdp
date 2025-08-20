'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PortalSidebar from '@/components/portal/PortalSidebar';
import DashboardTab from '@/components/portal/DashboardTab';
import ScheduleTab from '@/components/portal/ScheduleTab';
import HistoryTab from '@/components/portal/HistoryTab';
import ProfileTab from '@/components/portal/ProfileTab';
import Button from '@/components/ui/Button';
import { useAuth } from '@/components/providers/AuthProvider';

export default function PortalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    // Check authentication and role
    if (!loading) {
      if (!user) {
        router.replace('/signin?redirect=' + encodeURIComponent('/portal'));
        return;
      }

      // Check if user has the right role (should be 'user' for portal)
      if (user.role === 'admin') {
        router.replace('/admin');
        return;
      }
    }

    // Handle hash-based routing
    const hash = window.location.hash.replace('#', '');
    if (hash && ['dashboard', 'schedule', 'history', 'profile'].includes(hash)) {
      setActiveTab(hash);
    }
  }, [user, loading, router]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if logout fails
      router.push('/');
    }
  };

  const getPageTitle = () => {
    return activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
  };

  if (loading || !user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blood-500 mx-auto"></div>
          <p className="mt-2 text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-[260px_1fr]">
      <PortalSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={user}
        onLogout={handleLogout}
      />

      <main className="p-5 md:p-8">
        {/* Topbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">{getPageTitle()}</h1>
            <p className="text-slate-300 text-sm">Welcome back! Here's your donation snapshot.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleTabChange('schedule')}
              className="shine"
            >
              Book Donation
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <DashboardTab onTabChange={handleTabChange} />
        )}

        {activeTab === 'schedule' && (
          <ScheduleTab />
        )}

        {activeTab === 'history' && (
          <HistoryTab />
        )}

        {activeTab === 'profile' && (
          <ProfileTab />
        )}
      </main>
    </div>
  );
}
