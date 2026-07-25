import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Camera, MapPin, Activity } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-800">Smart<span className="text-emerald-500">Civic</span></span>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="font-semibold text-slate-600 hover:text-blue-600 transition-colors">Home</Link>
          <Link href="/about" className="font-semibold text-slate-600 hover:text-blue-600 transition-colors">About</Link>
          <Link href="/features" className="font-semibold text-slate-600 hover:text-blue-600 transition-colors">Features</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="font-bold text-slate-600">Citizen Login</Button>
          </Link>
          <Link href="/officer/login">
            <Button variant="outline" className="font-bold text-blue-600 border-blue-200 hover:bg-blue-50">Officer Login</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-3xl leading-tight">
          AI Powered <br/><span className="text-blue-600">Municipal Complaint</span> System
        </h1>
        <p className="text-xl md:text-2xl text-slate-500 mb-10 max-w-2xl">
          Report civic issues in 5 seconds using AI. We automatically route your requests to the right department.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link href="/report">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-6 shadow-lg shadow-blue-200 rounded-xl flex items-center gap-2">
              <Camera className="w-5 h-5" /> Report Complaint
            </Button>
          </Link>
          <Link href="/track">
            <Button size="lg" variant="outline" className="bg-white border-slate-300 text-slate-700 font-bold text-lg px-8 py-6 shadow-sm rounded-xl flex items-center gap-2">
              <MapPin className="w-5 h-5" /> Track Complaint
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-5xl">
          {[
            { label: 'Complaints Submitted', value: '12,402' },
            { label: 'Complaints Resolved', value: '11,920' },
            { label: 'Average Resolution Time', value: '3.2 days' },
            { label: 'Active Users', value: '45,291' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
              <span className="text-4xl font-black text-slate-800 mb-2">{stat.value}</span>
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
