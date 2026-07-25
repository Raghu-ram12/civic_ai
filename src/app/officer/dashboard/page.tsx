'use client';

import { useMockDb, Status, Complaint } from '@/context/MockDb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, Zap, MapPin, Layers, BarChart2, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';
import dynamic from 'next/dynamic';

const MapWidget = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-[400px] glass animate-pulse rounded-xl" />,
});

// ── Colour palette ──────────────────────────────────────────────────────────
const DEPT_COLORS: Record<string, string> = {
  'Electrical & Power Services':      '#facc15',
  'Roads & Traffic Infrastructure':   '#fb923c',
  'Water Supply & Drainage':          '#38bdf8',
  'Sanitation & Waste Management':    '#4ade80',
  'Parks & Horticulture':             '#a78bfa',
  'Public Health & Disease Control':  '#f472b6',
  General:                            '#94a3b8',
};

const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#ef4444',
  High:     '#f97316',
  Medium:   '#facc15',
  Low:      '#34d399',
};

const STATUS_META: Record<string, { color: string; icon: string }> = {
  'Submitted':    { color: '#64748b', icon: '📥' },
  'AI Validated': { color: '#818cf8', icon: '🤖' },
  'Assigned':     { color: '#38bdf8', icon: '👷' },
  'In Progress':  { color: '#fb923c', icon: '🔧' },
  'Resolved':     { color: '#34d399', icon: '✅' },
  'Rejected':     { color: '#f87171', icon: '❌' },
};

const FILTER_OPTIONS = ['All', 'By Department', 'Critical Only', 'Deadlines / Priority', 'AI Validated', 'In Progress', 'Resolved'];

// ── Tiny legend pill ────────────────────────────────────────────────────────
function Pill({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-white font-bold">
      <span className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white/20" style={{ background: color }} />
      {label}
    </span>
  );
}

