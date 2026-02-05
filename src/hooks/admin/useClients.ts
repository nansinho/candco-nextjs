"use client";

/**
 * @file useClients.ts
 * @description Hook React Query pour la gestion des clients avec hiérarchie siège/agences
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

// ============== Types ==============

export type ClientType = "standalone" | "siege" | "agence" | "filiale" | "franchise";

export type ClientRole =
  | "directeur_general"
  | "responsable_formation"
  | "directeur_agence"
  | "responsable_pole"
  | "manager"
  | "collaborateur";

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
  created_at: string;
  organization_id: string | null;
  sessions_count: number;
  // Hierarchy fields
  client_type: ClientType;
  parent_client_id: string | null;
  parent_client_nom?: string | null;
  // Region field
  region: string | null;
}

export interface ClientFormData {
  nom: string;
  siret: string;
  siren: string;
  adresse: string;
  code_postal: string;
  ville: string;
  telephone: string;
  email: string;
  contact_nom: string;
  contact_prenom: string;
  contact_email: string;
  contact_telephone: string;
  website: string;
  notes: string;
  forme_juridique: string;
  naf_code: string;
  effectif_entreprise: string;
  active: boolean;
  organization_id: string;
  client_type?: ClientType;
  parent_client_id?: string;
  region?: string;
}

// ============== Constants ==============

const STALE_TIME = 2 * 60 * 1000; // 2 minutes
const GC_TIME = 5 * 60 * 1000; // 5 minutes

// French regions for display
export const FRENCH_REGIONS: Record<string, string> = {
  ARA: "Auvergne-Rhône-Alpes",
  BFC: "Bourgogne-Franche-Comté",
  BRE: "Bretagne",
  CVL: "Centre-Val de Loire",
  COR: "Corse",
  GES: "Grand Est",
  HDF: "Hauts-de-France",
  IDF: "Île-de-France",
  NOR: "Normandie",
  NAQ: "Nouvelle-Aquitaine",
  OCC: "Occitanie",
  PDL: "Pays de la Loire",
  PAC: "Provence-Alpes-Côte d'Azur",
  GUA: "Guadeloupe",
  MTQ: "Martinique",
  GUF: "Guyane",
  REU: "La Réunion",
  MYT: "Mayotte",
};

// ============== Hierarchy Helpers ==============

export interface ClientWithChildren extends Client {
  children: Client[];
  childrenByRegion?: Map<string, Client[]>;
}

/**
 * Groups clients hierarchically (siege with their agencies)
 */
export function groupClientsHierarchically(clients: Client[]): ClientWithChildren[] {
  // Separate siege/standalone from agencies
  const roots: ClientWithChildren[] = [];
  const childrenByParent = new Map<string, Client[]>();

  // First pass: separate roots from children
  clients.forEach(client => {
    if (client.parent_client_id) {
      // This is a child (agency)
      const children = childrenByParent.get(client.parent_client_id) || [];
      children.push(client);
      childrenByParent.set(client.parent_client_id, children);
    } else {
      // This is a root (siege or standalone)
      roots.push({ ...client, children: [], childrenByRegion: new Map() });
    }
  });

  // Second pass: attach children to their parents and group by region
  roots.forEach(root => {
    const children = childrenByParent.get(root.id) || [];
    root.children = children.sort((a, b) => {
      // Sort by region first, then by name
      const regionA = a.region || "ZZZ"; // Put null regions at the end
      const regionB = b.region || "ZZZ";
      if (regionA !== regionB) {
        return regionA.localeCompare(regionB);
      }
      return a.nom.localeCompare(b.nom);
    });

    // Group children by region
    const byRegion = new Map<string, Client[]>();
    children.forEach(child => {
      const region = child.region || "NON_DEFINIE";
      const regionClients = byRegion.get(region) || [];
      regionClients.push(child);
      byRegion.set(region, regionClients);
    });
    root.childrenByRegion = byRegion;
  });

  // Handle orphan agencies (parent not in current list)
  childrenByParent.forEach((children, parentId) => {
    if (!roots.find(r => r.id === parentId)) {
      // These are orphan agencies, add them as standalone
      children.forEach(child => {
        roots.push({ ...child, children: [], childrenByRegion: new Map() });
      });
    }
  });

  // Sort roots by name
  return roots.sort((a, b) => a.nom.localeCompare(b.nom));
}

/**
 * Filters out agencies from client list
 * Agencies are sub-structures, not billable clients
 */
