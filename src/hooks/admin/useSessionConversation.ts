"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface SessionConversation {
  id: string;
  session_id: string;
  type: string;
  participant_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Get or create a conversation for a session
 * The session_messages table requires a conversation_id that references session_conversations
 */
async function getOrCreateSessionConversation(
  sessionId: string,
  type: string = "admin"
): Promise<SessionConversation> {
  const supabase = createClient();

  // First, try to find existing conversation for this session and type
  const { data: existing, error: fetchError } = await supabase
    .from("session_conversations")
    .select("*")
    .eq("session_id", sessionId)
    .eq("type", type)
    .maybeSingle();

  if (existing && !fetchError) {
    return existing;
  }

  // If not found, create a new conversation
  const { data: created, error: createError } = await supabase
    .from("session_conversations")
    .insert({
      session_id: sessionId,
      type: type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (createError) {
    console.error("Error creating conversation:", createError);
    throw createError;
  }

  return created;
}

/**
 * Hook to get or create a session conversation
 * Use the returned conversation.id for session_messages queries
 */
export function useSessionConversation(sessionId: string, type: string = "admin") {
  return useQuery({
    queryKey: ["session-conversation", sessionId, type],
    queryFn: () => getOrCreateSessionConversation(sessionId, type),
    staleTime: 10 * 60 * 1000, // Conversation IDs are stable, cache for 10 minutes
    gcTime: 30 * 60 * 1000,
    enabled: !!sessionId,
    retry: 2,
  });
}
