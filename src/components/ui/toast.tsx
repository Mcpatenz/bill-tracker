"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type Variant = "success" | "error" | "info";

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  variant: Variant;
};

type ToastInput = {
  title: string;
  description?: string;
  variant?: Variant;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const icons: Record<Variant, ReactNode> = {
  success: <CheckCircle2 className="size-5 text-mint" />,
  error: <AlertTriangle className="size-5 text-rose" />,
  info: <Info className="size-5 text-sky" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "success" }: ToastInput) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [...current.slice(-3), { id, title, description, variant }]);
      window.setTimeout(() => dismiss(id), 4800);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-24 left-4 right-4 z-[100] flex flex-col gap-2.5 sm:left-auto sm:right-5 sm:w-[380px] lg:bottom-6"
      >
        <AnimatePresence initial={false}>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="glass-card pointer-events-auto flex items-start gap-3 rounded-2xl border-line-strong p-3.5"
            >
              <span className="mt-0.5">{icons[item.variant]}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{item.title}</p>
                {item.description ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                    {item.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Dismiss notification"
                className="rounded-md p-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
