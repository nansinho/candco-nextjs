"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface SatisfactionSurvey {
  id: string;
  formation_id: string;
  session_id: string;
  inscription_id: string;
  user_id: string;
  note_globale: number | null;
  note_contenu: number;
  note_formateur: number;
  note_organisation: number;
  note_supports: number;
  note_objectifs: number;
  note_applicabilite: number;
  points_forts: string | null;
  points_amelioration: string | null;
  recommandation: boolean;
  temoignage: string | null;
  temoignage_approuve: boolean | null;
  reviewer_type: string;
  created_at: string | null;
  updated_at: string | null;
  // Joined data
  formation_title?: string;
  session_date?: string;
}

async function fetchSatisfactionSurveys(): Promise<SatisfactionSurvey[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("satisfaction_surveys")
    .select(`
      *,
      formations:formation_id(title),
      sessions:session_id(start_date)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((item) => ({
    ...item,
    formation_title: (item.formations as { title: string } | null)?.title || null,
    session_date: (item.sessions as { start_date: string } | null)?.start_date || null,
  }));
}

export function useSatisfactionSurveys() {
  return useQuery({
    queryKey: ["admin", "satisfaction"],
    queryFn: fetchSatisfactionSurveys,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useSatisfactionMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const approveTestimonial = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase
        .from("satisfaction_surveys")
        .update({ temoignage_approuve: approved })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "satisfaction"] });
    },
  });

  const deleteSurvey = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("satisfaction_surveys")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "satisfaction"] });
    },
  });

  return { approveTestimonial, deleteSurvey };
}
