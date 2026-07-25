'use client';

import { useMockDb } from '@/context/MockDb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Clock, Plus, MapPin } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CitizenDashboard() {
  const { complaints, role } = useMockDb();
  const router = useRouter();
  
  useEffect(() => {
    if (role !== 'citizen') router.push('/login');
  }, [role, router]);

  if (role !== 'citizen') return null;

  const myComplaints = complaints.filter(c => c.citizen === 'Citizen User' || c.citizen === 'Aarav Mehta');
  const resolvedCount = myComplaints.filter(c => c.status === 'Resolved').length;
  const pendingCount = myComplaints.filter(c => c.status !== 'Resolved').length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-sm font-bold tracking-wider text-violet-600 uppercase">Citizen Dashboard</p>
            <h1 className="text-3xl font-extrabold text-slate-800">Welcome back, Citizen</h1>
          </div>
          <Link href="/report">
            <Button className="bg-violet-600 hover:bg-violet-700 text-white font-bold gap-2">
              <Plus className="w-5 h-5" /> Report Issue
            </Button>
          </Link>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex items-center gap-4 border-l-4 border-l-slate-400">
            <div className="bg-slate-100 p-3 rounded-xl"><Clock className="text-slate-600" /></div>
            <div>
              <p className="text-sm text-slate-500 font-semibold">Total Reports</p>
              <p className="text-3xl font-black text-slate-800">{myComplaints.length}</p>
            </div>
          </Card>
          <Card className="p-6 flex items-center gap-4 border-l-4 border-l-orange-400">
            <div className="bg-orange-50 p-3 rounded-xl"><AlertCircle className="text-orange-600" /></div>
            <div>
              <p className="text-sm text-slate-500 font-semibold">In Progress</p>
              <p className="text-3xl font-black text-slate-800">{pendingCount}</p>
            </div>
          </Card>
          <Card className="p-6 flex items-center gap-4 border-l-4 border-l-emerald-400">
            <div className="bg-emerald-50 p-3 rounded-xl"><CheckCircle2 className="text-emerald-600" /></div>
            <div>
              <p className="text-sm text-slate-500 font-semibold">Resolved</p>
              <p className="text-3xl font-black text-slate-800">{resolvedCount}</p>
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Recent Complaints</h2>
          {myComplaints.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500">You haven't reported any issues yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {myComplaints.map(c => (
                <Card key={c.id} className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  {c.image && (
                    <img src={c.image} alt="Issue" className="w-24 h-24 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">{c.id}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                        c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
                        c.status === 'In Progress' ? 'bg-violet-100 text-violet-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">{c.title}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {c.location}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Link href={`/track?id=${c.id}`}>
                      <Button variant="outline" size="sm">View Status</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
