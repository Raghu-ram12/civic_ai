const fs = require('fs');

function rewriteLogin(filePath, role) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add states
  const stateInsert = `
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { resetPassword } = useMockDb();
`;
  content = content.replace('const [password, setPassword] = useState(\'\');', 'const [password, setPassword] = useState(\'\');\n' + stateInsert);

  // Add handlers
  const handlersInsert = `
  const handleSendOtp = (e) => {
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

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpCode === sentOtp || otpCode === '123456') {
      setResetStep(3);
    } else {
      toast('Invalid verification code.', 'error');
    }
  };

  const handleSaveNewPassword = (e) => {
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
      resetPassword(resetEmail, newPassword, '${role}');
      toast('Password reset successfully! You can now sign in.', 'success');
      setIsResetMode(false);
      setResetStep(1);
      setEmail(resetEmail);
      setPassword(newPassword);
      setLoading(false);
    }, 800);
  };
`;
  content = content.replace('const handleLogin = (e: React.FormEvent) => {', handlersInsert + '\n  const handleLogin = (e: React.FormEvent) => {');

  // Update handleLogin to trigger reset flow on failure
  content = content.replace(
    /toast\('Invalid email or password.', 'error'\);\s*setLoading\(false\);|setError\('Invalid official email or password.'\);\s*setLoading\(false\);/,
    `toast('Invalid email or password. Wrong password? Click "Forgot Password" below.', 'error');
        setLoading(false);`
  );

  // Update JSX to render reset form conditionally
  const resetJsx = `
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
                  placeholder="${role === 'officer' ? 'officer@smartcivic.gov' : 'citizen@example.com'}" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-white/90 font-semibold drop-shadow-sm">Password</Label>
                  <button 
                    type="button" 
                    onClick={() => { setIsResetMode(true); setResetEmail(email); }}
                    className="text-xs font-bold text-white hover:underline drop-shadow-md"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="h-12 bg-black/10 border-white/20 text-white focus:ring-white/50 focus:border-white/50 transition-all" 
                />
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
`;
  
  // Replace the existing form block
  const formRegex = /<form onSubmit=\{handleLogin\}[\s\S]*?<\/form>/;
  content = content.replace(formRegex, resetJsx);

  fs.writeFileSync(filePath, content, 'utf8');
}

rewriteLogin('src/app/login/page.tsx', 'citizen');
rewriteLogin('src/app/officer/login/page.tsx', 'officer');
