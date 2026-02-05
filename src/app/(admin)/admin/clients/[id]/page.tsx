"use client";

/**
 * @file page.tsx
 * @description Page détail client avec 5 onglets:
 * - Informations générales
 * - Contacts multiples
 * - Organisation (agences/employés)
 * - Sessions
 * - Historique
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  MapPin,
  Users,
  Calendar,
  Phone,
  Mail,
  Globe,
  Building,
  Plus,
  Clock,
  Edit,
  Star,
  History,
  Network,
  GitBranch,
  User,
  Briefcase,
  ChevronRight,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  type ClientType,
  type ClientRole,
  FRENCH_REGIONS,
} from "@/hooks/admin/useClients";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// ==================== Types ====================

interface Client {
  id: string;
  nom: string;
  siret: string | null;
  siren: string | null;
  email: string | null;
  telephone: string | null;
  website: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  forme_juridique: string | null;
  naf_code: string | null;
  effectif_entreprise: string | null;
  notes: string | null;
  active: boolean;
  contact_nom: string | null;
  contact_prenom: string | null;
  contact_email: string | null;
  contact_telephone: string | null;
  client_type: ClientType;
  parent_client_id: string | null;
  region: string | null;
  created_at: string;
  updated_at?: string;
}

interface ClientAgency {
  id: string;
  nom: string;
  ville: string | null;
  region: string | null;
  active: boolean;
  sessions_count?: number;
}

interface ClientContact {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  fonction: string | null;
  is_primary: boolean;
  client_id: string;
}

interface ClientEmployee {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
  role: ClientRole;
  department: string | null;
  active: boolean;
}

interface Session {
  id: string;
  formation_title: string;
  start_date: string;
  status: string;
  inscriptions_count: number;
}

interface HistoryEntry {
  id: string;
  action: string;
  details: string | null;
  created_at: string;
  user_name: string | null;
}

// ==================== Constants ====================

const FORMES_JURIDIQUES = [
  "SARL", "SAS", "SA", "EURL", "SCI", "Association", "Auto-entrepreneur", "Autre"
];

const EFFECTIFS = [
  "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"
];

const CLIENT_TYPE_CONFIG: Record<ClientType, { label: string; color: string; icon: React.ReactNode }> = {
  standalone: {
    label: "Client indépendant",
    color: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/20",
    icon: <Building2 className="h-4 w-4" />,
  },
  siege: {
    label: "Siège social",
    color: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: <Building2 className="h-4 w-4" />,
  },
  agence: {
    label: "Agence",
    color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: <Building className="h-4 w-4" />,
  },
  filiale: {
    label: "Filiale",
    color: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    icon: <GitBranch className="h-4 w-4" />,
  },
  franchise: {
    label: "Franchise",
    color: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: <Network className="h-4 w-4" />,
  },
};

const CLIENT_ROLES: { value: ClientRole; label: string; description: string }[] = [
  { value: "directeur_general", label: "Directeur Général", description: "Accès complet" },
  { value: "responsable_formation", label: "Responsable Formation", description: "Gestion des formations" },
  { value: "directeur_agence", label: "Directeur d'Agence", description: "Accès agence uniquement" },
  { value: "responsable_pole", label: "Responsable de Pôle", description: "Accès à son pôle" },
  { value: "manager", label: "Manager", description: "Gestion d'équipe" },
  { value: "collaborateur", label: "Collaborateur", description: "Accès basique" },
];

// ==================== Component ====================

export default function AdminClientDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  // State
  const [client, setClient] = useState<Partial<Client>>({
    nom: "",
    active: true,
    client_type: "standalone",
  });
  const [parentClient, setParentClient] = useState<{ id: string; nom: string } | null>(null);
  const [agencies, setAgencies] = useState<ClientAgency[]>([]);
  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const [employees, setEmployees] = useState<ClientEmployee[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [allClients, setAllClients] = useState<{ id: string; nom: string }[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Contact dialog
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Partial<ClientContact> | null>(null);

  // Agency dialog
  const [agencyDialogOpen, setAgencyDialogOpen] = useState(false);
  const [newAgencyName, setNewAgencyName] = useState("");
  const [newAgencyRegion, setNewAgencyRegion] = useState("");
  const [newAgencyVille, setNewAgencyVille] = useState("");

  const supabase = createClient();

  // ==================== Data Fetching ====================

  useEffect(() => {
    fetchAllClients();
    if (!isNew && id) {
      fetchClient();
      fetchSessions();
      fetchContacts();
      fetchAgencies();
      fetchHistory();
    }
  }, [id, isNew]);

  const fetchAllClients = async () => {
    const { data } = await supabase
      .from("clients")
      .select("id, nom")
      .or("client_type.eq.siege,client_type.eq.standalone,client_type.is.null")
      .order("nom");
    if (data) setAllClients(data);
  };

  const fetchClient = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Client non trouvé");
      router.push("/admin/clients");
      return;
    }

    setClient({
      ...data,
      client_type: data.client_type || "standalone",
    });

    // Fetch parent client name if exists
    if (data.parent_client_id) {
      const { data: parent } = await supabase
        .from("clients")
        .select("id, nom")
        .eq("id", data.parent_client_id)
        .single();
      if (parent) setParentClient(parent);
    }

    setIsLoading(false);
  };

  const fetchAgencies = async () => {
    const { data } = await supabase
      .from("clients")
      .select("id, nom, ville, region, active")
      .eq("parent_client_id", id)
      .order("nom");

    if (data) {
      // Count sessions for each agency
      const agenciesWithSessions = await Promise.all(
        data.map(async (agency: ClientAgency) => {
          const { count } = await supabase
            .from("session_clients")
            .select("*", { count: "exact", head: true })
            .eq("client_id", agency.id);
          return { ...agency, sessions_count: count || 0 };
        })
      );
      setAgencies(agenciesWithSessions);
    }
  };

  const fetchContacts = async () => {
    const { data } = await supabase
      .from("client_contacts")
      .select("*")
      .eq("client_id", id)
      .order("is_primary", { ascending: false });
    if (data) setContacts(data);
  };

  const fetchSessions = async () => {
    const { data: sessionClients } = await supabase
      .from("session_clients")
      .select("session_id")
      .eq("client_id", id);

    if (!sessionClients || sessionClients.length === 0) {
      setSessions([]);
      return;
    }

    const sessionIds = sessionClients.map((sc: { session_id: string }) => sc.session_id);
    const { data: sessionsData } = await supabase
      .from("sessions")
      .select("id, start_date, status, formations(title)")
      .in("id", sessionIds)
      .order("start_date", { ascending: false })
      .limit(10);

    if (sessionsData) {
      const sessionsWithCounts = await Promise.all(
        sessionsData.map(async (s: any) => {
          const { count } = await supabase
            .from("inscriptions")
            .select("*", { count: "exact", head: true })
            .eq("session_id", s.id);

          return {
            id: s.id,
            formation_title: s.formations?.title || "Sans titre",
            start_date: s.start_date,
            status: s.status,
            inscriptions_count: count || 0,
          };
        })
      );
      setSessions(sessionsWithCounts);
    }
  };

  const fetchHistory = async () => {
    // Fetch from client_history table if exists, or from activity logs
    const { data } = await supabase
      .from("client_history")
      .select("*")
      .eq("client_id", id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setHistory(data);
    }
  };

  // ==================== Actions ====================

  const handleSave = async () => {
    if (!client.nom) {
      toast.error("Le nom est requis");
      return;
    }

    setIsSaving(true);
    try {
      const clientData = {
        nom: client.nom,
        siret: client.siret || null,
        siren: client.siren || null,
        email: client.email || null,
        telephone: client.telephone || null,
        website: client.website || null,
        adresse: client.adresse || null,
        code_postal: client.code_postal || null,
        ville: client.ville || null,
        forme_juridique: client.forme_juridique || null,
        naf_code: client.naf_code || null,
        effectif_entreprise: client.effectif_entreprise || null,
        notes: client.notes || null,
        active: client.active ?? true,
        contact_nom: client.contact_nom || null,
        contact_prenom: client.contact_prenom || null,
        contact_email: client.contact_email || null,
        contact_telephone: client.contact_telephone || null,
        client_type: client.client_type || "standalone",
        parent_client_id: client.parent_client_id || null,
        region: client.region || null,
      };

      if (isNew) {
        const { data, error } = await supabase
          .from("clients")
          .insert(clientData)
          .select()
          .single();

        if (error) throw error;
        toast.success("Client créé");
        router.push(`/admin/clients/${data.id}`);
      } else {
        const { error } = await supabase
          .from("clients")
          .update(clientData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Client mis à jour");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      // Check if client has agencies
      if (agencies.length > 0) {
        toast.error("Ce client a des agences. Supprimez-les d'abord.");
        return;
      }

      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
      toast.success("Client supprimé");
      router.push("/admin/clients");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleSaveContact = async () => {
    if (!editingContact?.nom) {
      toast.error("Le nom est requis");
      return;
    }

    try {
      const contactData = {
        client_id: id,
        nom: editingContact.nom,
        prenom: editingContact.prenom || "",
        email: editingContact.email || null,
        telephone: editingContact.telephone || null,
        fonction: editingContact.fonction || null,
        is_primary: editingContact.is_primary ?? false,
      };

      if (editingContact.id) {
        const { error } = await supabase
          .from("client_contacts")
          .update(contactData)
          .eq("id", editingContact.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("client_contacts")
          .insert(contactData);
        if (error) throw error;
      }

      toast.success("Contact enregistré");
      setContactDialogOpen(false);
      setEditingContact(null);
      fetchContacts();
    } catch {
      toast.error("Erreur lors de la sauvegarde du contact");
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from("client_contacts")
        .delete()
        .eq("id", contactId);
      if (error) throw error;
      toast.success("Contact supprimé");
      fetchContacts();
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleCreateAgency = async () => {
    if (!newAgencyName.trim()) {
      toast.error("Le nom de l'agence est requis");
      return;
    }

    try {
      const { error } = await supabase.from("clients").insert({
        nom: newAgencyName.trim(),
        ville: newAgencyVille.trim() || null,
        region: newAgencyRegion || null,
        client_type: "agence",
        parent_client_id: id,
        active: true,
      });

      if (error) throw error;

      toast.success("Agence créée");
      setAgencyDialogOpen(false);
      setNewAgencyName("");
      setNewAgencyRegion("");
      setNewAgencyVille("");
      fetchAgencies();
    } catch {
      toast.error("Erreur lors de la création de l'agence");
    }
  };

  const updateField = (field: keyof Client, value: unknown) => {
    setClient((prev) => ({ ...prev, [field]: value }));
  };

  // Computed
  const isSiege = client.client_type === "siege" || agencies.length > 0;
  const isAgence = client.client_type === "agence";

  // ==================== Render ====================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-60" />
          <Skeleton className="h-60" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-medium">
              {isNew ? "Nouveau client" : client.nom}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {!isNew && client.ville && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {client.ville}
                </span>
              )}
              {parentClient && (
                <Link
                  href={`/admin/clients/${parentClient.id}`}
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ChevronRight className="h-3 w-3" />
                  {parentClient.nom}
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={agencies.length > 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={client.active ? "default" : "secondary"}>
          {client.active ? "Actif" : "Inactif"}
        </Badge>
        {client.client_type && (
          <Badge
            variant="outline"
            className={CLIENT_TYPE_CONFIG[client.client_type]?.color}
          >
            {CLIENT_TYPE_CONFIG[client.client_type]?.icon}
            <span className="ml-1">{CLIENT_TYPE_CONFIG[client.client_type]?.label}</span>
          </Badge>
        )}
        {client.forme_juridique && (
          <Badge variant="outline">{client.forme_juridique}</Badge>
        )}
        {agencies.length > 0 && (
          <Badge variant="secondary" className="gap-1">
            <Building className="h-3 w-3" />
            {agencies.length} agence{agencies.length > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="info" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Informations</span>
            <span className="sm:hidden">Infos</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-2">
            <Users className="h-4 w-4" />
            Contacts
            {contacts.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {contacts.length}
              </Badge>
            )}
          </TabsTrigger>
          {!isAgence && (
            <TabsTrigger value="organisation" className="gap-2">
              <Network className="h-4 w-4" />
              Organisation
              {agencies.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {agencies.length}
                </Badge>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="sessions" className="gap-2">
            <Calendar className="h-4 w-4" />
            Sessions
            {sessions.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {sessions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="historique" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Historique</span>
          </TabsTrigger>
        </TabsList>

        {/* ==================== Info Tab ==================== */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* General Info Card */}
            <Card className="border-0 bg-secondary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nom de l'entreprise *</Label>
                  <Input
                    value={client.nom || ""}
                    onChange={(e) => updateField("nom", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type de structure</Label>
                  <Select
                    value={client.client_type}
                    onValueChange={(v) => updateField("client_type", v as ClientType)}
                    disabled={agencies.length > 0}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standalone">Client indépendant</SelectItem>
                      <SelectItem value="siege">Siège social</SelectItem>
                      <SelectItem value="agence">Agence</SelectItem>
                      <SelectItem value="filiale">Filiale</SelectItem>
                      <SelectItem value="franchise">Franchise</SelectItem>
                    </SelectContent>
                  </Select>
                  {agencies.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Type verrouillé car ce client a des agences
                    </p>
                  )}
                </div>

                {(client.client_type === "agence" ||
                  client.client_type === "filiale" ||
                  client.client_type === "franchise") && (
                  <>
                    <div className="space-y-2">
                      <Label>Siège parent</Label>
                      <Select
                        value={client.parent_client_id || ""}
                        onValueChange={(v) => updateField("parent_client_id", v || null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un siège" />
                        </SelectTrigger>
                        <SelectContent>
                          {allClients
                            .filter((c) => c.id !== id)
                            .map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.nom}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Région</Label>
                      <Select
                        value={client.region || ""}
                        onValueChange={(v) => updateField("region", v || null)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une région" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(FRENCH_REGIONS).map(([code, name]) => (
                            <SelectItem key={code} value={code}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SIRET</Label>
                    <Input
                      value={client.siret || ""}
                      onChange={(e) => updateField("siret", e.target.value)}
                      placeholder="14 chiffres"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SIREN</Label>
                    <Input
                      value={client.siren || ""}
                      onChange={(e) => updateField("siren", e.target.value)}
                      placeholder="9 chiffres"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Forme juridique</Label>
                    <Select
                      value={client.forme_juridique || ""}
                      onValueChange={(v) => updateField("forme_juridique", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMES_JURIDIQUES.map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Effectif</Label>
                    <Select
                      value={client.effectif_entreprise || ""}
                      onValueChange={(v) => updateField("effectif_entreprise", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        {EFFECTIFS.map((e) => (
                          <SelectItem key={e} value={e}>
                            {e} salariés
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Code NAF</Label>
                  <Input
                    value={client.naf_code || ""}
                    onChange={(e) => updateField("naf_code", e.target.value)}
                    placeholder="1234Z"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Label>Client actif</Label>
                  <Switch
                    checked={client.active}
                    onCheckedChange={(v) => updateField("active", v)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Card */}
            <Card className="border-0 bg-secondary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Adresse et coordonnées
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input
                    value={client.adresse || ""}
                    onChange={(e) => updateField("adresse", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Code postal</Label>
                    <Input
                      value={client.code_postal || ""}
                      onChange={(e) => updateField("code_postal", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ville</Label>
                    <Input
                      value={client.ville || ""}
                      onChange={(e) => updateField("ville", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </Label>
                  <Input
                    type="email"
                    value={client.email || ""}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Téléphone
                  </Label>
                  <Input
                    value={client.telephone || ""}
                    onChange={(e) => updateField("telephone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="h-4 w-4" /> Site web
                  </Label>
                  <Input
                    value={client.website || ""}
                    onChange={(e) => updateField("website", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notes Card */}
            <Card className="border-0 bg-secondary/30 md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Notes internes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={client.notes || ""}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows={4}
                  placeholder="Notes sur ce client..."
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================== Contacts Tab ==================== */}
        <TabsContent value="contacts" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Gérez les contacts de ce client
            </p>
            <Button
              size="sm"
              onClick={() => {
                setEditingContact({ is_primary: false });
                setContactDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un contact
            </Button>
          </div>

          {/* Legacy primary contact from client table */}
          {(client.contact_nom || client.contact_prenom) && (
            <Card className="border-0 bg-yellow-500/10 border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Contact principal (ancien format)
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {client.contact_prenom} {client.contact_nom}
                    </p>
                    {client.contact_email && (
                      <p className="text-sm text-muted-foreground">{client.contact_email}</p>
                    )}
                    {client.contact_telephone && (
                      <p className="text-sm text-muted-foreground">{client.contact_telephone}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingContact({
                        nom: client.contact_nom || "",
                        prenom: client.contact_prenom || "",
                        email: client.contact_email,
                        telephone: client.contact_telephone,
                        is_primary: true,
                      });
                      setContactDialogOpen(true);
                    }}
                  >
                    Migrer vers nouveau format
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {contacts.length === 0 ? (
            <Card className="border-0 bg-secondary/30">
              <CardContent className="py-8 text-center text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucun contact enregistré</p>
                <p className="text-xs mt-1">Ajoutez des contacts pour ce client</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {contacts.map((contact) => (
                <Card key={contact.id} className="border-0 bg-secondary/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center",
                            contact.is_primary
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {contact.is_primary ? (
                            <Star className="h-5 w-5" />
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {contact.prenom} {contact.nom}
                          </p>
                          {contact.fonction && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {contact.fonction}
                            </p>
                          )}
                        </div>
                      </div>
                      {contact.is_primary && (
                        <Badge variant="secondary" className="text-xs">
                          Principal
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 space-y-1">
                      {contact.email && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </p>
                      )}
                      {contact.telephone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="h-3 w-3" />
                          {contact.telephone}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingContact(contact);
                          setContactDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteContact(contact.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ==================== Organisation Tab ==================== */}
        {!isAgence && (
          <TabsContent value="organisation" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Gérez les agences rattachées à ce siège
                </p>
              </div>
              <Button size="sm" onClick={() => setAgencyDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle agence
              </Button>
            </div>

            {agencies.length === 0 ? (
              <Card className="border-0 bg-secondary/30">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucune agence rattachée</p>
                  <p className="text-xs mt-1">
                    Créez des agences pour structurer votre organisation
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {agencies.map((agency) => (
                  <Card
                    key={agency.id}
                    className={cn(
                      "border-0 cursor-pointer transition-all hover:shadow-md",
                      "bg-blue-500/5 border-l-4 border-l-blue-500"
                    )}
                    onClick={() => router.push(`/admin/clients/${agency.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <Building className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{agency.nom}</p>
                            {agency.ville && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {agency.ville}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            agency.active
                              ? "bg-green-500/10 text-green-600 border-green-500/20"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {agency.active ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground">
                        {agency.region && (
                          <span>{FRENCH_REGIONS[agency.region] || agency.region}</span>
                        )}
                        {(agency.sessions_count ?? 0) > 0 && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {agency.sessions_count} session
                            {(agency.sessions_count ?? 0) > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {/* ==================== Sessions Tab ==================== */}
        <TabsContent value="sessions">
          {sessions.length === 0 ? (
            <Card className="border-0 bg-secondary/30">
              <CardContent className="py-8 text-center text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucune session associée</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 bg-secondary/30">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Formation</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Inscriptions</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">
                          {session.formation_title}
                        </TableCell>
                        <TableCell>
                          {new Date(session.start_date).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>{session.inscriptions_count}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              session.status === "confirmed" ? "default" : "secondary"
                            }
                          >
                            {session.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/sessions/${session.id}`}>
                            <Button variant="ghost" size="sm">
                              Voir
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ==================== History Tab ==================== */}
        <TabsContent value="historique">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" />
                Historique des modifications
              </CardTitle>
              <CardDescription>
                Toutes les actions effectuées sur ce client
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Aucun historique disponible</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {history.map((entry, index) => (
                      <div
                        key={entry.id}
                        className={cn(
                          "flex gap-4 pb-4",
                          index < history.length - 1 && "border-b border-border/30"
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{entry.action}</p>
                          {entry.details && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {entry.details}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>
                              {formatDistanceToNow(new Date(entry.created_at), {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </span>
                            {entry.user_name && (
                              <>
                                <span>•</span>
                                <span>{entry.user_name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Client creation info */}
              {client.created_at && (
                <div className="mt-4 pt-4 border-t border-border/30">
                  <p className="text-xs text-muted-foreground">
                    Client créé le{" "}
                    {format(new Date(client.created_at), "dd MMMM yyyy 'à' HH:mm", {
                      locale: fr,
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ==================== Dialogs ==================== */}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
              {agencies.length > 0 && (
                <span className="block mt-2 text-destructive">
                  Ce client a {agencies.length} agence(s). Supprimez-les d'abord.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={agencies.length > 0}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingContact?.id ? "Modifier le contact" : "Nouveau contact"}
            </DialogTitle>
            <DialogDescription>
              Renseignez les informations du contact
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input
                  value={editingContact?.prenom || ""}
                  onChange={(e) =>
                    setEditingContact((prev) => ({ ...prev, prenom: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input
                  value={editingContact?.nom || ""}
                  onChange={(e) =>
                    setEditingContact((prev) => ({ ...prev, nom: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fonction</Label>
              <Input
                value={editingContact?.fonction || ""}
                onChange={(e) =>
                  setEditingContact((prev) => ({ ...prev, fonction: e.target.value }))
                }
                placeholder="Responsable formation, DRH..."
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editingContact?.email || ""}
                onChange={(e) =>
                  setEditingContact((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                value={editingContact?.telephone || ""}
                onChange={(e) =>
                  setEditingContact((prev) => ({ ...prev, telephone: e.target.value }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Contact principal</Label>
              <Switch
                checked={editingContact?.is_primary ?? false}
                onCheckedChange={(v) =>
                  setEditingContact((prev) => ({ ...prev, is_primary: v }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveContact}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Agency Dialog */}
      <Dialog open={agencyDialogOpen} onOpenChange={setAgencyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle agence</DialogTitle>
            <DialogDescription>
              Créez une nouvelle agence rattachée à ce siège
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom de l'agence *</Label>
              <Input
                value={newAgencyName}
                onChange={(e) => setNewAgencyName(e.target.value)}
                placeholder="Agence Lyon, Agence Paris..."
              />
            </div>
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input
                value={newAgencyVille}
                onChange={(e) => setNewAgencyVille(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Région</Label>
              <Select value={newAgencyRegion} onValueChange={setNewAgencyRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une région" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FRENCH_REGIONS).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAgencyDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateAgency}>Créer l'agence</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
