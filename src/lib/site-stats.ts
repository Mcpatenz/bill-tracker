import { createClient } from "./supabase/server";
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

    const supabase = await createClient();
    const [billsResult, paymentsResult, membersResult] = await Promise.all([
      supabase.from("bills").select("due_date"),
      supabase.from("payments").select("paid_at, due_date"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
    ]);
    if (billsResult.error) throw billsResult.error;
    if (paymentsResult.error) throw paymentsResult.error;
    if (membersResult.error) throw membersResult.error;
    const bills = billsResult.data ?? [];
    const payments = paymentsResult.data ?? [];
    const billsTracked = bills.length;
    const billsThisMonth = bills.filter((bill) => {
      const dueDate = new Date(bill.due_date);
      return dueDate >= startOfMonth && dueDate < startOfNextMonth;
    }).length;
    const members = membersResult.count ?? 0;
    const onTime = payments.filter(
      (payment) => utcMidnight(new Date(payment.paid_at)) <= utcMidnight(new Date(payment.due_date)),
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
