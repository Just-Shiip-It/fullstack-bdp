'use server';

import { db } from '@/db';
import { donorProfile, emergencyContact, user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';

export interface DonorProfileData {
  phone?: string;
  address?: string;
  city?: string;
  bloodGroup?: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
  dateOfBirth?: string;
  weight?: number;
  medicalNotes?: string;
}

export interface EmergencyContactData {
  name: string;
  phone: string;
  relationship: string;
}

/**
 * Get the current user's donor profile
 */
export async function getDonorProfile() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    const userId = session.user.id;

    // Get user basic info
    const userData = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userData.length === 0) {
      throw new Error('User not found');
    }

    // Get donor profile
    const profileData = await db
      .select()
      .from(donorProfile)
      .where(eq(donorProfile.userId, userId))
      .limit(1);

    // Get emergency contact
    const emergencyData = await db
      .select()
      .from(emergencyContact)
      .where(eq(emergencyContact.userId, userId))
      .limit(1);

    return {
      user: userData[0],
      profile: profileData[0] || null,
      emergencyContact: emergencyData[0] || null,
    };
  } catch (error) {
    console.error('Error fetching donor profile:', error);
    throw new Error('Failed to fetch profile');
  }
}

/**
 * Update user basic information
 */
export async function updateUserInfo(data: { name: string; email: string }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    const userId = session.user.id;

    await db
      .update(user)
      .set({
        name: data.name,
        email: data.email,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId));

    revalidatePath('/portal');
    return { success: true };
  } catch (error) {
    console.error('Error updating user info:', error);
    throw new Error('Failed to update user information');
  }
}

/**
 * Update or create donor profile
 */
export async function updateDonorProfile(data: DonorProfileData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    const userId = session.user.id;

    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(donorProfile)
      .where(eq(donorProfile.userId, userId))
      .limit(1);

    const profileData = {
      phone: data.phone,
      address: data.address,
      city: data.city,
      bloodGroup: data.bloodGroup,
      dateOfBirth: data.dateOfBirth || null,
      weight: data.weight,
      medicalNotes: data.medicalNotes,
      updatedAt: new Date(),
    };

    if (existingProfile.length > 0) {
      // Update existing profile
      await db
        .update(donorProfile)
        .set(profileData)
        .where(eq(donorProfile.userId, userId));
    } else {
      // Create new profile
      await db.insert(donorProfile).values({
        id: nanoid(),
        userId,
        ...profileData,
      });
    }

    revalidatePath('/portal');
    return { success: true };
  } catch (error) {
    console.error('Error updating donor profile:', error);
    throw new Error('Failed to update profile');
  }
}

/**
 * Update or create emergency contact
 */
export async function updateEmergencyContact(data: EmergencyContactData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Not authenticated');
    }

    const userId = session.user.id;

    // Check if emergency contact exists
    const existingContact = await db
      .select()
      .from(emergencyContact)
      .where(eq(emergencyContact.userId, userId))
      .limit(1);

    const contactData = {
      name: data.name,
      phone: data.phone,
      relationship: data.relationship,
      updatedAt: new Date(),
    };

    if (existingContact.length > 0) {
      // Update existing contact
      await db
        .update(emergencyContact)
        .set(contactData)
        .where(eq(emergencyContact.userId, userId));
    } else {
      // Create new contact
      await db.insert(emergencyContact).values({
        id: nanoid(),
        userId,
        ...contactData,
      });
    }

    revalidatePath('/portal');
    return { success: true };
  } catch (error) {
    console.error('Error updating emergency contact:', error);
    throw new Error('Failed to update emergency contact');
  }
}
