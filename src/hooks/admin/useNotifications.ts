"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface AdminNotification {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  type: string;
  link: string | null;
  metadata: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string | null;
}

export interface CreateNotificationInput {
  user_id: string;
  title: string;
  message?: string;
  type: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

async function fetchNotifications(): Promise<AdminNotification[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("admin_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  return data || [];
}

export function useNotifications() {
  return useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: fetchNotifications,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
}

export function useNotificationMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const createNotification = useMutation({
    mutationFn: async (input: CreateNotificationInput) => {
      const { error, data } = await supabase
        .from("admin_notifications")
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("admin_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("admin_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", userId)
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("admin_notifications")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });

  const deleteAllRead = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("admin_notifications")
        .delete()
        .eq("user_id", userId)
        .not("read_at", "is", null);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });

  return { createNotification, markAsRead, markAllAsRead, deleteNotification, deleteAllRead };
}
