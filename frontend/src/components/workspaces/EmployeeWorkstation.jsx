import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Lock,
  Send,
  ShieldCheck,
  Smile,
  Sparkles,
  TrendingUp,
  User,
  Users,
  HeartHandshake
} from 'lucide-react';
import { downloadPayslipReceipt, downloadFile } from '../../utils/exportHelpers';

export default function EmployeeWorkstation({ currentUser, theme = 'slate', onApplyLeave }) {
  const [activeSubView, setActiveSubView] = useState('overview'); // overview, leaves, compensation, pulse
  const [leaveType, setLeaveType] = useState('Privilege Leave (PTO)');
  const [startDate, setStartDate] = useState('2026-11-15');
  const [endDate, setEndDate] = useState('2026-11-18');
  const [leaveDays, setLeaveDays] = useState(3);
  const [leaveReason, setLeaveReason] = useState('');
  const [appliedLeaves, setAppliedLeaves] = useState([
    { id: 101, type: 'Privilege Leave (PTO)', dates: '2026-10-12 to 2026-10-14', days: 3, status: 'Approved', approver: 'Kavita Desai', dateApplied: '2026-10-01' },
    { id: 102, type: 'Sick / Medical Leave', dates: '2026-09-04 to 2026-09-05', days: 2, status: 'Approved', approver: 'Kavita Desai', dateApplied: '2026-09-04' },
    { id: 103, type: 'Privilege Leave (PTO)', dates: '2026-12-24 to 2026-12-31', days: 6, status: 'Pending', approver: 'Kavita Desai', dateApplied: '2026-11-02' },
  ]);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Pulse Feedback state
  const [pulseRating, setPulseRating] = useState(4);
  const [pulseCategory, setPulseCategory] = useState('Work-Life Balance');
  const [pulseComment, setPulseComment] = useState('');
  const [pulseSubmitted, setPulseSubmitted] = useState(false);
  const [dataExported, setDataExported] = useState(false);

  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    if (!leaveReason.trim()) return;

    const newReq = {
      id: Date.now(),
      type: leaveType,
      dates: `${startDate} to ${endDate}`,
      days: Number(leaveDays),
      status: 'Pending',
      approver: 'Kavita Desai',
      dateApplied: new Date().toISOString().split('T')[0]
    };

    setAppliedLeaves([newReq, ...appliedLeaves]);
    if (onApplyLeave) {
      onApplyLeave(newReq);
    }
    setSubmitSuccess(true);
    setLeaveReason('');
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  const handlePulseSubmit = (e) => {
    e.preventDefault();
    setPulseSubmitted(true);
    setTimeout(() => {
      setPulseSubmitted(false);
      setPulseComment('');
    }, 3500);
  };

  const handleExportData = () => {
    const personalRecord = {
      statutory_basis: "Indian Digital Personal Data Protection Act 2023 §12",
      export_timestamp: new Date().toISOString(),
      principal_name: currentUser?.name || "Vikramaditya Rao",
      pseudonymized_id: "EMP_8A34",
      department: "AI Systems & Foundations",
      designation: "Principal AI Systems Scientist",
      contact_info: {
        email: "vikramaditya.rao@enterprise.internal",
        phone_masked: "+91 98**** *210",
        base_location: "Bengaluru Technology Center (SEZ)"
      },
      employment_history: {
        joining_date: "2023-08-15",
        tenure_years: 3.2,
        current_band: "L7 Principal Scientist",
        reporting_manager: "Kavita Desai"
      },
      compensation: {
        currency: "INR",
        monthly_gross: 155000,
        annual_ctc: 1860000,
        epf_uan: "101994821092",
        pan_masked: "ABC*****9F"
      },
      data_protection: {
        dpo_officer: "Adv. Rajiv Nair",
        audit_trail_reference: "AUD-884099-DPDP",
        cryptographic_hash: "9f83c6b12a8385e054178a9c3d4e8c1561570532ff4b245a498b584d4b1740b2"
      }
    };

    downloadFile(
      `Personal_Data_Export_DPDP_${currentUser?.name?.replace(/\s+/g, '_') || 'Employee'}.json`,
      JSON.stringify(personalRecord, null, 2),
      'application/json'
    );
    setDataExported(true);
    setTimeout(() => setDataExported(false), 3000);
  };

  return (
    <div className="space-y-8 font-body text-text-primary">
      {/* STATS LEDGER */}
      <div className="bg-card border border-border-subtle rounded-xl py-5 px-6 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border-subtle shadow-md">
        <div className="py-2 md:py-0 md:px-5 first:pl-0">
          <div className="font-display text-[30px] font-bold text-emerald-500 leading-tight">
            18 <span className="text-sm font-body text-text-secondary font-normal">days</span>
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-text-secondary mt-1">
            Paid Leave Balance
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-sky-500 leading-tight">
            ₹1,42,850
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-text-secondary mt-1">
            Net Monthly Pay
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-emerald-500 leading-tight flex items-center gap-2">
            4.9 <span className="text-xs font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">Exceeds</span>
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-text-secondary mt-1">
            Performance Score
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[22px] font-semibold text-text-primary leading-tight truncate">
            Kavita Desai
          </div>
          <div className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-text-secondary mt-1">
            Reporting Manager
          </div>
        </div>
      </div>

      {/* SUBVIEW SELECTOR */}
      <div className="flex items-center gap-2 border-b border-border-subtle pb-3 flex-wrap">
        {[
          { id: 'overview', label: 'My Workstation & Leaves', icon: Calendar },
          { id: 'compensation', label: 'Compensation & Pay Slips', icon: FileText },
          { id: 'pulse', label: 'Wellbeing & DPDP Consent', icon: ShieldCheck }
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

      {/* VIEW 1: MY WORKSTATION & LEAVES */}
      {activeSubView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card border border-border-subtle rounded-xl p-6 space-y-5 shadow-md">
              <div className="flex items-center justify-between border-b border-border-subtle pb-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-text-primary">Leave Ledger</h3>
                  <p className="text-xs text-text-secondary mt-0.5 font-mono">
                    Statutory Leave Accrual for FY 2026-27 • Section 22 Compliant
                  </p>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-semibold">
                  Policy Active
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-card-subtle border border-border-subtle rounded-lg">
                  <div className="text-[10px] font-mono text-text-muted uppercase">Privilege (PTO)</div>
                  <div className="text-xl font-display font-bold text-text-primary mt-1">14 <span className="text-xs font-mono text-text-secondary">days left</span></div>
                </div>
                <div className="p-3 bg-card-subtle border border-border-subtle rounded-lg">
                  <div className="text-[10px] font-mono text-text-muted uppercase">Casual Leave</div>
                  <div className="text-xl font-display font-bold text-text-primary mt-1">4 <span className="text-xs font-mono text-text-secondary">days left</span></div>
                </div>
                <div className="p-3 bg-card-subtle border border-border-subtle rounded-lg">
                  <div className="text-[10px] font-mono text-text-muted uppercase">Medical / Sick</div>
                  <div className="text-xl font-display font-bold text-text-primary mt-1">8 <span className="text-xs font-mono text-text-secondary">days left</span></div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-secondary">
                  Recent Leave Requests
                </div>
                <div className="divide-y divide-border-subtle border border-border-subtle rounded-lg overflow-hidden">
                  {appliedLeaves.map((leave) => (
                    <div key={leave.id} className="p-3.5 bg-card-subtle flex items-center justify-between hover:bg-card-hover transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-text-primary">{leave.type}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-card border border-border-subtle text-text-secondary font-semibold">
                            {leave.days} {leave.days === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-text-muted">
                          {leave.dates} • Applied: {leave.dateApplied}
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            leave.status === 'Approved'
                              ? 'border border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                              : leave.status === 'Pending'
                              ? 'border border-amber-500/40 text-amber-500 bg-amber-500/10'
                              : 'border border-rose-500/40 text-rose-400 bg-rose-500/10'
                          }`}
                        >
                          {leave.status}
                        </span>
                        <div className="text-[10px] font-mono text-text-muted">
                          Approver: {leave.approver}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card border border-border-subtle rounded-xl p-6 space-y-5 shadow-md">
              <div className="border-b border-border-subtle pb-3">
                <h3 className="font-display text-lg font-bold text-text-primary">Apply for Leave</h3>
                <p className="text-xs text-text-secondary mt-0.5 font-mono">
                  Routes directly to Manager Kavita Desai
                </p>
              </div>

              {submitSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500 text-emerald-400 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  <span>Leave request logged! Manager notified.</span>
                </div>
              )}

              <form onSubmit={handleLeaveSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">
                    Leave Category
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-3 py-2 bg-card-subtle border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:border-sky-500 min-h-[44px]"
                  >
                    <option value="Privilege Leave (PTO)">Privilege Leave (PTO) - 14 available</option>
                    <option value="Casual Leave">Casual Leave (CL) - 4 available</option>
                    <option value="Medical / Sick Leave">Medical / Sick Leave - 8 available</option>
                    <option value="Compensatory Off">Compensatory Off (Release deployment)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-card-subtle border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:border-sky-500 min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-card-subtle border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:border-sky-500 min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">
                    Working Days Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={leaveDays}
                    onChange={(e) => setLeaveDays(e.target.value)}
                    className="w-full px-3 py-2 bg-card-subtle border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:border-sky-500 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">
                    Context / Handover
                  </label>
                  <textarea
                    rows="3"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="e.g. Personal recharge; handover coordinated with platform team."
                    className="w-full px-3 py-2 bg-card-subtle border border-border-subtle rounded-lg text-xs text-text-primary placeholder-text-muted/60 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2 min-h-[44px] shadow-md shadow-sky-500/20"
                >
                  <Send className="size-3.5" />
                  <span>Submit Request</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: COMPENSATION & PAY SLIPS */}
      {activeSubView === 'compensation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-card border border-border-subtle rounded-xl p-6 space-y-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-subtle pb-4 gap-3">
                <div>
                  <h3 className="font-display text-xl font-bold text-text-primary">Salary & Compensation Statement</h3>
                  <div className="text-xs font-mono text-text-secondary mt-0.5">
                    Pay Period: October 2026 • Disbursed via ICICI Corporate Payroll
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => downloadPayslipReceipt(currentUser || { name: 'Vikramaditya Rao' })}
                  className="flex items-center gap-2 px-3.5 py-2 border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 rounded-lg text-xs font-mono font-bold transition min-h-[44px]"
                >
                  <Download className="size-3.5" />
                  <span>Download Payslip (.TXT)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-emerald-500 font-bold border-b border-border-subtle pb-1">
                    Gross Earnings
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-border-subtle">
                      <span className="text-text-muted">Basic Salary</span>
                      <span className="text-text-primary font-bold">₹85,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-subtle">
                      <span className="text-text-muted">House Rent Allowance (HRA)</span>
                      <span className="text-text-primary font-bold">₹35,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-subtle">
                      <span className="text-text-muted">Special Research Allowance</span>
                      <span className="text-text-primary font-bold">₹25,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-subtle">
                      <span className="text-text-muted">Flexible Benefit Plan (FBP)</span>
                      <span className="text-text-primary font-bold">₹10,000</span>
                    </div>
                    <div className="flex justify-between pt-2 text-sm font-bold text-text-primary">
                      <span>Total Gross</span>
                      <span className="text-emerald-500">₹1,55,000</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-amber-500 font-bold border-b border-border-subtle pb-1">
                    Statutory Deductions
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-border-subtle">
                      <span className="text-text-muted">Provident Fund (EPF Employee)</span>
                      <span className="text-text-primary font-bold">₹4,200</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-subtle">
                      <span className="text-text-muted">Professional Tax (PT Karnataka)</span>
                      <span className="text-text-primary font-bold">₹200</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border-subtle">
                      <span className="text-text-muted">Income Tax (TDS New Regime)</span>
                      <span className="text-text-primary font-bold">₹7,750</span>
                    </div>
                    <div className="flex justify-between pt-2 text-sm font-bold text-text-primary">
                      <span>Total Deductions</span>
                      <span className="text-amber-500">₹12,150</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-card-subtle border border-border-subtle flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    Net Monthly Disbursement
                  </div>
                  <div className="text-2xl font-display font-bold text-text-primary mt-0.5">
                    ₹1,42,850
                  </div>
                </div>
                <div className="text-right text-xs font-mono text-emerald-500 font-semibold">
                  UTR #ICICI98412891 • Settled
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card border border-border-subtle rounded-xl p-6 space-y-4 shadow-md">
              <h4 className="font-display font-bold text-text-primary text-base">Tax & PF Identifiers</h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Annual CTC: <strong className="text-text-primary font-bold">₹18,60,000</strong>. Form 16 certified under Indian Income Tax Act 1961.
              </p>
              <div className="p-3 bg-card-subtle border border-border-subtle rounded-lg space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-text-muted">UAN Number:</span>
                  <span className="text-text-primary font-semibold">101994821092</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">PAN (Masked):</span>
                  <span className="text-text-primary font-semibold">ABC*****9F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Tax Regime:</span>
                  <span className="text-emerald-500 font-bold">Section 115BAC (New)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CONFIDENTIAL WELLBEING & DPDP CONSENT */}
      {activeSubView === 'pulse' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card border border-border-subtle rounded-xl p-6 space-y-5 shadow-md">
              <div className="border-b border-border-subtle pb-3">
                <h3 className="font-display text-lg font-bold text-text-primary">Confidential Wellbeing Pulse</h3>
                <p className="text-xs text-text-secondary mt-0.5 font-mono">
                  Anonymous & encrypted under DPDP Act §6 • Aggregated with 40+ engineering peers
                </p>
              </div>

              {pulseSubmitted ? (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500 text-emerald-400 text-xs font-mono space-y-1">
                  <div className="flex items-center gap-2 font-bold text-emerald-400">
                    <CheckCircle2 className="size-4" />
                    <span>Response cryptographically tokenized!</span>
                  </div>
                  <p className="text-text-secondary">
                    Your feedback is processed anonymously to protect team psychological safety.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePulseSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">
                      Feedback Dimension
                    </label>
                    <select
                      value={pulseCategory}
                      onChange={(e) => setPulseCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-card-subtle border border-border-subtle rounded-lg text-xs text-text-primary focus:outline-none focus:border-sky-500 min-h-[44px]"
                    >
                      <option value="Work-Life Balance">Work-Life Balance & Sustainable Hours</option>
                      <option value="Project Alignment">Project Realignment & Technical Roadblocks</option>
                      <option value="Leadership Trust">Manager Support & Career Advancement</option>
                      <option value="Compensation Equity">Compensation & Market Band Competitiveness</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">
                      Satisfaction Rating (1 to 5)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setPulseRating(val)}
                          className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg border transition min-h-[44px] ${
                            pulseRating === val
                              ? 'bg-sky-500 text-slate-950 border-sky-500 shadow-sm shadow-sky-500/20'
                              : 'bg-card-subtle text-text-secondary border-border-subtle hover:text-text-primary'
                          }`}
                        >
                          {val} {val === 5 ? '★' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">
                      Confidential Notes (Optional)
                    </label>
                    <textarea
                      rows="3"
                      value={pulseComment}
                      onChange={(e) => setPulseComment(e.target.value)}
                      placeholder="e.g. Cluster GPU allocation queue is slowing research velocity; need dedicated H100 access."
                      className="w-full px-3 py-2 bg-card-subtle border border-border-subtle rounded-lg text-xs text-text-primary placeholder-text-muted/60 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2 min-h-[44px] shadow-md shadow-sky-500/20"
                  >
                    <Send className="size-3.5" />
                    <span>Submit Anonymous Feedback</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card border border-border-subtle rounded-xl p-6 space-y-4 shadow-md">
              <h4 className="font-display font-bold text-text-primary text-base flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span>Statutory DPDP Act Rights Center</span>
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Under Section 12 of the Indian DPDP Act 2023, you retain ownership of your personal data and right to export.
              </p>

              <div className="p-3.5 bg-card-subtle border border-border-subtle rounded-lg space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-text-muted">Pseudonymized ID:</span>
                  <span className="text-text-primary font-bold">EMP_8A34</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Masked Name:</span>
                  <span className="text-text-primary font-semibold">V*** R***</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Consent Status:</span>
                  <span className="text-emerald-500 font-bold">Active (HR Operations)</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="w-full py-2 px-3 border border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 text-xs font-mono font-bold rounded-lg transition flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Download className="size-3.5" />
                  <span>{dataExported ? 'Data Exported (.JSON)' : 'Export My Personal Data (.JSON)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
