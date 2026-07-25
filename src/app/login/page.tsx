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
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const success = login(email, password, 'citizen');
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Invalid email or password.');
        setLoading(false);
      }
    }, 1000);
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
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-bold mb-4">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="h-12" placeholder="citizen@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="h-12" />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 text-lg bg-violet-600 hover:bg-violet-700">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Don't have an account? <Link href="/register" className="font-bold text-violet-600 hover:underline">Sign up</Link>
        </div>
      </Card>
      </div>
    </div>
  );
}
