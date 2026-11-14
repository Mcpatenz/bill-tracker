import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import { syncUserReminders } from "@/lib/reminders";
import { serverError, unauthorized } from "@/lib/api";

export async function GET() {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();

    await syncUserReminders(user.id);

    const [notifications, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
      prisma.notification.count({ where: { userId: user.id, readAt: null } }),
    ]);

    return NextResponse.json({ notifications, unread });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();

    const body = await request.json().catch(() => null);
    const id =
      body && typeof body === "object" && typeof (body as { id?: unknown }).id === "string"
        ? (body as { id: string }).id
        : null;

    await prisma.notification.updateMany({
      where: { userId: user.id, readAt: null, ...(id ? { id } : {}) },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
