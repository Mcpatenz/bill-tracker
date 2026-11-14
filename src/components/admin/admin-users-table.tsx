"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ReceiptText,
  Search,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import type { AdminUserSummary } from "@/lib/admin";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/format";
import { formatDate } from "@/lib/dates";

export function AdminUsersTable({
  users,
  currentUserId,
}: {
  users: AdminUserSummary[];
  currentUserId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<AdminUserSummary | null>(null);
  const [removing, setRemoving] = useState(false);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(needle) ||
        user.email.toLowerCase().includes(needle),
    );
  }, [users, query]);

  async function removeUser() {
    if (!deleting) return;
    setRemoving(true);
    try {
      const response = await fetch(`/api/admin/users/${deleting.id}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast({
          title: "Could not delete user",
          description: data.error ?? "Please try again.",
          variant: "error",
        });
        return;
      }

      toast({
        title: "User deleted",
        description: `${deleting.name}'s account and bills have been removed.`,
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
    <div className="space-y-3">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-sm font-semibold text-white">Registered users</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {users.length} account{users.length === 1 ? "" : "s"} · view their bills or remove them
          </p>
        </div>
        <div className="sm:w-64">
          <Input
            name="admin-search"
            placeholder="Search name or email…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            icon={<Search className="size-4" />}
            aria-label="Search registered users"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white/[0.03]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-white/[0.04] text-slate-400">
              <Users className="size-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-white">
              {users.length === 0 ? "No registered users" : "No matching users"}
            </p>
            <p className="mt-1 max-w-xs text-xs text-slate-400">
              {users.length === 0
                ? "Accounts will appear here as people sign up."
                : "Try a different name or email address."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line/70">
            {filtered.map((user) => {
              const isSelf = user.id === currentUserId;

              return (
                <li
                  key={user.id}
                  className="flex flex-col gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:px-5"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar
                      name={user.name}
                      avatar={user.avatar}
                      className="size-9"
                      textClassName="text-xs"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-sm font-medium text-white">{user.name}</p>
                        {user.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-violet/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-soft">
                            <ShieldCheck className="size-2.5" />
                            Admin
                          </span>
                        ) : null}
                        {isSelf ? (
                          <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
                            You
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-[11px] text-slate-400">{user.email}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        Joined {formatDate(user.createdAt)} · {user.billCount} bill
                        {user.billCount === 1 ? "" : "s"} · {user.paymentCount} payment
                        {user.paymentCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">Outstanding</p>
                      <p className="text-xs font-semibold text-slate-200">
                        {formatCurrency(user.outstanding, user.currency)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {user.unpaidCount} unpaid · {user.paidCount} paid
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/dashboard/admin/users/${user.id}`}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white/[0.04] px-2.5 text-[11px] font-semibold text-slate-200 transition hover:border-line-strong hover:bg-white/[0.08]"
                      >
                        <ReceiptText className="size-3.5" />
                        Bills
                        <ArrowRight className="size-3 text-slate-500" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleting(user)}
                        disabled={isSelf}
                        aria-label={`Delete ${user.name}`}
                        title={isSelf ? "You cannot delete your own account" : "Delete user"}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-rose/25 bg-rose/10 text-rose transition hover:border-rose/45 hover:bg-rose/20 disabled:pointer-events-none disabled:opacity-35"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Modal
        open={Boolean(deleting)}
        onClose={() => (removing ? undefined : setDeleting(null))}
        title="Delete this user?"
        description={
          deleting
            ? `This permanently removes ${deleting.name} and all of their bills, payments and notifications. This cannot be undone.`
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
            onClick={removeUser}
            loading={removing}
            iconLeft={<Trash2 className="size-3.5" />}
          >
            Delete user
          </Button>
        </div>
      </Modal>
    </div>
  );
}
