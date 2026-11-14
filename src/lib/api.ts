import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function validationError(error: ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  const first = error.issues[0]?.message ?? "Please check the form and try again.";
  return NextResponse.json({ error: first, fieldErrors }, { status: 422 });
}

export function unauthorized() {
  return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
}

export function forbidden(message = "You do not have permission to do that.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function serverError(error: unknown) {
  console.error("[api]", error);
  return NextResponse.json(
    { error: "Something went wrong on our side. Please try again." },
    { status: 500 },
  );
}
