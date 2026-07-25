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
  locality?: string;
  cityOrVillage?: string;
  state?: string;
  pincode?: string;
  wardNumber?: string; // For officers
};

export type Complaint = {
  id: string;
  title: string;
  category: string;
  summary: string;
  detailedDescription?: string;
  department: string;
  severity: Severity;
  status: Status;
  location: string;
  wardNumber?: string;
  locality?: string;
  lat?: number;
  lng?: number;
  createdAt: string;
  estimatedTime?: string;
  citizen: string;
  citizenId?: string;
  image?: string;
  note?: string;
  spam?: boolean;
  duplicateCount?: number;
};

export const defaultOfficers: User[] = [
  {
    id: 'off-12-elec',
    name: 'Inspector Vikram Kulkarni',
    email: 'officer.electrical@smartcivic.gov',
    password: 'electric123',
    role: 'officer',
    department: 'Electrical & Power Services',
    wardNumber: 'Ward 12',
    phone: '+91 98765 43210',
    locality: 'MG Road / Park Avenue Zone'
  },
  {
    id: 'off-12-road',
    name: 'Engineer Rajesh Sharma',
    email: 'officer.roads@smartcivic.gov',
    password: 'roads123',
    role: 'officer',
    department: 'Roads & Traffic Infrastructure',
    wardNumber: 'Ward 12',
    phone: '+91 98765 43211',
    locality: 'MG Road / Central Zone'
  },
  {
    id: 'off-8-water',
    name: 'Officer Priya Nambiar',
    email: 'officer.water@smartcivic.gov',
    password: 'water123',
    role: 'officer',
    department: 'Water Supply & Drainage',
    wardNumber: 'Ward 8',
    phone: '+91 98765 43212',
    locality: 'Church Street Zone'
  },
  {
    id: 'off-4-sani',
    name: 'Superintendent Ramesh Kumar',
    email: 'officer.sanitation@smartcivic.gov',
    password: 'sanitation123',
    role: 'officer',
    department: 'Sanitation & Waste Management',
    wardNumber: 'Ward 4',
    phone: '+91 98765 43213',
    locality: 'Commercial Market Zone'
  },
  {
    id: 'off-2-health',
    name: 'Dr. Sunita Deshmukh',
    email: 'officer.health@smartcivic.gov',
    password: 'health123',
    role: 'officer',
    department: 'Public Health & Disease Control',
    wardNumber: 'Ward 2',
    phone: '+91 98765 43214',
    locality: 'HSR Layout Zone'
  }
];

const seedData: Complaint[] = [
  {
    id: 'SC-2026-0842',
    title: 'Broken Live Electric Wire hanging near school',
    category: 'Broken Live Electric Wire',
    summary: 'Exposed live wire hanging low across main pathway posing severe safety threat.',
    detailedDescription: 'Near Municipal School Gate 2, a live overhead electrical wire snapped during heavy wind and is sparking near pedestrian crossing. Immediate cutoff and repair needed to prevent casualties.',
    department: 'Electrical & Power Services',
    severity: 'Critical',
    status: 'AI Validated',
    location: 'Near Municipal School Gate #2, MG Road, Ward 12, Bangalore',
    wardNumber: 'Ward 12',
    locality: 'MG Road Junction',
    estimatedTime: '24 Hours (Urgent Hazard)',
    createdAt: 'Today, 10:32 AM',
    citizen: 'Aarav Mehta'
  },
  {
    id: 'SC-2026-0841',
    title: 'Deep Pothole on Main Road',
    category: 'Deep Pothole / Damaged Road',
    summary: 'Large pothole creating a road safety risk near the junction.',
    detailedDescription: 'A 2-foot wide deep crater formed on the left lane after rain causing frequent traffic slowdowns and bike skids.',
    department: 'Roads & Traffic Infrastructure',
    severity: 'High',
    status: 'In Progress',
    location: 'Sector 4, MG Road, Ward 12, Bangalore',
    wardNumber: 'Ward 12',
    locality: 'MG Road Sector 4',
    estimatedTime: '48 Hours',
    createdAt: 'Today, 09:17 AM',
    citizen: 'Aarav Mehta'
  },
  {
    id: 'SC-2026-0840',
    title: 'Open Manhole without Cover',
    category: 'Open Manhole / Missing Cover',
    summary: 'Missing manhole cover on busy pedestrian sidewalk posing severe falling risk.',
    detailedDescription: 'Drainage chamber cover broken and open near bus stop. Need urgent barricading and replacement before evening rush hour.',
    department: 'Water Supply & Drainage',
    severity: 'Critical',
    status: 'Assigned',
    location: 'Near Metro Pillar #14, Church Street, Ward 8, Bangalore',
    wardNumber: 'Ward 8',
    locality: 'Church Street',
    estimatedTime: '24 Hours (Urgent Hazard)',
    createdAt: 'Today, 08:30 AM',
    citizen: 'Rohan Verma'
  },
  {
    id: 'SC-2026-0839',
    title: 'Uncollected Commercial Garbage Dumping',
    category: 'Uncollected Garbage & Illegal Dumping',
    summary: 'Large accumulation of rotting organic garbage blocking market entrance.',
    detailedDescription: 'Dumpster overflowed for 4 days creating stench and breeding flies near local vegetable market.',
    department: 'Sanitation & Waste Management',
    severity: 'High',
    status: 'AI Validated',
    location: 'Market Gate 3, Commercial Street, Ward 4, Bangalore',
    wardNumber: 'Ward 4',
    locality: 'Commercial Street',
    estimatedTime: '48 Hours',
    createdAt: 'Yesterday, 04:15 PM',
    citizen: 'Priya Sharma'
  },
  {
    id: 'SC-2026-0838',
    title: 'Fallen Tree Branch Blocking Lane',
    category: 'Fallen Tree / Danger Branch',
    summary: 'Heavy oak tree branch snapped blocking two-wheeler traffic.',
    detailedDescription: 'Heavy storm snapped a main branch onto residential street wiring and road entrance.',
    department: 'Parks & Horticulture',
    severity: 'Medium',
    status: 'In Progress',
    location: 'Cross 4, Indiranagar 10th Main, Ward 12, Bangalore',
    wardNumber: 'Ward 12',
    locality: 'Indiranagar',
    estimatedTime: '48 Hours',
    createdAt: 'Yesterday, 02:20 PM',
    citizen: 'Suresh Kumar'
  },
  {
    id: 'SC-2026-0837',
    title: 'Streetlight out for 3 consecutive nights',
    category: 'Streetlight Outage / Dark Alley',
    summary: 'Pole #42 opposite Park Avenue community hall bulb broken.',
    detailedDescription: 'The entire residential lane is pitch dark at night creating safety concerns for late commuters.',
    department: 'Electrical & Power Services',
    severity: 'Medium',
    status: 'Assigned',
    location: 'Opposite Community Hall, Park Avenue, Ward 12, Bangalore',
    wardNumber: 'Ward 12',
    locality: 'Park Avenue',
    estimatedTime: '72 Hours',
    createdAt: 'Yesterday, 06:45 PM',
    citizen: 'Maya Singh'
  },
  {
    id: 'SC-2026-0836',
    title: 'Water Stagnation & Mosquito Breeding Risk',
    category: 'Waterlogging & Mosquito Breeding',
    summary: 'Stagnant rainwater in open vacant plot raising dengue concerns.',
    detailedDescription: 'Water pooling for over a week near residential block B. Needs anti-larval spraying and pumping.',
    department: 'Public Health & Disease Control',
    severity: 'High',
    status: 'AI Validated',
    location: 'Vacant Plot #88, HSR Layout Sector 2, Ward 2, Bangalore',
    wardNumber: 'Ward 2',
    locality: 'HSR Layout',
    estimatedTime: '48 Hours',
    createdAt: '2 days ago',
    citizen: 'Ananya Rao'
  }
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
  resetPassword: (email: string, newPass: string, expectedRole: Role) => boolean;
  getOfficerInCharge: (wardNumber?: string, department?: string) => User;
};

