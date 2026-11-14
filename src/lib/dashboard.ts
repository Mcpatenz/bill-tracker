import { prisma } from "./prisma";
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
  const months = lastMonths(6);
  const rangeStart = months[0].date;

  const [bills, payments, notifications, unreadNotifications] = await Promise.all([
    prisma.bill.findMany({ where: { userId }, orderBy: { dueDate: "asc" } }),
    prisma.payment.findMany({
      where: { userId, paidAt: { gte: rangeStart } },
      orderBy: { paidAt: "asc" },
    }),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);

  const now = new Date();
  const currentMonth = monthKey(now);
  const previousMonth = monthKey(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 12)));

  const unpaid = bills.filter((bill) => !bill.isPaid);
  const serialized = bills.map(serializeBill);
  const serializedUnpaid = serialized.filter((bill) => !bill.isPaid);

  const dueThisMonthBills = unpaid.filter((bill) => monthKey(bill.dueDate) === currentMonth);
  const paidThisMonth = payments
    .filter((payment) => monthKey(payment.paidAt) === currentMonth)
    .reduce((total, payment) => total + payment.amount, 0);
  const paidLastMonth = payments
    .filter((payment) => monthKey(payment.paidAt) === previousMonth)
    .reduce((total, payment) => total + payment.amount, 0);

  const overdueBills = unpaid.filter((bill) => daysUntil(bill.dueDate) < 0);
  const dueSoon = unpaid.filter((bill) => {
    const days = daysUntil(bill.dueDate);
    return days >= 0 && days <= 7;
  });

  const categoryTotals = new Map<string, number>();
  for (const bill of unpaid) {
    categoryTotals.set(bill.category, (categoryTotals.get(bill.category) ?? 0) + bill.amount);
  }
  const categorySum = [...categoryTotals.values()].reduce((total, value) => total + value, 0);

  const categories = [...categoryTotals.entries()]
    .map(([value, amount]) => {
      const meta = categoryMeta(value);
      return {
        value,
        label: meta.label,
        color: meta.color,
        amount,
        share: categorySum > 0 ? amount / categorySum : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const series = months.map((month) => ({
    label: month.label,
    paid: payments
      .filter((payment) => monthKey(payment.paidAt) === month.key)
      .reduce((total, payment) => total + payment.amount, 0),
    due: unpaid
      .filter((bill) => monthKey(bill.dueDate) === month.key)
      .reduce((total, bill) => total + bill.amount, 0),
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
