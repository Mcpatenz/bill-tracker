export const ADMIN_ROLE = "ADMIN";
export const USER_ROLE = "USER";

export function isAdminRole(role: string | null | undefined): boolean {
  return role === ADMIN_ROLE;
}

export function isBootstrapAdmin(email: string): boolean {
  const configured = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return configured.includes(email.trim().toLowerCase());
}
