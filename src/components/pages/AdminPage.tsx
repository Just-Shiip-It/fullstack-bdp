'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardTab from '@/components/admin/DashboardTab';
import DonorsTab from '@/components/admin/DonorsTab';
import AppointmentsTab from '@/components/admin/AppointmentsTab';
import DonationProcessTab from '@/components/admin/DonationProcessTab';
import InventoryTab from '@/components/admin/InventoryTab';
import ReportsTab from '@/components/admin/ReportsTab';
import { useAuth } from '@/components/providers/AuthProvider';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    // Check authentication and role
    if (!loading) {
      if (!user) {
        router.replace('/signin?redirect=' + encodeURIComponent('/admin'));
        return;
      }

      // Check if user has admin role
      if (user.role !== 'admin') {
        router.replace('/portal');
        return;
      }
    }

    // Handle hash-based routing
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['dashboard', 'donors', 'appointments', 'donation-process', 'inventory', 'reports'];
    if (hash && validTabs.includes(hash)) {
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
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      donors: 'Donor Management',
      appointments: 'Appointments',
      'donation-process': 'Donation Process',
      inventory: 'Blood Inventory',
      reports: 'Reports & Analytics'
    };
    return titles[activeTab] || 'Admin Panel';
  };

  const getPageDescription = () => {
    const descriptions: Record<string, string> = {
      dashboard: 'Overview of blood donation operations and key metrics',
      donors: 'Manage donor profiles, search, and track donation history',
      appointments: 'View and manage donation appointments and scheduling',
      'donation-process': 'Guide donors through the complete donation workflow',
      inventory: 'Track blood units, expiry dates, and stock levels',
      reports: 'Generate reports and analyze donation trends'
    };
    return descriptions[activeTab] || 'Administrative functions';
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
    <div className="min-h-[100dvh] grid lg:grid-cols-[260px_1fr] text-slate-100 antialiased">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
      />

      <main className="p-5 md:p-8">
        {/* Header */}
        <div className="beam flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">
              {getPageTitle()}
            </h1>
            <p className="text-slate-300 text-sm">
              {getPageDescription()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* <a href="/portal" className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm">Donor Portal</a> */}
            <button className="shine px-4 py-2 rounded-xl bg-gradient-to-r from-blood-500 to-rose-500 shadow-glow text-sm">Refresh</button>
          </div>
        </div>

        {/* Tab Content */}
        <section className="mt-6 grid gap-4">
          {activeTab === 'dashboard' && (
            <DashboardTab onTabChange={handleTabChange} />
          )}

          {activeTab === 'donors' && (
            <DonorsTab />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsTab onTabChange={handleTabChange} />
          )}

          {activeTab === 'donation-process' && (
            <DonationProcessTab />
          )}

          {activeTab === 'inventory' && (
            <InventoryTab />
          )}

          {activeTab === 'reports' && (
            <ReportsTab />
          )}
        </section>
      </main>
    </div>
  );
}
