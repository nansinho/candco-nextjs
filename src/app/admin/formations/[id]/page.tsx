"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
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
  GraduationCap,
  ArrowLeft,
  Save,
  Loader2,
  Trash2,
  Eye,
  Calendar,
  Users,
  Euro,
  Clock,
  Target,
  BookOpen,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Formation {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string | null;
  description: string | null;
  pole: string;
  pole_name: string | null;
  category_id: string | null;
  duration: string | null;
  price: string | null;
  format_lieu: string | null;
  nombre_participants: string | null;
  objectifs_generaux: string[] | null;
  competences_visees: string[] | null;
  prerequis: string[] | null;
  public_vise: string[] | null;
  programme: { title: string; items?: string[] }[] | null;
  certification: string | null;
  financement: string[] | null;
  accessibilite: string | null;
  encadrement_pedagogique: string | null;
  active: boolean;
  popular: boolean;
  image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string | null;
}

interface Session {
  id: string;
  start_date: string;
  end_date: string | null;
  lieu: string | null;
  status: string;
  places_disponibles: number | null;
  is_public: boolean;
}

const POLES = [
  { value: "securite-prevention", label: "Sécurité Prévention" },
  { value: "petite-enfance", label: "Petite Enfance" },
  { value: "sante", label: "Santé" },
];

