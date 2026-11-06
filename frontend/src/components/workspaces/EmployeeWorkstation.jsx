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
  Users
} from 'lucide-react';

export default function EmployeeWorkstation({ currentUser, onApplyLeave }) {
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

  return (
    <div className="space-y-8 font-body text-[#EDE7DC]">
      {/* EDITORIAL STATS ROW - DECISIONLENS LEDGER STYLE */}
      <div className="bg-[#101317] border border-l-4 border-[rgba(237,231,220,0.13)] border-l-[#E8913C] rounded-sm py-5 px-6 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[rgba(237,231,220,0.13)] shadow-xs">
        <div className="py-2 md:py-0 md:px-5 first:pl-0">
          <div className="font-display text-[30px] font-bold text-[#EDE7DC] leading-tight">
            18 <span className="text-sm font-body text-[#9EA5A8] font-normal">/ 24</span>
          </div>
          <div className="text-[10.5px] font-mono font-bold uppercase tracking-[0.14em] text-[#9EA5A8] mt-1">
            Available PTO Days
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-[#2E6B72] leading-tight">
            ₹1,42,850
          </div>
          <div className="text-[10.5px] font-mono font-bold uppercase tracking-[0.14em] text-[#9EA5A8] mt-1">
            Monthly Net Salary (Nov)
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[30px] font-bold text-[#EDE7DC] leading-tight flex items-center gap-1.5">
            4.9 <span className="text-xs font-mono text-[#E8913C] font-semibold">Exceeds</span>
          </div>
          <div className="text-[10.5px] font-mono font-bold uppercase tracking-[0.14em] text-[#9EA5A8] mt-1">
            Performance Calibration
          </div>
        </div>

        <div className="py-2 md:py-0 md:px-5">
          <div className="font-display text-[22px] font-semibold text-[#EDE7DC] leading-tight truncate">
            Kavita Desai
          </div>
          <div className="text-[10.5px] font-mono font-bold uppercase tracking-[0.14em] text-[#9EA5A8] mt-1">
            Reporting Manager (Eng)
          </div>
        </div>
      </div>

      {/* SUBVIEW SELECTOR - CALM & FOCUSED */}
      <div className="flex items-center gap-2 border-b border-[rgba(237,231,220,0.13)] pb-3">
        {[
          { id: 'overview', label: 'My Workstation & Leaves', icon: Calendar },
          { id: 'compensation', label: 'Compensation & Pay Slips', icon: FileText },
          { id: 'pulse', label: 'Confidential Pulse & DPDP Privacy', icon: ShieldCheck }
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

      {/* VIEW 1: MY WORKSTATION & LEAVES */}
      {activeSubView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: LEAVE HISTORY & ALLOCATIONS (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-sm p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[rgba(237,231,220,0.13)] pb-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#EDE7DC]">Leave Ledger & Requests</h3>
                  <p className="text-xs text-[#9EA5A8] mt-0.5 font-mono">
                    Statutory Leave Accrual for FY 2026-27 • Section 22 Compliant
                  </p>
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-[#2E6B72] text-[#2E6B72]">
                  Policy Active
                </span>
              </div>

              {/* Leave categories chips */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm">
                  <div className="text-[10px] font-mono text-[#9EA5A8] uppercase">Privilege (PTO)</div>
                  <div className="text-xl font-display font-bold text-[#EDE7DC] mt-1">14 <span className="text-xs font-mono text-[#6C7378]">days left</span></div>
                </div>
                <div className="p-3 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm">
                  <div className="text-[10px] font-mono text-[#9EA5A8] uppercase">Casual Leave</div>
                  <div className="text-xl font-display font-bold text-[#EDE7DC] mt-1">4 <span className="text-xs font-mono text-[#6C7378]">days left</span></div>
                </div>
                <div className="p-3 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm">
                  <div className="text-[10px] font-mono text-[#9EA5A8] uppercase">Medical / Sick</div>
                  <div className="text-xl font-display font-bold text-[#EDE7DC] mt-1">8 <span className="text-xs font-mono text-[#6C7378]">days left</span></div>
                </div>
              </div>

              {/* Table of Applied Leaves */}
              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#9EA5A8]">
                  Recent Leave Requests
                </div>
                <div className="divide-y divide-[rgba(237,231,220,0.08)] border border-[rgba(237,231,220,0.13)] rounded-sm overflow-hidden">
                  {appliedLeaves.map((leave) => (
                    <div key={leave.id} className="p-3.5 bg-[#0A0C0E] flex items-center justify-between hover:bg-[#101317] transition">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#EDE7DC]">{leave.type}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#101317] border border-[rgba(237,231,220,0.13)] text-[#9EA5A8]">
                            {leave.days} {leave.days === 1 ? 'day' : 'days'}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-[#6C7378]">
                          {leave.dates} • Applied: {leave.dateApplied}
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            leave.status === 'Approved'
                              ? 'border border-[#2E6B72] text-[#2E6B72] bg-[#2E6B72]/10'
                              : leave.status === 'Pending'
                              ? 'border border-[#E8913C] text-[#E8913C] bg-[#E8913C]/10'
                              : 'border border-red-500/40 text-red-400 bg-red-500/10'
                          }`}
                        >
                          {leave.status}
                        </span>
                        <div className="text-[10px] font-mono text-[#6C7378]">
                          Approver: {leave.approver}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: LEAVE APPLICATION FORM (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-sm p-6 space-y-5">
              <div className="border-b border-[rgba(237,231,220,0.13)] pb-3">
                <h3 className="font-display text-lg font-bold text-[#EDE7DC]">Apply for Leave</h3>
                <p className="text-xs text-[#9EA5A8] mt-0.5 font-mono">
                  Submitted directly to Manager Kavita Desai
                </p>
              </div>

              {submitSuccess && (
                <div className="p-3 rounded-sm bg-[#2E6B72]/20 border border-[#2E6B72] text-[#EDE7DC] text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#2E6B72]" />
                  <span>Leave request logged successfully! Routing for manager sign-off.</span>
                </div>
              )}

              <form onSubmit={handleLeaveSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-[#9EA5A8] uppercase mb-1">
                    Leave Category
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm text-xs text-[#EDE7DC] focus:outline-none focus:border-[#E8913C]"
                  >
                    <option value="Privilege Leave (PTO)">Privilege Leave (PTO) - 14 available</option>
                    <option value="Casual Leave">Casual Leave (CL) - 4 available</option>
                    <option value="Medical / Sick Leave">Medical / Sick Leave - 8 available</option>
                    <option value="Compensatory Off">Compensatory Off (Weekend project release)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-[#9EA5A8] uppercase mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm text-xs text-[#EDE7DC] focus:outline-none focus:border-[#E8913C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-[#9EA5A8] uppercase mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm text-xs text-[#EDE7DC] focus:outline-none focus:border-[#E8913C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#9EA5A8] uppercase mb-1">
                    Working Days Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={leaveDays}
                    onChange={(e) => setLeaveDays(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm text-xs text-[#EDE7DC] focus:outline-none focus:border-[#E8913C]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#9EA5A8] uppercase mb-1">
                    Reason / Handover Context
                  </label>
                  <textarea
                    rows="3"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="e.g. Annual family travel; on-call coverage coordinated with Ananya."
                    className="w-full px-3 py-2 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm text-xs text-[#EDE7DC] placeholder-[#6C7378] focus:outline-none focus:border-[#E8913C]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-[#EDE7DC] text-[#0A0C0E] hover:bg-[#E8913C] hover:text-[#0A0C0E] font-mono text-xs font-bold uppercase tracking-wider rounded-sm transition flex items-center justify-center gap-2"
                >
                  <Send className="size-3.5" />
                  <span>Submit Leave Request</span>
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
            <div className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-sm p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-[rgba(237,231,220,0.13)] pb-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-[#EDE7DC]">Salary & Compensation Statement</h3>
                  <div className="text-xs font-mono text-[#9EA5A8] mt-0.5">
                    Pay Period: October 2026 • Disbursed via ICICI Corporate Payroll
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Downloading encrypted salary slip PDF: Payslip_Vikramaditya_Rao_Oct2026.pdf")}
                  className="flex items-center gap-2 px-3.5 py-2 border border-[#2E6B72] text-[#2E6B72] hover:text-[#EDE7DC] hover:border-[#EDE7DC] rounded-sm text-xs font-mono font-bold transition"
                >
                  <Download className="size-3.5" />
                  <span>Download Payslip (.PDF)</span>
                </button>
              </div>

              {/* Itemized Table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Earnings */}
                <div className="space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#2E6B72] font-bold border-b border-[rgba(237,231,220,0.13)] pb-1">
                    Gross Earnings
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-[rgba(237,231,220,0.06)]">
                      <span className="text-[#9EA5A8]">Basic Salary</span>
                      <span className="text-[#EDE7DC] font-bold">₹85,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[rgba(237,231,220,0.06)]">
                      <span className="text-[#9EA5A8]">House Rent Allowance (HRA)</span>
                      <span className="text-[#EDE7DC] font-bold">₹35,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[rgba(237,231,220,0.06)]">
                      <span className="text-[#9EA5A8]">Special Research Allowance</span>
                      <span className="text-[#EDE7DC] font-bold">₹25,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[rgba(237,231,220,0.06)]">
                      <span className="text-[#9EA5A8]">Flexible Benefit Plan (FBP)</span>
                      <span className="text-[#EDE7DC] font-bold">₹10,000</span>
                    </div>
                    <div className="flex justify-between pt-2 text-sm font-bold text-[#EDE7DC]">
                      <span>Total Gross Earnings</span>
                      <span className="text-[#2E6B72]">₹1,55,000</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-[#E8913C] font-bold border-b border-[rgba(237,231,220,0.13)] pb-1">
                    Statutory Deductions
                  </div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-[rgba(237,231,220,0.06)]">
                      <span className="text-[#9EA5A8]">Provident Fund (EPF Employee)</span>
                      <span className="text-[#EDE7DC] font-bold">₹4,200</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[rgba(237,231,220,0.06)]">
                      <span className="text-[#9EA5A8]">Professional Tax (PT Karnataka)</span>
                      <span className="text-[#EDE7DC] font-bold">₹200</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[rgba(237,231,220,0.06)]">
                      <span className="text-[#9EA5A8]">Income Tax (TDS New Regime)</span>
                      <span className="text-[#EDE7DC] font-bold">₹7,750</span>
                    </div>
                    <div className="flex justify-between pt-2 text-sm font-bold text-[#EDE7DC]">
                      <span>Total Deductions</span>
                      <span className="text-[#E8913C]">₹12,150</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Transfer Box */}
              <div className="p-4 rounded-sm bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[#9EA5A8] uppercase tracking-wider">
                    Net Monthly Disbursement Credited to Bank Account
                  </div>
                  <div className="text-2xl font-display font-bold text-[#EDE7DC] mt-0.5">
                    ₹1,42,850 <span className="text-xs font-mono text-[#6C7378] font-normal">(One Lakh Forty Two Thousand Eight Hundred Fifty)</span>
                  </div>
                </div>
                <div className="text-right text-xs font-mono text-[#2E6B72]">
                  UTR #ICICI98412891 • Settled
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-sm p-6 space-y-4">
              <h4 className="font-display font-bold text-[#EDE7DC] text-base">Annual Tax & PF Statement</h4>
              <p className="text-xs text-[#9EA5A8] leading-relaxed">
                Your annual CTC is <strong className="text-[#EDE7DC]">₹18,60,000</strong>. Your Form 16 Part A & B is certified under Indian Income Tax Act 1961.
              </p>
              <div className="p-3 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#6C7378]">UAN Number:</span>
                  <span className="text-[#EDE7DC]">101994821092</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C7378]">PAN (Masked):</span>
                  <span className="text-[#EDE7DC]">ABC*****9F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C7378]">Tax Scheme:</span>
                  <span className="text-[#2E6B72]">Section 115BAC (New)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CONFIDENTIAL PULSE & PRIVACY */}
      {activeSubView === 'pulse' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-sm p-6 space-y-5">
              <div className="border-b border-[rgba(237,231,220,0.13)] pb-3">
                <h3 className="font-display text-lg font-bold text-[#EDE7DC]">Monthly Anonymous Pulse Survey</h3>
                <p className="text-xs text-[#9EA5A8] mt-0.5 font-mono">
                  Guaranteed confidential under DPDP Act §6 • Encrypted end-to-end
                </p>
              </div>

              {pulseSubmitted ? (
                <div className="p-4 rounded-sm bg-[#2E6B72]/20 border border-[#2E6B72] text-[#EDE7DC] text-xs font-mono space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#2E6B72]">
                    <CheckCircle2 className="size-4" />
                    <span>Response cryptographically tokenized and recorded!</span>
                  </div>
                  <p className="text-[#9EA5A8]">
                    Your feedback is aggregated with 40+ engineering peers to eliminate deanonymization risks.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePulseSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono text-[#9EA5A8] uppercase mb-1">
                      Feedback Dimension
                    </label>
                    <select
                      value={pulseCategory}
                      onChange={(e) => setPulseCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm text-xs text-[#EDE7DC] focus:outline-none focus:border-[#E8913C]"
                    >
                      <option value="Work-Life Balance">Work-Life Balance & Sustainable Hours</option>
                      <option value="Project Alignment">Project Realignment & Technical Roadblocks</option>
                      <option value="Leadership Trust">Manager Support & Career Advancement</option>
                      <option value="Compensation Equity">Compensation & Market Band Competitiveness</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#9EA5A8] uppercase mb-1">
                      Satisfaction Rating (1 to 5)
                    </label>
                    <div className="flex gap-3">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setPulseRating(val)}
                          className={`flex-1 py-2 text-xs font-mono font-bold rounded-sm border transition ${
                            pulseRating === val
                              ? 'bg-[#E8913C] text-[#0A0C0E] border-[#E8913C]'
                              : 'bg-[#0A0C0E] text-[#9EA5A8] border-[rgba(237,231,220,0.13)] hover:text-[#EDE7DC]'
                          }`}
                        >
                          {val} {val === 5 ? '★' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-[#9EA5A8] uppercase mb-1">
                      Confidential Notes (Optional)
                    </label>
                    <textarea
                      rows="3"
                      value={pulseComment}
                      onChange={(e) => setPulseComment(e.target.value)}
                      placeholder="e.g. Cluster GPU allocation queue is slowing research velocity; need dedicated H100 access."
                      className="w-full px-3 py-2 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm text-xs text-[#EDE7DC] placeholder-[#6C7378] focus:outline-none focus:border-[#E8913C]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#EDE7DC] text-[#0A0C0E] hover:bg-[#2E6B72] hover:text-[#EDE7DC] font-mono text-xs font-bold uppercase tracking-wider rounded-sm transition flex items-center justify-center gap-2"
                  >
                    <Send className="size-3.5" />
                    <span>Submit Anonymous Pulse</span>
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#101317] border border-[rgba(237,231,220,0.13)] rounded-sm p-6 space-y-4">
              <h4 className="font-display font-bold text-[#EDE7DC] text-base flex items-center gap-2">
                <ShieldCheck className="size-4 text-[#2E6B72]" />
                <span>DPDP Act 2023 Identity Shield</span>
              </h4>
              <p className="text-xs text-[#9EA5A8] leading-relaxed">
                Under the Indian Digital Personal Data Protection Act 2023, your personal identity is shielded by automated pseudonymization.
              </p>
              <div className="p-3.5 bg-[#0A0C0E] border border-[rgba(237,231,220,0.13)] rounded-sm space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#6C7378]">Pseudonymized ID:</span>
                  <span className="text-[#EDE7DC] font-bold">EMP_8A34</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C7378]">Masked Name:</span>
                  <span className="text-[#EDE7DC]">V*** R***</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C7378]">Consent Granted:</span>
                  <span className="text-[#2E6B72] font-semibold">Active (HR Operations)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6C7378]">Data Fiduciary:</span>
                  <span className="text-[#EDE7DC]">Enterprise HR AI Ltd.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

