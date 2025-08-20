'use client';

import { useState, useEffect } from 'react';
import AdminCard from './AdminCard';
import AdminChip from './AdminChip';
import AdminTable from './AdminTable';
import Button from '@/components/ui/Button';
import { getStatusVariant } from '@/lib/utils/statusColors';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export default function InventoryTab() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Load inventory from localStorage or create mock data
    const stored = JSON.parse(localStorage.getItem('lifedrop_units') || '[]');

    if (stored.length === 0) {
      // Create mock inventory
      const mockInventory = [
        { id: '1', group: 'O+', units: 25, expiry: '2024-03-15', location: 'Main Storage', status: 'available' },
        { id: '2', group: 'O-', units: 12, expiry: '2024-03-10', location: 'Main Storage', status: 'available' },
        { id: '3', group: 'A+', units: 18, expiry: '2024-03-20', location: 'Main Storage', status: 'available' },
        { id: '4', group: 'A-', units: 8, expiry: '2024-03-08', location: 'Main Storage', status: 'expiring' },
        { id: '5', group: 'B+', units: 15, expiry: '2024-03-25', location: 'Main Storage', status: 'available' },
        { id: '6', group: 'B-', units: 6, expiry: '2024-03-12', location: 'Main Storage', status: 'available' },
        { id: '7', group: 'AB+', units: 10, expiry: '2024-03-18', location: 'Main Storage', status: 'available' },
        { id: '8', group: 'AB-', units: 4, expiry: '2024-03-22', location: 'Main Storage', status: 'available' }
      ];
      setInventory(mockInventory);
      localStorage.setItem('lifedrop_units', JSON.stringify(mockInventory));
    } else {
      setInventory(stored);
    }
  }, []);

  const handleAddUnit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const newUnit = {
      id: Date.now().toString(),
      group: formData.get('group'),
      units: parseInt(formData.get('units') as string),
      expiry: formData.get('expiry'),
      location: formData.get('location'),
      status: 'available'
    };

    const updatedInventory = [...inventory, newUnit];
    setInventory(updatedInventory);
    localStorage.setItem('lifedrop_units', JSON.stringify(updatedInventory));
    setShowAddForm(false);
    (e.target as HTMLFormElement).reset();
  };

  const updateUnitStatus = (id: string, newStatus: string) => {
    const updatedInventory = inventory.map(unit =>
      unit.id === id ? { ...unit, status: newStatus } : unit
    );
    setInventory(updatedInventory);
    localStorage.setItem('lifedrop_units', JSON.stringify(updatedInventory));
  };



  const getTotalByGroup = () => {
    const totals: Record<string, number> = {};
    inventory.forEach(unit => {
      if (unit.status === 'available') {
        totals[unit.group] = (totals[unit.group] || 0) + unit.units;
      }
    });
    return totals;
  };

  const totals = getTotalByGroup();
  const totalUnits = Object.values(totals).reduce((sum, count) => sum + count, 0);

  return (
    <section className="mt-6">
      <div className="grid gap-6">
        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminCard className="p-5">
            <p className="text-sm text-slate-400">Total Units</p>
            <p className="mt-1 text-2xl font-extrabold">{totalUnits}</p>
          </AdminCard>
          <AdminCard className="p-5">
            <p className="text-sm text-slate-400">Available Groups</p>
            <p className="mt-1 text-2xl font-extrabold">{Object.keys(totals).length}</p>
          </AdminCard>
          <AdminCard className="p-5">
            <p className="text-sm text-slate-400">Expiring Soon</p>
            <p className="mt-1 text-2xl font-extrabold">
              {inventory.filter(u => u.status === 'expiring').length}
            </p>
          </AdminCard>
          <AdminCard className="p-5">
            <p className="text-sm text-slate-400">Low Stock</p>
            <p className="mt-1 text-2xl font-extrabold">
              {Object.values(totals).filter(count => count < 10).length}
            </p>
          </AdminCard>
        </div>

        {/* Blood Group Summary */}
        <AdminCard className="p-5">
          <h3 className="font-semibold mb-4">Blood Group Availability</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(group => (
              <div key={group} className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="text-lg font-bold">{totals[group] || 0}</div>
                <div className="text-sm text-slate-400">{group}</div>
                <AdminChip
                  variant={(totals[group] || 0) < 10 ? 'warning' : 'success'}
                  className="mt-1"
                >
                  {(totals[group] || 0) < 10 ? 'Low' : 'OK'}
                </AdminChip>
              </div>
            ))}
          </div>
        </AdminCard>

        {/* Actions */}
        <AdminCard className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Inventory Management</h3>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? 'Cancel' : 'Add Units'}
            </Button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddUnit} className="mt-4 grid sm:grid-cols-5 gap-3">
              <Select name="group" required>
                <option value="">Blood Group</option>
                <option>O+</option>
                <option>O-</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
              </Select>
              <Input name="units" type="number" placeholder="Units" min="1" required />
              <Input name="expiry" type="date" required />
              <Input name="location" placeholder="Storage Location" required />
              <Button type="submit">Add</Button>
            </form>
          )}
        </AdminCard>

        {/* Inventory Table */}
        <AdminCard className="overflow-hidden">
          <AdminTable headers={['Blood Group', 'Units', 'Expiry Date', 'Location', 'Status', 'Actions']}>
            {inventory.map((unit) => {
              const expiryDate = new Date(unit.expiry);
              const isExpiringSoon = expiryDate.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

              return (
                <tr key={unit.id}>
                  <td className="px-4 py-3">
                    <AdminChip variant="info">{unit.group}</AdminChip>
                  </td>
                  <td className="px-4 py-3 font-medium">{unit.units}</td>
                  <td className="px-4 py-3">
                    <div className={isExpiringSoon ? 'text-amber-400' : ''}>
                      {expiryDate.toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{unit.location}</td>
                  <td className="px-4 py-3">
                    <AdminChip variant={getStatusVariant(unit.status)}>
                      {unit.status}
                    </AdminChip>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {unit.status === 'available' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateUnitStatus(unit.id, 'used')}
                        >
                          Use
                        </Button>
                      )}
                      {unit.status === 'expiring' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateUnitStatus(unit.id, 'expired')}
                        >
                          Mark Expired
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </AdminTable>
        </AdminCard>
      </div>
    </section>
  );
}
