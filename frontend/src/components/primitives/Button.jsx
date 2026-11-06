import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    isLoading = false,
    disabled = false,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-enterprise transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-accent text-accent-fg hover:bg-accent-hover shadow-subtle border border-transparent',
    secondary: 'bg-muted text-text-primary hover:bg-card-hover border border-border-subtle shadow-subtle',
    outline: 'bg-surface text-text-primary hover:bg-muted border border-border-strong',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-muted border border-transparent',
    danger: 'bg-status-danger text-white hover:opacity-90 shadow-subtle border border-transparent'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-2 min-h-[40px] gap-2',
    lg: 'text-base px-5 py-2.5 min-h-[44px] gap-2.5'
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin shrink-0" />
      ) : LeftIcon ? (
        <LeftIcon className="size-4 shrink-0" />
      ) : null}
      <span>{children}</span>
      {!isLoading && RightIcon ? <RightIcon className="size-4 shrink-0" /> : null}
    </button>
  );
});

export default Button;
