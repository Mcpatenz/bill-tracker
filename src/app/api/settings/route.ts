import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import { settingsSchema } from "@/lib/validation";
import { serverError, unauthorized, validationError } from "@/lib/api";

export async function PATCH(request: Request) {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();

    const body = await request.json().catch(() => null);
    if (body && typeof body === "object" && "notifyEmail" in body && !body.notifyEmail) {
      body.notifyEmail = null;
    }

    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        ...(parsed.data.avatar !== undefined ? { avatar: parsed.data.avatar || null } : {}),
        notifyEmail: parsed.data.notifyEmail ?? null,
        currency: parsed.data.currency,
        leadDays: parsed.data.leadDays,
      },
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        avatar: updated.avatar,
        notifyEmail: updated.notifyEmail,
        currency: updated.currency,
        leadDays: updated.leadDays,
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
