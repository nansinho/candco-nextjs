"use client";

import { useState, useMemo } from "react";
import { useRedirects, useRedirectMutations, type CreateRedirectInput } from "@/hooks/admin/useRedirects";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
  ArrowRightLeft,
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowRight,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

const typeConfig: Record<number, { label: string; color: string }> = {
  301: { label: "301 Permanent", color: "bg-green-500/15 text-green-600" },
  302: { label: "302 Temporaire", color: "bg-blue-500/15 text-blue-600" },
  307: { label: "307 Temporaire", color: "bg-amber-500/15 text-amber-600" },
  308: { label: "308 Permanent", color: "bg-purple-500/15 text-purple-600" },
};

export default function RedirectsPage() {
  const { data: redirects = [], isLoading } = useRedirects();
  const { createRedirect, updateRedirect, deleteRedirect, toggleActive } = useRedirectMutations();

  const [searchQuery, setSearchQuery] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRedirect, setSelectedRedirect] = useState<typeof redirects[0] | null>(null);
  const [newRedirect, setNewRedirect] = useState<Partial<CreateRedirectInput>>({
    source_path: "",
    target_path: "",
    status_code: 301,
    notes: "",
  });

  const filteredRedirects = useMemo(() => {
    return redirects.filter((redirect) =>
      redirect.source_path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      redirect.target_path.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [redirects, searchQuery]);

  const stats = useMemo(() => ({
    total: redirects.length,
    active: redirects.filter((r) => r.is_active).length,
    totalHits: redirects.reduce((sum, r) => sum + r.hit_count, 0),
  }), [redirects]);

  const handleCreate = async () => {
    if (!newRedirect.source_path || !newRedirect.target_path) {
      toast.error("Les chemins source et destination sont obligatoires");
      return;
    }
    try {
      await createRedirect.mutateAsync(newRedirect as CreateRedirectInput);
      toast.success("Redirection créée");
      setNewRedirect({
        source_path: "",
        target_path: "",
        status_code: 301,
        notes: "",
      });
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  const handleEdit = (redirect: typeof redirects[0]) => {
    setSelectedRedirect(redirect);
    setNewRedirect({
      source_path: redirect.source_path,
      target_path: redirect.target_path,
      status_code: redirect.status_code,
      notes: redirect.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedRedirect) return;
    try {
      await updateRedirect.mutateAsync({
        id: selectedRedirect.id,
        data: {
          source_path: newRedirect.source_path,
          target_path: newRedirect.target_path,
          status_code: newRedirect.status_code,
          notes: newRedirect.notes || null,
        },
      });
      toast.success("Redirection mise à jour");
      setEditDialogOpen(false);
      setSelectedRedirect(null);
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async () => {
    if (!selectedRedirect) return;
    try {
      await deleteRedirect.mutateAsync(selectedRedirect.id);
      toast.success("Redirection supprimée");
      setDeleteDialogOpen(false);
      setSelectedRedirect(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleToggleActive = async (redirect: typeof redirects[0]) => {
    try {
      await toggleActive.mutateAsync({ id: redirect.id, is_active: !redirect.is_active });
      toast.success(redirect.is_active ? "Redirection désactivée" : "Redirection activée");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={ArrowRightLeft}
        title="Redirections"
        description="Gérez les redirections d'URL pour le SEO"
      />

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 bg-secondary/30">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total redirections</CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actives</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total hits</CardTitle>
              <ArrowRight className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalHits.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add New Redirect */}
      <Card className="border-0 bg-secondary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plus className="h-5 w-5" />
            Nouvelle redirection
          </CardTitle>
          <CardDescription>
            Créez une nouvelle règle de redirection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="URL source (ex: /ancien-chemin)"
                value={newRedirect.source_path}
                onChange={(e) => setNewRedirect({ ...newRedirect, source_path: e.target.value })}
              />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground self-center hidden sm:block" />
            <div className="flex-1">
              <Input
                placeholder="URL destination (ex: /nouveau-chemin)"
                value={newRedirect.target_path}
                onChange={(e) => setNewRedirect({ ...newRedirect, target_path: e.target.value })}
              />
            </div>
            <Select
              value={String(newRedirect.status_code)}
              onValueChange={(value) => setNewRedirect({ ...newRedirect, status_code: parseInt(value) })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="301">301 Permanent</SelectItem>
                <SelectItem value="302">302 Temporaire</SelectItem>
                <SelectItem value="307">307 Temporaire</SelectItem>
                <SelectItem value="308">308 Permanent</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleCreate} disabled={createRedirect.isPending}>
              {createRedirect.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="border-0 bg-secondary/30">
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Redirects Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredRedirects.length === 0 ? (
        <EmptyState
          icon={ArrowRightLeft}
          title="Aucune redirection"
          description={searchQuery ? "Aucune redirection ne correspond à votre recherche" : "Créez votre première redirection"}
        />
      ) : (
        <Card className="border-0 bg-secondary/30">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className={adminStyles.tableRowHeader}>
                    <TableHead className={adminStyles.tableHead}>Source</TableHead>
                    <TableHead className={adminStyles.tableHead}></TableHead>
                    <TableHead className={adminStyles.tableHead}>Destination</TableHead>
                    <TableHead className={adminStyles.tableHead}>Type</TableHead>
                    <TableHead className={adminStyles.tableHead}>Hits</TableHead>
                    <TableHead className={adminStyles.tableHead}>Statut</TableHead>
                    <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRedirects.map((redirect) => {
                    const typeInfo = typeConfig[redirect.status_code] || typeConfig[301];
                    return (
                      <TableRow key={redirect.id} className={adminStyles.tableRowClickable}>
                        <TableCell className={adminStyles.tableCell}>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {redirect.source_path}
                          </code>
                        </TableCell>
                        <TableCell className={adminStyles.tableCell}>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell className={adminStyles.tableCell}>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {redirect.target_path}
                          </code>
                        </TableCell>
                        <TableCell className={adminStyles.tableCell}>
                          <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                        </TableCell>
                        <TableCell className={adminStyles.tableCell}>
                          <Badge variant="outline">{redirect.hit_count}</Badge>
                        </TableCell>
                        <TableCell className={adminStyles.tableCell}>
                          {redirect.is_active ? (
                            <Badge className="bg-green-500/15 text-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Actif
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactif
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className={`${adminStyles.tableCell} text-right`}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(redirect)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleActive(redirect)}>
                                {redirect.is_active ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Désactiver
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Activer
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedRedirect(redirect);
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier la redirection</DialogTitle>
            <DialogDescription>
              Modifiez les paramètres de cette redirection
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-source">URL source</Label>
              <Input
                id="edit-source"
                placeholder="/ancien-chemin"
                value={newRedirect.source_path}
                onChange={(e) => setNewRedirect({ ...newRedirect, source_path: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-target">URL destination</Label>
              <Input
                id="edit-target"
                placeholder="/nouveau-chemin"
                value={newRedirect.target_path}
                onChange={(e) => setNewRedirect({ ...newRedirect, target_path: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type de redirection</Label>
              <Select
                value={String(newRedirect.status_code)}
                onValueChange={(value) => setNewRedirect({ ...newRedirect, status_code: parseInt(value) })}
              >
                <SelectTrigger id="edit-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="301">301 Permanent</SelectItem>
                  <SelectItem value="302">302 Temporaire</SelectItem>
                  <SelectItem value="307">307 Temporaire</SelectItem>
                  <SelectItem value="308">308 Permanent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes (optionnel)</Label>
              <Textarea
                id="edit-notes"
                placeholder="Notes sur cette redirection..."
                value={newRedirect.notes}
                onChange={(e) => setNewRedirect({ ...newRedirect, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={updateRedirect.isPending}>
              {updateRedirect.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette redirection ?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRedirect && (
                <>
                  La redirection de <code className="bg-muted px-1 rounded">{selectedRedirect.source_path}</code> vers{" "}
                  <code className="bg-muted px-1 rounded">{selectedRedirect.target_path}</code> sera supprimée.
                  Cette action est irréversible.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteRedirect.isPending}
            >
              {deleteRedirect.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
