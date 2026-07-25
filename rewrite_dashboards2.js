const fs = require('fs');

function rewriteDashboards() {
  // 1. Rewrite Officer Dashboard
  let offDashContent = fs.readFileSync('src/app/officer/dashboard/page.tsx', 'utf8');

  // Change sort/filter logic to include Deadlines
  offDashContent = offDashContent.replace(
    /const visible = filter === 'All' \? complaints : complaints\.filter\(c => c\.status === filter\);/,
    `let visible = filter === 'All' ? complaints : complaints.filter(c => c.status === filter);
  if (filter === 'Deadlines / Priority') {
    const severityScore = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
    visible = [...complaints].filter(c => c.status !== 'Resolved').sort((a, b) => (severityScore[b.severity as keyof typeof severityScore] || 0) - (severityScore[a.severity as keyof typeof severityScore] || 0));
  }`
  );

  // Add Deadlines filter option
  offDashContent = offDashContent.replace(
    /\{(?:\[|'All', 'AI Validated', 'Assigned', 'In Progress', 'Resolved'\])\.map\(f => \(/,
    `{['All', 'Deadlines / Priority', 'AI Validated', 'Assigned', 'In Progress', 'Resolved'].map(f => (`
  );

  // Add deduplication count in the list and fix view details
  const issueRender = `
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-black text-white/60 text-xs uppercase tracking-widest bg-black/20 px-2 py-1 rounded-md">{c.id}</span>
                    <span className={\`text-xs font-bold px-3 py-1 rounded-md shadow-sm ring-1 \${
                      c.severity === 'Critical' || c.severity === 'High' ? 'bg-red-500/20 text-red-100 ring-red-500/50' : 'bg-white/10 text-white/90 ring-white/30'
                    }\`}>
                      {c.severity} Priority
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-md bg-white/20 text-white shadow-sm ring-1 ring-white/30 backdrop-blur-sm">{c.department}</span>
                    {c.duplicateCount && c.duplicateCount > 0 ? (
                      <span className="text-xs font-bold px-3 py-1 rounded-md bg-blue-500/20 text-blue-100 ring-1 ring-blue-500/50">
                        {c.duplicateCount} Similar Reports
                      </span>
                    ) : null}
                  </div>
                  <h3 className="font-bold text-xl drop-shadow-sm">{c.title}</h3>
                  <p className="text-sm text-white/80 flex items-center gap-1 font-medium"><MapPin className="w-4 h-4 opacity-70" /> {c.location}</p>
                </div>
`;
  offDashContent = offDashContent.replace(
    /<div className="flex-1 space-y-3">[\s\S]*?<\/div>\n\s*<div className="flex flex-col gap-2 min-w-\[150px\] mt-4 sm:mt-0">/,
    issueRender + '\n                <div className="flex flex-col gap-2 min-w-[150px] mt-4 sm:mt-0">'
  );

  // Fix View Details button
  offDashContent = offDashContent.replace(
    /<Button variant="outline" size="sm" className="w-full glass hover:bg-white\/10 border-white\/30 transition-all">View Details<\/Button>/,
    `<Button variant="outline" size="sm" className="w-full glass hover:bg-white/10 border-white/30 transition-all" onClick={() => router.push(\`/track?id=\${c.id}\`)}>View Details</Button>`
  );

  fs.writeFileSync('src/app/officer/dashboard/page.tsx', offDashContent, 'utf8');

  // 2. Rewrite Track Page
  let trackContent = fs.readFileSync('src/app/track/page.tsx', 'utf8');

  // Add estimated time and deduplication info
  const extraInfoJsx = `
                <div>
                  <Label className="text-xs text-white/60 uppercase font-bold tracking-widest block mb-2">Summary</Label>
                  <p className="text-md text-white/90 bg-black/20 p-4 rounded-xl border border-white/10 shadow-inner mb-4">
                    {result.summary}
                  </p>
                  {result.detailedDescription && (
                    <div className="mt-4">
                      <Label className="text-xs text-white/60 uppercase font-bold tracking-widest block mb-2">Detailed Description</Label>
                      <p className="text-md text-white/90 bg-black/20 p-4 rounded-xl border border-white/10 shadow-inner">
                        {result.detailedDescription}
                      </p>
                    </div>
                  )}
                  {result.estimatedTime && (
                    <div className="mt-4">
                      <Label className="text-xs text-white/60 uppercase font-bold tracking-widest block mb-2">Estimated Time for Resolution</Label>
                      <p className="text-md font-bold text-orange-200 bg-orange-500/20 p-3 rounded-xl border border-orange-500/30 shadow-inner">
                        <Clock className="w-4 h-4 inline mr-2 mb-1" /> {result.estimatedTime}
                      </p>
                    </div>
                  )}
                  {result.duplicateCount && result.duplicateCount > 0 ? (
                    <div className="mt-4">
                      <Label className="text-xs text-white/60 uppercase font-bold tracking-widest block mb-2">Community Impact</Label>
                      <p className="text-md font-bold text-blue-200 bg-blue-500/20 p-3 rounded-xl border border-blue-500/30 shadow-inner">
                        {result.duplicateCount} other citizens have reported this same issue.
                      </p>
                    </div>
                  ) : null}
                </div>
`;
  trackContent = trackContent.replace(
    /<div>\n\s*<Label className="text-xs text-white\/60 uppercase font-bold tracking-widest block mb-2">Summary<\/Label>\n\s*<p className="text-md text-white\/90 bg-black\/20 p-4 rounded-xl border border-white\/10 shadow-inner">\n\s*\{result\.summary\}\n\s*<\/p>\n\s*<\/div>/,
    extraInfoJsx
  );

  fs.writeFileSync('src/app/track/page.tsx', trackContent, 'utf8');
}

rewriteDashboards();
