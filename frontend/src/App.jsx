import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './components/primitives/Toast';
import AppShell from './components/layout/AppShell';
import RequireRole from './components/auth/RequireRole';
import { DEMO_PERSONAS } from './config/nav.config';
import { Button, RiskBadge } from './components/primitives';
import { ArrowUpRight, DollarSign, Clock, ShieldAlert } from 'lucide-react';

// Page components
import AttritionWarRoomPage from './pages/admin/AttritionWarRoomPage';
import AtsHiringPage from './pages/admin/AtsHiringPage';
import HcmSuccessionPage from './pages/admin/HcmSuccessionPage';
import PayrollPage from './pages/admin/PayrollPage';

import TeamCalibrationPage from './pages/manager/TeamCalibrationPage';
import LeaveApprovalsPage from './pages/manager/LeaveApprovalsPage';
import RetentionSimulatorPage from './pages/manager/RetentionSimulatorPage';

import EmployeeWorkstationPage from './pages/employee/EmployeeWorkstationPage';
import EmployeeCompensationPage from './pages/employee/EmployeeCompensationPage';
import EmployeeWellbeingPage from './pages/employee/EmployeeWellbeingPage';

import AuditLedgerPage from './pages/auditor/AuditLedgerPage';
import AlgorithmicBiasPage from './pages/auditor/AlgorithmicBiasPage';
import DataRetentionPage from './pages/auditor/DataRetentionPage';

// INITIAL WORKFORCE ROSTER FOR SPATIAL 3D PRISM & TABLES
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

