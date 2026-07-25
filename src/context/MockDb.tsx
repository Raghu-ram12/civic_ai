'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Status = 'Submitted' | 'AI Validated' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';
export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type Role = 'citizen' | 'officer';

export type User = {
  id: string;
  email: string;
  name: string;
  password?: string; // In a real app this would be hashed, mocked for now
  role: Role;
  phone?: string;
  department?: string; // For officers
  badgeNumber?: string; // For officers
};

export type Complaint = {
  id: string;
  title: string;
  category: string;
  summary: string;
  department: string;
  severity: Severity;
  status: Status;
  location: string;
  lat?: number;
  lng?: number;
  createdAt: string;
  citizen: string;
  citizenId?: string;
  image?: string;
  note?: string;
};

const seedData: Complaint[] = [
  {id:'SC-2026-0842',title:'Pothole on MG Road',category:'Pothole',summary:'Large pothole creating a road safety risk near the junction.',department:'Roads & Infrastructure',severity:'High',status:'In Progress',location:'MG Road, Bangalore',createdAt:'Today, 10:32 AM',citizen:'Aarav Mehta'},
  {id:'SC-2026-0841',title:'Streetlight not working',category:'Broken Street Light',summary:'Streetlight has not been working for three nights.',department:'Electrical',severity:'Medium',status:'Assigned',location:'Park Avenue, Bangalore',createdAt:'Today, 09:17 AM',citizen:'Maya Singh'},
];

type MockDbContextType = {
  complaints: Complaint[];
  users: User[];
  currentUser: User | null;
  role: Role | null;
  addComplaint: (c: Complaint) => void;
  updateComplaint: (id: string, u: Partial<Complaint>) => void;
  register: (u: User) => boolean;
  login: (email: string, pass: string, expectedRole: Role) => boolean;
  logout: () => void;
  updateProfile: (u: Partial<User>) => void;
};

const MockDbContext = createContext<MockDbContextType | undefined>(undefined);

export function MockDbProvider({ children }: { children: React.ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(seedData);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedComplaints = localStorage.getItem('smartcivic-complaints');
    if (savedComplaints) {
      try { setComplaints(JSON.parse(savedComplaints)); } catch (e) {}
    }
    
    const savedUsers = localStorage.getItem('smartcivic-users');
    if (savedUsers) {
      try { setUsers(JSON.parse(savedUsers)); } catch (e) {}
    }
    
    const savedCurrentUser = localStorage.getItem('smartcivic-current-user');
    if (savedCurrentUser) {
      try { setCurrentUser(JSON.parse(savedCurrentUser)); } catch (e) {}
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('smartcivic-complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('smartcivic-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('smartcivic-current-user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('smartcivic-current-user');
    }
  }, [currentUser]);

  const addComplaint = (c: Complaint) => setComplaints(x => [c, ...x]);
  
  const updateComplaint = (id: string, update: Partial<Complaint>) => {
    setComplaints(x => x.map(c => c.id === id ? { ...c, ...update } : c));
  };

  const register = (newUser: User) => {
    if (users.find(u => u.email === newUser.email)) return false; // Email exists
    setUsers(x => [...x, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const login = (email: string, pass: string, expectedRole: Role) => {
    const user = users.find(u => u.email === email && u.password === pass && u.role === expectedRole);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);
  
  const updateProfile = (update: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...update };
    setCurrentUser(updatedUser);
    setUsers(x => x.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  return (
    <MockDbContext.Provider value={{ 
      complaints, 
      users,
      currentUser, 
      role: currentUser?.role || null,
      addComplaint, 
      updateComplaint, 
      register, 
      login, 
      logout,
      updateProfile
    }}>
      {children}
    </MockDbContext.Provider>
  );
}

export function useMockDb() {
  const context = useContext(MockDbContext);
  if (!context) throw new Error('useMockDb must be used within MockDbProvider');
  return context;
}
