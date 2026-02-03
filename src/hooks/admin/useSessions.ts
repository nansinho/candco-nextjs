"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export interface SessionWithData {
  id: string;
  formation_id: string;
  start_date: string;
  end_date: string | null;
  lieu: string;
  places_max: number;
  places_disponibles: number;
  status: string;
  formateur_id: string | null;
  format_type?: string;
  formation_title?: string;
  pole?: string;
  pole_name?: string;
  formateur_name?: string;
  inscriptions_count: number;
}

async function fetchSessions(): Promise<SessionWithData[]> {
  const supabase = createClient();

  // Fetch sessions
  const { data: sessionsData, error: sessionsError } = await supabase
    .from("sessions")
    .select(`
      id,
      formation_id,
      start_date,
      end_date,
      lieu,
      places_max,
      places_disponibles,
      status,
      formateur_id,
      format_type
    `)
    .order("start_date", { ascending: false });

  if (sessionsError) throw sessionsError;
  if (!sessionsData || sessionsData.length === 0) return [];

  type RawSession = { id: string; formation_id: string; formateur_id?: string };

  // Get unique formation IDs
  const formationIds = [...new Set(sessionsData.map((s: RawSession) => s.formation_id))];

  // Fetch formations
  const { data: formationsData } = await supabase
    .from("formations")
    .select("id, title, pole, pole_name")
    .in("id", formationIds);

  // Get unique formateur IDs
  const formateurIds = [
    ...new Set(sessionsData.filter((s: RawSession) => s.formateur_id).map((s: RawSession) => s.formateur_id)),
  ];

  // Fetch formateurs if any
  let formateursData: { id: string; nom: string; prenom: string }[] = [];
  if (formateurIds.length > 0) {
    const { data } = await supabase
      .from("formateurs")
      .select("id, nom, prenom")
      .in("id", formateurIds as string[]);
    formateursData = data || [];
  }

  // Count inscriptions per session
  const sessionIds = sessionsData.map((s: RawSession) => s.id);
  const { data: inscriptionsData } = await supabase
    .from("inscriptions")
    .select("session_id")
    .in("session_id", sessionIds)
    .neq("status", "annulee");

  const inscriptionsCounts: Record<string, number> = {};
  inscriptionsData?.forEach((i: { session_id: string }) => {
    inscriptionsCounts[i.session_id] = (inscriptionsCounts[i.session_id] || 0) + 1;
  });

  // Build maps
  const formationsMap: Record<string, { title: string; pole: string; pole_name: string }> = {};
  formationsData?.forEach((f: { id: string; title: string; pole: string; pole_name: string }) => {
    formationsMap[f.id] = { title: f.title, pole: f.pole, pole_name: f.pole_name };
  });

  const formateursMap: Record<string, string> = {};
  formateursData.forEach((f) => {
    formateursMap[f.id] = `${f.prenom} ${f.nom}`;
  });

  return sessionsData.map((session: RawSession & { formation_id: string }) => ({
    ...session,
    formation_title: formationsMap[session.formation_id]?.title || "Formation inconnue",
    pole: formationsMap[session.formation_id]?.pole || "",
    pole_name: formationsMap[session.formation_id]?.pole_name || "",
    formateur_name: session.formateur_id ? formateursMap[session.formateur_id] : undefined,
    inscriptions_count: inscriptionsCounts[session.id] || 0,
  }));
}

export function useSessions() {
  return useQuery({
    queryKey: queryKeys.admin.sessions.list(),
    queryFn: fetchSessions,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export interface CreateSessionInput {
  formation_id: string;
  start_date: string;
  end_date?: string | null;
  lieu: string;
  places_max: number;
  formateur_id?: string | null;
  format_type?: string;
  status?: string;
}

export interface UpdateSessionInput {
  formation_id?: string;
  start_date?: string;
  end_date?: string | null;
  lieu?: string;
  places_max?: number;
  places_disponibles?: number;
  formateur_id?: string | null;
  format_type?: string;
  status?: string;
}

export function useSessionMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const createSession = useMutation({
    mutationFn: async (input: CreateSessionInput) => {
      const { error, data } = await supabase.from("sessions").insert({
        ...input,
        status: input.status || "planifiee",
        places_disponibles: input.places_max,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.sessions.all });
    },
  });

  const updateSession = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSessionInput }) => {
      const { error } = await supabase.from("sessions").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.sessions.all });
    },
  });

  const deleteSession = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.sessions.all });
    },
  });

  const duplicateSession = useMutation({
    mutationFn: async (session: SessionWithData) => {
      const { id, formation_title, pole, pole_name, formateur_name, inscriptions_count, ...sessionData } = session;
      const { error } = await supabase.from("sessions").insert({
        ...sessionData,
        status: "planifiee",
        places_disponibles: sessionData.places_max,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.sessions.all });
    },
  });

  return { createSession, updateSession, deleteSession, duplicateSession };
}
