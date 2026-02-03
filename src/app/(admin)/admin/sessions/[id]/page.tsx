"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  ArrowLeft,
  MapPin,
  Users,
  GraduationCap,
  Edit,
  Clock,
  Building2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const statusLabels: Record<string, string> = {
  planifiee: "Planifiée",
  confirmee: "Confirmée",
  en_cours: "En cours",
  terminee: "Terminée",
  annulee: "Annulée",
};

const statusColors: Record<string, string> = {
  planifiee: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  confirmee: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  en_cours: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  terminee: "bg-muted text-muted-foreground border-border/30",
  annulee: "bg-destructive/10 text-destructive border-destructive/20",
};

async function fetchSession(id: string) {
  const supabase = createClient();

  const { data: session, error } = await supabase
    .from("sessions")
    .select(`
      *,
      formations:formation_id (
        id,
        title,
        pole,
        pole_name,
        duration
      ),
      formateurs:formateur_id (
        id,
        nom,
        prenom,
        email,
        telephone
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching session:", error);
    throw error;
  }

  // Get inscriptions count
  const { count } = await supabase
    .from("inscriptions")
    .select("id", { count: "exact", head: true })
    .eq("session_id", id)
    .neq("status", "annulee");

  return {
    ...session,
    inscriptions_count: count || 0,
  };
}

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: session, isLoading, error } = useQuery({
    queryKey: ["admin-session", id],
    queryFn: () => fetchSession(id),
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9" />
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
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

  const formation = session.formations;
  const formateur = session.formateurs;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={adminStyles.detailHeader}>
        <div className={adminStyles.detailHeaderLeft}>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/sessions")}
            className={adminStyles.backButton}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className={adminStyles.detailTitle}>{formation?.title || "Session"}</h1>
              <Badge variant="outline" className={statusColors[session.status]}>
                {statusLabels[session.status]}
              </Badge>
            </div>
            <p className={adminStyles.detailSubtitle}>
              {format(parseISO(session.start_date), "EEEE d MMMM yyyy", { locale: fr })}
            </p>
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/sessions/${id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Session Info */}
        <Card className={adminStyles.detailCard}>
          <CardHeader className={adminStyles.detailCardHeader}>
            <CardTitle className={adminStyles.sectionTitle}>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {format(parseISO(session.start_date), "d MMMM yyyy", { locale: fr })}
                  {session.end_date && session.end_date !== session.start_date && (
                    <> - {format(parseISO(session.end_date), "d MMMM yyyy", { locale: fr })}</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lieu</p>
                <p className="font-medium">{session.lieu}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Durée</p>
                <p className="font-medium">{formation?.duration || "-"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Places</p>
                <p className="font-medium">
                  {session.inscriptions_count} / {session.places_max} inscrits
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formateur Info */}
        <Card className={adminStyles.detailCard}>
          <CardHeader className={adminStyles.detailCardHeader}>
            <CardTitle className={adminStyles.sectionTitle}>Formateur</CardTitle>
          </CardHeader>
          <CardContent>
            {formateur ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {formateur.prenom} {formateur.nom}
                    </p>
                    <p className="text-sm text-muted-foreground">{formateur.email}</p>
                  </div>
                </div>
                {formateur.telephone && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Tél:</span> {formateur.telephone}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <GraduationCap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucun formateur assigné</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inscriptions */}
        <Card className={`${adminStyles.detailCard} lg:col-span-2`}>
          <CardHeader className={adminStyles.detailCardHeader}>
            <CardTitle className={adminStyles.sectionTitle}>
              Inscriptions ({session.inscriptions_count})
            </CardTitle>
            <Button variant="outline" size="sm">
              Voir tout
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Liste des inscriptions à implémenter</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
