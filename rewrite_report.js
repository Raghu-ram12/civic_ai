const fs = require('fs');

function rewriteReportPage() {
  let content = fs.readFileSync('src/app/report/page.tsx', 'utf8');

  // Add state for detailed description
  content = content.replace(
    /summary: '',\n\s*department: '',/,
    `summary: '',
    department: '',
    detailedDescription: '',`
  );

  // Add state for ward/locality detection
  content = content.replace(
    /const \[location, setLocation\] = useState\(\{ lat: 0, lng: 0, text: '' \}\);/,
    `const [location, setLocation] = useState({ lat: 0, lng: 0, text: '', wardNumber: '', locality: '' });`
  );

  // Update getLocation to mock ward/locality
  const getLocReplacement = `
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
            text: \`\${mockLocality}, \${mockWard} (\${pos.coords.latitude.toFixed(4)}, \${pos.coords.longitude.toFixed(4)})\`,
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
`;
  content = content.replace(/const getLocation = \(\) => \{[\s\S]*?\};\n/, getLocReplacement);

  // Add checking for deduplication and spam inside submit
  const submitInsert = `
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return toast('Please provide an image first.', 'error');
    if (formData.category === 'Spam' || formData.category === 'Unknown') {
       toast('Report rejected: System identified this as spam or invalid civic issue.', 'error');
       return;
    }
    
    const newComplaint: Complaint = {
      id: 'SC-2026-' + Math.floor(1000 + Math.random() * 9000),
      title: \`\${formData.category || 'Issue'} Reported\`,
      category: formData.category || 'Unknown',
      severity: (formData.severity as any) || 'Medium',
      summary: formData.summary || 'User submitted issue.',
      detailedDescription: formData.detailedDescription,
      department: formData.department || 'General',
      status: 'AI Validated',
      location: location.text || 'Location Unknown',
      lat: location.lat || undefined,
      lng: location.lng || undefined,
      wardNumber: location.wardNumber || undefined,
      locality: location.locality || undefined,
      createdAt: new Date().toLocaleString(),
      citizen: currentUser ? currentUser.name : 'Citizen User',
      citizenId: currentUser ? currentUser.id : undefined,
      image: image,
      duplicateCount: 0
    };
    addComplaint(newComplaint);
    toast('Complaint submitted successfully!', 'success');
    router.push('/dashboard');
  };
`;
  content = content.replace(/const handleSubmit = \(e: React\.FormEvent\) => \{[\s\S]*?router\.push\('\/dashboard'\);\n\s*\};/, submitInsert);

  // Add detailed description input in JSX
  const detailJsx = `
                <div className="space-y-2">
                  <Label className="text-white/80 text-xs font-bold uppercase tracking-widest">Additional Details</Label>
                  <Textarea 
                    value={formData.detailedDescription} 
                    onChange={e => setFormData({...formData, detailedDescription: e.target.value})} 
                    placeholder="Provide any extra details about the issue..."
                    className="bg-black/20 border-white/20 text-white font-medium focus-visible:ring-white/50" 
                    rows={4} 
                  />
                </div>
              </motion.div>
`;
  content = content.replace(/<\/div>\n\s*<\/motion\.div>\n\s*\)\}/, detailJsx + '            )}');

  fs.writeFileSync('src/app/report/page.tsx', content, 'utf8');
}

rewriteReportPage();
