'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Upload, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMockDb, Complaint } from '@/context/MockDb';

export default function ReportComplaint() {
  const router = useRouter();
  const { addComplaint } = useMockDb();
  const [image, setImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [location, setLocation] = useState({ lat: 0, lng: 0, text: '' });
  
  const [formData, setFormData] = useState({
    category: '',
    severity: '',
    summary: '',
    department: '',
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
      alert('Camera permission denied or not available.');
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
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            text: `GPS Location: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
          });
        },
        () => {
          setLocation({ lat: 0, lng: 0, text: 'Location access denied.' });
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
        setFormData({
          category: data.category || 'Unknown',
          severity: data.severity || 'Medium',
          summary: data.summary || '',
          department: data.department || 'General',
        });
      } else {
        alert('Failed to analyze image.');
      }
    } catch (err) {
      console.error(err);
      alert('Error analyzing image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return alert('Please provide an image first.');
    const newComplaint: Complaint = {
      id: 'SC-2026-' + Math.floor(1000 + Math.random() * 9000),
      title: `${formData.category || 'Issue'} Reported`,
      category: formData.category || 'Unknown',
      severity: (formData.severity as any) || 'Medium',
      summary: formData.summary || 'User submitted issue.',
      department: formData.department || 'General',
      status: 'AI Validated',
      location: location.text || 'Location Unknown',
      createdAt: new Date().toLocaleString(),
      citizen: 'Citizen User', // In real app, fetch from auth
      image: image
    };
    addComplaint(newComplaint);
    alert('Complaint submitted successfully!');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Report an Issue</h1>
          <p className="text-slate-500">Upload a photo and let AI do the rest.</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-3">
              <Label>1. Photo Evidence</Label>
              {!image && !isCameraOpen && (
                <div className="grid grid-cols-2 gap-4">
                  <Button type="button" variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" onClick={startCamera}>
                    <Camera className="w-6 h-6 text-violet-600" />
                    <span>Take Photo</span>
                  </Button>
                  <Label className="h-24 flex flex-col items-center justify-center gap-2 border rounded-md cursor-pointer hover:bg-slate-50">
                    <Upload className="w-6 h-6 text-violet-600" />
                    <span>Upload Photo</span>
                    <Input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </Label>
                </div>
              )}
              {isCameraOpen && (
                <div className="space-y-4">
                  <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg bg-black" />
                  <div className="flex gap-4">
                    <Button type="button" variant="destructive" onClick={stopCamera}>Cancel</Button>
                    <Button type="button" onClick={capturePhoto} className="flex-1">Capture</Button>
                  </div>
                </div>
              )}
              {image && (
                <div className="relative">
                  <img src={image} alt="Evidence" className="w-full h-64 object-cover rounded-lg" />
                  <Button type="button" variant="secondary" size="sm" className="absolute top-2 right-2" onClick={() => setImage(null)}>
                    Retake
                  </Button>
                </div>
              )}
            </div>

            {isAnalyzing && (
              <div className="bg-violet-50 border border-violet-200 p-4 rounded-lg flex items-center gap-3 text-violet-700 font-medium">
                <Sparkles className="w-5 h-5 animate-pulse" />
                AI is analyzing your image and categorizing the issue...
              </div>
            )}

            {formData.category && !isAnalyzing && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg space-y-4">
                <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
                  <CheckCircle2 className="w-5 h-5" /> AI Validated Details
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-emerald-800 text-xs uppercase">Category</Label>
                    <Input readOnly value={formData.category} className="bg-white" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-emerald-800 text-xs uppercase">Department</Label>
                    <Input readOnly value={formData.department} className="bg-white" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-emerald-800 text-xs uppercase">Severity</Label>
                    <Input readOnly value={formData.severity} className="bg-white" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-emerald-800 text-xs uppercase">Location</Label>
                    <div className="flex items-center gap-2 bg-white border px-3 py-2 rounded-md h-10 text-sm">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      {location.lat !== 0 ? 'Captured' : 'Pending'}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-emerald-800 text-xs uppercase">Summary</Label>
                  <Textarea readOnly value={formData.summary} className="bg-white resize-none" />
                </div>
              </div>
            )}

            <Button type="submit" disabled={!image || isAnalyzing} className="w-full h-12 text-lg bg-violet-600 hover:bg-violet-700 text-white font-bold">
              Submit Complaint
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
