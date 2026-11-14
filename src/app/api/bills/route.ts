import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import { billSchema } from "@/lib/validation";
import { apiError, serverError, unauthorized, validationError } from "@/lib/api";
import { parseDueDate } from "@/lib/dates";

export async function GET() {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();

    const bills = await prisma.bill.findMany({
      where: { userId: user.id },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ bills });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();

    const body = await request.json().catch(() => null);
    const parsed = billSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const bill = await prisma.bill.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        amount: parsed.data.amount,
        category: parsed.data.category,
        dueDate: parseDueDate(parsed.data.dueDate),
        recurrence: parsed.data.recurrence,
        notes: parsed.data.notes?.trim() || null,
        reminderDaysBefore: parsed.data.reminderDaysBefore,
      },
    });

    return NextResponse.json({ bill }, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE() {
  const user = await getApiUser();
  if (!user) return unauthorized();
  return apiError("Choose a bill to delete.", 400);
}
