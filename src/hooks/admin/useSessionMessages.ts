"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface SessionMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: string;
  sender_name?: string;
  content: string;
  created_at: string;
  read_at?: string;
  edited_at?: string;
  deleted_at?: string;
  deleted_by?: string;
}

async function fetchSessionMessages(sessionId: string): Promise<SessionMessage[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("session_messages")
    .select("*")
    .eq("conversation_id", sessionId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data || [];
}

export function useSessionMessages(sessionId: string) {
  const queryClient = useQueryClient();
  const [realtimeMessages, setRealtimeMessages] = useState<SessionMessage[]>([]);

  const query = useQuery({
    queryKey: ["session-messages", sessionId],
    queryFn: () => fetchSessionMessages(sessionId),
    staleTime: 30 * 1000,
    enabled: !!sessionId,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!sessionId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`session-messages-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "session_messages",
          filter: `conversation_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMessage = payload.new as SessionMessage;
          setRealtimeMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Combine query data with realtime messages
  const allMessages = [
    ...(query.data || []),
    ...realtimeMessages.filter(
      (rm) => !(query.data || []).some((qm) => qm.id === rm.id)
    ),
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return {
    ...query,
    data: allMessages,
  };
}

export function useSessionMessageMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const sendMessage = useMutation({
    mutationFn: async ({
      sessionId,
      content,
      senderId,
      senderType = "admin",
      senderName,
    }: {
      sessionId: string;
      content: string;
      senderId: string;
      senderType?: string;
      senderName?: string;
    }) => {
      const { data, error } = await supabase
        .from("session_messages")
        .insert({
          conversation_id: sessionId,
          sender_id: senderId,
          sender_type: senderType,
          sender_name: senderName,
          content,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["session-messages", variables.sessionId] });
    },
  });

  return { sendMessage };
}
