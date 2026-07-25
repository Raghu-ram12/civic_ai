'use client';

import { useState, useEffect, Suspense } from 'react';
import { useMockDb, Complaint } from '@/context/MockDb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, MapPin, CheckCircle2, Clock, AlertCircle, Camera } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useToast } from '@/context/ToastContext';

function TrackContent() {
  const { complaints } = useMockDb();
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const { toast } = useToast();
  
  const [searchId, setSearchId] = useState(initialId);
  const [result, setResult] = useState<Complaint | null | 'not-found'>(null);

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = (idToSearch?: any) => {
    const query = typeof idToSearch === 'string' ? idToSearch : searchId;
    if (!query || typeof query !== 'string') {
      toast('Please enter a valid complaint ID', 'error');
      return;
    }
    const found = complaints.find(c => c.id && String(c.id).toUpperCase() === query.toUpperCase());
    setResult(found || 'not-found');
    if (!found) {
      toast('Complaint not found', 'error');
    }
  };

  const timelineVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const timelineItemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto space-y-8 relative z-10"
    >
      <div className="text-center space-y-2 glass p-8 rounded-3xl border-white/20 shadow-xl">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg">Track Your Complaint</h1>
        <p className="text-white/80 font-medium">Enter your complaint ID to see its current status in real-time.</p>
      </div>

      <Card className="glass p-6 border-white/20 shadow-2xl">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input 
            type="text" 
            placeholder="e.g. SC-2026-1234" 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="h-14 text-lg bg-black/20 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/50"
          />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
            <Button onClick={() => handleSearch()} className="h-14 px-10 text-lg bg-white text-violet-900 font-bold shadow-lg w-full">
              <Search className="w-5 h-5 mr-2" /> Track
            </Button>
          </motion.div>
        </div>
      </Card>

      {result === 'not-found' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center p-12 glass bg-red-500/20 border-red-500/40 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="bg-red-500/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-red-500/50">
            <AlertCircle className="w-8 h-8 text-red-100" />
          </div>
          <h3 className="text-2xl font-bold text-white drop-shadow-md mb-2">Complaint Not Found</h3>
          <p className="text-red-100 font-medium">Please check your ID and try again.</p>
        </motion.div>
      )}

      {result && result !== 'not-found' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass p-8 space-y-8 border-white/20 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="text-sm font-bold text-white/60 uppercase tracking-widest block mb-1">Complaint ID</span>
                <h2 className="text-3xl font-black text-white drop-shadow-md">{result.id}</h2>
              </div>
              <div className={`px-4 py-2 rounded-xl font-bold text-sm shadow-md ring-1 backdrop-blur-sm ${
                result.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-100 ring-emerald-500/50' :
                result.status === 'In Progress' ? 'bg-violet-500/20 text-violet-100 ring-violet-500/50' :
                'bg-orange-500/20 text-orange-100 ring-orange-500/50'
              }`}>
                Status: {result.status}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label className="text-xs text-white/60 uppercase font-bold tracking-widest">Category</Label>
                  <p className="text-lg font-bold text-white drop-shadow-sm">{result.category}</p>
                </div>
                <div>
                  <Label className="text-xs text-white/60 uppercase font-bold tracking-widest">Department</Label>
                  <p className="text-lg font-bold text-white drop-shadow-sm">{result.department}</p>
                </div>
                <div>
                  <Label className="text-xs text-white/60 uppercase font-bold tracking-widest">Location</Label>
                  <p className="text-md font-medium text-white/90 flex items-center gap-2 mt-1 bg-black/10 w-fit px-3 py-1.5 rounded-lg border border-white/10">
                    <MapPin className="w-4 h-4 text-white/70" /> {result.location}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-white/60 uppercase font-bold tracking-widest block mb-2">Summary</Label>
                  <p className="text-md text-white/90 bg-black/20 p-4 rounded-xl border border-white/10 shadow-inner">
                    {result.summary}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="text-xs text-white/60 uppercase font-bold tracking-widest">Photo Evidence</Label>
                {result.image ? (
                  <motion.img whileHover={{ scale: 1.02 }} src={result.image} alt="Complaint Evidence" className="w-full h-64 object-cover rounded-2xl shadow-lg ring-1 ring-white/20 transition-transform" />
                ) : (
                  <div className="w-full h-64 bg-black/20 rounded-2xl flex flex-col items-center justify-center border border-dashed border-white/30 shadow-inner">
                    <Camera className="w-10 h-10 text-white/30 mb-3" />
                    <span className="text-white/50 font-bold tracking-wider">NO IMAGE</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <Label className="text-xs text-white/60 uppercase font-bold tracking-widest mb-6 block">Resolution Timeline</Label>
              <motion.div variants={timelineVariants} initial="hidden" animate="show" className="space-y-5 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent pl-8 md:pl-0">
                
                <motion.div variants={timelineItemVariants} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white/30 bg-emerald-500/20 ring-1 ring-emerald-500/50 shadow-md md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute -left-8 md:left-1/2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                  </div>
                  <div className="w-full md:w-[calc(50%-2rem)] glass p-4 rounded-xl border-white/10 shadow-sm md:group-odd:text-right">
                    <p className="font-bold text-white drop-shadow-sm">Submitted & AI Validated</p>
                    <p className="text-sm text-white/60 font-medium mt-1">{result.createdAt}</p>
                  </div>
                </motion.div>

                {(result.status === 'Assigned' || result.status === 'In Progress' || result.status === 'Resolved') && (
                  <motion.div variants={timelineItemVariants} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white/30 bg-emerald-500/20 ring-1 ring-emerald-500/50 shadow-md md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute -left-8 md:left-1/2">
                      <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                    </div>
                    <div className="w-full md:w-[calc(50%-2rem)] glass p-4 rounded-xl border-white/10 shadow-sm md:group-odd:text-right">
                      <p className="font-bold text-white drop-shadow-sm">Assigned to {result.department}</p>
                    </div>
                  </motion.div>
                )}
                {(result.status === 'In Progress' || result.status === 'Resolved') && (
                  <motion.div variants={timelineItemVariants} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white/30 bg-emerald-500/20 ring-1 ring-emerald-500/50 shadow-md md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute -left-8 md:left-1/2">
                      <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                    </div>
                    <div className="w-full md:w-[calc(50%-2rem)] glass p-4 rounded-xl border-white/10 shadow-sm md:group-odd:text-right">
                      <p className="font-bold text-white drop-shadow-sm">Work in Progress</p>
                    </div>
                  </motion.div>
                )}
                {result.status === 'Resolved' && (
                  <motion.div variants={timelineItemVariants} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white/30 bg-emerald-500/20 ring-1 ring-emerald-500/50 shadow-md md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute -left-8 md:left-1/2">
                      <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                    </div>
                    <div className="w-full md:w-[calc(50%-2rem)] glass bg-emerald-500/10 p-4 rounded-xl border-emerald-500/30 shadow-md md:group-odd:text-right">
                      <p className="font-extrabold text-white drop-shadow-sm text-lg">Issue Resolved!</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen text-white py-12 px-6 font-sans relative overflow-hidden">
      <div className="absolute top-1/4 -right-1/4 w-[700px] h-[700px] bg-white/10 rounded-full blur-[130px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-black/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <Suspense fallback={<div className="text-center p-12 text-white/50 font-bold text-lg animate-pulse">Loading tracker...</div>}>
        <TrackContent />
      </Suspense>
    </div>
  );
}
