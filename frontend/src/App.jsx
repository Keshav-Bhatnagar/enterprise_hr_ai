import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppShell from './components/AppShell';
import RoleThrowableDeck from './components/RoleThrowableDeck';
import EmployeeWorkstation from './components/workspaces/EmployeeWorkstation';
import ManagerCockpit from './components/workspaces/ManagerCockpit';
import AuditorChamber from './components/workspaces/AuditorChamber';
import AdminCommandCenter from './components/workspaces/AdminCommandCenter';

// DEMO PERSONAS FOR INSTANT 1-CLICK AUTHENTICATION
const DEMO_PERSONAS = [
  {
    id: 'admin',
    username: 'admin',
    password: 'admin123',
    name: 'Priya Sharma',
    role: 'HR_ADMIN',
    title: 'Chief Human Resources Officer (CHRO)',
    avatar: 'PS',
    badge: '👑 HR Admin (Tier 1)',
    desc: 'Unrestricted enterprise oversight: 3D Talent Prism, Attrition War Room, ATS Hiring, and Payroll Engine.'
  },
  {
    id: 'manager',
    username: 'manager',
    password: 'admin123',
    name: 'Kavita Desai',
    role: 'MANAGER',
    title: 'Director of Engineering & Platform',
    avatar: 'KD',
    badge: '👔 Engineering Manager (Tier 2)',
    desc: 'Department operations: Team 3D Talent Prism, 1-click Leave Approvals, and Team Retention Simulator.'
  },
  {
    id: 'employee',
    username: 'employee',
    password: 'employee123',
    name: 'Vikramaditya Rao',
    role: 'EMPLOYEE',
    title: 'Principal AI Systems Scientist',
    avatar: 'VR',
    badge: '👤 Employee Portal (Tier 4)',
    desc: 'Personal workstation: Leave ledger & requests, itemized monthly pay slip, and confidential pulse.'
  },
  {
    id: 'auditor',
    username: 'auditor',
    password: 'admin123',
    name: 'Adv. Rajiv Nair',
    role: 'AUDITOR',
    title: 'DPDP Data Protection Officer (DPO)',
    avatar: 'RN',
    badge: '🔒 DPDP Compliance Officer (Tier 3)',
    desc: 'Statutory oversight: DPDP Act 2023 §8(1) audit ledger, EEOC 80% algorithmic bias review, and data retention.'
  }
];

