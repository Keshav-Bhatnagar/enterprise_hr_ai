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

export default function AdminCommandCenter({
  employees = [],
  candidates = [],
  onHireCandidate,
  onRejectCandidate,
  onRunPayroll
}) {
  const [activeSubView, setActiveSubView] = useState('prism'); // prism, ats, hcm, payroll
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateActionMessage, setCandidateActionMessage] = useState(null);
  const [payrollProcessed, setPayrollProcessed] = useState(false);

  // Search in ATS
  const [atsSearch, setAtsSearch] = useState('');

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

  return (
    <div className="space-y-8 font-body text-[#EDE7DC]">
      {/* EDITORIAL STATS ROW - DECISIONLENS LEDGER STYLE */}
      <div className="bg-[#101317] border border-l-4 border-[rgba(237,231,220,0.13)] border-l-[#E8913C] rounded-sm py-5 px-6 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[rgba(237,231,220,0.13)] shadow-xs">
        <div className="py-2 md:py-0 md:px-5 first:pl-0">
          <div className="font-display text-[30px] font-bold text-[#EDE7DC] leading-tight">
            1,420 <span className="text-sm font-mono text-[#2E6B72]">Global</span>
          </div>
          <div className="text-[10.5px] font-mono font-bold uppercase tracking-[0.14em] text-[#9EA5A8] mt-1">
            Total Workforce Headcount
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-[#E8913C] leading-tight flex items-center gap-2">
            14 <span className="text-xs font-mono text-[#E8913C] font-semibold">Flagged</span>
          </div>
          <div className="text-[10.5px] font-mono font-bold uppercase tracking-[0.14em] text-[#9EA5A8] mt-1">
            Critical Flight Risks (&gt;75%)
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-[#2E6B72] leading-tight">
            ₹1.84 Cr
          </div>
          <div className="text-[10.5px] font-mono font-bold uppercase tracking-[0.14em] text-[#9EA5A8] mt-1">
            Projected Retention Savings
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-[#EDE7DC] leading-tight">
            ₹14.8 Cr
          </div>
          <div className="text-[10.5px] font-mono font-bold uppercase tracking-[0.14em] text-[#9EA5A8] mt-1">
            Monthly Payroll Run (Nov)
          </div>
        </div>
      </div>

      {/* SUBVIEW SELECTOR */}
      <div className="flex items-center gap-2 border-b border-[rgba(237,231,220,0.13)] pb-3">
        {[
          { id: 'prism', label: '3D Talent Prism & Retention War Room', icon: Box },
          { id: 'ats', label: 'Recruitment ATS Pipeline', icon: Users },
          { id: 'hcm', label: 'Workforce HCM & Succession Bench', icon: Activity },
          { id: 'payroll', label: 'Enterprise Payroll Engine', icon: DollarSign }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSubView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubView(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-sm text-xs font-mono transition ${
                active
                  ? 'bg-[#101317] border border-[#E8913C] text-[#EDE7DC] font-bold'
                  : 'text-[#9EA5A8] hover:text-[#EDE7DC] hover:bg-[#101317]/60'
              }`}
            >
              <Icon className={`size-3.5 ${active ? 'text-[#E8913C]' : 'text-[#6C7378]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW 1: 3D TALENT PRISM & WAR ROOM */}
      {activeSubView === 'prism' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-[#EDE7DC]">
                Enterprise 3D Talent & Risk Prism
              </h3>
              <p className="text-xs text-[#9EA5A8] font-mono mt-0.5">
                Volumetric spatial coordinate engine: Performance (X), Growth Potential (Y), Attrition Flight Risk (Z)
              </p>
            </div>
            <span className="text-xs font-mono text-[#E8913C] border border-[#E8913C]/40 px-2.5 py-1 rounded">
              Danger Plane: Z &gt; 75%
            </span>
          </div>

          <Talent3DCube
            employees={employees}
            onSelectEmployee={(emp) => {
              alert(`Selected Employee: ${emp.name} (${emp.job_role}) — Risk: ${(emp.attrition_probability * 100).toFixed(1)}%`);
            }}
          />

          {/* HIGH RISK ROSTER */}
          <div className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-sm p-6 space-y-4">
            <h4 className="font-display font-bold text-[#EDE7DC] text-base">Immediate High-Risk Flight Roster</h4>
            <div className="divide-y divide-[rgba(237,231,220,0.08)] border border-[rgba(237,231,220,0.13)] rounded-sm overflow-hidden bg-[#0A0C0E]">
              {employees.slice(0, 4).map((emp) => (
                <div key={emp.global_id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#101317] transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-[#EDE7DC]">{emp.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101317] border border-[rgba(237,231,220,0.13)] text-[#9EA5A8]">
                        {emp.job_role}
                      </span>
                      <span className="text-[10px] font-mono text-[#6C7378]">{emp.department}</span>
                    </div>
                    <div className="text-xs font-mono text-[#9EA5A8]">
                      Salary: {emp.salary_band} • Overtime: {emp.overtime_hours}h • Primary Driver: <span className="text-[#E8913C]">{emp.reason}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-red-400">{(emp.attrition_probability * 100).toFixed(1)}% Risk</div>
                      <div className="text-[10px] text-[#6C7378]">Perf {emp.perf} / Pot {emp.pot}</div>
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
              <h3 className="font-display text-lg font-bold text-[#EDE7DC]">Talent Acquisition Pipeline</h3>
              <p className="text-xs text-[#9EA5A8] font-mono mt-0.5">
                AI resume screening and hiring approval gate
              </p>
            </div>

            {candidateActionMessage && (
              <div className="p-2 px-3 rounded-sm bg-[#2E6B72]/20 border border-[#2E6B72] text-[#EDE7DC] text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-[#2E6B72]" />
                <span>{candidateActionMessage}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {candidateList.map((cand) => (
              <div
                key={cand.id}
                className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-sm p-5 space-y-4 hover:border-[rgba(237,231,220,0.25)] transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-display font-bold text-[#EDE7DC] text-base">{cand.name}</h4>
                    <div className="text-xs font-mono text-[#9EA5A8] mt-0.5">{cand.role}</div>
                  </div>
                  <span className="text-[10.5px] font-mono px-2 py-0.5 rounded border border-[#E8913C] text-[#E8913C] font-bold">
                    {cand.score}% Fit
                  </span>
                </div>

                <div className="p-3 bg-[#0A0C0E] border border-[rgba(237,231,220,0.08)] rounded-sm space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#6C7378]">Stage:</span>
                    <span className="text-[#EDE7DC]">{cand.stage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6C7378]">Experience:</span>
                    <span className="text-[#EDE7DC]">{cand.experience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6C7378]">Expected:</span>
                    <span className="text-[#2E6B72]">{cand.expected_salary}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleReject(cand)}
                    className="flex-1 py-1.5 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-sm text-xs font-mono transition"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHire(cand)}
                    className="flex-1 py-1.5 bg-[#EDE7DC] text-[#0A0C0E] hover:bg-[#2E6B72] hover:text-[#EDE7DC] rounded-sm text-xs font-mono font-bold uppercase transition"
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
          <div className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-sm p-6 space-y-5">
            <h3 className="font-display text-lg font-bold text-[#EDE7DC]">Succession Bench & Critical Roles</h3>
            <p className="text-xs text-[#9EA5A8] font-mono">
              Readiness pipelines for Director and Chief Architect seats
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {[
                { target: 'VP of AI Research', current: 'Open Search', successor: 'Vikramaditya Rao', readiness: '92% Ready', time: 'Immediate (0 mos)' },
                { target: 'Director of Engineering', current: 'Kavita Desai', successor: 'Christopher Benson', readiness: '84% Ready', time: '6 months' },
                { target: 'Lead Solutions Architect', current: 'Ananya Deshmukh', successor: 'Dr. Siddharth Sen (Pipeline)', readiness: '78% Ready', time: '12 months' }
              ].map((bench, idx) => (
                <div key={idx} className="p-4 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#EDE7DC] text-sm">{bench.target}</span>
                    <span className="text-[#2E6B72] border border-[#2E6B72] px-2 py-0.5 rounded text-[10px] font-bold">
                      {bench.readiness}
                    </span>
                  </div>
                  <div className="space-y-1 text-[#9EA5A8]">
                    <div className="flex justify-between">
                      <span className="text-[#6C7378]">Primary Ready Successor:</span>
                      <span className="text-[#EDE7DC]">{bench.successor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6C7378]">Estimated Time to Ready:</span>
                      <span className="text-[#E8913C]">{bench.time}</span>
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
          <div className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-sm p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(237,231,220,0.13)] pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-[#EDE7DC]">Corporate Payroll Register</h3>
                <div className="text-xs font-mono text-[#9EA5A8] mt-0.5">
                  Monthly Disbursal Cycle • FY 2026-27 • Section 192 TDS Compliant
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPayrollProcessed(true);
                  if (onRunPayroll) onRunPayroll();
                }}
                className="px-4 py-2 bg-[#EDE7DC] text-[#0A0C0E] hover:bg-[#2E6B72] hover:text-[#EDE7DC] font-mono text-xs font-bold uppercase tracking-wider rounded-sm transition"
              >
                {payrollProcessed ? 'Batch Disbursed to Bank' : 'Run November Payroll'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm space-y-1">
                <div className="text-[10px] font-mono text-[#9EA5A8] uppercase">Total Salary Outflow</div>
                <div className="text-2xl font-display font-bold text-[#EDE7DC]">₹14,82,40,000</div>
                <div className="text-[11px] font-mono text-[#6C7378]">1,420 Active Employees</div>
              </div>

              <div className="p-4 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm space-y-1">
                <div className="text-[10px] font-mono text-[#9EA5A8] uppercase">Statutory EPF & ESI</div>
                <div className="text-2xl font-display font-bold text-[#2E6B72]">₹1,77,88,800</div>
                <div className="text-[11px] font-mono text-[#6C7378]">EPFO Portal Sync Ready</div>
              </div>

              <div className="p-4 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm space-y-1">
                <div className="text-[10px] font-mono text-[#9EA5A8] uppercase">Withheld Income Tax (TDS)</div>
                <div className="text-2xl font-display font-bold text-[#E8913C]">₹2,96,48,000</div>
                <div className="text-[11px] font-mono text-[#6C7378]">Challan 281 Auto-filing</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

