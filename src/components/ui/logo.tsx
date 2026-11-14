import Link from "next/link";
import clsx from "clsx";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[0.7rem] bg-gradient-to-br from-violet via-[#7c6cf0] to-mint font-display font-extrabold text-ink-950 shadow-[0_8px_24px_-8px_rgba(139,92,246,0.8)]",
        className ?? "h-9 w-9 text-lg",
      )}
      aria-hidden="true"
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.55),transparent_60%)]" />
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="relative size-[58%]"
        aria-hidden="true"
      >
        <path
          d="M5.5 6.5h8.5a3 3 0 0 1 0 5.5H8a3 3 0 0 0 0 5.5h9"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <path
          d="M15.5 14.5l2 2 3.5-4"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Logo({
  href = "/",
  className,
  markClassName,
  showWord = true,
}: {
  href?: string;
  className?: string;
  markClassName?: string;
  showWord?: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx("group inline-flex items-center gap-2.5", className)}
      aria-label="Mcpatenz Bill Tracker home"
    >
      <LogoMark className={markClassName} />
      {showWord ? (
        <span className="font-display text-[1.05rem] font-bold tracking-tight text-white">
          Mcpatenz Bill Tracker
        </span>
      ) : null}
    </Link>
  );
}
