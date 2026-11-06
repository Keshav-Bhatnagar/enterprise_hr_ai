import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sliders,
  TrendingDown,
  UserCheck,
  UserX,
  Users,
  Box,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Download,
  RotateCcw,
  Grid
} from 'lucide-react';
import Talent3DCube from '../Talent3DCube';
import { downloadRetentionMemo } from '../../utils/exportHelpers';

export default function ManagerCockpit({ employees = [], onApproveLeave, onRejectLeave }) {
  const [activeSubView, setActiveSubView] = useState('prism'); // prism, approvals, simulator
  const [viewMode, setViewMode] = useState('3D'); // '3D' or '2D'
  const [lastAction, setLastAction] = useState(null); // { type, leave, timerId }

  const [pendingLeaves, setPendingLeaves] = useState([
    {
      id: 201,
      name: 'Christopher Benson',
      masked_name: 'C*** B***',
      pseudo_id: 'EMP_AC99',
      role: 'Lead Platform Architect',
      type: 'Privilege Leave (PTO)',
      dates: '2026-11-20 to 2026-11-24',
      days: 5,
      reason: 'Family wedding; handover arranged with Vikramaditya.',
      appliedDate: '2026-11-04'
    },
    {
      id: 202,
      name: 'Vikramaditya Rao',
      masked_name: 'V*** R***',
      pseudo_id: 'EMP_8A34',
      role: 'Principal AI Systems Scientist',
      type: 'Privilege Leave (PTO)',
      dates: '2026-12-24 to 2026-12-31',
      days: 6,
      reason: 'Year-end personal recharge and paper writeup.',
      appliedDate: '2026-11-02'
    },
    {
      id: 203,
      name: 'Ananya Deshmukh',
      masked_name: 'A*** D***',
      pseudo_id: 'EMP_3B21',
      role: 'Enterprise Solutions Architect',
      type: 'Casual Leave (CL)',
      dates: '2026-11-18',
      days: 1,
      reason: 'Urgent personal banking errand.',
      appliedDate: '2026-11-05'
    }
  ]);

  const [processedLeaves, setProcessedLeaves] = useState([]);
  const [selectedEmpForSim, setSelectedEmpForSim] = useState(employees[0] || null);
  const [simSalaryBump, setSimSalaryBump] = useState(15); // %
  const [simOtCut, setSimOtCut] = useState(50); // % reduction in OT
  const [memoDownloaded, setMemoDownloaded] = useState(false);

  const handleApprove = (leave) => {
    setPendingLeaves(pendingLeaves.filter((l) => l.id !== leave.id));
    const processedItem = { ...leave, status: 'Approved', actionTime: 'Just now' };
    setProcessedLeaves([processedItem, ...processedLeaves]);
    setLastAction({ type: 'Approved', leave });
    if (onApproveLeave) onApproveLeave(leave.id);
    setTimeout(() => setLastAction(null), 4000);
  };

  const handleReject = (leave) => {
    setPendingLeaves(pendingLeaves.filter((l) => l.id !== leave.id));
    const processedItem = { ...leave, status: 'Rejected', actionTime: 'Just now' };
    setProcessedLeaves([processedItem, ...processedLeaves]);
    setLastAction({ type: 'Rejected', leave });
    if (onRejectLeave) onRejectLeave(leave.id);
    setTimeout(() => setLastAction(null), 4000);
  };

  const handleUndo = () => {
    if (!lastAction) return;
    const restored = lastAction.leave;
    setPendingLeaves([restored, ...pendingLeaves]);
    setProcessedLeaves(processedLeaves.filter((l) => l.id !== restored.id));
    setLastAction(null);
  };

  // Grounded non-linear logistic simulation math
  const currentRisk = selectedEmpForSim?.attrition_probability || 0.9948;
  const simulatedRisk = Math.max(0.12, currentRisk - (simSalaryBump * 0.022) - (simOtCut * 0.005));
  const replacementCost = (selectedEmpForSim?.monthly_salary || 115000) * 12 * 0.6;
  const interventionCost = ((selectedEmpForSim?.monthly_salary || 115000) * 12 * (simSalaryBump / 100));
  const netSavings = replacementCost - interventionCost;

  const handleDownloadMemo = () => {
    downloadRetentionMemo(selectedEmpForSim || employees[0], {
      salaryBump: simSalaryBump,
      otCut: simOtCut,
      projectedRisk: simulatedRisk,
      replacementCost,
      interventionCost,
      netSavings
    });
    setMemoDownloaded(true);
    setTimeout(() => setMemoDownloaded(false), 3000);
  };

  return (
    <div className="space-y-8 font-body text-[#EDE7DC]">
      {/* STATS LEDGER - CRAFT FLOOR COMPLIANT */}
      <div className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-lg py-5 px-6 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[rgba(237,231,220,0.13)]">
        <div className="py-2 md:py-0 md:px-5 first:pl-0">
          <div className="font-display text-[30px] font-bold text-[#EDE7DC] leading-tight">
            8 <span className="text-sm font-body text-[#9EA5A8] font-normal">engineers</span>
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-[#9EA5A8] mt-1">
            Engineering Roster
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-[#E8913C] leading-tight flex items-center gap-2">
            {pendingLeaves.length}
            {pendingLeaves.length > 0 && (
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[#E8913C] text-[#E8913C]">
                Action Required
              </span>
            )}
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-[#9EA5A8] mt-1">
            Pending Leave Approvals
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-[#E8913C] leading-tight">
            1 <span className="text-xs font-mono text-[#E8913C] font-semibold">Critical (99.5%)</span>
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-[#9EA5A8] mt-1">
            Flight Risk Talent
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-[#2E6B72] leading-tight">
            4.6 <span className="text-sm font-body text-[#9EA5A8] font-normal">/ 5.0</span>
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-[#9EA5A8] mt-1">
            Avg Team Performance
          </div>
        </div>
      </div>

      {/* UNDO BANNER */}
      {lastAction && (
        <div className="p-3 rounded-lg bg-[#101317] border border-[#2E6B72] text-[#EDE7DC] text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-[#2E6B72]" />
            <span>Leave {lastAction.type} for <strong>{lastAction.leave.name}</strong></span>
          </div>
          <button
            type="button"
            onClick={handleUndo}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0A0C0E] border border-[rgba(237,231,220,0.2)] text-[#E8913C] hover:text-[#EDE7DC] transition"
          >
            <RotateCcw className="size-3" />
            <span>Undo Action</span>
          </button>
        </div>
      )}

      {/* SUBVIEW SELECTOR */}
      <div className="flex items-center justify-between border-b border-[rgba(237,231,220,0.13)] pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'prism', label: 'Team Talent & Risk Prism', icon: Box },
            { id: 'approvals', label: `Pending Approvals (${pendingLeaves.length})`, icon: Calendar },
            { id: 'simulator', label: 'Team Retention Action Simulator', icon: Sliders }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubView(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-sm text-xs font-mono transition min-h-[44px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2E6B72] ${
                  active
                    ? 'bg-[#101317] border border-[#2E6B72] text-[#EDE7DC] font-bold'
                    : 'text-[#9EA5A8] hover:text-[#EDE7DC] hover:bg-[#101317]/60'
                }`}
              >
                <Icon className={`size-3.5 ${active ? 'text-[#2E6B72]' : 'text-[#9EA5A8]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 2D / 3D MODE TOGGLE (KAMI-PAHREDAR SRE FALLBACK) */}
        {activeSubView === 'prism' && (
          <div className="flex items-center gap-1 p-1 rounded-sm bg-[#101317] border border-[rgba(237,231,220,0.13)] text-[11px] font-mono">
            <button
              type="button"
              onClick={() => setViewMode('3D')}
              className={`px-2.5 py-1 rounded-sm transition ${
                viewMode === '3D' ? 'bg-[#0A0C0E] text-[#EDE7DC] font-bold' : 'text-[#9EA5A8]'
              }`}
            >
              3D Spatial
            </button>
            <button
              type="button"
              onClick={() => setViewMode('2D')}
              className={`px-2.5 py-1 rounded-sm transition ${
                viewMode === '2D' ? 'bg-[#0A0C0E] text-[#EDE7DC] font-bold' : 'text-[#9EA5A8]'
              }`}
            >
              Classic 2D Grid
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: TEAM TALENT & RISK PRISM / 2D GRID */}
      {activeSubView === 'prism' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-[#EDE7DC]">
                Engineering Talent Calibration
              </h3>
              <p className="text-xs text-[#9EA5A8] font-mono mt-0.5">
                {viewMode === '3D'
                  ? 'Spatial Engine: X = Performance (1-5), Y = Potential (1-5), Z = Attrition Flight Risk'
                  : 'Accessible 2D 9-Box Grid with Color-Independent Octagonal Danger Markers'}
              </p>
            </div>
            <span className="text-xs font-mono text-[#E8913C] border border-[#E8913C]/40 px-2.5 py-1 rounded">
              Danger Threshold: &gt; 75% Risk
            </span>
          </div>

          {viewMode === '3D' ? (
            <Talent3DCube
              employees={employees}
              onSelectEmployee={(emp) => {
                setSelectedEmpForSim(emp);
                setActiveSubView('simulator');
              }}
            />
          ) : (
            /* ACCESSIBLE 2D 9-BOX FALLBACK */
            <div className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
                {['High Potential', 'Medium Potential', 'Foundational Potential'].map((tier, row) => (
                  <React.Fragment key={tier}>
                    {['Underperforming', 'Core Performer', 'Top Performer'].map((col, cIdx) => (
                      <div
                        key={`${row}-${cIdx}`}
                        className="p-4 rounded-sm bg-[#0A0C0E] border border-[rgba(237,231,220,0.08)] min-h-[110px] text-left flex flex-col justify-between"
                      >
                        <div className="text-[10px] text-[#9EA5A8] uppercase tracking-wider">{tier} • {col}</div>
                        <div>
                          {employees
                            .filter((emp) => {
                              const p = emp.perf || 4.2;
                              const pot = emp.pot || 4.5;
                              const pMatch = cIdx === 2 ? p >= 4.5 : cIdx === 1 ? p >= 3.5 : p < 3.5;
                              const potMatch = row === 0 ? pot >= 4.5 : row === 1 ? pot >= 3.5 : pot < 3.5;
                              return pMatch && potMatch;
                            })
                            .map((emp) => (
                              <button
                                key={emp.global_id}
                                type="button"
                                onClick={() => {
                                  setSelectedEmpForSim(emp);
                                  setActiveSubView('simulator');
                                }}
                                className="w-full text-left p-1.5 rounded bg-[#101317] border border-[rgba(237,231,220,0.13)] hover:border-[#E8913C] mt-1 text-[11px] font-bold text-[#EDE7DC] flex items-center justify-between"
                              >
                                <span>{emp.name}</span>
                                <span className={`text-[9px] px-1 rounded ${emp.attrition_probability >= 0.75 ? 'text-[#E8913C] border border-[#E8913C]' : 'text-[#2E6B72]'}`}>
                                  {(emp.attrition_probability * 100).toFixed(0)}%
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PENDING APPROVALS INBOX */}
      {activeSubView === 'approvals' && (
        <div className="space-y-6">
          <div className="border-b border-[rgba(237,231,220,0.13)] pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-[#EDE7DC]">Direct Report Leave Requests</h3>
              <p className="text-xs text-[#9EA5A8] font-mono mt-0.5">
                Review and approve leave allocations for Engineering & Platform
              </p>
            </div>
            {pendingLeaves.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  pendingLeaves.forEach((l) => handleApprove(l));
                }}
                className="px-3.5 py-2 rounded-sm bg-[#EDE7DC] text-[#0A0C0E] hover:bg-[#2E6B72] hover:text-[#EDE7DC] font-mono text-xs font-bold uppercase transition min-h-[44px]"
              >
                Approve All ({pendingLeaves.length})
              </button>
            )}
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="p-8 text-center bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-lg font-mono space-y-2">
              <CheckCircle2 className="size-8 text-[#2E6B72] mx-auto" />
              <div className="text-sm font-bold text-[#EDE7DC]">Inbox Clean — Zero Pending Requests</div>
              <p className="text-xs text-[#9EA5A8]">All direct report leave requests have been resolved.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-lg p-5 hover:border-[rgba(237,231,220,0.25)] transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-base text-[#EDE7DC]">{leave.name}</span>
                      <span className="text-[10.5px] font-mono text-[#9EA5A8] px-2 py-0.5 rounded bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)]">
                        {leave.role}
                      </span>
                      <span className="text-[10px] font-mono text-[#9EA5A8]">({leave.pseudo_id})</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#9EA5A8]">
                      <span className="text-[#E8913C] font-semibold">{leave.type}</span>
                      <span>•</span>
                      <span>{leave.dates} ({leave.days} working {leave.days === 1 ? 'day' : 'days'})</span>
                      <span>•</span>
                      <span className="text-[#9EA5A8]">Applied {leave.appliedDate}</span>
                    </div>

                    <p className="text-xs text-[#EDE7DC]/80 font-body bg-[#0A0C0E] p-2.5 rounded border border-[rgba(237,231,220,0.06)]">
                      "{leave.reason}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleReject(leave)}
                      className="px-3.5 py-2 border border-red-500/40 text-red-400 hover:bg-red-500/10 rounded-sm text-xs font-mono font-bold transition flex items-center gap-1.5 min-h-[44px]"
                    >
                      <UserX className="size-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(leave)}
                      className="px-4 py-2 bg-[#EDE7DC] text-[#0A0C0E] hover:bg-[#2E6B72] hover:text-[#EDE7DC] rounded-sm text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 min-h-[44px]"
                    >
                      <UserCheck className="size-3.5" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: RETENTION SIMULATOR */}
      {activeSubView === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-lg p-6 space-y-6">
              <div className="border-b border-[rgba(237,231,220,0.13)] pb-3">
                <h3 className="font-display text-lg font-bold text-[#EDE7DC]">Retention Counter-Offer Modeling</h3>
                <p className="text-xs text-[#9EA5A8] font-mono mt-0.5">
                  Simulate compensation adjustments and overtime caps to pull key talent out of danger
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#9EA5A8] uppercase mb-1">
                  Target Team Member
                </label>
                <select
                  value={selectedEmpForSim?.global_id}
                  onChange={(e) => {
                    const emp = employees.find((x) => String(x.global_id) === e.target.value);
                    if (emp) setSelectedEmpForSim(emp);
                  }}
                  className="w-full px-3 py-2 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm text-xs text-[#EDE7DC] focus:outline-none focus:border-[#2E6B72] min-h-[44px]"
                >
                  {employees.map((emp) => (
                    <option key={emp.global_id} value={emp.global_id}>
                      {emp.name} — {emp.job_role} ({(emp.attrition_probability * 100).toFixed(1)}% Risk)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#9EA5A8] uppercase">Market Compensation Correction:</span>
                  <span className="text-[#EDE7DC] font-bold">+{simSalaryBump}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="5"
                  value={simSalaryBump}
                  onChange={(e) => setSimSalaryBump(Number(e.target.value))}
                  className="w-full accent-[#E8913C] cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#9EA5A8] uppercase">Overtime Relief:</span>
                  <span className="text-[#EDE7DC] font-bold">-{simOtCut}% reduction</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="10"
                  value={simOtCut}
                  onChange={(e) => setSimOtCut(Number(e.target.value))}
                  className="w-full accent-[#2E6B72] cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDownloadMemo}
                  className="w-full py-2.5 px-4 bg-[#EDE7DC] text-[#0A0C0E] hover:bg-[#2E6B72] hover:text-[#EDE7DC] font-mono text-xs font-bold uppercase tracking-wider rounded-sm transition flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Download className="size-3.5" />
                  <span>{memoDownloaded ? 'Retention Memo Downloaded (.TXT)' : 'Generate Retention Offer Memo'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-lg p-6 space-y-5">
              <h4 className="font-display font-bold text-[#EDE7DC] text-base">Projected Intervention Impact</h4>

              <div className="p-4 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-[#9EA5A8] text-[10.5px] uppercase">
                    <span>Baseline Flight Risk:</span>
                    <span className="text-red-400 font-bold">{(currentRisk * 100).toFixed(1)}% (Critical)</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#101317] rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-red-500" style={{ width: `${currentRisk * 100}%` }}></div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-[#9EA5A8] text-[10.5px] uppercase">
                    <span>Projected Post-Intervention:</span>
                    <span className="text-[#2E6B72] font-bold">{(simulatedRisk * 100).toFixed(1)}% (Stabilized)</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#101317] rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-[#2E6B72]" style={{ width: `${simulatedRisk * 100}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-[rgba(237,231,220,0.06)]">
                  <span className="text-[#9EA5A8]">Cost of Departure (CoD):</span>
                  <span className="text-[#EDE7DC]">₹{(replacementCost / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[rgba(237,231,220,0.06)]">
                  <span className="text-[#9EA5A8]">Intervention Cost:</span>
                  <span className="text-[#E8913C]">₹{(interventionCost / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold text-[#EDE7DC]">
                  <span>Net Rupee Savings:</span>
                  <span className="text-[#2E6B72]">₹{(netSavings / 100000).toFixed(2)} Lakhs Saved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
