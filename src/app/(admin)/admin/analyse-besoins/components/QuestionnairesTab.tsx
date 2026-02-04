"use client";

import { useState } from "react";
import {
  useNeedsAnalysisTemplates,
  useNeedsAnalysisTemplateMutations,
  type NeedsAnalysisTemplate,
} from "@/hooks/admin/useNeedsAnalysisTemplates";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { Card, CardContent } from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Plus,
  MoreVertical,
  Edit,
  Copy,
  Eye,
  Trash2,
  Send,
  Power,
  PowerOff,
  FileText,
  GraduationCap,
  MessageSquare,
  Loader2,
  Lock,
  Globe,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface QuestionnairesTabProps {
  onCreateNew: () => void;
  onEdit: (template: NeedsAnalysisTemplate) => void;
  onPreview: (template: NeedsAnalysisTemplate) => void;
  onSendEmail: (template: NeedsAnalysisTemplate) => void;
}

export function QuestionnairesTab({
  onCreateNew,
  onEdit,
  onPreview,
  onSendEmail,
}: QuestionnairesTabProps) {
  const { data: templates = [], isLoading } = useNeedsAnalysisTemplates();
  const { deleteTemplate, duplicateTemplate, toggleActive } = useNeedsAnalysisTemplateMutations();

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const filteredTemplates = templates.filter((template) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(searchLower) ||
      template.description?.toLowerCase().includes(searchLower) ||
      template.formation_name?.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = async () => {
    if (!templateToDelete) return;
    try {
      await deleteTemplate.mutateAsync(templateToDelete);
      toast.success("Questionnaire supprimé");
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateTemplate.mutateAsync(id);
      toast.success("Questionnaire dupliqué");
    } catch {
      toast.error("Erreur lors de la duplication");
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleActive.mutateAsync({ id, active: !currentActive });
      toast.success(currentActive ? "Questionnaire désactivé" : "Questionnaire activé");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="border-0 bg-secondary/30">
          <CardContent className="p-0">
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un questionnaire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau
        </Button>
      </div>

      {/* Table */}
      {filteredTemplates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun questionnaire"
          description={
            searchQuery
              ? "Aucun questionnaire ne correspond à votre recherche"
              : "Créez votre premier questionnaire d'analyse des besoins"
          }
          action={
            !searchQuery ? (
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un questionnaire
              </Button>
            ) : undefined
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
                    <TableHead className={adminStyles.tableHead}>Titre</TableHead>
                    <TableHead className={adminStyles.tableHead}>Formation</TableHead>
                    <TableHead className={adminStyles.tableHead}>Questions</TableHead>
                    <TableHead className={adminStyles.tableHead}>Réponses</TableHead>
                    <TableHead className={adminStyles.tableHead}>Statut</TableHead>
                    <TableHead className={adminStyles.tableHead}>Date</TableHead>
                    <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow
                      key={template.id}
                      className={adminStyles.tableRowClickable}
                      onClick={() => onEdit(template)}
                    >
                      <TableCell className={adminStyles.tableCell}>
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium flex items-center gap-2">
                              {template.name}
                              {template.is_default && (
                                <Badge variant="secondary" className="text-xs">Défaut</Badge>
                              )}
                            </div>
                            {template.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {template.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        {template.formation_name ? (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{template.formation_name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Globe className="h-4 w-4" />
                            <span className="text-sm">Toutes</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        <Badge variant="outline" className="text-xs">
                          {template.questions_count || 0} questions
                        </Badge>
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span>{template.responses_count || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        <Badge
                          className={
                            template.active
                              ? "bg-green-500/15 text-green-600"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {template.active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        {template.created_at && (
                          <span className="text-sm text-muted-foreground">
                            {format(parseISO(template.created_at), "dd/MM/yyyy", { locale: fr })}
                          </span>
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
                              <DropdownMenuItem onClick={() => onSendEmail(template)}>
                                <Send className="h-4 w-4 mr-2" />
                                Envoyer par email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEdit(template)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onPreview(template)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Prévisualiser
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(template.id)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Dupliquer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleActive(template.id, template.active ?? false)}
                              >
                                {template.active ? (
                                  <>
                                    <PowerOff className="h-4 w-4 mr-2" />
                                    Désactiver
                                  </>
                                ) : (
                                  <>
                                    <Power className="h-4 w-4 mr-2" />
                                    Activer
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setTemplateToDelete(template.id);
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
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 cursor-pointer hover:bg-muted/50"
                  onClick={() => onEdit(template)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{template.name}</p>
                        {template.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {template.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {template.questions_count} questions
                          </Badge>
                          <Badge
                            className={`text-xs ${
                              template.active
                                ? "bg-green-500/15 text-green-600"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {template.active ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onSendEmail(template)}>
                            <Send className="h-4 w-4 mr-2" />
                            Envoyer par email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onPreview(template)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Prévisualiser
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(template.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(template.id, template.active ?? false)}
                          >
                            {template.active ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2" />
                                Activer
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setTemplateToDelete(template.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce questionnaire ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le questionnaire sera définitivement supprimé.
              Les réponses existantes seront conservées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteTemplate.isPending}
            >
              {deleteTemplate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
