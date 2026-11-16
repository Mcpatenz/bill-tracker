"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { CURRENCIES } from "@/lib/constants";

type EditableProfile = {
  id: string;
  name: string;
  avatar: string | null;
  notifyEmail: string | null;
  currency: string;
  leadDays: number;
};

export function AdminUserProfileForm({ user }: { user: EditableProfile }) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState(user.name);
  const [notifyEmail, setNotifyEmail] = useState(user.notifyEmail ?? "");
  const [currency, setCurrency] = useState(user.currency);
  const [leadDays, setLeadDays] = useState(String(user.leadDays));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          avatar: user.avatar,
          notifyEmail: notifyEmail.trim() || null,
          currency,
          leadDays: Number(leadDays),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrors(data.fieldErrors ?? {});
        toast({ title: "Could not update user", description: data.error ?? "Please try again.", variant: "error" });
        return;
      }
      toast({ title: "User updated", description: "Profile and reminder preferences have been saved." });
      router.refresh();
    } catch {
      toast({ title: "Network error", description: "Please try again.", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={saveProfile} className="space-y-4 rounded-2xl border border-line bg-white/[0.03] p-4">
      <div>
        <h3 className="font-display text-sm font-semibold text-white">Edit account details</h3>
        <p className="mt-1 text-[11px] text-slate-400">Update profile and reminder preferences. Sign-in email and admin role are not editable here.</p>
      </div>
      <Input name="name" label="Full name" value={name} onChange={(event) => setName(event.target.value)} error={errors.name} autoComplete="off" />
      <Input name="notifyEmail" label="Reminder email" type="email" value={notifyEmail} onChange={(event) => setNotifyEmail(event.target.value)} error={errors.notifyEmail} placeholder="Same as sign-in email" autoComplete="off" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="currency" label="Currency" value={currency} onChange={(event) => setCurrency(event.target.value)}>
          {CURRENCIES.map((code) => <option key={code} value={code}>{code}</option>)}
        </Select>
        <Select name="leadDays" label="Reminder lead time" value={leadDays} onChange={(event) => setLeadDays(event.target.value)}>
          {[0, 1, 2, 3, 5, 7, 10, 14].map((days) => <option key={days} value={days}>{days === 0 ? "Due date" : `${days} days before`}</option>)}
        </Select>
      </div>
      <div className="flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-[11px] text-slate-400"><Check className="size-3.5 text-mint" />Role and sign-in email are not changed here.</p>
        <Button type="submit" size="sm" loading={saving} iconLeft={<Save className="size-3.5" />}>Save account</Button>
      </div>
    </form>
  );
}
