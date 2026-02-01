"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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
  client_type: string | null;
  parent_client_id: string | null;
  created_at: string;
}

interface Session {
  id: string;
  formation_title: string;
  start_date: string;
  status: string;
  inscriptions_count: number;
}

const FORMES_JURIDIQUES = [
  "SARL", "SAS", "SA", "EURL", "SCI", "Association", "Auto-entrepreneur", "Autre"
];

const EFFECTIFS = [
  "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"
];

export default function AdminClientDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [client, setClient] = useState<Partial<Client>>({
    nom: "",
    active: true,
    client_type: "siege",
  });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!isNew && id) {
      fetchClient();
      fetchSessions();
    }
  }, [id, isNew]);

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

    setClient(data);
    setIsLoading(false);
  };

  const fetchSessions = async () => {
    // Fetch sessions linked to this client via session_clients
    const { data: sessionClients } = await supabase
      .from("session_clients")
      .select("session_id")
      .eq("client_id", id);

    if (!sessionClients || sessionClients.length === 0) {
      setSessions([]);
      return;
    }

    const sessionIds = sessionClients.map((sc) => sc.session_id);
    const { data: sessionsData } = await supabase
      .from("sessions")
      .select("id, start_date, status, formations(title)")
      .in("id", sessionIds)
      .order("start_date", { ascending: false })
      .limit(10);

    if (sessionsData) {
      // Count inscriptions for each session
      const sessionsWithCounts = await Promise.all(
        sessionsData.map(async (s: { id: string; start_date: string; status: string; formations: { title: string }[] }) => {
          const { count } = await supabase
            .from("inscriptions")
            .select("*", { count: "exact", head: true })
            .eq("session_id", s.id);

          return {
            id: s.id,
            formation_title: s.formations?.[0]?.title || "Sans titre",
            start_date: s.start_date,
            status: s.status,
            inscriptions_count: count || 0,
          };
        })
      );
      setSessions(sessionsWithCounts);
    }
  };

  const handleSave = async () => {
    if (!client.nom) {
      toast.error("Le nom est requis");
      return;
    }

    setIsSaving(true);
    try {
      if (isNew) {
        const { data, error } = await supabase
          .from("clients")
          .insert(client)
          .select()
          .single();

        if (error) throw error;
        toast.success("Client créé");
        router.push(`/admin/clients/${data.id}`);
      } else {
        const { error } = await supabase
          .from("clients")
          .update(client)
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
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
      toast.success("Client supprimé");
      router.push("/admin/clients");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const updateField = (field: keyof Client, value: unknown) => {
    setClient((prev) => ({ ...prev, [field]: value }));
  };

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
            {!isNew && client.ville && (
              <p className="text-sm text-muted-foreground">{client.ville}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2">
        <Badge variant={client.active ? "default" : "secondary"}>
          {client.active ? "Actif" : "Inactif"}
        </Badge>
        {client.client_type && (
          <Badge variant="outline">
            {client.client_type === "siege" ? "Siège" : "Agence"}
          </Badge>
        )}
        {client.forme_juridique && <Badge variant="outline">{client.forme_juridique}</Badge>}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList>
          <TabsTrigger value="info">
            <Building2 className="h-4 w-4 mr-2" />
            Informations
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Users className="h-4 w-4 mr-2" />
            Contact
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Calendar className="h-4 w-4 mr-2" />
            Sessions ({sessions.length})
          </TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
                    <Select value={client.forme_juridique || ""} onValueChange={(v) => updateField("forme_juridique", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMES_JURIDIQUES.map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Effectif</Label>
                    <Select value={client.effectif_entreprise || ""} onValueChange={(v) => updateField("effectif_entreprise", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir" />
                      </SelectTrigger>
                      <SelectContent>
                        {EFFECTIFS.map((e) => (
                          <SelectItem key={e} value={e}>{e} salariés</SelectItem>
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
                  <Label>Actif</Label>
                  <Switch checked={client.active} onCheckedChange={(v) => updateField("active", v)} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-secondary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Adresse
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

        {/* Contact Tab */}
        <TabsContent value="contact">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contact principal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input
                    value={client.contact_prenom || ""}
                    onChange={(e) => updateField("contact_prenom", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input
                    value={client.contact_nom || ""}
                    onChange={(e) => updateField("contact_nom", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={client.contact_email || ""}
                    onChange={(e) => updateField("contact_email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    value={client.contact_telephone || ""}
                    onChange={(e) => updateField("contact_telephone", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
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
                        <TableCell className="font-medium">{session.formation_title}</TableCell>
                        <TableCell>
                          {new Date(session.start_date).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>{session.inscriptions_count}</TableCell>
                        <TableCell>
                          <Badge variant={session.status === "confirmed" ? "default" : "secondary"}>
                            {session.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/sessions/${session.id}`}>
                            <Button variant="ghost" size="sm">Voir</Button>
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
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
