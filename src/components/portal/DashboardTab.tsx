'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getDonationStats } from '@/lib/actions/donations';
import { getAppointmentStats } from '@/lib/actions/appointments';
import { getStatusClasses } from '@/lib/utils/statusColors';

interface DashboardTabProps {
  onTabChange: (tab: string) => void;
}

export default function DashboardTab({ onTabChange }: DashboardTabProps) {
  const [stats, setStats] = useState({
    totalDonations: 0,
    livesImpacted: 0,
    lastDonation: '',
    nextEligible: '',
    isEligible: true
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        // Load donation statistics
        const donationStats = await getDonationStats();

        // Load appointment statistics
        const appointmentStats = await getAppointmentStats();

        const fmt = (d: Date) => d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        setStats({
          totalDonations: donationStats.totalDonations,
          livesImpacted: donationStats.livesImpacted,
          lastDonation: donationStats.lastDonation
            ? fmt(new Date(donationStats.lastDonation.date))
            : 'No donations yet',
          nextEligible: donationStats.nextEligibleDate
            ? fmt(new Date(donationStats.nextEligibleDate))
            : 'Eligible now',
          isEligible: donationStats.isEligible
        });

        setUpcomingAppointments(appointmentStats.upcomingAppointments || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <section className="mt-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blood-500 mx-auto"></div>
            <p className="mt-2 text-slate-300">Loading dashboard...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-6">
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-8 grid sm:grid-cols-2 gap-4">
          <Card className="p-5">
            <p className="text-sm text-slate-300">Last Donation</p>
            <p className="mt-1 text-2xl font-extrabold">{stats.lastDonation}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-slate-300">Next Eligible</p>
            <p className="mt-1 text-2xl font-extrabold">{stats.nextEligible}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-slate-300">Total Donations</p>
            <p className="mt-1 text-2xl font-extrabold">{stats.totalDonations}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm text-slate-300">Lives Impacted (est.)</p>
            <p className="mt-1 text-2xl font-extrabold">{stats.livesImpacted}</p>
          </Card>
        </div>
        <div className="md:col-span-4">
          <Card className="p-5 h-full">
            <h3 className="font-semibold">Your impact</h3>
            <p className="mt-2 text-slate-300 text-sm">
              Your donations may have helped {stats.livesImpacted} people. Keep going, hero!
            </p>
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-sm">
              <p className="text-slate-300">Next step</p>
              <p className="mt-1">
                {stats.isEligible
                  ? "You're eligible to donate! Book your next appointment."
                  : `You'll be eligible to donate again on ${stats.nextEligible}.`}
              </p>
              <button
                onClick={() => onTabChange('schedule')}
                className={`mt-3 inline-block cursor-pointer ${stats.isEligible
                  ? 'text-blood-400 hover:text-blood-50'
                  : 'text-slate-500 cursor-not-allowed'
                  }`}
                disabled={!stats.isEligible}
              >
                Book Donation →
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Upcoming Appointments Section */}
      {upcomingAppointments && upcomingAppointments.length > 0 && (
        <div className="mt-6">
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Upcoming Appointments</h3>
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => {
                const date = new Date(appointment.appointmentDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <div>
                      <div className="font-medium">{appointment.donationType} Donation</div>
                      <div className="text-sm text-slate-300">
                        {date} at {appointment.appointmentTime} • {appointment.location}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusClasses(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-semibold">Quick tips</h3>
          <ul className="mt-3 list-disc list-inside text-sm text-slate-300 grid gap-1">
            <li>Hydrate well 24 hours before donating.</li>
            <li>Eat iron-rich foods like spinach and beans.</li>
            <li>Bring a valid photo ID for verification.</li>
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="font-semibold">Shortcuts</h3>
          <div className="mt-3 grid gap-2 text-sm">
            <button
              onClick={() => onTabChange('history')}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer text-left"
            >
              View Donation History
            </button>
            <button
              onClick={() => onTabChange('profile')}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer text-left"
            >
              Edit Profile
            </button>
          </div>
        </Card>
      </div>
    </section>
  );
}