// ── Custom tooltip ───────────────────────────────────────────────────────────
const GlassTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(6,3,20,0.95)', border: '1px solid rgba(255,255,255,0.25)' }}
      className="px-4 py-3 rounded-xl text-xs text-white shadow-2xl">
      <p className="font-extrabold text-white mb-1.5 text-sm">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2 font-bold" style={{ color: p.fill || p.color }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.fill || p.color }} />
          {p.name ?? p.dataKey}: <span className="text-white ml-1">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function OfficerDashboard() {
  const { complaints, role, updateComplaint, logout } = useMockDb();
  const router = useRouter();
  const { toast } = useToast();
  const [filter, setFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState<string | null>(null);

  useEffect(() => {
    if (role !== 'officer') router.push('/');
  }, [role, router]);

  if (role !== 'officer') return null;

  // ── Derived counts ─────────────────────────────────────────────────────
  const total        = complaints.length;
  const resolved     = complaints.filter(c => c.status === 'Resolved').length;
  const open         = total - resolved;
  const criticalHigh = complaints.filter(c => c.severity === 'Critical' || c.severity === 'High').length;
  const inProgress   = complaints.filter(c => c.status === 'In Progress').length;

  // ── Auto-categorisation by department ─────────────────────────────────
  const deptMap = complaints.reduce((acc, c) => {
    const dept = c.department || 'General';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(c);
    return acc;
  }, {} as Record<string, Complaint[]>);

  const deptChartData = Object.entries(deptMap).map(([name, items]) => ({
    name: name.split(' ')[0],           // short label
    fullName: name,
    total: items.length,
    resolved: items.filter(c => c.status === 'Resolved').length,
    open: items.filter(c => c.status !== 'Resolved').length,
    critical: items.filter(c => c.severity === 'Critical' || c.severity === 'High').length,
  }));

  // ── Severity distribution ──────────────────────────────────────────────
  const severityData = (['Critical', 'High', 'Medium', 'Low'] as const).map(sev => ({
    name: sev,
    value: complaints.filter(c => c.severity === sev).length,
    fill: SEVERITY_COLORS[sev],
  })).filter(d => d.value > 0);

  // ── Status pipeline ────────────────────────────────────────────────────
  const statusData = Object.keys(STATUS_META).map(s => ({
    name: s,
    value: complaints.filter(c => c.status === s).length,
    ...STATUS_META[s],
  })).filter(d => d.value > 0);

  // ── Category auto-breakdown ────────────────────────────────────────────
  const categoryData = complaints.reduce((acc, c) => {
    const ex = acc.find(x => x.name === c.category);
    if (ex) ex.count++;
    else acc.push({ name: c.category, count: 1, dept: c.department });
    return acc;
  }, [] as { name: string; count: number; dept: string }[]).sort((a, b) => b.count - a.count);

  // ── Visible complaints based on active filter ──────────────────────────
  const getVisible = (): Complaint[] => {
    if (filter === 'By Department' && deptFilter) {
      return complaints.filter(c => c.department === deptFilter);
    }
    if (filter === 'By Department') {
      return complaints;
    }
    if (filter === 'Critical Only') {
      return complaints.filter(c => c.severity === 'Critical' || c.severity === 'High');
    }
    if (filter === 'Deadlines / Priority') {
      const score = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      return [...complaints]
        .filter(c => c.status !== 'Resolved')
        .sort((a, b) => (score[b.severity as keyof typeof score] || 0) - (score[a.severity as keyof typeof score] || 0));
    }
    if (filter === 'All') return complaints;
    return complaints.filter(c => c.status === filter);
  };

  const visible = getVisible();

  const handleUpdateStatus = (id: string, status: Status) => {
    updateComplaint(id, { status });
    toast(`Complaint ${id} marked as ${status}`, 'success');
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 } }),
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  };

  return (
    <div className="min-h-screen text-white font-sans p-6 relative overflow-hidden">
      <div className="absolute top-1/3 -right-1/4 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-black/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-8 relative z-10"
      >
        {/* ── Header ── */}
        <header className="glass flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-3xl border-white/20 shadow-xl gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl ring-1 ring-white/30 backdrop-blur-sm">
              <ShieldCheck className="w-8 h-8 drop-shadow-md" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-widest text-white/70 uppercase">Civic Operations Centre</p>
              <h1 className="text-2xl md:text-3xl font-extrabold drop-shadow-md">Officer Dashboard</h1>
            </div>
          </div>
          <div className="flex gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => router.push('/officer/profile')} variant="outline" className="glass bg-white/10 hover:bg-white/20 border-white/30 font-bold shadow-md">
                My Profile
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" className="glass bg-red-500/20 border-red-500/30 text-white hover:bg-red-500/40 hover:text-white shadow-md" onClick={() => { logout(); router.push('/'); }}>
                Sign Out
              </Button>
            </motion.div>
          </div>
        </header>

        {/* ── KPI Cards ── */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Complaints', value: total,        icon: <Layers className="w-5 h-5" />,       border: 'border-l-4 border-l-white/60',    color: 'text-white' },
            { label: 'Open / Awaiting',  value: open,         icon: <Clock className="w-5 h-5" />,        border: 'border-l-4 border-l-orange-400',  color: 'text-orange-300' },
            { label: 'In Progress',      value: inProgress,   icon: <TrendingUp className="w-5 h-5" />,   border: 'border-l-4 border-l-sky-400',     color: 'text-sky-300' },
            { label: 'Resolved',         value: resolved,     icon: <CheckCircle2 className="w-5 h-5" />, border: 'border-l-4 border-l-emerald-400', color: 'text-emerald-300' },
            { label: 'Critical / High',  value: criticalHigh, icon: <AlertTriangle className="w-5 h-5" />, border: 'border-l-4 border-l-red-500',    color: 'text-red-300' },
          ].map((s, i) => (
            <motion.div key={i} custom={i} variants={cardVariants} initial="hidden" animate="show" whileHover={{ y: -4 }}>
              <Card className={`glass-card p-5 border-white/20 shadow-lg ${s.border} hover:brightness-110 transition-all h-full`}>
                <p className="text-xs font-bold uppercase tracking-widest text-white/80 flex items-center gap-1.5 mb-3">
                  <span className={s.color}>{s.icon}</span> {s.label}
                </p>
                <p className={`text-4xl font-black drop-shadow-md ${s.color}`}>{s.value}</p>
              </Card>
            </motion.div>
          ))}
        </section>

        {/* ── Analytics Row ── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Department Breakdown — stacked bar */}
          <Card className="glass-card p-6 border-white/25 shadow-2xl lg:col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <BarChart2 className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white">Complaints by Department</h2>
            </div>
            <p className="text-xs text-white/70 font-semibold mb-4">Auto-categorised from complaint data · click a bar to filter below</p>
            <div className="flex flex-wrap gap-3 mb-4">
              {Object.entries(DEPT_COLORS).map(([dept, color]) =>
                deptChartData.find(d => d.fullName === dept) ? (
                  <Pill key={dept} color={color} label={dept.split(' ')[0]} />
                ) : null
              )}
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData} barSize={28}
                  onClick={(d: any) => {
                    if (!d?.activePayload) return;
                    const full = deptChartData.find(x => x.name === d.activeLabel)?.fullName ?? null;
                    setFilter('By Department');
                    setDeptFilter(prev => prev === full ? null : full);
                  }}
                >
                  <XAxis dataKey="name" fontSize={12} fontWeight={700} tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.9)" tick={{ fill: 'rgba(255,255,255,0.9)' }} />
                  <YAxis allowDecimals={false} fontSize={12} fontWeight={700} tickLine={false} axisLine={false} stroke="rgba(255,255,255,0.6)" tick={{ fill: 'rgba(255,255,255,0.8)' }} />
                  <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(255,255,255,0.08)' }} />
                  <Bar dataKey="open"     name="Open"     stackId="a" radius={[0,0,0,0]}>
                    {deptChartData.map((d, i) => (
                      <Cell key={i} fill={DEPT_COLORS[d.fullName] ?? '#94a3b8'} fillOpacity={0.9} />
                    ))}
                  </Bar>
                  <Bar dataKey="resolved" name="Resolved"  stackId="a" radius={[6,6,0,0]}>
                    {deptChartData.map((d, i) => (
                      <Cell key={i} fill={DEPT_COLORS[d.fullName] ?? '#94a3b8'} fillOpacity={0.35} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-center text-xs text-white/60 font-semibold mt-2">Darker = open · lighter = resolved</p>
          </Card>

          {/* Severity Donut */}
          <Card className="glass-card p-6 border-white/25 shadow-2xl flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white">Severity Breakdown</h2>
            </div>
            <p className="text-xs text-white/70 font-semibold mb-4">Auto-classified by AI severity score</p>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={severityData} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                    paddingAngle={4} dataKey="value" stroke="rgba(255,255,255,0.15)"
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    labelLine={{ stroke: 'rgba(255,255,255,0.6)' }}
                  >
                    {severityData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip content={<GlassTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {severityData.map(d => <Pill key={d.name} color={d.fill} label={`${d.name} (${d.value})`} />)}
            </div>
          </Card>
        </section>

        {/* ── Status Pipeline ── */}
        <section>
          <Card className="glass-card p-6 border-white/25 shadow-2xl">
            <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-white" /> Status Pipeline
            </h2>
            <div className="flex flex-wrap gap-3">
              {statusData.map(s => (
                <motion.button
                  key={s.name}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(s.name)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-bold text-sm text-white ${
                    filter === s.name ? 'border-white/60 bg-white/20' : 'border-white/20 bg-white/8 hover:bg-white/15'
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.name}</span>
                  <span className="ml-1 text-xs font-black px-2 py-0.5 rounded-full" style={{ background: s.color + '55', color: s.color }}>
                    {s.value}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Category breakdown strip */}
            <div className="mt-6">
              <p className="text-xs text-white font-extrabold uppercase tracking-widest mb-4">Top Issue Categories (auto-categorised)</p>
              <div className="space-y-3">
                {categoryData.slice(0, 6).map(cat => {
                  const pct = Math.round((cat.count / total) * 100);
                  const color = DEPT_COLORS[cat.dept] ?? '#94a3b8';
                  return (
                    <div key={cat.name} className="flex items-center gap-3">
                      <span className="text-sm text-white font-semibold w-52 truncate shrink-0">{cat.name}</span>
                      <div className="flex-1 h-2.5 bg-white/15 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white w-16 text-right">{cat.count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </section>

        {/* ── Map ── */}
        <section>
          <Card className="glass p-6 border-white/20 shadow-xl">
            <h2 className="text-xl font-bold mb-6 drop-shadow-md">Live Incident Map</h2>
            <MapWidget complaints={visible} />
          </Card>
        </section>

        {/* ── Complaint List ── */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-extrabold drop-shadow-md">Manage Complaints</h2>
              {filter === 'By Department' && deptFilter && (
                <p className="text-sm text-white/60 font-medium mt-1 flex items-center gap-2">
                  Showing: <span className="font-bold text-white/90">{deptFilter}</span>
                  <button onClick={() => setDeptFilter(null)} className="text-xs text-red-300 hover:text-red-100 underline">clear</button>
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map(f => (
                <motion.div key={f} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={filter === f ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setFilter(f); if (f !== 'By Department') setDeptFilter(null); }}
                    className={`transition-all text-xs ${filter === f ? 'bg-white text-violet-900 shadow-lg' : 'glass bg-white/10 hover:bg-white/20 border-white/30 text-white'}`}
                  >
                    {f}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Department quick-select pills (shown when By Department is active) */}
          <AnimatePresence>
            {filter === 'By Department' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 overflow-hidden"
              >
                {Object.keys(deptMap).map(dept => (
                  <motion.button
                    key={dept}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setDeptFilter(prev => prev === dept ? null : dept)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${deptFilter === dept ? 'border-white/60 bg-white/20' : 'border-white/15 bg-white/5 hover:bg-white/10'}`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: DEPT_COLORS[dept] ?? '#94a3b8' }} />
                    {dept}
                    <span className="ml-1 opacity-70">({deptMap[dept].length})</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
            initial="hidden"
            animate="show"
            className="glass rounded-2xl border-white/20 shadow-xl divide-y divide-white/10 overflow-hidden"
          >
            {visible.map(c => {
              const deptColor = DEPT_COLORS[c.department] ?? '#94a3b8';
              const sevColor  = SEVERITY_COLORS[c.severity] ?? '#94a3b8';
              return (
                <motion.div variants={rowVariants} key={c.id}
                  className="p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:bg-white/5 transition-colors"
                >
                  {/* Left: image or placeholder */}
                  {c.image ? (
                    <img src={c.image} className="w-28 h-20 object-cover rounded-xl shadow-md shrink-0" />
                  ) : (
                    <div className="w-28 h-20 bg-black/20 rounded-xl flex items-center justify-center text-3xl shadow-inner ring-1 ring-white/10 shrink-0">📌</div>
                  )}

                  {/* Middle: content */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-white/50 text-xs uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded-md">{c.id}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md ring-1" style={{ background: sevColor + '22', color: sevColor, borderColor: sevColor + '55' }}>
                        {c.severity}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md ring-1" style={{ background: deptColor + '22', color: deptColor, borderColor: deptColor + '55' }}>
                        {c.department}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/10 text-white/70 ring-1 ring-white/20">
                        {STATUS_META[c.status]?.icon} {c.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg drop-shadow-sm truncate">{c.title}</h3>
                    <p className="text-sm text-white/60 flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 opacity-60 shrink-0" />
                      <span className="truncate">{c.location}</span>
                    </p>
                    <p className="text-xs text-white/40 font-medium">{c.category}</p>
                  </div>

                  {/* Right: actions */}
                  <div className="flex flex-col gap-2 min-w-[148px] shrink-0">
                    {c.status === 'AI Validated' && (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button size="sm" className="w-full bg-sky-500/30 hover:bg-sky-500/50 border border-sky-400/30 shadow-md transition-all text-white" onClick={() => handleUpdateStatus(c.id, 'Assigned')}>
                          Assign Team
                        </Button>
                      </motion.div>
                    )}
                    {c.status === 'Assigned' && (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button size="sm" className="w-full bg-orange-500/30 hover:bg-orange-500/50 border border-orange-400/30 shadow-md transition-all text-white" onClick={() => handleUpdateStatus(c.id, 'In Progress')}>
                          Start Work
                        </Button>
                      </motion.div>
                    )}
                    {c.status === 'In Progress' && (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button size="sm" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition-all" onClick={() => handleUpdateStatus(c.id, 'Resolved')}>
                          Mark Resolved
                        </Button>
                      </motion.div>
                    )}
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" size="sm" className="w-full glass hover:bg-white/10 border-white/30 transition-all text-white" onClick={() => router.push(`/track?id=${c.id}`)}>
                        View Details
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
            {visible.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 text-center text-white/50 font-medium">
                No complaints match this filter.
              </motion.div>
            )}
          </motion.div>
        </section>
      </motion.div>
    </div>
  );
}
