import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, RotateCcw } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(
    ({ message, type = 'info', actionLabel, onAction, duration = 4500 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 6);
      const newToast = { id, message, type, actionLabel, onAction };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto p-3.5 rounded-enterprise bg-surface text-text-primary border border-border-strong shadow-drawer flex items-center justify-between gap-3 text-xs font-mono animate-in slide-in-from-bottom-2 duration-200"
          >
            <div className="flex items-center gap-2 min-w-0">
              {toast.type === 'success' && <CheckCircle2 className="size-4 text-status-success shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="size-4 text-status-warning shrink-0" />}
              {toast.type === 'danger' && <AlertCircle className="size-4 text-status-danger shrink-0" />}
              {toast.type === 'info' && <Info className="size-4 text-status-info shrink-0" />}
              <span className="truncate">{toast.message}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {toast.actionLabel && toast.onAction && (
                <button
                  type="button"
                  onClick={() => {
                    toast.onAction();
                    removeToast(toast.id);
                  }}
                  className="px-2 py-1 rounded bg-muted hover:bg-card-hover text-accent font-bold text-[11px] border border-border-subtle flex items-center gap-1 transition"
                >
                  <RotateCcw className="size-3" />
                  <span>{toast.actionLabel}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-text-muted hover:text-text-primary p-1 rounded"
                aria-label="Dismiss toast"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;

