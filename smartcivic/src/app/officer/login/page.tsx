'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useMockDb } from '@/context/MockDb';
import { ShieldCheck } from 'lucide-react';

export default function OfficerLogin() {
  const router = useRouter();
  const { login } = useMockDb();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login('officer');
      router.push('/officer/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="max-w-md w-full p-8 shadow-xl border-0 ring-1 ring-slate-200">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-600 p-3 rounded-xl mb-4 shadow-lg shadow-emerald-200">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">Officer Portal</h2>
          <p className="text-slate-500 text-sm mt-1">Authorized municipal personnel only</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label>Employee ID</Label>
            <Input type="text" required placeholder="EMP-1234" defaultValue="EMP-1234" className="h-12" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" required defaultValue="password123" className="h-12" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700">
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
