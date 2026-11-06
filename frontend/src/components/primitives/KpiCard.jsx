import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function KpiCard({
  title,
  value,
  trend,
  trendLabel,
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral' | 'danger'
  subtext,
  icon: Icon,
  className = '',
  onClick
}) {
  const trendStyles = {
    positive: 'text-status-success bg-status-success-bg border-status-success-border',
    negative: 'text-status-danger bg-status-danger-bg border-status-danger-border',
    danger: 'text-status-danger bg-status-danger-bg border-status-danger-border',
    warning: 'text-status-warning bg-status-warning-bg border-status-warning-border',
    neutral: 'text-text-secondary bg-muted border-border-subtle'
  };

  const TrendIcon =
    trendType === 'positive'
      ? TrendingUp
      : trendType === 'negative' || trendType === 'danger'
      ? TrendingDown
      : Minus;

  return (
    <div
      onClick={onClick}
      className={`bg-card rounded-enterprise border border-border-subtle p-5 shadow-card transition-all ${
        onClick ? 'cursor-pointer hover:border-border-strong hover:shadow-subtle' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-muted text-accent border border-border-subtle">
            <Icon className="size-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-3">
        <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-text-primary tabular-nums">
          {value}
        </span>

        {trend && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
              trendStyles[trendType] || trendStyles.neutral
            }`}
          >
            <TrendIcon className="size-3" />
            <span>{trend}</span>
          </span>
        )}
      </div>

      {(trendLabel || subtext) && (
        <div className="mt-2 text-xs text-text-muted flex items-center gap-1.5 truncate">
          {trendLabel && <span className="font-medium text-text-secondary">{trendLabel}</span>}
          {trendLabel && subtext && <span>•</span>}
          {subtext && <span>{subtext}</span>}
        </div>
      )}
    </div>
  );
}

export default KpiCard;
