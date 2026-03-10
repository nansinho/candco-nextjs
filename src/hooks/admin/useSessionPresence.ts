"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { eachDayOfInterval, parseISO, format } from "date-fns";

// Types

export interface Creneau {
  date: string; // YYYY-MM-DD
  heure_debut: string; // HH:mm
  heure_fin: string; // HH:mm
  type: "matin" | "apres_midi";
}

export interface PresenceRecord {
  id: string;
  date: string;
  inscription_id: string;
  present: boolean | null;
  signature_apprenant: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface InscriptionForPresence {
  id: string;
  nom: string | null;
  prenom: string | null;
  email: string | null;
  client_id: string | null;
  status: string;
}

export interface SessionForCreneaux {
  start_date: string;
  end_date: string | null;
  horaires_matin_debut: string | null;
  horaires_matin_fin: string | null;
  horaires_apres_midi_debut: string | null;
  horaires_apres_midi_fin: string | null;
  horaires_par_jour: Record<string, { matin_debut?: string; matin_fin?: string; apres_midi_debut?: string; apres_midi_fin?: string }> | null;
}

// Helper: generate créneaux from session schedule

export function generateCreneaux(session: SessionForCreneaux): Creneau[] {
  const startDate = parseISO(session.start_date);
  const endDate = session.end_date ? parseISO(session.end_date) : startDate;
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const creneaux: Creneau[] = [];

  for (const day of days) {
    const dateStr = format(day, "yyyy-MM-dd");
    const daySchedule = session.horaires_par_jour?.[dateStr];

    const matinDebut = daySchedule?.matin_debut ?? session.horaires_matin_debut;
    const matinFin = daySchedule?.matin_fin ?? session.horaires_matin_fin;
    const apremDebut = daySchedule?.apres_midi_debut ?? session.horaires_apres_midi_debut;
    const apremFin = daySchedule?.apres_midi_fin ?? session.horaires_apres_midi_fin;

    if (matinDebut && matinFin) {
      creneaux.push({
        date: dateStr,
        heure_debut: matinDebut,
        heure_fin: matinFin,
        type: "matin",
      });
    }

    if (apremDebut && apremFin) {
      creneaux.push({
        date: dateStr,
        heure_debut: apremDebut,
        heure_fin: apremFin,
        type: "apres_midi",
      });
    }

    // If no specific schedule, add a single slot for the whole day
    if (!matinDebut && !matinFin && !apremDebut && !apremFin) {
      creneaux.push({
        date: dateStr,
        heure_debut: "09:00",
        heure_fin: "17:00",
        type: "matin",
      });
    }
  }

  return creneaux;
}

// Query: fetch presence data for a session

async function fetchSessionPresence(sessionId: string) {
  const supabase = createClient();

  const [presenceResult, inscriptionsResult] = await Promise.all([
    supabase
      .from("feuilles_presence")
      .select("*")
      .eq("session_id", sessionId),
    supabase
      .from("inscriptions")
      .select("id, nom, prenom, email, client_id, status")
      .eq("session_id", sessionId)
      .neq("status", "annulee")
      .order("nom", { ascending: true }),
  ]);

  if (presenceResult.error) throw presenceResult.error;
  if (inscriptionsResult.error) throw inscriptionsResult.error;

  return {
    presences: (presenceResult.data || []) as PresenceRecord[],
    inscriptions: (inscriptionsResult.data || []) as InscriptionForPresence[],
  };
}

export function useSessionPresence(sessionId: string) {
  return useQuery({
    queryKey: ["session-presence", sessionId],
    queryFn: () => fetchSessionPresence(sessionId),
    staleTime: 30 * 1000,
  });
}

// Mutation: mark presence (upsert)

interface MarkPresenceParams {
  sessionId: string;
  inscriptionId: string;
  date: string;
  present: boolean;
}

export function useMarkPresence() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, inscriptionId, date, present }: MarkPresenceParams) => {
      const supabase = createClient();

      // Check if a record already exists
      const { data: existing } = await supabase
        .from("feuilles_presence")
        .select("id")
        .eq("session_id", sessionId)
        .eq("inscription_id", inscriptionId)
        .eq("date", date)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("feuilles_presence")
          .update({ present, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("feuilles_presence")
          .insert({
            session_id: sessionId,
            inscription_id: inscriptionId,
            date,
            present,
          });
        if (error) throw error;
      }
    },
    onMutate: async ({ sessionId, inscriptionId, date, present }) => {
      await queryClient.cancelQueries({ queryKey: ["session-presence", sessionId] });
      const previous = queryClient.getQueryData<{ presences: PresenceRecord[]; inscriptions: InscriptionForPresence[] }>(
        ["session-presence", sessionId]
      );

      if (previous) {
        const existingIndex = previous.presences.findIndex(
          (p) => p.inscription_id === inscriptionId && p.date === date
        );
        const updatedPresences = [...previous.presences];

        if (existingIndex >= 0) {
          updatedPresences[existingIndex] = { ...updatedPresences[existingIndex], present };
        } else {
          updatedPresences.push({
            id: `temp-${Date.now()}`,
            date,
            inscription_id: inscriptionId,
            present,
            signature_apprenant: null,
            notes: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }

        queryClient.setQueryData(["session-presence", sessionId], {
          ...previous,
          presences: updatedPresences,
        });
      }

      return { previous };
    },
    onError: (_err, { sessionId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["session-presence", sessionId], context.previous);
      }
    },
    onSettled: (_data, _error, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ["session-presence", sessionId] });
    },
  });
}
