import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser, hashPassword, verifyPassword } from "@/lib/auth";
import { passwordSchema } from "@/lib/validation";
import { apiError, serverError, unauthorized, validationError } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const user = await getApiUser();
    if (!user) return unauthorized();

    const body = await request.json().catch(() => null);
    const parsed = passwordSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return apiError("Your current password is incorrect.", 401);

    const passwordHash = await hashPassword(parsed.data.newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
