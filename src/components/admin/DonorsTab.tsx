'use client';

import { useState, useEffect } from 'react';
import AdminCard from './AdminCard';
import AdminChip from './AdminChip';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { getAllDonors, getDonorById } from '@/lib/actions/admin';

export default function DonorsTab() {
  const [donors, setDonors] = useState<any[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<any[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingDonor, setLoadingDonor] = useState(false);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        setLoading(true);
        setError(null);

        const allDonors = await getAllDonors(searchQuery || undefined, groupFilter || undefined);
        setDonors(allDonors);
        setFilteredDonors(allDonors);
      } catch (err) {
        console.error('Error fetching donors:', err);
        setError(err instanceof Error ? err.message : 'Failed to load donors');
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, [searchQuery, groupFilter]);

  useEffect(() => {
    let filtered = donors;

    if (cityFilter) {
      filtered = filtered.filter(donor =>
        donor.city?.toLowerCase().includes(cityFilter.toLowerCase())
      );
    }

    setFilteredDonors(filtered);
  }, [cityFilter, donors]);

  const handleDonorSelect = async (donor: any) => {
    try {
      setLoadingDonor(true);
      const donorDetails = await getDonorById(donor.id);
      setSelectedDonor(donorDetails);
    } catch (err) {
      console.error('Error fetching donor details:', err);
      alert('Failed to load donor details');
    } finally {
      setLoadingDonor(false);
    }
  };

  const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const updatedDonor = {
      ...selectedDonor,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      group: formData.get('group'),
      city: formData.get('city')
    };

    setSelectedDonor(updatedDonor);

    // Update in donors list
    const updatedDonors = donors.map(d =>
      d.id === updatedDonor.id ? updatedDonor : d
    );
    setDonors(updatedDonors);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blood-500 mx-auto"></div>
          <p className="mt-2 text-sm text-slate-400">Loading donors...</p>
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
      {/* Left: Search + List */}
      <div className="lg:col-span-1 grid gap-4">
        <AdminCard className="p-5">
          <h3 className="font-semibold mb-4">Search donors</h3>
          <div className="grid gap-3 text-sm">
            <Input
              placeholder="Name, email, phone, city"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
              >
                <option value="">All groups</option>
                <option>O+</option>
                <option>O-</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
              </Select>
              <Input
                placeholder="City"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
            </div>
          </div>
        </AdminCard>

        <AdminCard className="p-0 overflow-hidden">
          <div className="px-5 pt-5 pb-2 flex items-center justify-between border-b border-white/10">
            <h3 className="font-semibold">Results</h3>
            <span className="text-xs text-slate-400">{filteredDonors.length} donors</span>
          </div>
          <div className="max-h-[60vh] overflow-auto px-4 py-4 space-y-3">
            {filteredDonors.map((donor) => (
              <button
                key={donor.id}
                onClick={() => handleDonorSelect(donor)}
                className={`w-full p-4 rounded-xl border text-left transition-colors ${selectedDonor?.id === donor.id
                  ? 'bg-white/10 border-white/20'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{donor.name}</div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">{donor.email}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <AdminChip variant={donor.isEligible ? 'success' : 'warning'}>
                      {donor.bloodGroup || 'Unknown'}
                    </AdminChip>
                    <div className="text-xs text-slate-400 mt-1">{donor.city || 'N/A'}</div>
                    <div className="text-xs text-slate-400">{donor.totalDonations} donations</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </AdminCard>
      </div>

      {/* Right: Profile + Details */}
      <div className="lg:col-span-2 grid gap-4">
        <AdminCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Profile</h3>
            {selectedDonor && (
              <AdminChip variant={selectedDonor.donor?.isEligible ? 'success' : 'warning'}>
                {selectedDonor.donor?.isEligible ? 'Eligible' : 'Not eligible'}
              </AdminChip>
            )}
          </div>

          {!selectedDonor ? (
            <div className="mt-2 text-sm text-slate-400">Select a donor from the list.</div>
          ) : loadingDonor ? (
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blood-500 mx-auto"></div>
              <p className="mt-2 text-sm text-slate-400">Loading donor details...</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div>
                  <label className="block text-slate-400 mb-1">Name</label>
                  <div className="font-medium">{selectedDonor.donor?.name || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email</label>
                  <div className="font-medium">{selectedDonor.donor?.email || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Phone</label>
                  <div className="font-medium">{selectedDonor.donor?.phone || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Blood Group</label>
                  <div className="font-medium text-red-400">{selectedDonor.donor?.bloodGroup || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">City</label>
                  <div className="font-medium">{selectedDonor.donor?.city || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Last Donation</label>
                  <div className="font-medium">
                    {selectedDonor.donor?.lastDonationDate
                      ? new Date(selectedDonor.donor.lastDonationDate).toLocaleDateString()
                      : 'Never'
                    }
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Total Donations</label>
                  <div className="font-medium text-green-400">{selectedDonor.donations?.length || 0}</div>
                </div>
              </div>
              {/* Donation History */}
              {selectedDonor.donations && selectedDonor.donations.length > 0 && (
                <div>
                  <h4 className="block text-slate-300 mb-3">Recent Donations</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                    {selectedDonor.donations.slice(0, 5).map((donation: any) => (
                      <div key={donation.id} className="p-3 bg-white/5 rounded border border-white/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{donation.donationType}</div>
                            <div className="text-xs text-slate-400">{donation.location}</div>
                          </div>
                          <span className='text-xs text-slate-400'>
                            {new Date(donation.donationDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
