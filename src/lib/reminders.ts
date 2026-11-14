import { prisma } from "./prisma";
import { daysUntil, sameUtcDay } from "./dates";
import { sendBillReminderEmail } from "./mail";
import { formatCurrency } from "./format";

export type ReminderSummary = {
  users: number;
  checked: number;
  notified: number;
  emailed: number;
  skipped: number;
  failed: number;
};

type ReminderBill = {
  name: string;
  amount: number;
  dueDate: Date;
};

function reminderMessage(bill: ReminderBill, days: number, currency: string) {
  const amount = formatCurrency(bill.amount, currency);
  const title =
    days < 0
      ? `${bill.name} is overdue`
      : days === 0
        ? `${bill.name} is due today`
        : `${bill.name} is due in ${days} day${days === 1 ? "" : "s"}`;

  const body = `${amount} · due ${new Date(bill.dueDate).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
  })}. Open Mcpatenz Bill Tracker to mark it as paid.`;

  return { title, body };
}

export async function syncUserReminders(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return 0;

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const [bills, todaysNotifications] = await Promise.all([
    prisma.bill.findMany({ where: { userId, isPaid: false } }),
    prisma.notification.findMany({
      where: { userId, billId: { not: null }, createdAt: { gte: startOfDay } },
      select: { billId: true },
    }),
  ]);

  const notifiedToday = new Set(todaysNotifications.map((notification) => notification.billId));
  const now = new Date();
  let created = 0;

  for (const bill of bills) {
    const days = daysUntil(bill.dueDate);
    const window = Math.min(bill.reminderDaysBefore, user.leadDays);

    if (days > window) continue;
    if (days < -7) continue;
    if (bill.lastNotifiedAt && sameUtcDay(bill.lastNotifiedAt, now)) continue;
    if (notifiedToday.has(bill.id)) continue;

    const { title, body } = reminderMessage(bill, days, user.currency);

    await prisma.notification.create({
      data: {
        userId,
        billId: bill.id,
        title,
        body,
        channel: "IN_APP",
      },
    });

    notifiedToday.add(bill.id);
    created += 1;
  }

  return created;
}

export async function runReminderSweep(): Promise<ReminderSummary> {
  const summary: ReminderSummary = {
    users: 0,
    checked: 0,
    notified: 0,
    emailed: 0,
    skipped: 0,
    failed: 0,
  };

  const users = await prisma.user.findMany({
    include: {
      bills: {
        where: { isPaid: false },
      },
    },
  });

  summary.users = users.length;

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  for (const user of users) {
    const todaysNotifications = await prisma.notification.findMany({
      where: { userId: user.id, billId: { not: null }, createdAt: { gte: startOfDay } },
      select: { id: true, billId: true, channel: true },
    });
    const notificationByBill = new Map(
      todaysNotifications.map((notification) => [notification.billId, notification]),
    );

    for (const bill of user.bills) {
      summary.checked += 1;
      const days = daysUntil(bill.dueDate);
      const window = Math.min(bill.reminderDaysBefore, user.leadDays);

      if (days > window) continue;
      if (days < -7) continue;
      if (bill.lastNotifiedAt && sameUtcDay(bill.lastNotifiedAt, new Date())) {
        summary.skipped += 1;
        continue;
      }

      const { title, body } = reminderMessage(bill, days, user.currency);

      let emailDelivered = false;
      try {
        const result = await sendBillReminderEmail(user, bill, days);
        emailDelivered = result.delivered;
      } catch (error) {
        console.error("[reminders] Failed to send reminder email:", error);
        summary.failed += 1;
      }

      try {
        const existing = notificationByBill.get(bill.id);

        if (existing) {
          if (emailDelivered && existing.channel !== "EMAIL") {
            await prisma.notification.update({
              where: { id: existing.id },
              data: { channel: "EMAIL" },
            });
          }
        } else {
          const created = await prisma.notification.create({
            data: {
              userId: user.id,
              billId: bill.id,
              title,
              body,
              channel: emailDelivered ? "EMAIL" : "IN_APP",
            },
          });
          notificationByBill.set(bill.id, {
            id: created.id,
            billId: created.billId,
            channel: created.channel,
          });
        }

        await prisma.bill.update({
          where: { id: bill.id },
          data: { lastNotifiedAt: new Date() },
        });

        summary.notified += 1;
        if (emailDelivered) summary.emailed += 1;
      } catch (error) {
        console.error("[reminders] Failed to record reminder:", error);
        summary.failed += 1;
      }
    }
  }

  return summary;
}
