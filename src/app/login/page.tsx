'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useMockDb } from '@/context/MockDb';
import { Activity } from 'lucide-react';

export default function CitizenLogin() {
  const router = useRouter();
  const { login } = useMockDb();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      login('citizen');
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-4">
        <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-2">
          &larr; Back to Home
        </Link>
        <Card className="w-full p-8 shadow-xl border-0 ring-1 ring-slate-200">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-violet-600 p-3 rounded-xl mb-4 shadow-lg shadow-violet-200">
            <Activity className="text-white w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800">Citizen Portal</h2>
          <p className="text-slate-500 text-sm mt-1">Sign in to report and track issues</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" required placeholder="citizen@example.com" defaultValue="citizen@example.com" className="h-12" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" required defaultValue="password123" className="h-12" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 text-lg bg-violet-600 hover:bg-violet-700">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
