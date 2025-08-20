'use server';

import { db } from '@/db';
import { appointment, user, donorProfile, donation } from '@/db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';

export interface AppointmentData {
  appointmentDate: string;
  appointmentTime: string;
  donationType: 'blood' | 'plasma' | 'platelets' | 'double_red';
  location: string;
  notes?: string;
}

export interface AppointmentUpdateData {
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  reminderSent?: boolean;
}

/**
 * Get appointments for the current user
 */
export async function getUserAppointments() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    const userId = session.user.id;

    const appointments = await db
      .select({
        id: appointment.id,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        donationType: appointment.donationType,
        location: appointment.location,
        status: appointment.status,
        notes: appointment.notes,
        createdAt: appointment.createdAt,
      })
      .from(appointment)
      .where(eq(appointment.userId, userId))
      .orderBy(desc(appointment.appointmentDate));

    return appointments;
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    throw new Error('Failed to fetch appointments');
  }
}

/**
 * Create a new appointment
 */
export async function createAppointment(data: AppointmentData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    const userId = session.user.id;

    // Check if user is eligible to donate
    const profile = await db
      .select({ isEligible: donorProfile.isEligible })
      .from(donorProfile)
      .where(eq(donorProfile.userId, userId))
      .limit(1);

    if (profile.length > 0 && !profile[0].isEligible) {
      throw new Error('You are not currently eligible to donate. Please check your last donation date.');
    }

    // Check if appointment date is in the future
    const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}`);
    if (appointmentDateTime <= new Date()) {
      throw new Error('Appointment must be scheduled for a future date and time');
    }

    // Check for existing appointments on the same date
    const existingAppointment = await db
      .select()
      .from(appointment)
      .where(and(
        eq(appointment.userId, userId),
        eq(appointment.appointmentDate, data.appointmentDate),
        eq(appointment.status, 'scheduled')
      ))
      .limit(1);

    if (existingAppointment.length > 0) {
      throw new Error('You already have an appointment scheduled for this date');
    }

    const appointmentId = nanoid();

    await db.insert(appointment).values({
      id: appointmentId,
      userId,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
      donationType: data.donationType,
      location: data.location,
      notes: data.notes,
      status: 'scheduled',
    });

    revalidatePath('/portal');

    return { success: true, appointmentId };
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

/**
 * Update an appointment
 */
export async function updateAppointment(appointmentId: string, data: AppointmentUpdateData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    const userId = session.user.id;

    // Get appointment details first (needed for both verification and donation creation)
    const [appointmentDetails] = await db
      .select()
      .from(appointment)
      .where(eq(appointment.id, appointmentId));

    if (!appointmentDetails) {
      throw new Error('Appointment not found');
    }

    // Verify the appointment belongs to the user (unless admin)
    if (session.user.role !== 'admin' && appointmentDetails.userId !== userId) {
      throw new Error('Appointment not found or access denied');
    }

    // If marking as completed, create a donation record
    if (data.status === 'completed') {
      // Create donation record
      const donationId = nanoid();
      await db.insert(donation).values({
        id: donationId,
        userId: appointmentDetails.userId,
        donationType: appointmentDetails.donationType,
        location: appointmentDetails.location,
        donationDate: appointmentDetails.appointmentDate,
        notes: `Completed from appointment on ${appointmentDetails.appointmentDate} at ${appointmentDetails.appointmentTime}`,
        status: 'completed',
        processedBy: session.user.id,
      });

      // Update donor profile with last donation date and eligibility
      const daysToAdd = appointmentDetails.donationType === 'plasma' ? 28 : 56;
      const nextEligibleDate = new Date(new Date(appointmentDetails.appointmentDate).getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
      const isEligible = new Date() >= nextEligibleDate;

      await db
        .update(donorProfile)
        .set({
          lastDonationDate: appointmentDetails.appointmentDate,
          isEligible,
          updatedAt: new Date(),
        })
        .where(eq(donorProfile.userId, appointmentDetails.userId));
    }

    // Update the appointment
    await db
      .update(appointment)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(appointment.id, appointmentId));

    revalidatePath('/portal');
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw new Error('Failed to update appointment');
  }
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(appointmentId: string) {
  return updateAppointment(appointmentId, { status: 'cancelled' });
}

/**
 * Get all appointments (admin function)
 */
export async function getAllAppointments(dateFilter?: { start: string; end: string }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const whereConditions = dateFilter ? and(
      gte(appointment.appointmentDate, dateFilter.start),
      lte(appointment.appointmentDate, dateFilter.end)
    ) : undefined;

    const appointments = await db
      .select({
        id: appointment.id,
        userId: appointment.userId,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        donationType: appointment.donationType,
        location: appointment.location,
        status: appointment.status,
        notes: appointment.notes,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
        donorName: user.name,
        donorEmail: user.email,
        donorPhone: donorProfile.phone,
        donorBloodGroup: donorProfile.bloodGroup,
        donorWeight: donorProfile.weight,
        donorAddress: donorProfile.address,
        donorCity: donorProfile.city,
        donorDateOfBirth: donorProfile.dateOfBirth,
      })
      .from(appointment)
      .innerJoin(user, eq(appointment.userId, user.id))
      .leftJoin(donorProfile, eq(appointment.userId, donorProfile.userId))
      .where(whereConditions)
      .orderBy(desc(appointment.appointmentDate));

    return appointments;
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    throw new Error('Failed to fetch appointments');
  }
}

/**
 * Get appointment statistics for admin dashboard
 */
export async function getAdminAppointmentStats() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const today = new Date().toISOString().slice(0, 10);

    // Today's appointments
    const todayAppointments = await db
      .select({ count: sql<number>`count(*)` })
      .from(appointment)
      .where(eq(appointment.appointmentDate, today));

    // Today's appointments only
    const upcomingAppointments = await db
      .select({
        id: appointment.id,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        donationType: appointment.donationType,
        location: appointment.location,
        status: appointment.status,
        donorName: user.name,
      })
      .from(appointment)
      .innerJoin(user, eq(appointment.userId, user.id))
      .where(eq(appointment.appointmentDate, today))
      .orderBy(appointment.appointmentTime);

    return {
      todayCount: todayAppointments[0]?.count || 0,
      upcomingAppointments,
    };
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    throw new Error('Failed to fetch appointment statistics');
  }
}

/**
 * Get appointment statistics for donor dashboard
 */
export async function getAppointmentStats() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Unauthorized: Please log in');
    }

    const today = new Date().toISOString().slice(0, 10);

    // Get user's upcoming appointments
    const upcomingAppointments = await db
      .select({
        id: appointment.id,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        donationType: appointment.donationType,
        location: appointment.location,
        status: appointment.status,
      })
      .from(appointment)
      .where(and(
        eq(appointment.userId, session.user.id),
        gte(appointment.appointmentDate, today)
      ))
      .orderBy(appointment.appointmentDate, appointment.appointmentTime)
      .limit(5);

    return {
      upcomingAppointments,
    };
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    throw new Error('Failed to fetch appointment statistics');
  }
}
