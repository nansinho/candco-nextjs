"use client";

import { useState, useMemo } from "react";
import { useNeedsAnalysis, useNeedsAnalysisMutations } from "@/hooks/admin/useNeedsAnalysis";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ClipboardList,
  Search,
  Download,
  Filter,
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Eye,
  Trash2,
  FileCheck,
  Loader2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

const statusConfig = {
  new: { label: "Nouveau", color: "bg-blue-500/15 text-blue-600", icon: AlertCircle },
  in_progress: { label: "En cours", color: "bg-amber-500/15 text-amber-600", icon: Clock },
  completed: { label: "Terminé", color: "bg-green-500/15 text-green-600", icon: CheckCircle2 },
  pending: { label: "En attente", color: "bg-muted text-muted-foreground", icon: Clock },
};

export default function AnalyseBesoinsPage() {
  const { data: analyses = [], isLoading } = useNeedsAnalysis();
  const { updateStatus, deleteAnalysis } = useNeedsAnalysisMutations();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAnalysis, setSelectedAnalysis] = useState<typeof analyses[0] | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const filteredAnalyses = useMemo(() => {
    return analyses.filter((analysis) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        analysis.respondent_name?.toLowerCase().includes(searchLower) ||
        analysis.respondent_email?.toLowerCase().includes(searchLower) ||
        analysis.client_name?.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === "all" || analysis.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [analyses, searchQuery, statusFilter]);

  const stats = useMemo(() => ({
    total: analyses.length,
    new: analyses.filter((a) => a.status === "new").length,
    inProgress: analyses.filter((a) => a.status === "in_progress").length,
    completed: analyses.filter((a) => a.status === "completed").length,
  }), [analyses]);

  const handleViewDetails = (analysis: typeof analyses[0]) => {
    setSelectedAnalysis(analysis);
    setNotes(analysis.analysis_notes || "");
    setDetailDialogOpen(true);
  };

  const handleMarkAsCompleted = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, analysis_notes: notes });
      toast.success("Analyse marquée comme terminée");
      setDetailDialogOpen(false);
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async () => {
    if (!analysisToDelete) return;
    try {
      await deleteAnalysis.mutateAsync(analysisToDelete);
      toast.success("Analyse supprimée");
      setDeleteDialogOpen(false);
      setAnalysisToDelete(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Nom", "Email", "Entreprise", "Statut", "Date", "Formations"].join(","),
      ...filteredAnalyses.map((a) =>
        [
          a.respondent_name || "",
          a.respondent_email || "",
          a.client_name || "",
          statusConfig[a.status].label,
          a.created_at ? format(parseISO(a.created_at), "dd/MM/yyyy", { locale: fr }) : "",
          a.formations.join("; "),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analyses-besoins-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Export téléchargé");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={ClipboardList}
        title="Analyse des besoins"
        description="Gérez les demandes d'analyse des besoins en formation"
      >
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </AdminPageHeader>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 bg-secondary/30">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total demandes</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nouvelles</CardTitle>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminées</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="border-0 bg-secondary/30">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email ou entreprise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="new">Nouveau</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Aucune analyse trouvée"
          description={searchQuery || statusFilter !== "all"
            ? "Aucune analyse ne correspond à vos critères"
            : "Les demandes d'analyse de besoins apparaîtront ici"}
        />
      ) : (
        <Card className="border-0 bg-secondary/30">
          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className={adminStyles.tableRowHeader}>
                    <TableHead className={adminStyles.tableHead}>Contact</TableHead>
                    <TableHead className={adminStyles.tableHead}>Entreprise</TableHead>
                    <TableHead className={adminStyles.tableHead}>Formations souhaitées</TableHead>
                    <TableHead className={adminStyles.tableHead}>Statut</TableHead>
                    <TableHead className={adminStyles.tableHead}>Date</TableHead>
                    <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnalyses.map((analysis) => {
                    const status = statusConfig[analysis.status];
                    const StatusIcon = status.icon;
                    return (
                      <TableRow
                        key={analysis.id}
                        className={adminStyles.tableRowClickable}
                        onClick={() => handleViewDetails(analysis)}
                      >
                        <TableCell className={adminStyles.tableCell}>
                          <div>
                            <div className="font-medium">{analysis.respondent_name || "—"}</div>
                            <div className="text-xs text-muted-foreground">{analysis.respondent_email || "—"}</div>
                          </div>
                        </TableCell>
                        <TableCell className={adminStyles.tableCell}>
                          {analysis.client_name ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span>{analysis.client_name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className={adminStyles.tableCell}>
                          <div className="flex flex-wrap gap-1">
                            {analysis.formations.length > 0 ? (
                              analysis.formations.slice(0, 2).map((f, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {f}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                            {analysis.formations.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{analysis.formations.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={adminStyles.tableCell}>
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className={adminStyles.tableCell}>
                          {analysis.created_at ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {format(parseISO(analysis.created_at), "dd/MM/yyyy", { locale: fr })}
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className={`${adminStyles.tableCell} text-right`}>
                          <div onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(analysis)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir les détails
                                </DropdownMenuItem>
                                {analysis.status !== "completed" && (
                                  <DropdownMenuItem onClick={() => handleMarkAsCompleted(analysis.id)}>
                                    <FileCheck className="h-4 w-4 mr-2" />
                                    Marquer comme terminé
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setAnalysisToDelete(analysis.id);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y">
              {filteredAnalyses.map((analysis) => {
                const status = statusConfig[analysis.status];
                const StatusIcon = status.icon;
                return (
                  <div
                    key={analysis.id}
                    className="p-4 cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewDetails(analysis)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{analysis.respondent_name || "Contact inconnu"}</p>
                        <p className="text-sm text-muted-foreground">{analysis.respondent_email}</p>
                        {analysis.client_name && (
                          <div className="flex items-center gap-1 mt-1 text-sm">
                            <Building2 className="h-3 w-3" />
                            {analysis.client_name}
                          </div>
                        )}
                      </div>
                      <Badge className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                    {analysis.formations.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {analysis.formations.map((f, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {analysis.created_at && format(parseISO(analysis.created_at), "dd MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de l'analyse</DialogTitle>
            <DialogDescription>
              Informations sur la demande d'analyse des besoins
            </DialogDescription>
          </DialogHeader>
          {selectedAnalysis && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Contact</Label>
                  <p className="font-medium">{selectedAnalysis.respondent_name || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedAnalysis.respondent_email || "—"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Entreprise</Label>
                  <p className="font-medium">{selectedAnalysis.client_name || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Rôle</Label>
                  <p className="font-medium">{selectedAnalysis.respondent_role || "—"}</p>
                </div>
              </div>
              {selectedAnalysis.formations.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Formations souhaitées</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedAnalysis.formations.map((f, i) => (
                      <Badge key={i} variant="outline">{f}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="notes">Notes d'analyse</Label>
                <Textarea
                  id="notes"
                  placeholder="Ajouter des notes sur cette analyse..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Fermer
            </Button>
            {selectedAnalysis && selectedAnalysis.status !== "completed" && (
              <Button
                onClick={() => handleMarkAsCompleted(selectedAnalysis.id)}
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Marquer comme terminé
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette analyse ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'analyse sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteAnalysis.isPending}
            >
              {deleteAnalysis.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
