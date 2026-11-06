import React, { useState } from 'react';
import {
  Box,
  ShieldAlert,
  Users,
  DollarSign,
  Activity,
  Award,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Sliders,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Talent3DCube from '../Talent3DCube';
import { downloadFile } from '../../utils/exportHelpers';

export default function AdminCommandCenter({
  employees = [],
  candidates = [],
  theme = 'slate',
  onHireCandidate,
  onRejectCandidate,
  onRunPayroll
}) {
  const [activeSubView, setActiveSubView] = useState('prism'); // prism, ats, hcm, payroll
  const [candidateActionMessage, setCandidateActionMessage] = useState(null);
  const [payrollProcessed, setPayrollProcessed] = useState(false);
  const [boardMemoDownloaded, setBoardMemoDownloaded] = useState(false);

  // Sample candidates if none provided
  const candidateList = candidates.length > 0 ? candidates : [
    { id: 1, name: 'Dr. Siddharth Sen', role: 'Staff ML Infrastructure Engineer', stage: 'Technical Interview', score: 94, experience: '8 yrs', expected_salary: '₹45,00,000' },
    { id: 2, name: 'Meera Nambiar', role: 'Senior Product Designer', stage: 'Offered', score: 89, experience: '6 yrs', expected_salary: '₹32,00,000' },
    { id: 3, name: 'Tanmay Joshi', role: 'DevOps / Kubernetes Architect', stage: 'Screening', score: 82, experience: '5 yrs', expected_salary: '₹28,00,000' }
  ];

  const handleHire = (cand) => {
    setCandidateActionMessage(`Offer letter issued and onboarded: ${cand.name}`);
    if (onHireCandidate) onHireCandidate(cand.id);
    setTimeout(() => setCandidateActionMessage(null), 3500);
  };

  const handleReject = (cand) => {
    setCandidateActionMessage(`Application archived: ${cand.name}`);
    if (onRejectCandidate) onRejectCandidate(cand.id);
    setTimeout(() => setCandidateActionMessage(null), 3500);
  };

  const handleDownloadBoardMemo = () => {
    const memo = `================================================================================
CONFIDENTIAL BOARDROOM BRIEFING MEMORANDUM
TO: BOARD OF DIRECTORS & CHIEF FINANCIAL OFFICER
FROM: PRIYA SHARMA (CHIEF HUMAN RESOURCES OFFICER)
DATE: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
SUBJECT: WORKFORCE TALENT PRESERVATION & ATTRITION RISK MITIGATION
================================================================================

1. EXECUTIVE SUMMARY & WORKFORCE TELEMETRY
--------------------------------------------------------------------------------
Total Enterprise Headcount  : 1,420 Active Employees
Critical Flight Danger      : 14 High-Impact Talents (>75% probability)
Gross Monthly Payroll Outflow: ₹14,82,40,000 (November 2026 Run)
Statutory EPF & ESI Synced  : ₹1,77,88,800
Annual Attrition Risk Value : ₹9,80,00,000

2. PREDICTIVE RETENTION ROI & CAPITAL SAVINGS
--------------------------------------------------------------------------------
Identified High-Risk Talents: 14 Principal Engineers & Product Architects
Calculated Cost of Departure: ₹2,46,00,000 (Recruitment + Lost Ship Velocity)
Targeted Intervention Cost  : ₹62,00,000 (Market parity + Overtime caps)
NET PROJECTED CAPITAL SAVINGS: ₹1,84,00,000 (1.84 Crores Rupee Preservation)
PAYBACK PERIOD ON HR AI     : 38 Days post-deployment

3. STATUTORY COMPLIANCE & LEGAL CERTIFICATION
--------------------------------------------------------------------------------
DPDP Act 2023 Sec 8(1)      : 100% Certified & Shielded
EEOC Algorithmic Bias Score : 0.88 (Compliant with US/Indian Four-Fifths Rules)
Data Protection Officer     : Adv. Rajiv Nair (Formal Certification Signed)

================================================================================
End of Boardroom Briefing • Enterprise HR AI Platform • Confidential
================================================================================`;

    downloadFile(`Boardroom_Executive_Briefing_Memo_${new Date().toISOString().split('T')[0]}.txt`, memo, 'text/plain');
    setBoardMemoDownloaded(true);
    setTimeout(() => setBoardMemoDownloaded(false), 3000);
  };

  return (
    <div className="space-y-8 font-body text-text-primary">
      {/* STATS LEDGER */}
      <div className="bg-card border border-border-subtle rounded-xl py-5 px-6 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border-subtle shadow-md">
        <div className="py-2 md:py-0 md:px-5 first:pl-0">
          <div className="font-display text-[30px] font-bold text-text-primary leading-tight">
            1,420 <span className="text-sm font-mono text-emerald-500">Global</span>
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-text-secondary mt-1">
            Total Headcount
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-rose-500 leading-tight flex items-center gap-2">
            14 <span className="text-xs font-mono text-rose-400 font-semibold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">Flagged</span>
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-text-secondary mt-1">
            Critical Flight Risks (&gt;75%)
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-emerald-500 leading-tight">
            ₹1.84 Cr
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-text-secondary mt-1">
            Projected Net Savings
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-sky-500 leading-tight">
            ₹14.8 Cr
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-text-secondary mt-1">
            Monthly Payroll Run
          </div>
        </div>
      </div>

      {/* SUBVIEW SELECTOR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border-subtle pb-3 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'prism', label: '3D Talent Prism & Flight War Room', icon: Box },
            { id: 'ats', label: 'Recruitment ATS Pipeline', icon: Users },
            { id: 'hcm', label: 'Workforce Succession Bench', icon: Activity },
            { id: 'payroll', label: 'Enterprise Payroll Engine', icon: DollarSign }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubView(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono transition min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  active
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                    : 'bg-card border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-card-hover'
                }`}
              >
                <Icon className={`size-3.5 ${active ? 'text-slate-950' : 'text-text-secondary'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleDownloadBoardMemo}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 rounded-lg text-xs font-mono font-bold transition min-h-[44px]"
        >
          <Download className="size-3.5" />
          <span>{boardMemoDownloaded ? 'Board Memo Downloaded (.TXT)' : 'Export Board Memo (.TXT)'}</span>
        </button>
      </div>

      {/* VIEW 1: 3D TALENT PRISM & WAR ROOM */}
      {activeSubView === 'prism' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-bold text-text-primary">
                Enterprise 3D Talent & Risk Prism
              </h3>
              <p className="text-xs text-text-secondary font-mono mt-0.5">
                Volumetric spatial coordinate engine: Performance (X), Growth Potential (Y), Attrition Flight Risk (Z)
              </p>
            </div>
            <span className="text-xs font-mono text-rose-500 border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 rounded-lg font-semibold w-fit">
              Danger Plane: Z &gt; 75%
            </span>
          </div>

          <Talent3DCube
            employees={employees}
            onSelectEmployee={(emp) => {
              console.log(`Inspected employee: ${emp.name}`);
            }}
          />

          <div className="bg-card border border-border-subtle rounded-xl p-6 space-y-4 shadow-md">
            <h4 className="font-display font-bold text-text-primary text-base">Immediate High-Risk Flight Roster</h4>
            <div className="divide-y divide-border-subtle border border-border-subtle rounded-lg overflow-hidden bg-card-subtle">
              {employees.slice(0, 4).map((emp) => (
                <div key={emp.global_id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-card-hover transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-bold text-text-primary">{emp.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-card border border-border-subtle text-text-secondary font-semibold">
                        {emp.job_role}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted">{emp.department}</span>
                    </div>
                    <div className="text-xs font-mono text-text-secondary">
                      Salary: <span className="text-text-primary font-semibold">{emp.salary_band}</span> • Overtime: <span className="text-amber-500 font-semibold">{emp.overtime_hours}h</span> • Primary Driver: <span className="text-rose-400 font-semibold">{emp.reason}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-rose-500">{(emp.attrition_probability * 100).toFixed(1)}% Risk</div>
                      <div className="text-[10px] text-text-secondary">Perf {emp.perf} / Pot {emp.pot}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: RECRUITMENT ATS PIPELINE */}
      {activeSubView === 'ats' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-text-primary">Talent Acquisition Pipeline</h3>
              <p className="text-xs text-text-secondary font-mono mt-0.5">
                AI resume screening and hiring approval gate
              </p>
            </div>

            {candidateActionMessage && (
              <div className="p-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500 text-emerald-400 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-emerald-400" />
                <span>{candidateActionMessage}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {candidateList.map((cand) => (
              <div
                key={cand.id}
                className="bg-card border border-border-subtle rounded-xl p-5 space-y-4 hover:border-sky-500/40 transition shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display font-bold text-text-primary text-base">{cand.name}</h4>
                    <div className="text-xs font-mono text-text-secondary mt-0.5">{cand.role}</div>
                  </div>
                  <span className="text-[10.5px] font-mono px-2 py-0.5 rounded-lg border border-sky-500/40 bg-sky-500/10 text-sky-400 font-bold">
                    {cand.score}% Fit
                  </span>
                </div>

                <div className="p-3 bg-card-subtle border border-border-subtle rounded-lg space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Stage:</span>
                    <span className="text-text-primary font-semibold">{cand.stage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Experience:</span>
                    <span className="text-text-primary font-semibold">{cand.experience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Expected:</span>
                    <span className="text-emerald-500 font-bold">{cand.expected_salary}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleReject(cand)}
                    className="flex-1 py-2 border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 rounded-lg text-xs font-mono transition min-h-[44px]"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHire(cand)}
                    className="flex-1 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg text-xs font-mono font-bold uppercase transition min-h-[44px] shadow-sm shadow-sky-500/20"
                  >
                    Hire Candidate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: WORKFORCE HCM & SUCCESSION */}
      {activeSubView === 'hcm' && (
        <div className="space-y-6">
          <div className="bg-card border border-border-subtle rounded-xl p-6 space-y-5 shadow-md">
            <h3 className="font-display text-lg font-bold text-text-primary">Succession Bench & Critical Leadership Coverage</h3>
            <p className="text-xs text-text-secondary font-mono">
              Bench readiness pipelines for Director and Chief Architect seats
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {[
                { target: 'VP of AI Research', current: 'Open Search', successor: 'Vikramaditya Rao', readiness: '92% Ready', time: 'Immediate (0 mos)' },
                { target: 'Director of Engineering', current: 'Kavita Desai', successor: 'Christopher Benson', readiness: '84% Ready', time: '6 months' },
                { target: 'Lead Solutions Architect', current: 'Ananya Deshmukh', successor: 'Dr. Siddharth Sen (Pipeline)', readiness: '78% Ready', time: '12 months' }
              ].map((bench, idx) => (
                <div key={idx} className="p-4 bg-card-subtle border border-border-subtle rounded-lg space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-text-primary text-sm">{bench.target}</span>
                    <span className="text-emerald-500 border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold">
                      {bench.readiness}
                    </span>
                  </div>
                  <div className="space-y-1 text-text-secondary">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Primary Ready Successor:</span>
                      <span className="text-text-primary font-semibold">{bench.successor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Estimated Time to Ready:</span>
                      <span className="text-amber-500 font-semibold">{bench.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: ENTERPRISE PAYROLL */}
      {activeSubView === 'payroll' && (
        <div className="space-y-6">
          <div className="bg-card border border-border-subtle rounded-xl p-6 space-y-6 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-text-primary">Corporate Payroll Register</h3>
                <div className="text-xs font-mono text-text-secondary mt-0.5">
                  Monthly Disbursal Cycle • FY 2026-27 • Section 192 TDS Compliant
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPayrollProcessed(true);
                  if (onRunPayroll) onRunPayroll();
                }}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition min-h-[44px] shadow-md shadow-sky-500/20"
              >
                {payrollProcessed ? 'Batch Disbursed to Bank' : 'Run November Payroll'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-card-subtle border border-border-subtle rounded-lg space-y-1">
                <div className="text-[10px] font-mono text-text-muted uppercase">Total Salary Outflow</div>
                <div className="text-2xl font-display font-bold text-text-primary">₹14,82,40,000</div>
                <div className="text-[11px] font-mono text-text-secondary">1,420 Active Employees</div>
              </div>

              <div className="p-4 bg-card-subtle border border-border-subtle rounded-lg space-y-1">
                <div className="text-[10px] font-mono text-text-muted uppercase">Statutory EPF & ESI</div>
                <div className="text-2xl font-display font-bold text-emerald-500">₹1,77,88,800</div>
                <div className="text-[11px] font-mono text-text-secondary">EPFO Portal Sync Ready</div>
              </div>

              <div className="p-4 bg-card-subtle border border-border-subtle rounded-lg space-y-1">
                <div className="text-[10px] font-mono text-text-muted uppercase">Withheld Income Tax (TDS)</div>
                <div className="text-2xl font-display font-bold text-amber-500">₹2,96,48,000</div>
                <div className="text-[11px] font-mono text-text-secondary">Challan 281 Auto-filing</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
