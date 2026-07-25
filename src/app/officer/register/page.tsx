'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useMockDb, User } from '@/context/MockDb';
import { ShieldCheck } from 'lucide-react';

export default function OfficerRegister() {
  const router = useRouter();
  const { register } = useMockDb();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'General',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const newUser: User = {
        id: 'officer-' + Date.now(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        role: 'officer',
      };
      
      const success = register(newUser);
      if (success) {
        router.push('/officer/dashboard');
      } else {
        setError('Email already exists. Please login instead.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen text-white font-sans p-4 flex items-center justify-center relative py-12">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <Link href="/" className="text-sm font-bold text-white/80 hover:text-white flex items-center gap-2 drop-shadow-md">
          &larr; Back to Home
        </Link>
        
        <Card className="glass w-full p-8 border-white/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-white/20 rounded-full blur-3xl -z-10" />
          
          <div className="flex flex-col items-center mb-8 relative z-10">
            <div className="bg-white/20 p-3 rounded-2xl mb-4 shadow-inner ring-1 ring-white/30 backdrop-blur-sm">
              <ShieldCheck className="text-white w-8 h-8 drop-shadow-md" />
            </div>
            <h2 className="text-3xl font-extrabold text-white drop-shadow-md text-center">Officer Registration</h2>
            <p className="text-white/80 text-sm mt-1 font-medium tracking-wide">Create your official civic account.</p>
          </div>
          
          {error && <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-xl text-sm font-bold mb-6 shadow-lg backdrop-blur-md flex items-center gap-2">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-3">
              <Label className="text-white/90 font-bold uppercase tracking-widest text-xs drop-shadow-sm">Full Name</Label>
              <Input 
                type="text" 
                required 
                className="h-14 bg-black/20 border-white/20 text-white focus:ring-white/50 focus:border-white/50 transition-all shadow-inner" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-white/90 font-bold uppercase tracking-widest text-xs drop-shadow-sm">Official Email</Label>
              <Input 
                type="email" 
                required 
                className="h-14 bg-black/20 border-white/20 text-white focus:ring-white/50 focus:border-white/50 transition-all shadow-inner" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-white/90 font-bold uppercase tracking-widest text-xs drop-shadow-sm">Department</Label>
              <select 
                className="flex h-14 w-full rounded-md border border-white/20 bg-black/20 px-3 py-1 text-sm shadow-inner transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 text-white"
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
              <Label className="text-white/90 font-bold uppercase tracking-widest text-xs drop-shadow-sm">Password</Label>
              <Input 
                type="password" 
                required 
                className="h-14 bg-black/20 border-white/20 text-white focus:ring-white/50 focus:border-white/50 transition-all shadow-inner" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-extrabold bg-white text-emerald-900 hover:bg-white/90 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl rounded-xl mt-4">
              {loading ? 'Creating Account...' : 'Register as Officer'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-white/80 font-medium relative z-10">
            Already have an account? <Link href="/" className="font-bold text-white hover:underline hover:text-white/90 drop-shadow-md">Log in</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
