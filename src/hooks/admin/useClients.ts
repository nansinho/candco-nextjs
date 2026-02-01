"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export interface Client {
  id: string;
  nom: string;
  siret: string | null;
  siren: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  telephone: string | null;
  email: string | null;
  contact_nom: string | null;
  contact_prenom: string | null;
  contact_email: string | null;
  contact_telephone: string | null;
  website: string | null;
  notes: string | null;
  forme_juridique: string | null;
  naf_code: string | null;
  effectif_entreprise: string | null;
  active: boolean;
  organization_id: string | null;
  parent_client_id: string | null;
  region: string | null;
  client_type: "siege" | "filiale" | "etablissement" | null;
  created_at: string;
  sessions_count?: number;
}

export function useClients() {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.admin.clients.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("nom", { ascending: true });

      if (error) throw error;

      // Get sessions count for each client
      const clientIds = data.map((c: { id: string }) => c.id);
      const { data: inscriptionsData } = await supabase
        .from("inscriptions")
        .select("client_id")
        .in("client_id", clientIds);

      const sessionsCounts = clientIds.reduce((acc: Record<string, number>, id: string) => {
        acc[id] = inscriptionsData?.filter((i: { client_id: string }) => i.client_id === id).length || 0;
        return acc;
      }, {} as Record<string, number>);

      return (data as Client[]).map((c) => ({
        ...c,
        sessions_count: sessionsCounts[c.id] || 0,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useClientMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const saveClient = useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: Partial<Client> }) => {
      if (id) {
        const { error } = await supabase
          .from("clients")
          .update(data)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("clients")
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.clients.all });
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.clients.all });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("clients")
        .update({ active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.clients.all });
    },
  });

  return { saveClient, deleteClient, toggleActive };
}
