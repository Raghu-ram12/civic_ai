'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useMockDb } from '@/context/MockDb';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { motion } from 'framer-motion';

export default function OfficerLogin() {
  const router = useRouter();
  const { login, resetPassword } = useMockDb();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setLoading(true);
    setTimeout(() => {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setSentOtp(generatedOtp);
      setResetStep(2);
      setLoading(false);
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode === sentOtp || otpCode === '123456') {
      setResetStep(3);
    } else {
      toast('Invalid verification code.', 'error');
    }
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      toast('Password must be at least 4 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('Passwords do not match.', 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      resetPassword(resetEmail, newPassword, 'officer');
      toast('Password reset successfully! You can now sign in.', 'success');
      setIsResetMode(false);
      setResetStep(1);
      setEmail(resetEmail);
      setPassword(newPassword);
      setLoading(false);
    }, 800);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setTimeout(() => {
      const success = login(email, password, 'officer');
      if (success) {
        router.push('/officer/dashboard');
      } else {
        toast('Invalid email or password. Wrong password? Click "Forgot Password" below.', 'error');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen text-white font-sans p-4 flex items-center justify-center relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <Link href="/" className="text-sm font-bold text-white/80 hover:text-white flex items-center gap-2 drop-shadow-md">
          &larr; Back to Home
        </Link>
        
        <Card className="glass w-full p-8 border-white/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-white/20 rounded-full blur-3xl -z-10" />
          
          <div className="flex flex-col items-center mb-8 relative z-10">
            <div className="bg-white/20 p-3 rounded-2xl mb-4 shadow-inner ring-1 ring-white/30 backdrop-blur-sm">
              <ShieldCheck className="text-white w-8 h-8 drop-shadow-md" />
            </div>
            <h2 className="text-3xl font-extrabold text-white drop-shadow-md">Officer Portal</h2>
            <p className="text-white/80 text-sm mt-1 font-medium tracking-wide">Authorized personnel only</p>
          </div>
          
          {error && <div className="bg-red-500/20 border border-red-500/50 text-white p-3 rounded-xl text-sm font-bold mb-6 shadow-lg backdrop-blur-md flex items-center gap-2">{error}</div>}

          
          {!isResetMode ? (
            <form onSubmit={handleLogin} className="space-y-5 relative z-10">
              <div className="space-y-2">
                <Label className="text-white/90 font-semibold drop-shadow-sm">Email</Label>
                <Input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="h-12 bg-black/10 border-white/20 text-white placeholder:text-white/50 focus:ring-white/50 focus:border-white/50 transition-all" 
                  placeholder="officer@smartcivic.gov" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white/90 font-semibold drop-shadow-sm">Password</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="h-12 bg-black/10 border-white/20 text-white focus:ring-white/50 focus:border-white/50 transition-all pr-12" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex justify-end pt-1">
                  <button 
                    type="button" 
                    onClick={() => { setIsResetMode(true); setResetEmail(email); }}
                    className="text-sm font-black text-blue-300 hover:text-blue-100 hover:underline drop-shadow-lg transition-colors flex items-center gap-1"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-bold bg-white text-violet-900 shadow-xl">
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </motion.div>
            </form>
          ) : (
            <div className="space-y-4 relative z-10">
              {resetStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/90 font-semibold drop-shadow-sm">Registered Email Address</Label>
                    <Input 
                      type="email" 
                      required 
                      value={resetEmail} 
                      onChange={e => setResetEmail(e.target.value)} 
                      className="h-12 bg-black/10 border-white/20 text-white" 
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 font-bold bg-white text-violet-900">
                    {loading ? 'Sending Code...' : 'Send Verification Code'}
                  </Button>
                </form>
              )}
              {resetStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="bg-white/10 p-3 rounded-lg text-xs text-white mb-2 font-medium">
                    Code sent to <b>{resetEmail}</b>. (Demo: {sentOtp} or 123456)
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/90 font-semibold drop-shadow-sm">Enter 6-Digit Code</Label>
                    <Input 
                      type="text" 
                      required 
                      maxLength={6} 
                      value={otpCode} 
                      onChange={e => setOtpCode(e.target.value)} 
                      className="h-12 text-center font-mono text-xl tracking-widest bg-black/10 border-white/20 text-white" 
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 font-bold bg-white text-violet-900">Verify Code</Button>
                </form>
              )}
              {resetStep === 3 && (
                <form onSubmit={handleSaveNewPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/90 font-semibold drop-shadow-sm">New Password</Label>
                    <Input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="h-12 bg-black/10 border-white/20 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/90 font-semibold drop-shadow-sm">Confirm Password</Label>
                    <Input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-12 bg-black/10 border-white/20 text-white" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 font-bold bg-white text-violet-900">
                    {loading ? 'Saving...' : 'Save & Sign In'}
                  </Button>
                </form>
              )}
              <button 
                type="button" 
                onClick={() => { setIsResetMode(false); setResetStep(1); }}
                className="w-full text-center text-xs font-bold text-white/80 hover:text-white pt-2"
              >
                &larr; Return to Sign In
              </button>
            </div>
          )}


          <div className="mt-8 text-center text-sm text-white/80 font-medium relative z-10">
            Are you a new officer? <Link href="/officer/register" className="font-bold text-white hover:underline hover:text-white/90 drop-shadow-md">Register here</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
