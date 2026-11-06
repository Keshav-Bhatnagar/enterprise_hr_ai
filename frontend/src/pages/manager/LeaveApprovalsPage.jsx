import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, UserCheck, UserX, Clock, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, RiskBadge, EmptyState } from '../../components/primitives';
import { useToast } from '../../components/primitives/Toast';
import { rowCollapseVariants } from '../../utils/motion';

export function LeaveApprovalsPage({ initialLeaves }) {
  const [pendingLeaves, setPendingLeaves] = useState(
    initialLeaves || [
      {
        id: 201,
        name: 'Christopher Benson',
        role: 'Lead Platform Architect',
        pseudo_id: 'EMP_AC99',
        type: 'Privilege Leave (PTO)',
        dates: '2026-11-20 to 2026-11-24',
        days: 5,
        reason: 'Family wedding; handover coordinated with Vikramaditya.',
        appliedDate: '2026-11-04'
      },
      {
        id: 202,
        name: 'Vikramaditya Rao',
        role: 'Principal AI Systems Scientist',
        pseudo_id: 'EMP_8A34',
        type: 'Privilege Leave (PTO)',
        dates: '2026-12-24 to 2026-12-31',
        days: 6,
        reason: 'Year-end personal recharge and paper submission writeup.',
        appliedDate: '2026-11-02'
      },
      {
        id: 203,
        name: 'Ananya Deshmukh',
        role: 'Enterprise Solutions Architect',
        pseudo_id: 'EMP_3B21',
        type: 'Casual Leave (CL)',
        dates: '2026-11-18',
        days: 1,
        reason: 'Personal errand and municipal registration.',
        appliedDate: '2026-11-05'
      }
    ]
  );

  const { addToast } = useToast();

  const handleApprove = (leave) => {
    setPendingLeaves((prev) => prev.filter((l) => l.id !== leave.id));
    addToast({
      message: `Leave approved for ${leave.name} (${leave.days}d)`,
      type: 'success',
      actionLabel: 'Undo',
      onAction: () => {
        setPendingLeaves((prev) => [leave, ...prev]);
        addToast({ message: `Leave approval reverted for ${leave.name}`, type: 'info' });
      }
    });
  };

  const handleReject = (leave) => {
    setPendingLeaves((prev) => prev.filter((l) => l.id !== leave.id));
    addToast({
      message: `Leave request declined for ${leave.name}`,
      type: 'warning',
      actionLabel: 'Undo',
      onAction: () => {
        setPendingLeaves((prev) => [leave, ...prev]);
        addToast({ message: `Rejection reverted for ${leave.name}`, type: 'info' });
      }
    });
  };

  const handleApproveAll = () => {
    const backup = [...pendingLeaves];
    setPendingLeaves([]);
    addToast({
      message: `Approved all ${backup.length} pending leave requests`,
      type: 'success',
      actionLabel: 'Undo All',
      onAction: () => {
        setPendingLeaves(backup);
        addToast({ message: 'Bulk approval undone', type: 'info' });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
            Direct Report Leave Approvals Inbox
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Review and approve statutory leave requests for Engineering & Platform team members.
          </p>
        </div>

        {pendingLeaves.length > 0 && (
          <Button variant="primary" size="sm" leftIcon={UserCheck} onClick={handleApproveAll}>
            Approve All ({pendingLeaves.length})
          </Button>
        )}
      </div>

      {/* Requests List with Motion Row Collapse */}
      {pendingLeaves.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Inbox Clean — Zero Pending Approvals"
          description="All direct report leave requests have been reviewed and resolved."
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {pendingLeaves.map((leave) => (
              <motion.div
                key={leave.id}
                variants={rowCollapseVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
              >
                <Card className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-base font-semibold text-text-primary">{leave.name}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted border border-border-subtle text-text-secondary">
                        {leave.role}
                      </span>
                      <span className="text-[10.5px] font-mono text-text-muted">({leave.pseudo_id})</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-text-secondary">
                      <span className="text-accent font-semibold">{leave.type}</span>
                      <span>•</span>
                      <span>{leave.dates} ({leave.days} working {leave.days === 1 ? 'day' : 'days'})</span>
                      <span>•</span>
                      <span className="text-text-muted">Applied {leave.appliedDate}</span>
                    </div>

                    <p className="text-xs text-text-primary/90 bg-muted p-2.5 rounded-md border border-border-subtle">
                      "{leave.reason}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={UserX}
                      className="text-status-danger hover:border-status-danger"
                      onClick={() => handleReject(leave)}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={UserCheck}
                      onClick={() => handleApprove(leave)}
                    >
                      Approve
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default LeaveApprovalsPage;
