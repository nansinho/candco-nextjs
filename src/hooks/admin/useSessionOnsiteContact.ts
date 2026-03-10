"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

// Types
export type ContactSource = "devis" | "rf" | "direction" | "manuel";

export interface OnsiteContact {
  id: string;
  session_id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  fonction: string;
  contact_source: ContactSource | null;
  source_ref_id: string | null;
  contact_type: string | null;
}

export interface ResolvedContact {
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  fonction: string;
  source: ContactSource;
  source_ref_id: string;
  source_label: string;
}

export interface SessionForResolution {
  id: string;
  formation_id: string;
  client_id: string | null;
  client_siret: string | null;
  ville: string | null;
}

// ─── Query: saved onsite contact ───

export function useSessionOnsiteContact(sessionId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.admin.sessions.onsiteContact(sessionId),
    queryFn: async (): Promise<OnsiteContact | null> => {
      const { data, error } = await supabase
        .from("session_contacts")
        .select("*")
        .eq("session_id", sessionId)
        .eq("contact_type", "sur_place")
        .maybeSingle();

      if (error) throw error;
      return data as OnsiteContact | null;
    },
    staleTime: 60 * 1000,
  });
}

// ─── Query: auto-resolve contact via priority cascade ───

async function resolveFromDevis(
  supabase: ReturnType<typeof createClient>,
  formationId: string,
  clientSiret: string
): Promise<ResolvedContact | null> {
  const { data, error } = await supabase
    .from("devis_requests")
    .select("id, contact_nom, contact_prenom, email, telephone, entreprise")
    .eq("formation_id", formationId)
    .eq("siret", clientSiret)
    .neq("status", "rejected")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    nom: data.contact_nom,
    prenom: data.contact_prenom,
    email: data.email,
    telephone: data.telephone,
    fonction: "Contact devis",
    source: "devis",
    source_ref_id: data.id,
    source_label: `Devis — ${data.entreprise}`,
  };
}

interface ClientUserProfile {
  id: string | null;
  user_id: string | null;
  client_id: string | null;
  client_role: string | null;
  client_nom: string | null;
  client_ville: string | null;
  first_name: string | null;
  last_name: string | null;
  user_telephone: string | null;
  scope_all_agencies: boolean | null;
  parent_client_id: string | null;
  departed_at: string | null;
}

async function resolveFromClientRole(
  supabase: ReturnType<typeof createClient>,
  clientId: string,
  sessionVille: string | null,
  role: "responsable_formation" | "directeur_agence"
): Promise<ResolvedContact | null> {
  // Get the client's parent to check the hierarchy
  const { data: client } = await supabase
    .from("clients")
    .select("id, parent_client_id")
    .eq("id", clientId)
    .single();

  const clientIds = [clientId];
  if (client?.parent_client_id) {
    clientIds.push(client.parent_client_id);
  }

  // Also find sibling agencies (children of the same parent)
  if (client?.parent_client_id) {
    const { data: siblings } = await supabase
      .from("clients")
      .select("id")
      .eq("parent_client_id", client.parent_client_id);
    siblings?.forEach((s: { id: string }) => {
      if (!clientIds.includes(s.id)) clientIds.push(s.id);
    });
  }

  // Fetch users with this role from the view
  const { data: users, error } = await supabase
    .from("client_users_with_profiles")
    .select("id, user_id, client_id, client_role, client_nom, client_ville, first_name, last_name, user_telephone, scope_all_agencies, parent_client_id, departed_at")
    .eq("client_role", role)
    .is("departed_at", null)
    .in("client_id", clientIds);

  if (error || !users || users.length === 0) {
    // Also check for scope_all_agencies users
    const { data: nationalUsers } = await supabase
      .from("client_users_with_profiles")
      .select("id, user_id, client_id, client_role, client_nom, client_ville, first_name, last_name, user_telephone, scope_all_agencies, parent_client_id, departed_at")
      .eq("client_role", role)
      .is("departed_at", null)
      .eq("scope_all_agencies", true);

    if (!nationalUsers || nationalUsers.length === 0) return null;

    const user = nationalUsers[0] as ClientUserProfile;
    return buildResolvedFromUser(user, role);
  }

  // Sort by priority: same city > same client > parent/sibling
  const typedUsers = users as ClientUserProfile[];
  const sorted = [...typedUsers].sort((a, b) => {
    const scoreA = getUserPriority(a, clientId, sessionVille);
    const scoreB = getUserPriority(b, clientId, sessionVille);
    return scoreA - scoreB;
  });

  return buildResolvedFromUser(sorted[0], role);
}

