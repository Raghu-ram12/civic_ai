'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useMockDb } from '@/context/MockDb';
import { User, ShieldCheck, Activity, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';

export default function LandingLogin() {
  const router = useRouter();
  const { login, resetPassword } = useMockDb();
  const { toast } = useToast();
  
  const [role, setRole] = useState<'citizen' | 'officer'>('citizen');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password state
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const success = login(email, password, role);
      if (success) {
        toast(`Welcome back, ${role}!`, 'success');
        if (role === 'citizen') {
          router.push('/dashboard');
        } else {
          router.push('/officer/dashboard');
        }
      } else {
        toast('Invalid email or password. Wrong password? Click "Forgot Password" below.', 'error');
        setLoading(false);
      }
    }, 1000);
  };

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
      resetPassword(resetEmail, newPassword, role);
      toast('Password reset successfully! You can now sign in.', 'success');
      setIsResetMode(false);
      setResetStep(1);
      setEmail(resetEmail);
      setPassword(newPassword);
      setLoading(false);
    }, 800);
  };

  const exitResetMode = () => {
    setIsResetMode(false);
    setResetStep(1);
    setResetEmail('');
    setOtpCode('');
    setSentOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-white/20 p-2 rounded-xl ring-1 ring-white/30 shadow-inner backdrop-blur-md">
            <Activity className="text-white w-6 h-6 drop-shadow-md" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">Smart<span className="text-white/70">Civic</span></span>
        </div>
        
        <Card className="glass w-full p-8 border-white/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
          
          {/* Role tabs — hidden in reset mode */}
          {!isResetMode && (
            <div className="flex p-1 bg-black/20 rounded-xl mb-8 border border-white/10 relative z-10">
              <button 
                onClick={() => { setRole('citizen'); setEmail(''); setPassword(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${role === 'citizen' ? 'bg-white text-violet-900 shadow-md' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              >
                <User className="w-4 h-4" /> Citizen
              </button>
              <button 
                onClick={() => { setRole('officer'); setEmail(''); setPassword(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${role === 'officer' ? 'bg-white text-emerald-900 shadow-md' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              >
                <ShieldCheck className="w-4 h-4" /> Officer
              </button>
            </div>
          )}

          <div className="flex flex-col items-center mb-8 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div 
                key={isResetMode ? 'reset' : role}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white/10 p-3 rounded-xl mb-4 shadow-lg shadow-black/5 ring-1 ring-white/20"
              >
                {isResetMode ? (
                  <svg className="text-white w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                ) : role === 'citizen' ? (
                  <User className="text-white w-8 h-8" />
                ) : (
                  <ShieldCheck className="text-white w-8 h-8" />
                )}
              </motion.div>
            </AnimatePresence>
            <h2 className="text-3xl font-extrabold text-white drop-shadow-md">
              {isResetMode ? 'Reset Password' : role === 'citizen' ? 'Citizen Login' : 'Officer Portal'}
            </h2>
            <p className="text-white/80 text-sm mt-1 font-medium">
              {isResetMode
                ? (resetStep === 1 ? 'Enter your registered email' : resetStep === 2 ? 'Check your email for the code' : 'Choose a new password')
                : role === 'citizen' ? 'Sign in to report and track issues' : 'Authorized personnel only'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!isResetMode ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleLogin}
                className="space-y-5 relative z-10"
              >
                <div className="space-y-2">
                  <Label className="text-white/90 font-semibold drop-shadow-sm">
                    {role === 'citizen' ? 'Email Address' : 'Official Email'}
                  </Label>
                  <Input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="h-12 bg-black/10 border-white/20 text-white placeholder:text-white/50 focus:ring-white/50 focus:border-white/50 transition-all" 
                    placeholder={role === 'citizen' ? 'citizen@example.com' : 'officer@smartcivic.gov'} 
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
                      className="text-sm font-black text-blue-300 hover:text-blue-100 hover:underline drop-shadow-lg transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className={`w-full h-12 text-lg font-bold bg-white shadow-xl ${role === 'citizen' ? 'text-violet-900' : 'text-emerald-900'}`}
                  >
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </Button>
                </motion.div>
              </motion.form>
            ) : (
              <motion.div
                key="reset-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4 relative z-10"
              >
                {/* Step progress */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  {[1, 2, 3].map(step => (
                    <div key={step} className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${resetStep >= step ? 'bg-white text-violet-900 border-white' : 'bg-transparent text-white/40 border-white/30'}`}>
                        {resetStep > step ? '✓' : step}
                      </div>
                      {step < 3 && <div className={`w-8 h-0.5 transition-all ${resetStep > step ? 'bg-white' : 'bg-white/20'}`} />}
                    </div>
                  ))}
                </div>

                {resetStep === 1 && (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white/90 font-semibold drop-shadow-sm">Registered Email Address</Label>
                      <Input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={e => setResetEmail(e.target.value)}
                        placeholder={role === 'citizen' ? 'citizen@example.com' : 'officer@smartcivic.gov'}
                        className="h-12 bg-black/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-12 font-bold bg-white text-violet-900">
                      {loading ? 'Sending Code...' : 'Send Verification Code'}
                    </Button>
                  </form>
                )}

                {resetStep === 2 && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="bg-white/10 p-3 rounded-lg text-xs text-white font-medium">
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
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="h-12 bg-black/10 border-white/20 text-white pr-12"
                        />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/90 font-semibold drop-shadow-sm">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="h-12 bg-black/10 border-white/20 text-white pr-12"
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-12 font-bold bg-white text-violet-900">
                      {loading ? 'Saving...' : 'Save & Sign In'}
                    </Button>
                  </form>
                )}

                <button
                  type="button"
                  onClick={exitResetMode}
                  className="w-full text-center text-xs font-bold text-white/80 hover:text-white pt-2 transition-colors"
                >
                  &larr; Return to Sign In
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center text-sm text-white/80 font-medium relative z-10">
            {!isResetMode && (
              role === 'citizen' ? (
                <>Don't have an account? <Link href="/register" className="font-bold text-white hover:underline hover:text-white/90 drop-shadow-md">Sign up</Link></>
              ) : (
                <>Are you a new officer? <Link href="/officer/register" className="font-bold text-white hover:underline hover:text-white/90 drop-shadow-md">Register here</Link></>
              )
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
