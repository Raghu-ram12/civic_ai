'use client';

import { useState, useEffect, Suspense } from 'react';
import { useMockDb, Complaint } from '@/context/MockDb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, MapPin, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function TrackContent() {
  const { complaints } = useMockDb();
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';
  
  const [searchId, setSearchId] = useState(initialId);
  const [result, setResult] = useState<Complaint | null | 'not-found'>(null);

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = (idToSearch: string = searchId) => {
    if (!idToSearch) return;
    const found = complaints.find(c => c.id.toUpperCase() === idToSearch.toUpperCase());
    setResult(found || 'not-found');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-800">Track Your Complaint</h1>
        <p className="text-slate-500">Enter your complaint ID to see its current status in real-time.</p>
      </div>

      <Card className="p-6">
        <div className="flex gap-4">
          <Input 
            type="text" 
            placeholder="e.g. SC-2026-1234" 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="h-12 text-lg"
          />
          <Button onClick={() => handleSearch()} className="h-12 px-8 bg-violet-600 hover:bg-violet-700">
            <Search className="w-5 h-5 mr-2" /> Track
          </Button>
        </div>
      </Card>

      {result === 'not-found' && (
        <div className="text-center p-12 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-800">Complaint Not Found</h3>
          <p className="text-red-600">Please check your ID and try again.</p>
        </div>
      )}

      {result && result !== 'not-found' && (
        <Card className="p-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
            <div>
              <span className="text-sm font-bold text-violet-600 uppercase tracking-wider">Complaint ID</span>
              <h2 className="text-2xl font-black text-slate-800">{result.id}</h2>
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold text-sm ${
              result.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' :
              result.status === 'In Progress' ? 'bg-violet-100 text-violet-700' :
              'bg-orange-100 text-orange-700'
            }`}>
              Status: {result.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <Label className="text-xs text-slate-400 uppercase font-bold">Category</Label>
                <p className="text-lg font-semibold text-slate-800">{result.category}</p>
              </div>
              <div>
                <Label className="text-xs text-slate-400 uppercase font-bold">Department</Label>
                <p className="text-lg font-semibold text-slate-800">{result.department}</p>
              </div>
              <div>
                <Label className="text-xs text-slate-400 uppercase font-bold">Location</Label>
                <p className="text-md text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" /> {result.location}
                </p>
              </div>
              <div>
                <Label className="text-xs text-slate-400 uppercase font-bold">Summary</Label>
                <p className="text-md text-slate-700 bg-slate-50 p-4 rounded-lg mt-1 border border-slate-100">
                  {result.summary}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Label className="text-xs text-slate-400 uppercase font-bold">Photo Evidence</Label>
              {result.image ? (
                <img src={result.image} alt="Complaint Evidence" className="w-full h-64 object-cover rounded-xl shadow-sm border border-slate-200" />
              ) : (
                <div className="w-full h-64 bg-slate-100 rounded-xl flex items-center justify-center border border-dashed border-slate-300">
                  <span className="text-slate-400 font-semibold">No Image Provided</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t">
            <Label className="text-xs text-slate-400 uppercase font-bold mb-4 block">Resolution Timeline</Label>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>
                <div>
                  <p className="font-bold text-slate-800">Submitted & AI Validated</p>
                  <p className="text-sm text-slate-500">{result.createdAt}</p>
                </div>
              </div>
              {(result.status === 'Assigned' || result.status === 'In Progress' || result.status === 'Resolved') && (
                <div className="flex gap-4">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>
                  <div>
                    <p className="font-bold text-slate-800">Assigned to {result.department}</p>
                  </div>
                </div>
              )}
              {(result.status === 'In Progress' || result.status === 'Resolved') && (
                <div className="flex gap-4">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>
                  <div>
                    <p className="font-bold text-slate-800">Work in Progress</p>
                  </div>
                </div>
              )}
              {result.status === 'Resolved' && (
                <div className="flex gap-4">
                  <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div>
                  <div>
                    <p className="font-bold text-slate-800">Issue Resolved!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
      <Suspense fallback={<div className="text-center p-12 text-slate-500">Loading tracker...</div>}>
        <TrackContent />
      </Suspense>
    </div>
  );
}
