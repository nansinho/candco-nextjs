"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface Redirect {
  id: string;
  source_path: string;
  target_path: string;
  status_code: number;
  is_active: boolean;
  notes: string | null;
  hit_count: number;
  last_hit_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRedirectInput {
  source_path: string;
  target_path: string;
  status_code?: number;
  is_active?: boolean;
  notes?: string;
}

export interface UpdateRedirectInput {
  source_path?: string;
  target_path?: string;
  status_code?: number;
  is_active?: boolean;
  notes?: string | null;
}

async function fetchRedirects(): Promise<Redirect[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("redirects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export function useRedirects() {
  return useQuery({
    queryKey: ["admin", "redirects"],
    queryFn: fetchRedirects,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useRedirectMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const createRedirect = useMutation({
    mutationFn: async (input: CreateRedirectInput) => {
      const { error, data } = await supabase
        .from("redirects")
        .insert({
          ...input,
          status_code: input.status_code || 301,
          is_active: input.is_active ?? true,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "redirects"] });
    },
  });

  const updateRedirect = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRedirectInput }) => {
      const { error } = await supabase
        .from("redirects")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "redirects"] });
    },
  });

  const deleteRedirect = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("redirects")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "redirects"] });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("redirects")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "redirects"] });
    },
  });

  return { createRedirect, updateRedirect, deleteRedirect, toggleActive };
}
