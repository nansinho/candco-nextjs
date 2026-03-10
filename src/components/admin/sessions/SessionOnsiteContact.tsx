"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useClients } from "@/hooks/admin/useClients";
import {
  useSessionOnsiteContact,
  useResolveOnsiteContact,
  useSearchClientContacts,
  useOnsiteContactMutations,
  type ContactSource,
  type SessionForResolution,
} from "@/hooks/admin/useSessionOnsiteContact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  UserCheck,
  Search,
  Mail,
  Phone,
  Building2,
  MapPin,
  Loader2,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ───

interface SessionData {
  id: string;
  formation_id: string;
  client_id: string | null;
  client_siret: string | null;
  ville: string | null;
  [key: string]: unknown;
}

const SOURCE_BADGES: Record<ContactSource, { label: string; className: string }> = {
  devis: { label: "Devis", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  rf: { label: "Resp. Formation", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  direction: { label: "Direction", className: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  manuel: { label: "Manuel", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
};

// ─── Component ───

export function SessionOnsiteContact({ session }: { session: SessionData }) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [linkClientMode, setLinkClientMode] = useState(false);

  const sessionForResolution: SessionForResolution | null = session.client_id
    ? {
        id: session.id,
        formation_id: session.formation_id,
        client_id: session.client_id,
        client_siret: session.client_siret,
        ville: session.ville,
      }
    : null;

  // Queries
  const { data: savedContact, isLoading: isLoadingSaved } = useSessionOnsiteContact(session.id);
  const { data: resolvedContact, isLoading: isResolving } = useResolveOnsiteContact(sessionForResolution);
  const { data: searchResults = [], isLoading: isSearching } = useSearchClientContacts(
    session.client_id,
    debouncedSearch
  );
  const { data: allClients = [] } = useClients();

  // Mutations
  const { saveContact, clearContact } = useOnsiteContactMutations();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Set mode based on saved contact
  useEffect(() => {
    if (savedContact?.contact_source === "manuel") {
      setMode("manual");
    }
  }, [savedContact]);

  const handleConfirmAuto = useCallback(async () => {
    if (!resolvedContact) return;

    try {
      await saveContact.mutateAsync({
        sessionId: session.id,
        nom: resolvedContact.nom,
        prenom: resolvedContact.prenom,
        email: resolvedContact.email,
        telephone: resolvedContact.telephone,
        fonction: resolvedContact.fonction,
        source: resolvedContact.source,
        sourceRefId: resolvedContact.source_ref_id,
      });
      toast.success("Contact sur place enregistre");
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  }, [resolvedContact, session.id, saveContact]);

  const handleSelectManualContact = useCallback(
    async (contact: {
      nom: string;
      prenom: string;
      email: string;
      telephone: string | null;
      fonction: string | null;
      id: string;
    }) => {
      try {
        await saveContact.mutateAsync({
          sessionId: session.id,
          nom: contact.nom,
          prenom: contact.prenom,
          email: contact.email,
          telephone: contact.telephone,
          fonction: contact.fonction || "Contact sur place",
          source: "manuel",
          sourceRefId: contact.id,
        });
        setSearchOpen(false);
        setSearchQuery("");
        toast.success("Contact sur place enregistre");
      } catch {
        toast.error("Erreur lors de l'enregistrement");
      }
    },
    [session.id, saveContact]
  );

  const handleClearContact = useCallback(async () => {
    try {
      await clearContact.mutateAsync(session.id);
      setMode("auto");
      toast.success("Contact supprime");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }, [session.id, clearContact]);

  const handleLinkClient = useCallback(
    async (clientId: string) => {
      if (clientId === "none") return;

      const supabase = createClient();
      const selectedClient = allClients.find((c) => c.id === clientId);

      const { error } = await supabase
        .from("sessions")
        .update({
          client_id: clientId,
          client_siret: selectedClient?.siret || null,
        })
        .eq("id", session.id);

      if (error) {
        toast.error("Erreur lors de la liaison du client");
        return;
      }

      toast.success("Client associe a la session");
      setLinkClientMode(false);
      // Invalidate session detail to refresh data
      queryClient.invalidateQueries({ queryKey: ["admin-session-detail", session.id] });
    },
    [session.id, allClients, queryClient]
  );

  // ─── Render ───

  const isLoading = isLoadingSaved || isResolving;

  // Determine what to display
  const displayContact = savedContact || null;
  const suggestion = !savedContact && resolvedContact ? resolvedContact : null;

  return (
    <Card className="border-0 bg-secondary/30">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Contact sur place
        </CardTitle>
        {session.client_id && (
          <div className="flex items-center gap-2">
            {savedContact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearContact}
                disabled={clearContact.isPending}
              >
                <X className="mr-1 h-3 w-3" />
                Supprimer
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMode(mode === "auto" ? "manual" : "auto")}
            >
              {mode === "auto" ? (
                <>
                  <Search className="mr-1 h-3 w-3" />
                  Recherche
                </>
              ) : (
                <>
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Auto
                </>
              )}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* No client linked */}
        {!session.client_id && (
          <div className="text-center py-6">
            <Building2 className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground mb-3">
              Aucun client associe a cette session
            </p>
            {!linkClientMode ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLinkClientMode(true)}
              >
                <Building2 className="mr-2 h-4 w-4" />
                Associer un client
              </Button>
            ) : (
              <div className="max-w-xs mx-auto space-y-2">
                <Label className="text-sm">Selectionner un client</Label>
                <Select onValueChange={handleLinkClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allClients
                      .filter((c) => c.active)
                      .map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nom}
                          {client.ville ? ` — ${client.ville}` : ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLinkClientMode(false)}
                >
                  Annuler
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {session.client_id && isLoading && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Recherche du contact...
            </span>
          </div>
        )}

        {/* Saved contact display */}
        {session.client_id && !isLoading && displayContact && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              {displayContact.contact_source && (
                <Badge
                  variant="outline"
                  className={SOURCE_BADGES[displayContact.contact_source as ContactSource]?.className}
                >
                  {SOURCE_BADGES[displayContact.contact_source as ContactSource]?.label}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">Contact enregistre</span>
            </div>
            <ContactDisplay
              nom={displayContact.nom}
              prenom={displayContact.prenom}
              email={displayContact.email}
              telephone={displayContact.telephone}
              fonction={displayContact.fonction}
            />
          </div>
        )}

        {/* Auto mode: suggestion not yet saved */}
        {session.client_id && !isLoading && !displayContact && mode === "auto" && (
          <>
            {suggestion ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant="outline"
                    className={SOURCE_BADGES[suggestion.source]?.className}
                  >
                    {SOURCE_BADGES[suggestion.source]?.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {suggestion.source_label}
                  </span>
                </div>
                <ContactDisplay
                  nom={suggestion.nom}
                  prenom={suggestion.prenom}
                  email={suggestion.email}
                  telephone={suggestion.telephone}
                  fonction={suggestion.fonction}
                />
                <Button
                  size="sm"
                  onClick={handleConfirmAuto}
                  disabled={saveContact.isPending}
                >
                  {saveContact.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Confirmer ce contact
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <UserCheck className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground mb-3">
                  Aucun contact trouve automatiquement
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMode("manual")}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Rechercher manuellement
                </Button>
              </div>
            )}
          </>
        )}

        {/* Manual mode */}
        {session.client_id && !isLoading && mode === "manual" && !displayContact && (
          <div className="space-y-3">
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un contact..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (!searchOpen && e.target.value.length >= 2) {
                        setSearchOpen(true);
                      }
                    }}
                    onFocus={() => {
                      if (searchQuery.length >= 2) setSearchOpen(true);
                    }}
                    className="pl-9"
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                {isSearching && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!isSearching && searchResults.length === 0 && debouncedSearch.length >= 2 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun contact trouve
                  </p>
                )}
                {!isSearching && searchResults.length > 0 && (
                  <div className="max-h-64 overflow-auto">
                    {searchResults.map((contact) => (
                      <button
                        key={`${contact.source_table}-${contact.id}`}
                        className="w-full text-left px-3 py-2 hover:bg-accent transition-colors border-b last:border-0"
                        onClick={() =>
                          handleSelectManualContact({
                            nom: contact.nom,
                            prenom: contact.prenom,
                            email: contact.email,
                            telephone: contact.telephone,
                            fonction: contact.fonction,
                            id: contact.id,
                          })
                        }
                      >
                        <p className="font-medium text-sm">
                          {contact.prenom} {contact.nom}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {contact.fonction && <span>{contact.fonction}</span>}
                          {contact.email && <span>{contact.email}</span>}
                          {contact.client_nom && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {contact.client_nom}
                            </span>
                          )}
                          {contact.client_ville && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {contact.client_ville}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Sub-component: contact info display ───

function ContactDisplay({
  nom,
  prenom,
  email,
  telephone,
  fonction,
}: {
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  fonction: string;
}) {
  return (
    <div className="space-y-2">
      <p className="font-semibold">
        {prenom} {nom}
      </p>
      {fonction && (
        <p className="text-sm text-muted-foreground">{fonction}</p>
      )}
      <div className="flex flex-wrap gap-4">
        {email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{email}</span>
          </div>
        )}
        {telephone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{telephone}</span>
          </div>
        )}
      </div>
    </div>
  );
}
