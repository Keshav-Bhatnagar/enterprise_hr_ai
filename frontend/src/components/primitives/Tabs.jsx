import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext(null);

export function Tabs({ defaultValue, value, onValueChange, children, className = '' }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const activeValue = value !== undefined ? value : internalValue;

  const setActiveValue = (val) => {
    if (value === undefined) setInternalValue(val);
    if (onValueChange) onValueChange(val);
  };

  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue }}>
      <div className={`space-y-4 ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center gap-1 p-1 rounded-enterprise bg-muted border border-border-subtle max-w-full overflow-x-auto ${className}`}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, icon: Icon, badge, className = '' }) {
  const { activeValue, setActiveValue } = useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      onClick={() => setActiveValue(value)}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all select-none min-h-[36px] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        isActive
          ? 'bg-surface text-text-primary shadow-subtle font-semibold border border-border-subtle'
          : 'text-text-secondary hover:text-text-primary hover:bg-card-hover border border-transparent'
      } ${className}`}
    >
      {Icon && <Icon className="size-3.5 shrink-0" />}
      <span>{children}</span>
      {badge !== undefined && (
        <span
          className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            isActive ? 'bg-accent/10 text-accent font-bold' : 'bg-surface text-text-muted'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

export function TabsContent({ value, children, className = '' }) {
  const { activeValue } = useContext(TabsContext);
  if (activeValue !== value) return null;

  return (
    <div role="tabpanel" tabIndex={0} className={`focus-visible:outline-none ${className}`}>
      {children}
    </div>
  );
}

export default Tabs;
