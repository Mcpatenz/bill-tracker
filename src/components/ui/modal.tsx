"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
};

const widths = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, description, children, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 cursor-default bg-ink-950/70 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.9 }}
            className={`glass-card relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border-line-strong p-6 sm:rounded-3xl sm:p-7 ${widths[size]}`}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                {title ? (
                  <h2 className="font-display text-lg font-semibold tracking-tight text-white">
                    {title}
                  </h2>
                ) : null}
                {description ? (
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{description}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-1 -mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
              >
                <X className="size-4.5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
