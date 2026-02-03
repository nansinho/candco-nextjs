"use client";

import { useState, useMemo } from "react";
import { useSatisfactionSurveys, useSatisfactionMutations, type SatisfactionSurvey } from "@/hooks/admin/useSatisfaction";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Star,
  Search,
  Download,
  TrendingUp,
  Users,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  Quote,
} from "lucide-react";
import { toast } from "sonner";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : star - 0.5 <= rating
              ? "fill-amber-400/50 text-amber-400"
              : "text-muted-foreground"
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function SatisfactionPage() {
  const { data: surveys = [], isLoading } = useSatisfactionSurveys();
  const { approveTestimonial, deleteSurvey } = useSatisfactionMutations();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<SatisfactionSurvey | null>(null);

  const filteredSurveys = useMemo(() => {
    return surveys.filter((survey) =>
      (survey.formation_title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );
  }, [surveys, searchQuery]);

  const stats = useMemo(() => {
    if (surveys.length === 0) {
      return { total: 0, avgRating: 0, recommendRate: 0, pendingTestimonials: 0 };
    }
    const total = surveys.length;
    const avgRating = surveys.reduce((sum, s) => sum + (s.note_globale || 0), 0) / total;
    const recommendRate = Math.round(
      (surveys.filter((s) => s.recommandation).length / total) * 100
    );
    const pendingTestimonials = surveys.filter(
      (s) => s.temoignage && s.temoignage_approuve === null
    ).length;
    return { total, avgRating, recommendRate, pendingTestimonials };
  }, [surveys]);

  const handleView = (survey: SatisfactionSurvey) => {
    setSelectedSurvey(survey);
    setViewDialogOpen(true);
  };

  const handleApproveTestimonial = async (survey: SatisfactionSurvey, approved: boolean) => {
    try {
      await approveTestimonial.mutateAsync({ id: survey.id, approved });
      toast.success(approved ? "Témoignage approuvé" : "Témoignage refusé");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async () => {
    if (!selectedSurvey) return;
    try {
      await deleteSurvey.mutateAsync(selectedSurvey.id);
      toast.success("Enquête supprimée");
      setDeleteDialogOpen(false);
      setSelectedSurvey(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleExport = () => {
    const headers = [
      "Formation",
      "Session",
      "Note globale",
      "Note contenu",
      "Note formateur",
      "Note organisation",
      "Recommande",
      "Points forts",
      "Points à améliorer",
      "Témoignage",
      "Date",
    ];
    const rows = surveys.map((s) => [
      s.formation_title || "",
      s.session_date ? new Date(s.session_date).toLocaleDateString("fr-FR") : "",
      s.note_globale?.toString() || "",
      s.note_contenu.toString(),
      s.note_formateur.toString(),
      s.note_organisation.toString(),
      s.recommandation ? "Oui" : "Non",
      s.points_forts || "",
      s.points_amelioration || "",
      s.temoignage || "",
      s.created_at ? new Date(s.created_at).toLocaleDateString("fr-FR") : "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `satisfaction_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Export téléchargé");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Star}
        title="Satisfaction"
        description="Suivez la satisfaction des stagiaires et les retours de formation"
      >
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exporter le rapport
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
              <CardTitle className="text-sm font-medium">Total réponses</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
              <Star className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}/5</div>
              <Progress value={stats.avgRating * 20} className="h-2 mt-2" />
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recommandation</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.recommendRate}%</div>
              <p className="text-xs text-muted-foreground">recommanderaient</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Témoignages en attente</CardTitle>
              <Quote className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.pendingTestimonials}</div>
              <p className="text-xs text-muted-foreground">à valider</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card className="border-0 bg-secondary/30">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une formation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredSurveys.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Aucune enquête"
          description={searchQuery ? "Aucune enquête ne correspond à votre recherche" : "Aucune enquête de satisfaction pour le moment"}
        />
      ) : (
        <Card className="border-0 bg-secondary/30">
          <CardHeader>
            <CardTitle>Enquêtes de satisfaction</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className={adminStyles.tableRowHeader}>
                  <TableHead className={adminStyles.tableHead}>Formation</TableHead>
                  <TableHead className={adminStyles.tableHead}>Session</TableHead>
                  <TableHead className={adminStyles.tableHead}>Note globale</TableHead>
                  <TableHead className={adminStyles.tableHead}>Recommande</TableHead>
                  <TableHead className={adminStyles.tableHead}>Témoignage</TableHead>
                  <TableHead className={adminStyles.tableHead}>Date</TableHead>
                  <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSurveys.map((survey) => (
                  <TableRow key={survey.id} className={adminStyles.tableRowClickable}>
                    <TableCell className={adminStyles.tableCell}>
                      <div className="font-medium">{survey.formation_title || "Formation non définie"}</div>
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      {survey.session_date
                        ? new Date(survey.session_date).toLocaleDateString("fr-FR")
                        : "-"}
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      <StarRating rating={survey.note_globale || 0} />
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      {survey.recommandation ? (
                        <Badge className="bg-green-500/15 text-green-600">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Oui
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/15 text-amber-600">
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          Non
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      {survey.temoignage ? (
                        survey.temoignage_approuve === true ? (
                          <Badge className="bg-green-500/15 text-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Approuvé
                          </Badge>
                        ) : survey.temoignage_approuve === false ? (
                          <Badge className="bg-destructive/15 text-destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Refusé
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/15 text-amber-600">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            En attente
                          </Badge>
                        )
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      {survey.created_at
                        ? new Date(survey.created_at).toLocaleDateString("fr-FR")
                        : "-"}
                    </TableCell>
                    <TableCell className={`${adminStyles.tableCell} text-right`}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(survey)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir les détails
                          </DropdownMenuItem>
                          {survey.temoignage && survey.temoignage_approuve === null && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleApproveTestimonial(survey, true)}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Approuver témoignage
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleApproveTestimonial(survey, false)}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Refuser témoignage
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedSurvey(survey);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de l'enquête</DialogTitle>
            <DialogDescription>
              {selectedSurvey?.formation_title}
            </DialogDescription>
          </DialogHeader>
          {selectedSurvey && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Note globale</Label>
                  <div className="mt-1">
                    <StarRating rating={selectedSurvey.note_globale || 0} />
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Recommande</Label>
                  <div className="mt-1">
                    {selectedSurvey.recommandation ? (
                      <Badge className="bg-green-500/15 text-green-600">Oui</Badge>
                    ) : (
                      <Badge className="bg-amber-500/15 text-amber-600">Non</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Notes détaillées</Label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between p-2 bg-muted/50 rounded">
                    <span>Contenu</span>
                    <span className="font-medium">{selectedSurvey.note_contenu}/5</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/50 rounded">
                    <span>Formateur</span>
                    <span className="font-medium">{selectedSurvey.note_formateur}/5</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/50 rounded">
                    <span>Organisation</span>
                    <span className="font-medium">{selectedSurvey.note_organisation}/5</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/50 rounded">
                    <span>Supports</span>
                    <span className="font-medium">{selectedSurvey.note_supports}/5</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/50 rounded">
                    <span>Objectifs</span>
                    <span className="font-medium">{selectedSurvey.note_objectifs}/5</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/50 rounded">
                    <span>Applicabilité</span>
                    <span className="font-medium">{selectedSurvey.note_applicabilite}/5</span>
                  </div>
                </div>
              </div>

              {selectedSurvey.points_forts && (
                <div>
                  <Label className="text-muted-foreground">Points forts</Label>
                  <p className="mt-1 text-sm bg-green-500/10 p-3 rounded">{selectedSurvey.points_forts}</p>
                </div>
              )}

              {selectedSurvey.points_amelioration && (
                <div>
                  <Label className="text-muted-foreground">Points à améliorer</Label>
                  <p className="mt-1 text-sm bg-amber-500/10 p-3 rounded">{selectedSurvey.points_amelioration}</p>
                </div>
              )}

              {selectedSurvey.temoignage && (
                <div>
                  <Label className="text-muted-foreground">Témoignage</Label>
                  <div className="mt-1 text-sm bg-blue-500/10 p-3 rounded italic">
                    &ldquo;{selectedSurvey.temoignage}&rdquo;
                  </div>
                  <div className="mt-2">
                    {selectedSurvey.temoignage_approuve === true ? (
                      <Badge className="bg-green-500/15 text-green-600">Approuvé</Badge>
                    ) : selectedSurvey.temoignage_approuve === false ? (
                      <Badge className="bg-destructive/15 text-destructive">Refusé</Badge>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproveTestimonial(selectedSurvey, true)}
                          disabled={approveTestimonial.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApproveTestimonial(selectedSurvey, false)}
                          disabled={approveTestimonial.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Refuser
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-muted-foreground">Date</Label>
                <p className="mt-1">
                  {selectedSurvey.created_at
                    ? new Date(selectedSurvey.created_at).toLocaleString("fr-FR")
                    : "-"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette enquête ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette enquête de satisfaction sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteSurvey.isPending}
            >
              {deleteSurvey.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
