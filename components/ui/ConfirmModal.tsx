'use client';

import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ConfirmOptions {
  title:       string;
  description: string;
  confirmLabel?: string;
  danger?:      boolean;
}

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

// ── Context ───────────────────────────────────────────────────────────────────
const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    open:    boolean;
    opts:    ConfirmOptions;
    resolve: (v: boolean) => void;
  } | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setState({ open: true, opts, resolve });
    });
  }, []);

  function handle(value: boolean) {
    state?.resolve(value);
    setState(null);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {state?.open && (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => handle(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => handle(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <div className={`mb-4 inline-flex rounded-xl p-3 ${state.opts.danger ? 'bg-red-50' : 'bg-amber-50'}`}>
              <AlertTriangle size={20} className={state.opts.danger ? 'text-red-500' : 'text-amber-500'} />
            </div>

            <h3 className="text-base font-semibold text-gray-900 mb-1">{state.opts.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{state.opts.description}</p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => handle(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handle(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                  state.opts.danger
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-sky-500 hover:bg-sky-600'
                }`}
              >
                {state.opts.confirmLabel ?? 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
