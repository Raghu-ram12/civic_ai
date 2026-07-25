'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useMockDb, User } from '@/context/MockDb';
import { User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/context/ToastContext';

export default function Register() {
  const router = useRouter();
  const { register } = useMockDb();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
        toast('Account created successfully!', 'success');
        router.push('/dashboard');
      } else {
        toast('Email already exists. Please login instead.', 'error');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        <Link href="/" className="text-sm font-bold text-white/80 hover:text-white flex items-center gap-2 drop-shadow-md">
          &larr; Back to Home
        </Link>
        
        <Card className="glass w-full p-8 border-white/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
          
          <div className="flex flex-col items-center mb-6 relative z-10">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }} className="bg-white/10 p-3 rounded-xl mb-4 shadow-lg shadow-black/5 ring-1 ring-white/20">
              <UserIcon className="text-white w-8 h-8" />
            </motion.div>
            <h2 className="text-3xl font-extrabold text-white drop-shadow-md">Citizen Registration</h2>
            <p className="text-white/80 text-sm mt-1 font-medium">Join SmartCivic</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="space-y-2">
              <Label className="text-white/90 font-semibold drop-shadow-sm">Full Name</Label>
              <Input 
                type="text" 
                required 
                className="h-12 bg-black/10 border-white/20 text-white placeholder:text-white/50 focus:ring-white/50 focus:border-white/50 transition-all" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/90 font-semibold drop-shadow-sm">Email Address</Label>
              <Input 
                type="email" 
                required 
                className="h-12 bg-black/10 border-white/20 text-white placeholder:text-white/50 focus:ring-white/50 focus:border-white/50 transition-all" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/90 font-semibold drop-shadow-sm">Phone Number</Label>
              <Input 
                type="tel" 
                className="h-12 bg-black/10 border-white/20 text-white placeholder:text-white/50 focus:ring-white/50 focus:border-white/50 transition-all" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/90 font-semibold drop-shadow-sm">Password</Label>
              <Input 
                type="password" 
                required 
                className="h-12 bg-black/10 border-white/20 text-white placeholder:text-white/50 focus:ring-white/50 focus:border-white/50 transition-all" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-6">
              <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-bold bg-white text-violet-900 shadow-xl">
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </motion.div>
          </form>

          <div className="mt-6 text-center text-sm text-white/80 font-medium relative z-10">
            Already have an account? <Link href="/" className="font-bold text-white hover:underline hover:text-white/90 drop-shadow-md">Log in</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
