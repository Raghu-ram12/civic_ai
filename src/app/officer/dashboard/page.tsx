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
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  useEffect(() => {
    if (role !== 'officer') router.push('/officer/login');
  }, [role, router]);

  if (role !== 'officer') return null;

  // Helper to determine priority score (Urgent hazards like broken electric wires score highest)
  const getPriorityScore = (c: Complaint) => {
    const cat = (c.category || '').toLowerCase();
    if (cat.includes('wire') || cat.includes('electric') || c.severity === 'Critical') return 4;
    if (cat.includes('pothole') || c.severity === 'High') return 3;
    if (c.severity === 'Medium') return 2;
    return 1;
  };

  // Filter complaints by status and priority deadline
  const filtered = complaints.filter(c => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    let matchesPriority = true;
    if (priorityFilter === 'Urgent Hazard') {
      matchesPriority = c.severity === 'Critical' || (c.category || '').toLowerCase().includes('electric');
    } else if (priorityFilter === 'High Priority') {
      matchesPriority = c.severity === 'High' || (c.category || '').toLowerCase().includes('pothole');
    } else if (priorityFilter === 'Normal Priority') {
      matchesPriority = c.severity === 'Medium' || c.severity === 'Low';
    }
    return matchesStatus && matchesPriority;
  });

  // Always sort filtered list by priority deadline score (most urgent first)
  const visible = [...filtered].sort((a, b) => getPriorityScore(b) - getPriorityScore(a));

  const openCount = complaints.filter(c => c.status !== 'Resolved').length;
  const criticalCount = complaints.filter(c => c.severity === 'High' || c.severity === 'Critical' || (c.category || '').toLowerCase().includes('electric')).length;

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
            <p className="text-sm text-red-700 font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Critical Hazards</p>
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
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border shadow-xs">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Manage Complaints</h2>
              <p className="text-xs text-slate-500 mt-0.5">Filter by status or priority deadline to prioritize high-risk hazards.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <span className="text-xs font-bold text-slate-600 px-2">Status:</span>
                {['All', 'AI Validated', 'Assigned', 'In Progress', 'Resolved'].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      statusFilter === s ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 p-1 rounded-lg">
                <span className="text-xs font-bold text-amber-800 px-2 flex items-center gap-1">⚡ Deadline Priority:</span>
                {[
                  { label: 'All', value: 'All' },
                  { label: '🔥 Urgent (24h)', value: 'Urgent Hazard' },
                  { label: '⚠️ High (48h)', value: 'High Priority' },
                  { label: '🛠️ Normal (72h)', value: 'Normal Priority' },
                ].map(p => (
                  <button 
                    key={p.value} 
                    onClick={() => setPriorityFilter(p.value)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                      priorityFilter === p.value ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y">
            {visible.map(c => {
              const isUrgent = c.severity === 'Critical' || (c.category || '').toLowerCase().includes('electric');
              return (
                <div key={c.id} className={`p-5 flex flex-col sm:flex-row gap-6 items-start sm:items-center ${
                  isUrgent ? 'bg-red-50/40 border-l-4 border-l-red-500' : ''
                }`}>
                  {c.image ? (
                    <img src={c.image} className="w-32 h-24 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-32 h-24 bg-slate-100 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">📌</div>
                  )}
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-500 text-xs">{c.id}</span>
                      <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md ${
                        isUrgent ? 'bg-red-600 text-white animate-pulse' :
                        c.severity === 'High' ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {c.severity} Priority
                      </span>
                      <span className="text-xs font-bold px-2 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ⚡ Est Deadline: {c.estimatedTime || (isUrgent ? '24 Hours (Urgent)' : '48 Hours')}
                      </span>
                      <span className="text-xs font-bold px-2 py-1 rounded-md bg-violet-50 text-violet-700">{c.department}</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">{c.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-1">{c.summary}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {c.location}</p>
                  </div>
                  
                  <div className="flex flex-col gap-2 min-w-[150px]">
                    <span className="text-xs font-bold text-slate-400 uppercase text-center block mb-1">Status: {c.status}</span>
                    {c.status === 'AI Validated' && (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateComplaint(c.id, { status: 'Assigned' })}>Assign Team</Button>
                    )}
                    {c.status === 'Assigned' && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => updateComplaint(c.id, { status: 'In Progress' })}>Start Work</Button>
                    )}
                    {c.status === 'In Progress' && (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={() => updateComplaint(c.id, { status: 'Resolved' })}>Mark Resolved</Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedComplaint(c)}
                      className="border-slate-300 hover:bg-slate-100 font-bold text-slate-700"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
            {visible.length === 0 && (
              <div className="p-12 text-center text-slate-500">No complaints match the selected status or priority filter.</div>
            )}
          </div>
        </section>

      </div>

      {/* View Details Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <span className="text-xs font-extrabold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  {selectedComplaint.id}
                </span>
                <h3 className="font-extrabold text-xl text-slate-800">{selectedComplaint.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedComplaint(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {selectedComplaint.image ? (
                <img src={selectedComplaint.image} alt="Complaint Evidence" className="w-full h-64 object-cover rounded-xl border border-slate-200 shadow-xs" />
              ) : (
                <div className="w-full h-40 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-medium">No Image Provided</div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase block">Category</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedComplaint.category}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase block">Severity</span>
                  <span className={`font-bold text-sm ${selectedComplaint.severity === 'Critical' ? 'text-red-600' : 'text-slate-800'}`}>
                    {selectedComplaint.severity}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase block">Department</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedComplaint.department}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase block">Est Deadline</span>
                  <span className="font-bold text-amber-700 text-sm">
                    {selectedComplaint.estimatedTime || '48 Hours'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Location</h4>
                <p className="text-slate-700 flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                  <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  {selectedComplaint.location}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">AI Issue Summary</h4>
                <p className="text-slate-700 bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-sm">
                  {selectedComplaint.summary}
                </p>
              </div>

              {selectedComplaint.detailedDescription && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Citizen Detailed Description</h4>
                  <p className="text-slate-800 bg-emerald-50/60 p-4 rounded-lg border border-emerald-100 text-sm whitespace-pre-wrap">
                    {selectedComplaint.detailedDescription}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 text-xs text-slate-500 border-t">
                <span>Reported by: <b>{selectedComplaint.citizen}</b></span>
                <span>Date: <b>{selectedComplaint.createdAt}</b></span>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t flex flex-wrap justify-between items-center gap-4 rounded-b-2xl">
              <span className="text-sm font-bold text-slate-600">Current Status: <b className="text-slate-900">{selectedComplaint.status}</b></span>
              <div className="flex gap-2">
                {selectedComplaint.status !== 'Resolved' && (
                  <Button 
                    size="sm" 
                    className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                    onClick={() => {
                      updateComplaint(selectedComplaint.id, { status: 'Resolved' });
                      setSelectedComplaint({ ...selectedComplaint, status: 'Resolved' });
                    }}
                  >
                    Mark as Resolved
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setSelectedComplaint(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
