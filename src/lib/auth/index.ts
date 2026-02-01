import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Types de rôles utilisateur
export type UserRole =
  | "superadmin"
  | "admin"
  | "org_manager"
  | "moderator"
  | "formateur"
  | "client_manager"
  | "user"
  | null;

// Hiérarchie des rôles admin
export const ADMIN_ROLES: UserRole[] = ["superadmin", "admin", "org_manager", "moderator"];
export const SUPERADMIN_ROLES: UserRole[] = ["superadmin"];
export const ADMIN_ONLY_ROLES: UserRole[] = ["superadmin", "admin"];

/**
 * Récupère le rôle d'un utilisateur depuis la base de données
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return "user";
  }

  return data.role as UserRole;
}

/**
 * Vérifie si un utilisateur a l'un des rôles requis
 */
export async function checkPermission(
  userId: string,
  requiredRoles: UserRole[]
): Promise<boolean> {
  const userRole = await getUserRole(userId);
  return requiredRoles.includes(userRole);
}

/**
 * Récupère l'utilisateur connecté (Server Component)
 */
export async function getServerUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Récupère l'utilisateur et son rôle (Server Component)
 */
export async function getServerUserWithRole() {
  const user = await getServerUser();

  if (!user) {
    return { user: null, role: null as UserRole };
  }

  const role = await getUserRole(user.id);
  return { user, role };
}

/**
 * Vérifie l'accès admin et redirige si non autorisé
 * À utiliser dans les Server Components
 */
export async function requireAdminAccess(requiredRoles: UserRole[] = ADMIN_ROLES) {
  const { user, role } = await getServerUserWithRole();

  if (!user) {
    redirect("/auth?redirect=/admin");
  }

  if (!requiredRoles.includes(role)) {
    redirect("/");
  }

  return { user, role };
}

/**
 * Vérifie l'accès superadmin
 */
export async function requireSuperadminAccess() {
  return requireAdminAccess(SUPERADMIN_ROLES);
}

/**
 * Vérifie si l'utilisateur est un formateur
 */
export async function isUserFormateur(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("formateurs")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  return !!data;
}

/**
 * Récupère les organisations d'un utilisateur (pour org_manager)
 */
export async function getUserOrganizations(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("user_organizations")
    .select(
      `
      id,
      organization_id,
      role,
      is_primary,
      organizations!inner(id, name)
    `
    )
    .eq("user_id", userId);

  if (!data) return [];

  return data.map((org: any) => ({
    id: org.id,
    organization_id: org.organization_id,
    organization_name: org.organizations?.name || "",
    role: org.role as "manager" | "viewer",
    is_primary: org.is_primary,
  }));
}

/**
 * Récupère le profil utilisateur complet
 */
export async function getUserProfile(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select(
      "first_name, last_name, avatar_url, telephone, entreprise, image_rights_consent, image_rights_consent_date"
    )
    .eq("id", userId)
    .single();

  return data;
}
