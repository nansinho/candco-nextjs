"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

// Types for user data
export interface UserClient {
  id: string;
  name: string;
  client_role: string | null;
  is_primary: boolean;
  department_id: string | null;
  department_name: string | null;
}

export interface UserOrganization {
  id: string;
  name: string;
  role: string | null;
  is_primary: boolean;
}

export interface UserWithRole {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  telephone: string | null;
  avatar_url?: string | null;
  role: string;
  email_verified: boolean;
  email_confirmed_at: string | null;
  created_at: string;
  organizations: UserOrganization[];
  clients: UserClient[];
  image_rights_consent: boolean | null;
  image_rights_consent_date: string | null;
  account_type: string | null;
}

export interface UsersQueryResult {
  users: UserWithRole[];
  totalCount: number;
  page: number;
  limit: number;
}

// Fetch users via edge function (returns email, verification status, clients, etc.)
async function fetchUsersFromEdgeFunction(
  supabase: ReturnType<typeof createClient>,
  page: number,
  search: string
): Promise<UsersQueryResult> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  if (!accessToken) {
    throw new Error("No access token available");
  }

  const response = await supabase.functions.invoke("get-users-with-email", {
    body: { page, limit: 50, search },
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.error) {
    throw new Error(response.error.message || "Failed to fetch users");
  }

  return response.data as UsersQueryResult;
}

// Fallback: fetch users directly from database (without email/verification)
async function fetchUsersFallback(
  supabase: ReturnType<typeof createClient>,
  page: number,
  search: string
): Promise<UsersQueryResult> {
  const limit = 50;
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, created_at, image_rights_consent, image_rights_consent_date, account_type", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply search filter
  if (search && search.length >= 2) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
  }

  const { data: profiles, error, count } = await query;

  if (error) throw error;
  if (!profiles || profiles.length === 0) {
    return { users: [], totalCount: 0, page, limit };
  }

  // Get user IDs
  type RawProfile = { id: string; first_name: string | null; last_name: string | null; avatar_url: string | null; created_at: string; image_rights_consent?: boolean | null; image_rights_consent_date?: string | null; account_type?: string | null };
  type RawRole = { user_id: string; role: string };
  type RawClient = { id: string; nom: string };
  type RawClientUser = { user_id: string; client_id: string; client_role: string; is_primary: boolean; department_id: string | null };

  const userIds = profiles.map((p: RawProfile) => p.id);

  // Fetch roles and client associations in parallel
  const [rolesResult, clientUsersResult, clientsResult] = await Promise.all([
    supabase.from("user_roles").select("user_id, role").in("user_id", userIds),
    supabase.from("client_users").select("user_id, client_id, client_role, is_primary, department_id").in("user_id", userIds).is("departed_at", null),
    supabase.from("clients").select("id, nom"),
  ]);

  const roles = rolesResult.data || [];
  const clientUsers = clientUsersResult.data || [];
  const clients = clientsResult.data || [];

  // Create maps
  const rolesMap = new Map(roles.map((r: RawRole) => [r.user_id, r.role]));
  const clientsMap = new Map<string, string>(clients.map((c: RawClient) => [c.id, c.nom]));

  // Group client_users by user_id
  const clientUsersMap = new Map<string, RawClientUser[]>();
  clientUsers.forEach((cu: RawClientUser) => {
    if (!clientUsersMap.has(cu.user_id)) {
      clientUsersMap.set(cu.user_id, []);
    }
    clientUsersMap.get(cu.user_id)!.push(cu);
  });

  // Map profiles to UserWithRole
  const users: UserWithRole[] = profiles.map((profile: RawProfile) => {
    const userClientUsers = clientUsersMap.get(profile.id) || [];
    const userClients: UserClient[] = userClientUsers.map((cu: RawClientUser) => ({
      id: cu.client_id,
      name: clientsMap.get(cu.client_id) || "Client inconnu",
      client_role: cu.client_role,
      is_primary: cu.is_primary,
      department_id: cu.department_id,
      department_name: null,
    }));

    return {
      id: profile.id,
      email: null, // Not available without edge function
      first_name: profile.first_name,
      last_name: profile.last_name,
      telephone: null,
      avatar_url: profile.avatar_url,
      role: rolesMap.get(profile.id) || "user",
      email_verified: true, // Assume verified in fallback
      email_confirmed_at: null,
      created_at: profile.created_at,
      organizations: [],
      clients: userClients,
      image_rights_consent: profile.image_rights_consent,
      image_rights_consent_date: profile.image_rights_consent_date,
      account_type: profile.account_type,
    };
  });

  return { users, totalCount: count || 0, page, limit };
}

// Main hook
export function useUsers(page: number = 1, search: string = "") {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.admin.users?.all
      ? [...queryKeys.admin.users.all, page, search]
      : ["admin-users", page, search],
    queryFn: async () => {
      try {
        // Try edge function first
        return await fetchUsersFromEdgeFunction(supabase, page, search);
      } catch (error) {
        console.warn("Edge function failed, using fallback:", error);
        // Fallback to direct database query
        return await fetchUsersFallback(supabase, page, search);
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for organizations dropdown (for invite dialog)
export function useOrganizations() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin-organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Mutations
export function useUserMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      // Check if role exists
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existingRole) {
        const { error } = await supabase
          .from("user_roles")
          .update({ role })
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      // Delete role first
      await supabase.from("user_roles").delete().eq("user_id", userId);
      // Delete profile
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const inviteUser = useMutation({
    mutationFn: async ({
      email,
      role,
      organizationIds,
    }: {
      email: string;
      role: string;
      organizationIds?: string[];
    }) => {
      // Create user with random password
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12),
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("Failed to create user");

      const userId = signUpData.user.id;

      // Send verification email
      await supabase.functions.invoke("send-verification-email", {
        body: {
          email,
          userId,
          firstName: "Utilisateur",
          redirect: "/admin/users",
        },
      });

      // Assign role if not "user"
      if (role !== "user") {
        await supabase.from("user_roles").insert({ user_id: userId, role });
      }

      // Create formateur record if role is formateur
      if (role === "formateur") {
        await supabase.from("formateurs").insert({
          user_id: userId,
          email,
          nom: "Nouveau",
          prenom: "Formateur",
          statut: "Vacataire",
          is_active: true,
        });
      }

      // Assign organizations if provided and role is org_manager
      if (role === "org_manager" && organizationIds && organizationIds.length > 0) {
        const orgInserts = organizationIds.map((orgId, index) => ({
          user_id: userId,
          organization_id: orgId,
          role: "manager",
          is_primary: index === 0,
        }));
        await supabase.from("user_organizations").insert(orgInserts);
      }

      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const resendVerificationEmail = useMutation({
    mutationFn: async ({ email, userId }: { email: string; userId: string }) => {
      const { error } = await supabase.functions.invoke("send-verification-email", {
        body: {
          email,
          userId,
          firstName: "Utilisateur",
          redirect: "/admin/users",
        },
      });
      if (error) throw error;
    },
  });

  const confirmEmailManually = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { error } = await supabase.functions.invoke("confirm-user-email", {
        body: { userId },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  return {
    updateRole,
    deleteUser,
    inviteUser,
    resendVerificationEmail,
    confirmEmailManually,
  };
}
