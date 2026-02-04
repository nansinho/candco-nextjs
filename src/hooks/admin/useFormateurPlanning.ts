"use client";

/**
 * @file useFormateurPlanning.ts
 * @description Hooks for managing formateur availability and planning
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

// Types
export interface FormateurDisponibilite {
  id: string;
  user_id: string;
  date: string;
  heure_debut: string | null;
  heure_fin: string | null;
  type: "disponible" | "partiel" | "indisponible";
  periode: "matin" | "apres_midi" | "journee" | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface FormateurRecurrence {
  id: string;
  user_id: string;
  jour_semaine: number; // 0-6 (Monday-Sunday)
  heure_debut: string | null;
  heure_fin: string | null;
  date_debut: string | null;
  date_fin: string | null;
  type: "disponible" | "partiel" | "indisponible";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type DisponibiliteType = "disponible" | "partiel" | "indisponible";

// Input types for mutations
export interface CreateDisponibiliteInput {
  user_id: string;
  date: string;
  type: DisponibiliteType;
  periode?: "matin" | "apres_midi" | "journee" | null;
  heure_debut?: string | null;
  heure_fin?: string | null;
  notes?: string | null;
}

export interface UpdateDisponibiliteInput {
  id: string;
  type?: DisponibiliteType;
  periode?: "matin" | "apres_midi" | "journee" | null;
  heure_debut?: string | null;
  heure_fin?: string | null;
  notes?: string | null;
}

export interface CreateRecurrenceInput {
  user_id: string;
  jour_semaine: number;
  type: DisponibiliteType;
  heure_debut?: string | null;
  heure_fin?: string | null;
  date_debut?: string | null;
  date_fin?: string | null;
  notes?: string | null;
}

export interface UpdateRecurrenceInput {
  id: string;
  type?: DisponibiliteType;
  heure_debut?: string | null;
  heure_fin?: string | null;
  date_debut?: string | null;
  date_fin?: string | null;
  notes?: string | null;
}

/**
 * Hook to fetch disponibilites for a specific formateur
 */
