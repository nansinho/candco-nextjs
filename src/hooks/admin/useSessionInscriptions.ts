"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface CreateInscriptionInput {
  session_id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  client_id?: string;
  status?: string;
}

export interface UpdateInscriptionInput {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  client_id?: string;
  status?: string;
}

export function useSessionInscriptionMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const addParticipant = useMutation({
    mutationFn: async (input: CreateInscriptionInput) => {
      const { data, error } = await supabase
        .from("inscriptions")
        .insert({
          ...input,
          status: input.status || "en_attente",
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await supabase.from("session_activities").insert({
        session_id: input.session_id,
        type: "participant_added",
        description: `${input.prenom} ${input.nom} a été ajouté`,
        created_at: new Date().toISOString(),
      }).catch(() => {});

      // Update places_disponibles
      await supabase.rpc("decrement_places", { session_id: input.session_id }).catch(() => {});

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-session-detail", variables.session_id] });
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
    },
  });

  const updateInscription = useMutation({
    mutationFn: async ({ id, sessionId, data }: { id: string; sessionId: string; data: UpdateInscriptionInput }) => {
      const { error } = await supabase
        .from("inscriptions")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-session-detail", variables.sessionId] });
    },
  });

  const cancelInscription = useMutation({
    mutationFn: async ({ id, sessionId, participantName }: { id: string; sessionId: string; participantName: string }) => {
      const { error } = await supabase
        .from("inscriptions")
        .update({ status: "annulee" })
        .eq("id", id);

      if (error) throw error;

      // Log activity
      await supabase.from("session_activities").insert({
        session_id: sessionId,
        type: "participant_cancelled",
        description: `Inscription de ${participantName} annulée`,
        created_at: new Date().toISOString(),
      }).catch(() => {});

      // Update places_disponibles
      await supabase.rpc("increment_places", { session_id: sessionId }).catch(() => {});
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-session-detail", variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
    },
  });

  const deleteInscription = useMutation({
    mutationFn: async ({ id, sessionId }: { id: string; sessionId: string }) => {
      const { error } = await supabase
        .from("inscriptions")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-session-detail", variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
    },
  });

  return {
    addParticipant,
    updateInscription,
    cancelInscription,
    deleteInscription,
  };
}
