import React, { useState, useEffect } from 'react';
import AppShell from './components/AppShell';
import EmployeeWorkstation from './components/workspaces/EmployeeWorkstation';
import ManagerCockpit from './components/workspaces/ManagerCockpit';
import AuditorChamber from './components/workspaces/AuditorChamber';
import AdminCommandCenter from './components/workspaces/AdminCommandCenter';

// DEMO PERSONAS FOR INSTANT 1-CLICK AUTHENTICATION (ZERO LOGIN WALL)
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
    risk: 0.9948,
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
    risk: 0.682,
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
    risk: 0.614,
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
    risk: 0.884,
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
  // ZERO LOGIN GATE: Always authenticated by default as Priya Sharma (CHRO)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const u = localStorage.getItem('nemo_user');
      return u ? JSON.parse(u) : DEMO_PERSONAS[0];
    } catch {
      return DEMO_PERSONAS[0];
    }
  });

  // Theme engine: Slate Dark (default) | Executive Light | Obsidian Gold
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('enterprise_theme') || 'slate';
  });

  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);

  // Sync theme with HTML document attribute & localStorage
  useEffect(() => {
    localStorage.setItem('enterprise_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  // Instant 1-click persona switcher (No login, no password, no barriers)
  const handleSwitchPersona = (persona) => {
    const userObj = {
      name: persona.name,
      role: persona.role.toUpperCase(),
      title: persona.title,
      avatar: persona.avatar,
      username: persona.username
    };
    setCurrentUser(userObj);
    localStorage.setItem('nemo_user', JSON.stringify(userObj));
    localStorage.setItem('nemo_token', `demo_token_${persona.id}`);
  };

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
    <div data-theme={theme} className="min-h-screen">
      <AppShell
        currentUser={currentUser}
        role={userRole}
        breadcrumbs={getBreadcrumbs()}
        onSwitchPersona={handleSwitchPersona}
        demoPersonas={DEMO_PERSONAS}
        theme={theme}
        onSelectTheme={setTheme}
      >
        {/* ROLE-ISOLATED WORKSPACES: USER SEES ONLY WHAT BELONGS TO THEIR ROLE */}
        {userRole === 'EMPLOYEE' && (
          <EmployeeWorkstation
            currentUser={currentUser}
            theme={theme}
            onApplyLeave={(req) => {
              console.log("New leave requested by employee:", req);
            }}
          />
        )}

        {userRole === 'MANAGER' && (
          <ManagerCockpit
            employees={employees}
            theme={theme}
            onApproveLeave={(id) => {
              console.log("Manager approved leave ID:", id);
            }}
            onRejectLeave={(id) => {
              console.log("Manager rejected leave ID:", id);
            }}
          />
        )}

        {userRole === 'AUDITOR' && (
          <AuditorChamber theme={theme} />
        )}

        {(userRole === 'HR_ADMIN' || userRole === 'ADMIN') && (
          <AdminCommandCenter
            employees={employees}
            theme={theme}
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
    </div>
  );
}
