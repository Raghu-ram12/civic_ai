'use client';

import { useMockDb, Status, Complaint } from '@/context/MockDb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, AlertTriangle, CheckCircle2, Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MapWidget = dynamic(() => import('@/components/Map'), { ssr: false, loading: () => <div className="h-[400px] bg-slate-100 animate-pulse rounded-xl" /> });
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function OfficerDashboard() {
  const { complaints, role, updateComplaint, logout } = useMockDb();
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  
  useEffect(() => {
    if (role !== 'officer') router.push('/officer/login');
  }, [role, router]);

  if (role !== 'officer') return null;

  const visible = filter === 'All' ? complaints : complaints.filter(c => c.status === filter);
  const openCount = complaints.filter(c => c.status !== 'Resolved').length;
  const criticalCount = complaints.filter(c => c.severity === 'High' || c.severity === 'Critical').length;

  const categoryData = complaints.reduce((acc, curr) => {
    const existing = acc.find(x => x.name === curr.category);
    if (existing) existing.count++;
    else acc.push({ name: curr.category, count: 1 });
    return acc;
  }, [] as any[]);

  const statusData = complaints.reduce((acc, curr) => {
    const existing = acc.find(x => x.name === curr.status);
    if (existing) existing.count++;
    else acc.push({ name: curr.status, count: 1 });
    return acc;
  }, [] as any[]);

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
          <div className="flex gap-4">
            <Link href="/officer/profile">
              <Button variant="outline" className="font-bold text-emerald-100 bg-white/10 hover:bg-white/20 border-white/20">
                My Profile
              </Button>
            </Link>
            <Button variant="ghost" className="text-white hover:bg-white/20" onClick={() => { logout(); router.push('/'); }}>
              Sign Out
            </Button>
          </div>
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

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Issues by Category</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Status Overview</h2>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="count">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        <section>
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Live Incident Map</h2>
            <MapWidget complaints={visible} />
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
                    <span className="text-xs font-bold px-2 py-1 rounded-md bg-violet-50 text-violet-700">{c.department}</span>
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
