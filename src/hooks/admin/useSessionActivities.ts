"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface SessionActivity {
  id: string;
  session_id: string;
  type: string;
  description: string;
  metadata?: Record<string, unknown>;
  user_id?: string;
  user_name?: string;
  created_at: string;
}

export const ACTIVITY_TYPES = {
  session_created: { label: "Session créée", icon: "plus", color: "emerald" },
  session_updated: { label: "Session modifiée", icon: "edit", color: "blue" },
  participant_added: { label: "Participant ajouté", icon: "user-plus", color: "emerald" },
  participant_cancelled: { label: "Inscription annulée", icon: "user-minus", color: "red" },
  formateur_assigned: { label: "Formateur assigné", icon: "graduation-cap", color: "purple" },
  formateur_removed: { label: "Formateur retiré", icon: "user-x", color: "amber" },
  status_changed: { label: "Statut modifié", icon: "refresh", color: "blue" },
  dates_changed: { label: "Dates modifiées", icon: "calendar", color: "amber" },
  places_changed: { label: "Places modifiées", icon: "users", color: "amber" },
  notification_sent: { label: "Notification envoyée", icon: "bell", color: "blue" },
  document_generated: { label: "Document généré", icon: "file", color: "emerald" },
  message_sent: { label: "Message envoyé", icon: "message", color: "blue" },
} as const;

async function fetchSessionActivities(sessionId: string): Promise<SessionActivity[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("session_activities")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching activities:", error);
    return [];
  }

  return data || [];
}

export function useSessionActivities(sessionId: string) {
  const queryClient = useQueryClient();
  const [realtimeActivities, setRealtimeActivities] = useState<SessionActivity[]>([]);

  const query = useQuery({
    queryKey: ["session-activities", sessionId],
    queryFn: () => fetchSessionActivities(sessionId),
    staleTime: 30 * 1000,
    enabled: !!sessionId,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!sessionId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`session-activities-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "session_activities",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newActivity = payload.new as SessionActivity;
          setRealtimeActivities((prev) => [newActivity, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Combine query data with realtime activities
  const allActivities = [
    ...realtimeActivities.filter(
      (ra) => !(query.data || []).some((qa) => qa.id === ra.id)
    ),
    ...(query.data || []),
  ];

  return {
    ...query,
    data: allActivities,
  };
}

export function useSessionActivityMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const logActivity = useMutation({
    mutationFn: async ({
      sessionId,
      type,
      description,
      metadata,
      userId,
      userName,
    }: {
      sessionId: string;
      type: string;
      description: string;
      metadata?: Record<string, unknown>;
      userId?: string;
      userName?: string;
    }) => {
      const { data, error } = await supabase
        .from("session_activities")
        .insert({
          session_id: sessionId,
          type,
          description,
          metadata,
          user_id: userId,
          user_name: userName,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["session-activities", variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ["admin-session-detail", variables.sessionId] });
    },
  });

  return { logActivity };
}
