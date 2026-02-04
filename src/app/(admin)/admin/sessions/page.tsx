"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessions, useSessionMutations, type SessionWithData, type CreateSessionInput } from "@/hooks/admin/useSessions";
import { useFormations } from "@/hooks/admin/useFormations";
import { useFormateurs } from "@/hooks/admin/useFormateurs";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar as CalendarIcon,
  Plus,
  Search,
  MapPin,
  Users,
  Edit,
  Trash2,
  Copy,
  Loader2,
  Clock,
  History,
  CalendarCheck,
  GraduationCap,
  MoreVertical,
  Eye,
} from "lucide-react";
import { format, parseISO, isAfter, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
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

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={`text-xs ${statusColors[status] || ""}`}>
      {statusLabels[status] || status}
    </Badge>
  );
}

export default function AdminSessions() {
  const router = useRouter();
  const { data: sessions = [], isLoading } = useSessions();
  const { data: formations = [] } = useFormations();
  const { data: formateurs = [] } = useFormateurs();
  const { createSession, deleteSession, duplicateSession } = useSessionMutations();

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSession, setNewSession] = useState<Partial<CreateSessionInput>>({
    formation_id: "",
    start_date: "",
    end_date: "",
    lieu: "",
    places_max: 12,
    formateur_id: "",
    format_type: "presentiel",
  });

  const handleCreateSession = async () => {
    if (!newSession.formation_id || !newSession.start_date || !newSession.lieu) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    try {
      await createSession.mutateAsync({
        formation_id: newSession.formation_id,
        start_date: newSession.start_date,
        end_date: newSession.end_date || null,
        lieu: newSession.lieu,
        places_max: newSession.places_max || 12,
        formateur_id: newSession.formateur_id || null,
        format_type: newSession.format_type || "presentiel",
      });
      toast.success("Session créée avec succès");
      setCreateDialogOpen(false);
      setNewSession({
        formation_id: "",
        start_date: "",
        end_date: "",
        lieu: "",
        places_max: 12,
        formateur_id: "",
        format_type: "presentiel",
      });
    } catch (error) {
      toast.error("Erreur lors de la création de la session");
    }
  };

  // Filter sessions based on search
  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesSearch =
        session.formation_title?.toLowerCase().includes(search.toLowerCase()) ||
        session.lieu.toLowerCase().includes(search.toLowerCase()) ||
        session.formateur_name?.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [sessions, search]);

  // Separate sessions by time period
  const { currentSessions, upcomingSessions, pastSessions } = useMemo(() => {
    const today = startOfDay(new Date());

    const current: SessionWithData[] = [];
    const upcoming: SessionWithData[] = [];
    const past: SessionWithData[] = [];

    filteredSessions.forEach((session) => {
      const startDate = startOfDay(parseISO(session.start_date));
      const endDate = session.end_date ? startOfDay(parseISO(session.end_date)) : startDate;

      if (
        session.status === "en_cours" ||
        (["planifiee", "confirmee"].includes(session.status) &&
          !isAfter(startDate, today) &&
          !isBefore(endDate, today))
      ) {
        current.push(session);
      } else if (
        session.status === "terminee" ||
        session.status === "annulee" ||
        isBefore(endDate, today)
      ) {
        past.push(session);
      } else if (isAfter(startDate, today)) {
        upcoming.push(session);
      } else {
        upcoming.push(session);
      }
    });

    return {
      currentSessions: current,
      upcomingSessions: upcoming.sort(
        (a, b) => parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime()
      ),
      pastSessions: past.sort(
        (a, b) => parseISO(b.start_date).getTime() - parseISO(a.start_date).getTime()
      ),
    };
  }, [filteredSessions]);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette session ?")) return;
    await deleteSession.mutateAsync(id);
  };

  const handleDuplicate = async (session: SessionWithData) => {
    await duplicateSession.mutateAsync(session);
  };

  const getPlacesPercentage = (session: SessionWithData) => {
    const taken = session.inscriptions_count || 0;
    return session.places_max > 0 ? (taken / session.places_max) * 100 : 0;
  };

  const renderSessionsTable = (sessionsList: SessionWithData[], isPast = false) => {
    if (sessionsList.length === 0) {
      return (
        <EmptyState
          icon={isPast ? History : CalendarCheck}
          title={isPast ? "Aucune session passée" : "Aucune session à venir"}
          description={
            isPast
              ? "L'historique des sessions terminées apparaîtra ici"
              : "Créez une nouvelle session de formation"
          }
        />
      );
    }

    return (
      <>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={adminStyles.tableRowHeader}>
                <TableHead className={adminStyles.tableHead}>#</TableHead>
                <TableHead className={adminStyles.tableHead}>Formation</TableHead>
                <TableHead className={adminStyles.tableHead}>Date</TableHead>
                <TableHead className={adminStyles.tableHead}>Lieu</TableHead>
                <TableHead className={adminStyles.tableHead}>Formateur</TableHead>
                <TableHead className={adminStyles.tableHead}>Places</TableHead>
                <TableHead className={adminStyles.tableHead}>Statut</TableHead>
                <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessionsList.map((session, index) => (
                <TableRow
                  key={session.id}
                  className={`${adminStyles.tableRowClickable} ${isPast ? "opacity-75" : ""}`}
                  onClick={() => router.push(`/admin/sessions/${session.id}`)}
                >
                  <TableCell className={`${adminStyles.tableCell} text-muted-foreground`}>
                    {index + 1}
                  </TableCell>
                  <TableCell className={`${adminStyles.tableCell} font-medium max-w-[200px]`}>
                    <span className="truncate block">{session.formation_title}</span>
                  </TableCell>
                  <TableCell className={adminStyles.tableCell}>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                      {format(parseISO(session.start_date), "dd MMM yyyy", { locale: fr })}
                    </div>
                  </TableCell>
                  <TableCell className={adminStyles.tableCell}>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate max-w-[120px]">{session.lieu}</span>
                    </div>
                  </TableCell>
                  <TableCell className={adminStyles.tableCell}>
                    {session.formateur_name ? (
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate max-w-[100px]">{session.formateur_name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className={adminStyles.tableCell}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${getPlacesPercentage(session)}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground text-xs whitespace-nowrap">
                        {session.inscriptions_count} / {session.places_max}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className={adminStyles.tableCell}>
                    <StatusBadge status={session.status} />
                  </TableCell>
                  <TableCell className={`${adminStyles.tableCell} text-right`}>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className={adminStyles.tableActionButton}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/admin/sessions/${session.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/sessions/${session.id}/edit`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(session)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(session.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {sessionsList.map((session) => (
            <Card
              key={session.id}
              className={`border-0 bg-secondary/30 cursor-pointer ${isPast ? "opacity-75" : ""}`}
              onClick={() => router.push(`/admin/sessions/${session.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{session.formation_title}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <CalendarIcon className="h-3 w-3" />
                      {format(parseISO(session.start_date), "dd MMM yyyy", { locale: fr })}
                      <span>•</span>
                      <MapPin className="h-3 w-3" />
                      {session.lieu}
                    </div>
                    {session.formateur_name && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                        <GraduationCap className="h-3 w-3" />
                        {session.formateur_name}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {session.inscriptions_count}/{session.places_max} inscrits
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={session.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        icon={CalendarIcon}
        title="Sessions"
        description="Gérez les sessions de formation et les inscriptions"
      >
        <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Nouvelle session</span>
          <span className="sm:hidden">Ajouter</span>
        </Button>
      </AdminPageHeader>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="border-0 bg-secondary/30">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">{sessions.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Planifiées</p>
              <p className="text-2xl font-semibold text-blue-600">
                {sessions.filter((s) => s.status === "planifiee").length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Confirmées</p>
              <p className="text-2xl font-semibold text-emerald-600">
                {sessions.filter((s) => s.status === "confirmee").length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">En cours</p>
              <p className="text-2xl font-semibold text-amber-600">
                {sessions.filter((s) => s.status === "en_cours").length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Terminées</p>
              <p className="text-2xl font-semibold text-muted-foreground">
                {sessions.filter((s) => s.status === "terminee").length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une session..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2 -mb-2">
          <TabsList className="inline-flex w-max bg-muted/30">
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              <span>À venir</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {upcomingSessions.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="current" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>En cours</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {currentSessions.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span>Passées</span>
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {pastSessions.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <TabsContent value="upcoming" className="mt-4">
              {renderSessionsTable(upcomingSessions)}
            </TabsContent>
            <TabsContent value="current" className="mt-4">
              {renderSessionsTable(currentSessions)}
            </TabsContent>
            <TabsContent value="past" className="mt-4">
              {renderSessionsTable(pastSessions, true)}
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Dialog de création de session */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle session</DialogTitle>
            <DialogDescription>
              Créez une nouvelle session de formation
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="formation">Formation *</Label>
              <Select
                value={newSession.formation_id}
                onValueChange={(value) => setNewSession({ ...newSession, formation_id: value })}
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Date de début *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={newSession.start_date}
                  onChange={(e) => setNewSession({ ...newSession, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">Date de fin</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={newSession.end_date || ""}
                  onChange={(e) => setNewSession({ ...newSession, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lieu">Lieu *</Label>
              <Input
                id="lieu"
                placeholder="Ex: Paris, Lyon, En ligne..."
                value={newSession.lieu}
                onChange={(e) => setNewSession({ ...newSession, lieu: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="places_max">Nombre de places</Label>
                <Input
                  id="places_max"
                  type="number"
                  min={1}
                  value={newSession.places_max}
                  onChange={(e) => setNewSession({ ...newSession, places_max: parseInt(e.target.value) || 12 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="format_type">Format</Label>
                <Select
                  value={newSession.format_type}
                  onValueChange={(value) => setNewSession({ ...newSession, format_type: value })}
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
              <Label htmlFor="formateur">Formateur (optionnel)</Label>
              <Select
                value={newSession.formateur_id || "none"}
                onValueChange={(value) => setNewSession({ ...newSession, formateur_id: value === "none" ? "" : value })}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateSession} disabled={createSession.isPending}>
              {createSession.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer la session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
