import { prisma } from "./prisma";
import { CURRENCIES } from "./constants";
import { utcMidnight } from "./dates";

export type SiteStats = {
  billsTracked: number;
  billsThisMonth: number;
  onTimeRate: number | null;
  currencies: number;
  members: number;
};

const emptyStats: SiteStats = {
  billsTracked: 0,
  billsThisMonth: 0,
  onTimeRate: null,
  currencies: CURRENCIES.length,
  members: 0,
};

export async function getSiteStats(): Promise<SiteStats> {
  try {
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const startOfNextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const [billsTracked, billsThisMonth, payments, members] = await Promise.all([
      prisma.bill.count(),
      prisma.bill.count({
        where: { dueDate: { gte: startOfMonth, lt: startOfNextMonth } },
      }),
      prisma.payment.findMany({ select: { paidAt: true, dueDate: true } }),
      prisma.user.count(),
    ]);

    const onTime = payments.filter(
      (payment) => utcMidnight(payment.paidAt) <= utcMidnight(payment.dueDate),
    ).length;

    return {
      billsTracked,
      billsThisMonth,
      onTimeRate: payments.length > 0 ? (onTime / payments.length) * 100 : null,
      currencies: CURRENCIES.length,
      members,
    };
  } catch (error) {
    console.error("[site-stats] Failed to load public stats:", error);
    return emptyStats;
  }
}
