'use client';

import { useMockDb, Status, Complaint } from '@/context/MockDb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, AlertTriangle, CheckCircle2, Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function OfficerDashboard() {
  const { complaints, role, updateComplaint } = useMockDb();
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  
  useEffect(() => {
    if (role !== 'officer') router.push('/officer/login');
  }, [role, router]);

  if (role !== 'officer') return null;

  const visible = filter === 'All' ? complaints : complaints.filter(c => c.status === filter);
  const openCount = complaints.filter(c => c.status !== 'Resolved').length;
  const criticalCount = complaints.filter(c => c.severity === 'High' || c.severity === 'Critical').length;

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center bg-emerald-700 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl"><ShieldCheck className="w-8 h-8" /></div>
            <div>
              <p className="text-sm font-bold tracking-wider text-emerald-200 uppercase">Civic Operations Centre</p>
              <h1 className="text-2xl font-extrabold">Officer Dashboard</h1>
            </div>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => router.push('/')}>
            Sign Out
          </Button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5">
            <p className="text-sm text-slate-500 font-semibold">Total Complaints</p>
            <p className="text-3xl font-black text-slate-800">{complaints.length}</p>
          </Card>
          <Card className="p-5 border-l-4 border-l-orange-400">
            <p className="text-sm text-slate-500 font-semibold">Awaiting Action</p>
            <p className="text-3xl font-black text-slate-800">{openCount}</p>
          </Card>
          <Card className="p-5 border-l-4 border-l-emerald-400">
            <p className="text-sm text-slate-500 font-semibold">Resolved</p>
            <p className="text-3xl font-black text-slate-800">{complaints.length - openCount}</p>
          </Card>
          <Card className="p-5 border-l-4 border-l-red-500 bg-red-50">
            <p className="text-sm text-red-700 font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Critical Issues</p>
            <p className="text-3xl font-black text-red-900">{criticalCount}</p>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Manage Complaints</h2>
            <div className="flex gap-2">
              {['All', 'AI Validated', 'Assigned', 'In Progress', 'Resolved'].map(f => (
                <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
                  {f}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y">
            {visible.map(c => (
              <div key={c.id} className="p-5 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                {c.image ? (
                  <img src={c.image} className="w-32 h-24 object-cover rounded-lg" />
                ) : (
                  <div className="w-32 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-3xl">📌</div>
                )}
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 text-xs">{c.id}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                      c.severity === 'Critical' || c.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {c.severity} Priority
                    </span>
                    <span className="text-xs font-bold px-2 py-1 rounded-md bg-blue-50 text-blue-700">{c.department}</span>
                  </div>
                  <h3 className="font-bold text-lg">{c.title}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin className="w-4 h-4" /> {c.location}</p>
                </div>
                
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <span className="text-xs font-bold text-slate-400 uppercase text-center block mb-1">Status: {c.status}</span>
                  {c.status === 'AI Validated' && (
                    <Button size="sm" onClick={() => updateComplaint(c.id, { status: 'Assigned' })}>Assign Team</Button>
                  )}
                  {c.status === 'Assigned' && (
                    <Button size="sm" onClick={() => updateComplaint(c.id, { status: 'In Progress' })}>Start Work</Button>
                  )}
                  {c.status === 'In Progress' && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateComplaint(c.id, { status: 'Resolved' })}>Mark Resolved</Button>
                  )}
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
            ))}
            {visible.length === 0 && (
              <div className="p-8 text-center text-slate-500">No complaints found.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
