"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export interface UpcomingSession {
  id: string;
  start_date: string;
  end_date: string | null;
  lieu: string;
  places_max: number;
  places_disponibles: number;
  inscriptions_count: number;
  status: string;
  formation_id: string;
  formation_title: string;
  formation_pole: string;
}

export interface RecentInscription {
  id: string;
  created_at: string;
  status: string;
  nom: string;
  prenom: string;
  email: string;
  formation_title: string;
  session_date: string;
}

export interface DashboardData {
  upcomingSessions: UpcomingSession[];
  recentInscriptions: RecentInscription[];
}

async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = createClient();
  const now = new Date().toISOString();

  // Fetch upcoming sessions with formation details
  const { data: sessionsData, error: sessionsError } = await supabase
    .from("sessions")
    .select(`
      id,
      start_date,
      end_date,
      lieu,
      places_max,
      places_disponibles,
      status,
      formation_id
    `)
    .in("status", ["planifiee", "confirmee"])
    .gte("start_date", now)
    .order("start_date", { ascending: true })
    .limit(5);

  if (sessionsError) {
    console.error("Error fetching sessions:", sessionsError);
  }

  // Get formation details and inscriptions count for sessions
  let upcomingSessions: UpcomingSession[] = [];
  if (sessionsData && sessionsData.length > 0) {
    const formationIds = [...new Set(sessionsData.map((s) => s.formation_id))];
    const sessionIds = sessionsData.map((s) => s.id);

    // Fetch formations
    const { data: formationsData } = await supabase
      .from("formations")
      .select("id, title, pole")
      .in("id", formationIds);

    // Count inscriptions per session (excluding cancelled)
    const { data: inscriptionsData } = await supabase
      .from("inscriptions")
      .select("session_id")
      .in("session_id", sessionIds)
      .neq("status", "annulee");

    const inscriptionsCounts: Record<string, number> = {};
    inscriptionsData?.forEach((i: { session_id: string }) => {
      inscriptionsCounts[i.session_id] = (inscriptionsCounts[i.session_id] || 0) + 1;
    });

    const formationsMap: Record<string, { title: string; pole: string }> = {};
    formationsData?.forEach((f) => {
      formationsMap[f.id] = { title: f.title, pole: f.pole };
    });

    upcomingSessions = sessionsData.map((session) => ({
      ...session,
      formation_title: formationsMap[session.formation_id]?.title || "Formation inconnue",
      formation_pole: formationsMap[session.formation_id]?.pole || "",
      inscriptions_count: inscriptionsCounts[session.id] || 0,
    }));
  }

  // Fetch recent inscriptions
  const { data: inscriptionsData, error: inscriptionsError } = await supabase
    .from("inscriptions")
    .select(`
      id,
      created_at,
      status,
      nom,
      prenom,
      email,
      session_id
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  if (inscriptionsError) {
    console.error("Error fetching inscriptions:", inscriptionsError);
  }

  // Get session and formation details for inscriptions
  let recentInscriptions: RecentInscription[] = [];
  if (inscriptionsData && inscriptionsData.length > 0) {
    const sessionIds = [...new Set(inscriptionsData.map((i) => i.session_id))];
    const { data: sessionsForInscriptions } = await supabase
      .from("sessions")
      .select("id, start_date, formation_id")
      .in("id", sessionIds);

    const formationIdsForInscriptions = [
      ...new Set(sessionsForInscriptions?.map((s) => s.formation_id) || []),
    ];
    const { data: formationsForInscriptions } = await supabase
      .from("formations")
      .select("id, title")
      .in("id", formationIdsForInscriptions);

    const sessionsMap: Record<string, { start_date: string; formation_id: string }> = {};
    sessionsForInscriptions?.forEach((s) => {
      sessionsMap[s.id] = { start_date: s.start_date, formation_id: s.formation_id };
    });

    const formationsMapForInscriptions: Record<string, string> = {};
    formationsForInscriptions?.forEach((f) => {
      formationsMapForInscriptions[f.id] = f.title;
    });

    recentInscriptions = inscriptionsData.map((inscription) => {
      const session = sessionsMap[inscription.session_id];
      return {
        id: inscription.id,
        created_at: inscription.created_at,
        status: inscription.status,
        nom: inscription.nom || "",
        prenom: inscription.prenom || "",
        email: inscription.email || "",
        formation_title: session
          ? formationsMapForInscriptions[session.formation_id] || "Formation inconnue"
          : "Formation inconnue",
        session_date: session?.start_date || "",
      };
    });
  }

  return { upcomingSessions, recentInscriptions };
}

export function useDashboardData() {
  return useQuery({
    queryKey: [...queryKeys.admin.dashboard.all, "data"],
    queryFn: fetchDashboardData,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
