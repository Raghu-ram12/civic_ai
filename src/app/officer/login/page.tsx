'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useMockDb } from '@/context/MockDb';
import { ShieldCheck } from 'lucide-react';

export default function OfficerLogin() {
  const router = useRouter();
  const { login, resetPassword } = useMockDb();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Reset password states
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP, 3: New Password
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    setTimeout(() => {
      const success = login(email, password, 'officer');
      if (success) {
        router.push('/officer/dashboard');
      } else {
        setError('Invalid official email or password. Wrong password? Click "Forgot Password" below.');
        setLoading(false);
      }
    }, 800);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setLoading(true);
    setError('');
    setTimeout(() => {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setSentOtp(generatedOtp);
      setResetStep(2);
      setLoading(false);
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (otpCode === sentOtp || otpCode === '123456') {
      setResetStep(3);
    } else {
      setError('Invalid verification code. Please check your email or enter 123456.');
    }
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      resetPassword(resetEmail, newPassword, 'officer');
      setSuccessMsg('Official password reset successfully! You can now log in with your new credentials.');
      setIsResetMode(false);
      setResetStep(1);
      setEmail(resetEmail);
      setPassword(newPassword);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md space-y-4">
        <Link href="/" className="text-sm font-bold text-slate-500 hover:text-slate-800 flex items-center gap-2">
          &larr; Back to Home
        </Link>
        
        <Card className="w-full p-8 shadow-xl border-0 ring-1 ring-slate-200">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-emerald-600 p-3 rounded-xl mb-4 shadow-lg shadow-emerald-200">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800">
              {isResetMode ? 'Reset Officer Credentials' : 'Officer Portal'}
            </h2>
            <p className="text-slate-500 text-sm mt-1 text-center">
              {isResetMode 
                ? 'Verify official email to set new password' 
                : 'Authorized municipal personnel only'}
            </p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm font-bold mb-4">{error}</div>}
          {successMsg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-sm font-bold mb-4">{successMsg}</div>}

          {!isResetMode ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Official Email</Label>
                <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="h-12" placeholder="officer@smartcivic.gov" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Password</Label>
                  <button 
                    type="button" 
                    onClick={() => { setIsResetMode(true); setResetEmail(email); setError(''); }}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="h-12" />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700 font-bold">
                {loading ? 'Authenticating...' : 'Secure Login'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {resetStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Registered Official Email</Label>
                    <Input 
                      type="email" 
                      required 
                      value={resetEmail} 
                      onChange={e => setResetEmail(e.target.value)} 
                      className="h-12" 
                      placeholder="officer@smartcivic.gov" 
                    />
                    <p className="text-xs text-slate-400">We will send an official verification code to this address.</p>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700 font-bold">
                    {loading ? 'Sending Verification Code...' : 'Send Verification Code'}
                  </Button>
                </form>
              )}

              {resetStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="bg-emerald-50 p-3 rounded-lg text-xs text-emerald-800 mb-2 font-medium">
                    Verification code sent to <b>{resetEmail}</b>.<br />
                    <span className="font-bold text-emerald-950">Demo Verification Code: {sentOtp} (or enter 123456)</span>
                  </div>
                  <div className="space-y-2">
                    <Label>Enter 6-Digit Verification Code</Label>
                    <Input 
                      type="text" 
                      required 
                      maxLength={6} 
                      value={otpCode} 
                      onChange={e => setOtpCode(e.target.value)} 
                      className="h-12 text-center font-mono text-xl tracking-widest" 
                      placeholder="123456" 
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700 font-bold">
                    Verify Code
                  </Button>
                </form>
              )}

              {resetStep === 3 && (
                <form onSubmit={handleSaveNewPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input 
                      type="password" 
                      required 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      className="h-12" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input 
                      type="password" 
                      required 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      className="h-12" 
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 text-lg bg-emerald-700 hover:bg-emerald-800 font-bold">
                    {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
                  </Button>
                </form>
              )}

              <button 
                type="button" 
                onClick={() => { setIsResetMode(false); setResetStep(1); setError(''); }}
                className="w-full text-center text-xs font-bold text-slate-500 hover:text-slate-800 pt-2"
              >
                &larr; Return to Secure Login
              </button>
            </div>
          )}

          {!isResetMode && (
            <div className="mt-6 text-center text-sm text-slate-500">
              Are you a new officer? <Link href="/officer/register" className="font-bold text-emerald-600 hover:underline">Register here</Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
