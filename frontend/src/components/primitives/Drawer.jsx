import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { drawerVariants, backdropVariants } from '../../utils/motion';

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'max-w-lg'
}) {
  const drawerRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.aside
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className={`relative z-10 w-full ${width} bg-surface text-text-primary shadow-drawer border-l border-border-subtle flex flex-col h-full`}
          >
            {/* Header */}
            <div className="p-5 border-b border-border-subtle flex items-start justify-between gap-4">
              <div>
                <h2 id="drawer-title" className="text-base sm:text-lg font-semibold text-text-primary tracking-tight">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-xs text-text-secondary mt-0.5 font-mono leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close drawer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {children}
            </div>

            {/* Optional Footer */}
            {footer && (
              <div className="p-4 border-t border-border-subtle bg-muted/40 flex items-center justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Drawer;
