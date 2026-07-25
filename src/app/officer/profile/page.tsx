'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMockDb } from '@/context/MockDb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ShieldCheck, Save, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function OfficerProfile() {
  const router = useRouter();
  const { currentUser, role, updateProfile, logout } = useMockDb();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    badgeNumber: '',
  });

  useEffect(() => {
    if (role !== 'officer' || !currentUser) {
      router.push('/officer/login');
    } else {
      setFormData({
        name: currentUser.name || '',
        department: currentUser.department || 'General',
        badgeNumber: currentUser.badgeNumber || '',
      });
    }
  }, [role, currentUser, router]);

  if (role !== 'officer' || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setTimeout(() => {
      updateProfile({ 
        name: formData.name, 
        department: formData.department,
        badgeNumber: formData.badgeNumber
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
            <div className="bg-emerald-100 p-3 rounded-xl"><ShieldCheck className="w-8 h-8 text-emerald-700" /></div>
            <div>
              <p className="text-sm font-bold tracking-wider text-emerald-600 uppercase">Official Account</p>
              <h1 className="text-2xl font-extrabold text-slate-800">Officer Profile</h1>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/officer/dashboard">
              <Button variant="outline" className="font-bold text-slate-600">Back to Dashboard</Button>
            </Link>
            <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </header>

        <Card className="p-8">
          {success && <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg font-bold mb-6">Profile updated successfully!</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Official Email</Label>
                <Input type="email" disabled value={currentUser.email} className="bg-slate-50 text-slate-500 h-12" />
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
                <Label>Department</Label>
                <select 
                  className="flex h-12 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                >
                  <option>Roads & Infrastructure</option>
                  <option>Electrical</option>
                  <option>Water & Sanitation</option>
                  <option>General</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Badge Number</Label>
                <Input 
                  type="text" 
                  required
                  value={formData.badgeNumber} 
                  onChange={e => setFormData({...formData, badgeNumber: e.target.value})} 
                  className="h-12" 
                />
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 h-12 px-8 text-lg">
                <Save className="w-5 h-5 mr-2" /> {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
