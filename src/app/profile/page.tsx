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
import { motion } from 'framer-motion';
import { useToast } from '@/context/ToastContext';

export default function CitizenProfile() {
  const router = useRouter();
  const { currentUser, role, updateProfile, logout } = useMockDb();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    locality: '',
    cityOrVillage: '',
    state: '',
    pincode: '',
    wardNumber: '',
  });

  useEffect(() => {
    if (role !== 'citizen' || !currentUser) {
      router.push('/');
    } else {
      setFormData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        locality: currentUser.locality || '',
        cityOrVillage: currentUser.cityOrVillage || '',
        state: currentUser.state || '',
        pincode: currentUser.pincode || '',
        wardNumber: currentUser.wardNumber || '',
      });
    }
  }, [role, currentUser, router]);

  if (role !== 'citizen' || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      updateProfile({ 
        name: formData.name, 
        phone: formData.phone,
        locality: formData.locality,
        cityOrVillage: formData.cityOrVillage,
        state: formData.state,
        pincode: formData.pincode,
        wardNumber: formData.wardNumber
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
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto space-y-8 relative z-10"
      >
        <header className="glass flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-3xl border-white/20 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl ring-1 ring-white/30 backdrop-blur-sm"><UserCircle className="w-8 h-8 text-white drop-shadow-md" /></div>
            <div>
              <p className="text-sm font-bold tracking-widest text-white/70 uppercase">Citizen Account</p>
              <h1 className="text-3xl font-extrabold drop-shadow-md">My Profile</h1>
            </div>
          </div>
          <div className="flex gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => router.push('/dashboard')} variant="outline" className="glass bg-white/10 hover:bg-white/20 border-white/30 font-bold transition-all shadow-md">Back to Dashboard</Button>
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
                <Label className="text-white/70 uppercase font-bold tracking-widest text-xs">Email Address</Label>
                <Input type="email" disabled value={currentUser.email} className="bg-white/5 border-white/10 text-white/50 h-14" />
                <p className="text-xs text-white/40 font-medium">Email cannot be changed.</p>
              </div>
              <div className="space-y-3">
                <Label className="text-white/70 uppercase font-bold tracking-widest text-xs">Account Type</Label>
                <Input type="text" disabled value="Citizen" className="bg-white/5 border-white/10 text-white/50 h-14" />
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
                <Label className="text-white/90 uppercase font-bold tracking-widest text-xs drop-shadow-sm">Phone Number</Label>
                <Input 
                  type="tel" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  className="h-14 bg-black/20 border-white/20 text-white focus-visible:ring-white/50 transition-all" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-white/90 uppercase font-bold tracking-widest text-xs drop-shadow-sm">Ward Number</Label>
                <Input 
                  type="text" 
                  value={formData.wardNumber} 
                  onChange={e => setFormData({...formData, wardNumber: e.target.value})} 
                  className="h-14 bg-black/20 border-white/20 text-white focus-visible:ring-white/50 transition-all" 
                />
              </div>
              <div className="space-y-3">
                <Label className="text-white/90 uppercase font-bold tracking-widest text-xs drop-shadow-sm">Locality</Label>
                <Input 
                  type="text" 
                  value={formData.locality} 
                  onChange={e => setFormData({...formData, locality: e.target.value})} 
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
                <Button type="submit" disabled={loading} className="bg-white text-violet-900 font-extrabold shadow-xl rounded-xl h-14 px-10 text-lg">
                  <Save className="w-5 h-5 mr-2" /> {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </motion.div>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