export default function AdminFormationDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [formation, setFormation] = useState<Partial<Formation>>({
    title: "",
    subtitle: "",
    slug: "",
    description: "",
    pole: "securite-prevention",
    duration: "",
    price: "",
    active: true,
    popular: false,
  });
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const supabase = createClient();

  // Fetch formation data
  useEffect(() => {
    if (!isNew && id) {
      fetchFormation();
      fetchSessions();
    }
  }, [id, isNew]);

  const fetchFormation = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("formations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Formation non trouvée");
      router.push("/admin/formations");
      return;
    }

    setFormation(data);
    setIsLoading(false);
  };

  const fetchSessions = async () => {
    const { data } = await supabase
      .from("sessions")
      .select("id, start_date, end_date, lieu, status, places_disponibles, is_public")
      .eq("formation_id", id)
      .order("start_date", { ascending: false })
      .limit(10);

    setSessions(data || []);
  };

  const handleSave = async () => {
    if (!formation.title) {
      toast.error("Le titre est requis");
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = {
        ...formation,
        updated_at: new Date().toISOString(),
      };

      if (isNew) {
        const { data, error } = await supabase
          .from("formations")
          .insert(dataToSave)
          .select()
          .single();

        if (error) throw error;
        toast.success("Formation créée");
        router.push(`/admin/formations/${data.id}`);
      } else {
        const { error } = await supabase
          .from("formations")
          .update(dataToSave)
          .eq("id", id);

        if (error) throw error;
        toast.success("Formation mise à jour");
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
      const { error } = await supabase.from("formations").delete().eq("id", id);
      if (error) throw error;
      toast.success("Formation supprimée");
      router.push("/admin/formations");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const updateField = (field: keyof Formation, value: unknown) => {
    setFormation((prev) => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field: keyof Formation, value: string) => {
    const items = value.split("\n").filter(Boolean);
    setFormation((prev) => ({ ...prev, [field]: items }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/formations">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-medium">
              {isNew ? "Nouvelle formation" : formation.title}
            </h1>
            {!isNew && (
              <p className="text-sm text-muted-foreground">
                Créée le {new Date(formation.created_at!).toLocaleDateString("fr-FR")}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <>
              <Link href={`/formations/${formation.pole}/${formation.slug || id}`} target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2">
        <Badge variant={formation.active ? "default" : "secondary"}>
          {formation.active ? "Active" : "Inactive"}
        </Badge>
        {formation.popular && <Badge variant="outline" className="bg-amber-500/10 text-amber-600">Populaire</Badge>}
        {formation.pole && (
          <Badge variant="outline">
            {POLES.find((p) => p.value === formation.pole)?.label || formation.pole}
          </Badge>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <FileText className="h-4 w-4 mr-2" />
            Général
          </TabsTrigger>
          <TabsTrigger value="content">
            <BookOpen className="h-4 w-4 mr-2" />
            Contenu
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Calendar className="h-4 w-4 mr-2" />
            Sessions ({sessions.length})
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Basic Info */}
            <Card className="border-0 bg-secondary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Informations de base</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Titre *</Label>
                  <Input
                    value={formation.title || ""}
                    onChange={(e) => updateField("title", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sous-titre</Label>
                  <Input
                    value={formation.subtitle || ""}
                    onChange={(e) => updateField("subtitle", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug (URL)</Label>
                  <Input
                    value={formation.slug || ""}
                    onChange={(e) => updateField("slug", e.target.value)}
                    placeholder="formation-sst"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pôle</Label>
                  <Select value={formation.pole} onValueChange={(v) => updateField("pole", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {POLES.map((pole) => (
                        <SelectItem key={pole.value} value={pole.value}>
                          {pole.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <Card className="border-0 bg-secondary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Détails</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Durée</Label>
                    <Input
                      value={formation.duration || ""}
                      onChange={(e) => updateField("duration", e.target.value)}
                      placeholder="14h (2 jours)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prix</Label>
                    <Input
                      value={formation.price || ""}
                      onChange={(e) => updateField("price", e.target.value)}
                      placeholder="450€ HT"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Format / Lieu</Label>
                  <Input
                    value={formation.format_lieu || ""}
                    onChange={(e) => updateField("format_lieu", e.target.value)}
                    placeholder="Présentiel ou distanciel"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nombre de participants</Label>
                  <Input
                    value={formation.nombre_participants || ""}
                    onChange={(e) => updateField("nombre_participants", e.target.value)}
                    placeholder="4 à 10 participants"
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Switch checked={formation.active} onCheckedChange={(v) => updateField("active", v)} />
                    <Label>Active</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={formation.popular} onCheckedChange={(v) => updateField("popular", v)} />
                    <Label>Populaire</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="border-0 bg-secondary/30 md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formation.description || ""}
                  onChange={(e) => updateField("description", e.target.value)}
                  rows={4}
                  placeholder="Description de la formation..."
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-0 bg-secondary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Objectifs généraux
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formation.objectifs_generaux?.join("\n") || ""}
                  onChange={(e) => updateArrayField("objectifs_generaux", e.target.value)}
                  rows={5}
                  placeholder="Un objectif par ligne..."
                />
              </CardContent>
            </Card>

            <Card className="border-0 bg-secondary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Compétences visées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formation.competences_visees?.join("\n") || ""}
                  onChange={(e) => updateArrayField("competences_visees", e.target.value)}
                  rows={5}
                  placeholder="Une compétence par ligne..."
                />
              </CardContent>
            </Card>

            <Card className="border-0 bg-secondary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Public visé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formation.public_vise?.join("\n") || ""}
                  onChange={(e) => updateArrayField("public_vise", e.target.value)}
                  rows={4}
                  placeholder="Un public par ligne..."
                />
              </CardContent>
            </Card>

            <Card className="border-0 bg-secondary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Prérequis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formation.prerequis?.join("\n") || ""}
                  onChange={(e) => updateArrayField("prerequis", e.target.value)}
                  rows={4}
                  placeholder="Un prérequis par ligne..."
                />
              </CardContent>
            </Card>

            <Card className="border-0 bg-secondary/30 md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Certification</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={formation.certification || ""}
                  onChange={(e) => updateField("certification", e.target.value)}
                  placeholder="Certification obtenue..."
                />
              </CardContent>
            </Card>

            <Card className="border-0 bg-secondary/30 md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Accessibilité</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formation.accessibilite || ""}
                  onChange={(e) => updateField("accessibilite", e.target.value)}
                  rows={2}
                  placeholder="Informations sur l'accessibilité..."
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          {sessions.length === 0 ? (
            <Card className="border-0 bg-secondary/30">
              <CardContent className="py-8 text-center text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucune session programmée</p>
                <Link href="/admin/sessions">
                  <Button variant="link" className="mt-2">
                    Gérer les sessions
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <Card key={session.id} className="border-0 bg-secondary/30">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">
                            {new Date(session.start_date).toLocaleDateString("fr-FR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          {session.lieu && (
                            <p className="text-sm text-muted-foreground">{session.lieu}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={session.status === "confirmed" ? "default" : "secondary"}>
                          {session.status}
                        </Badge>
                        {session.is_public && (
                          <Badge variant="outline" className="text-green-600">
                            Public
                          </Badge>
                        )}
                        <Link href={`/admin/sessions/${session.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Link href="/admin/sessions">
                <Button variant="outline" className="w-full">
                  Voir toutes les sessions
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette formation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les données associées seront perdues.
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
