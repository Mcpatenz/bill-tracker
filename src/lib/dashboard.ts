import { createClient } from "./supabase/server";
import { mapBill, mapNotification, mapPayment } from "./supabase/records";
import { daysUntil, lastMonths, monthKey } from "./dates";
import { categoryMeta } from "./constants";

export type DashboardBill = {
  id: string;
  name: string;
  amount: number;
  category: string;
  dueDate: string;
  recurrence: string;
  isPaid: boolean;
  notes: string | null;
  reminderDaysBefore: number;
  daysLeft: number;
};

export type DashboardNotification = {
  id: string;
  title: string;
  body: string;
  channel: string;
  readAt: string | null;
  createdAt: string;
};

export type DashboardData = {
  stats: {
    dueThisMonth: number;
    dueThisMonthCount: number;
    paidThisMonth: number;
    paidLastMonth: number;
    overdue: number;
    overdueCount: number;
    dueSoonCount: number;
    activeBills: number;
    nextBill: DashboardBill | null;
  };
  bills: DashboardBill[];
  upcoming: DashboardBill[];
  categories: { value: string; label: string; color: string; amount: number; share: number }[];
  series: { label: string; paid: number; due: number }[];
  notifications: DashboardNotification[];
  unreadNotifications: number;
};

export function serializeBill(bill: {
  id: string;
  name: string;
  amount: number;
  category: string;
  dueDate: Date;
  recurrence: string;
  isPaid: boolean;
  notes: string | null;
  reminderDaysBefore: number;
}): DashboardBill {
  return {
    id: bill.id,
    name: bill.name,
    amount: bill.amount,
    category: bill.category,
    dueDate: bill.dueDate.toISOString(),
    recurrence: bill.recurrence,
    isPaid: bill.isPaid,
    notes: bill.notes,
    reminderDaysBefore: bill.reminderDaysBefore,
    daysLeft: daysUntil(bill.dueDate),
  };
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createClient();
  const months = lastMonths(6);
  const rangeStart = months[0].date.toISOString();

  const [billResult, paymentResult, notificationResult, unreadResult] = await Promise.all([
    supabase.from("bills").select("*").eq("user_id", userId).order("due_date", { ascending: true }),
    supabase.from("payments").select("*").eq("user_id", userId).gte("paid_at", rangeStart).order("paid_at", { ascending: true }),
    supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(8),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).is("read_at", null),
  ]);
  if (billResult.error) throw billResult.error;
  if (paymentResult.error) throw paymentResult.error;
  if (notificationResult.error) throw notificationResult.error;
  if (unreadResult.error) throw unreadResult.error;

  const bills = (billResult.data ?? []).map(mapBill);
  const payments = (paymentResult.data ?? []).map(mapPayment);
  const notifications = (notificationResult.data ?? []).map(mapNotification);
  const unreadNotifications = unreadResult.count ?? 0;

  const now = new Date();
  const currentMonth = monthKey(now);
  const previousMonth = monthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 12)));

  const unpaid = bills.filter((bill) => !bill.isPaid);
  const serialized = bills.map(serializeBill);
  const serializedUnpaid = serialized.filter((bill) => !bill.isPaid);
  const dueThisMonthBills = unpaid.filter((bill) => monthKey(bill.dueDate) === currentMonth);
  const paidThisMonth = payments.filter((payment) => monthKey(payment.paidAt) === currentMonth).reduce((total, payment) => total + payment.amount, 0);
  const paidLastMonth = payments.filter((payment) => monthKey(payment.paidAt) === previousMonth).reduce((total, payment) => total + payment.amount, 0);
  const overdueBills = unpaid.filter((bill) => daysUntil(bill.dueDate) < 0);
  const dueSoon = unpaid.filter((bill) => {
    const days = daysUntil(bill.dueDate);
    return days >= 0 && days <= 7;
  });

  const categoryTotals = new Map<string, number>();
  for (const bill of unpaid) categoryTotals.set(bill.category, (categoryTotals.get(bill.category) ?? 0) + bill.amount);
  const categorySum = [...categoryTotals.values()].reduce((total, value) => total + value, 0);
  const categories = [...categoryTotals.entries()]
    .map(([value, amount]) => {
      const meta = categoryMeta(value);
      return { value, label: meta.label, color: meta.color, amount, share: categorySum > 0 ? amount / categorySum : 0 };
    })
    .sort((a, b) => b.amount - a.amount);

  const series = months.map((month) => ({
    label: month.label,
    paid: payments.filter((payment) => monthKey(payment.paidAt) === month.key).reduce((total, payment) => total + payment.amount, 0),
    due: unpaid.filter((bill) => monthKey(bill.dueDate) === month.key).reduce((total, bill) => total + bill.amount, 0),
  }));

  return {
    stats: {
      dueThisMonth: dueThisMonthBills.reduce((total, bill) => total + bill.amount, 0),
      dueThisMonthCount: dueThisMonthBills.length,
      paidThisMonth,
      paidLastMonth,
      overdue: overdueBills.reduce((total, bill) => total + bill.amount, 0),
      overdueCount: overdueBills.length,
      dueSoonCount: dueSoon.length,
      activeBills: unpaid.length,
      nextBill: serializedUnpaid[0] ?? null,
    },
    bills: serialized,
    upcoming: serializedUnpaid.slice(0, 6),
    categories,
    series,
    notifications: notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      body: notification.body,
      channel: notification.channel,
      readAt: notification.readAt?.toISOString() ?? null,
      createdAt: notification.createdAt.toISOString(),
    })),
    unreadNotifications,
  };
}
