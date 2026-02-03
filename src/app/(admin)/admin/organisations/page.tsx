"use client";

import { useState, useMemo } from "react";
import { useOrganizations, useOrganizationMutations, type CreateOrganizationInput } from "@/hooks/admin/useOrganizations";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  Building2,
  Search,
  Plus,
  Mail,
  Users,
  CheckCircle2,
  XCircle,
  Globe,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

export default function OrganisationsPage() {
  const { data: organizations = [], isLoading } = useOrganizations();
  const { createOrganization, updateOrganization, deleteOrganization, toggleActive } = useOrganizationMutations();

  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<typeof organizations[0] | null>(null);
  const [formData, setFormData] = useState<Partial<CreateOrganizationInput>>({
    name: "",
    slug: "",
    description: "",
    contact_email: "",
    website: "",
    active: true,
  });

  const filteredOrgs = useMemo(() => {
    return organizations.filter((org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.contact_email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [organizations, searchQuery]);

  const stats = useMemo(() => ({
    total: organizations.length,
    active: organizations.filter((o) => o.active).length,
    inactive: organizations.filter((o) => !o.active).length,
    totalUsers: organizations.reduce((sum, o) => sum + (o.users_count || 0), 0),
  }), [organizations]);

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      contact_email: "",
      website: "",
      active: true,
    });
  };

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error("Le nom est obligatoire");
      return;
    }
    try {
      await createOrganization.mutateAsync(formData as CreateOrganizationInput);
      toast.success("Organisation créée");
      setCreateDialogOpen(false);
      resetForm();
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  const handleEdit = (org: typeof organizations[0]) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      slug: org.slug,
      description: org.description || "",
      contact_email: org.contact_email || "",
      website: org.website || "",
      active: org.active ?? true,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedOrg) return;
    try {
      await updateOrganization.mutateAsync({
        id: selectedOrg.id,
        data: formData,
      });
      toast.success("Organisation mise à jour");
      setEditDialogOpen(false);
      setSelectedOrg(null);
      resetForm();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async () => {
    if (!selectedOrg) return;
    try {
      await deleteOrganization.mutateAsync(selectedOrg.id);
      toast.success("Organisation supprimée");
      setDeleteDialogOpen(false);
      setSelectedOrg(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleToggleActive = async (org: typeof organizations[0]) => {
    try {
      await toggleActive.mutateAsync({ id: org.id, active: !org.active });
      toast.success(org.active ? "Organisation désactivée" : "Organisation activée");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const renderForm = () => (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom *</Label>
        <Input
          id="name"
          placeholder="Nom de l'organisation"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          placeholder="nom-organisation (généré automatiquement)"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Description de l'organisation"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact_email">Email de contact</Label>
          <Input
            id="contact_email"
            type="email"
            placeholder="contact@organisation.com"
            value={formData.contact_email}
            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Site web</Label>
          <Input
            id="website"
            type="url"
            placeholder="https://organisation.com"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="active"
          checked={formData.active}
          onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
        />
        <Label htmlFor="active">Organisation active</Label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Building2}
        title="Organismes"
        description="Gérez les organismes partenaires et clients"
      >
        <Button onClick={() => setCreateDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel organisme
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
              <CardTitle className="text-sm font-medium">Total organismes</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actifs</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
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
              placeholder="Rechercher un organisme..."
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
      ) : filteredOrgs.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucun organisme"
          description={searchQuery ? "Aucun organisme ne correspond à votre recherche" : "Créez votre premier organisme"}
        />
      ) : (
        <Card className="border-0 bg-secondary/30">
          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className={adminStyles.tableRowHeader}>
                    <TableHead className={adminStyles.tableHead}>Organisme</TableHead>
                    <TableHead className={adminStyles.tableHead}>Contact</TableHead>
                    <TableHead className={adminStyles.tableHead}>Utilisateurs</TableHead>
                    <TableHead className={adminStyles.tableHead}>Statut</TableHead>
                    <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrgs.map((org) => (
                    <TableRow key={org.id} className={adminStyles.tableRowClickable}>
                      <TableCell className={adminStyles.tableCell}>
                        <div className="font-medium">{org.name}</div>
                        {org.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {org.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        {org.contact_email ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {org.contact_email}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                        {org.website && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <a
                              href={org.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {org.website.replace(/^https?:\/\//, "")}
                            </a>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {org.users_count || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        {org.active ? (
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
                            <DropdownMenuItem onClick={() => handleEdit(org)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(org)}>
                              {org.active ? (
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
                            {org.website && (
                              <DropdownMenuItem asChild>
                                <a href={org.website} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Visiter le site
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedOrg(org);
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
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y">
              {filteredOrgs.map((org) => (
                <div key={org.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">{org.name}</p>
                      {org.contact_email && (
                        <p className="text-sm text-muted-foreground">{org.contact_email}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {org.users_count || 0}
                        </Badge>
                        {org.active ? (
                          <Badge className="bg-green-500/15 text-green-600 text-xs">Actif</Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground text-xs">Inactif</Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(org)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(org)}>
                          {org.active ? "Désactiver" : "Activer"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setSelectedOrg(org);
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
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvel organisme</DialogTitle>
            <DialogDescription>
              Créez un nouvel organisme partenaire ou client
            </DialogDescription>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={createOrganization.isPending}>
              {createOrganization.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier l'organisme</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'organisme
            </DialogDescription>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={updateOrganization.isPending}>
              {updateOrganization.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet organisme ?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedOrg && (
                <>
                  Vous êtes sur le point de supprimer <strong>{selectedOrg.name}</strong>.
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
              disabled={deleteOrganization.isPending}
            >
              {deleteOrganization.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