const MockDbContext = createContext<MockDbContextType | undefined>(undefined);

export function MockDbProvider({ children }: { children: React.ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>(seedData);
  const [users, setUsers] = useState<User[]>(defaultOfficers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedComplaints = localStorage.getItem('smartcivic-complaints');
    if (savedComplaints) {
      try { setComplaints(JSON.parse(savedComplaints)); } catch (e) {}
    }
    
    const savedUsers = localStorage.getItem('smartcivic-users');
    if (savedUsers) {
      try {
        const parsed: User[] = JSON.parse(savedUsers);
        // Merge: keep saved non-default users, always use defaultOfficers for their IDs
        const defaultIds = new Set(defaultOfficers.map(o => o.id));
        const nonDefaults = parsed.filter(u => !defaultIds.has(u.id));
        setUsers([...defaultOfficers, ...nonDefaults]);
      } catch (e) {}
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
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass && u.role === expectedRole);
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

  const resetPassword = (email: string, newPass: string, expectedRole: Role) => {
    const targetIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase() && u.role === expectedRole);
    if (targetIndex !== -1) {
      const updatedUsers = [...users];
      updatedUsers[targetIndex] = { ...updatedUsers[targetIndex], password: newPass };
      setUsers(updatedUsers);
      if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
        setCurrentUser({ ...currentUser, password: newPass });
      }
      return true;
    }
    // If user is not yet in mock users list (e.g. demo mode), create a user entry with new password
    const newUser: User = {
      id: 'usr_' + Date.now(),
      email: email,
      name: email.split('@')[0],
      password: newPass,
      role: expectedRole
    };
    setUsers(x => [...x, newUser]);
    return true;
  };

  const getOfficerInCharge = (wardNumber?: string, department?: string): User => {
    const targetWard = (wardNumber || 'Ward 12').trim().toLowerCase();
    const targetDept = (department || '').trim().toLowerCase();

    // 1. Search registered users
    const matchedRegistered = users.find(u => 
      u.role === 'officer' && 
      ((u.wardNumber || '').toLowerCase().includes(targetWard) || targetWard.includes((u.wardNumber || '').toLowerCase())) &&
      (!targetDept || (u.department || '').toLowerCase().includes(targetDept))
    );
    if (matchedRegistered) return matchedRegistered;

    // 2. Search default officers
    const matchedDefault = defaultOfficers.find(o => 
      ((o.wardNumber || '').toLowerCase().includes(targetWard) || targetWard.includes((o.wardNumber || '').toLowerCase())) &&
      (!targetDept || (o.department || '').toLowerCase().includes(targetDept))
    );
    if (matchedDefault) return matchedDefault;

    // 3. Fallback to ward officer
    const wardFallback = defaultOfficers.find(o => (o.wardNumber || '').toLowerCase().includes(targetWard));
    if (wardFallback) return wardFallback;

    return defaultOfficers[0];
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
      updateProfile,
      resetPassword,
      getOfficerInCharge
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
