"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDays } from "date-fns";
import { Modal } from "@/components/ui/modal";
import { Input, Select, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CATEGORIES } from "@/lib/constants";
import { RECURRENCE_OPTIONS, toDateInput } from "@/lib/dates";
import type { DashboardBill } from "@/lib/dashboard";

type FormState = {
  name: string;
  amount: string;
  category: string;
  dueDate: string;
  recurrence: string;
  notes: string;
  reminderDaysBefore: string;
};

function blankForm(defaultLeadDays = 3): FormState {
  return {
    name: "",
    amount: "",
    category: "HOUSING",
    dueDate: toDateInput(addDays(new Date(), 7)),
    recurrence: "MONTHLY",
    notes: "",
    reminderDaysBefore: String(defaultLeadDays),
  };
}

function BillFormFields({
  onClose,
  bill,
  currency,
  defaultLeadDays,
}: {
  onClose: () => void;
  bill?: DashboardBill | null;
  currency: string;
  defaultLeadDays: number;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(() =>
    bill
      ? {
          name: bill.name,
          amount: String(bill.amount),
          category: bill.category,
          dueDate: bill.dueDate.slice(0, 10),
          recurrence: bill.recurrence,
          notes: bill.notes ?? "",
          reminderDaysBefore: String(bill.reminderDaysBefore),
        }
      : blankForm(defaultLeadDays),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const amount = Number(form.amount);

    if (!form.name.trim()) nextErrors.name = "Give your bill a name";
    if (!form.amount || !Number.isFinite(amount) || amount <= 0) {
      nextErrors.amount = "Enter an amount greater than zero";
    }
    if (!form.dueDate) nextErrors.dueDate = "Choose a due date";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        amount,
        category: form.category,
        dueDate: form.dueDate,
        recurrence: form.recurrence,
        notes: form.notes.trim() || null,
        reminderDaysBefore: Number(form.reminderDaysBefore),
      };

      const response = await fetch(bill ? `/api/bills/${bill.id}` : "/api/bills", {
        method: bill ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrors(data.fieldErrors ?? {});
        toast({
          title: bill ? "Could not update bill" : "Could not add bill",
          description: data.error ?? "Please check the form and try again.",
          variant: "error",
        });
        return;
      }

      toast({
        title: bill ? "Bill updated" : "Bill added",
        description: bill
          ? "Your changes are saved."
          : "We will remind you before the due date.",
      });
      onClose();
      router.refresh();
    } catch {
      toast({
        title: "Network error",
        description: "Check your connection and try again.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Input
          name="name"
          label="Bill name"
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          error={errors.name}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="amount"
            label={`Amount (${currency})`}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={form.amount}
            onChange={(event) => update("amount", event.target.value)}
            error={errors.amount}
            required
          />
          <Input
            name="dueDate"
            label="Due date"
            type="date"
            value={form.dueDate}
            onChange={(event) => update("dueDate", event.target.value)}
            error={errors.dueDate}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            name="category"
            label="Category"
            value={form.category}
            onChange={(event) => update("category", event.target.value)}
          >
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Select>
          <Select
            name="recurrence"
            label="Repeats"
            value={form.recurrence}
            onChange={(event) => update("recurrence", event.target.value)}
          >
            {RECURRENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <Select
          name="reminderDaysBefore"
          label="Remind me"
          hint="Per-bill override"
          value={form.reminderDaysBefore}
          onChange={(event) => update("reminderDaysBefore", event.target.value)}
        >
          {[0, 1, 2, 3, 5, 7, 10, 14].map((days) => (
            <option key={days} value={days}>
              {days === 0 ? "On the due date" : `${days} day${days === 1 ? "" : "s"} before due`}
            </option>
          ))}
        </Select>

        <Textarea
          name="notes"
          label="Notes"
          hint="Optional"
          placeholder="Account number, payment link, anything useful…"
          value={form.notes}
          onChange={(event) => update("notes", event.target.value)}
          error={errors.notes}
        />

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {bill ? "Save changes" : "Add bill"}
          </Button>
        </div>
    </form>
  );
}

export function BillFormModal({
  open,
  onClose,
  bill,
  currency = "PHP",
  defaultLeadDays = 3,
}: {
  open: boolean;
  onClose: () => void;
  bill?: DashboardBill | null;
  currency?: string;
  defaultLeadDays?: number;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={bill ? "Edit bill" : "Add a bill"}
      description={
        bill
          ? "Update the details below. Changes apply to future reminders."
          : "A few details now keeps every future reminder on time."
      }
    >
      <BillFormFields
        key={bill?.id ?? "new"}
        onClose={onClose}
        bill={bill}
        currency={currency}
        defaultLeadDays={defaultLeadDays}
      />
    </Modal>
  );
}
