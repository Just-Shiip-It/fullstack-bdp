'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import {
  getUserAppointments,
  createAppointment,
  cancelAppointment,
  type AppointmentData
} from '@/lib/actions/appointments';
import { useAuth } from '@/components/providers/AuthProvider';
import { getStatusClasses } from '@/lib/utils/statusColors';

export default function ScheduleTab() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [dateChips, setDateChips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    // Generate next 14 days
    const chips = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const date = new Date(now.getTime() + i * 86400000);
      chips.push({
        date: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
      });
    }

    setDateChips(chips);
    setSelectedDate(chips[0]?.date || '');
  }, []);

  useEffect(() => {
    async function loadAppointments() {
      if (!user) return;

      try {
        setLoading(true);
        const userAppointments = await getUserAppointments();
        setAppointments(userAppointments);
      } catch (err) {
        console.error('Error loading appointments:', err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, [user]);

  const dailySlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00'];

  const bookSlot = async (time: string) => {
    if (!user || bookingLoading) return;

    const type = (document.getElementById('donationType') as HTMLSelectElement)?.value || 'blood';
    const location = (document.getElementById('donationLocation') as HTMLSelectElement)?.value || 'City Hall';

    try {
      setBookingLoading(true);
      setError(null);

      const appointmentData: AppointmentData = {
        appointmentDate: selectedDate,
        appointmentTime: time,
        donationType: type as any,
        location,
      };

      const result = await createAppointment(appointmentData);

      if (result.success) {
        // Reload appointments to get the updated list
        const userAppointments = await getUserAppointments();
        setAppointments(userAppointments);
      }
    } catch (err: any) {
      console.error('Error booking appointment:', err);
      setError(err.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const cancelAppt = async (id: string) => {
    try {
      setError(null);
      await cancelAppointment(id);

      // Reload appointments to get the updated list
      const userAppointments = await getUserAppointments();
      setAppointments(userAppointments);
    } catch (err: any) {
      console.error('Error cancelling appointment:', err);
      setError(err.message || 'Failed to cancel appointment');
    }
  };

  const takenSlots = new Set(
    appointments
      .filter(a => {
        const appointmentDate = new Date(a.appointmentDate).toISOString().slice(0, 10);
        return appointmentDate === selectedDate && a.status !== 'cancelled';
      })
      .map(a => a.appointmentTime)
  );

  const upcomingAppts = appointments
    .filter(a => {
      const appointmentDate = new Date(a.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appointmentDate >= today && a.status !== 'cancelled';
    })
    .sort((a, b) => {
      const dateA = new Date(a.appointmentDate + 'T' + a.appointmentTime);
      const dateB = new Date(b.appointmentDate + 'T' + b.appointmentTime);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  if (loading) {
    return (
      <section className="mt-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blood-500 mx-auto"></div>
            <p className="mt-2 text-slate-300">Loading appointments...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Booking */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">Schedule a donation</h3>
            <span className="text-xs text-slate-300">Choose type, location, date and time</span>
          </div>

          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <Select id="donationType">
              <option value="blood">Blood</option>
              <option value="plasma">Plasma</option>
              <option value="platelets">Platelets</option>
              <option value="double_red">Double Red</option>
            </Select>
            <Select id="donationLocation">
              <option>City Hall</option>
              <option>Community Clinic</option>
              <option>Red Cross Center</option>
              <option>University Hospital</option>
            </Select>
            <Button
              variant="outline"
              onClick={() => setSelectedDate(dateChips[0]?.date || '')}
            >
              Jump to earliest date
            </Button>
          </div>

          <div className="mt-5">
            <p className="text-sm text-slate-300">Select a date</p>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {dateChips.map((chip) => (
                <button
                  key={chip.date}
                  onClick={() => setSelectedDate(chip.date)}
                  className={`px-3 py-2 rounded-xl border border-white/10 whitespace-nowrap ${selectedDate === chip.date
                    ? 'bg-white/10 border-white/20'
                    : 'bg-white/5 hover:bg-white/10'
                    }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-sm text-slate-300">Available times</p>
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {dailySlots.map((time) => {
                const isTaken = takenSlots.has(time);
                const isDisabled = isTaken || bookingLoading;
                return (
                  <button
                    key={time}
                    onClick={() => !isDisabled && bookSlot(time)}
                    disabled={isDisabled}
                    className={`px-3 py-2 rounded-xl border text-sm ${isTaken
                      ? 'border-white/10 bg-white/5 text-slate-400 cursor-not-allowed'
                      : bookingLoading
                        ? 'border-white/10 bg-white/5 text-slate-400 cursor-wait'
                        : 'border-white/10 bg-white/10 hover:bg-white/20'
                      }`}
                  >
                    {bookingLoading ? '...' : time}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Upcoming */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Upcoming appointments</h3>
          </div>
          <div className="mt-3 grid gap-3">
            {upcomingAppts.length === 0 ? (
              <div className="text-sm text-slate-400">No upcoming appointments yet.</div>
            ) : (
              upcomingAppts.map((appt) => {
                const datetime = new Date(appt.appointmentDate + 'T' + appt.appointmentTime);
                const pretty = datetime.toLocaleString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={appt.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-300 capitalize">{appt.donationType} • {appt.location}</div>
                        <div className="font-semibold">{pretty}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          Status: <span className={`px-2 py-1 rounded-full text-xs ${getStatusClasses(appt.status)}`}>
                            {appt.status}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => cancelAppt(appt.id)}
                        className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-rose-500/20 text-sm"
                        disabled={appt.status === 'cancelled'}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
