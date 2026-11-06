import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ShieldAlert,
  TrendingDown,
  DollarSign,
  Activity,
  Sliders,
  Webhook,
  Lock,
  UserCheck,
  RefreshCw,
  AlertTriangle,
  Send,
  CheckCircle2,
  FileText,
  Building2,
  ChevronRight,
  ExternalLink,
  Users,
  LogOut,
  Briefcase,
  Calendar,
  Award,
  Sparkles,
  Clock,
  BarChart3,
  UserMinus,
  UserPlus,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Box,
  Ban
} from 'lucide-react';
import RoleThrowableDeck from './components/RoleThrowableDeck';
import Talent3DCube from './components/Talent3DCube';

// DEMO PERSONAS FOR INSTANT 1-CLICK AUTHENTICATION DECK
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
    desc: 'Unrestricted enterprise oversight: War Room, 3D Risk Prism, Retention ROI, ATS hiring, 9-Box, and Webhooks.',
    color: 'from-blue-600 to-indigo-600'
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
    desc: 'Department approvals: 1-click leave sign-offs, 3D talent calibration, team retention. ATS & Payroll locked.',
    color: 'from-emerald-600 to-teal-600'
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
    desc: 'Self-service workspace: personal leave balance, compensation band, confidential pulse. Executive data locked.',
    color: 'from-amber-600 to-orange-600'
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
    desc: 'Statutory DPDP Act 2023 oversight: Four-Fifths 80% algorithmic bias audit, pseudonymization, immutable access logs.',
    color: 'from-purple-600 to-violet-600'
  }
];

// ROLE-BASED ACCESS CONTROL (RBAC) AUTHORIZATION MATRIX
const ROLE_PERMISSIONS = {
  HR_ADMIN: {
    allowedTabs: ['3d-talent-prism', 'war-room', 'simulator', 'leaves', 'nine-box', 'ats', 'succession', 'webhooks', 'compliance', 'payroll', 'sentiment', 'reports', 'self-service'],
    clearanceLabel: 'Tier 1 • Full Clearance (CHRO / SuperAdmin)',
    badgeColor: 'border-[#E8913C] text-[#E8913C]'
  },
  MANAGER: {
    allowedTabs: ['3d-talent-prism', 'leaves', 'nine-box', 'simulator', 'sentiment'],
    clearanceLabel: 'Tier 2 • People Leader (Department Approvals & Team 9-Box)',
    badgeColor: 'border-[#2E6B72] text-[#2E6B72]'
  },
  EMPLOYEE: {
    allowedTabs: ['3d-talent-prism', 'self-service', 'sentiment'],
    clearanceLabel: 'Tier 4 • Individual Contributor (Self-Service Portal Only)',
    badgeColor: 'border-[#9EA5A8] text-[#9EA5A8]'
  },
  AUDITOR: {
    allowedTabs: ['3d-talent-prism', 'compliance', 'reports', 'war-room'],
    clearanceLabel: 'Tier 3 • Compliance Officer (DPDP Act & Algorithmic Audit)',
    badgeColor: 'border-[#EDE7DC] text-[#EDE7DC]'
  }
};

const TAB_REQUIRED_PERMISSIONS = {
  '3d-talent-prism': { perm: '3d:talent_prism:read', name: '3D Talent & Risk Prism', roleNeeded: 'All Authenticated Roles' },
  'war-room': { perm: 'hr:executive:macro_read', name: 'Flight Risk War Room', roleNeeded: 'HR_ADMIN, AUDITOR' },
  'simulator': { perm: 'hr:compensation:simulate', name: 'Retention ROI Simulator', roleNeeded: 'HR_ADMIN, MANAGER' },
  'leaves': { perm: 'hcm:approvals:write', name: 'Leave Management & Approvals', roleNeeded: 'HR_ADMIN, MANAGER' },
  'nine-box': { perm: 'hcm:performance:calibrate', name: '9-Box Talent Review', roleNeeded: 'HR_ADMIN, MANAGER' },
  'ats': { perm: 'hr:talent_acquisition:write', name: 'Talent Acquisition & ATS Hiring', roleNeeded: 'HR_ADMIN only' },
  'succession': { perm: 'hr:boardroom:succession_write', name: 'Succession Planning & Bench', roleNeeded: 'HR_ADMIN only' },
  'webhooks': { perm: 'sec:devops:webhook_admin', name: 'HRMS Webhook Gateway', roleNeeded: 'HR_ADMIN only' },
  'compliance': { perm: 'dpdp:dpo:audit_read', name: 'DPDP Act 2023 & Bias Audit', roleNeeded: 'HR_ADMIN, AUDITOR' },
  'payroll': { perm: 'finance:compensation:ledger_read', name: 'Payroll & Compensation Register', roleNeeded: 'HR_ADMIN only' },
  'sentiment': { perm: 'hr:pulse:sentiment_read', name: 'Sentiment Pulse & eNPS', roleNeeded: 'HR_ADMIN, MANAGER, EMPLOYEE' },
  'reports': { perm: 'exec:boardroom:memo_export', name: 'Executive Boardroom Briefing', roleNeeded: 'HR_ADMIN, AUDITOR' },
  'self-service': { perm: 'employee:workspace:self_service', name: 'Employee Self-Service', roleNeeded: 'EMPLOYEE, HR_ADMIN' }
};

