const fs = require('fs');

function addToggleAndFixForgot(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add Eye, EyeOff to lucide-react imports
  if (!content.includes('Eye,')) {
    content = content.replace(/import \{ ([^}]+) \} from 'lucide-react';/, (match, p1) => {
      return `import { ${p1}, Eye, EyeOff } from 'lucide-react';`;
    });
  }

  // Add showPassword state
  if (!content.includes('const [showPassword')) {
    content = content.replace(
      /const \[password, setPassword\] = useState\(''\);/,
      `const [password, setPassword] = useState('');\n  const [showPassword, setShowPassword] = useState(false);`
    );
  }

  // Replace password block
  const oldPasswordBlockRegex = /<div className="space-y-2">\s*<div className="flex justify-between items-center">\s*<Label className="text-white\/90 font-semibold drop-shadow-sm">Password<\/Label>\s*<button[\s\S]*?<\/button>\s*<\/div>\s*<Input[\s\S]*?type="password"[\s\S]*?\/>\s*<\/div>/;
  
  const newPasswordBlock = `<div className="space-y-2">
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
              </div>`;
              
  content = content.replace(oldPasswordBlockRegex, newPasswordBlock);
  fs.writeFileSync(filePath, content, 'utf8');
}

addToggleAndFixForgot('src/app/login/page.tsx');
addToggleAndFixForgot('src/app/officer/login/page.tsx');
