'use server';

import { db } from '@/db';
import { user, donorProfile, donation, appointment } from '@/db/schema';
import { eq, desc, and, gte, lte, sql, like, or } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * Get all donors with search and filtering (admin function)
 */
export async function getAllDonors(searchQuery?: string, bloodGroup?: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    let whereConditions = undefined;

    // Build search conditions
    const conditions = [];

    if (searchQuery) {
      conditions.push(
        or(
          like(user.name, `%${searchQuery}%`),
          like(user.email, `%${searchQuery}%`),
          like(donorProfile.phone, `%${searchQuery}%`)
        )
      );
    }

    if (bloodGroup && bloodGroup !== 'all') {
      conditions.push(eq(donorProfile.bloodGroup, bloodGroup as any));
    }

    if (conditions.length > 0) {
      whereConditions = and(...conditions);
    }

    const donors = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: donorProfile.phone,
        bloodGroup: donorProfile.bloodGroup,
        city: donorProfile.city,
        lastDonationDate: donorProfile.lastDonationDate,
        isEligible: donorProfile.isEligible,
        createdAt: user.createdAt,
      })
      .from(user)
      .leftJoin(donorProfile, eq(user.id, donorProfile.userId))
      .where(and(eq(user.role, 'user'), whereConditions))
      .orderBy(desc(user.createdAt));

    // Get donation counts for each donor
    const donorsWithStats = await Promise.all(
      donors.map(async (donor) => {
        const donationCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(donation)
          .where(and(
            eq(donation.userId, donor.id),
            eq(donation.status, 'completed')
          ));

        return {
          ...donor,
          totalDonations: donationCount[0]?.count || 0,
        };
      })
    );

    return donorsWithStats;
  } catch (error) {
    console.error('Error fetching all donors:', error);
    throw new Error('Failed to fetch donors');
  }
}

/**
 * Get donor details by ID (admin function)
 */
export async function getDonorById(donorId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    // Get donor basic info and profile
    const donorData = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: donorProfile.phone,
        address: donorProfile.address,
        city: donorProfile.city,
        bloodGroup: donorProfile.bloodGroup,
        dateOfBirth: donorProfile.dateOfBirth,
        weight: donorProfile.weight,
        lastDonationDate: donorProfile.lastDonationDate,
        isEligible: donorProfile.isEligible,
        medicalNotes: donorProfile.medicalNotes,
        createdAt: user.createdAt,
      })
      .from(user)
      .leftJoin(donorProfile, eq(user.id, donorProfile.userId))
      .where(eq(user.id, donorId))
      .limit(1);

    if (donorData.length === 0) {
      throw new Error('Donor not found');
    }

    // Get donation history
    const donations = await db
      .select({
        id: donation.id,
        donationType: donation.donationType,
        location: donation.location,
        donationDate: donation.donationDate,
        status: donation.status,
        hemoglobinLevel: donation.hemoglobinLevel,
        bloodPressure: donation.bloodPressure,
        weight: donation.weight,
        notes: donation.notes,
        createdAt: donation.createdAt,
      })
      .from(donation)
      .where(eq(donation.userId, donorId))
      .orderBy(desc(donation.donationDate));

    // Get appointment history
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
      .where(eq(appointment.userId, donorId))
      .orderBy(desc(appointment.appointmentDate));

    return {
      donor: donorData[0],
      donations,
      appointments,
    };
  } catch (error) {
    console.error('Error fetching donor details:', error);
    throw new Error('Failed to fetch donor details');
  }
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboardStats() {
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

    // Today's completed donations
    const todayDonations = await db
      .select({ count: sql<number>`count(*)` })
      .from(donation)
      .where(and(
        eq(donation.donationDate, today),
        eq(donation.status, 'completed')
      ));

    // Blood group distribution from completed donations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const bloodGroupStats = await db
      .select({
        bloodGroup: donorProfile.bloodGroup,
        count: sql<number>`count(*)`,
      })
      .from(donation)
      .innerJoin(donorProfile, eq(donation.userId, donorProfile.userId))
      .where(and(
        gte(donation.donationDate, thirtyDaysAgo),
        eq(donation.status, 'completed')
      ))
      .groupBy(donorProfile.bloodGroup);

    // Calculate utilization (mock capacity for now)
    const totalCapacity = 50; // Daily capacity
    const utilization = Math.min((todayAppointments[0]?.count || 0) / totalCapacity * 100, 100);

    return {
      todayAppointments: todayAppointments[0]?.count || 0,
      todayDonations: todayDonations[0]?.count || 0,
      utilization: Math.round(utilization),
      bloodGroupStats: bloodGroupStats.reduce((acc, stat) => {
        if (stat.bloodGroup) {
          acc[stat.bloodGroup] = stat.count;
        }
        return acc;
      }, {} as Record<string, number>),
    };
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
}

/**
 * Get report data for admin reports
 */
export async function getReportData(period: 'week' | 'month' | 'quarter' | 'year') {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const now = new Date();
    const periods = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    };

    const daysBack = periods[period];
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // Get donations in period
    const donations = await db
      .select({
        donationDate: donation.donationDate,
        donationType: donation.donationType,
        status: donation.status,
        bloodGroup: donorProfile.bloodGroup,
      })
      .from(donation)
      .innerJoin(donorProfile, eq(donation.userId, donorProfile.userId))
      .where(gte(donation.donationDate, startDate))
      .orderBy(donation.donationDate);

    // Get appointments in period
    const appointments = await db
      .select({
        appointmentDate: appointment.appointmentDate,
        status: appointment.status,
      })
      .from(appointment)
      .where(gte(appointment.appointmentDate, startDate));

    const completedDonations = donations.filter(d => d.status === 'completed');
    const completedAppointments = appointments.filter(a => a.status === 'completed');

    // Calculate completion rate
    const completionRate = appointments.length > 0
      ? Math.round((completedAppointments.length / appointments.length) * 100)
      : 0;

    // Group donations by blood group
    const donationsByGroup = completedDonations.reduce((acc, donation) => {
      if (donation.bloodGroup) {
        acc[donation.bloodGroup] = (acc[donation.bloodGroup] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDonations: completedDonations.length,
      totalAppointments: appointments.length,
      completionRate,
      donationsByGroup,
      averageDaily: Math.round(completedDonations.length / daysBack * 10) / 10,
    };
  } catch (error) {
    console.error('Error fetching report data:', error);
    throw new Error('Failed to fetch report data');
  }
}
