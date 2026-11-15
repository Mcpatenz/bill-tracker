import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_ROLE, USER_ROLE, isAdminRole } from "./roles";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: typeof ADMIN_ROLE | typeof USER_ROLE;
  avatar: string | null;
  notifyEmail: string | null;
  currency: string;
  leadDays: number;
  createdAt: Date;
};

export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, name, email, is_admin, avatar, notify_email, currency, lead_days, created_at")
    .eq("id", authUser.id)
    .maybeSingle();

  if (error) throw error;
  if (!profile) return null;

  return {
    id: profile.id,
    name: profile.name,
    email: authUser.email ?? profile.email,
    role: profile.is_admin ? ADMIN_ROLE : USER_ROLE,
    avatar: profile.avatar,
    notifyEmail: profile.notify_email,
    currency: profile.currency,
    leadDays: profile.lead_days,
    createdAt: new Date(profile.created_at),
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdminRole(user.role)) redirect("/dashboard");
  return user;
}

export async function getApiUser() {
  return getCurrentUser();
}
