'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Status = 'Submitted' | 'AI Validated' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';
export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export type Complaint = {
  id: string;
  title: string;
  category: string;
  summary: string;
  department: string;
  severity: Severity;
  status: Status;
  location: string;
  createdAt: string;
  citizen: string;
  image?: string;
  note?: string;
};

const seedData: Complaint[] = [
  {id:'SC-2026-0842',title:'Pothole on MG Road',category:'Pothole',summary:'Large pothole creating a road safety risk near the junction.',department:'Roads & Infrastructure',severity:'High',status:'In Progress',location:'MG Road, Ward 12',createdAt:'Today, 10:32 AM',citizen:'Aarav Mehta'},
  {id:'SC-2026-0841',title:'Streetlight not working',category:'Broken Street Light',summary:'Streetlight has not been working for three nights.',department:'Electrical',severity:'Medium',status:'Assigned',location:'Park Avenue, Ward 8',createdAt:'Today, 09:17 AM',citizen:'Maya Singh'},
];

type MockDbContextType = {
  complaints: Complaint[];
  addComplaint: (c: Complaint) => void;
  updateComplaint: (id: string, u: Partial<Complaint>) => void;
  role: 'citizen' | 'officer' | null;
  login: (r: 'citizen' | 'officer') => void;
  logout: () => void;
};

const MockDbContext = createContext<MockDbContextType | undefined>(undefined);

export function MockDbProvider({ children }: { children: React.ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(seedData);
  const [role, setRole] = useState<'citizen' | 'officer' | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('smartcivic-mock-db');
    if (saved) {
      try {
        setComplaints(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('smartcivic-mock-db', JSON.stringify(complaints));
  }, [complaints]);

  const addComplaint = (c: Complaint) => setComplaints(x => [c, ...x]);
  
  const updateComplaint = (id: string, update: Partial<Complaint>) => {
    setComplaints(x => x.map(c => c.id === id ? { ...c, ...update } : c));
  };

  const login = (r: 'citizen' | 'officer') => setRole(r);
  const logout = () => setRole(null);

  return (
    <MockDbContext.Provider value={{ complaints, addComplaint, updateComplaint, role, login, logout }}>
      {children}
    </MockDbContext.Provider>
  );
}

export function useMockDb() {
  const context = useContext(MockDbContext);
  if (!context) throw new Error('useMockDb must be used within MockDbProvider');
  return context;
}
