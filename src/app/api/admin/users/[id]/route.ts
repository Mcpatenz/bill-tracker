import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiUser } from "@/lib/auth";
import { ADMIN_ROLE, isAdminRole } from "@/lib/roles";
import { apiError, forbidden, serverError, unauthorized } from "@/lib/api";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: Context) {
  try {
    const admin = await getApiUser();
    if (!admin) return unauthorized();
    if (!isAdminRole(admin.role)) return forbidden("Admin access required.");

    const { id } = await context.params;
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) return apiError("User not found.", 404);

    if (target.id === admin.id) {
      return apiError("You cannot delete your own account.", 400);
    }

    if (target.role === ADMIN_ROLE) {
      const adminCount = await prisma.user.count({ where: { role: ADMIN_ROLE } });
      if (adminCount <= 1) {
        return apiError("At least one admin account is required.", 400);
      }
    }

    await prisma.user.delete({ where: { id: target.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
