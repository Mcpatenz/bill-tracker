import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Mcpatenz Bill Tracker to review bills, due dates and email reminders.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <AuthShell headline="Welcome back to calm bill tracking.">
      <LoginForm />
    </AuthShell>
  );
}
