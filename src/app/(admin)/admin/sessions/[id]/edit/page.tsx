"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useFormations } from "@/hooks/admin/useFormations";
import { useFormateurs } from "@/hooks/admin/useFormateurs";
import { useSessionMutations, type UpdateSessionInput } from "@/hooks/admin/useSessions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Calendar, ArrowLeft, Save, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

async function fetchSession(id: string) {
  const supabase = createClient();

  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return session;
}

export default function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: formations = [] } = useFormations();
  const { data: formateurs = [] } = useFormateurs();
  const { updateSession, deleteSession } = useSessionMutations();

  const { data: session, isLoading, error } = useQuery({
    queryKey: ["admin-session-edit", id],
    queryFn: () => fetchSession(id),
    staleTime: 60 * 1000,
  });

  const [formData, setFormData] = useState<UpdateSessionInput>({
    formation_id: "",
    start_date: "",
    end_date: "",
    lieu: "",
    places_max: 12,
    formateur_id: "",
    format_type: "presentiel",
    status: "planifiee",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (session) {
      setFormData({
        formation_id: session.formation_id || "",
        start_date: session.start_date || "",
        end_date: session.end_date || "",
        lieu: session.lieu || "",
        places_max: session.places_max || 12,
        formateur_id: session.formateur_id || "",
        format_type: session.format_type || "presentiel",
        status: session.status || "planifiee",
      });
    }
  }, [session]);

  const handleSave = async () => {
    if (!formData.formation_id || !formData.start_date || !formData.lieu) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      await updateSession.mutateAsync({
        id,
        data: {
          ...formData,
          end_date: formData.end_date || null,
          formateur_id: formData.formateur_id || null,
        },
      });
      toast.success("Session mise à jour avec succès");
      router.push(`/admin/sessions/${id}`);
    } catch (err) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSession.mutateAsync(id);
      toast.success("Session supprimée");
      router.push("/admin/sessions");
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Session non trouvée</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/admin/sessions")}>
          Retour aux sessions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Calendar}
        title="Modifier la session"
        description="Modifiez les informations de la session"
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/sessions/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </AdminPageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Informations de la session</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="formation">Formation *</Label>
              <Select
                value={formData.formation_id}
                onValueChange={(value) => setFormData({ ...formData, formation_id: value })}
              >
                <SelectTrigger id="formation">
                  <SelectValue placeholder="Sélectionner une formation" />
                </SelectTrigger>
                <SelectContent>
                  {formations.map((formation) => (
                    <SelectItem key={formation.id} value={formation.id}>
                      {formation.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planifiee">Planifiée</SelectItem>
                  <SelectItem value="confirmee">Confirmée</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="terminee">Terminée</SelectItem>
                  <SelectItem value="annulee">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Date de début *</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Date de fin</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date || ""}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lieu">Lieu *</Label>
            <Input
              id="lieu"
              placeholder="Ex: Paris, Lyon, En ligne..."
              value={formData.lieu}
              onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="places_max">Nombre de places</Label>
              <Input
                id="places_max"
                type="number"
                min={1}
                value={formData.places_max}
                onChange={(e) => setFormData({ ...formData, places_max: parseInt(e.target.value) || 12 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="format_type">Format</Label>
              <Select
                value={formData.format_type}
                onValueChange={(value) => setFormData({ ...formData, format_type: value })}
              >
                <SelectTrigger id="format_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presentiel">Présentiel</SelectItem>
                  <SelectItem value="distanciel">Distanciel</SelectItem>
                  <SelectItem value="hybride">Hybride</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="formateur">Formateur</Label>
            <Select
              value={formData.formateur_id || "none"}
              onValueChange={(value) => setFormData({ ...formData, formateur_id: value === "none" ? "" : value })}
            >
              <SelectTrigger id="formateur">
                <SelectValue placeholder="Sélectionner un formateur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun formateur assigné</SelectItem>
                {formateurs.filter(f => f.active).map((formateur) => (
                  <SelectItem key={formateur.id} value={formateur.id}>
                    {formateur.prenom} {formateur.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={updateSession.isPending}>
              {updateSession.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la session ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les inscriptions associées seront également supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSession.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