// INITIAL WORKFORCE ROSTER FOR SPATIAL 3D PRISM
const INITIAL_EMPLOYEES = [
  {
    global_id: 1977757544,
    name: "Christopher Benson",
    masked_name: "C*** B***",
    pseudo_id: "EMP_AC99",
    job_role: "Lead Platform Architect",
    department: "Engineering",
    monthly_salary: 115000,
    salary_band: "₹1,00,000 - ₹1,25,000/mo",
    overtime_hours: 42,
    attrition_probability: 0.9948,
    risk_tier: "HIGH",
    years_at_company: 4.2,
    avatar: "CB",
    reason: "Chronic Overtime (42h) + Compensation Lag",
    perf: 5.0,
    pot: 4.9,
    leaves_taken: 2
  },
  {
    global_id: 2841902113,
    name: "Priya Sundaram",
    masked_name: "P*** S***",
    pseudo_id: "EMP_5F12",
    job_role: "Senior Product Manager",
    department: "Product",
    monthly_salary: 135000,
    salary_band: "₹1,25,000 - ₹1,50,000/mo",
    overtime_hours: 24,
    attrition_probability: 0.682,
    risk_tier: "MEDIUM",
    years_at_company: 2.8,
    avatar: "PS",
    reason: "High Market Demand + Work-Life Balance Dip",
    perf: 4.2,
    pot: 4.5,
    leaves_taken: 5
  },
  {
    global_id: 3757101776,
    name: "Vikramaditya Rao",
    masked_name: "V*** R***",
    pseudo_id: "EMP_8A34",
    job_role: "Principal AI Scientist",
    department: "AI Research",
    monthly_salary: 155000,
    salary_band: "₹1,50,000 - ₹1,75,000/mo",
    overtime_hours: 31,
    attrition_probability: 0.614,
    risk_tier: "MEDIUM",
    years_at_company: 3.1,
    avatar: "VR",
    reason: "GPU Capacity Blockers + Tenure Plateau",
    perf: 4.9,
    pot: 4.8,
    leaves_taken: 1
  },
  {
    global_id: 4891024419,
    name: "Ananya Deshmukh",
    masked_name: "A*** D***",
    pseudo_id: "EMP_3B21",
    job_role: "Enterprise Solutions Architect",
    department: "Sales Engineering",
    monthly_salary: 140000,
    salary_band: "₹1,25,000 - ₹1,50,000/mo",
    overtime_hours: 38,
    attrition_probability: 0.884,
    risk_tier: "HIGH",
    years_at_company: 3.8,
    avatar: "AD",
    reason: "Burnout + Frequent Travel & Commission Variance",
    perf: 4.4,
    pot: 3.8,
    leaves_taken: 0
  }
];

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('nemo_token') || null);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const u = localStorage.getItem('nemo_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);

  // Authenticate using demo persona credentials
  const handleLogin = async (persona) => {
    try {
      const params = new URLSearchParams();
      params.append('username', persona.username);
      params.append('password', persona.password);

      const res = await axios.post('/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const authToken = res.data.access_token;
      const userObj = {
        name: persona.name,
        role: (res.data.role || persona.role).toUpperCase(),
        title: persona.title,
        avatar: persona.avatar,
        username: persona.username
      };

      setToken(authToken);
      setCurrentUser(userObj);
      localStorage.setItem('nemo_token', authToken);
      localStorage.setItem('nemo_user', JSON.stringify(userObj));
    } catch (err) {
      // Fallback for offline sandbox mode
      const simulatedToken = `demo_jwt_${persona.id}_${Date.now()}`;
      const userObj = {
        name: persona.name,
        role: persona.role.toUpperCase(),
        title: persona.title,
        avatar: persona.avatar,
        username: persona.username
      };
      setToken(simulatedToken);
      setCurrentUser(userObj);
      localStorage.setItem('nemo_token', simulatedToken);
      localStorage.setItem('nemo_user', JSON.stringify(userObj));
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('nemo_token');
    localStorage.removeItem('nemo_user');
  };

  // If unauthenticated: Render DecisionLens-style portal hero with Throwable Role Card Deck
  if (!token || !currentUser) {
    return (
      <div className="min-h-screen bg-[#0A0C0E] text-[#EDE7DC] flex flex-col justify-between p-6 md:p-12 font-body selection:bg-[#E8913C] selection:text-[#0A0C0E]">
        {/* Top Minimal Wordmark */}
        <header className="flex items-center justify-between border-b border-[rgba(237,231,220,0.13)] pb-4 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-lg text-[#EDE7DC] tracking-tight">
              ENTERPRISE HR<span className="text-[#E8913C]">.</span>
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[#2E6B72] text-[#2E6B72]">
              DPDP Act §8(1) Ready
            </span>
          </div>

          <div className="text-xs font-mono text-[#9EA5A8]">
            Select Persona to Sign In
          </div>
        </header>

        {/* Center: Throwable Role Card Deck */}
        <main className="max-w-4xl mx-auto w-full py-8">
          <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#EDE7DC] tracking-tight">
              Select Your Role Workspace
            </h1>
            <p className="text-xs sm:text-sm font-mono text-[#9EA5A8] leading-relaxed">
              Throw or drag cards to inspect enterprise personas. Click any card to enter a dedicated, role-isolated workspace.
            </p>
          </div>

          <RoleThrowableDeck
            personas={DEMO_PERSONAS}
            onSelectRole={(persona) => handleLogin(persona)}
          />
        </main>

        {/* Bottom Statutory Notice */}
        <footer className="text-center text-[11px] font-mono text-[#6C7378] border-t border-[rgba(237,231,220,0.13)] pt-4 max-w-5xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Enterprise HR AI Platform • Role-Based Access Control</span>
          <span>Indian DPDP Act 2023 Compliant</span>
        </footer>
      </div>
    );
  }

  // Resolve normalized role
  const userRole = (currentUser.role || 'HR_ADMIN').toUpperCase().replace('ROLE_', '');

  // Determine role-specific breadcrumbs
  const getBreadcrumbs = () => {
    if (userRole === 'EMPLOYEE') return ['My Workstation', 'Personal Self-Service'];
    if (userRole === 'MANAGER') return ['Team Operations', 'Engineering & Platform'];
    if (userRole === 'AUDITOR') return ['Governance Chamber', 'DPDP Act 2023'];
    return ['Executive Command', 'Strategic Overview'];
  };

  return (
    <AppShell
      currentUser={currentUser}
      role={userRole}
      breadcrumbs={getBreadcrumbs()}
      onLogout={handleLogout}
      onSwitchPersona={(persona) => handleLogin(persona)}
      demoPersonas={DEMO_PERSONAS}
    >
      {/* 
        NO CLUNKY HORIZONTAL TABS! NO 403 WALLS!
        USER SEES ONLY WHAT IS PERMITTED FOR THEIR ROLE:
      */}
      {userRole === 'EMPLOYEE' && (
        <EmployeeWorkstation
          currentUser={currentUser}
          onApplyLeave={(req) => {
            console.log("New leave requested by employee:", req);
          }}
        />
      )}

      {userRole === 'MANAGER' && (
        <ManagerCockpit
          employees={employees}
          onApproveLeave={(id) => {
            console.log("Manager approved leave ID:", id);
          }}
          onRejectLeave={(id) => {
            console.log("Manager rejected leave ID:", id);
          }}
        />
      )}

      {userRole === 'AUDITOR' && (
        <AuditorChamber />
      )}

      {(userRole === 'HR_ADMIN' || userRole === 'ADMIN') && (
        <AdminCommandCenter
          employees={employees}
          onHireCandidate={(id) => {
            console.log("Admin hired candidate ID:", id);
          }}
          onRejectCandidate={(id) => {
            console.log("Admin rejected candidate ID:", id);
          }}
          onRunPayroll={() => {
            console.log("Admin triggered payroll disbursal batch");
          }}
        />
      )}
    </AppShell>
  );
}
