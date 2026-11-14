import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import { billUpdateSchema } from "@/lib/validation";
import { apiError, serverError, unauthorized, validationError } from "@/lib/api";
import { parseDueDate } from "@/lib/dates";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();

    const { id } = await context.params;
    const existing = await prisma.bill.findFirst({ where: { id, userId: user.id } });
    if (!existing) return apiError("Bill not found.", 404);

    const body = await request.json().catch(() => null);
    const parsed = billUpdateSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const data = parsed.data;
    const bill = await prisma.bill.update({
      where: { id: existing.id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.amount !== undefined ? { amount: data.amount } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.dueDate !== undefined ? { dueDate: parseDueDate(data.dueDate) } : {}),
        ...(data.dueDate !== undefined ? { lastNotifiedAt: null } : {}),
        ...(data.recurrence !== undefined ? { recurrence: data.recurrence } : {}),
        ...(data.notes !== undefined ? { notes: data.notes?.trim() || null } : {}),
        ...(data.reminderDaysBefore !== undefined
          ? { reminderDaysBefore: data.reminderDaysBefore }
          : {}),
      },
    });

    if (data.dueDate !== undefined) {
      try {
        await prisma.notification.updateMany({
          where: { userId: user.id, billId: bill.id, readAt: null },
          data: { readAt: new Date() },
        });
      } catch (error) {
        console.error("[bills] Failed to clear bill notifications:", error);
      }
    }

    return NextResponse.json({ bill });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();

    const { id } = await context.params;
    const existing = await prisma.bill.findFirst({ where: { id, userId: user.id } });
    if (!existing) return apiError("Bill not found.", 404);

    await prisma.$transaction([
      prisma.notification.updateMany({
        where: { userId: user.id, billId: existing.id, readAt: null },
        data: { readAt: new Date() },
      }),
      prisma.bill.delete({ where: { id: existing.id } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
