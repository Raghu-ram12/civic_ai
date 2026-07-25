'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Upload, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMockDb, Complaint } from '@/context/MockDb';
import { useToast } from '@/context/ToastContext';
import { motion } from 'framer-motion';

export default function ReportComplaint() {
  const router = useRouter();
  const { addComplaint, role, currentUser, complaints, updateComplaint } = useMockDb();
  const { toast } = useToast();
  
  useEffect(() => {
    if (role !== 'citizen') {
      router.push('/');
    }
  }, [role, router]);

  const [image, setImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [location, setLocation] = useState({ lat: 0, lng: 0, text: '', wardNumber: '', locality: '' });
  
  if (role !== 'citizen') return null;

  const [formData, setFormData] = useState({
    category: '',
    severity: '',
    summary: '',
    department: '',
    description: '',
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      toast('Camera permission denied or not available.', 'error');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg');
    setImage(base64);
    stopCamera();
    analyzeImage(base64);
    getLocation();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        analyzeImage(base64);
        getLocation();
      };
      reader.readAsDataURL(file);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Mocking reverse geocoding for demonstration
          const mockWard = currentUser?.wardNumber || 'Ward 12';
          const mockLocality = currentUser?.locality || 'MG Road Sector';
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            text: `${mockLocality}, ${mockWard} (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
            wardNumber: mockWard,
            locality: mockLocality,
          });
        },
        () => {
          setLocation({ lat: 0, lng: 0, text: 'Location access denied.', wardNumber: '', locality: '' });
        }
      );
    }
  };

  const analyzeImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image }),
      });
      const data = await res.json();
      if (res.ok && data) {
        setFormData(prev => ({
          category: data.category || 'Unknown',
          severity: data.severity || 'Medium',
          summary: data.summary || '',
          department: data.department || 'General',
          // Pre-fill description from AI summary only if user hasn't typed anything
          description: prev.description || data.summary || '',
        }));
        toast('AI Analysis complete!', 'success');
      } else {
        toast('Failed to analyze image.', 'error');
      }
    } catch (err) {
      console.error(err);
      toast('Error analyzing image.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return toast('Please provide an image first.', 'error');
    const newComplaint: Complaint = {
      id: 'SC-2026-' + Math.floor(1000 + Math.random() * 9000),
      title: `${formData.category || 'Issue'} Reported`,
      category: formData.category || 'Unknown',
      severity: (formData.severity as any) || 'Medium',
      summary: formData.summary || formData.description || 'User submitted issue.',
      detailedDescription: formData.description || undefined,
      department: formData.department || 'General',
      status: 'AI Validated',
      location: location.text || 'Location Unknown',
      lat: location.lat || undefined,
      lng: location.lng || undefined,
      createdAt: new Date().toLocaleString(),
      citizen: currentUser ? currentUser.name : 'Citizen User',
      citizenId: currentUser ? currentUser.id : undefined,
      image: image
    };
    addComplaint(newComplaint);
    toast('Complaint submitted successfully!', 'success');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen text-white py-10 px-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto space-y-8 relative z-10"
      >
        <div className="text-center md:text-left glass p-8 rounded-3xl border-white/20 shadow-xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-md mb-2">Report an Issue</h1>
          <p className="text-white/80 font-medium">Upload a photo and let AI do the rest.</p>
        </div>

        <Card className="glass p-6 md:p-8 border-white/20 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-4">
              <Label className="text-white/90 text-lg font-bold drop-shadow-sm flex items-center gap-2">
                <span className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span> 
                Photo Evidence
              </Label>
              {!image && !isCameraOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="button" variant="outline" className="w-full h-32 glass border-white/30 text-white shadow-md flex flex-col items-center justify-center gap-3" onClick={startCamera}>
                      <div className="bg-white/20 p-3 rounded-full"><Camera className="w-6 h-6" /></div>
                      <span className="font-bold">Take Photo</span>
                    </Button>
                  </motion.div>
                  <motion.label whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-32 glass border border-white/30 flex flex-col items-center justify-center gap-3 text-white shadow-md rounded-md cursor-pointer">
                    <div className="bg-white/20 p-3 rounded-full"><Upload className="w-6 h-6" /></div>
                    <span className="font-bold">Upload Photo</span>
                    <Input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </motion.label>
                </div>
              )}
              {isCameraOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 glass p-4 rounded-xl border-white/20">
                  <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-black ring-1 ring-white/30" />
                  <div className="flex gap-4">
                    <Button type="button" variant="destructive" className="glass bg-red-500/20 border-red-500/40 hover:bg-red-500/40" onClick={stopCamera}>Cancel</Button>
                    <Button type="button" className="flex-1 bg-white text-violet-900 font-bold hover:bg-white/90" onClick={capturePhoto}>Capture</Button>
                  </div>
                </motion.div>
              )}
              {image && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative group">
                  <img src={image} alt="Evidence" className="w-full h-64 object-cover rounded-xl shadow-lg ring-1 ring-white/20" />
                  <Button type="button" variant="secondary" size="sm" className="absolute top-3 right-3 glass bg-black/40 hover:bg-black/60 border-white/20 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setImage(null)}>
                    Retake Photo
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Step 2 — Description */}
            <div className="space-y-3">
              <Label className="text-white/90 text-lg font-bold drop-shadow-sm flex items-center gap-2">
                <span className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                Describe the Problem
              </Label>
              <p className="text-sm text-white/60 font-medium -mt-1">
                Provide as much detail as you can — what you saw, when it started, and any safety concerns.
              </p>
              <Textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. A deep pothole formed after last night's rain near the school gate. Bikes have been skidding since morning. It's about 2 feet wide..."
                rows={5}
                className="bg-black/20 border-white/20 text-white placeholder:text-white/30 font-medium resize-none focus-visible:ring-white/40 focus-visible:border-white/40 transition-all"
              />
              <p className="text-xs text-white/40 text-right">{formData.description.length} characters</p>
            </div>

            {isAnalyzing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass bg-violet-500/20 border-violet-500/40 p-6 rounded-xl flex items-center gap-4 text-white shadow-lg backdrop-blur-md">
                <div className="bg-white/20 p-3 rounded-full"><Sparkles className="w-6 h-6 animate-pulse" /></div>
                <span className="font-bold text-lg">AI is analyzing your image and categorizing the issue...</span>
              </motion.div>
            )}

            {/* Step 3 — AI Results (only shown after analysis) */}
            {formData.category && !isAnalyzing && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass bg-emerald-500/20 border-emerald-500/40 p-6 rounded-xl space-y-6 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-3 text-white font-extrabold text-xl mb-2 drop-shadow-md">
                  <div className="bg-emerald-400/40 p-2 rounded-full"><CheckCircle2 className="w-6 h-6" /></div>
                  <div>
                    <p>AI Validated Details</p>
                    <p className="text-xs font-normal text-white/60 mt-0.5">Auto-filled from your photo · step 3 is complete</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/80 text-xs font-bold uppercase tracking-widest">Category</Label>
                    <Input readOnly value={formData.category} className="bg-black/20 border-white/20 text-white font-medium focus-visible:ring-0" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/80 text-xs font-bold uppercase tracking-widest">Department</Label>
                    <Input readOnly value={formData.department} className="bg-black/20 border-white/20 text-white font-medium focus-visible:ring-0" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/80 text-xs font-bold uppercase tracking-widest">Severity</Label>
                    <Input readOnly value={formData.severity} className="bg-black/20 border-white/20 text-white font-medium focus-visible:ring-0" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/80 text-xs font-bold uppercase tracking-widest">Location</Label>
                    <div className="flex items-center gap-2 bg-black/20 border border-white/20 px-3 py-2 rounded-md h-10 text-sm font-medium text-white">
                      <MapPin className="w-4 h-4 opacity-70" />
                      {location.lat !== 0 ? 'Captured successfully' : 'Pending...'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" disabled={!image || isAnalyzing} className="w-full h-14 text-lg bg-white text-violet-900 font-extrabold shadow-2xl rounded-xl">
                {isAnalyzing ? 'Analyzing...' : 'Submit Complaint'}
              </Button>
            </motion.div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
