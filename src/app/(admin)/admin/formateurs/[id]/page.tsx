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
  User,
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  MapPin,
  Euro,
  FileText,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Formateur {
  id: string;
  user_id: string | null;
  civilite: string | null;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  bio: string | null;
  siret: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  tarif_journalier: number | null;
  tarif_demi_journee: number | null;
  numero_nda: string | null;
  assujetti_tva: boolean;
  taux_tva: number | null;
  numero_tva: string | null;
  is_active: boolean;
  statut: string | null;
  created_at: string;
}

interface Session {
  id: string;
  formation_title: string;
  start_date: string;
  status: string;
}

const CIVILITES = ["M.", "Mme", "Dr"];
const STATUTS = ["Salarié", "Vacataire", "Auto-entrepreneur", "Société"];

export default function AdminFormateurDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [formateur, setFormateur] = useState<Partial<Formateur>>({
    nom: "",
    prenom: "",
    email: "",
    is_active: true,
    assujetti_tva: false,
    statut: "Vacataire",
  });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!isNew && id) {
      fetchFormateur();
      fetchSessions();
    }
  }, [id, isNew]);

  const fetchFormateur = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("formateurs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Formateur non trouvé");
      router.push("/admin/formateurs");
      return;
    }

    setFormateur(data);
    setIsLoading(false);
  };

  const fetchSessions = async () => {
    const { data } = await supabase
      .from("sessions")
      .select("id, start_date, status, formations(title)")
      .eq("formateur_id", id)
      .order("start_date", { ascending: false })
      .limit(10);

    if (data) {
      setSessions(
        data.map((s: { id: string; start_date: string; status: string; formations: { title: string }[] }) => ({
          id: s.id,
          formation_title: s.formations?.[0]?.title || "Sans titre",
          start_date: s.start_date,
          status: s.status,
        }))
      );
    }
  };

  const handleSave = async () => {
    if (!formateur.nom || !formateur.prenom || !formateur.email) {
      toast.error("Nom, prénom et email sont requis");
      return;
    }

    setIsSaving(true);
    try {
      if (isNew) {
        const { data, error } = await supabase
          .from("formateurs")
          .insert(formateur)
          .select()
          .single();

        if (error) throw error;
        toast.success("Formateur créé");
        router.push(`/admin/formateurs/${data.id}`);
      } else {
        const { error } = await supabase
          .from("formateurs")
          .update(formateur)
          .eq("id", id);

        if (error) throw error;
        toast.success("Formateur mis à jour");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    // Check for sessions first
    if (sessions.length > 0) {
      toast.error("Ce formateur a des sessions associées et ne peut pas être supprimé");
      return;
    }

    try {
      const { error } = await supabase.from("formateurs").delete().eq("id", id);
      if (error) throw error;
      toast.success("Formateur supprimé");
      router.push("/admin/formateurs");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const updateField = (field: keyof Formateur, value: unknown) => {
    setFormateur((prev) => ({ ...prev, [field]: value }));
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
          <Link href="/admin/formateurs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-medium">
              {isNew ? "Nouveau formateur" : `${formateur.prenom} ${formateur.nom}`}
            </h1>
            {!isNew && (
              <p className="text-sm text-muted-foreground">{formateur.email}</p>
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
        <Badge variant={formateur.is_active ? "default" : "secondary"}>
          {formateur.is_active ? "Actif" : "Inactif"}
        </Badge>
        {formateur.statut && <Badge variant="outline">{formateur.statut}</Badge>}
        {formateur.numero_nda && <Badge variant="outline" className="bg-green-500/10 text-green-600">NDA vérifié</Badge>}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="identity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="identity">
            <User className="h-4 w-4 mr-2" />
            Identité
          </TabsTrigger>
          <TabsTrigger value="address">
            <MapPin className="h-4 w-4 mr-2" />
            Adresse
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <Euro className="h-4 w-4 mr-2" />
            Tarifs
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Calendar className="h-4 w-4 mr-2" />
            Sessions ({sessions.length})
          </TabsTrigger>
        </TabsList>

        {/* Identity Tab */}
        <TabsContent value="identity" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-0 bg-secondary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Civilité</Label>
                  <Select value={formateur.civilite || ""} onValueChange={(v) => updateField("civilite", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {CIVILITES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prénom *</Label>
                    <Input
                      value={formateur.prenom || ""}
                      onChange={(e) => updateField("prenom", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom *</Label>
                    <Input
                      value={formateur.nom || ""}
                      onChange={(e) => updateField("nom", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formateur.email || ""}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    value={formateur.telephone || ""}
                    onChange={(e) => updateField("telephone", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-secondary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Statut professionnel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={formateur.statut || ""} onValueChange={(v) => updateField("statut", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUTS.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>SIRET</Label>
                  <Input
                    value={formateur.siret || ""}
                    onChange={(e) => updateField("siret", e.target.value)}
                    placeholder="12345678901234"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Numéro NDA</Label>
                  <Input
                    value={formateur.numero_nda || ""}
                    onChange={(e) => updateField("numero_nda", e.target.value)}
                    placeholder="11 chiffres"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Label>Actif</Label>
                  <Switch checked={formateur.is_active} onCheckedChange={(v) => updateField("is_active", v)} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-secondary/30 md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Biographie</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formateur.bio || ""}
                  onChange={(e) => updateField("bio", e.target.value)}
                  rows={4}
                  placeholder="Parcours et expérience du formateur..."
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Address Tab */}
        <TabsContent value="address">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Adresse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input
                  value={formateur.adresse || ""}
                  onChange={(e) => updateField("adresse", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code postal</Label>
                  <Input
                    value={formateur.code_postal || ""}
                    onChange={(e) => updateField("code_postal", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input
                    value={formateur.ville || ""}
                    onChange={(e) => updateField("ville", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tarification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tarif journalier (€)</Label>
                  <Input
                    type="number"
                    value={formateur.tarif_journalier || ""}
                    onChange={(e) => updateField("tarif_journalier", parseFloat(e.target.value) || null)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tarif demi-journée (€)</Label>
                  <Input
                    type="number"
                    value={formateur.tarif_demi_journee || ""}
                    onChange={(e) => updateField("tarif_demi_journee", parseFloat(e.target.value) || null)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formateur.assujetti_tva}
                    onCheckedChange={(v) => updateField("assujetti_tva", v)}
                  />
                  <Label>Assujetti à la TVA</Label>
                </div>
              </div>
              {formateur.assujetti_tva && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Taux TVA (%)</Label>
                    <Input
                      type="number"
                      value={formateur.taux_tva || ""}
                      onChange={(e) => updateField("taux_tva", parseFloat(e.target.value) || null)}
                      placeholder="20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Numéro TVA</Label>
                    <Input
                      value={formateur.numero_tva || ""}
                      onChange={(e) => updateField("numero_tva", e.target.value)}
                      placeholder="FR12345678901"
                    />
                  </div>
                </div>
              )}
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
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card key={session.id} className="border-0 bg-secondary/30">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{session.formation_title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.start_date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={session.status === "confirmed" ? "default" : "secondary"}>
                          {session.status}
                        </Badge>
                        <Link href={`/admin/sessions/${session.id}`}>
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce formateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible.
              {sessions.length > 0 && " Ce formateur a des sessions associées et ne peut pas être supprimé."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={sessions.length > 0}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
