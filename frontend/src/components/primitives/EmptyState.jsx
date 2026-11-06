import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no active items matching your current filters.',
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-enterprise bg-card border border-border-subtle shadow-card ${className}`}
    >
      <div className="p-3.5 rounded-full bg-muted text-text-muted mb-4 border border-border-subtle">
        <Icon className="size-6 sm:size-7" />
      </div>
      <h4 className="text-base font-semibold text-text-primary">{title}</h4>
      <p className="mt-1 text-sm text-text-secondary max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;

