import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, Send, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, RiskBadge, KpiCard } from '../../components/primitives';
import { useToast } from '../../components/primitives/Toast';

export function EmployeeWorkstationPage({ currentUser, onApplyLeave }) {
  const [leaveType, setLeaveType] = useState('Privilege Leave (PTO)');
  const [startDate, setStartDate] = useState('2026-11-15');
  const [endDate, setEndDate] = useState('2026-11-18');
  const [leaveDays, setLeaveDays] = useState(3);
  const [leaveReason, setLeaveReason] = useState('');
  const [appliedLeaves, setAppliedLeaves] = useState([
    {
      id: 101,
      type: 'Privilege Leave (PTO)',
      dates: '2026-10-12 to 2026-10-14',
      days: 3,
      status: 'Approved',
      approver: 'Kavita Desai',
      dateApplied: '2026-10-01'
    },
    {
      id: 102,
      type: 'Sick / Medical Leave',
      dates: '2026-09-04 to 2026-09-05',
      days: 2,
      status: 'Approved',
      approver: 'Kavita Desai',
      dateApplied: '2026-09-04'
    },
    {
      id: 103,
      type: 'Privilege Leave (PTO)',
      dates: '2026-12-24 to 2026-12-31',
      days: 6,
      status: 'Pending',
      approver: 'Kavita Desai',
      dateApplied: '2026-11-02'
    }
  ]);

  const { addToast } = useToast();

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
    if (onApplyLeave) onApplyLeave(newReq);
    setLeaveReason('');

    addToast({
      message: `Leave request for ${leaveDays} days submitted to Kavita Desai`,
      type: 'success',
      actionLabel: 'Undo',
      onAction: () => {
        setAppliedLeaves((prev) => prev.filter((r) => r.id !== newReq.id));
        addToast({ message: 'Leave application cancelled', type: 'info' });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          Employee Self-Service Workstation
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary mt-1">
          Statutory leave management, balance ledger, and leave application dispatch.
        </p>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Privilege Leave (PTO)"
          value="14 Days"
          trend="Accrued"
          trendType="positive"
          subtext="Expires 31 March 2027"
        />
        <KpiCard
          title="Casual Leave (CL)"
          value="4 Days"
          trend="Available"
          trendType="neutral"
          subtext="Short-notice personal leave"
        />
        <KpiCard
          title="Medical / Sick Leave"
          value="8 Days"
          trend="Protected"
          trendType="positive"
          subtext="No medical certificate req <= 2d"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leave Ledger */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Leave Application Ledger</CardTitle>
                  <CardDescription>Track status and approver audit trails.</CardDescription>
                </div>
                <span className="text-xs font-mono text-status-success font-semibold px-2 py-0.5 rounded bg-status-success-bg border border-status-success-border">
                  Policy FY26-27 Active
                </span>
              </div>
            </CardHeader>

            <CardContent>
              <div className="divide-y divide-border-subtle border border-border-subtle rounded-enterprise overflow-hidden">
                {appliedLeaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="p-3.5 bg-muted/40 hover:bg-muted flex items-center justify-between transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-text-primary">{leave.type}</span>
                        <span className="text-[10.5px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border-subtle text-text-secondary">
                          {leave.days} {leave.days === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-text-muted">
                        {leave.dates} • Applied {leave.dateApplied}
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <RiskBadge status={leave.status} size="xs" />
                      <div className="text-[10px] font-mono text-text-muted">Approver: {leave.approver}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Apply Leave Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Apply for Leave</CardTitle>
              <CardDescription>Routes directly to manager Kavita Desai.</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLeaveSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-text-muted uppercase mb-1">
                    Leave Category
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-3 py-2 bg-muted border border-border-subtle rounded-enterprise text-xs font-mono text-text-primary focus:outline-none focus:border-border-focus min-h-[40px]"
                  >
                    <option value="Privilege Leave (PTO)">Privilege Leave (PTO) - 14 available</option>
                    <option value="Casual Leave (CL)">Casual Leave (CL) - 4 available</option>
                    <option value="Medical / Sick Leave">Medical / Sick Leave - 8 available</option>
                    <option value="Compensatory Off">Compensatory Off</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-muted border border-border-subtle rounded-enterprise text-xs font-mono text-text-primary focus:outline-none focus:border-border-focus min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-muted border border-border-subtle rounded-enterprise text-xs font-mono text-text-primary focus:outline-none focus:border-border-focus min-h-[40px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-text-muted uppercase mb-1">
                    Working Days Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={leaveDays}
                    onChange={(e) => setLeaveDays(e.target.value)}
                    className="w-full px-3 py-2 bg-muted border border-border-subtle rounded-enterprise text-xs font-mono text-text-primary focus:outline-none focus:border-border-focus min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-text-muted uppercase mb-1">
                    Context / Handover Coordinated
                  </label>
                  <textarea
                    rows="3"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="e.g. Personal recharge; handover coordinated with platform team."
                    className="w-full px-3 py-2 bg-muted border border-border-subtle rounded-enterprise text-xs font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-border-focus"
                  />
                </div>

                <Button type="submit" variant="primary" className="w-full" leftIcon={Send}>
                  Submit Leave Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default EmployeeWorkstationPage;