function getUserPriority(
  user: ClientUserProfile,
  sessionClientId: string,
  sessionVille: string | null
): number {
  // Lower score = higher priority
  const sameClient = user.client_id === sessionClientId;
  const sameVille = sessionVille && user.client_ville
    ? user.client_ville.toLowerCase() === sessionVille.toLowerCase()
    : false;

  if (sameClient && sameVille) return 0;
  if (sameClient) return 1;
  if (sameVille) return 2;
  if (user.scope_all_agencies) return 3;
  return 4;
}

function buildResolvedFromUser(
  user: ClientUserProfile,
  role: "responsable_formation" | "directeur_agence"
): ResolvedContact {
  // We need the email - fetch it from auth or use a placeholder
  // The view doesn't include email directly, so we use the user_id
  const sourceLabel = role === "responsable_formation"
    ? `RF — ${user.client_nom || ""}${user.client_ville ? ` (${user.client_ville})` : ""}`
    : `Direction — ${user.client_nom || ""}${user.client_ville ? ` (${user.client_ville})` : ""}`;

  return {
    nom: user.last_name || "",
    prenom: user.first_name || "",
    email: "", // Will be resolved separately
    telephone: user.user_telephone,
    fonction: role === "responsable_formation" ? "Responsable Formation" : "Directeur",
    source: role === "responsable_formation" ? "rf" : "direction",
    source_ref_id: user.id || "",
    source_label: sourceLabel,
  };
}

// Fetch email for a user from profiles table
async function resolveUserEmail(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (!data) return "";

  // Try to get email from auth.users via the profile's id
  // Since we can't access auth.users from client, check if there's an email in client_contacts
  return "";
}