function AppContent() {
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);

  // Theme state: defaults to 'executive-light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('enterprise_theme') || 'executive-light';
  });

  // Current persona state: defaults to Priya Sharma (CHRO)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const u = localStorage.getItem('nemo_user');
      return u ? JSON.parse(u) : DEMO_PERSONAS[0];
    } catch {
      return DEMO_PERSONAS[0];
    }
  });

  // Detail Drawer state
  const [drawerEmployee, setDrawerEmployee] = useState(null);

  const navigate = useNavigate();

  // Sync theme with document attribute & local storage
  useEffect(() => {
    localStorage.setItem('enterprise_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'executive-light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  // Persona switch handler
  const handleSwitchPersona = (persona) => {
    setCurrentUser(persona);
    localStorage.setItem('nemo_user', JSON.stringify(persona));
  };

  const userRole = (currentUser.role || 'HR_ADMIN').toUpperCase().replace('ROLE_', '');

  // Default redirect route per role
  const getDefaultRoute = () => {
    if (userRole === 'MANAGER') return '/manager/calibration';
    if (userRole === 'EMPLOYEE') return '/employee/workstation';
    if (userRole === 'AUDITOR') return '/auditor/logs';
    return '/admin/attrition/risk';
  };

  // Build detail drawer props if an employee is selected
  const detailDrawerProps = drawerEmployee
    ? {
        isOpen: Boolean(drawerEmployee),
        onClose: () => setDrawerEmployee(null),
        title: drawerEmployee.name,
        subtitle: `${drawerEmployee.job_role} • ${drawerEmployee.department} (${drawerEmployee.pseudo_id})`,
        content: (
          <div className="space-y-5 text-xs font-mono">
            {/* Risk Banner */}
            <div className="p-3.5 rounded-enterprise bg-muted border border-border-subtle flex items-center justify-between">
              <div>
                <div className="text-[10px] text-text-muted uppercase">Calculated Flight Risk</div>
                <div className="text-xl font-bold text-text-primary mt-0.5">
                  {(drawerEmployee.attrition_probability * 100).toFixed(1)}%
                </div>
              </div>
              <RiskBadge
                status={drawerEmployee.attrition_probability >= 0.75 ? 'HIGH' : 'LOW'}
                size="md"
              />
            </div>

            {/* 3D Coordinate Scores */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-enterprise bg-muted border border-border-subtle">
                <div className="text-[10px] text-text-muted uppercase">Performance (X)</div>
                <div className="text-base font-bold text-text-primary mt-1">
                  {drawerEmployee.perf || 4.2} / 5.0
                </div>
              </div>
              <div className="p-3 rounded-enterprise bg-muted border border-border-subtle">
                <div className="text-[10px] text-text-muted uppercase">Potential (Y)</div>
                <div className="text-base font-bold text-text-primary mt-1">
                  {drawerEmployee.pot || 4.5} / 5.0
                </div>
              </div>
            </div>

            {/* Compensation & Overtime */}
            <div className="p-3.5 rounded-enterprise bg-muted border border-border-subtle space-y-2">
              <div className="flex justify-between">
                <span className="text-text-muted">Compensation Band:</span>
                <span className="text-text-primary font-semibold">{drawerEmployee.salary_band}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Monthly Overtime:</span>
                <span className="text-status-danger font-semibold">{drawerEmployee.overtime_hours} hrs/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Estimated Departure Loss:</span>
                <span className="text-status-danger font-bold">
                  ₹{(((drawerEmployee.monthly_salary * 18) / 100000)).toFixed(1)} Lakhs
                </span>
              </div>
            </div>

            {/* Primary Driver */}
            <div className="p-3 rounded-enterprise bg-muted border border-border-subtle">
              <span className="text-text-muted text-[10.5px] uppercase">Identified Attrition Driver:</span>
              <p className="mt-1 text-text-primary font-sans italic text-xs leading-relaxed">
                "{drawerEmployee.reason}"
              </p>
            </div>
          </div>
        ),
        footer: (
          <div className="flex items-center gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setDrawerEmployee(null)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              rightIcon={ArrowUpRight}
              onClick={() => {
                setDrawerEmployee(null);
                navigate('/manager/retention');
              }}
            >
              Simulate Retention
            </Button>
          </div>
        )
      }
    : null;

  return (
    <AppShell
      currentUser={currentUser}
      currentRole={userRole}
      theme={theme}
      onSelectTheme={setTheme}
      onSwitchPersona={handleSwitchPersona}
      detailDrawerProps={detailDrawerProps}
    >
      <Routes>
        {/* Root redirect to role default */}
        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

        {/* --- ADMIN ROUTES --- */}
        <Route
          path="/admin/attrition/risk"
          element={
            <RequireRole userRole={userRole} allowedRoles={['HR_ADMIN', 'ADMIN']} defaultRoute={getDefaultRoute()}>
              <AttritionWarRoomPage employees={employees} onSelectEmployee={setDrawerEmployee} />
            </RequireRole>
          }
        />
        <Route
          path="/admin/ats/candidates"
          element={
            <RequireRole userRole={userRole} allowedRoles={['HR_ADMIN', 'ADMIN']} defaultRoute={getDefaultRoute()}>
              <AtsHiringPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/hcm/succession"
          element={
            <RequireRole userRole={userRole} allowedRoles={['HR_ADMIN', 'ADMIN']} defaultRoute={getDefaultRoute()}>
              <HcmSuccessionPage />
            </RequireRole>
          }
        />
        <Route
          path="/admin/payroll"
          element={
            <RequireRole userRole={userRole} allowedRoles={['HR_ADMIN', 'ADMIN']} defaultRoute={getDefaultRoute()}>
              <PayrollPage />
            </RequireRole>
          }
        />

        {/* --- MANAGER ROUTES --- */}
        <Route
          path="/manager/calibration"
          element={
            <RequireRole userRole={userRole} allowedRoles={['MANAGER']} defaultRoute={getDefaultRoute()}>
              <TeamCalibrationPage employees={employees} onSelectEmployee={setDrawerEmployee} />
            </RequireRole>
          }
        />
        <Route
          path="/manager/approvals"
          element={
            <RequireRole userRole={userRole} allowedRoles={['MANAGER']} defaultRoute={getDefaultRoute()}>
              <LeaveApprovalsPage />
            </RequireRole>
          }
        />
        <Route
          path="/manager/retention"
          element={
            <RequireRole userRole={userRole} allowedRoles={['MANAGER']} defaultRoute={getDefaultRoute()}>
              <RetentionSimulatorPage employees={employees} />
            </RequireRole>
          }
        />

        {/* --- EMPLOYEE ROUTES --- */}
        <Route
          path="/employee/workstation"
          element={
            <RequireRole userRole={userRole} allowedRoles={['EMPLOYEE']} defaultRoute={getDefaultRoute()}>
              <EmployeeWorkstationPage currentUser={currentUser} />
            </RequireRole>
          }
        />
        <Route
          path="/employee/compensation"
          element={
            <RequireRole userRole={userRole} allowedRoles={['EMPLOYEE']} defaultRoute={getDefaultRoute()}>
              <EmployeeCompensationPage currentUser={currentUser} />
            </RequireRole>
          }
        />
        <Route
          path="/employee/wellbeing"
          element={
            <RequireRole userRole={userRole} allowedRoles={['EMPLOYEE']} defaultRoute={getDefaultRoute()}>
              <EmployeeWellbeingPage currentUser={currentUser} />
            </RequireRole>
          }
        />

        {/* --- AUDITOR ROUTES --- */}
        <Route
          path="/auditor/logs"
          element={
            <RequireRole userRole={userRole} allowedRoles={['AUDITOR']} defaultRoute={getDefaultRoute()}>
              <AuditLedgerPage />
            </RequireRole>
          }
        />
        <Route
          path="/auditor/bias"
          element={
            <RequireRole userRole={userRole} allowedRoles={['AUDITOR']} defaultRoute={getDefaultRoute()}>
              <AlgorithmicBiasPage />
            </RequireRole>
          }
        />
        <Route
          path="/auditor/retention"
          element={
            <RequireRole userRole={userRole} allowedRoles={['AUDITOR']} defaultRoute={getDefaultRoute()}>
              <DataRetentionPage />
            </RequireRole>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
}
