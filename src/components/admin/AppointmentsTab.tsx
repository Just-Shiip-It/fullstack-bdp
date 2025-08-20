'use client';

import { useState, useEffect } from 'react';
import AdminCard from './AdminCard';
import AdminChip from './AdminChip';
import AdminTable from './AdminTable';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { getAllAppointments, updateAppointment } from '@/lib/actions/appointments';
import { getStatusVariant } from '@/lib/utils/statusColors';

interface AppointmentsTabProps {
  onTabChange?: (tab: string) => void;
}

export default function AppointmentsTab({ onTabChange }: AppointmentsTabProps = {}) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all appointments from database
        const allAppts = await getAllAppointments();

        setAppointments(allAppts);
        setFilteredAppointments(allAppts);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError(err instanceof Error ? err.message : 'Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    let filtered = appointments;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(appt => appt.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const today = new Date().toISOString().slice(0, 10);
      const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(appt => appt.appointmentDate === today);
          break;
        case 'tomorrow':
          filtered = filtered.filter(appt => appt.appointmentDate === tomorrow);
          break;
        case 'week':
          const weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
          filtered = filtered.filter(appt => appt.appointmentDate >= today && appt.appointmentDate <= weekFromNow);
          break;
      }
    }

    setFilteredAppointments(filtered);
  }, [statusFilter, dateFilter, appointments]);

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      setUpdating(appointmentId);
      await updateAppointment(appointmentId, { status: newStatus as any });

      // Update local state
      setAppointments(prev =>
        prev.map(appt =>
          appt.id === appointmentId
            ? { ...appt, status: newStatus }
            : appt
        )
      );

      // Show success message for completion
      if (newStatus === 'completed') {
        alert('Appointment completed successfully! Donation record has been created.');
      }
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert('Failed to update appointment status');
    } finally {
      setUpdating(null);
    }
  };

  const handleProcessDonation = (appointment: any) => {
    // Store appointment data for the donation process
    localStorage.setItem('processingAppointment', JSON.stringify(appointment));

    // Switch to donation process tab
    if (onTabChange) {
      onTabChange('donation-process');
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blood-500 mx-auto"></div>
          <p className="mt-2 text-sm text-slate-400">Loading appointments...</p>
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
        {/* Filters */}
        <AdminCard className="p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Status</label>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-32"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Date</label>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-32"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
              </Select>
            </div>
            <div className="ml-auto">
              <div className="text-sm text-slate-400">
                Showing {filteredAppointments.length} of {appointments.length} appointments
              </div>
            </div>
          </div>
        </AdminCard>

        {/* Appointments Table */}
        <AdminCard className="overflow-hidden">
          <AdminTable headers={['Date & Time', 'Donor', 'Type', 'Location', 'Status', 'Actions']}>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No appointments found.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appt) => {
                const datetime = new Date(appt.appointmentDate + 'T' + appt.appointmentTime);
                const dateStr = datetime.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const timeStr = datetime.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <tr key={appt.id}>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{dateStr}</div>
                        <div className="text-sm text-slate-400">{timeStr}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{appt.donorName || 'Unknown'}</div>
                        <div className="text-sm text-slate-400">{appt.donorEmail || 'N/A'}</div>
                        <div className="text-sm text-slate-400">{appt.donorPhone || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <AdminChip variant="info">{appt.donationType}</AdminChip>
                    </td>
                    <td className="px-4 py-3 text-sm">{appt.location}</td>
                    <td className="px-4 py-3">
                      <AdminChip variant={getStatusVariant(appt.status)}>
                        {appt.status}
                      </AdminChip>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {appt.status === 'scheduled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updating === appt.id}
                            onClick={() => handleStatusUpdate(appt.id, 'confirmed')}
                          >
                            Confirm
                          </Button>
                        )}
                        {appt.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updating === appt.id}
                            onClick={() => handleProcessDonation(appt)}
                          >
                            Process Donation
                          </Button>
                        )}
                        {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updating === appt.id}
                            onClick={() => handleStatusUpdate(appt.id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </AdminTable>
        </AdminCard>
      </div>
    </section>
  );
}
