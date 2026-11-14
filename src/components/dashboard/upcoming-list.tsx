"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Loader2, ReceiptText, Repeat } from "lucide-react";
import type { DashboardBill } from "@/lib/dashboard";
import { CategoryIcon } from "@/components/ui/category-icon";
import { formatCurrency } from "@/lib/format";
import { RECURRENCE_OPTIONS } from "@/lib/dates";
import { useToast } from "@/components/ui/toast";

function dueLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function dueClass(days: number): string {
  if (days < 0) return "bg-rose/10 text-rose";
  if (days === 0) return "bg-amber/10 text-amber";
  if (days <= 7) return "bg-sky/10 text-sky";
  return "bg-white/[0.05] text-slate-400";
}

function recurrenceLabel(value: string): string {
  return RECURRENCE_OPTIONS.find((option) => option.value === value)?.label ?? "One-time";
}

export function UpcomingList({
  bills,
  currency,
}: {
  bills: DashboardBill[];
  currency: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [paying, setPaying] = useState<string | null>(null);

  async function markPaid(id: string) {
    setPaying(id);
    try {
      const response = await fetch(`/api/bills/${id}/pay`, { method: "POST" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast({
          title: "Could not record payment",
          description: data.error ?? "Please try again.",
          variant: "error",
        });
        return;
      }

      toast({
        title: "Payment recorded",
        description: data.rolledTo
          ? "The next cycle has been scheduled automatically."
          : "This bill is now marked as paid.",
      });
      router.refresh();
    } catch {
      toast({
        title: "Network error",
        description: "Check your connection and try again.",
        variant: "error",
      });
    } finally {
      setPaying(null);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white/[0.03]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
        <div>
          <h2 className="font-display text-sm font-semibold text-white">Upcoming bills</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {bills.length} active · sorted by due date
          </p>
        </div>
        <Link
          href="/dashboard/bills"
          className="group inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 transition hover:text-white"
        >
          View all
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {bills.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-mint/10 text-mint">
            <ReceiptText className="size-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-white">No active bills</p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-400">
            Add a bill and Mcpatenz Bill Tracker will start tracking due dates and sending reminders.
          </p>
          <Link
            href="/dashboard/bills"
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet to-[#6d4df0] px-3.5 text-xs font-semibold text-white transition hover:brightness-110"
          >
            Add your first bill
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-line/70">
          {bills.map((bill) => (
            <li
              key={bill.id}
              className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02] sm:px-5"
            >
              <CategoryIcon category={bill.category} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-white">{bill.name}</p>
                  {bill.recurrence !== "ONCE" ? (
                    <span className="hidden items-center gap-1 rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-slate-400 sm:inline-flex">
                      <Repeat className="size-2.5" />
                      {recurrenceLabel(bill.recurrence)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                  <span
                    className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium ${dueClass(bill.daysLeft)}`}
                  >
                    {dueLabel(bill.daysLeft)}
                  </span>
                  <span className="hidden truncate sm:inline">
                    {new Date(bill.dueDate).toLocaleDateString("en-US", {
                      timeZone: "UTC",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                <span className="text-sm font-semibold text-slate-100">
                  {formatCurrency(bill.amount, currency)}
                </span>
                <button
                  type="button"
                  onClick={() => markPaid(bill.id)}
                  disabled={paying === bill.id}
                  aria-label={`Mark ${bill.name} as paid`}
                  title="Mark as paid"
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-mint/25 bg-mint/10 text-mint transition hover:border-mint/50 hover:bg-mint/20 disabled:opacity-50"
                >
                  {paying === bill.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Check className="size-3.5" />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
