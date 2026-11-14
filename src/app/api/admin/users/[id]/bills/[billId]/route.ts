import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import { isAdminRole } from "@/lib/roles";
import { apiError, forbidden, serverError, unauthorized } from "@/lib/api";

type Context = { params: Promise<{ id: string; billId: string }> };

export async function DELETE(_request: Request, context: Context) {
  try {
    const admin = await getApiUser();
    if (!admin) return unauthorized();
    if (!isAdminRole(admin.role)) return forbidden("Admin access required.");

    const { id, billId } = await context.params;
    const bill = await prisma.bill.findFirst({
      where: { id: billId, userId: id },
      select: { id: true },
    });

    if (!bill) return apiError("Bill not found.", 404);

    await prisma.$transaction([
      prisma.notification.updateMany({
        where: { userId: id, billId: bill.id, readAt: null },
        data: { readAt: new Date() },
      }),
      prisma.bill.delete({ where: { id: bill.id } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
