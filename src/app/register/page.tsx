import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create your free account",
  description:
    "Create a free Mcpatenz Bill Tracker account to track bills and receive automatic email reminders before due dates.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/register" },
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <AuthShell headline="Start free. Stay ahead of every bill.">
      <RegisterForm />
    </AuthShell>
  );
}
