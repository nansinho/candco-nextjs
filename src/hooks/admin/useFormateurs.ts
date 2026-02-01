"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export interface Formateur {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  specialites: string[] | null;
  bio: string | null;
  active: boolean;
  user_id: string | null;
  civilite: string | null;
  siret: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  tarif_journalier: number | null;
  tarif_demi_journee: number | null;
  numero_tva: string | null;
  numero_nda: string | null;
  assujetti_tva: boolean;
  created_at: string;
  sessions_count?: number;
}

export interface Specialite {
  id: string;
  name: string;
}

export function useFormateurs() {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.admin.formateurs.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formateurs")
        .select("*")
        .order("nom", { ascending: true });

      if (error) throw error;

      // Get sessions count for each formateur
      const formateurIds = data.map((f) => f.id);
      const { data: sessionsData } = await supabase
        .from("sessions")
        .select("formateur_id")
        .in("formateur_id", formateurIds);

      const sessionsCounts = formateurIds.reduce((acc, id) => {
        acc[id] = sessionsData?.filter((s) => s.formateur_id === id).length || 0;
        return acc;
      }, {} as Record<string, number>);

      return data.map((f) => ({
        ...f,
        sessions_count: sessionsCounts[f.id] || 0,
      })) as Formateur[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSpecialites() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["specialites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formateur_specialites")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Specialite[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useFormateurMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("formateurs")
        .update({ active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.formateurs.all });
    },
  });

  const updateFormateur = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Formateur> }) => {
      const { error } = await supabase
        .from("formateurs")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.formateurs.all });
    },
  });

  const deleteFormateur = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("formateurs")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.formateurs.all });
    },
  });

  return { toggleActive, updateFormateur, deleteFormateur };
}
