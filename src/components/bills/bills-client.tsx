"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, Pencil, ReceiptText, Search, Trash2 } from "lucide-react";
import type { DashboardBill } from "@/lib/dashboard";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { BillFormModal } from "@/components/bills/bill-form";
import { QuickAdd } from "@/components/bills/quick-add";
import { CATEGORIES, categoryMeta } from "@/lib/constants";
import { RECURRENCE_OPTIONS } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";

type Status = "ALL" | "UPCOMING" | "OVERDUE" | "PAID";
type Sort = "DUE" | "AMOUNT" | "NAME";

const statusTabs: { value: Status; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "UPCOMING", label: "Upcoming" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "PAID", label: "Paid" },
];

function dueClass(days: number): string {
  if (days < 0) return "bg-rose/10 text-rose";
  if (days === 0) return "bg-amber/10 text-amber";
  if (days <= 7) return "bg-sky/10 text-sky";
  return "bg-white/[0.05] text-slate-400";
}

function dueLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function BillsInner({
  bills,
  currency,
  defaultLeadDays,
}: {
  bills: DashboardBill[];
  currency: string;
  defaultLeadDays: number;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("ALL");
  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState<Sort>("DUE");

  const [editing, setEditing] = useState<DashboardBill | null>(null);
  const [deleting, setDeleting] = useState<DashboardBill | null>(null);
  const [removing, setRemoving] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);

  const counts = useMemo(() => {
    const active = bills.filter((bill) => !bill.isPaid);
    return {
      active: active.length,
      overdue: active.filter((bill) => bill.daysLeft < 0).length,
      paid: bills.filter((bill) => bill.isPaid).length,
      due: active.reduce((sum, bill) => sum + bill.amount, 0),
    };
  }, [bills]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = bills.filter((bill) => {
      if (needle && !bill.name.toLowerCase().includes(needle)) return false;
      if (category !== "ALL" && bill.category !== category) return false;
      if (status === "UPCOMING" && bill.isPaid) return false;
      if (status === "OVERDUE" && (bill.isPaid || bill.daysLeft >= 0)) return false;
      if (status === "PAID" && !bill.isPaid) return false;
      return true;
    });

    return result.sort((a, b) => {
      if (sort === "AMOUNT") return b.amount - a.amount;
      if (sort === "NAME") return a.name.localeCompare(b.name);
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [bills, query, category, status, sort]);

  async function markPaid(bill: DashboardBill) {
    setPaying(bill.id);
    try {
      const response = await fetch(`/api/bills/${bill.id}/pay`, { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast({ title: "Could not record payment", description: data.error, variant: "error" });
        return;
      }
      toast({
        title: "Payment recorded",
        description: data.rolledTo ? "Next cycle scheduled automatically." : `${bill.name} is paid.`,
      });
      router.refresh();
    } catch {
      toast({ title: "Network error", description: "Please try again.", variant: "error" });
    } finally {
      setPaying(null);
    }
  }

  async function remove() {
    if (!deleting) return;
    setRemoving(true);
    try {
      const response = await fetch(`/api/bills/${deleting.id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast({ title: "Could not delete bill", description: data.error, variant: "error" });
        return;
      }
      toast({ title: "Bill deleted", description: `${deleting.name} has been removed.` });
      setDeleting(null);
      router.refresh();
    } catch {
      toast({ title: "Network error", description: "Please try again.", variant: "error" });
    } finally {
      setRemoving(false);
    }
  }

  const filtersActive = query !== "" || status !== "ALL" || category !== "ALL";

  function clearFilters() {
    setQuery("");
    setStatus("ALL");
    setCategory("ALL");
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-[1.6rem] font-bold tracking-tight text-white sm:text-3xl">
            Bills
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {counts.active} active · {counts.overdue} overdue ·{" "}
            {formatCurrency(counts.due, currency)} outstanding
          </p>
        </div>
        <QuickAdd currency={currency} defaultLeadDays={defaultLeadDays} />
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {[
          { label: "Active bills", value: counts.active, tone: "text-white" },
          { label: "Overdue", value: counts.overdue, tone: "text-rose" },
          { label: "Paid", value: counts.paid, tone: "text-mint" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-line bg-white/[0.03] px-3.5 py-3"
          >
            <p className="text-[10px] uppercase tracking-wide text-slate-400">{stat.label}</p>
            <p className={`mt-1 font-display text-xl font-bold ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-white/[0.03] p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="lg:w-64">
            <Input
              name="search"
              placeholder="Search bills…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              icon={<Search className="size-4" />}
              aria-label="Search bills"
            />
          </div>

          <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto rounded-xl border border-line bg-white/[0.02] p-1 lg:mx-0">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatus(tab.value)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  status === tab.value
                    ? "bg-violet/20 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 lg:ml-auto">
            <Select
              name="categoryFilter"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              aria-label="Filter by category"
              className="min-w-[130px]"
            >
              <option value="ALL">All categories</option>
              {CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </Select>
            <Select
              name="sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
              aria-label="Sort bills"
              className="min-w-[120px]"
            >
              <option value="DUE">Due date</option>
              <option value="AMOUNT">Amount</option>
              <option value="NAME">Name</option>
            </Select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-16 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-400">
            <ReceiptText className="size-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-white">
            {bills.length === 0 ? "No bills yet" : "No bills match your filters"}
          </p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-400">
            {bills.length === 0
              ? "Add rent, utilities, subscriptions or any one-time payment to get started."
              : "Try a different search term or clear the filters."}
          </p>
          {filtersActive ? (
            <Button variant="secondary" size="sm" className="mt-4" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {filtered.map((bill) => {
              const meta = categoryMeta(bill.category);
              const recurrence = RECURRENCE_OPTIONS.find(
                (option) => option.value === bill.recurrence,
              );
              return (
                <motion.li
                  key={bill.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="group rounded-2xl border border-line bg-white/[0.025] p-3.5 transition-colors hover:border-line-strong hover:bg-white/[0.04] sm:p-4"
                >
                  <div className="flex items-center gap-3">
                    <CategoryIcon category={bill.category} className="size-4.5" />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="truncate text-sm font-medium text-white">{bill.name}</p>
                        <span
                          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-medium text-slate-200"
                          style={{ backgroundColor: `${meta.color}18` }}
                        >
                          <span
                            className="size-1 rounded-full"
                            style={{ backgroundColor: meta.color }}
                          />
                          {meta.label}
                        </span>
                        {bill.recurrence !== "ONCE" ? (
                          <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
                            {recurrence?.label}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                        {bill.isPaid ? (
                          <span className="inline-flex rounded-md bg-mint/10 px-1.5 py-0.5 text-[10px] font-medium text-mint">
                            Paid
                          </span>
                        ) : (
                          <span
                            className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium ${dueClass(bill.daysLeft)}`}
                          >
                            {dueLabel(bill.daysLeft)}
                          </span>
                        )}
                        <span>
                          {new Date(bill.dueDate).toLocaleDateString("en-US", {
                            timeZone: "UTC",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        {bill.notes ? (
                          <span className="hidden max-w-[240px] truncate sm:inline">
                            · {bill.notes}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                      <span className="mr-1 text-sm font-semibold text-slate-100">
                        {formatCurrency(bill.amount, currency)}
                      </span>
                      {!bill.isPaid ? (
                        <button
                          type="button"
                          onClick={() => markPaid(bill)}
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
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setEditing(bill)}
                        aria-label={`Edit ${bill.name}`}
                        title="Edit"
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-line bg-white/[0.03] text-slate-400 transition hover:border-line-strong hover:text-white"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(bill)}
                        aria-label={`Delete ${bill.name}`}
                        title="Delete"
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-line bg-white/[0.03] text-slate-400 transition hover:border-rose/40 hover:bg-rose/10 hover:text-rose"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <BillFormModal
        open={editing !== null}
        onClose={() => setEditing(null)}
        bill={editing}
        currency={currency}
        defaultLeadDays={defaultLeadDays}
      />

      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title="Delete this bill?"
        description={
          deleting
            ? `“${deleting.name}” and its reminder schedule will be removed. Past payments stay in your history.`
            : undefined
        }
        size="sm"
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setDeleting(null)} disabled={removing}>
            Cancel
          </Button>
          <Button variant="danger" onClick={remove} loading={removing}>
            <Trash2 className="size-4" />
            Delete bill
          </Button>
        </div>
      </Modal>

    </div>
  );
}

export function BillsClient({
  bills,
  currency,
  defaultLeadDays,
}: {
  bills: DashboardBill[];
  currency: string;
  defaultLeadDays: number;
}) {
  return <BillsInner bills={bills} currency={currency} defaultLeadDays={defaultLeadDays} />;
}
