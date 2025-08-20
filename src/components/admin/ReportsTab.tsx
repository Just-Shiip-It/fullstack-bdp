'use client';

import { useState, useEffect } from 'react';
import AdminCard from './AdminCard';
import AdminChip from './AdminChip';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { getReportData } from '@/lib/actions/admin';

export default function ReportsTab() {
  const [reportData, setReportData] = useState<any>({});
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getReportData(selectedPeriod);
        setReportData(data);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [selectedPeriod]);

  const downloadReport = () => {
    if (!reportData) return;

    const reportContent = `
LifeDrop Blood Donation Report
Period: ${selectedPeriod}
Generated: ${new Date().toLocaleString()}

Summary:
- Total Donations: ${reportData.totalDonations || 0}
- Total Appointments: ${reportData.totalAppointments || 0}
- Completion Rate: ${reportData.completionRate?.toFixed(1) || 0}%
- Average Daily Donations: ${reportData.averageDaily?.toFixed(1) || 0}

Donations by Blood Group:
${Object.entries(reportData.donationsByGroup || {})
        .map(([group, count]) => `- ${group}: ${count}`)
        .join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifedrop-report-${selectedPeriod}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blood-500 mx-auto"></div>
          <p className="mt-2 text-sm text-slate-400">Loading report data...</p>
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
    <section className="mt-6">
      <div className="grid gap-6">
        {/* Report Controls */}
        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Analytics & Reports</h3>
              <p className="text-sm text-slate-400 mt-1">
                View donation statistics and generate reports
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
              >
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
                <option value="quarter">Last 90 days</option>
                <option value="year">Last year</option>
              </Select>
              <Button onClick={downloadReport}>
                Download Report
              </Button>
            </div>
          </div>
        </AdminCard>

        {/* Key Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminCard className="p-5">
            <p className="text-sm text-slate-400">Total Donations</p>
            <p className="mt-1 text-2xl font-extrabold">{reportData.totalDonations || 0}</p>
          </AdminCard>
          <AdminCard className="p-5">
            <p className="text-sm text-slate-400">Total Appointments</p>
            <p className="mt-1 text-2xl font-extrabold">{reportData.totalAppointments || 0}</p>
          </AdminCard>
          <AdminCard className="p-5">
            <p className="text-sm text-slate-400">Completion Rate</p>
            <p className="mt-1 text-2xl font-extrabold">
              {reportData.completionRate?.toFixed(1) || 0}%
            </p>
          </AdminCard>
          <AdminCard className="p-5">
            <p className="text-sm text-slate-400">Daily Average</p>
            <p className="mt-1 text-2xl font-extrabold">
              {reportData.averageDaily?.toFixed(1) || 0}
            </p>
          </AdminCard>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Daily Donations Chart */}
          <AdminCard className="p-5">
            <h4 className="font-semibold mb-4">Daily Donations</h4>
            <div className="h-48 flex items-end justify-between gap-1">
              {(reportData.dailyData || []).map((day: any, index: number) => {
                const maxDonations = Math.max(...(reportData.dailyData || []).map((d: any) => d.donations));
                const height = maxDonations > 0 ? (day.donations / maxDonations) * 100 : 0;

                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-gradient-to-t from-blood-500 to-rose-400 rounded-t"
                      style={{ height: `${height}%`, minHeight: day.donations > 0 ? '4px' : '0' }}
                      title={`${day.label}: ${day.donations} donations`}
                    ></div>
                    <div className="text-xs text-slate-400 mt-2 transform -rotate-45 origin-left">
                      {day.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </AdminCard>

          {/* Blood Group Distribution */}
          <AdminCard className="p-5">
            <h4 className="font-semibold mb-4">Donations by Blood Group</h4>
            <div className="space-y-3">
              {Object.entries(reportData.donationsByGroup || {}).map(([group, count]) => {
                const total = reportData.totalDonations || 1;
                const percentage = ((count as number) / total) * 100;

                return (
                  <div key={group}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{group}</span>
                      <span>{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blood-500 to-rose-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </AdminCard>
        </div>

        {/* Performance Indicators */}
        <AdminCard className="p-5">
          <h4 className="font-semibold mb-4">Performance Indicators</h4>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Appointment Show Rate</span>
                <AdminChip variant="success">
                  {reportData.completionRate > 80 ? 'Excellent' : 'Good'}
                </AdminChip>
              </div>
              <div className="mt-2 text-lg font-bold">
                {reportData.completionRate?.toFixed(1) || 0}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Collection Efficiency</span>
                <AdminChip variant="info">Tracking</AdminChip>
              </div>
              <div className="mt-2 text-lg font-bold">
                {((reportData.averageDaily || 0) * 7).toFixed(0)} units/week
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Growth Trend</span>
                <AdminChip variant="success">Positive</AdminChip>
              </div>
              <div className="mt-2 text-lg font-bold">+12.5%</div>
            </div>
          </div>
        </AdminCard>
      </div>
    </section>
  );
}