// INITIAL WORKFORCE ROSTER
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

  // Login form state
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active module navigation (defaults to 3D Talent Prism)
  const [activeTab, setActiveTab] = useState('3d-talent-prism');
  const [backendOnline, setBackendOnline] = useState(true);
  const [toast, setToast] = useState(null);

  // HCM Data states
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [selectedEmp, setSelectedEmp] = useState(INITIAL_EMPLOYEES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Simulator levers
  const [salaryHike, setSalaryHike] = useState(15);
  const [overtimeReduction, setOvertimeReduction] = useState(15);
  const [wlbPolicy, setWlbPolicy] = useState('hybrid');
  const [memoOpen, setMemoOpen] = useState(false);

  // Leaves
  const [leaves, setLeaves] = useState([
    { id: 101, employee_id: 1977757544, name: "Christopher Benson", leave_type: "Privilege Leave", days: 4, status: "Pending" },
    { id: 102, employee_id: 3757101776, name: "Vikramaditya Rao", leave_type: "Casual Leave", days: 2, status: "Pending" },
    { id: 103, employee_id: 2841902113, name: "Priya Sundaram", leave_type: "Sick Leave", days: 1, status: "Approved" },
    { id: 104, employee_id: 4891024419, name: "Ananya Deshmukh", leave_type: "Privilege Leave", days: 5, status: "Pending" }
  ]);
  const [applyLeaveModal, setApplyLeaveModal] = useState(false);
  const [newLeaveType, setNewLeaveType] = useState('Privilege Leave');
  const [newLeaveDays, setNewLeaveDays] = useState(3);

  // 9-Box reviews
  const [nineBoxReviews, setNineBoxReviews] = useState([
    { id: 1, name: "Christopher Benson", role: "Platform Architect", dept: "Engineering", perf: 5, pot: 5, category: "Star Performer" },
    { id: 2, name: "Priya Sundaram", role: "Sr Product Manager", dept: "Product", perf: 4, pot: 4, category: "High Impact" },
    { id: 3, name: "Vikramaditya Rao", role: "Principal AI Scientist", dept: "AI Research", perf: 5, pot: 4, category: "High Potential" },
    { id: 4, name: "Ananya Deshmukh", role: "Solutions Architect", dept: "Sales Engineering", perf: 4, pot: 3, category: "Core Performer" },
    { id: 5, name: "Rahul Verma", role: "Frontend Engineer", dept: "Engineering", perf: 3, pot: 4, category: "Enigma" },
    { id: 6, name: "Deepa Nair", role: "QA Lead", dept: "Quality", perf: 4, pot: 2, category: "Workhorse" }
  ]);

  // Candidates / ATS Pipeline
  const [candidates, setCandidates] = useState([
    { id: 1, name: "Arjun Mehra", role: "Senior Distributed Systems Engineer", dept: "Engineering", stage: "Offered", time_to_hire: 24, skills: "Go, Kubernetes, Kafka, gRPC" },
    { id: 2, name: "Sneha Mukherjee", role: "MLOps Platform Architect", dept: "AI Research", stage: "Interview", time_to_hire: 18, skills: "PyTorch, Ray, Triton, CUDA" },
    { id: 3, name: "Rohan Kulkarni", role: "Director of Product Management", dept: "Product", stage: "Offered", time_to_hire: 31, skills: "B2B SaaS, PLG, Metrics, Strategy" },
    { id: 4, name: "Tanvi Saxena", role: "Enterprise Account Executive", dept: "Sales", stage: "Sourced", time_to_hire: 12, skills: "BFSI, Enterprise Deals, Salesforce" }
  ]);

  // Succession plans
  const [successionPlans, setSuccessionPlans] = useState([
    { id: 1, target_role: "VP of Cloud Engineering", dept: "Engineering", successor: "Christopher Benson", readiness: "88% Ready", ramp_time: "3 Months", gap: "Executive Boardroom Presence" },
    { id: 2, target_role: "Head of AI Research", dept: "AI Research", successor: "Vikramaditya Rao", readiness: "92% Ready", ramp_time: "Immediate", gap: "Cross-functional Budgeting" },
    { id: 3, target_role: "Director of Product Growth", dept: "Product", successor: "Priya Sundaram", readiness: "84% Ready", ramp_time: "6 Months", gap: "Global M&A Integration" }
  ]);

  // Payroll list
  const [payrollList, setPayrollList] = useState([
    { id: 1977757544, name: "Christopher Benson", dept: "Engineering", role: "Platform Architect", base: 1380000, bonus: 15, bank: "HDFC Bank", acc: "•••• •••• 8841", tax: "Regular-80C" },
    { id: 2841902113, name: "Priya Sundaram", dept: "Product", role: "Product Manager", base: 1620000, bonus: 18, bank: "ICICI Bank", acc: "•••• •••• 3290", tax: "New-Regime" },
    { id: 3757101776, name: "Vikramaditya Rao", dept: "AI Research", role: "AI Scientist", base: 1860000, bonus: 20, bank: "Axis Bank", acc: "•••• •••• 5512", tax: "Regular-80C" },
    { id: 4891024419, name: "Ananya Deshmukh", dept: "Sales Engineering", role: "Solutions Architect", base: 1680000, bonus: 25, bank: "Kotak Bank", acc: "•••• •••• 9923", tax: "New-Regime" }
  ]);

  // Sentiment metrics
  const [sentimentPulse, setSentimentPulse] = useState([
    { dept: "Engineering", engagement: 3.4, satisfaction: 3.1, wlb: 2.8, headcount: 412, stress_flag: "Elevated" },
    { dept: "AI Research", engagement: 4.2, satisfaction: 3.8, wlb: 3.3, headcount: 86, stress_flag: "Moderate" },
    { dept: "Product", engagement: 3.9, satisfaction: 3.7, wlb: 3.5, headcount: 140, stress_flag: "Healthy" },
    { dept: "Sales Engineering", engagement: 3.6, satisfaction: 3.4, wlb: 2.7, headcount: 195, stress_flag: "Elevated" }
  ]);

  // Live Webhook Feed
  const [webhooks, setWebhooks] = useState([
    { id: "evt_101", provider: "darwinbox", event: "COMPENSATION_CHANGE", desc: "Employee #3757101776: Risk updated (0.614 → 0.28)", status: "PROCESSED", latency: "14ms", time: "Just now" },
    { id: "evt_100", provider: "workday", event: "OVERTIME_LOGGED", desc: "Employee #1977757544: Overtime spiked to 42h (Risk alert triggered)", status: "PROCESSED", latency: "18ms", time: "12m ago" },
    { id: "evt_099", provider: "bamboohr", event: "PTO_REQUEST", desc: "Employee #2841902113: 4-day Leave registered", status: "ACKNOWLEDGED", latency: "9ms", time: "44m ago" }
  ]);

  // DPDP Access Logs
  const [accessLogs, setAccessLogs] = useState([
    { id: 301, user: "auditor", role: "AUDITOR", target: "1977757544", action: "READ_PROFILE", exposed: "FULLY_ANONYMIZED", time: "Just now" },
    { id: 300, user: "manager", role: "MANAGER", target: "3757101776", action: "READ_PROFILE", exposed: "PARTIALLY_MASKED_FINANCIALS", time: "14m ago" },
    { id: 299, user: "admin", role: "HR_ADMIN", target: "4891024419", action: "EXPORT_REPORT", exposed: "UNMASKED", time: "1h ago" }
  ]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const authHeaders = () => ({
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const userRole = currentUser ? currentUser.role : 'HR_ADMIN';
  const roleRules = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.HR_ADMIN;
  const isAuthorized = (tabKey) => roleRules.allowedTabs.includes(tabKey);

  const handleNavigate = (tabKey) => {
    if (!isAuthorized(tabKey)) {
      const req = TAB_REQUIRED_PERMISSIONS[tabKey];
      const newAudit = {
        id: Date.now(),
        user: currentUser?.username || 'unknown',
        role: userRole,
        target: 'SYSTEM_RESOURCE',
        action: `ACCESS_DENIED_VIOLATION (${tabKey})`,
        exposed: 'BLOCKED_BY_RBAC',
        time: 'Just now'
      };
      setAccessLogs(prev => [newAudit, ...prev]);
      showToast(`⛔ 403 Forbidden: Role ${userRole} lacks permission for ${req?.name || tabKey}.`);
    }
    setActiveTab(tabKey);
  };

  // Sync with live backend
  useEffect(() => {
    if (!token) return;

    axios.get('/hcm/leave', authHeaders())
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) setLeaves(res.data.slice(0, 15));
        setBackendOnline(true);
      })
      .catch(() => setBackendOnline(false));

    axios.get('/hcm/candidates', authHeaders())
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) setCandidates(res.data.slice(0, 12));
      })
      .catch(() => {});

    axios.get('/hcm/performance', authHeaders())
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.slice(0, 20).map(r => ({
            id: r.id,
            name: r.name,
            role: r.role,
            dept: r.department,
            perf: r.performance_score || 3,
            pot: r.potential_score || 3,
            category: (r.performance_score >= 4 && r.potential_score >= 4) ? "Star Performer" :
                      (r.performance_score >= 4) ? "Workhorse" :
                      (r.potential_score >= 4) ? "Enigma" : "Core Performer"
          }));
          setNineBoxReviews(mapped);
        }
      })
      .catch(() => {});

    axios.get('/hcm/succession', authHeaders())
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setSuccessionPlans(res.data.map(p => ({
            id: p.id,
            target_role: p.target_role,
            dept: p.department,
            successor: p.successor_name,
            readiness: `${Math.round((p.readiness_score || 0.85) * 100)}% Ready`,
            ramp_time: `${p.time_to_ready_months || 3} Months`,
            gap: p.key_skill_gap || "Strategic Scaling"
          })));
        }
      })
      .catch(() => {});

    axios.get('/hcm/sentiment', authHeaders())
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setSentimentPulse(res.data.map(s => ({
            dept: s.department,
            engagement: s.engagement,
            satisfaction: s.satisfaction,
            wlb: s.wlb,
            headcount: s.headcount,
            stress_flag: s.wlb < 3.0 ? "Elevated" : "Healthy"
          })));
        }
      })
      .catch(() => {});

    axios.get('/api/v1/compliance/access-logs?limit=5', authHeaders())
      .then(res => {
        if (res.data && res.data.audit_logs && res.data.audit_logs.length > 0) {
          setAccessLogs(res.data.audit_logs.map(l => ({
            id: l.id,
            user: l.accessor_user,
            role: l.accessor_role,
            target: String(l.target_employee_id),
            action: l.access_type,
            exposed: l.fields_exposed,
            time: "Just now"
          })));
        }
      })
      .catch(() => {});
  }, [token]);

  // LOGIN HANDLERS
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', loginUsername);
      formData.append('password', loginPassword);

      const res = await axios.post('/token', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const authToken = res.data.access_token;
      const returnedRole = (res.data.role || 'HR_ADMIN').toUpperCase();

      const userObj = {
        username: loginUsername,
        role: returnedRole === 'ADMIN' ? 'HR_ADMIN' : returnedRole,
        name: loginUsername === 'admin' ? 'Priya Sharma (CHRO)' :
              loginUsername === 'manager' ? 'Kavita Desai (Eng Director)' :
              loginUsername === 'employee' ? 'Vikramaditya Rao (Principal AI Scientist)' :
              loginUsername === 'auditor' ? 'Adv. Rajiv Nair (DPO Auditor)' : loginUsername
      };

      localStorage.setItem('nemo_token', authToken);
      localStorage.setItem('nemo_user', JSON.stringify(userObj));
      setToken(authToken);
      setCurrentUser(userObj);

      if (userObj.role === 'EMPLOYEE') setActiveTab('self-service');
      else if (userObj.role === 'MANAGER') setActiveTab('leaves');
      else if (userObj.role === 'AUDITOR') setActiveTab('compliance');
      else setActiveTab('3d-talent-prism');

      showToast(`Authenticated as ${userObj.name} • Clearance: ${userObj.role}`);
    } catch {
      const foundPersona = DEMO_PERSONAS.find(p => p.username === loginUsername && p.password === loginPassword);
      if (foundPersona) {
        const dummyToken = 'demo_jwt_token_enterprise_' + Date.now();
        const userObj = {
          username: foundPersona.username,
          role: foundPersona.role,
          name: foundPersona.name
        };
        localStorage.setItem('nemo_token', dummyToken);
        localStorage.setItem('nemo_user', JSON.stringify(userObj));
        setToken(dummyToken);
        setCurrentUser(userObj);

        if (userObj.role === 'EMPLOYEE') setActiveTab('self-service');
        else if (userObj.role === 'MANAGER') setActiveTab('leaves');
        else if (userObj.role === 'AUDITOR') setActiveTab('compliance');
        else setActiveTab('3d-talent-prism');

        showToast(`Offline Demo Session: ${foundPersona.name} (${foundPersona.role})`);
      } else {
        setLoginError('Invalid credentials. Select a quick persona below to test role gating.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleQuickLogin = (persona) => {
    setLoginUsername(persona.username);
    setLoginPassword(persona.password);
    const dummyToken = 'demo_jwt_token_enterprise_' + Date.now();
    const userObj = {
      username: persona.username,
      role: persona.role,
      name: persona.name
    };
    localStorage.setItem('nemo_token', dummyToken);
    localStorage.setItem('nemo_user', JSON.stringify(userObj));
    setToken(dummyToken);
    setCurrentUser(userObj);

    if (userObj.role === 'EMPLOYEE') setActiveTab('self-service');
    else if (userObj.role === 'MANAGER') setActiveTab('leaves');
    else if (userObj.role === 'AUDITOR') setActiveTab('compliance');
    else setActiveTab('3d-talent-prism');

    showToast(`Switched persona to ${persona.name} (${persona.role})`);
  };

  const handleLogout = () => {
    localStorage.removeItem('nemo_token');
    localStorage.removeItem('nemo_user');
    setToken(null);
    setCurrentUser(null);
    showToast('Session terminated cleanly.');
  };

  // Operational Actions
  const handleApproveLeave = async (id) => {
    try {
      await axios.post(`/hcm/leave/${id}/approve`, {}, authHeaders());
    } catch {}
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Approved' } : l));
    showToast(`Leave Request #${id} Approved.`);
  };

  const handleRejectLeave = async (id) => {
    try {
      await axios.post(`/hcm/leave/${id}/reject`, {}, authHeaders());
    } catch {}
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Rejected' } : l));
    showToast(`Leave Request #${id} Rejected.`);
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    const newReq = {
      id: Date.now(),
      employee_id: 3757101776,
      name: currentUser ? currentUser.name : "Vikramaditya Rao",
      leave_type: newLeaveType,
      days: parseInt(newLeaveDays, 10),
      status: "Pending"
    };

    try {
      await axios.post('/hcm/leave/apply', {
        employee_id: 3757101776,
        leave_type: newLeaveType,
        days: parseInt(newLeaveDays, 10)
      }, authHeaders());
    } catch {}

    setLeaves(prev => [newReq, ...prev]);
    setApplyLeaveModal(false);
    showToast(`Leave application submitted for ${newLeaveDays} days (${newLeaveType}).`);
  };

  const handleHireCandidate = async (candidateId) => {
    if (userRole !== 'HR_ADMIN') {
      showToast('⛔ Authorization Failure: Only HR_ADMIN can execute candidate hiring.');
      return;
    }
    try {
      await axios.post(`/hcm/workflow/hire/${candidateId}`, {}, authHeaders());
    } catch {}
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: 'Hired' } : c));
    showToast(`Candidate #${candidateId} officially HIRED! IT provisioning triggered.`);
  };

  const handleRejectCandidate = async (candidateId) => {
    if (userRole !== 'HR_ADMIN') {
      showToast('⛔ Authorization Failure: Only HR_ADMIN can reject candidates.');
      return;
    }
    try {
      await axios.post(`/hcm/candidates/${candidateId}/reject`, {}, authHeaders());
    } catch {}
    setCandidates(prev => prev.filter(c => c.id !== candidateId));
    showToast(`Candidate #${candidateId} marked as Rejected.`);
  };

  const handleSimulateWebhook = async (provider, eventType) => {
    if (userRole !== 'HR_ADMIN') {
      showToast('⛔ Authorization Failure: Only HR_ADMIN can trigger webhook simulations.');
      return;
    }

    const newEvt = {
      id: "evt_" + Math.floor(Math.random() * 9000 + 1000),
      provider,
      event: eventType,
      desc: `Simulation event dispatched for GlobalID #${selectedEmp.global_id}`,
      status: "PROCESSED",
      latency: Math.floor(Math.random() * 20 + 8) + "ms",
      time: "Just now"
    };

    try {
      const res = await axios.post('/api/v1/webhooks/simulate', {
        provider,
        event_type: eventType,
        employee_id: selectedEmp.global_id,
        data: {
          monthly_salary: selectedEmp.monthly_salary * 1.15,
          overtime_hours: 10
        }
      }, authHeaders());

      if (res.data && res.data.simulated_risk) {
        newEvt.desc = `Risk recalculated: ${(res.data.simulated_risk.new_probability * 100).toFixed(1)}% (${res.data.simulated_risk.risk_tier})`;
      }
    } catch {}

    setWebhooks(prev => [newEvt, ...prev]);
    showToast(`Webhook [${provider.toUpperCase()}] ${eventType} received & processed.`);
  };

  // Calculations for Retention Simulator
  const baseSalary = selectedEmp.monthly_salary || 120000;
  const baseProb = (selectedEmp.attrition_probability || 0.8) * 100;
  const hikeReduction = (salaryHike / 100) * 45;
  const otReduction = (overtimeReduction / 30) * 35;
  const wlbReduction = wlbPolicy === 'remote' ? 20 : (wlbPolicy === 'hybrid' ? 12 : 0);
  const totalReductionPct = Math.min(baseProb - 5, hikeReduction + otReduction + wlbReduction);
  const simulatedProb = Math.max(4.2, baseProb - totalReductionPct).toFixed(1);

  const replacementCost = Math.round(baseSalary * 12 * 1.5);
  const incAmount = Math.round(baseSalary * (salaryHike / 100));
  const annualInterventionCost = Math.round(incAmount * 12 + 45000);
  const turnoverCostAvoidance = Math.round(replacementCost * ((baseProb - simulatedProb) / 100));
  const netFinancialGain = Math.max(0, turnoverCostAvoidance - annualInterventionCost);
  const roiMultiple = annualInterventionCost > 0 ? (turnoverCostAvoidance / annualInterventionCost).toFixed(1) : "N/A";

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          String(e.global_id).includes(searchQuery);
    const matchesDept = deptFilter === 'ALL' || e.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const isAuditor = userRole === 'AUDITOR';

  // -------------------------------------------------------------
  // RENDER: LOGIN VIEW WITH THROWABLE ROLE CARD DECK
  // -------------------------------------------------------------
  if (!token) {
    return (
      <div className="min-h-screen bg-[#0A0C0E] text-[#EDE7DC] flex flex-col justify-between p-6 font-body selection:bg-[#E8913C] selection:text-[#0A0C0E]">
        {/* Top Header */}
        <header className="flex justify-between items-center max-w-6xl w-full mx-auto pb-6 border-b border-[rgba(237,231,220,0.13)]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl border border-[rgba(237,231,220,0.18)] bg-[#101317] flex items-center justify-center font-display font-extrabold text-base text-[#EDE7DC]">
              Ne<span className="text-[#E8913C]">.</span>
            </div>
            <div>
              <div className="font-display font-extrabold text-base tracking-tight text-[#EDE7DC]">
                NeMo HR<span className="text-[#E8913C]">.</span>
              </div>
              <div className="text-[11px] font-mono text-[#9EA5A8] uppercase tracking-[0.12em]">
                Enterprise Workforce Retention & 3D Talent Prism
              </div>
            </div>
          </div>

          <div className="text-[10.5px] font-mono text-[#9EA5A8] uppercase tracking-[0.14em]">
            SSO CLEARANCE GATEWAY • 2026
          </div>
        </header>

        {/* Central Auth Area: Credentials Form (Left) + Throwable Role Deck (Right) */}
        <div className="max-w-6xl w-full mx-auto my-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Column: Form & Enterprise Security Context */}
            <div className="lg:col-span-6 space-y-6">
              <div className="p-8 rounded-3xl bg-[#101317] border border-[rgba(237,231,220,0.13)] shadow-2xl">
                <span className="font-mono text-[10.5px] uppercase font-bold tracking-[0.14em] text-[#E8913C]">
                  ENTERPRISE ACCESS PORTAL
                </span>
                <h1 className="font-display text-3xl font-extrabold text-[#EDE7DC] mt-1 tracking-[-0.025em]">
                  Sign In to Workspace
                </h1>
                <p className="text-xs text-[#9EA5A8] mt-2 leading-relaxed">
                  Authenticate your identity to enforce strictly partitioned role permissions. Or drag and throw the identity cards on the right to test individual personas.
                </p>

                {loginError && (
                  <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4 mt-6">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-[0.12em] text-[#9EA5A8] mb-1.5">
                      Username / Enterprise ID
                    </label>
                    <input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      required
                      placeholder="admin, manager, employee, auditor"
                      className="w-full px-4 py-3 rounded-xl text-xs bg-[#0A0C0E] border border-[rgba(237,231,220,0.16)] text-[#EDE7DC] focus:outline-none focus:border-[#E8913C] transition"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[11px] font-mono uppercase tracking-[0.12em] text-[#9EA5A8]">
                        Password
                      </label>
                      <span className="text-[10px] font-mono text-[#6C7378]">OAuth2 HS256 JWT</span>
                    </div>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-xl text-xs bg-[#0A0C0E] border border-[rgba(237,231,220,0.16)] text-[#EDE7DC] focus:outline-none focus:border-[#E8913C] transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3.5 rounded-full bg-[#EDE7DC] text-[#0A0C0E] hover:text-[#E8913C] hover:bg-transparent border border-[#EDE7DC] hover:border-[#E8913C] font-mono text-[11px] font-bold tracking-[0.14em] uppercase transition flex items-center justify-center gap-2 mt-4"
                  >
                    {loginLoading ? <RefreshCw className="size-4 animate-spin" /> : <Lock className="size-4" />}
                    <span>{loginLoading ? 'Authenticating...' : 'Sign In with Credentials'}</span>
                  </button>
                </form>

                <div className="mt-6 pt-5 border-t border-[rgba(237,231,220,0.13)] flex items-center justify-between text-[11px] text-[#9EA5A8] font-mono">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-[#2E6B72]" />
                    <span>DPDP Act 2023 Compliant</span>
                  </div>
                  <span>RBAC Policy SEC-04</span>
                </div>
              </div>
            </div>

            {/* Right Column: Physical Throwable Role Cards Deck */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <div className="mb-4 text-center">
                <span className="font-mono text-[10.5px] uppercase font-bold tracking-[0.14em] text-[#E8913C]">
                  PHYSICAL IDENTITY DECK
                </span>
                <h2 className="font-display text-2xl font-extrabold text-[#EDE7DC] mt-1">
                  Choose Role Persona
                </h2>
                <p className="text-xs text-[#9EA5A8] mt-1 max-w-sm">
                  Drag and throw sleeves aside to flip between roles. Each role triggers strict permission walls.
                </p>
              </div>

              <RoleThrowableDeck
                personas={DEMO_PERSONAS}
                onSelectPersona={handleQuickLogin}
                activePersonaId={loginUsername}
              />
            </div>

          </div>
        </div>

        {/* Footer Strip */}
        <footer className="text-center text-[10.5px] font-mono text-[#6C7378] uppercase tracking-[0.12em] max-w-6xl mx-auto w-full pt-4 border-t border-[rgba(237,231,220,0.13)] flex flex-col md:flex-row justify-between items-center gap-2">
          <span>© 2026 NeMo HR • Enterprise Workforce Retention Intelligence & 3D Prism</span>
          <span>Strict Role-Based Access Control • Salted Pseudonymization</span>
        </footer>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: AUTHENTICATED WORKSPACE SHELL
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0A0C0E] text-[#EDE7DC] flex flex-col font-body selection:bg-[#E8913C] selection:text-[#0A0C0E]">

      {/* TOP NAVIGATION BAR (58px) */}
      <header className="sticky top-0 z-40 bg-[#0A0C0E]/90 backdrop-blur-md border-b border-[rgba(237,231,220,0.13)] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg border border-[rgba(237,231,220,0.18)] bg-[#101317] flex items-center justify-center font-display font-extrabold text-sm text-[#EDE7DC]">
              Ne<span className="text-[#E8913C]">.</span>
            </div>
            <div>
              <span className="font-display font-extrabold text-sm tracking-tight text-[#EDE7DC]">
                NeMo HR<span className="text-[#E8913C]">.</span>
              </span>
              <span className="text-xs text-[#9EA5A8] font-normal ml-2 hidden md:inline">
                Workforce Intelligence & 3D Risk Prism
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-[rgba(237,231,220,0.13)] mx-1 hidden sm:block" />

          {/* Backend Status Badge */}
          <div className="flex items-center gap-2 text-xs">
            <span className={`size-2 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-[#E8913C]'}`} />
            <span className="text-[11px] font-mono text-[#9EA5A8]">
              {backendOnline ? 'FastAPI :8000 Live' : 'Simulated Session'}
            </span>
          </div>
        </div>

        {/* User Pill & Session Sign-Out */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#101317] border border-[rgba(237,231,220,0.13)] text-xs">
            <div className="size-6 rounded-lg bg-[#0A0C0E] border border-[rgba(237,231,220,0.18)] text-[#EDE7DC] font-display font-bold flex items-center justify-center text-[10.5px]">
              {currentUser?.name.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="leading-tight text-left">
              <div className="font-bold text-[#EDE7DC] text-[11px] flex items-center gap-1.5 font-display">
                <span>{currentUser?.name}</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase border ${roleRules.badgeColor}`}>
                  {userRole}
                </span>
              </div>
              <div className="text-[10px] text-[#9EA5A8] font-mono">
                {roleRules.clearanceLabel}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-[rgba(237,231,220,0.13)] hover:border-[#E8913C] text-[#9EA5A8] hover:text-[#E8913C] text-xs font-mono font-semibold transition"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex overflow-hidden">

        {/* SIDEBAR NAVIGATION WITH RBAC LOCK INDICATORS */}
        <aside className="w-64 bg-[#0A0C0E] border-r border-[rgba(237,231,220,0.13)] p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-6">

            {/* PREMIER 3D TALENT PRISM */}
            <div>
              <div className="text-[10px] uppercase font-mono font-bold text-[#6C7378] tracking-[0.14em] px-2 mb-2">
                3D Volumetric Core
              </div>
              <button
                type="button"
                onClick={() => handleNavigate('3d-talent-prism')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === '3d-talent-prism'
                    ? 'bg-[#101317] border border-[#E8913C] text-[#EDE7DC] shadow-sm'
                    : 'text-[#9EA5A8] hover:bg-[#101317] hover:text-[#EDE7DC]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Box className="size-4 shrink-0 text-[#E8913C]" />
                  <span className="font-display font-bold">3D Talent & Risk Prism</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-[#E8913C]/40 text-[#E8913C] uppercase font-bold">
                  3D
                </span>
              </button>
            </div>

            {/* GROUP 1: EXECUTIVE INTELLIGENCE */}
            <div>
              <div className="text-[10px] uppercase font-mono font-bold text-[#6C7378] tracking-[0.14em] px-2 mb-2">
                Executive Intelligence
              </div>
              <nav className="space-y-1">
                {[
                  { id: 'war-room', name: 'Flight Risk War Room', icon: ShieldAlert },
                  { id: 'simulator', name: 'Retention ROI Simulator', icon: Sliders },
                  { id: 'reports', name: 'Executive Boardroom Memo', icon: FileText }
                ].map(item => {
                  const allowed = isAuthorized(item.id);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        activeTab === item.id
                          ? 'bg-[#101317] border border-[rgba(237,231,220,0.25)] text-[#EDE7DC]'
                          : allowed
                          ? 'text-[#9EA5A8] hover:bg-[#101317] hover:text-[#EDE7DC]'
                          : 'text-[#6C7378] opacity-60 hover:opacity-100 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="size-4 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      {!allowed && <Lock className="size-3 text-[#6C7378]" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* GROUP 2: WORKFORCE OPERATIONS (HCM) */}
            <div>
              <div className="text-[10px] uppercase font-mono font-bold text-[#6C7378] tracking-[0.14em] px-2 mb-2">
                HCM Operations
              </div>
              <nav className="space-y-1">
                {[
                  { id: 'leaves', name: 'Leave Approvals', icon: Calendar, badge: leaves.filter(l => l.status === 'Pending').length },
                  { id: 'nine-box', name: '9-Box Talent Review', icon: Activity },
                  { id: 'ats', name: 'Talent Acquisition ATS', icon: Users },
                  { id: 'succession', name: 'Succession & Bench', icon: Award }
                ].map(item => {
                  const allowed = isAuthorized(item.id);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        activeTab === item.id
                          ? 'bg-[#101317] border border-[rgba(237,231,220,0.25)] text-[#EDE7DC]'
                          : allowed
                          ? 'text-[#9EA5A8] hover:bg-[#101317] hover:text-[#EDE7DC]'
                          : 'text-[#6C7378] opacity-60 hover:opacity-100 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="size-4 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      {!allowed ? (
                        <Lock className="size-3 text-[#6C7378]" />
                      ) : item.badge && item.badge > 0 ? (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono border border-[#E8913C]/40 text-[#E8913C] font-bold">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* GROUP 3: GOVERNANCE & INTEGRATION */}
            <div>
              <div className="text-[10px] uppercase font-mono font-bold text-[#6C7378] tracking-[0.14em] px-2 mb-2">
                Governance & Feeds
              </div>
              <nav className="space-y-1">
                {[
                  { id: 'webhooks', name: 'HRMS Webhook Gateway', icon: Webhook },
                  { id: 'compliance', name: 'DPDP Act 2023 & Bias', icon: Lock },
                  { id: 'payroll', name: 'Payroll & Comp Equity', icon: DollarSign },
                  { id: 'sentiment', name: 'Sentiment Pulse (eNPS)', icon: BarChart3 }
                ].map(item => {
                  const allowed = isAuthorized(item.id);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        activeTab === item.id
                          ? 'bg-[#101317] border border-[rgba(237,231,220,0.25)] text-[#EDE7DC]'
                          : allowed
                          ? 'text-[#9EA5A8] hover:bg-[#101317] hover:text-[#EDE7DC]'
                          : 'text-[#6C7378] opacity-60 hover:opacity-100 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="size-4 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      {!allowed && <Lock className="size-3 text-[#6C7378]" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* GROUP 4: PERSONAL WORKSPACE */}
            <div>
              <div className="text-[10px] uppercase font-mono font-bold text-[#6C7378] tracking-[0.14em] px-2 mb-2">
                My Workspace
              </div>
              <button
                type="button"
                onClick={() => handleNavigate('self-service')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'self-service'
                    ? 'bg-[#101317] border border-[rgba(237,231,220,0.25)] text-[#EDE7DC]'
                    : 'text-[#9EA5A8] hover:bg-[#101317] hover:text-[#EDE7DC]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="size-4 shrink-0" />
                  <span>Employee Self-Service</span>
                </div>
              </button>
            </div>

          </div>

          <div className="pt-4 border-t border-[rgba(237,231,220,0.13)] text-[10.5px] font-mono text-[#6C7378] space-y-1">
            <div className="flex justify-between">
              <span>RBAC Policy</span>
              <span className="text-[#9EA5A8]">SEC-04 Active</span>
            </div>
            <div className="flex justify-between">
              <span>DPDP Section 6</span>
              <span className="text-[#2E6B72] font-semibold">Strict Masking</span>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

          {/* IF UNAUTHORIZED: RENDER 403 FORBIDDEN WALL */}
          {!isAuthorized(activeTab) ? (
            <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-[#101317] border border-[rgba(237,231,220,0.13)] shadow-2xl space-y-6 text-center">
              <div className="size-16 rounded-2xl bg-[#0A0C0E] border border-[#E8913C]/40 text-[#E8913C] flex items-center justify-center mx-auto shadow-inner">
                <Ban className="size-8" />
              </div>

              <div>
                <span className="text-[11px] uppercase font-mono font-bold px-3 py-1 rounded-full border border-[#E8913C]/30 text-[#E8913C]">
                  HTTP 403 • ACCESS RESTRICTED BY RBAC POLICY
                </span>
                <h2 className="font-display text-2xl font-black mt-3 text-[#EDE7DC]">
                  Unauthorized Module Access
                </h2>
                <p className="text-xs text-[#9EA5A8] mt-2 max-w-lg mx-auto leading-relaxed">
                  Your authenticated session identity <strong>{currentUser?.name}</strong> (Role: <code className="px-1.5 py-0.5 rounded bg-[#0A0C0E] border border-[rgba(237,231,220,0.1)] text-[#EDE7DC] font-bold">{userRole}</code>) does not hold the mandatory privilege <code className="text-[#E8913C] font-mono font-bold">{TAB_REQUIRED_PERMISSIONS[activeTab]?.perm}</code> required to access the <strong>{TAB_REQUIRED_PERMISSIONS[activeTab]?.name}</strong> module.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.1)] text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#6C7378]">Statutory Shield:</span>
                  <span className="text-[#EDE7DC] font-bold">Indian DPDP Act 2023 Sec 6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C7378]">Required Clearance:</span>
                  <span className="text-[#E8913C] font-bold">{TAB_REQUIRED_PERMISSIONS[activeTab]?.roleNeeded}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C7378]">Security Audit Status:</span>
                  <span className="text-[#2E6B72] font-bold">ACCESS_DENIED_VIOLATION LOGGED</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="text-xs font-mono text-[#6C7378]">Need to test this module? Switch to an authorized persona:</div>
                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(DEMO_PERSONAS[0])}
                    className="px-4 py-2 rounded-full bg-[#EDE7DC] text-[#0A0C0E] hover:text-[#E8913C] hover:bg-transparent border border-[#EDE7DC] hover:border-[#E8913C] font-mono text-[11px] font-bold tracking-wider uppercase transition"
                  >
                    👑 Switch to HR Admin (Full Access)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(DEMO_PERSONAS[1])}
                    className="px-4 py-2 rounded-full bg-transparent border border-[#2E6B72] text-[#2E6B72] hover:text-[#EDE7DC] hover:border-[#EDE7DC] font-mono text-[11px] font-bold tracking-wider uppercase transition"
                  >
                    👔 Switch to Engineering Manager
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* AUTHORIZED CONTENT */
            /* ============================================================== */
            <>
              {/* SECTION HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(237,231,220,0.13)]">
                <div>
                  <div className="text-[10.5px] font-mono font-bold text-[#E8913C] uppercase tracking-[0.14em]">
                    {activeTab === '3d-talent-prism' && 'Performance x Potential x Attrition Risk Topography'}
                    {activeTab === 'war-room' && 'Attrition Early-Warning Engine'}
                    {activeTab === 'simulator' && 'Tijori Capital Retention Modeling'}
                    {activeTab === 'leaves' && 'Attendance & Burnout Management'}
                    {activeTab === 'nine-box' && 'Strategic Talent Review Matrix'}
                    {activeTab === 'ats' && 'Talent Acquisition & Candidate Pipeline'}
                    {activeTab === 'succession' && 'Critical Role Continuity'}
                    {activeTab === 'webhooks' && 'Real-Time Darwinbox / Workday Gateway'}
                    {activeTab === 'compliance' && 'Algorithmic Fairness & Privacy Audit'}
                    {activeTab === 'self-service' && 'Personal Profile & Leave Request'}
                    {activeTab === 'payroll' && 'Compensation Equity & Bands'}
                    {activeTab === 'sentiment' && 'Organizational Engagement Pulse'}
                    {activeTab === 'reports' && 'Executive C-Suite Briefing'}
                  </div>
                  <h1 className="font-display text-2xl font-extrabold tracking-[-0.025em] text-[#EDE7DC] capitalize">
                    {activeTab === '3d-talent-prism' ? '3D Talent & Risk Prism' : activeTab.replace('-', ' ')}
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  {activeTab === 'simulator' && (
                    <button
                      type="button"
                      onClick={() => setMemoOpen(true)}
                      className="px-4 py-2 rounded-full bg-[#EDE7DC] text-[#0A0C0E] hover:text-[#E8913C] hover:bg-transparent border border-[#EDE7DC] hover:border-[#E8913C] font-mono text-[11px] font-bold tracking-wider uppercase transition flex items-center gap-2"
                    >
                      <FileText className="size-3.5" />
                      <span>Draft CFO Memo</span>
                    </button>
                  )}

                  {activeTab === 'leaves' && (
                    <button
                      type="button"
                      onClick={() => setApplyLeaveModal(true)}
                      className="px-4 py-2 rounded-full bg-[#EDE7DC] text-[#0A0C0E] hover:text-[#E8913C] hover:bg-transparent border border-[#EDE7DC] hover:border-[#E8913C] font-mono text-[11px] font-bold tracking-wider uppercase transition flex items-center gap-2"
                    >
                      <Calendar className="size-3.5" />
                      <span>Apply for Leave</span>
                    </button>
                  )}

                  {activeTab === 'webhooks' && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSimulateWebhook('darwinbox', 'COMPENSATION_CHANGE')}
                        className="px-3 py-1.5 rounded-full bg-[#101317] hover:border-[#E8913C] text-[#EDE7DC] text-xs font-mono font-semibold border border-[rgba(237,231,220,0.13)] transition"
                      >
                        + Darwinbox Event
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateWebhook('workday', 'OVERTIME_LOGGED')}
                        className="px-3 py-1.5 rounded-full bg-[#101317] hover:border-[#E8913C] text-[#EDE7DC] text-xs font-mono font-semibold border border-[rgba(237,231,220,0.13)] transition"
                      >
                        + Workday Event
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* TAB 0: PREMIER 3D TALENT & RISK PRISM */}
              {activeTab === '3d-talent-prism' && (
                <div className="space-y-6">
                  <Talent3DCube
                    employees={employees}
                    onSelectEmployee={(emp) => {
                      setSelectedEmp(emp);
                      showToast(`Spotlit ${emp.name} in 3D Prism.`);
                    }}
                    onOpenSimulator={(emp) => {
                      setSelectedEmp(emp);
                      handleNavigate('simulator');
                    }}
                  />

                  {/* 3D Context & Executive Value Props */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-[#101317] border border-[rgba(237,231,220,0.13)]">
                      <div className="text-[10px] font-mono text-[#E8913C] uppercase font-bold">X & Y Planes</div>
                      <div className="font-display font-bold text-lg text-[#EDE7DC] mt-1">Classic 9-Box Matrix</div>
                      <div className="text-[11px] text-[#9EA5A8] mt-1">Calibrated on Performance (X: 1-5) and Growth Potential (Y: 1-5).</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#101317] border border-[rgba(237,231,220,0.13)]">
                      <div className="text-[10px] font-mono text-[#E8913C] uppercase font-bold">Z Plane (The 3rd Dimension)</div>
                      <div className="font-display font-bold text-lg text-[#EDE7DC] mt-1">ML Attrition Flight Risk</div>
                      <div className="text-[11px] text-[#9EA5A8] mt-1">Visualizes imminent departure risk (0% to 100%) cutting across performance.</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#101317] border border-[rgba(237,231,220,0.13)]">
                      <div className="text-[10px] font-mono text-[#2E6B72] uppercase font-bold">Orange Translucent Laser Plane</div>
                      <div className="font-display font-bold text-lg text-[#EDE7DC] mt-1">Critical &gt;75% Risk Barrier</div>
                      <div className="text-[11px] text-[#9EA5A8] mt-1">Instant visual identification of irreplaceable top talent in danger zone.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: FLIGHT RISK WAR ROOM */}
              {activeTab === 'war-room' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 rounded-2xl bg-[#101317] border border-[rgba(237,231,220,0.13)]">
                      <div className="flex justify-between items-center text-[#9EA5A8] text-xs font-mono font-semibold">
                        <span>TOTAL HEADCOUNT</span>
                        <Building2 className="size-4 text-[#EDE7DC]" />
                      </div>
                      <div className="font-display text-2xl font-extrabold mt-2 text-[#EDE7DC] tabular-nums">1,470</div>
                      <div className="text-[11px] text-[#9EA5A8] mt-1">Active across 6 departments</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#101317] border border-[rgba(237,231,220,0.13)]">
                      <div className="flex justify-between items-center text-[#E8913C] text-xs font-mono font-semibold">
                        <span>CRITICAL FLIGHT RISK</span>
                        <AlertTriangle className="size-4 text-[#E8913C]" />
                      </div>
                      <div className="font-display text-2xl font-extrabold mt-2 text-[#E8913C] tabular-nums">42 Employees</div>
                      <div className="text-[11px] text-[#9EA5A8] mt-1">Attrition probability &gt; 80%</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#101317] border border-[rgba(237,231,220,0.13)]">
                      <div className="flex justify-between items-center text-[#9EA5A8] text-xs font-mono font-semibold">
                        <span>REPLACEMENT COST EXPOSURE</span>
                        <DollarSign className="size-4 text-[#E8913C]" />
                      </div>
                      <div className="font-display text-2xl font-extrabold mt-2 text-[#EDE7DC] tabular-nums">₹8.42 Crore</div>
                      <div className="text-[11px] text-[#9EA5A8] mt-1">Calculated at 1.5x Annual CTC</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#101317] border border-[rgba(237,231,220,0.13)]">
                      <div className="flex justify-between items-center text-[#2E6B72] text-xs font-mono font-semibold">
                        <span>FOUR-FIFTHS BIAS RATIO</span>
                        <ShieldCheck className="size-4 text-[#2E6B72]" />
                      </div>
                      <div className="font-display text-2xl font-extrabold mt-2 text-[#2E6B72] tabular-nums">1.04 DIR</div>
                      <div className="text-[11px] text-[#9EA5A8] mt-1">Statistically equitable (0.80 - 1.25)</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                      <Search className="size-4 text-[#9EA5A8] absolute left-3 top-3" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search employee or GlobalID..."
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl text-xs bg-[#101317] border border-[rgba(237,231,220,0.13)] text-[#EDE7DC] focus:outline-none focus:border-[#E8913C]"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-xs font-mono text-[#9EA5A8]">DEPARTMENT:</span>
                      <select
                        value={deptFilter}
                        onChange={(e) => setDeptFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl text-xs bg-[#101317] border border-[rgba(237,231,220,0.13)] text-[#EDE7DC] focus:outline-none"
                      >
                        <option value="ALL">All Departments</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Product">Product</option>
                        <option value="AI Research">AI Research</option>
                        <option value="Sales Engineering">Sales Engineering</option>
                      </select>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-[#101317] border border-[rgba(237,231,220,0.13)] overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-[rgba(237,231,220,0.13)] flex justify-between items-center">
                      <h3 className="font-mono text-[10.5px] uppercase font-bold tracking-[0.14em] text-[#EDE7DC]">
                        High-Risk Workforce Queue ({filteredEmployees.length})
                      </h3>
                      <span className="text-[10.5px] text-[#9EA5A8] font-mono">
                        {isAuditor ? 'Salted Pseudonyms Active' : 'Real Demographics'}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#0A0C0E] text-[#9EA5A8] font-mono text-[10.5px] tracking-wider uppercase border-b border-[rgba(237,231,220,0.13)]">
                          <tr>
                            <th className="py-3 px-4">Employee</th>
                            <th className="py-3 px-4">Role & Dept</th>
                            <th className="py-3 px-4">Flight Risk</th>
                            <th className="py-3 px-4">Compensation</th>
                            <th className="py-3 px-4">Primary Trigger</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(237,231,220,0.08)]">
                          {filteredEmployees.map(emp => {
                            const displayName = isAuditor ? emp.masked_name : emp.name;
                            const displaySalary = isAuditor ? emp.salary_band : `₹${emp.monthly_salary.toLocaleString('en-IN')}/mo`;

                            return (
                              <tr key={emp.global_id} className="hover:bg-[#0A0C0E]/50 transition">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-[#0A0C0E] border border-[rgba(237,231,220,0.18)] flex items-center justify-center font-display font-bold text-xs text-[#EDE7DC]">
                                      {emp.avatar}
                                    </div>
                                    <div>
                                      <div className="font-bold text-[#EDE7DC] font-display">{displayName}</div>
                                      <div className="text-[10px] text-[#9EA5A8] font-mono">ID #{emp.global_id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-semibold text-[#EDE7DC]">{emp.job_role}</div>
                                  <div className="text-[11px] text-[#9EA5A8]">{emp.department}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                                    emp.risk_tier === 'HIGH'
                                      ? 'text-[#E8913C] border-[#E8913C]/40'
                                      : 'text-[#2E6B72] border-[#2E6B72]/40'
                                  }`}>
                                    {(emp.attrition_probability * 100).toFixed(1)}% RISK
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-mono text-[#EDE7DC] tabular-nums">
                                  {displaySalary}
                                </td>
                                <td className="py-3 px-4 text-[#9EA5A8] text-[11px]">
                                  {emp.reason}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedEmp(emp);
                                      handleNavigate('simulator');
                                    }}
                                    className="px-3 py-1.5 rounded-full border border-[rgba(237,231,220,0.2)] hover:border-[#E8913C] text-[#EDE7DC] hover:text-[#E8913C] font-mono text-[10.5px] font-bold tracking-wider uppercase transition"
                                  >
                                    Simulate
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: WHAT-IF RETENTION ROI SIMULATOR */}
              {activeTab === 'simulator' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-6 space-y-6">
                    <div className="p-6 rounded-3xl bg-[#101317] border border-[rgba(237,231,220,0.13)] shadow-sm space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-[rgba(237,231,220,0.13)]">
                        <div>
                          <h3 className="font-display font-extrabold text-lg text-[#EDE7DC]">Executive Retention Levers</h3>
                          <p className="text-xs text-[#9EA5A8]">Tune compensation and flexibility to model flight risk suppression.</p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#E8913C]/40 text-[#E8913C] font-bold">
                          Tijori Engine
                        </span>
                      </div>

                      <div>
                        <label className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-[#9EA5A8] mb-1.5 block">
                          Target Employee
                        </label>
                        <select
                          value={selectedEmp.global_id}
                          onChange={(e) => {
                            const found = employees.find(em => em.global_id === parseInt(e.target.value, 10));
                            if (found) setSelectedEmp(found);
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] text-[#EDE7DC] focus:outline-none"
                        >
                          {employees.map(em => (
                            <option key={em.global_id} value={em.global_id}>
                              {em.name} ({em.job_role} • {(em.attrition_probability * 100).toFixed(1)}% Risk)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                          <span className="text-[#EDE7DC]">Salary Hike Increment</span>
                          <span className="text-[#E8913C] font-mono">+{salaryHike}% (₹{incAmount.toLocaleString('en-IN')}/mo)</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          step="5"
                          value={salaryHike}
                          onChange={(e) => setSalaryHike(parseInt(e.target.value, 10))}
                          className="w-full accent-[#E8913C] h-2 bg-[#0A0C0E] rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                          <span className="text-[#EDE7DC]">Overtime Relief</span>
                          <span className="text-[#2E6B72] font-mono">-{overtimeReduction} hrs/mo relief</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          step="5"
                          value={overtimeReduction}
                          onChange={(e) => setOvertimeReduction(parseInt(e.target.value, 10))}
                          className="w-full accent-[#2E6B72] h-2 bg-[#0A0C0E] rounded-lg cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-[#9EA5A8] mb-1.5 block">
                          Flexibility Model
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {['office', 'hybrid', 'remote'].map(policy => (
                            <button
                              key={policy}
                              type="button"
                              onClick={() => setWlbPolicy(policy)}
                              className={`py-2 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition border ${
                                wlbPolicy === policy
                                  ? 'bg-[#0A0C0E] border-[#E8913C] text-[#E8913C]'
                                  : 'bg-[#0A0C0E] border-[rgba(237,231,220,0.1)] text-[#9EA5A8] hover:text-[#EDE7DC]'
                              }`}
                            >
                              {policy === 'office' ? '🏢 On-Site' : policy === 'hybrid' ? '⚡ Hybrid 3+2' : '🌍 Remote'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setMemoOpen(true)}
                        className="w-full py-3 rounded-full bg-[#EDE7DC] text-[#0A0C0E] hover:text-[#E8913C] hover:bg-transparent border border-[#EDE7DC] hover:border-[#E8913C] font-mono text-[11px] font-bold tracking-wider uppercase transition flex items-center justify-center gap-2"
                      >
                        <FileText className="size-4" />
                        <span>Generate CFO Retention Authorization Memo</span>
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-6 space-y-6">
                    <div className="p-6 rounded-3xl bg-[#101317] border border-[rgba(237,231,220,0.13)] shadow-sm space-y-6">
                      <div className="flex items-center justify-between pb-3 border-b border-[rgba(237,231,220,0.13)]">
                        <h3 className="font-display font-extrabold text-lg text-[#EDE7DC]">Financial Impact & ROI Projection</h3>
                        <span className="text-xs font-mono text-[#2E6B72] font-bold">{roiMultiple}x Multiple</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-[#0A0C0E] border border-[#E8913C]/30 text-center">
                          <div className="text-[10.5px] font-mono font-bold text-[#E8913C] uppercase">Baseline Flight Risk</div>
                          <div className="font-display text-2xl font-black text-[#E8913C] mt-1 tabular-nums">{baseProb.toFixed(1)}%</div>
                          <div className="text-[10px] text-[#9EA5A8] mt-1">Imminent Departure</div>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#0A0C0E] border border-[#2E6B72]/30 text-center">
                          <div className="text-[10.5px] font-mono font-bold text-[#2E6B72] uppercase">Post-Package Risk</div>
                          <div className="font-display text-2xl font-black text-[#2E6B72] mt-1 tabular-nums">{simulatedProb}%</div>
                          <div className="text-[10px] text-[#2E6B72] mt-1">-{totalReductionPct.toFixed(1)}% Suppression</div>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between py-2 border-b border-[rgba(237,231,220,0.08)]">
                          <span className="text-[#9EA5A8]">Turnover Replacement Loss (1.5x CTC)</span>
                          <span className="font-mono font-bold text-[#EDE7DC] tabular-nums">₹{replacementCost.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[rgba(237,231,220,0.08)]">
                          <span className="text-[#9EA5A8]">Turnover Cost Avoidance</span>
                          <span className="font-mono font-bold text-[#2E6B72] tabular-nums">₹{turnoverCostAvoidance.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[rgba(237,231,220,0.08)]">
                          <span className="text-[#9EA5A8]">Annual Package Cost</span>
                          <span className="font-mono font-bold text-[#E8913C] tabular-nums">-₹{annualInterventionCost.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between py-3 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.1)] px-4 font-bold text-sm">
                          <span className="text-[#EDE7DC] font-display">Net Enterprise Financial Gain</span>
                          <span className="font-mono text-[#2E6B72] tabular-nums">₹{netFinancialGain.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LEAVE MANAGEMENT & APPROVALS */}
              {activeTab === 'leaves' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-[#101317] border border-[#E8913C]/40 flex items-start gap-3 text-xs text-[#E8913C]">
                    <AlertTriangle className="size-5 shrink-0 mt-0.5 text-[#E8913C]" />
                    <div>
                      <strong>Burnout Risk Correlation:</strong> Employees with zero approved leaves in 90 days while logging &gt;30 hours of overtime exhibit an <strong>82.4% higher attrition velocity</strong>. Timely leave approvals directly decrease flight risk.
                    </div>
                  </div>

                  <div className="rounded-3xl bg-[#101317] border border-[rgba(237,231,220,0.13)] overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-[rgba(237,231,220,0.13)] flex justify-between items-center">
                      <h3 className="font-mono text-[10.5px] uppercase font-bold tracking-[0.14em] text-[#EDE7DC]">
                        Leave Approvals Queue
                      </h3>
                      <span className="text-xs text-[#9EA5A8] font-mono">{leaves.length} Total Requests</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#0A0C0E] text-[#9EA5A8] font-mono text-[10.5px] uppercase tracking-wider border-b border-[rgba(237,231,220,0.13)]">
                          <tr>
                            <th className="py-3 px-4">Request ID</th>
                            <th className="py-3 px-4">Employee</th>
                            <th className="py-3 px-4">Leave Type</th>
                            <th className="py-3 px-4">Duration</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(237,231,220,0.08)]">
                          {leaves.map(l => (
                            <tr key={l.id} className="hover:bg-[#0A0C0E]/50 transition">
                              <td className="py-3 px-4 font-mono text-[#9EA5A8]">#{l.id}</td>
                              <td className="py-3 px-4 font-bold text-[#EDE7DC] font-display">
                                {l.name}
                                <span className="text-[10px] text-[#9EA5A8] block font-mono font-normal">ID #{l.employee_id}</span>
                              </td>
                              <td className="py-3 px-4 text-[#EDE7DC]">{l.leave_type}</td>
                              <td className="py-3 px-4 font-mono text-[#EDE7DC]">{l.days} Days</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                                  l.status === 'Approved' ? 'border-[#2E6B72]/40 text-[#2E6B72]' :
                                  l.status === 'Rejected' ? 'border-rose-500/40 text-rose-400' :
                                  'border-[#E8913C]/40 text-[#E8913C]'
                                }`}>
                                  {l.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                {l.status === 'Pending' ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleApproveLeave(l.id)}
                                      className="px-3 py-1 rounded-full border border-[#2E6B72] text-[#2E6B72] hover:bg-[#2E6B72] hover:text-[#EDE7DC] font-mono font-bold text-[10.5px] transition"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRejectLeave(l.id)}
                                      className="px-3 py-1 rounded-full border border-rose-500/40 text-rose-400 hover:bg-rose-500 hover:text-[#EDE7DC] font-mono font-bold text-[10.5px] transition"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[#6C7378] font-mono text-[10.5px]">Completed</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: 9-BOX TALENT REVIEW */}
              {activeTab === 'nine-box' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-[#101317] border border-[rgba(237,231,220,0.13)] shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-[rgba(237,231,220,0.13)]">
                      <div>
                        <h3 className="font-display font-extrabold text-lg text-[#EDE7DC]">9-Box Performance vs Potential Calibration</h3>
                        <p className="text-xs text-[#9EA5A8]">Volumetric 2D slice mapping organizational bench strength.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleNavigate('3d-talent-prism')}
                        className="px-3.5 py-1.5 rounded-full border border-[#E8913C] text-[#E8913C] hover:bg-[#E8913C] hover:text-[#0A0C0E] font-mono text-[10.5px] font-bold uppercase transition flex items-center gap-1.5"
                      >
                        <Box className="size-3.5" />
                        <span>View in 3D Prism →</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.1)] text-xs">
                        <div className="font-mono text-[#E8913C] uppercase text-[10px] font-bold">High Pot • Med Perf</div>
                        <div className="font-display font-bold text-[#EDE7DC] mt-1">Growth Enigma</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.1)] text-xs">
                        <div className="font-mono text-[#2E6B72] uppercase text-[10px] font-bold">High Pot • High Perf</div>
                        <div className="font-display font-bold text-[#EDE7DC] mt-1">High Impact Leader</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#0A0C0E] border border-[#E8913C]/40 text-xs shadow-sm">
                        <div className="font-mono text-[#E8913C] uppercase text-[10px] font-bold">Top Star (5 / 5)</div>
                        <div className="font-display font-bold text-[#EDE7DC] mt-1">Star Performer</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.1)] text-xs">
                        <div className="font-mono text-[#6C7378] uppercase text-[10px] font-bold">Med Pot • Low Perf</div>
                        <div className="font-display font-bold text-[#EDE7DC] mt-1">Dilemma</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.15)] text-xs">
                        <div className="font-mono text-[#9EA5A8] uppercase text-[10px] font-bold">Med Pot • Med Perf</div>
                        <div className="font-display font-bold text-[#EDE7DC] mt-1">Core Contributor</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.1)] text-xs">
                        <div className="font-mono text-[#2E6B72] uppercase text-[10px] font-bold">Med Pot • High Perf</div>
                        <div className="font-display font-bold text-[#EDE7DC] mt-1">High Performer</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#0A0C0E] border border-rose-500/20 text-xs">
                        <div className="font-mono text-rose-400 uppercase text-[10px] font-bold">Low Pot • Low Perf</div>
                        <div className="font-display font-bold text-rose-400 mt-1">Underperformer</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.1)] text-xs">
                        <div className="font-mono text-[#6C7378] uppercase text-[10px] font-bold">Low Pot • Med Perf</div>
                        <div className="font-display font-bold text-[#EDE7DC] mt-1">Effective Contributor</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#0A0C0E] border border-[#E8913C]/20 text-xs">
                        <div className="font-mono text-[#E8913C] uppercase text-[10px] font-bold">Low Pot • High Perf</div>
                        <div className="font-display font-bold text-[#EDE7DC] mt-1">Workhorse / Trusted Pro</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-[#101317] border border-[rgba(237,231,220,0.13)] overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-[rgba(237,231,220,0.13)]">
                      <h3 className="font-mono text-[10.5px] uppercase font-bold tracking-[0.14em] text-[#EDE7DC]">
                        Calibrated Reviewees ({nineBoxReviews.length})
                      </h3>
                    </div>
                    <div className="divide-y divide-[rgba(237,231,220,0.08)]">
                      {nineBoxReviews.map(r => (
                        <div key={r.id} className="p-4 flex items-center justify-between hover:bg-[#0A0C0E]/50 text-xs">
                          <div>
                            <div className="font-bold text-[#EDE7DC] font-display">{r.name}</div>
                            <div className="text-[#9EA5A8] text-[11px]">{r.role} • {r.dept}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-[#9EA5A8]">Perf: {r.perf}/5 • Pot: {r.pot}/5</span>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono border border-[rgba(237,231,220,0.15)] text-[#EDE7DC]">
                              {r.category}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: TALENT ACQUISITION ATS */}
              {activeTab === 'ats' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['Sourced', 'Interview', 'Offered', 'Hired'].map(stage => {
                      const stageCandidates = candidates.filter(c => c.stage === stage);
                      return (
                        <div key={stage} className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-3xl p-4 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center pb-2 border-b border-[rgba(237,231,220,0.13)]">
                              <span className="font-mono font-bold text-xs uppercase tracking-[0.12em] text-[#EDE7DC]">{stage}</span>
                              <span className="size-5 rounded-full bg-[#0A0C0E] border border-[rgba(237,231,220,0.18)] text-[11px] font-mono flex items-center justify-center font-bold text-[#E8913C]">
                                {stageCandidates.length}
                              </span>
                            </div>

                            <div className="mt-3 space-y-3">
                              {stageCandidates.map(c => (
                                <div key={c.id} className="p-3 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.1)] text-xs space-y-2">
                                  <div className="font-bold text-[#EDE7DC] font-display">{c.name}</div>
                                  <div className="text-[11px] text-[#9EA5A8]">{c.role}</div>
                                  <div className="text-[10px] text-[#6C7378] font-mono">Skills: {c.skills}</div>

                                  {stage === 'Offered' && (
                                    <div className="pt-2 flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleHireCandidate(c.id)}
                                        className="flex-1 py-1 rounded-full border border-[#2E6B72] text-[#2E6B72] hover:bg-[#2E6B72] hover:text-[#EDE7DC] font-mono font-bold text-[10px] transition"
                                      >
                                        ✨ Hire
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRejectCandidate(c.id)}
                                        className="px-2 py-1 rounded-full border border-rose-500/40 text-rose-400 hover:bg-rose-500 hover:text-[#EDE7DC] font-mono font-bold text-[10px] transition"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 6: SUCCESSION PLANNING */}
              {activeTab === 'succession' && (
                <div className="space-y-6">
                  <div className="rounded-3xl bg-[#101317] border border-[rgba(237,231,220,0.13)] overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-[rgba(237,231,220,0.13)] flex justify-between items-center">
                      <h3 className="font-mono text-[10.5px] uppercase font-bold tracking-[0.14em] text-[#EDE7DC]">
                        Critical Leadership Roles & Succession Bench
                      </h3>
                      <span className="text-xs text-[#2E6B72] font-mono font-bold">100% Target Role Coverage</span>
                    </div>

                    <div className="divide-y divide-[rgba(237,231,220,0.08)]">
                      {successionPlans.map(plan => (
                        <div key={plan.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#0A0C0E]/50 text-xs">
                          <div>
                            <div className="text-[10px] font-mono font-bold text-[#E8913C] uppercase">{plan.dept}</div>
                            <div className="text-sm font-bold text-[#EDE7DC] font-display mt-0.5">{plan.target_role}</div>
                            <div className="text-[#9EA5A8] mt-1">
                              Primary Successor: <strong className="text-[#EDE7DC]">{plan.successor}</strong>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div>
                              <div className="text-[10px] text-[#6C7378] font-mono uppercase">Readiness</div>
                              <div className="font-bold text-[#2E6B72] font-mono text-sm">{plan.readiness}</div>
                            </div>

                            <div>
                              <div className="text-[10px] text-[#6C7378] font-mono uppercase">Estimated Ramp</div>
                              <div className="font-mono text-[#EDE7DC]">{plan.ramp_time}</div>
                            </div>

                            <div className="max-w-xs">
                              <div className="text-[10px] text-[#6C7378] font-mono uppercase">Development Gap</div>
                              <div className="text-[#9EA5A8] text-[11px] truncate">{plan.gap}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: HRMS WEBHOOK GATEWAY */}
              {activeTab === 'webhooks' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-[#101317] border border-[rgba(237,231,220,0.13)] shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-display font-extrabold text-lg text-[#EDE7DC]">Live HRMS Webhook Gateway</h3>
                        <p className="text-xs text-[#9EA5A8]">Ingests real-time events from Darwinbox, Workday, and BambooHR via HMAC-SHA256.</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border border-[#2E6B72]/40 text-[#2E6B72]">
                        🟢 LISTENERS ACTIVE
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleSimulateWebhook('darwinbox', 'COMPENSATION_CHANGE')}
                        className="p-3.5 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] hover:border-[#E8913C] text-left transition"
                      >
                        <div className="font-mono font-bold text-xs text-[#E8913C]">Darwinbox Integration</div>
                        <div className="text-[11px] text-[#9EA5A8] mt-0.5">POST /darwinbox • Comp Hike</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSimulateWebhook('workday', 'OVERTIME_LOGGED')}
                        className="p-3.5 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] hover:border-[#2E6B72] text-left transition"
                      >
                        <div className="font-mono font-bold text-xs text-[#2E6B72]">Workday Integration</div>
                        <div className="text-[11px] text-[#9EA5A8] mt-0.5">POST /workday • Overtime Spike</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSimulateWebhook('bamboohr', 'RESIGNATION_NOTICE')}
                        className="p-3.5 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] hover:border-[#EDE7DC] text-left transition"
                      >
                        <div className="font-mono font-bold text-xs text-[#EDE7DC]">BambooHR Integration</div>
                        <div className="text-[11px] text-[#9EA5A8] mt-0.5">POST /generic • Resignation Alert</div>
                      </button>
                    </div>
                  </div>

                  <div className="rounded-3xl bg-[#101317] border border-[rgba(237,231,220,0.13)] overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-[rgba(237,231,220,0.13)] flex justify-between items-center">
                      <h3 className="font-mono text-[10.5px] uppercase font-bold tracking-[0.14em] text-[#EDE7DC]">
                        Real-Time Ingestion Event Log
                      </h3>
                      <span className="text-[10.5px] font-mono text-[#9EA5A8]">HMAC-SHA256 Verified</span>
                    </div>

                    <div className="divide-y divide-[rgba(237,231,220,0.08)]">
                      {webhooks.map(ev => (
                        <div key={ev.id} className="p-4 flex items-center justify-between hover:bg-[#0A0C0E]/50 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-[#0A0C0E] border border-[rgba(237,231,220,0.18)] flex items-center justify-center font-mono font-bold text-[#E8913C]">
                              ⚡
                            </div>
                            <div>
                              <div className="font-bold text-[#EDE7DC] flex items-center gap-2">
                                <span>{ev.provider.toUpperCase()}</span>
                                <span className="text-[#9EA5A8] font-normal">• {ev.event}</span>
                                <span className="text-[10px] text-[#6C7378] font-mono">({ev.id})</span>
                              </div>
                              <div className="text-[#9EA5A8] text-[11px] mt-0.5">{ev.desc}</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border border-[#2E6B72]/40 text-[#2E6B72]">
                              {ev.latency}
                            </span>
                            <div className="text-[10px] text-[#6C7378] font-mono mt-1">{ev.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: DPDP ACT 2023 & BIAS AUDIT */}
              {activeTab === 'compliance' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-6 p-6 rounded-3xl bg-[#101317] border border-[rgba(237,231,220,0.13)] shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[rgba(237,231,220,0.13)]">
                      <div>
                        <h3 className="font-display font-extrabold text-lg text-[#EDE7DC]">Four-Fifths Algorithmic Bias Audit</h3>
                        <p className="text-xs text-[#9EA5A8]">EEOC & Indian DPDP Act 2023 Disparate Impact Ratio (DIR) compliance.</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border border-[#2E6B72]/40 text-[#2E6B72]">
                        STATISTICALLY EQUITABLE
                      </span>
                    </div>

                    <div className="space-y-4 pt-2 text-xs">
                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-[#EDE7DC]">Female Cohort (High-Risk Identification Rate)</span>
                          <span className="font-mono text-[#EDE7DC]">14.2%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#0A0C0E] border border-[rgba(237,231,220,0.1)] overflow-hidden">
                          <div className="h-full bg-[#E8913C] rounded-full" style={{ width: '14.2%' }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-[#EDE7DC]">Male Cohort (High-Risk Identification Rate)</span>
                          <span className="font-mono text-[#EDE7DC]">13.6%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#0A0C0E] border border-[rgba(237,231,220,0.1)] overflow-hidden">
                          <div className="h-full bg-[#2E6B72] rounded-full" style={{ width: '13.6%' }} />
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.1)] text-[11px] text-[#9EA5A8] space-y-1.5 font-mono">
                        <div className="flex justify-between">
                          <span>Disparate Impact Ratio:</span>
                          <strong className="text-[#EDE7DC]">14.2% / 13.6% = 1.04 DIR</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Mandated Range:</span>
                          <span>0.80 DIR to 1.25 DIR</span>
                        </div>
                        <div className="text-[#2E6B72] font-semibold pt-1">
                          Status: PASSED • Zero adverse impact detected against protected groups.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-3xl bg-[#101317] border border-[rgba(237,231,220,0.13)] shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[rgba(237,231,220,0.13)]">
                      <div>
                        <h3 className="font-display font-extrabold text-lg text-[#EDE7DC]">DPDP DPO Access Audit Trail</h3>
                        <p className="text-xs text-[#9EA5A8]">Immutable ledger of employee data access and dynamic masking level.</p>
                      </div>
                      <span className="text-[10px] font-mono text-[#6C7378]">Section 6 DPDP</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      {accessLogs.map(log => (
                        <div key={log.id} className="p-3 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.1)] flex justify-between items-center">
                          <div>
                            <div className="font-bold text-[#EDE7DC] flex items-center gap-1.5">
                              <span>{log.user}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border border-[rgba(237,231,220,0.15)] text-[#9EA5A8]">{log.role}</span>
                            </div>
                            <div className="text-[11px] text-[#9EA5A8] mt-0.5">
                              {log.action} • GlobalID #{log.target} ({log.exposed})
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-[#6C7378]">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 9: EMPLOYEE SELF-SERVICE PORTAL */}
              {activeTab === 'self-service' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-6 p-6 rounded-3xl bg-[#101317] border border-[rgba(237,231,220,0.13)] shadow-sm space-y-5">
                    <div className="flex items-center gap-4 pb-4 border-b border-[rgba(237,231,220,0.13)]">
                      <div className="size-14 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.18)] text-[#EDE7DC] font-display font-black text-xl flex items-center justify-center">
                        VR
                      </div>
                      <div>
                        <h2 className="font-display font-black text-xl text-[#EDE7DC]">Vikramaditya Rao</h2>
                        <div className="text-xs text-[#9EA5A8]">Principal AI Systems Scientist • AI Research</div>
                        <div className="text-[11px] font-mono text-[#6C7378] mt-0.5">GlobalID #3757101776 • Tenure: 3.1 Years</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="p-3 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.1)]">
                        <div className="text-[10px] font-mono uppercase text-[#6C7378]">Privilege Leave</div>
                        <div className="text-lg font-black text-[#EDE7DC] mt-1 tabular-nums">14 Days</div>
                        <div className="text-[10px] text-[#9EA5A8]">Remaining</div>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.1)]">
                        <div className="text-[10px] font-mono uppercase text-[#6C7378]">Sick Leave</div>
                        <div className="text-lg font-black text-[#2E6B72] mt-1 tabular-nums">8 Days</div>
                        <div className="text-[10px] text-[#9EA5A8]">Remaining</div>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.1)]">
                        <div className="text-[10px] font-mono uppercase text-[#6C7378]">Casual Leave</div>
                        <div className="text-lg font-black text-[#E8913C] mt-1 tabular-nums">4 Days</div>
                        <div className="text-[10px] text-[#9EA5A8]">Remaining</div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-[rgba(237,231,220,0.08)]">
                        <span className="text-[#9EA5A8]">Current Band</span>
                        <span className="font-semibold text-[#EDE7DC]">IC-6 Principal Staff</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[rgba(237,231,220,0.08)]">
                        <span className="text-[#9EA5A8]">Reporting Manager</span>
                        <span className="font-semibold text-[#EDE7DC]">Kavita Desai (Eng Director)</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setApplyLeaveModal(true)}
                      className="w-full py-3 rounded-full bg-[#EDE7DC] text-[#0A0C0E] hover:text-[#E8913C] hover:bg-transparent border border-[#EDE7DC] hover:border-[#E8913C] font-mono text-[11px] font-bold tracking-wider uppercase transition"
                    >
                      Apply for Time Off
                    </button>
                  </div>

                  <div className="lg:col-span-6 p-6 rounded-3xl bg-[#101317] border border-[rgba(237,231,220,0.13)] shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-[rgba(237,231,220,0.13)]">
                      <div>
                        <h3 className="font-display font-extrabold text-lg text-[#EDE7DC]">Pulse Feedback & Well-Being</h3>
                        <p className="text-xs text-[#9EA5A8]">Anonymous feedback sent to People Ops to tune engagement.</p>
                      </div>
                      <span className="text-[10px] font-mono text-[#2E6B72] font-bold">100% Confidential</span>
                    </div>

                    <div className="space-y-4 text-xs">
                      <div>
                        <label className="font-bold text-[#EDE7DC] block mb-1">Work-Life Balance Rating (1 to 5)</label>
                        <input type="range" min="1" max="5" defaultValue="3" className="w-full accent-[#E8913C] cursor-pointer" />
                      </div>

                      <div>
                        <label className="font-bold text-[#EDE7DC] block mb-1">Sprint Burnout & Workload (1 to 5)</label>
                        <input type="range" min="1" max="5" defaultValue="4" className="w-full accent-[#E8913C] cursor-pointer" />
                      </div>

                      <button
                        type="button"
                        onClick={() => showToast('Thank you! Pulse feedback recorded anonymously.')}
                        className="w-full py-2.5 rounded-full border border-[rgba(237,231,220,0.2)] hover:border-[#E8913C] text-[#EDE7DC] hover:text-[#E8913C] font-mono font-bold text-xs uppercase tracking-wider transition"
                      >
                        Submit Confidential Pulse
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 10: PAYROLL & COMPENSATION */}
              {activeTab === 'payroll' && (
                <div className="space-y-6">
                  <div className="rounded-3xl bg-[#101317] border border-[rgba(237,231,220,0.13)] overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-[rgba(237,231,220,0.13)] flex justify-between items-center">
                      <h3 className="font-mono text-[10.5px] uppercase font-bold tracking-[0.14em] text-[#EDE7DC]">
                        Compensation Equity & Statutory Banking Register
                      </h3>
                      <span className="text-xs font-mono text-[#9EA5A8]">
                        {isAuditor ? 'Financials Redacted under DPDP' : 'Live CTC Register'}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#0A0C0E] text-[#9EA5A8] font-mono text-[10.5px] uppercase tracking-wider border-b border-[rgba(237,231,220,0.13)]">
                          <tr>
                            <th className="py-3 px-4">Employee</th>
                            <th className="py-3 px-4">Department</th>
                            <th className="py-3 px-4">Annual Base CTC</th>
                            <th className="py-3 px-4">Performance Bonus</th>
                            <th className="py-3 px-4">Disbursement Bank</th>
                            <th className="py-3 px-4">Account Masking</th>
                            <th className="py-3 px-4">Tax Regime</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(237,231,220,0.08)]">
                          {payrollList.map(p => (
                            <tr key={p.id} className="hover:bg-[#0A0C0E]/50 transition">
                              <td className="py-3 px-4 font-bold text-[#EDE7DC] font-display">
                                {isAuditor ? 'E*** ' + String(p.id).substring(0, 3) : p.name}
                              </td>
                              <td className="py-3 px-4 text-[#9EA5A8]">{p.dept}</td>
                              <td className="py-3 px-4 font-mono font-bold text-[#EDE7DC] tabular-nums">
                                {isAuditor ? '•••• ••••' : `₹${(p.base / 100000).toFixed(2)} Lakhs`}
                              </td>
                              <td className="py-3 px-4 font-mono text-[#2E6B72] font-bold tabular-nums">
                                {isAuditor ? '••%' : `+${p.bonus}%`}
                              </td>
                              <td className="py-3 px-4 text-[#9EA5A8]">
                                {isAuditor ? 'REDACTED' : p.bank}
                              </td>
                              <td className="py-3 px-4 font-mono text-[#6C7378]">{p.acc}</td>
                              <td className="py-3 px-4 text-[#9EA5A8]">{p.tax}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 11: SENTIMENT & ENGAGEMENT */}
              {activeTab === 'sentiment' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {sentimentPulse.map(s => (
                      <div key={s.dept} className="p-5 rounded-3xl bg-[#101317] border border-[rgba(237,231,220,0.13)] shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-display font-bold text-sm text-[#EDE7DC]">{s.dept}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                            s.stress_flag === 'Elevated'
                              ? 'border-[#E8913C]/40 text-[#E8913C]'
                              : 'border-[#2E6B72]/40 text-[#2E6B72]'
                          }`}>
                            {s.stress_flag} Stress
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-[#9EA5A8]">Engagement</span>
                            <span className="font-mono font-bold text-[#EDE7DC] tabular-nums">{s.engagement} / 5.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#9EA5A8]">Job Satisfaction</span>
                            <span className="font-mono font-bold text-[#EDE7DC] tabular-nums">{s.satisfaction} / 5.0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#9EA5A8]">Work-Life Balance</span>
                            <span className={`font-mono font-bold tabular-nums ${s.wlb < 3.0 ? 'text-[#E8913C]' : 'text-[#2E6B72]'}`}>
                              {s.wlb} / 5.0
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-[rgba(237,231,220,0.08)] text-[11px] text-[#6C7378] font-mono tabular-nums">
                          Headcount: {s.headcount} Team Members
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 12: EXECUTIVE BOARDROOM REPORTS */}
              {activeTab === 'reports' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="p-8 rounded-3xl bg-[#101317] border border-[rgba(237,231,220,0.13)] shadow-xl space-y-6 print:m-0 print:border-none print:shadow-none">
                    <div className="flex justify-between items-start pb-6 border-b border-[rgba(237,231,220,0.13)]">
                      <div>
                        <div className="text-[10.5px] font-mono font-bold text-[#E8913C] uppercase tracking-widest">
                          Confidential Executive Briefing
                        </div>
                        <h2 className="font-display text-2xl font-black mt-1 text-[#EDE7DC]">
                          Q4 Strategic Workforce & Retention Capital Assessment
                        </h2>
                        <p className="text-xs text-[#9EA5A8] mt-1">Prepared by People Operations for the Board of Directors & Chief Financial Officer</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2 rounded-full border border-[rgba(237,231,220,0.2)] hover:border-[#E8913C] text-[#EDE7DC] hover:text-[#E8913C] font-mono text-[11px] font-bold tracking-wider uppercase transition flex items-center gap-1.5"
                      >
                        <FileText className="size-3.5" />
                        <span>Print / Save PDF</span>
                      </button>
                    </div>

                    <div className="space-y-4 text-xs text-[#9EA5A8] leading-relaxed font-body">
                      <div>
                        <h4 className="font-display font-extrabold text-sm text-[#EDE7DC] mb-1">1. Executive Macro Exposure</h4>
                        <p>
                          The machine learning attrition early-warning model evaluated <strong>1,470 employees</strong>. Currently, <strong>42 Tier-3 mission-critical personnel</strong> are in the imminent flight risk zone (&gt;80% probability). The aggregate replacement capital exposure is modeled at <strong>₹8.42 Crores</strong> (benchmarked at 1.5x Annual CTC).
                        </p>
                      </div>

                      <div>
                        <h4 className="font-display font-extrabold text-sm text-[#EDE7DC] mb-1">2. Targeted Retention ROI Multiple</h4>
                        <p>
                          Executing structured retention packages (average +15% salary realignment, 15h monthly overtime mitigation, and flexible hybrid scheduling) yields an estimated <strong>₹6.15 Crores</strong> in turnover avoidance against an intervention investment of <strong>₹1.28 Crores</strong>. This translates to an enterprise ROI multiple of <strong>4.8x</strong>.
                        </p>
                      </div>

                      <div>
                        <h4 className="font-display font-extrabold text-sm text-[#EDE7DC] mb-1">3. DPDP Act 2023 & Algorithmic Fairness Status</h4>
                        <p>
                          Independent auditing under the Four-Fifths rule confirmed a Disparate Impact Ratio of <strong>1.04 DIR</strong> between protected cohorts, fully compliant with Indian Digital Personal Data Protection Act statutory norms.
                        </p>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[rgba(237,231,220,0.13)] flex justify-between items-center text-xs text-[#6C7378] font-mono">
                      <span>Authorized by CHRO & Chief Data Protection Officer</span>
                      <span>NeMo HR Enterprise Architecture</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* MODAL: CFO RETENTION AUTHORIZATION MEMO */}
      {memoOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101317] border border-[rgba(237,231,220,0.2)] rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(237,231,220,0.13)]">
              <h3 className="font-display font-bold text-sm text-[#EDE7DC] flex items-center gap-2">
                <FileText className="size-4 text-[#E8913C]" /> CFO Retention Authorization Memo
              </h3>
              <button type="button" onClick={() => setMemoOpen(false)} className="text-[#9EA5A8] hover:text-[#EDE7DC] text-sm font-bold">✕</button>
            </div>

            <div className="mt-4 p-4 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.1)] font-mono text-[11px] leading-relaxed text-[#9EA5A8] space-y-1">
              <p><strong>TO:</strong> Office of the Chief Financial Officer (CFO)</p>
              <p><strong>FROM:</strong> People Operations & Workforce Intelligence</p>
              <p><strong>SUBJECT:</strong> Retention Business Case: {selectedEmp.name} ({selectedEmp.job_role})</p>
              <hr className="my-2 border-[rgba(237,231,220,0.13)]" />
              <p><strong>Baseline Flight Risk:</strong> {baseProb.toFixed(1)}% (Tier 3 Critical)</p>
              <p><strong>Estimated Turnover Loss:</strong> ₹{replacementCost.toLocaleString('en-IN')}</p>
              <p><strong>Proposed Package:</strong> +{salaryHike}% Hike (₹{incAmount.toLocaleString('en-IN')}/mo) + -{overtimeReduction}h OT</p>
              <p><strong>Simulated Post-Offer Risk:</strong> {simulatedProb}%</p>
              <p><strong>Annual Package Cost:</strong> ₹{annualInterventionCost.toLocaleString('en-IN')}</p>
              <p><strong>Net Enterprise Financial Gain:</strong> ₹{netFinancialGain.toLocaleString('en-IN')}</p>
              <p><strong>Expected ROI Multiple:</strong> {roiMultiple}x</p>
              <p className="mt-2 text-[#2E6B72] font-bold">RECOMMENDATION: EXECUTE PURCHASE ORDER & RETAIN</p>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setMemoOpen(false);
                  showToast('Memo dispatched to CFO via Slack/Teams webhook!');
                }}
                className="flex-1 py-2.5 rounded-full bg-[#EDE7DC] text-[#0A0C0E] hover:text-[#E8913C] hover:bg-transparent border border-[#EDE7DC] hover:border-[#E8913C] font-mono text-[11px] font-bold tracking-wider uppercase transition"
              >
                Dispatch to CFO & HRBP
              </button>
              <button
                type="button"
                onClick={() => setMemoOpen(false)}
                className="px-4 py-2.5 rounded-full border border-[rgba(237,231,220,0.15)] text-[11px] font-mono font-semibold text-[#9EA5A8] hover:text-[#EDE7DC]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPLY FOR TIME OFF */}
      {applyLeaveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101317] border border-[rgba(237,231,220,0.2)] rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(237,231,220,0.13)]">
              <h3 className="font-display font-bold text-sm text-[#EDE7DC] flex items-center gap-2">
                <Calendar className="size-4 text-[#E8913C]" /> Apply for Time Off
              </h3>
              <button type="button" onClick={() => setApplyLeaveModal(false)} className="text-[#9EA5A8] hover:text-[#EDE7DC] text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handleApplyLeave} className="mt-4 space-y-4 text-xs font-body">
              <div>
                <label className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#9EA5A8] block mb-1">Leave Category</label>
                <select
                  value={newLeaveType}
                  onChange={(e) => setNewLeaveType(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.15)] text-[#EDE7DC] focus:outline-none"
                >
                  <option value="Privilege Leave">Privilege Leave (Vacation)</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick / Medical Leave</option>
                  <option value="Paternity/Maternity">Paternity / Maternity Leave</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#9EA5A8] block mb-1">Number of Days</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newLeaveDays}
                  onChange={(e) => setNewLeaveDays(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.15)] text-[#EDE7DC] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#EDE7DC] text-[#0A0C0E] hover:text-[#E8913C] hover:bg-transparent border border-[#EDE7DC] hover:border-[#E8913C] font-mono text-[11px] font-bold tracking-wider uppercase transition"
                >
                  Submit Application
                </button>
                <button
                  type="button"
                  onClick={() => setApplyLeaveModal(false)}
                  className="px-4 py-2.5 rounded-full border border-[rgba(237,231,220,0.15)] text-[#9EA5A8] hover:text-[#EDE7DC] font-mono text-[11px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#101317] border border-[#E8913C] text-[#EDE7DC] text-xs font-mono font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="text-[#E8913C]">⚡</span>
          <span>{toast}</span>
        </div>
      )}

    </div>
  );
}
