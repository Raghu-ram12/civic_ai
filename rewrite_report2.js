const fs = require('fs');

function rewriteReportPage() {
  let content = fs.readFileSync('src/app/report/page.tsx', 'utf8');

  // Add `complaints` and `updateComplaint` to useMockDb
  content = content.replace(
    /const \{ addComplaint, role, currentUser \} = useMockDb\(\);/,
    `const { addComplaint, role, currentUser, complaints, updateComplaint } = useMockDb();`
  );

  // Update submit to do deduplication
  const submitInsert = `
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return toast('Please provide an image first.', 'error');
    if (formData.category === 'Spam' || formData.category === 'Unknown') {
       toast('Report rejected: System identified this as spam or invalid civic issue.', 'error');
       return;
    }
    
    // Deduplication logic: check if similar category exists in same ward
    const duplicate = complaints.find(c => 
      c.wardNumber === location.wardNumber && 
      c.category === formData.category &&
      c.status !== 'Resolved' &&
      c.status !== 'Rejected'
    );

    if (duplicate) {
      updateComplaint(duplicate.id, {
        duplicateCount: (duplicate.duplicateCount || 0) + 1
      });
      toast(\`Duplicate issue detected! Added to existing report (\${duplicate.id}).\`, 'success');
      router.push('/dashboard');
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

  fs.writeFileSync('src/app/report/page.tsx', content, 'utf8');
}

rewriteReportPage();
