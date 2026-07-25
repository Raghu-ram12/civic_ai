'use client';

import { useMockDb } from '@/context/MockDb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Clock, Plus, MapPin, LogOut, UserCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function CityDashboard() {
  const { complaints, role, logout, currentUser } = useMockDb();
  const router = useRouter();
  
  useEffect(() => {
    if (role !== 'citizen') router.push('/');
  }, [role, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (role !== 'citizen') return null;

  const myComplaints = complaints;
  const resolvedCount = myComplaints.filter(c => c.status === 'Resolved').length;
  const pendingCount = myComplaints.filter(c => c.status !== 'Resolved').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen text-white font-sans p-6 relative overflow-hidden">
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-black/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto space-y-8 relative z-10"
      >
        <header className="glass flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-3xl border-white/20 shadow-xl">
          <div>
            <p className="text-sm font-bold tracking-widest text-white/70 uppercase">City Dashboard</p>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-md">City-wide Complaints</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => router.push('/dashboard')} className="glass bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-500/30 font-bold gap-2 shadow-lg h-10 px-4">
                My Dashboard
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => router.push('/report')} className="bg-white text-violet-900 hover:bg-white/90 font-bold gap-2 shadow-lg h-10 px-4">
                <Plus className="w-5 h-5" /> Report Issue
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => router.push('/departments')} variant="outline" className="glass bg-white/10 hover:bg-white/20 border-white/30 text-white font-bold shadow-md h-10 px-4">
                Departments
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => router.push('/profile')}
 variant="outline" className="glass bg-white/10 hover:bg-white/20 border-white/30 text-white font-bold shadow-md h-10 px-4">
                <UserCircle className="w-5 h-5 mr-2" /> Profile
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" className="glass bg-red-500/20 border-red-500/30 text-white hover:bg-red-500/40 hover:text-white shadow-md h-10 px-4" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </motion.div>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Reports', value: myComplaints.length, icon: Clock, bg: 'bg-white/20', ring: 'ring-white/30' },
            { label: 'In Progress', value: pendingCount, icon: AlertCircle, bg: 'bg-orange-500/30', ring: 'ring-orange-500/50' },
            { label: 'Resolved', value: resolvedCount, icon: CheckCircle2, bg: 'bg-emerald-500/30', ring: 'ring-emerald-500/50' }
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className="glass p-6 border-white/20 shadow-lg flex items-center gap-5 hover:bg-white/10 h-full">
                <div className={`${stat.bg} p-4 rounded-2xl shadow-inner ring-1 ${stat.ring} backdrop-blur-sm`}>
                  <stat.icon className="text-white w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-white/70 font-bold uppercase tracking-wider">{stat.label}</p>
                  <p className="text-4xl font-black text-white drop-shadow-md">{stat.value}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-extrabold text-white drop-shadow-md ml-2">Recent Complaints</h2>
          
          {myComplaints.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-12 glass border-white/20 rounded-2xl shadow-lg flex flex-col items-center">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }} className="bg-white/10 p-4 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-white/50" />
              </motion.div>
              <p className="text-white/70 font-medium text-lg">You haven't reported any issues yet.</p>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid gap-5"
            >
              {myComplaints.map(c => (
                <motion.div key={c.id} variants={itemVariants}>
                  <Card className="glass p-6 border-white/20 shadow-lg flex flex-col sm:flex-row gap-5 items-start sm:items-center hover:bg-white/10 group">
                    {c.image && (
                      <div className="overflow-hidden rounded-xl flex-shrink-0">
                        <motion.img whileHover={{ scale: 1.1 }} src={c.image} alt="Issue" className="w-28 h-28 object-cover shadow-md" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-black text-white/60 uppercase tracking-widest bg-black/20 px-2 py-1 rounded-md">{c.id}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-md shadow-sm ring-1 ${
                          c.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-100 ring-emerald-500/50' :
                          c.status === 'In Progress' ? 'bg-orange-500/20 text-orange-100 ring-orange-500/50' :
                          'bg-red-500/20 text-red-100 ring-red-500/50'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-xl drop-shadow-sm">{c.title}</h3>
                      <p className="text-sm text-white/70 flex items-center gap-1 font-medium bg-black/10 self-start px-2 py-1 rounded-md w-max">
                        <MapPin className="w-4 h-4 text-white/50" /> {c.location}
                      </p>
                    </div>
                    <div className="flex-shrink-0 mt-4 sm:mt-0">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button onClick={() => router.push(`/track?id=${c.id}`)} variant="outline" className="glass bg-white/10 hover:bg-white/20 border-white/30 text-white font-bold shadow-md">View Status</Button>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </motion.div>
    </div>
  );
}
