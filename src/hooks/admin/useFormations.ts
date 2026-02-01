"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export interface FormationWithData {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  description: string | null;
  pole: string;
  pole_name: string | null;
  duration: string | null;
  price: string | null;
  image_url: string | null;
  popular: boolean;
  active: boolean;
  category_id: string | null;
  created_at: string;
  sessions_count: number;
}

async function fetchFormations(): Promise<FormationWithData[]> {
  const supabase = createClient();

  const { data: formations, error } = await supabase
    .from("formations")
    .select(`
      id,
      title,
      subtitle,
      slug,
      description,
      pole,
      pole_name,
      duration,
      price,
      image_url,
      popular,
      active,
      category_id,
      created_at
    `)
    .order("title", { ascending: true });

  if (error) throw error;
  if (!formations || formations.length === 0) return [];

  // Get sessions count per formation
  const formationIds = formations.map((f: { id: string }) => f.id);
  const { data: sessionsData } = await supabase
    .from("sessions")
    .select("formation_id")
    .in("formation_id", formationIds)
    .in("status", ["planifiee", "confirmee", "en_cours"]);

  const sessionsCounts: Record<string, number> = {};
  sessionsData?.forEach((s: { formation_id: string }) => {
    sessionsCounts[s.formation_id] = (sessionsCounts[s.formation_id] || 0) + 1;
  });

  return formations.map((formation: { id: string }) => ({
    ...formation,
    sessions_count: sessionsCounts[formation.id] || 0,
  }));
}

export function useFormations() {
  return useQuery({
    queryKey: queryKeys.admin.formations.list(),
    queryFn: fetchFormations,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

export function useFormationMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const deleteFormation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("formations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.formations.all });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("formations").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.formations.all });
    },
  });

  return { deleteFormation, toggleActive };
}
