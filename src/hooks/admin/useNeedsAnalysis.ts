"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export interface NeedsAnalysisResponse {
  id: string;
  respondent_name: string | null;
  respondent_email: string | null;
  respondent_role: string | null;
  client_id: string | null;
  client_name?: string | null;
  session_id: string | null;
  formation_request_id: string | null;
  inscription_id: string | null;
  template_id: string;
  responses: Record<string, unknown>;
  submitted_at: string | null;
  completed_at: string | null;
  analyzed_at: string | null;
  analyzed_by: string | null;
  analysis_notes: string | null;
  created_at: string | null;
  // Computed fields
  status: "new" | "in_progress" | "completed" | "pending";
  formations: string[];
}

async function fetchNeedsAnalysis(): Promise<NeedsAnalysisResponse[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("needs_analysis_responses")
    .select(`
      *,
      clients:client_id(id, name)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((item) => {
    // Determine status based on dates
    let status: "new" | "in_progress" | "completed" | "pending" = "new";
    if (item.analyzed_at) {
      status = "completed";
    } else if (item.completed_at) {
      status = "in_progress";
    } else if (item.submitted_at) {
      status = "pending";
    }

    // Extract formations from responses if available
    const formations: string[] = [];
    if (item.responses && typeof item.responses === "object") {
      const resp = item.responses as Record<string, unknown>;
      if (Array.isArray(resp.formations)) {
        formations.push(...(resp.formations as string[]));
      }
      if (resp.formation_souhaitee) {
        formations.push(String(resp.formation_souhaitee));
      }
    }

    return {
      ...item,
      client_name: (item.clients as { name: string } | null)?.name || null,
      status,
      formations,
    };
  });
}

export function useNeedsAnalysis() {
  return useQuery({
    queryKey: queryKeys.admin.needsAnalysis?.list?.() || ["admin", "needs-analysis"],
    queryFn: fetchNeedsAnalysis,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useNeedsAnalysisMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ id, analyzed_at, analysis_notes }: { id: string; analyzed_at?: string; analysis_notes?: string }) => {
      const { error } = await supabase
        .from("needs_analysis_responses")
        .update({
          analyzed_at: analyzed_at || new Date().toISOString(),
          analysis_notes,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "needs-analysis"] });
    },
  });

  const deleteAnalysis = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("needs_analysis_responses")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "needs-analysis"] });
    },
  });

  return { updateStatus, deleteAnalysis };
}
