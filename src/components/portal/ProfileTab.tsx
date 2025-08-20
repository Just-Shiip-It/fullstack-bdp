'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  getDonorProfile,
  updateUserInfo,
  updateDonorProfile,
  updateEmergencyContact,
  type DonorProfileData,
  type EmergencyContactData
} from '@/lib/actions/profile';

export default function ProfileTab() {
  const { user: authUser } = useAuth();
  const [profileData, setProfileData] = useState<any>({});
  const [emergencyData, setEmergencyData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState(false);
  const [emgMsg, setEmgMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (!authUser) return;

      try {
        setLoading(true);
        const data = await getDonorProfile();

        // Combine user and profile data
        const combinedData = {
          ...data.user,
          ...data.profile,
          dateOfBirth: data.profile?.dateOfBirth ?
            new Date(data.profile.dateOfBirth).toISOString().split('T')[0] : '',
        };

        setProfileData(combinedData);
        setEmergencyData(data.emergencyContact || {});
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [authUser]);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      // Update basic user info
      await updateUserInfo({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
      });

      // Update donor profile
      const profileUpdateData: DonorProfileData = {
        phone: formData.get('phone') as string || undefined,
        address: formData.get('address') as string || undefined,
        city: formData.get('city') as string || undefined,
        bloodGroup: formData.get('group') as any || undefined,
        dateOfBirth: formData.get('dateOfBirth') as string || undefined,
        weight: formData.get('weight') ? parseInt(formData.get('weight') as string) : undefined,
        medicalNotes: formData.get('medicalNotes') as string || undefined,
      };

      await updateDonorProfile(profileUpdateData);

      // Update local state
      const updatedData = {
        ...profileData,
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        bloodGroup: formData.get('group'),
        dateOfBirth: formData.get('dateOfBirth'),
        weight: formData.get('weight') ? parseInt(formData.get('weight') as string) : undefined,
        medicalNotes: formData.get('medicalNotes'),
      };

      setProfileData(updatedData);
      setSaveMsg(true);
      setTimeout(() => setSaveMsg(false), 2000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleEmergencySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const emergencyContactData: EmergencyContactData = {
        name: formData.get('eName') as string,
        phone: formData.get('ePhone') as string,
        relationship: formData.get('eRelation') as string,
      };

      await updateEmergencyContact(emergencyContactData);

      // Update local state
      setEmergencyData(emergencyContactData);
      setEmgMsg(true);
      setTimeout(() => setEmgMsg(false), 2000);
    } catch (err) {
      console.error('Error updating emergency contact:', err);
      setError('Failed to update emergency contact. Please try again.');
    }
  };

  if (loading) {
    return (
      <section className="mt-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blood-500 mx-auto"></div>
            <p className="mt-2 text-slate-300">Loading profile...</p>
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

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-semibold">Personal information</h3>
          <form onSubmit={handleProfileSubmit} className="mt-4 grid gap-3 text-sm">
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                name="name"
                placeholder="Full name"
                defaultValue={profileData.name || ''}
                required
              />
              <Input
                type="email"
                name="email"
                placeholder="Email address"
                defaultValue={profileData.email || ''}
                required
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Select name="group" defaultValue={profileData.bloodGroup || ''}>
                <option value="">Blood Group</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </Select>
              <Input
                name="city"
                placeholder="City"
                defaultValue={profileData.city || ''}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                name="phone"
                placeholder="Phone"
                defaultValue={profileData.phone || ''}
              />
              <Input
                name="address"
                placeholder="Address"
                defaultValue={profileData.address || ''}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                type="date"
                name="dateOfBirth"
                placeholder="Date of Birth"
                defaultValue={profileData.dateOfBirth || ''}
              />
              <Input
                type="number"
                name="weight"
                placeholder="Weight (kg)"
                defaultValue={profileData.weight || ''}
                min="30"
                max="200"
              />
            </div>
            <div>
              <Input
                name="medicalNotes"
                placeholder="Medical notes (optional)"
                defaultValue={profileData.medicalNotes || ''}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit">Save changes</Button>
              {saveMsg && <span className="text-emerald-400">Saved!</span>}
            </div>
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold">Emergency contact</h3>
          <form onSubmit={handleEmergencySubmit} className="mt-4 grid gap-3 text-sm">
            <Input
              name="eName"
              placeholder="Contact name"
              defaultValue={emergencyData.name || ''}
              required
            />
            <Input
              name="ePhone"
              placeholder="Contact phone"
              defaultValue={emergencyData.phone || ''}
              required
            />
            <Input
              name="eRelation"
              placeholder="Relationship (e.g., Sister)"
              defaultValue={emergencyData.relationship || ''}
              required
            />
            <div className="flex items-center gap-2">
              <Button type="submit" variant="outline">Save contact</Button>
              {emgMsg && <span className="text-emerald-400">Saved!</span>}
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}
