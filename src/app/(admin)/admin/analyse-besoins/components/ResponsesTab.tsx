"use client";

import { useState, useMemo } from "react";
import { useNeedsAnalysis, useNeedsAnalysisMutations, type NeedsAnalysisResponse } from "@/hooks/admin/useNeedsAnalysis";
import { useNeedsAnalysisTemplates } from "@/hooks/admin/useNeedsAnalysisTemplates";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Trash2,
  FileCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Loader2,
  Mail,
  User,
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

export function ResponsesTab() {
  const { data: responses = [], isLoading } = useNeedsAnalysis();
  const { data: templates = [] } = useNeedsAnalysisTemplates();
  const { updateStatus, deleteAnalysis } = useNeedsAnalysisMutations();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [selectedResponse, setSelectedResponse] = useState<NeedsAnalysisResponse | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const filteredResponses = useMemo(() => {
    return responses.filter((response) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        response.respondent_name?.toLowerCase().includes(searchLower) ||
        response.respondent_email?.toLowerCase().includes(searchLower) ||
        response.client_name?.toLowerCase().includes(searchLower);
      const matchesStatus = statusFilter === "all" || response.status === statusFilter;
      const matchesTemplate = templateFilter === "all" || response.template_id === templateFilter;
      return matchesSearch && matchesStatus && matchesTemplate;
    });
  }, [responses, searchQuery, statusFilter, templateFilter]);

  const stats = useMemo(
    () => ({
      total: responses.length,
      new: responses.filter((r) => r.status === "new").length,
      inProgress: responses.filter((r) => r.status === "in_progress").length,
      completed: responses.filter((r) => r.status === "completed").length,
    }),
    [responses]
  );

  const handleViewDetails = (response: NeedsAnalysisResponse) => {
    setSelectedResponse(response);
    setNotes(response.analysis_notes || "");
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
    if (!responseToDelete) return;
    try {
      await deleteAnalysis.mutateAsync(responseToDelete);
      toast.success("Réponse supprimée");
      setDeleteDialogOpen(false);
      setResponseToDelete(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Nom", "Email", "Entreprise", "Questionnaire", "Statut", "Date", "Formations"].join(","),
      ...filteredResponses.map((r) => {
        const template = templates.find((t) => t.id === r.template_id);
        return [
          r.respondent_name || "",
          r.respondent_email || "",
          r.client_name || "",
          template?.name || "",
          statusConfig[r.status].label,
          r.created_at ? format(parseISO(r.created_at), "dd/MM/yyyy", { locale: fr }) : "",
          r.formations.join("; "),
        ].join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reponses-analyse-besoins-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Export téléchargé");
  };

  // Get template name for a response
  const getTemplateName = (templateId: string) => {
    return templates.find((t) => t.id === templateId)?.name || "Questionnaire inconnu";
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 bg-secondary/30">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card className="border-0 bg-secondary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3 md:px-6 md:pt-6">
            <CardTitle className="text-xs md:text-sm font-medium">Total réponses</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground hidden sm:block" />
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
            <div className="text-xl md:text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-secondary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3 md:px-6 md:pt-6">
            <CardTitle className="text-xs md:text-sm font-medium">Nouvelles</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600 hidden sm:block" />
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
            <div className="text-xl md:text-2xl font-bold text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-secondary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3 md:px-6 md:pt-6">
            <CardTitle className="text-xs md:text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-amber-600 hidden sm:block" />
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
            <div className="text-xl md:text-2xl font-bold text-amber-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-secondary/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 pt-3 md:px-6 md:pt-6">
            <CardTitle className="text-xs md:text-sm font-medium">Terminées</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600 hidden sm:block" />
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-6 md:pb-6">
            <div className="text-xl md:text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 bg-secondary/30">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col gap-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
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
              <Select value={templateFilter} onValueChange={setTemplateFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Questionnaire" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleExport} variant="outline" size="sm" className="w-full sm:w-auto sm:ml-auto">
                <Download className="h-4 w-4 sm:mr-2" />
                <span className="sm:inline">Exporter</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {filteredResponses.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Aucune réponse trouvée"
          description={
            searchQuery || statusFilter !== "all" || templateFilter !== "all"
              ? "Aucune réponse ne correspond à vos critères"
              : "Les réponses aux questionnaires apparaîtront ici"
          }
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
                    <TableHead className={adminStyles.tableHead}>Questionnaire</TableHead>
                    <TableHead className={adminStyles.tableHead}>Entreprise</TableHead>
                    <TableHead className={adminStyles.tableHead}>Statut</TableHead>
                    <TableHead className={adminStyles.tableHead}>Date</TableHead>
                    <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResponses.map((response) => {
                    const status = statusConfig[response.status];
                    const StatusIcon = status.icon;
                    return (
                      <TableRow
                        key={response.id}
                        className={`${adminStyles.tableRowClickable} cursor-pointer`}
                        onClick={() => handleViewDetails(response)}
                      >
                        <TableCell className={adminStyles.tableCell}>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{response.respondent_name || "—"}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {response.respondent_email || "—"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className={adminStyles.tableCell}>
                          <span className="text-sm">{getTemplateName(response.template_id)}</span>
                        </TableCell>
                        <TableCell className={adminStyles.tableCell}>
                          {response.client_name ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span>{response.client_name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className={adminStyles.tableCell}>
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className={adminStyles.tableCell}>
                          {response.created_at ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {format(parseISO(response.created_at), "dd/MM/yyyy", { locale: fr })}
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
                                <DropdownMenuItem onClick={() => handleViewDetails(response)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir les détails
                                </DropdownMenuItem>
                                {response.status !== "completed" && (
                                  <DropdownMenuItem
                                    onClick={() => handleMarkAsCompleted(response.id)}
                                  >
                                    <FileCheck className="h-4 w-4 mr-2" />
                                    Marquer comme terminé
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => {
                                    setResponseToDelete(response.id);
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
              {filteredResponses.map((response) => {
                const status = statusConfig[response.status];
                const StatusIcon = status.icon;
                return (
                  <button
                    key={response.id}
                    type="button"
                    className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                    onClick={() => handleViewDetails(response)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{response.respondent_name || "Contact inconnu"}</p>
                        <p className="text-sm text-muted-foreground truncate">{response.respondent_email}</p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {getTemplateName(response.template_id)}
                        </p>
                      </div>
                      <Badge className={`${status.color} flex-shrink-0`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        <span className="hidden xs:inline">{status.label}</span>
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {response.created_at &&
                        format(parseISO(response.created_at), "dd MMM yyyy", { locale: fr })}
                    </p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl h-[90vh] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="text-lg">Détails de la réponse</DialogTitle>
            <DialogDescription className="text-sm">
              {selectedResponse && `Réponse au questionnaire "${getTemplateName(selectedResponse.template_id)}"`}
            </DialogDescription>
          </DialogHeader>

          {selectedResponse && (
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              <div className="space-y-6">
                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Contact</Label>
                    <p className="font-medium mt-1">{selectedResponse.respondent_name || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Email</Label>
                    <p className="font-medium mt-1 break-all">{selectedResponse.respondent_email || "—"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Entreprise</Label>
                    <p className="font-medium mt-1">{selectedResponse.client_name || "—"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Rôle</Label>
                    <p className="font-medium mt-1">{selectedResponse.respondent_role || "—"}</p>
                  </div>
                </div>

                {/* Formations */}
                {selectedResponse.formations.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Formations souhaitées</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedResponse.formations.map((f, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Responses */}
                {selectedResponse.responses && Object.keys(selectedResponse.responses).length > 0 && (
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide mb-3 block">Réponses</Label>
                    <div className="space-y-3">
                      {Object.entries(selectedResponse.responses).map(([key, value]) => (
                        <div key={key} className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">{key}</p>
                          <p className="mt-1 text-sm">
                            {Array.isArray(value) ? value.join(", ") : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <Label htmlFor="notes" className="text-muted-foreground text-xs uppercase tracking-wide">Notes d'analyse</Label>
                  <Textarea
                    id="notes"
                    placeholder="Ajouter des notes sur cette analyse..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="mt-2 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="px-4 sm:px-6 py-4 border-t flex-shrink-0 gap-2 flex-col sm:flex-row">
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)} className="w-full sm:w-auto">
              Fermer
            </Button>
            {selectedResponse && selectedResponse.status !== "completed" && (
              <Button
                onClick={() => handleMarkAsCompleted(selectedResponse.id)}
                disabled={updateStatus.isPending}
                className="w-full sm:w-auto"
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
        <AlertDialogContent className="w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette réponse ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La réponse sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
