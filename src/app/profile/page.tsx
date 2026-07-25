'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMockDb } from '@/context/MockDb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { UserCircle, Save, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function CitizenProfile() {
  const router = useRouter();
  const { currentUser, role, updateProfile, logout, getOfficerInCharge } = useMockDb();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    wardNumber: '',
    locality: '',
    cityOrVillage: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (role !== 'citizen' || !currentUser) {
      router.push('/login');
    } else {
      setFormData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        wardNumber: currentUser.wardNumber || 'Ward 12',
        locality: currentUser.locality || '',
        cityOrVillage: currentUser.cityOrVillage || '',
        state: currentUser.state || '',
        pincode: currentUser.pincode || '',
      });
    }
  }, [role, currentUser, router]);

  if (role !== 'citizen' || !currentUser) return null;

  const officerInCharge = getOfficerInCharge(formData.wardNumber || 'Ward 12');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setTimeout(() => {
      updateProfile({ 
        name: formData.name, 
        phone: formData.phone,
        wardNumber: formData.wardNumber,
        locality: formData.locality,
        cityOrVillage: formData.cityOrVillage,
        state: formData.state,
        pincode: formData.pincode,
      });
      setSuccess(true);
      setLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-violet-100 p-3 rounded-xl"><UserCircle className="w-8 h-8 text-violet-600" /></div>
            <div>
              <p className="text-sm font-bold tracking-wider text-violet-600 uppercase">Citizen Account</p>
              <h1 className="text-2xl font-extrabold text-slate-800">My Profile</h1>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="outline" className="font-bold text-slate-600">Back to Dashboard</Button>
            </Link>
            <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </header>

        {/* Officer in Charge Info Card */}
        <Card className="p-6 bg-gradient-to-r from-emerald-900 to-teal-800 text-white border-0 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-400/20 text-emerald-300 font-extrabold px-3 py-1 rounded-full text-xs uppercase tracking-wider border border-emerald-400/30">
                  Municipal Officer In-Charge
                </span>
                <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-md">
                  {formData.wardNumber || 'Ward 12'}
                </span>
              </div>
              <h2 className="text-xl font-black">{officerInCharge.name}</h2>
              <p className="text-emerald-100 text-sm">{officerInCharge.department}</p>
              <p className="text-xs text-emerald-200/80 mt-1">Direct Contact: <b>{officerInCharge.phone || '+91 98765 43210'}</b> | Email: <b>{officerInCharge.email}</b></p>
            </div>
            <div className="bg-white/10 p-3.5 rounded-xl border border-white/20 text-center flex-shrink-0">
              <span className="text-xs text-emerald-200 block uppercase font-bold">Assigned Zone</span>
              <span className="text-sm font-extrabold">{officerInCharge.locality || 'Central Zone'}</span>
            </div>
          </div>
        </Card>

        <Card className="p-8">
          {success && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg font-bold mb-6">Profile updated successfully!</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input type="email" disabled value={currentUser.email} className="bg-slate-50 text-slate-500 h-12" />
                <p className="text-xs text-slate-400">Email cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Input type="text" disabled value="Citizen" className="bg-slate-50 text-slate-500 h-12" />
              </div>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="h-12" 
                />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input 
                  type="tel" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  className="h-12" 
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <h2 className="text-lg font-bold text-slate-800 border-b pb-2 pt-4">Location & Ward Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Ward Number / Sector</Label>
                <Input 
                  type="text" 
                  placeholder="e.g. Ward 12"
                  value={formData.wardNumber} 
                  onChange={e => setFormData({...formData, wardNumber: e.target.value})} 
                  className="h-12" 
                />
                <p className="text-xs text-slate-400">Determines your assigned Ward Municipal Officer.</p>
              </div>
              <div className="space-y-2">
                <Label>Locality / Colony / Area</Label>
                <Input 
                  type="text" 
                  placeholder="e.g. Indiranagar 2nd Stage"
                  value={formData.locality} 
                  onChange={e => setFormData({...formData, locality: e.target.value})} 
                  className="h-12" 
                />
              </div>
              <div className="space-y-2">
                <Label>City or Village</Label>
                <Input 
                  type="text" 
                  placeholder="e.g. Bangalore"
                  value={formData.cityOrVillage} 
                  onChange={e => setFormData({...formData, cityOrVillage: e.target.value})} 
                  className="h-12" 
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input 
                  type="text" 
                  placeholder="e.g. Karnataka"
                  value={formData.state} 
                  onChange={e => setFormData({...formData, state: e.target.value})} 
                  className="h-12" 
                />
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input 
                  type="text" 
                  placeholder="e.g. 560038"
                  value={formData.pincode} 
                  onChange={e => setFormData({...formData, pincode: e.target.value})} 
                  className="h-12" 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-700 h-12 px-8 text-lg">
                <Save className="w-5 h-5 mr-2" /> {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
