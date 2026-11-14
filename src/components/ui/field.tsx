import { forwardRef } from "react";
import type {
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

const baseField =
  "w-full rounded-xl border border-line bg-white/[0.03] text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-violet/60 focus:bg-white/[0.05] focus:ring-4 focus:ring-violet/10 disabled:opacity-60";

const floatingLabelStyle = (icon?: ReactNode): CSSProperties =>
  ({ "--field-pl": icon ? "2.5rem" : "0.875rem" }) as CSSProperties;

export function Label({
  children,
  htmlFor,
  hint,
}: {
  children: ReactNode;
  htmlFor?: string;
  hint?: string;
}) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <label htmlFor={htmlFor} className="text-xs font-medium tracking-wide text-slate-300">
        {children}
      </label>
      {hint ? <span className="text-[11px] text-slate-400">{hint}</span> : null}
    </div>
  );
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs font-medium text-rose">{children}</p>;
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, icon, trailing, className, id, placeholder, type, ...props },
  ref,
) {
  const inputId = id ?? props.name;
  const hasLabel = Boolean(label);
  const alwaysFloating = type === "date";

  return (
    <div className="w-full">
      {hasLabel && hint ? (
        <div className="mb-1 flex justify-end">
          <span className="text-[11px] text-slate-400">{hint}</span>
        </div>
      ) : null}
      <div
        className={clsx("relative", hasLabel && "floating-field")}
        data-float={alwaysFloating ? "always" : undefined}
        style={hasLabel ? floatingLabelStyle(icon) : undefined}
      >
        {icon ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder ?? (hasLabel ? " " : undefined)}
          aria-invalid={Boolean(error)}
          className={clsx(
            baseField,
            hasLabel ? "h-14 px-3.5 pb-1.5 pt-5" : "h-11 px-3.5",
            icon && "pl-10",
            trailing && "pr-11",
            error && "border-rose/60 focus:border-rose focus:ring-rose/10",
            className,
          )}
          {...props}
        />
        {hasLabel ? <label htmlFor={inputId}>{label}</label> : null}
        {trailing ? (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</span>
        ) : null}
      </div>
      <FieldError>{error}</FieldError>
    </div>
  );
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, className, id, children, ...props },
  ref,
) {
  const selectId = id ?? props.name;
  const hasLabel = Boolean(label);

  return (
    <div className="w-full">
      {hasLabel && hint ? (
        <div className="mb-1 flex justify-end">
          <span className="text-[11px] text-slate-400">{hint}</span>
        </div>
      ) : null}
      <div
        className={clsx("relative", hasLabel && "floating-field")}
        style={hasLabel ? floatingLabelStyle() : undefined}
      >
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error)}
          className={clsx(
            baseField,
            hasLabel
              ? "h-14 appearance-none px-3.5 pb-1.5 pr-10 pt-5 [&>option]:bg-ink-800 [&>option]:text-slate-100"
              : "h-11 appearance-none px-3.5 pr-10 [&>option]:bg-ink-800 [&>option]:text-slate-100",
            error && "border-rose/60",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        {hasLabel ? <label htmlFor={selectId}>{label}</label> : null}
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      </div>
      <FieldError>{error}</FieldError>
    </div>
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, id, ...props },
  ref,
) {
  const textareaId = id ?? props.name;
  const hasLabel = Boolean(label);

  return (
    <div className="w-full">
      {hasLabel && hint ? (
        <div className="mb-1 flex justify-end">
          <span className="text-[11px] text-slate-400">{hint}</span>
        </div>
      ) : null}
      <div
        className={clsx("relative", hasLabel && "floating-field")}
        style={hasLabel ? floatingLabelStyle() : undefined}
      >
        <textarea
          ref={ref}
          id={textareaId}
          placeholder={props.placeholder ?? (hasLabel ? " " : undefined)}
          aria-invalid={Boolean(error)}
          className={clsx(
            baseField,
            hasLabel
              ? "min-h-[108px] resize-none px-3.5 pb-3 pt-6"
              : "min-h-[92px] resize-none px-3.5 py-3",
            error && "border-rose/60",
            className,
          )}
          {...props}
        />
        {hasLabel ? <label htmlFor={textareaId}>{label}</label> : null}
      </div>
      <FieldError>{error}</FieldError>
    </div>
  );
});
