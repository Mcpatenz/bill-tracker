import { createClient } from "./supabase/server";
import { mapBill, mapProfile } from "./supabase/records";
import { serializeBill, type DashboardBill } from "./dashboard";
import { daysUntil } from "./dates";

export type AdminUserSummary = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  currency: string;
  leadDays: number;
  createdAt: string;
  billCount: number;
  unpaidCount: number;
  paidCount: number;
  outstanding: number;
  paymentCount: number;
  notificationCount: number;
};

export type AdminOverview = {
  users: AdminUserSummary[];
  stats: { users: number; admins: number; bills: number; unpaidBills: number };
};

export type AdminUserDetail = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar: string | null;
    notifyEmail: string | null;
    currency: string;
    leadDays: number;
    createdAt: string;
    paymentCount: number;
    notificationCount: number;
  };
  bills: DashboardBill[];
  stats: { totalBills: number; unpaidBills: number; paidBills: number; overdueBills: number; outstanding: number };
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const supabase = await createClient();
  const [profilesResult, billsResult, paymentsResult, notificationsResult] = await Promise.all([
    supabase.from("profiles").select("id, email, name, is_admin, avatar, notify_email, currency, lead_days, created_at, updated_at").order("created_at", { ascending: false }),
    supabase.from("bills").select("user_id, amount, is_paid"),
    supabase.from("payments").select("user_id"),
    supabase.from("notifications").select("user_id"),
  ]);
  if (profilesResult.error) throw profilesResult.error;
  if (billsResult.error) throw billsResult.error;
  if (paymentsResult.error) throw paymentsResult.error;
  if (notificationsResult.error) throw notificationsResult.error;

  const billsByUser = new Map<string, { amount: number; isPaid: boolean }[]>();
  for (const bill of billsResult.data ?? []) {
    const userBills = billsByUser.get(bill.user_id) ?? [];
    userBills.push({ amount: bill.amount, isPaid: bill.is_paid });
    billsByUser.set(bill.user_id, userBills);
  }
  const countByUser = (rows: { user_id: string }[]) => {
    const counts = new Map<string, number>();
    for (const row of rows) counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
    return counts;
  };
  const paymentCounts = countByUser(paymentsResult.data ?? []);
  const notificationCounts = countByUser(notificationsResult.data ?? []);
  const summaries = (profilesResult.data ?? []).map((profile) => {
    const user = mapProfile(profile);
    const bills = billsByUser.get(user.id) ?? [];
    const unpaid = bills.filter((bill) => !bill.isPaid);
    return {
      id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar,
      currency: user.currency, leadDays: user.leadDays, createdAt: user.createdAt.toISOString(),
      billCount: bills.length, unpaidCount: unpaid.length, paidCount: bills.length - unpaid.length,
      outstanding: unpaid.reduce((total, bill) => total + bill.amount, 0),
      paymentCount: paymentCounts.get(user.id) ?? 0,
      notificationCount: notificationCounts.get(user.id) ?? 0,
    };
  });

  return {
    users: summaries,
    stats: {
      users: summaries.length,
      admins: summaries.filter((user) => user.role === "ADMIN").length,
      bills: summaries.reduce((total, user) => total + user.billCount, 0),
      unpaidBills: summaries.reduce((total, user) => total + user.unpaidCount, 0),
    },
  };
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const supabase = await createClient();
  const [profileResult, billsResult, paymentsResult, notificationsResult] = await Promise.all([
    supabase.from("profiles").select("id, email, name, is_admin, avatar, notify_email, currency, lead_days, created_at, updated_at").eq("id", userId).maybeSingle(),
    supabase.from("bills").select("*").eq("user_id", userId).order("due_date", { ascending: true }),
    supabase.from("payments").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);
  if (profileResult.error) throw profileResult.error;
  if (billsResult.error) throw billsResult.error;
  if (paymentsResult.error) throw paymentsResult.error;
  if (notificationsResult.error) throw notificationsResult.error;
  if (!profileResult.data) return null;

  const profile = mapProfile(profileResult.data);
  const bills = (billsResult.data ?? []).map(mapBill).map(serializeBill);
  const unpaid = bills.filter((bill) => !bill.isPaid);
  return {
    user: {
      id: profile.id, name: profile.name, email: profile.email, role: profile.role,
      avatar: profile.avatar, notifyEmail: profile.notifyEmail, currency: profile.currency,
      leadDays: profile.leadDays, createdAt: profile.createdAt.toISOString(),
      paymentCount: paymentsResult.count ?? 0, notificationCount: notificationsResult.count ?? 0,
    },
    bills,
    stats: {
      totalBills: bills.length,
      unpaidBills: unpaid.length,
      paidBills: bills.length - unpaid.length,
      overdueBills: unpaid.filter((bill) => daysUntil(bill.dueDate) < 0).length,
      outstanding: unpaid.reduce((total, bill) => total + bill.amount, 0),
    },
  };
}
