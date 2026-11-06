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

export default function ManagerCockpit({ employees = [], theme = 'slate', onApproveLeave, onRejectLeave }) {
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
      reason: 'Personal errand and municipal registration.',
      appliedDate: '2026-11-05'
    }
  ]);

  // Retention simulator state
  const [selectedEmpForSim, setSelectedEmpForSim] = useState(employees[0] || null);
  const [simSalaryBump, setSimSalaryBump] = useState(15); // percentage
  const [simOtCut, setSimOtCut] = useState(30); // percentage
  const [memoDownloaded, setMemoDownloaded] = useState(false);

  const handleApprove = (leave) => {
    setPendingLeaves((prev) => prev.filter((l) => l.id !== leave.id));
    if (onApproveLeave) onApproveLeave(leave.id);

    // Provide 5-second undo banner
    const timerId = setTimeout(() => {
      setLastAction(null);
    }, 5000);
    setLastAction({ type: 'approved', leave, timerId });
  };

  const handleReject = (leave) => {
    setPendingLeaves((prev) => prev.filter((l) => l.id !== leave.id));
    if (onRejectLeave) onRejectLeave(leave.id);

    // Provide 5-second undo banner
    const timerId = setTimeout(() => {
      setLastAction(null);
    }, 5000);
    setLastAction({ type: 'rejected', leave, timerId });
  };

  const handleUndo = () => {
    if (!lastAction) return;
    clearTimeout(lastAction.timerId);
    setPendingLeaves((prev) => [lastAction.leave, ...prev]);
    setLastAction(null);
  };

  // Safe simulation calculations
  const currentRisk = selectedEmpForSim?.attrition_probability || 0.85;
  const simulatedRisk = Math.max(0.08, currentRisk - (simSalaryBump * 0.015) - (simOtCut * 0.008));
  const baseSalary = (selectedEmpForSim?.monthly_salary || 120000) * 12;
  const replacementCost = baseSalary * 1.5;
  const interventionCost = (baseSalary * (simSalaryBump / 100)) + 60000;
  const netSavings = Math.max(0, (replacementCost * (currentRisk - simulatedRisk)) - interventionCost);

  const handleDownloadMemo = () => {
    if (!selectedEmpForSim) return;
    downloadRetentionMemo({
      employee: selectedEmpForSim,
      salaryBump: simSalaryBump,
      otCut: simOtCut,
      currentRisk,
      simulatedRisk,
      replacementCost,
      interventionCost,
      netSavings
    });
    setMemoDownloaded(true);
    setTimeout(() => setMemoDownloaded(false), 3000);
  };

  return (
    <div className="space-y-8 font-body text-text-primary">
      {/* STATS LEDGER */}
      <div className="bg-card border border-border-subtle rounded-xl py-5 px-6 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border-subtle shadow-md">
        <div className="py-2 md:py-0 md:px-5 first:pl-0">
          <div className="font-display text-[30px] font-bold text-text-primary leading-tight">
            8 <span className="text-sm font-body text-text-secondary font-normal">engineers</span>
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-text-secondary mt-1">
            Engineering Roster
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-amber-500 leading-tight flex items-center gap-2">
            {pendingLeaves.length}
            {pendingLeaves.length > 0 && (
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-500 font-semibold">
                Action Required
              </span>
            )}
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-text-secondary mt-1">
            Pending Leave Approvals
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-rose-500 leading-tight">
            1 <span className="text-xs font-mono text-rose-400 font-semibold px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">Critical (99.5%)</span>
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-text-secondary mt-1">
            Flight Risk Talent
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-emerald-500 leading-tight">
            4.6 <span className="text-sm font-body text-text-secondary font-normal">/ 5.0</span>
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-text-secondary mt-1">
            Avg Team Performance
          </div>
        </div>
      </div>

      {/* UNDO BANNER */}
      {lastAction && (
        <div className="p-3 rounded-lg bg-card border border-emerald-500/50 text-text-primary text-xs font-mono flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>Leave {lastAction.type} for <strong>{lastAction.leave.name}</strong></span>
          </div>
          <button
            type="button"
            onClick={handleUndo}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-card-subtle border border-border-strong text-amber-500 hover:text-text-primary transition"
          >
            <RotateCcw className="size-3" />
            <span>Undo Action</span>
          </button>
        </div>
      )}

      {/* SUBVIEW SELECTOR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-border-subtle pb-3 gap-3">
        <div className="flex items-center gap-2 flex-wrap">
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

        {/* 2D / 3D MODE TOGGLE */}
        {activeSubView === 'prism' && (
          <div className="flex items-center gap-1 p-1 rounded-lg bg-card border border-border-subtle text-[11px] font-mono shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('3D')}
              className={`px-3 py-1 rounded-md transition ${
                viewMode === '3D' ? 'bg-sky-500 text-slate-950 font-bold shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              3D Spatial
            </button>
            <button
              type="button"
              onClick={() => setViewMode('2D')}
              className={`px-3 py-1 rounded-md transition ${
                viewMode === '2D' ? 'bg-sky-500 text-slate-950 font-bold shadow-xs' : 'text-text-secondary hover:text-text-primary'
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-bold text-text-primary">
                Engineering Talent Calibration
              </h3>
              <p className="text-xs text-text-secondary font-mono mt-0.5">
                {viewMode === '3D'
                  ? 'Spatial Engine: X = Performance (1-5), Y = Potential (1-5), Z = Attrition Flight Risk'
                  : 'Accessible 2D 9-Box Grid with Color-Independent Octagonal Danger Markers'}
              </p>
            </div>
            <span className="text-xs font-mono text-rose-500 border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 rounded-lg font-semibold w-fit">
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
            <div className="bg-card border border-border-subtle rounded-xl p-6 space-y-4 shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-xs font-mono">
                {['High Potential', 'Medium Potential', 'Foundational Potential'].map((tier, row) => (
                  <React.Fragment key={tier}>
                    {['Underperforming', 'Core Performer', 'Top Performer'].map((col, cIdx) => (
                      <div
                        key={`${row}-${cIdx}`}
                        className="p-4 rounded-lg bg-card-subtle border border-border-subtle min-h-[110px] text-left flex flex-col justify-between"
                      >
                        <div className="text-[10px] text-text-muted uppercase tracking-wider">{tier} • {col}</div>
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
                                className="w-full text-left p-2 rounded-lg bg-card border border-border-subtle hover:border-sky-500 mt-1 text-[11px] font-bold text-text-primary flex items-center justify-between transition"
                              >
                                <span>{emp.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded ${emp.attrition_probability >= 0.75 ? 'text-rose-500 bg-rose-500/10 border border-rose-500/30' : 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/30'}`}>
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
          <div className="border-b border-border-subtle pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-bold text-text-primary">Direct Report Leave Requests</h3>
              <p className="text-xs text-text-secondary font-mono mt-0.5">
                Review and approve leave allocations for Engineering & Platform
              </p>
            </div>
            {pendingLeaves.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  pendingLeaves.forEach((l) => handleApprove(l));
                }}
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold uppercase transition min-h-[44px] shadow-sm shadow-sky-500/20"
              >
                Approve All ({pendingLeaves.length})
              </button>
            )}
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="p-8 text-center bg-card border border-border-subtle rounded-xl font-mono space-y-2 shadow-md">
              <CheckCircle2 className="size-8 text-emerald-500 mx-auto" />
              <div className="text-sm font-bold text-text-primary">Inbox Clean — Zero Pending Requests</div>
              <p className="text-xs text-text-secondary">All direct report leave requests have been resolved.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="bg-card border border-border-subtle rounded-xl p-5 hover:border-sky-500/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-display font-bold text-base text-text-primary">{leave.name}</span>
                      <span className="text-[10.5px] font-mono text-text-secondary px-2 py-0.5 rounded bg-card-subtle border border-border-subtle">
                        {leave.role}
                      </span>
                      <span className="text-[10px] font-mono text-text-muted">({leave.pseudo_id})</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-text-secondary">
                      <span className="text-amber-500 font-semibold">{leave.type}</span>
                      <span>•</span>
                      <span>{leave.dates} ({leave.days} working {leave.days === 1 ? 'day' : 'days'})</span>
                      <span>•</span>
                      <span className="text-text-muted">Applied {leave.appliedDate}</span>
                    </div>

                    <p className="text-xs text-text-primary/90 font-body bg-card-subtle p-2.5 rounded-lg border border-border-subtle">
                      "{leave.reason}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleReject(leave)}
                      className="px-3.5 py-2 border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 min-h-[44px]"
                    >
                      <UserX className="size-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(leave)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 min-h-[44px] shadow-sm shadow-emerald-600/20"
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
            <div className="bg-card border border-border-subtle rounded-xl p-6 space-y-6 shadow-md">
              <div className="border-b border-border-subtle pb-3">
                <h3 className="font-display text-lg font-bold text-text-primary">Retention Counter-Offer Modeling</h3>
                <p className="text-xs text-text-secondary font-mono mt-0.5">
                  Simulate compensation adjustments and overtime caps to pull key talent out of danger
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">
                  Target Team Member
                </label>
                <select
                  value={selectedEmpForSim?.global_id}
                  onChange={(e) => {
                    const emp = employees.find((x) => String(x.global_id) === e.target.value);
                    if (emp) setSelectedEmpForSim(emp);
                  }}
                  className="w-full px-3 py-2 bg-card-subtle border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:border-sky-500 min-h-[44px]"
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
                  <span className="text-text-secondary uppercase">Market Compensation Correction:</span>
                  <span className="text-text-primary font-bold">+{simSalaryBump}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="5"
                  value={simSalaryBump}
                  onChange={(e) => setSimSalaryBump(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-secondary uppercase">Overtime Relief:</span>
                  <span className="text-text-primary font-bold">-{simOtCut}% reduction</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="10"
                  value={simOtCut}
                  onChange={(e) => setSimOtCut(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDownloadMemo}
                  className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2 min-h-[44px] shadow-md shadow-sky-500/20"
                >
                  <Download className="size-3.5" />
                  <span>{memoDownloaded ? 'Retention Memo Downloaded (.TXT)' : 'Generate Retention Offer Memo'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card border border-border-subtle rounded-xl p-6 space-y-5 shadow-md">
              <h4 className="font-display font-bold text-text-primary text-base">Projected Intervention Impact</h4>

              <div className="p-4 bg-card-subtle border border-border-subtle rounded-lg space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-text-muted text-[10.5px] uppercase">
                    <span>Baseline Flight Risk:</span>
                    <span className="text-rose-500 font-bold">{(currentRisk * 100).toFixed(1)}% (Critical)</span>
                  </div>
                  <div className="h-2 w-full bg-card rounded-full overflow-hidden mt-1.5 border border-border-subtle">
                    <div className="h-full bg-rose-500" style={{ width: `${currentRisk * 100}%` }}></div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-text-muted text-[10.5px] uppercase">
                    <span>Projected Post-Intervention:</span>
                    <span className="text-emerald-500 font-bold">{(simulatedRisk * 100).toFixed(1)}% (Stabilized)</span>
                  </div>
                  <div className="h-2 w-full bg-card rounded-full overflow-hidden mt-1.5 border border-border-subtle">
                    <div className="h-full bg-emerald-500" style={{ width: `${simulatedRisk * 100}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-border-subtle">
                  <span className="text-text-muted">Cost of Departure (CoD):</span>
                  <span className="text-text-primary font-bold">₹{(replacementCost / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border-subtle">
                  <span className="text-text-muted">Intervention Cost:</span>
                  <span className="text-amber-500 font-bold">₹{(interventionCost / 100000).toFixed(2)} Lakhs</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-bold text-text-primary">
                  <span>Net Rupee Savings:</span>
                  <span className="text-emerald-500">₹{(netSavings / 100000).toFixed(2)} Lakhs Saved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
