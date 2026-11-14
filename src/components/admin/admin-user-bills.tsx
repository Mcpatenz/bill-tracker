"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReceiptText, Repeat, Trash2 } from "lucide-react";
import type { DashboardBill } from "@/lib/dashboard";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";
import { formatDate, RECURRENCE_OPTIONS } from "@/lib/dates";

function dueLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function recurrenceLabel(value: string): string {
  return RECURRENCE_OPTIONS.find((option) => option.value === value)?.label ?? "One-time";
}

export function AdminUserBills({
  userId,
  bills,
  currency,
}: {
  userId: string;
  bills: DashboardBill[];
  currency: string;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [deleting, setDeleting] = useState<DashboardBill | null>(null);
  const [removing, setRemoving] = useState(false);

  async function removeBill() {
    if (!deleting) return;
    setRemoving(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/bills/${deleting.id}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast({
          title: "Could not delete bill",
          description: data.error ?? "Please try again.",
          variant: "error",
        });
        return;
      }

      toast({
        title: "Bill deleted",
        description: `${deleting.name} has been removed from this user's account.`,
      });
      setDeleting(null);
      router.refresh();
    } catch {
      toast({ title: "Network error", description: "Please try again.", variant: "error" });
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white/[0.03]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
        <div>
          <h2 className="font-display text-sm font-semibold text-white">Bills</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {bills.length} bill{bills.length === 1 ? "" : "s"} on this account
          </p>
        </div>
      </div>

      {bills.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-white/[0.04] text-slate-400">
            <ReceiptText className="size-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-white">No bills yet</p>
          <p className="mt-1 max-w-xs text-xs text-slate-400">
            This user has not added any bills to their account.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line/70">
          {bills.map((bill) => (
            <li
              key={bill.id}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02] sm:px-5"
            >
              <CategoryIcon category={bill.category} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate text-sm font-medium text-white">{bill.name}</p>
                  {bill.recurrence !== "ONCE" ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
                      <Repeat className="size-2.5" />
                      {recurrenceLabel(bill.recurrence)}
                    </span>
                  ) : null}
                  {bill.isPaid ? (
                    <span className="rounded-md bg-mint/10 px-1.5 py-0.5 text-[9px] font-semibold text-mint">
                      Paid
                    </span>
                  ) : bill.daysLeft < 0 ? (
                    <span className="rounded-md bg-rose/10 px-1.5 py-0.5 text-[9px] font-semibold text-rose">
                      Overdue
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {bill.isPaid ? "Paid" : dueLabel(bill.daysLeft)} · due {formatDate(bill.dueDate)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                <span className="text-sm font-semibold text-slate-100">
                  {formatCurrency(bill.amount, currency)}
                </span>
                <button
                  type="button"
                  onClick={() => setDeleting(bill)}
                  aria-label={`Delete ${bill.name}`}
                  title="Delete bill"
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-rose/25 bg-rose/10 text-rose transition hover:border-rose/45 hover:bg-rose/20"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={Boolean(deleting)}
        onClose={() => (removing ? undefined : setDeleting(null))}
        title="Delete this bill?"
        description={
          deleting
            ? `This permanently removes ${deleting.name} and any linked reminders. This cannot be undone.`
            : undefined
        }
        size="sm"
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setDeleting(null)}
            disabled={removing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={removeBill}
            loading={removing}
            iconLeft={<Trash2 className="size-3.5" />}
          >
            Delete bill
          </Button>
        </div>
      </Modal>
    </div>
  );
}
