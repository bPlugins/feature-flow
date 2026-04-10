// Super admin configuration
export const SUPER_ADMIN_EMAIL = "accounts@bplugins.com";

export function isSuperAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}