export function useResolveOnsiteContact(session: SessionForResolution | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["resolve-onsite-contact", session?.id, session?.client_id],
    queryFn: async (): Promise<ResolvedContact | null> => {
      if (!session?.client_id) return null;

      // Get client SIRET if not on session
      let clientSiret = session.client_siret;
      if (!clientSiret) {
        const { data: client } = await supabase
          .from("clients")
          .select("siret")
          .eq("id", session.client_id)
          .single();
        clientSiret = client?.siret || null;
      }

      // Priority 1: Devis
      if (clientSiret) {
        const devisContact = await resolveFromDevis(supabase, session.formation_id, clientSiret);
        if (devisContact) return devisContact;
      }

      // Priority 2: Responsable Formation
      const rfContact = await resolveFromClientRole(
        supabase,
        session.client_id,
        session.ville,
        "responsable_formation"
      );
      if (rfContact) {
        // Try to get email from profiles
        if (rfContact.source_ref_id) {
          const { data: cuRecord } = await supabase
            .from("client_users_with_profiles")
            .select("user_id")
            .eq("id", rfContact.source_ref_id)
            .single();

          if (cuRecord?.user_id) {
            // Get email from client_contacts as fallback
            const { data: contacts } = await supabase
              .from("client_contacts")
              .select("email")
              .eq("client_id", session.client_id)
              .ilike("nom", `%${rfContact.nom}%`)
              .limit(1);

            if (contacts && contacts.length > 0) {
              rfContact.email = contacts[0].email;
            }
          }
        }
        return rfContact;
      }

      // Priority 3: Direction
      const dirContact = await resolveFromClientRole(
        supabase,
        session.client_id,
        session.ville,
        "directeur_agence"
      );
      if (dirContact) return dirContact;

      // Priority 4: No auto result
      return null;
    },
    enabled: !!session?.client_id,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Query: search contacts for manual mode ───

export interface SearchableContact {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  fonction: string | null;
  source_table: "client_contacts" | "client_users";
  client_nom: string | null;
  client_ville: string | null;
}

export function useSearchClientContacts(
  clientId: string | null,
  searchQuery: string
) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["search-client-contacts", clientId, searchQuery],
    queryFn: async (): Promise<SearchableContact[]> => {
      if (!clientId) return [];

      const results: SearchableContact[] = [];

      // Get client hierarchy IDs
      const { data: client } = await supabase
        .from("clients")
        .select("id, parent_client_id")
        .eq("id", clientId)
        .single();

      const clientIds = [clientId];
      if (client?.parent_client_id) {
        clientIds.push(client.parent_client_id);
        const { data: siblings } = await supabase
          .from("clients")
          .select("id")
          .eq("parent_client_id", client.parent_client_id);
        siblings?.forEach((s: { id: string }) => {
          if (!clientIds.includes(s.id)) clientIds.push(s.id);
        });
      }

      // Search client_contacts
      const { data: contacts } = await supabase
        .from("client_contacts")
        .select("id, nom, prenom, email, telephone, fonction, client_id")
        .in("client_id", clientIds)
        .or(`nom.ilike.%${searchQuery}%,prenom.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(10);

      if (contacts) {
        for (const c of contacts) {
          results.push({
            id: c.id,
            nom: c.nom,
            prenom: c.prenom,
            email: c.email,
            telephone: c.telephone,
            fonction: c.fonction,
            source_table: "client_contacts",
            client_nom: null,
            client_ville: null,
          });
        }
      }

      // Search client_users_with_profiles
      const { data: users } = await supabase
        .from("client_users_with_profiles")
        .select("id, first_name, last_name, user_telephone, client_nom, client_ville, client_role")
        .in("client_id", clientIds)
        .is("departed_at", null)
        .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`)
        .limit(10);

      if (users) {
        for (const u of users) {
          results.push({
            id: u.id || "",
            nom: u.last_name || "",
            prenom: u.first_name || "",
            email: "",
            telephone: u.user_telephone,
            fonction: u.client_role,
            source_table: "client_users",
            client_nom: u.client_nom,
            client_ville: u.client_ville,
          });
        }
      }

      return results;
    },
    enabled: !!clientId && searchQuery.length >= 2,
    staleTime: 30 * 1000,
  });
}

// ─── Mutations ───

export function useOnsiteContactMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const saveContact = useMutation({
    mutationFn: async ({
      sessionId,
      nom,
      prenom,
      email,
      telephone,
      fonction,
      source,
      sourceRefId,
    }: {
      sessionId: string;
      nom: string;
      prenom: string;
      email: string;
      telephone?: string | null;
      fonction?: string;
      source: ContactSource;
      sourceRefId?: string | null;
    }) => {
      // Check if a sur_place contact already exists
      const { data: existing } = await supabase
        .from("session_contacts")
        .select("id")
        .eq("session_id", sessionId)
        .eq("contact_type", "sur_place")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("session_contacts")
          .update({
            nom,
            prenom,
            email,
            telephone: telephone || null,
            fonction: fonction || "Contact sur place",
            contact_source: source,
            source_ref_id: sourceRefId || null,
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("session_contacts")
          .insert({
            session_id: sessionId,
            nom,
            prenom,
            email,
            telephone: telephone || null,
            fonction: fonction || "Contact sur place",
            contact_source: source,
            source_ref_id: sourceRefId || null,
            contact_type: "sur_place",
          });
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.sessions.onsiteContact(variables.sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: ["admin-session-detail", variables.sessionId],
      });
    },
  });

  const clearContact = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("session_contacts")
        .delete()
        .eq("session_id", sessionId)
        .eq("contact_type", "sur_place");
      if (error) throw error;
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.admin.sessions.onsiteContact(sessionId),
      });
    },
  });

  return { saveContact, clearContact };
}
