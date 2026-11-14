import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import { apiError, serverError, unauthorized } from "@/lib/api";
import { nextOccurrence, toDateInput } from "@/lib/dates";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();

    const { id } = await context.params;
    const bill = await prisma.bill.findFirst({ where: { id, userId: user.id } });
    if (!bill) return apiError("Bill not found.", 404);
    if (bill.isPaid) return apiError("This bill is already marked as paid.", 409);

    const paidAt = new Date();

    await prisma.payment.create({
      data: {
        userId: user.id,
        billId: bill.id,
        amount: bill.amount,
        dueDate: bill.dueDate,
        paidAt,
        method: "MANUAL",
      },
    });

    const recurring = bill.recurrence !== "ONCE";
    const nextDate = recurring ? nextOccurrence(bill.dueDate, bill.recurrence) : null;

    const updated = await prisma.bill.update({
      where: { id: bill.id },
      data: recurring
        ? {
            dueDate: nextDate as Date,
            isPaid: false,
            paidAt,
            lastNotifiedAt: null,
          }
        : {
            isPaid: true,
            paidAt,
          },
    });

    try {
      await prisma.notification.updateMany({
        where: { userId: user.id, billId: bill.id, readAt: null },
        data: { readAt: paidAt },
      });
    } catch (error) {
      console.error("[payments] Failed to clear bill notifications:", error);
    }

    return NextResponse.json({
      bill: updated,
      rolledTo: nextDate ? toDateInput(nextDate) : null,
    });
  } catch (error) {
    return serverError(error);
  }
}
