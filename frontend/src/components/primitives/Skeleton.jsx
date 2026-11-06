import React from 'react';

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted border border-border-subtle ${className}`}
      {...props}
    />
  );
}

export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div
      className={`bg-card rounded-enterprise border border-border-subtle p-5 shadow-card space-y-3 ${className}`}
    >
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-3 pb-2 border-b border-border-subtle">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3 py-3 border-b border-border-subtle">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;

