"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface SessionMessage {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_type: string;
  sender_name?: string | null;
  content: string;
  created_at: string;
  read_at?: string | null;
  edited_at?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
}

/**
 * Fetch messages for a conversation
 * @param conversationId - The ID from session_conversations table (NOT session.id)
 */
async function fetchMessages(conversationId: string): Promise<SessionMessage[]> {
  const supabase = createClient();

  console.log("[SessionMessages] Fetching messages for conversation:", conversationId);

  const { data, error } = await supabase
    .from("session_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[SessionMessages] Error fetching:", error.message, error.code, error.details);
    return [];
  }

  console.log("[SessionMessages] Fetched", data?.length || 0, "messages");
  return data || [];
}

/**
 * Hook to fetch and subscribe to messages for a conversation
 * @param conversationId - The ID from session_conversations table (NOT session.id)
 *
 * Usage:
 * 1. First get conversation with useSessionConversation(sessionId)
 * 2. Then use this hook with conversation.id
 */
export function useSessionMessages(conversationId: string | null | undefined) {
  const [realtimeMessages, setRealtimeMessages] = useState<SessionMessage[]>([]);

  const query = useQuery({
    queryKey: ["session-messages", conversationId],
    queryFn: () => fetchMessages(conversationId!),
    staleTime: 30 * 1000,
    enabled: !!conversationId,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    // Clear realtime messages when conversation changes
    setRealtimeMessages([]);

    const supabase = createClient();

    const channel = supabase
      .channel(`conversation-messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "session_messages",
          filter: `conversation_id=eq.${conversationId}`,
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
  }, [conversationId]);

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

/**
 * Hook for message mutations (send, etc.)
 */
export function useSessionMessageMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const sendMessage = useMutation({
    mutationFn: async ({
      conversationId,
      content,
      senderId,
      senderType = "admin",
      senderName,
    }: {
      conversationId: string;
      content: string;
      senderId: string;
      senderType?: string;
      senderName?: string;
    }) => {
      console.log("[SessionMessages] Sending message to conversation:", conversationId);

      const { data, error } = await supabase
        .from("session_messages")
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          sender_type: senderType,
          sender_name: senderName,
          content,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("[SessionMessages] Error sending:", error.message, error.code, error.details);
        throw error;
      }

      console.log("[SessionMessages] Message sent successfully:", data.id);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["session-messages", variables.conversationId] });
    },
  });

  return { sendMessage };
}