export function useFormateurDisponibilites(
  formateurId: string | null,
  startDate?: string,
  endDate?: string
) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.formateur.disponibilites.range(formateurId || "", startDate, endDate),
    queryFn: async () => {
      if (!formateurId) return [];

      let query = supabase
        .from("formateur_disponibilites")
        .select("*")
        .eq("user_id", formateurId)
        .order("date", { ascending: true });

      if (startDate) {
        query = query.gte("date", startDate);
      }
      if (endDate) {
        query = query.lte("date", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as FormateurDisponibilite[];
    },
    enabled: !!formateurId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch recurrences for a specific formateur
 */
export function useFormateurRecurrences(formateurId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: [...queryKeys.admin.planning.recurrences(), formateurId],
    queryFn: async () => {
      if (!formateurId) return [];

      const { data, error } = await supabase
        .from("formateur_recurrences")
        .select("*")
        .eq("user_id", formateurId)
        .order("jour_semaine", { ascending: true });

      if (error) throw error;
      return data as FormateurRecurrence[];
    },
    enabled: !!formateurId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch all formateurs' disponibilites for a date range (admin planning view)
 */
export function useAllFormateursDisponibilites(startDate?: string, endDate?: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.admin.planning.disponibilites(startDate, endDate),
    queryFn: async () => {
      let query = supabase
        .from("formateur_disponibilites")
        .select(`
          *,
          formateur:formateurs!formateur_disponibilites_user_id_fkey(
            id,
            nom,
            prenom,
            specialites
          )
        `)
        .order("date", { ascending: true });

      if (startDate) {
        query = query.gte("date", startDate);
      }
      if (endDate) {
        query = query.lte("date", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook with mutations for managing disponibilites and recurrences
 */
export function useFormateurPlanningMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Create disponibilite
  const createDisponibilite = useMutation({
    mutationFn: async (input: CreateDisponibiliteInput) => {
      const { data, error } = await supabase
        .from("formateur_disponibilites")
        .insert({
          user_id: input.user_id,
          date: input.date,
          type: input.type,
          periode: input.periode || null,
          heure_debut: input.heure_debut || null,
          heure_fin: input.heure_fin || null,
          notes: input.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as FormateurDisponibilite;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.formateur.disponibilites.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.planning.disponibilites(),
      });
    },
  });

  // Update disponibilite
  const updateDisponibilite = useMutation({
    mutationFn: async (input: UpdateDisponibiliteInput) => {
      const { id, ...updateData } = input;
      const { data, error } = await supabase
        .from("formateur_disponibilites")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as FormateurDisponibilite;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.formateur.disponibilites.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.planning.disponibilites(),
      });
    },
  });

  // Delete disponibilite
  const deleteDisponibilite = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("formateur_disponibilites")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.formateur.disponibilites.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.planning.disponibilites(),
      });
    },
  });

  // Create recurrence
  const createRecurrence = useMutation({
    mutationFn: async (input: CreateRecurrenceInput) => {
      const { data, error } = await supabase
        .from("formateur_recurrences")
        .insert({
          user_id: input.user_id,
          jour_semaine: input.jour_semaine,
          type: input.type,
          heure_debut: input.heure_debut || null,
          heure_fin: input.heure_fin || null,
          date_debut: input.date_debut || null,
          date_fin: input.date_fin || null,
          notes: input.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as FormateurRecurrence;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.planning.recurrences(),
      });
    },
  });

  // Update recurrence
  const updateRecurrence = useMutation({
    mutationFn: async (input: UpdateRecurrenceInput) => {
      const { id, ...updateData } = input;
      const { data, error } = await supabase
        .from("formateur_recurrences")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as FormateurRecurrence;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.planning.recurrences(),
      });
    },
  });

  // Delete recurrence
  const deleteRecurrence = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("formateur_recurrences")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.planning.recurrences(),
      });
    },
  });

  // Bulk create disponibilites for multiple dates
  const bulkCreateDisponibilites = useMutation({
    mutationFn: async (inputs: CreateDisponibiliteInput[]) => {
      const { data, error } = await supabase
        .from("formateur_disponibilites")
        .insert(
          inputs.map((input) => ({
            user_id: input.user_id,
            date: input.date,
            type: input.type,
            periode: input.periode || null,
            heure_debut: input.heure_debut || null,
            heure_fin: input.heure_fin || null,
            notes: input.notes || null,
          }))
        )
        .select();

      if (error) throw error;
      return data as FormateurDisponibilite[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.formateur.disponibilites.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.planning.disponibilites(),
      });
    },
  });

  return {
    createDisponibilite,
    updateDisponibilite,
    deleteDisponibilite,
    createRecurrence,
    updateRecurrence,
    deleteRecurrence,
    bulkCreateDisponibilites,
  };
}

/**
 * Helper to get display info for disponibilite type
 */
export function getDisponibiliteTypeInfo(type: DisponibiliteType) {
  switch (type) {
    case "disponible":
      return {
        label: "Disponible",
        color: "bg-green-500",
        textColor: "text-green-600",
        bgColor: "bg-green-500/10",
        borderColor: "border-green-500",
      };
    case "partiel":
      return {
        label: "Partiel",
        color: "bg-orange-500",
        textColor: "text-orange-600",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500",
      };
    case "indisponible":
      return {
        label: "Indisponible",
        color: "bg-red-500",
        textColor: "text-red-600",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500",
      };
    default:
      return {
        label: "Inconnu",
        color: "bg-gray-500",
        textColor: "text-gray-600",
        bgColor: "bg-gray-500/10",
        borderColor: "border-gray-500",
      };
  }
}

/**
 * Helper to get day name in French
 */
export function getJourSemaine(index: number): string {
  const jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  return jours[index] || "";
}
