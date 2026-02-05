/**
 * @file types.ts
 * @description Types partagés pour le système de messagerie unifié
 * @module Messaging/Types
 */

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: "admin" | "formateur" | "apprenant";
  sender_id: string | null;
  sender_name: string | null;
  content: string;
  read_at: string | null;
  created_at: string;
  edited_at?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
}

export interface Conversation {
  id: string;
  session_id: string;
  type: "formateur" | "apprenant" | "groupe";
  participant_id: string | null;
  created_at: string;
  participant_name?: string;
  role_badges?: Array<{ label: string; type: "formateur" | "apprenant" | "groupe" }>;
  unread_count?: number;
  last_message?: string;
  last_message_date?: string;
  formation_title?: string;
  session?: {
    id: string;
    start_date: string;
    end_date: string;
    formation_id: string;
  };
}

export type ViewMode = "admin" | "formateur" | "apprenant";

export interface SenderRoleMap {
  [userId: string]: string;
}
