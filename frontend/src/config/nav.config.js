import {
  Activity,
  Users,
  Box,
  DollarSign,
  Calendar,
  Sliders,
  FileText,
  ShieldCheck,
  BarChart3,
  Lock,
  Layers,
  HeartHandshake
} from 'lucide-react';

export const NAV_ITEMS = [
  // --- HR ADMIN / CHRO ROUTES ---
  {
    id: 'admin-attrition',
    label: 'Attrition War Room',
    path: '/admin/attrition/risk',
    roles: ['HR_ADMIN', 'ADMIN'],
    icon: Activity,
    badge: '14 High Risk',
    badgeVariant: 'danger',
    group: 'Executive Oversight'
  },
  {
    id: 'admin-ats',
    label: 'Talent Acquisition (ATS)',
    path: '/admin/ats/candidates',
    roles: ['HR_ADMIN', 'ADMIN'],
    icon: Users,
    group: 'Executive Oversight'
  },
  {
    id: 'admin-hcm',
    label: 'Succession Bench (HCM)',
    path: '/admin/hcm/succession',
    roles: ['HR_ADMIN', 'ADMIN'],
    icon: Layers,
    group: 'Executive Oversight'
  },
  {
    id: 'admin-payroll',
    label: 'Payroll Register',
    path: '/admin/payroll',
    roles: ['HR_ADMIN', 'ADMIN'],
    icon: DollarSign,
    group: 'Executive Oversight'
  },

  // --- MANAGER ROUTES ---
  {
    id: 'manager-calibration',
    label: 'Team Talent Calibration',
    path: '/manager/calibration',
    roles: ['MANAGER'],
    icon: Box,
    group: 'Engineering Management'
  },
  {
    id: 'manager-approvals',
    label: 'Leave Approvals',
    path: '/manager/approvals',
    roles: ['MANAGER'],
    icon: Calendar,
    badge: '3 Pending',
    badgeVariant: 'warning',
    group: 'Engineering Management'
  },
  {
    id: 'manager-retention',
    label: 'Retention Simulator',
    path: '/manager/retention',
    roles: ['MANAGER'],
    icon: Sliders,
    group: 'Engineering Management'
  },

  // --- EMPLOYEE SELF-SERVICE ---
  {
    id: 'employee-workstation',
    label: 'My Leaves & Balance',
    path: '/employee/workstation',
    roles: ['EMPLOYEE'],
    icon: Calendar,
    group: 'Self-Service'
  },
  {
    id: 'employee-compensation',
    label: 'Payslips & Benefits',
    path: '/employee/compensation',
    roles: ['EMPLOYEE'],
    icon: FileText,
    group: 'Self-Service'
  },
  {
    id: 'employee-wellbeing',
    label: 'Pulse & DPDP Consent',
    path: '/employee/wellbeing',
    roles: ['EMPLOYEE'],
    icon: HeartHandshake,
    group: 'Self-Service'
  },

  // --- AUDITOR / DPO COMPLIANCE ---
  {
    id: 'auditor-logs',
    label: 'DPDP Audit Ledger',
    path: '/auditor/logs',
    roles: ['AUDITOR'],
    icon: ShieldCheck,
    badge: 'SHA-256',
    badgeVariant: 'success',
    group: 'Statutory Compliance'
  },
  {
    id: 'auditor-bias',
    label: 'EEOC Algorithmic Bias',
    path: '/auditor/bias',
    roles: ['AUDITOR'],
    icon: BarChart3,
    group: 'Statutory Compliance'
  },
  {
    id: 'auditor-retention',
    label: 'Data Retention & Erasure',
    path: '/auditor/retention',
    roles: ['AUDITOR'],
    icon: Lock,
    group: 'Statutory Compliance'
  }
];

export const DEMO_PERSONAS = [
  {
    id: 'admin',
    username: 'admin',
    name: 'Priya Sharma',
    role: 'HR_ADMIN',
    title: 'Chief Human Resources Officer (CHRO)',
    avatar: 'PS',
    badge: '👑 HR Admin',
    defaultRoute: '/admin/attrition/risk'
  },
  {
    id: 'manager',
    username: 'manager',
    name: 'Kavita Desai',
    role: 'MANAGER',
    title: 'Director of Engineering & Platform',
    avatar: 'KD',
    badge: '👔 Manager',
    defaultRoute: '/manager/calibration'
  },
  {
    id: 'employee',
    username: 'employee',
    name: 'Vikramaditya Rao',
    role: 'EMPLOYEE',
    title: 'Principal AI Systems Scientist',
    avatar: 'VR',
    badge: '👤 Employee',
    defaultRoute: '/employee/workstation'
  },
  {
    id: 'auditor',
    username: 'auditor',
    name: 'Adv. Rajiv Nair',
    role: 'AUDITOR',
    title: 'DPDP Compliance Officer (DPO)',
    avatar: 'RN',
    badge: '🔒 Auditor',
    defaultRoute: '/auditor/logs'
  }
];

export default NAV_ITEMS;
