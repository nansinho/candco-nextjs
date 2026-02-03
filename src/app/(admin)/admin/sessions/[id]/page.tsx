"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  ArrowLeft,
  MapPin,
  Users,
  GraduationCap,
  Edit,
  Clock,
  Building2,
  Eye,
  FileText,
  UserCheck,
  ClipboardList,
  MessageSquare,
  History,
  Bell,
  FileCheck,
  ClipboardCheck,
  Award,
  Star,
  Mail,
  Phone,
  Globe,
  Send,
  Download,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

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

interface Inscription {
  id: string;
  status: string;
  created_at: string;
  participant_nom: string | null;
  participant_prenom: string | null;
  participant_email: string | null;
  participant_telephone: string | null;
  client_id: string | null;
  client_name: string | null;
}

interface SessionActivity {
  id: string;
  type: string;
  description: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

async function fetchSession(id: string) {
  const supabase = createClient();

  // First, fetch just the session
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (sessionError) {
    console.error("Error fetching session:", sessionError);
    throw new Error(`Session error: ${sessionError.message}`);
  }

  if (!session) {
    throw new Error("Session not found");
  }

  // Fetch formation separately
  let formation = null;
  if (session.formation_id) {
    const { data: formationData } = await supabase
      .from("formations")
      .select("id, title, pole, pole_name, duration, description")
      .eq("id", session.formation_id)
      .single();
    formation = formationData;
  }

  // Fetch formateur separately
  let formateur = null;
  if (session.formateur_id) {
    const { data: formateurData } = await supabase
      .from("formateurs")
      .select("id, nom, prenom, email, telephone, specialites, bio")
      .eq("id", session.formateur_id)
      .single();
    formateur = formateurData;
  }

  // Get inscriptions with participant details
  const { data: inscriptions } = await supabase
    .from("inscriptions")
    .select(`
      id,
      status,
      created_at,
      participant_nom,
      participant_prenom,
      participant_email,
      participant_telephone,
      client_id
    `)
    .eq("session_id", id)
    .order("created_at", { ascending: false });

  // Get client names for inscriptions
  const clientIds = [...new Set((inscriptions || []).filter(i => i.client_id).map(i => i.client_id))];
  let clientsMap: Record<string, string> = {};
  if (clientIds.length > 0) {
    const { data: clients } = await supabase
      .from("clients")
      .select("id, nom")
      .in("id", clientIds);
    clients?.forEach(c => {
      clientsMap[c.id] = c.nom;
    });
  }

  const inscriptionsWithClients = (inscriptions || []).map(i => ({
    ...i,
    client_name: i.client_id ? clientsMap[i.client_id] || null : null,
  }));

  // Get activity logs if the table exists
  let activities: SessionActivity[] = [];
  try {
    const { data: activityData } = await supabase
      .from("session_activities")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: false })
      .limit(10);
    activities = activityData || [];
  } catch {
    // Table might not exist
  }

  return {
    ...session,
    formations: formation,
    formateurs: formateur,
    inscriptions: inscriptionsWithClients,
    inscriptions_count: inscriptionsWithClients.filter(i => i.status !== "annulee").length,
    activities,
  };
}

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: session, isLoading, error } = useQuery({
    queryKey: ["admin-session-detail", id],
    queryFn: () => fetchSession(id),
    staleTime: 60 * 1000,
  });

  const handleQuickAction = (action: string) => {
    toast.info(`Action "${action}" - À implémenter`);
  };

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
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Session non trouvée</p>
        {error && (
          <p className="text-sm text-destructive mt-2">
            Erreur: {error instanceof Error ? error.message : "Erreur inconnue"}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">ID: {id}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/admin/sessions")}>
          Retour aux sessions
        </Button>
      </div>
    );
  }

  const formation = session.formations;
  const formateur = session.formateurs;
  const inscriptions = session.inscriptions as Inscription[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/sessions")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold">{formation?.title || "Session"}</h1>
              <Badge variant="outline" className={statusColors[session.status]}>
                {statusLabels[session.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(parseISO(session.start_date), "EEEE d MMMM yyyy", { locale: fr })}
            </p>
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/sessions/${id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 bg-secondary/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{session.inscriptions_count} / {session.places_max}</p>
                <p className="text-sm text-muted-foreground">Participants</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((session.inscriptions_count / session.places_max) * 100)}% de remplissage
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-secondary/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">
                  {formateur ? `${formateur.prenom} ${formateur.nom}` : "Non assigné"}
                </p>
                <p className="text-sm text-muted-foreground">Formateur</p>
                {formateur && (
                  <p className="text-xs text-muted-foreground mt-1">Formateur assigné</p>
                )}
              </div>
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-secondary/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">Session publique</p>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="text-xs text-muted-foreground mt-1">Inscriptions individuelles</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1 bg-secondary/30">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Participants
            {inscriptions.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {inscriptions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="formateur" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Formateur
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Session Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 bg-secondary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Détails de la session
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(session.start_date), "EEEE d MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                  </div>

                  {(session.horaire_matin || session.horaire_aprem) && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Horaires</p>
                        {session.horaire_matin && (
                          <p className="text-sm text-muted-foreground">Matin : {session.horaire_matin}</p>
                        )}
                        {session.horaire_aprem && (
                          <p className="text-sm text-muted-foreground">Après-midi : {session.horaire_aprem}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Format & Lieu</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                          {session.format_type === "distanciel" ? "Distanciel" : "Présentiel"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{session.lieu}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{formation?.title}</p>
                      <Badge variant="outline" className="mt-1">
                        {formation?.pole_name || formation?.pole}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity */}
              <Card className="border-0 bg-secondary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Activité récente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {session.activities && session.activities.length > 0 ? (
                    <div className="space-y-4">
                      {session.activities.map((activity: SessionActivity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <History className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{activity.type}</p>
                            <p className="text-xs text-muted-foreground">{activity.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(parseISO(activity.created_at), "d MMM yyyy à HH:mm", { locale: fr })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucune activité récente</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card className="border-0 bg-secondary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Actions rapides
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handleQuickAction("rappel")}
                  >
                    <Bell className="h-5 w-5 mr-3 text-amber-500" />
                    <div className="text-left">
                      <p className="font-medium">Envoyer un rappel</p>
                      <p className="text-xs text-muted-foreground">Email aux participants</p>
                    </div>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handleQuickAction("convention")}
                  >
                    <FileCheck className="h-5 w-5 mr-3 text-blue-500" />
                    <div className="text-left">
                      <p className="font-medium">Générer la convention</p>
                      <p className="text-xs text-muted-foreground">Document contractuel</p>
                    </div>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handleQuickAction("feuille")}
                  >
                    <ClipboardCheck className="h-5 w-5 mr-3 text-emerald-500" />
                    <div className="text-left">
                      <p className="font-medium">Feuille de présence</p>
                      <p className="text-xs text-muted-foreground">Émargement participants</p>
                    </div>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handleQuickAction("certificats")}
                  >
                    <Award className="h-5 w-5 mr-3 text-purple-500" />
                    <div className="text-left">
                      <p className="font-medium">Générer les certificats</p>
                      <p className="text-xs text-muted-foreground">Attestations de réussite</p>
                    </div>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start h-auto py-3"
                    onClick={() => handleQuickAction("satisfaction")}
                  >
                    <Star className="h-5 w-5 mr-3 text-orange-500" />
                    <div className="text-left">
                      <p className="font-medium">Questionnaire satisfaction</p>
                      <p className="text-xs text-muted-foreground">Évaluation post-formation</p>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-4">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">
                Inscriptions ({inscriptions.length})
              </CardTitle>
              <Button size="sm">
                <UserCheck className="mr-2 h-4 w-4" />
                Ajouter un participant
              </Button>
            </CardHeader>
            <CardContent>
              {inscriptions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inscriptions.map((inscription) => (
                      <TableRow key={inscription.id}>
                        <TableCell className="font-medium">
                          {inscription.participant_prenom} {inscription.participant_nom}
                        </TableCell>
                        <TableCell>{inscription.participant_email || "-"}</TableCell>
                        <TableCell>{inscription.participant_telephone || "-"}</TableCell>
                        <TableCell>{inscription.client_name || "Individuel"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            inscription.status === "confirmee"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : inscription.status === "annulee"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-blue-500/10 text-blue-600"
                          }>
                            {inscription.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Envoyer un email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Télécharger convention
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Annuler inscription
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun participant inscrit</p>
                  <Button variant="outline" className="mt-4">
                    Ajouter le premier participant
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Formateur Tab */}
        <TabsContent value="formateur" className="space-y-4">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Formateur assigné</CardTitle>
            </CardHeader>
            <CardContent>
              {formateur ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {formateur.prenom} {formateur.nom}
                      </p>
                      <p className="text-sm text-muted-foreground">Formateur</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{formateur.email}</p>
                      </div>
                    </div>
                    {formateur.telephone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Téléphone</p>
                          <p className="font-medium">{formateur.telephone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {formateur.bio && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Biographie</p>
                      <p className="text-sm">{formateur.bio}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Mail className="mr-2 h-4 w-4" />
                      Contacter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Link href={`/admin/formateurs/${formateur.id}`} className="flex items-center">
                        <Eye className="mr-2 h-4 w-4" />
                        Voir le profil
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun formateur assigné</p>
                  <Button variant="outline" className="mt-4" onClick={() => router.push(`/admin/sessions/${id}/edit`)}>
                    Assigner un formateur
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Documents de la session</CardTitle>
              <Button size="sm">
                <FileText className="mr-2 h-4 w-4" />
                Ajouter un document
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start"
                  onClick={() => handleQuickAction("convention")}
                >
                  <FileCheck className="h-8 w-8 mr-4 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium">Convention de formation</p>
                    <p className="text-xs text-muted-foreground">Générer ou télécharger</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start"
                  onClick={() => handleQuickAction("feuille")}
                >
                  <ClipboardCheck className="h-8 w-8 mr-4 text-emerald-500" />
                  <div className="text-left">
                    <p className="font-medium">Feuille de présence</p>
                    <p className="text-xs text-muted-foreground">Émargement participants</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start"
                  onClick={() => handleQuickAction("certificats")}
                >
                  <Award className="h-8 w-8 mr-4 text-purple-500" />
                  <div className="text-left">
                    <p className="font-medium">Certificats</p>
                    <p className="text-xs text-muted-foreground">Attestations de réussite</p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-4 justify-start"
                  onClick={() => handleQuickAction("programme")}
                >
                  <FileText className="h-8 w-8 mr-4 text-amber-500" />
                  <div className="text-left">
                    <p className="font-medium">Programme de formation</p>
                    <p className="text-xs text-muted-foreground">Contenu pédagogique</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Historique des modifications</CardTitle>
            </CardHeader>
            <CardContent>
              {session.activities && session.activities.length > 0 ? (
                <div className="space-y-4">
                  {session.activities.map((activity: SessionActivity, index: number) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <History className="h-4 w-4 text-primary" />
                        </div>
                        {index < session.activities.length - 1 && (
                          <div className="w-px h-full bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">{activity.type}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(parseISO(activity.created_at), "d MMMM yyyy à HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun historique disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Messages</CardTitle>
              <Button size="sm">
                <Send className="mr-2 h-4 w-4" />
                Nouveau message
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucun message pour cette session</p>
                <Button variant="outline" className="mt-4">
                  Envoyer un message aux participants
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

