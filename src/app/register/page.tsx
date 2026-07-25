'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useMockDb, User } from '@/context/MockDb';
import { Activity } from 'lucide-react';

export default function CitizenRegister() {
  const router = useRouter();
  const { register } = useMockDb();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const newUser: User = {
        id: 'user-' + Date.now(),
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'citizen',
      };
      
      const success = register(newUser);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Email already exists. Please login instead.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-4">
        <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-2">
          &larr; Back to Home
        </Link>
        <Card className="w-full p-8 shadow-xl border-0 ring-1 ring-slate-200">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-violet-600 p-3 rounded-xl mb-4 shadow-lg shadow-violet-200">
              <Activity className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">Create Account</h2>
            <p className="text-slate-500 mt-2">Join SmartCivic to report issues.</p>
          </div>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-bold mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input 
                type="text" 
                required 
                className="h-12" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input 
                type="email" 
                required 
                className="h-12" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input 
                type="tel" 
                className="h-12" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input 
                type="password" 
                required 
                className="h-12" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 text-lg bg-violet-600 hover:bg-violet-700 mt-6">
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Already have an account? <Link href="/login" className="font-bold text-violet-600 hover:underline">Log in</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
