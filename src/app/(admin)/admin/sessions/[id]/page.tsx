"use client";

import { use, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useFormateurs } from "@/hooks/admin/useFormateurs";
import { useClients } from "@/hooks/admin/useClients";
import { useSessionInscriptionMutations } from "@/hooks/admin/useSessionInscriptions";
import { useSessionConversation } from "@/hooks/admin/useSessionConversation";
import { useSessionMessages, useSessionMessageMutations } from "@/hooks/admin/useSessionMessages";
import { useSessionActivities, useSessionActivityMutations, ACTIVITY_TYPES } from "@/hooks/admin/useSessionActivities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  UserPlus,
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
  Send,
  Download,
  Trash2,
  MoreHorizontal,
  Plus,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
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
  nom: string | null;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
  client_id: string | null;
  client_name: string | null;
}

async function fetchSession(id: string) {
  const supabase = createClient();

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (sessionError) throw new Error(`Session error: ${sessionError.message}`);
  if (!session) throw new Error("Session not found");

  let formation = null;
  if (session.formation_id) {
    const { data } = await supabase
      .from("formations")
      .select("id, title, pole, pole_name, duration, description")
      .eq("id", session.formation_id)
      .single();
    formation = data;
  }

  let formateur = null;
  if (session.formateur_id) {
    const { data } = await supabase
      .from("formateurs")
      .select("id, nom, prenom, email, telephone, specialites, bio")
      .eq("id", session.formateur_id)
      .single();
    formateur = data;
  }

  const { data: inscriptions } = await supabase
    .from("inscriptions")
    .select("id, status, created_at, nom, prenom, email, telephone, client_id")
    .eq("session_id", id)
    .order("created_at", { ascending: false });

  type InscriptionRow = { id: string; status: string; created_at: string; nom: string | null; prenom: string | null; email: string | null; telephone: string | null; client_id: string | null };
  const clientIds = [...new Set((inscriptions || []).filter((i: InscriptionRow) => i.client_id).map((i: InscriptionRow) => i.client_id))];
  const clientsMap: Record<string, string> = {};
  if (clientIds.length > 0) {
    const { data: clients } = await supabase.from("clients").select("id, nom").in("id", clientIds);
    clients?.forEach((c: { id: string; nom: string }) => { clientsMap[c.id] = c.nom; });
  }

  const inscriptionsWithClients = (inscriptions || []).map((i: InscriptionRow) => ({
    ...i,
    client_name: i.client_id ? clientsMap[i.client_id] || null : null,
  }));

  return {
    ...session,
    formations: formation,
    formateurs: formateur,
    inscriptions: inscriptionsWithClients,
    inscriptions_count: inscriptionsWithClients.filter((i: InscriptionRow & { client_name: string | null }) => i.status !== "annulee").length,
  };
}

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Dialogs
  const [addParticipantOpen, setAddParticipantOpen] = useState(false);
  const [assignFormateurOpen, setAssignFormateurOpen] = useState(false);

  // Form states
  const [participantForm, setParticipantForm] = useState({
    prenom: "", nom: "", email: "", telephone: "", client_id: "",
  });
  const [selectedFormateur, setSelectedFormateur] = useState("");
  const [messageInput, setMessageInput] = useState("");

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Queries & Mutations
  const { data: session, isLoading, error } = useQuery({
    queryKey: ["admin-session-detail", id],
    queryFn: () => fetchSession(id),
    staleTime: 60 * 1000,
  });

  const { data: formateurs = [] } = useFormateurs();
  const { data: clients = [] } = useClients();

  const { addParticipant, cancelInscription } = useSessionInscriptionMutations();

  // Get or create conversation for this session, then fetch messages
  const { data: conversation, isLoading: conversationLoading, error: conversationError } = useSessionConversation(id);
  const { data: messages = [], isLoading: messagesLoading } = useSessionMessages(conversation?.id);
  const { sendMessage } = useSessionMessageMutations();

  const { data: activities = [] } = useSessionActivities(id);
  const { logActivity } = useSessionActivityMutations();

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAddParticipant = async () => {
    if (!participantForm.prenom || !participantForm.nom) {
      toast.error("Prénom et nom requis");
      return;
    }
    try {
      await addParticipant.mutateAsync({
        session_id: id,
        prenom: participantForm.prenom,
        nom: participantForm.nom,
        email: participantForm.email || undefined,
        telephone: participantForm.telephone || undefined,
        client_id: participantForm.client_id || undefined,
        status: "confirmee",
      });
      toast.success("Participant ajouté");
      setAddParticipantOpen(false);
      setParticipantForm({ prenom: "", nom: "", email: "", telephone: "", client_id: "" });
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  };

  const handleAssignFormateur = async () => {
    if (!selectedFormateur) {
      toast.error("Sélectionnez un formateur");
      return;
    }
    try {
      const supabase = createClient();
      const formateurData = formateurs.find(f => f.id === selectedFormateur);

      await supabase.from("sessions").update({ formateur_id: selectedFormateur }).eq("id", id);

      await logActivity.mutateAsync({
        sessionId: id,
        type: "formateur_assigned",
        description: `${formateurData?.prenom} ${formateurData?.nom} assigné comme formateur`,
      });

      queryClient.invalidateQueries({ queryKey: ["admin-session-detail", id] });
      toast.success("Formateur assigné");
      setAssignFormateurOpen(false);
      setSelectedFormateur("");
    } catch {
      toast.error("Erreur lors de l'assignation");
    }
  };

  const handleCancelInscription = async (inscription: Inscription) => {
    try {
      await cancelInscription.mutateAsync({
        id: inscription.id,
        sessionId: id,
        participantName: `${inscription.prenom} ${inscription.nom}`,
      });
      toast.success("Inscription annulée");
    } catch {
      toast.error("Erreur lors de l'annulation");
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !conversation?.id) return;
    try {
      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        content: messageInput,
        senderId: "admin",
        senderType: "admin",
        senderName: "Admin",
      });
      setMessageInput("");
    } catch {
      toast.error("Erreur lors de l'envoi");
    }
  };

  const handleQuickAction = async (action: string) => {
    toast.info(`Action "${action}" - Fonctionnalité à venir`);
    await logActivity.mutateAsync({
      sessionId: id,
      type: action === "rappel" ? "notification_sent" : "document_generated",
      description: `Action: ${action}`,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2"><Skeleton className="h-96" /></div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Session non trouvée</p>
        {error && <p className="text-sm text-destructive mt-2">{error instanceof Error ? error.message : "Erreur"}</p>}
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
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/sessions")}>
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

        <Card className="border-0 bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => setAssignFormateurOpen(true)}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">
                  {formateur ? `${formateur.prenom} ${formateur.nom}` : "Non assigné"}
                </p>
                <p className="text-sm text-muted-foreground">Formateur</p>
                <p className="text-xs text-primary mt-1">Cliquer pour modifier</p>
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
            {inscriptions.length > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5">{inscriptions.length}</Badge>}
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
            {activities.length > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5">{activities.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
            {messages.length > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5">{messages.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
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
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Format & Lieu</p>
                      <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 mt-1">
                        {session.format_type === "distanciel" ? "Distanciel" : "Présentiel"}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">{session.lieu}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{formation?.title}</p>
                      <Badge variant="outline" className="mt-1">{formation?.pole_name || formation?.pole}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-secondary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Activité récente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activities.length > 0 ? (
                    <div className="space-y-3">
                      {activities.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <History className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(parseISO(activity.created_at), { addSuffix: true, locale: fr })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Aucune activité</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 bg-secondary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { key: "rappel", icon: Bell, color: "text-amber-500", title: "Envoyer un rappel", desc: "Email aux participants" },
                  { key: "convention", icon: FileCheck, color: "text-blue-500", title: "Générer la convention", desc: "Document contractuel" },
                  { key: "feuille", icon: ClipboardCheck, color: "text-emerald-500", title: "Feuille de présence", desc: "Émargement participants" },
                  { key: "certificats", icon: Award, color: "text-purple-500", title: "Générer les certificats", desc: "Attestations de réussite" },
                  { key: "satisfaction", icon: Star, color: "text-orange-500", title: "Questionnaire satisfaction", desc: "Évaluation post-formation" },
                ].map(({ key, icon: Icon, color, title, desc }) => (
                  <Button key={key} variant="ghost" className="w-full justify-start h-auto py-3" onClick={() => handleQuickAction(key)}>
                    <Icon className={`h-5 w-5 mr-3 ${color}`} />
                    <div className="text-left">
                      <p className="font-medium">{title}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-4">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Inscriptions ({inscriptions.length})</CardTitle>
              <Button size="sm" onClick={() => setAddParticipantOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
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
                          {inscription.prenom} {inscription.nom}
                        </TableCell>
                        <TableCell>{inscription.email || "-"}</TableCell>
                        <TableCell>{inscription.telephone || "-"}</TableCell>
                        <TableCell>{inscription.client_name || "Individuel"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            inscription.status === "confirmee" ? "bg-emerald-500/10 text-emerald-600" :
                            inscription.status === "annulee" ? "bg-destructive/10 text-destructive" :
                            "bg-blue-500/10 text-blue-600"
                          }>
                            {inscription.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Mail className="mr-2 h-4 w-4" />Envoyer un email</DropdownMenuItem>
                              <DropdownMenuItem><Download className="mr-2 h-4 w-4" />Télécharger convention</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleCancelInscription(inscription)}>
                                <Trash2 className="mr-2 h-4 w-4" />Annuler inscription
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
                  <Button variant="outline" className="mt-4" onClick={() => setAddParticipantOpen(true)}>
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
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Formateur assigné</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setAssignFormateurOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {formateur ? "Changer" : "Assigner"}
              </Button>
            </CardHeader>
            <CardContent>
              {formateur ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{formateur.prenom} {formateur.nom}</p>
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
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Mail className="mr-2 h-4 w-4" />Contacter</Button>
                    <Link href={`/admin/formateurs/${formateur.id}`}>
                      <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" />Voir le profil</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun formateur assigné</p>
                  <Button variant="outline" className="mt-4" onClick={() => setAssignFormateurOpen(true)}>
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
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Documents de la session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { key: "convention", icon: FileCheck, color: "text-blue-500", title: "Convention de formation", desc: "Générer ou télécharger" },
                  { key: "feuille", icon: ClipboardCheck, color: "text-emerald-500", title: "Feuille de présence", desc: "Émargement participants" },
                  { key: "certificats", icon: Award, color: "text-purple-500", title: "Certificats", desc: "Attestations de réussite" },
                  { key: "programme", icon: FileText, color: "text-amber-500", title: "Programme de formation", desc: "Contenu pédagogique" },
                ].map(({ key, icon: Icon, color, title, desc }) => (
                  <Button key={key} variant="outline" className="h-auto py-4 justify-start" onClick={() => handleQuickAction(key)}>
                    <Icon className={`h-8 w-8 mr-4 ${color}`} />
                    <div className="text-left">
                      <p className="font-medium">{title}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Historique des activités</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                          activity.type.includes("added") || activity.type.includes("created") ? "bg-emerald-500/10" :
                          activity.type.includes("cancelled") || activity.type.includes("removed") ? "bg-destructive/10" :
                          "bg-blue-500/10"
                        }`}>
                          {activity.type.includes("added") || activity.type.includes("created") ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          ) : activity.type.includes("cancelled") || activity.type.includes("removed") ? (
                            <XCircle className="h-5 w-5 text-destructive" />
                          ) : (
                            <RefreshCw className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        {index < activities.length - 1 && <div className="w-px flex-1 bg-border mt-2" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">
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
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Messages de la session</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] px-6">
                {conversationError ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
                    <p className="text-destructive font-medium">Erreur de chargement</p>
                    <p className="text-sm text-muted-foreground mt-1">Impossible de charger la conversation</p>
                  </div>
                ) : conversationLoading || messagesLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
                    <p className="text-muted-foreground">Chargement des messages...</p>
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4 py-4">
                    {messages.map((message) => (
                      <div key={message.id} className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{message.sender_name || "Utilisateur"}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(parseISO(message.created_at), { addSuffix: true, locale: fr })}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucun message</p>
                    <p className="text-xs text-muted-foreground mt-1">Envoyez un message pour démarrer la conversation</p>
                  </div>
                )}
              </ScrollArea>
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Écrire un message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                    disabled={!conversation || conversationLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sendMessage.isPending || !conversation}
                  >
                    {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Participant Dialog */}
      <Dialog open={addParticipantOpen} onOpenChange={setAddParticipantOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un participant</DialogTitle>
            <DialogDescription>Ajoutez un nouveau participant à cette session.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom *</Label>
                <Input value={participantForm.prenom} onChange={(e) => setParticipantForm({ ...participantForm, prenom: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input value={participantForm.nom} onChange={(e) => setParticipantForm({ ...participantForm, nom: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={participantForm.email} onChange={(e) => setParticipantForm({ ...participantForm, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input value={participantForm.telephone} onChange={(e) => setParticipantForm({ ...participantForm, telephone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Client (optionnel)</Label>
              <Select value={participantForm.client_id} onValueChange={(v) => setParticipantForm({ ...participantForm, client_id: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un client" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun (individuel)</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>{client.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddParticipantOpen(false)}>Annuler</Button>
            <Button onClick={handleAddParticipant} disabled={addParticipant.isPending}>
              {addParticipant.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Formateur Dialog */}
      <Dialog open={assignFormateurOpen} onOpenChange={setAssignFormateurOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un formateur</DialogTitle>
            <DialogDescription>Sélectionnez un formateur pour cette session.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedFormateur} onValueChange={setSelectedFormateur}>
              <SelectTrigger><SelectValue placeholder="Sélectionner un formateur" /></SelectTrigger>
              <SelectContent>
                {formateurs.filter(f => f.active).map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.prenom} {f.nom} - {f.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignFormateurOpen(false)}>Annuler</Button>
            <Button onClick={handleAssignFormateur} disabled={!selectedFormateur}>
              Assigner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