export function filterBillableClients(clients: Client[]): Client[] {
  return clients.filter(c => c.client_type !== 'agence');
}

/**
 * Get count of billable clients (excludes agencies)
 */
export function countBillableClients(clients: Client[]): number {
  return clients.filter(c => c.client_type !== 'agence').length;
}

/**
 * Get count of agencies
 */
export function countAgencies(clients: Client[]): number {
  return clients.filter(c => c.client_type === 'agence').length;
}

// ============== Hooks ==============

async function fetchClients(): Promise<Client[]> {
  const supabase = createClient();

  // Fetch clients and sessions count in parallel
  const [clientsRes, sessionsCountRes] = await Promise.all([
    supabase
      .from("clients")
      .select(`
        id, nom, siret, siren, email, telephone, adresse, code_postal, ville,
        contact_nom, contact_prenom, contact_email, contact_telephone,
        active, notes, organization_id, created_at, updated_at,
        website, forme_juridique, naf_code, effectif_entreprise,
        client_type, parent_client_id, region
      `)
      .order("nom"),
    supabase
      .from("session_clients")
      .select("client_id"),
  ]);

  if (clientsRes.error) throw clientsRes.error;

  // Count sessions per client via session_clients
  const sessionCounts = new Map<string, number>();
  if (sessionsCountRes.data) {
    sessionsCountRes.data.forEach((sc: { client_id: string }) => {
      const clientId = sc.client_id;
      sessionCounts.set(clientId, (sessionCounts.get(clientId) || 0) + 1);
    });
  }

  // Build a map for parent client names
  const clientMap = new Map<string, string>();
  (clientsRes.data || []).forEach((client: { id: string; nom: string }) => {
    clientMap.set(client.id, client.nom);
  });

  return (clientsRes.data || []).map((client: any) => ({
    ...client,
    sessions_count: sessionCounts.get(client.id) || 0,
    client_type: (client.client_type || "standalone") as ClientType,
    parent_client_nom: client.parent_client_id ? clientMap.get(client.parent_client_id) : null,
  })) as Client[];
}

export function useClients() {
  return useQuery({
    queryKey: queryKeys.admin.clients.all,
    queryFn: fetchClients,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useOrganizationsForClients() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin-organizations-for-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data || [];
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });
}

export function useClientMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const saveClient = useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: Partial<ClientFormData> }) => {
      const clientData = {
        nom: data.nom?.trim(),
        siret: data.siret?.trim() || null,
        siren: data.siren?.trim() || null,
        adresse: data.adresse?.trim() || null,
        code_postal: data.code_postal?.trim() || null,
        ville: data.ville?.trim() || null,
        telephone: data.telephone?.trim() || null,
        email: data.email?.trim() || null,
        contact_nom: data.contact_nom?.trim() || null,
        contact_prenom: data.contact_prenom?.trim() || null,
        contact_email: data.contact_email?.trim() || null,
        contact_telephone: data.contact_telephone?.trim() || null,
        website: data.website?.trim() || null,
        notes: data.notes?.trim() || null,
        forme_juridique: data.forme_juridique?.trim() || null,
        naf_code: data.naf_code?.trim() || null,
        effectif_entreprise: data.effectif_entreprise?.trim() || null,
        active: data.active ?? true,
        organization_id: data.organization_id || null,
        client_type: data.client_type || "standalone",
        parent_client_id: data.parent_client_id || null,
        region: data.region || null,
      };

      if (id) {
        const { error } = await supabase
          .from("clients")
          .update(clientData)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("clients").insert([clientData]);
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.clients.all });
      toast.success(variables.id ? "Client mis à jour" : "Client créé");
    },
    onError: (error: any) => {
      console.error("Error saving client:", error);
      toast.error("Impossible de sauvegarder le client");
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.clients.all });
      toast.success("Client supprimé");
    },
    onError: (error: any) => {
      console.error("Error deleting client:", error);
      toast.error("Impossible de supprimer le client");
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
      toast.success("Statut mis à jour");
    },
  });

  const checkDuplicateSiret = async (siret: string, excludeId?: string): Promise<{ id: string; nom: string } | null> => {
    if (!siret.trim()) return null;

    let query = supabase
      .from("clients")
      .select("id, nom")
      .eq("siret", siret.trim());

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query.maybeSingle();
    return data;
  };

  return {
    saveClient,
    deleteClient,
    toggleActive,
    checkDuplicateSiret,
  };
}
