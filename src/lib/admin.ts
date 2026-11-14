import { prisma } from "./prisma";
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
  stats: {
    users: number;
    admins: number;
    bills: number;
    unpaidBills: number;
  };
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
  stats: {
    totalBills: number;
    unpaidBills: number;
    paidBills: number;
    overdueBills: number;
    outstanding: number;
  };
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      bills: { select: { amount: true, isPaid: true } },
      _count: { select: { payments: true, notifications: true } },
    },
  });

  const summaries = users.map((user) => {
    const unpaid = user.bills.filter((bill) => !bill.isPaid);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      currency: user.currency,
      leadDays: user.leadDays,
      createdAt: user.createdAt.toISOString(),
      billCount: user.bills.length,
      unpaidCount: unpaid.length,
      paidCount: user.bills.length - unpaid.length,
      outstanding: unpaid.reduce((total, bill) => total + bill.amount, 0),
      paymentCount: user._count.payments,
      notificationCount: user._count.notifications,
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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bills: { orderBy: { dueDate: "asc" } },
      _count: { select: { payments: true, notifications: true } },
    },
  });

  if (!user) return null;

  const bills = user.bills.map(serializeBill);
  const unpaid = bills.filter((bill) => !bill.isPaid);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      notifyEmail: user.notifyEmail,
      currency: user.currency,
      leadDays: user.leadDays,
      createdAt: user.createdAt.toISOString(),
      paymentCount: user._count.payments,
      notificationCount: user._count.notifications,
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
