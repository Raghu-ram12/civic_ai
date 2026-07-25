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
import { motion } from 'framer-motion';
import { useToast } from '@/context/ToastContext';

export default function OfficerProfile() {
  const router = useRouter();
  const { currentUser, role, updateProfile, logout } = useMockDb();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    wardNumber: '',
    cityOrVillage: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (role !== 'officer' || !currentUser) {
      router.push('/');
    } else {
      setFormData({
        name: currentUser.name || '',
        department: currentUser.department || 'General',
        wardNumber: currentUser.wardNumber || '',
        cityOrVillage: currentUser.cityOrVillage || '',
        state: currentUser.state || '',
        pincode: currentUser.pincode || '',
      });
    }
  }, [role, currentUser, router]);

  if (role !== 'officer' || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      updateProfile({ 
        name: formData.name, 
        department: formData.department,
        wardNumber: formData.wardNumber,
        cityOrVillage: formData.cityOrVillage,
        state: formData.state,
        pincode: formData.pincode
      });
      toast('Profile updated successfully!', 'success');
      setLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen text-white font-sans p-6 relative overflow-hidden">
      <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto space-y-8 relative z-10"
      >
        <header className="glass flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-3xl border-white/20 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl ring-1 ring-white/30 backdrop-blur-sm"><ShieldCheck className="w-8 h-8 text-white drop-shadow-md" /></div>
            <div>
              <p className="text-sm font-bold tracking-widest text-white/70 uppercase">Official Account</p>
              <h1 className="text-3xl font-extrabold drop-shadow-md">Officer Profile</h1>
            </div>
          </div>
          <div className="flex gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => router.push('/officer/dashboard')} variant="outline" className="glass bg-white/10 hover:bg-white/20 border-white/30 font-bold transition-all shadow-md">Back to Dashboard</Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" className="glass bg-red-500/20 border-red-500/30 text-white hover:bg-red-500/40 hover:text-white transition-all shadow-md" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </motion.div>
          </div>
        </header>

        <Card className="glass p-8 border-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-white/70 uppercase font-bold tracking-widest text-xs">Official Email</Label>
                <Input type="email" disabled value={currentUser.email} className="bg-white/5 border-white/10 text-white/50 h-14" />
              </div>
              <div className="space-y-3">
                <Label className="text-white/90 uppercase font-bold tracking-widest text-xs drop-shadow-sm">Full Name</Label>
                <Input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="h-14 bg-black/20 border-white/20 text-white focus-visible:ring-white/50 transition-all" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-white/90 uppercase font-bold tracking-widest text-xs drop-shadow-sm">Department</Label>
                <select 
                  className="flex h-14 w-full rounded-md border border-white/20 bg-black/20 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value})}
                >
                  <option className="bg-slate-800">Roads & Infrastructure</option>
                  <option className="bg-slate-800">Electrical</option>
                  <option className="bg-slate-800">Water & Sanitation</option>
                  <option className="bg-slate-800">General</option>
                </select>
              </div>
              <div className="space-y-3">
                <Label className="text-white/90 uppercase font-bold tracking-widest text-xs drop-shadow-sm">Ward Number</Label>
                <Input 
                  type="text" 
                  required
                  value={formData.wardNumber} 
                  onChange={e => setFormData({...formData, wardNumber: e.target.value})} 
                  className="h-14 bg-black/20 border-white/20 text-white focus-visible:ring-white/50 transition-all" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-white/90 uppercase font-bold tracking-widest text-xs drop-shadow-sm">City / Village</Label>
                <Input 
                  type="text" 
                  value={formData.cityOrVillage} 
                  onChange={e => setFormData({...formData, cityOrVillage: e.target.value})} 
                  className="h-14 bg-black/20 border-white/20 text-white focus-visible:ring-white/50 transition-all" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-white/90 uppercase font-bold tracking-widest text-xs drop-shadow-sm">State</Label>
                <Input 
                  type="text" 
                  value={formData.state} 
                  onChange={e => setFormData({...formData, state: e.target.value})} 
                  className="h-14 bg-black/20 border-white/20 text-white focus-visible:ring-white/50 transition-all" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-white/90 uppercase font-bold tracking-widest text-xs drop-shadow-sm">Pincode</Label>
                <Input 
                  type="text" 
                  value={formData.pincode} 
                  onChange={e => setFormData({...formData, pincode: e.target.value})} 
                  className="h-14 bg-black/20 border-white/20 text-white focus-visible:ring-white/50 transition-all" 
                />
              </div>
            </div>
            <div className="pt-6 border-t border-white/10 flex justify-end">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" disabled={loading} className="bg-white text-emerald-900 font-extrabold shadow-xl rounded-xl h-14 px-10 text-lg">
                  <Save className="w-5 h-5 mr-2" /> {loading ? 'Saving...' : 'Save Profile'}
                </Button>
              </motion.div>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
