import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ShieldCheck, Clock, XCircle } from 'lucide-react';

export function RiskBadge({ status = 'LOW', label, size = 'sm', className = '' }) {
  const normalized = String(status).toUpperCase();

  const configs = {
    CRITICAL: {
      style: 'bg-status-danger-bg text-status-danger border-status-danger-border',
      icon: AlertCircle,
      defaultLabel: 'Critical Flight Risk'
    },
    HIGH: {
      style: 'bg-status-danger-bg text-status-danger border-status-danger-border',
      icon: AlertTriangle,
      defaultLabel: 'High Risk'
    },
    MEDIUM: {
      style: 'bg-status-warning-bg text-status-warning border-status-warning-border',
      icon: AlertTriangle,
      defaultLabel: 'Medium Risk'
    },
    LOW: {
      style: 'bg-status-success-bg text-status-success border-status-success-border',
      icon: CheckCircle2,
      defaultLabel: 'Stable / Low Risk'
    },
    STABLE: {
      style: 'bg-status-success-bg text-status-success border-status-success-border',
      icon: CheckCircle2,
      defaultLabel: 'Stable'
    },
    APPROVED: {
      style: 'bg-status-success-bg text-status-success border-status-success-border',
      icon: CheckCircle2,
      defaultLabel: 'Approved'
    },
    PERMITTED: {
      style: 'bg-status-success-bg text-status-success border-status-success-border',
      icon: ShieldCheck,
      defaultLabel: 'Permitted'
    },
    PENDING: {
      style: 'bg-status-warning-bg text-status-warning border-status-warning-border',
      icon: Clock,
      defaultLabel: 'Pending'
    },
    REJECTED: {
      style: 'bg-status-danger-bg text-status-danger border-status-danger-border',
      icon: XCircle,
      defaultLabel: 'Rejected'
    },
    DENIED: {
      style: 'bg-status-danger-bg text-status-danger border-status-danger-border',
      icon: XCircle,
      defaultLabel: 'Denied'
    }
  };

  const config = configs[normalized] || {
    style: 'bg-muted text-text-secondary border-border-subtle',
    icon: AlertCircle,
    defaultLabel: normalized
  };

  const Icon = config.icon;
  const text = label || config.defaultLabel;

  const sizeClasses =
    size === 'xs'
      ? 'text-[10px] px-1.5 py-0.5 gap-1'
      : size === 'md'
      ? 'text-xs px-2.5 py-1 gap-1.5'
      : 'text-[11px] px-2 py-0.5 gap-1';

  return (
    <span
      className={`inline-flex items-center font-mono font-medium rounded-md border select-none ${sizeClasses} ${config.style} ${className}`}
    >
      <Icon className="size-3 shrink-0" />
      <span>{text}</span>
    </span>
  );
}

export default RiskBadge;
