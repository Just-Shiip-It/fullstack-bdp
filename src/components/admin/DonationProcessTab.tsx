'use client';

import { useState, useEffect } from 'react';
import AdminCard from './AdminCard';
import AdminChip from './AdminChip';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { createDonation } from '@/lib/actions/donations';
import { updateAppointment } from '@/lib/actions/appointments';

export default function DonationProcessTab() {
  const [currentStep, setCurrentStep] = useState(1);
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    id: '',
    bloodGroup: '',
    hemoglobin: '',
    bloodPressure: '',
    weight: ''
  });
  const [processingAppointment, setProcessingAppointment] = useState<any>(null);

  const steps = [
    { id: 1, title: 'Registration', icon: '📝' },
    { id: 2, title: 'Health Check', icon: '🩺' },
    { id: 3, title: 'Donation', icon: '🩸' },
    { id: 4, title: 'Recovery', icon: '☕' },
    { id: 5, title: 'Complete', icon: '✅' }
  ];

  // Load appointment data from localStorage if available
  useEffect(() => {
    const appointmentData = localStorage.getItem('processingAppointment');
    if (appointmentData) {
      const appointment = JSON.parse(appointmentData);
      setProcessingAppointment(appointment);

      // Pre-fill donor information from appointment
      setDonorInfo({
        name: appointment.donorName || '',
        id: appointment.userId || '',
        bloodGroup: appointment.donorBloodGroup || '',
        hemoglobin: '',
        bloodPressure: '',
        weight: appointment.donorWeight?.toString() || ''
      });

      // Skip registration step if we have appointment data
      setCurrentStep(2);
    }
  }, []);

  const validateHealthScreening = () => {
    const hemoglobin = parseFloat(donorInfo.hemoglobin);
    const weight = parseFloat(donorInfo.weight);

    // Basic health screening validation
    if (!donorInfo.hemoglobin || !donorInfo.bloodPressure || !donorInfo.weight) {
      return { isValid: false, message: 'All health screening fields are required.' };
    }

    if (hemoglobin < 12.5) {
      return { isValid: false, message: 'Hemoglobin level too low for donation (minimum 12.5 g/dL).' };
    }

    if (weight < 50) {
      return { isValid: false, message: 'Weight too low for donation (minimum 50 kg).' };
    }

    return { isValid: true, message: 'Health screening passed.' };
  };

  const handleNext = () => {
    // Validate health screening before proceeding from step 2
    if (currentStep === 2) {
      const validation = validateHealthScreening();
      if (!validation.isValid) {
        alert(validation.message);
        return;
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    // If processing an appointment, don't go back to registration step
    const minStep = processingAppointment ? 2 : 1;
    if (currentStep > minStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // Final validation
      const validation = validateHealthScreening();
      if (!validation.isValid) {
        alert(validation.message);
        return;
      }

      // Create donation record
      const donationData = {
        donationType: processingAppointment?.donationType || 'blood',
        location: processingAppointment?.location || 'Admin Portal',
        donationDate: processingAppointment?.appointmentDate || new Date().toISOString().slice(0, 10),
        hemoglobinLevel: donorInfo.hemoglobin,
        bloodPressure: donorInfo.bloodPressure,
        weight: parseFloat(donorInfo.weight) || undefined,
        notes: `Processed through donation workflow. Donor: ${donorInfo.name}`,
        status: 'completed' as const,
        userId: processingAppointment?.userId,
      };

      await createDonation(donationData);

      // If this was from an appointment, mark it as completed
      if (processingAppointment) {
        await updateAppointment(processingAppointment.id, { status: 'completed' });
        localStorage.removeItem('processingAppointment');
      }

      // Reset form
      setCurrentStep(1);
      setDonorInfo({
        name: '',
        id: '',
        bloodGroup: '',
        hemoglobin: '',
        bloodPressure: '',
        weight: ''
      });
      setProcessingAppointment(null);

      alert('Donation process completed successfully!');
    } catch (error) {
      console.error('Error completing donation:', error);
      alert('Failed to complete donation process. Please try again.');
    }
  };

  return (
    <section className="mt-6">
      <div className="grid gap-6">
        {/* Processing Appointment Banner */}
        {processingAppointment && (
          <AdminCard className="p-6 bg-blue-500/10 border-blue-500/20">
            <div className="flex items-start gap-4">
              <div className="text-blue-400 text-2xl">📅</div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-300 text-lg mb-2">Processing Appointment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-300 font-medium">Donor:</span>
                    <p className="text-blue-200">{processingAppointment.donorName}</p>
                  </div>
                  <div>
                    <span className="text-blue-300 font-medium">Blood Group:</span>
                    <p className="text-blue-200">{processingAppointment.donorBloodGroup || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-blue-300 font-medium">Email:</span>
                    <p className="text-blue-200">{processingAppointment.donorEmail}</p>
                  </div>
                  <div>
                    <span className="text-blue-300 font-medium">Phone:</span>
                    <p className="text-blue-200">{processingAppointment.donorPhone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-blue-300 font-medium">Donation Type:</span>
                    <p className="text-blue-200 capitalize">{processingAppointment.donationType}</p>
                  </div>
                  <div>
                    <span className="text-blue-300 font-medium">Date & Time:</span>
                    <p className="text-blue-200">{processingAppointment.appointmentDate} at {processingAppointment.appointmentTime}</p>
                  </div>
                  <div>
                    <span className="text-blue-300 font-medium">Location:</span>
                    <p className="text-blue-200">{processingAppointment.location}</p>
                  </div>
                  {processingAppointment.donorWeight && (
                    <div>
                      <span className="text-blue-300 font-medium">Weight:</span>
                      <p className="text-blue-200">{processingAppointment.donorWeight} kg</p>
                    </div>
                  )}
                  {processingAppointment.notes && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <span className="text-blue-300 font-medium">Notes:</span>
                      <p className="text-blue-200">{processingAppointment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AdminCard>
        )}

        {/* Progress Steps */}
        <AdminCard className="p-5">
          <h3 className="font-semibold mb-4">Donation Process</h3>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep >= step.id
                  ? 'bg-blood-500 border-blood-500 text-white'
                  : 'border-white/20 text-slate-400'
                  }`}>
                  <span className="text-sm">{step.icon}</span>
                </div>
                <div className="ml-2 text-sm">
                  <div className={currentStep >= step.id ? 'text-white' : 'text-slate-400'}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${currentStep > step.id ? 'bg-blood-500' : 'bg-white/20'
                    }`}></div>
                )}
              </div>
            ))}
          </div>
        </AdminCard>

        {/* Step Content */}
        <AdminCard className="p-6">
          {currentStep === 1 && !processingAppointment && (
            <div>
              <h4 className="text-lg font-semibold mb-4">Donor Registration</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name"
                  value={donorInfo.name}
                  onChange={(e) => setDonorInfo({ ...donorInfo, name: e.target.value })}
                />
                <Input
                  placeholder="ID Number"
                  value={donorInfo.id}
                  onChange={(e) => setDonorInfo({ ...donorInfo, id: e.target.value })}
                />
                <Select
                  value={donorInfo.bloodGroup}
                  onChange={(e) => setDonorInfo({ ...donorInfo, bloodGroup: e.target.value })}
                >
                  <option value="">Select Blood Group</option>
                  <option>O+</option>
                  <option>O-</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 1 && processingAppointment && (
            <div>
              <h4 className="text-lg font-semibold mb-4">Donor Information</h4>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-300 text-center">
                  Donor information has been pre-loaded from the appointment.
                  <br />
                  Proceeding to health screening...
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h4 className="text-lg font-semibold mb-4">Health Screening</h4>
              <div className="grid sm:grid-cols-3 gap-4">
                <Input
                  placeholder="Hemoglobin (g/dL)"
                  value={donorInfo.hemoglobin}
                  onChange={(e) => setDonorInfo({ ...donorInfo, hemoglobin: e.target.value })}
                />
                <Input
                  placeholder="Blood Pressure"
                  value={donorInfo.bloodPressure}
                  onChange={(e) => setDonorInfo({ ...donorInfo, bloodPressure: e.target.value })}
                />
                <Input
                  placeholder="Weight (kg)"
                  value={donorInfo.weight}
                  onChange={(e) => setDonorInfo({ ...donorInfo, weight: e.target.value })}
                />
              </div>
              <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <h5 className="font-medium mb-2">Health Check Results</h5>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Hemoglobin Level:</span>
                    <AdminChip variant={
                      !donorInfo.hemoglobin ? 'warning' :
                        parseFloat(donorInfo.hemoglobin) >= 12.5 ? 'success' : 'danger'
                    }>
                      {!donorInfo.hemoglobin ? 'Pending' :
                        parseFloat(donorInfo.hemoglobin) >= 12.5 ? 'Normal' : 'Too Low'}
                    </AdminChip>
                  </div>
                  <div className="flex justify-between">
                    <span>Blood Pressure:</span>
                    <AdminChip variant={donorInfo.bloodPressure ? 'success' : 'warning'}>
                      {donorInfo.bloodPressure ? 'Normal' : 'Pending'}
                    </AdminChip>
                  </div>
                  <div className="flex justify-between">
                    <span>Weight Check:</span>
                    <AdminChip variant={
                      !donorInfo.weight ? 'warning' :
                        parseFloat(donorInfo.weight) >= 50 ? 'success' : 'danger'
                    }>
                      {!donorInfo.weight ? 'Pending' :
                        parseFloat(donorInfo.weight) >= 50 ? 'Eligible' : 'Too Low'}
                    </AdminChip>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h4 className="text-lg font-semibold mb-4">Blood Donation</h4>
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🩸</div>
                <p className="text-lg">Donation in progress...</p>
                <p className="text-slate-400 mt-2">Please ensure donor comfort and monitor vitals.</p>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h4 className="text-lg font-semibold mb-4">Recovery Period</h4>
              <div className="text-center py-8">
                <div className="text-6xl mb-4">☕</div>
                <p className="text-lg">Recovery and refreshments</p>
                <p className="text-slate-400 mt-2">Donor is resting and having refreshments.</p>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h4 className="text-lg font-semibold mb-4">Donation Complete</h4>
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-lg">Thank you for your donation!</p>
                <p className="text-slate-400 mt-2">Donation has been successfully recorded.</p>
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 text-left max-w-md mx-auto">
                  <h5 className="font-medium mb-2">Donation Summary</h5>
                  <div className="text-sm space-y-1">
                    <div>Donor: {donorInfo.name}</div>
                    <div>Blood Group: {donorInfo.bloodGroup}</div>
                    <div>Date: {new Date().toLocaleDateString()}</div>
                    <div>Time: {new Date().toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === (processingAppointment ? 2 : 1)}
            >
              Previous
            </Button>
            <div className="flex gap-2">
              {currentStep < steps.length ? (
                <Button onClick={handleNext}>
                  Next Step
                </Button>
              ) : (
                <Button onClick={handleComplete}>
                  Complete Donation
                </Button>
              )}
            </div>
          </div>
        </AdminCard>
      </div>
    </section>
  );
}
