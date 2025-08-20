'use client';

import { useState, useEffect } from 'react';
import AdminCard from './AdminCard';
import { getAdminDashboardStats } from '@/lib/actions/admin';
import { getAdminAppointmentStats } from '@/lib/actions/appointments';
import { getStatusClasses } from '@/lib/utils/statusColors';

interface DashboardTabProps {
  onTabChange: (tab: string) => void;
}

export default function DashboardTab({ onTabChange }: DashboardTabProps) {
  const [stats, setStats] = useState({
    todayAppts: 0,
    todayDonations: 0,
    utilization: 0,
    upcomingAppts: [] as any[]
  });
  const [stockData, setStockData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch admin dashboard stats
        const dashboardStats = await getAdminDashboardStats();

        // Fetch upcoming appointments
        const appointmentStats = await getAdminAppointmentStats();

        setStats({
          todayAppts: dashboardStats.todayAppointments,
          todayDonations: dashboardStats.todayDonations,
          utilization: dashboardStats.utilization,
          upcomingAppts: appointmentStats.upcomingAppointments || []
        });

        // Set blood group stock data
        setStockData(dashboardStats.bloodGroupStats);

      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blood-500 mx-auto"></div>
          <p className="mt-2 text-sm text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blood-500 text-white rounded hover:bg-blood-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
        <AdminCard className="p-5">
          <p className="text-sm muted">Appointments today</p>
          <p className="mt-1 text-2xl font-extrabold">{stats.todayAppts}</p>
        </AdminCard>

        <AdminCard className="p-5">
          <p className="text-sm muted">Donations completed today</p>
          <p className="mt-1 text-2xl font-extrabold">{stats.todayDonations}</p>
        </AdminCard>

        <AdminCard className="p-5">
          <p className="text-sm muted">Blood stock (units)</p>
          <div className="mt-2 grid grid-cols-4 gap-2 text-sm">
            {Object.entries(stockData).map(([group, count]) => (
              <div key={group} className="chip">
                {group} <span className="muted">{count}</span>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard className="p-5">
          <p className="text-sm muted">Utilization</p>
          <div className="mt-2 h-24 rounded bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400 transition-all duration-1000"
              style={{ width: `${stats.utilization}%` }}
            ></div>
          </div>
        </AdminCard>
      </div>

      <AdminCard className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Today&apos;s appointments</h3>
          <button
            onClick={() => onTabChange('appointments')}
            className="text-xs text-blood-500 hover:text-blood-400"
          >
            View all →
          </button>
        </div>
        <div className="mt-3 max-h-80 overflow-y-auto space-y-3">
          {stats.upcomingAppts.length === 0 ? (
            <div className="text-sm text-slate-400">No appointments today.</div>
          ) : (
            stats.upcomingAppts.map((appt, index) => {
              const datetime = new Date(appt.appointmentDate + 'T' + appt.appointmentTime);

              const pretty = datetime.toLocaleString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={appt.id || index} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-sm text-slate-400">
                    {appt.donationType || 'Blood'} • {appt.location || '-'}
                  </div>
                  <div className="font-semibold text-white">{appt.donorName || 'Unknown'}</div>
                  <div className="text-sm text-slate-300">{pretty}</div>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusClasses(appt.status)}`}>
                      {appt.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </AdminCard>
    </div>
  );
}
