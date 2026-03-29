import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";

export type UserRole = "superadmin" | "admin" | "user" | null;

export const ADMIN_ROLES: UserRole[] = ["superadmin", "admin"];

/**
 * Get user role from utilisateurs table (uses service role to bypass RLS)
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("utilisateurs")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!data) {
    // Fallback: try by auth user email
    const authSupabase = await createClient();
    const { data: { user } } = await authSupabase.auth.getUser();
    if (user?.email) {
      const { data: byEmail } = await supabase
        .from("utilisateurs")
        .select("role")
        .eq("email", user.email)
        .maybeSingle();
      return (byEmail?.role as UserRole) || "user";
    }
    return "user";
  }

  return data.role as UserRole;
}

/**
 * Get the authenticated user (Server Component)
 */
export async function getServerUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Get user + role (Server Component)
 */
export async function getServerUserWithRole() {
  const user = await getServerUser();
  if (!user) return { user: null, role: null as UserRole };
  const role = await getUserRole(user.id);
  return { user, role };
}

/**
 * Require admin access, redirect if not authorized
 */
export async function requireAdminAccess() {
  const { user, role } = await getServerUserWithRole();

  if (!user) {
    redirect("/auth?redirect=/admin");
  }

  if (role !== "superadmin" && role !== "admin") {
    redirect("/");
  }

  return { user, role };
}
