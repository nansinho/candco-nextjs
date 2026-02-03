"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  contact_email: string | null;
  website: string | null;
  logo_url: string | null;
  active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  // Computed
  users_count?: number;
}

export interface CreateOrganizationInput {
  name: string;
  slug: string;
  description?: string;
  contact_email?: string;
  website?: string;
  logo_url?: string;
  active?: boolean;
}

export interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
  description?: string | null;
  contact_email?: string | null;
  website?: string | null;
  logo_url?: string | null;
  active?: boolean | null;
}

async function fetchOrganizations(): Promise<Organization[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  if (!data) return [];

  // Get users count per organization
  const orgIds = data.map((o) => o.id);
  const { data: userOrgs } = await supabase
    .from("user_organizations")
    .select("organization_id")
    .in("organization_id", orgIds);

  const usersCounts: Record<string, number> = {};
  userOrgs?.forEach((uo: { organization_id: string }) => {
    usersCounts[uo.organization_id] = (usersCounts[uo.organization_id] || 0) + 1;
  });

  return data.map((org) => ({
    ...org,
    users_count: usersCounts[org.id] || 0,
  }));
}

export function useOrganizations() {
  return useQuery({
    queryKey: queryKeys.admin.organizations?.list?.() || ["admin", "organizations"],
    queryFn: fetchOrganizations,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function useOrganizationMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const createOrganization = useMutation({
    mutationFn: async (input: CreateOrganizationInput) => {
      const slug = input.slug || generateSlug(input.name);
      const { error, data } = await supabase
        .from("organizations")
        .insert({
          ...input,
          slug,
          active: input.active ?? true,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] });
    },
  });

  const updateOrganization = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrganizationInput }) => {
      const { error } = await supabase
        .from("organizations")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] });
    },
  });

  const deleteOrganization = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("organizations")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("organizations")
        .update({ active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] });
    },
  });

  return { createOrganization, updateOrganization, deleteOrganization, toggleActive };
}
