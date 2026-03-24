'use client';

import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id:      string;
  type:    ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ── Icons & styles per type ───────────────────────────────────────────────────
const CONFIG: Record<ToastType, { icon: typeof CheckCircle2; bar: string; icon_cls: string }> = {
  success: { icon: CheckCircle2, bar: 'bg-emerald-500', icon_cls: 'text-emerald-500' },
  error:   { icon: XCircle,      bar: 'bg-red-500',     icon_cls: 'text-red-500'     },
  info:    { icon: AlertCircle,  bar: 'bg-sky-500',     icon_cls: 'text-sky-500'     },
};

// ── Provider ──────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  function dismiss(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast stack */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2.5rem)]">
        {toasts.map(({ id, type, message }) => {
          const { icon: Icon, bar, icon_cls } = CONFIG[type];
          return (
            <div
              key={id}
              className="relative flex items-start gap-3 rounded-xl bg-white border border-gray-200 shadow-lg px-4 py-3 overflow-hidden animate-in slide-in-from-right-4 fade-in duration-200"
            >
              {/* Left color bar */}
              <div className={`absolute left-0 inset-y-0 w-1 ${bar} rounded-l-xl`} />
              <Icon size={18} className={`shrink-0 mt-0.5 ${icon_cls}`} />
              <p className="flex-1 text-sm text-gray-700 leading-snug">{message}</p>
              <button onClick={() => dismiss(id)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
