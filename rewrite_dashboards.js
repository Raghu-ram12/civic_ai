const fs = require('fs');
const path = require('path');

function rewriteDashboards() {
  const dashboardPath = 'src/app/dashboard/page.tsx';
  let dashContent = fs.readFileSync(dashboardPath, 'utf8');

  // Change filter logic
  dashContent = dashContent.replace(
    /const \{ complaints, role, logout \} = useMockDb\(\);/,
    `const { complaints, role, logout, currentUser } = useMockDb();`
  );

  dashContent = dashContent.replace(
    /const myComplaints = complaints\.filter\(c => c\.citizen === 'Citizen User' \|\| c\.citizen === 'Aarav Mehta'\);/,
    `const myComplaints = complaints.filter(c => currentUser && (c.citizenId === currentUser.id || c.citizen === currentUser.name));`
  );

  // Add City Dashboard link in Header
  const navButtons = `
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => router.push('/city-dashboard')} className="glass bg-blue-500/20 hover:bg-blue-500/40 border-blue-500/30 font-bold gap-2 shadow-lg h-10 px-4">
                City Dashboard
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => router.push('/report')} className="bg-white text-violet-900 hover:bg-white/90 font-bold gap-2 shadow-lg h-10 px-4">
`;
  dashContent = dashContent.replace(
    /<motion\.div whileHover=\{\{ scale: 1\.05 \}\} whileTap=\{\{ scale: 0\.95 \}\}>\s*<Button onClick=\{\(\) => router\.push\('\/report'\)\}/,
    navButtons
  );

  // Add Departments tab link
  const depsLink = `
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => router.push('/departments')} variant="outline" className="glass bg-white/10 hover:bg-white/20 border-white/30 text-white font-bold shadow-md h-10 px-4">
                Departments
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => router.push('/profile')}
`;
  dashContent = dashContent.replace(
    /<motion\.div whileHover=\{\{ scale: 1\.05 \}\} whileTap=\{\{ scale: 0\.95 \}\}>\s*<Button onClick=\{\(\) => router\.push\('\/profile'\)\}/,
    depsLink
  );

  fs.writeFileSync(dashboardPath, dashContent, 'utf8');

  // Create City Dashboard
  let cityDashContent = dashContent;
  cityDashContent = cityDashContent.replace(/export default function CitizenDashboard\(\) \{/, 'export default function CityDashboard() {');
  cityDashContent = cityDashContent.replace(/Welcome back, Citizen/, 'City-wide Complaints');
  cityDashContent = cityDashContent.replace(/Citizen Dashboard/g, 'City Dashboard');
  cityDashContent = cityDashContent.replace(/const myComplaints = complaints\.filter\([\s\S]*?\);/, 'const myComplaints = complaints;');
  cityDashContent = cityDashContent.replace(
    /<Button onClick=\{\(\) => router\.push\('\/city-dashboard'\)\}[\s\S]*?City Dashboard\n\s*<\/Button>/,
    `<Button onClick={() => router.push('/dashboard')} className="glass bg-emerald-500/20 hover:bg-emerald-500/40 border-emerald-500/30 font-bold gap-2 shadow-lg h-10 px-4">
                My Dashboard
              </Button>`
  );
  
  if (!fs.existsSync('src/app/city-dashboard')) {
      fs.mkdirSync('src/app/city-dashboard', { recursive: true });
  }
  fs.writeFileSync('src/app/city-dashboard/page.tsx', cityDashContent, 'utf8');
}

rewriteDashboards();
