import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "mint";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-violet to-[#6d4df0] text-white shadow-[0_14px_34px_-14px_rgba(139,92,246,0.9)] hover:brightness-110 hover:shadow-[0_18px_44px_-14px_rgba(139,92,246,1)]",
  secondary:
    "border border-line bg-white/[0.04] text-slate-100 hover:border-line-strong hover:bg-white/[0.08]",
  ghost: "text-slate-300 hover:bg-white/[0.06] hover:text-white",
  danger:
    "border border-rose/30 bg-rose/10 text-rose hover:border-rose/50 hover:bg-rose/20",
  mint: "bg-mint text-ink-950 shadow-[0_14px_34px_-16px_rgba(45,212,167,0.9)] hover:brightness-105",
};

const sizes: Record<Size, string> = {
  sm: "h-9 gap-1.5 rounded-lg px-3 text-xs",
  md: "h-11 gap-2 rounded-xl px-4.5 text-sm",
  lg: "h-12 gap-2 rounded-xl px-6 text-sm",
  icon: "h-10 w-10 rounded-xl",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    iconLeft,
    iconRight,
    className,
    children,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex select-none items-center justify-center font-semibold outline-none transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : iconLeft}
      {children}
      {!loading && iconRight}
    </button>
  );
});
