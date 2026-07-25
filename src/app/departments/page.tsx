'use client';

import { useMockDb, defaultOfficers } from '@/context/MockDb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldCheck, MapPin, Mail, Phone, ArrowLeft, Star } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function DepartmentsDirectory() {
  const { users, role, currentUser } = useMockDb();
  const router = useRouter();
  
  useEffect(() => {
    if (role !== 'citizen') router.push('/');
  }, [role, router]);

  if (role !== 'citizen') return null;

  // Combine default mock officers with any newly registered officers
  const allOfficers = [...defaultOfficers, ...users.filter(u => u.role === 'officer')];
  
  // Deduplicate by ID
  const uniqueOfficers = Array.from(new Map(allOfficers.map(item => [item.id, item])).values());

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen text-white font-sans p-6 relative overflow-hidden">
      <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-black/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto space-y-8 relative z-10"
      >
        <header className="glass flex justify-between items-center p-6 rounded-3xl border-white/20 shadow-xl">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push('/dashboard')} variant="ghost" className="text-white hover:bg-white/10 p-2 h-auto rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <p className="text-sm font-bold tracking-widest text-white/70 uppercase">Civic Directory</p>
              <h1 className="text-3xl font-extrabold text-white drop-shadow-md">Departments & Officers</h1>
            </div>
          </div>
        </header>

        <section className="space-y-6">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {uniqueOfficers.map(officer => {
              const isMyOfficer = currentUser?.wardNumber && officer.wardNumber?.toLowerCase() === currentUser.wardNumber?.toLowerCase();
              
              return (
                <motion.div key={officer.id} variants={itemVariants}>
                  <Card className={`glass p-6 border-white/20 shadow-lg flex flex-col h-full hover:bg-white/10 transition-colors relative overflow-hidden ${isMyOfficer ? 'ring-2 ring-emerald-400' : ''}`}>
                    {isMyOfficer && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-bl-lg shadow-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" /> Your Ward Officer
                      </div>
                    )}
                    <div className="bg-white/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 ring-1 ring-white/20 shadow-inner">
                      <ShieldCheck className="w-8 h-8 text-white drop-shadow-md" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-bold text-xl drop-shadow-sm text-white">{officer.name}</h3>
                      <p className="text-sm font-black text-white/60 uppercase tracking-widest">{officer.department}</p>
                      
                      <div className="mt-4 space-y-2 pt-4 border-t border-white/10">
                        <p className="text-sm text-white/80 flex items-center gap-2 font-medium">
                          <MapPin className="w-4 h-4 opacity-70" /> {officer.wardNumber || 'N/A'} {officer.locality ? `- ${officer.locality}` : ''}
                        </p>
                        <p className="text-sm text-white/80 flex items-center gap-2 font-medium">
                          <Mail className="w-4 h-4 opacity-70" /> {officer.email}
                        </p>
                        <p className="text-sm text-white/80 flex items-center gap-2 font-medium">
                          <Phone className="w-4 h-4 opacity-70" /> {officer.phone || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      </motion.div>
    </div>
  );
}
