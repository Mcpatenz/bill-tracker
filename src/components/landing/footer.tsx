import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-line bg-ink-950">
      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              A calm, private bill tracker with automatic email reminders. Built for every screen
              you actually use.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-[11px] text-slate-400">
              <span className="size-1.5 rounded-full bg-mint shadow-[0_0_8px_1px_rgba(45,212,167,0.6)]" />
              All systems operational
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Product
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>
                <a href="#features" className="transition hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#insights" className="transition hover:text-white">
                  Insights
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="transition hover:text-white">
                  How it works
                </a>
              </li>
              <li>
                <a href="#faq" className="transition hover:text-white">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Account
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/login" className="transition hover:text-white">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition hover:text-white">
                  Create account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition hover:text-white">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings" className="transition hover:text-white">
                  Reminder settings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Reminders
            </p>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
              <li>Email delivery</li>
              <li>Overdue alerts</li>
              <li>Recurring bills</li>
              <li>Multi-device sync</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-slate-400 sm:flex-row">
          <p>© {year} Mcpatenz Bill Tracker. Track bills, not stress.</p>
          <p className="flex items-center gap-2">
            <span>Next.js</span>
            <span className="text-slate-800">·</span>
            <span>Prisma</span>
            <span className="text-slate-800">·</span>
            <span>Three.js</span>
            <span className="text-slate-800">·</span>
            <span>Tailwind CSS</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
