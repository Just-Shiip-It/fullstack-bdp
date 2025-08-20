'use server';

import { db } from '@/db';
import { donation, donorProfile, user } from '@/db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';

export interface DonationData {
  donationType: 'blood' | 'plasma' | 'platelets' | 'double_red';
  location: string;
  donationDate: string;
  hemoglobinLevel?: string;
  bloodPressure?: string;
  weight?: number;
  notes?: string;
  status?: 'completed' | 'deferred' | 'cancelled';
  processedBy?: string;
}

/**
 * Get donation history for the current user
 */
export async function getDonationHistory() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    const userId = session.user.id;

    const donations = await db
      .select({
        id: donation.id,
        donationType: donation.donationType,
        location: donation.location,
        donationDate: donation.donationDate,
        hemoglobinLevel: donation.hemoglobinLevel,
        bloodPressure: donation.bloodPressure,
        weight: donation.weight,
        notes: donation.notes,
        status: donation.status,
        createdAt: donation.createdAt,
      })
      .from(donation)
      .where(eq(donation.userId, userId))
      .orderBy(desc(donation.donationDate));

    return donations;
  } catch (error) {
    console.error('Error fetching donation history:', error);
    throw new Error('Failed to fetch donation history');
  }
}

/**
 * Get donation statistics for the current user
 */
export async function getDonationStats() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    const userId = session.user.id;

    // Get total donations count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(donation)
      .where(and(
        eq(donation.userId, userId),
        eq(donation.status, 'completed')
      ));

    const totalDonations = totalResult[0]?.count || 0;

    // Get last donation
    const lastDonationResult = await db
      .select({
        donationDate: donation.donationDate,
        donationType: donation.donationType,
      })
      .from(donation)
      .where(and(
        eq(donation.userId, userId),
        eq(donation.status, 'completed')
      ))
      .orderBy(desc(donation.donationDate))
      .limit(1);

    const lastDonation = lastDonationResult[0] || null;

    // Calculate next eligible date (56 days for whole blood)
    let nextEligibleDate = null;
    if (lastDonation) {
      const lastDate = new Date(lastDonation.donationDate);
      const daysToAdd = lastDonation.donationType === 'plasma' ? 28 : 56; // Plasma: 28 days, Blood: 56 days
      nextEligibleDate = new Date(lastDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    }

    // Calculate lives impacted (rough estimate: 1 donation can help up to 3 people)
    const livesImpacted = totalDonations * 3;

    return {
      totalDonations,
      livesImpacted,
      lastDonation: lastDonation ? {
        date: lastDonation.donationDate,
        type: lastDonation.donationType,
      } : null,
      nextEligibleDate,
      isEligible: nextEligibleDate ? new Date() >= nextEligibleDate : true,
    };
  } catch (error) {
    console.error('Error fetching donation stats:', error);
    throw new Error('Failed to fetch donation statistics');
  }
}

/**
 * Create a new donation record (typically used by admin)
 */
export async function createDonation(data: DonationData & { userId?: string }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    // Use provided userId (for admin) or current user's ID
    const targetUserId = data.userId || session.user.id;

    // If admin is creating for another user, verify admin role
    if (data.userId && session.user.role !== 'admin') {
      throw new Error('Unauthorized: Only admins can create donations for other users');
    }

    const donationId = nanoid();

    await db.insert(donation).values({
      id: donationId,
      userId: targetUserId,
      donationType: data.donationType,
      location: data.location,
      donationDate: data.donationDate,
      hemoglobinLevel: data.hemoglobinLevel,
      bloodPressure: data.bloodPressure,
      weight: data.weight,
      notes: data.notes,
      status: data.status || 'completed',
      processedBy: session.user.role === 'admin' ? session.user.id : undefined,
    });

    // Update donor profile with last donation date and eligibility
    if (data.status === 'completed') {
      const daysToAdd = data.donationType === 'plasma' ? 28 : 56;
      const nextEligibleDate = new Date(new Date(data.donationDate).getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
      const isEligible = new Date() >= nextEligibleDate;

      await db
        .update(donorProfile)
        .set({
          lastDonationDate: data.donationDate,
          isEligible,
          updatedAt: new Date(),
        })
        .where(eq(donorProfile.userId, targetUserId));
    }

    revalidatePath('/portal');
    revalidatePath('/admin');

    return { success: true, donationId };
  } catch (error) {
    console.error('Error creating donation:', error);
    throw new Error('Failed to create donation record');
  }
}

/**
 * Get donations for a specific date range (admin function)
 */
export async function getDonationsInRange(startDate: string, endDate: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    const donations = await db
      .select({
        id: donation.id,
        donationType: donation.donationType,
        location: donation.location,
        donationDate: donation.donationDate,
        status: donation.status,
        donorName: user.name,
        donorEmail: user.email,
      })
      .from(donation)
      .innerJoin(user, eq(donation.userId, user.id))
      .where(and(
        gte(donation.donationDate, startDate),
        lte(donation.donationDate, endDate)
      ))
      .orderBy(desc(donation.donationDate));

    return donations;
  } catch (error) {
    console.error('Error fetching donations in range:', error);
    throw new Error('Failed to fetch donations');
  }
}
