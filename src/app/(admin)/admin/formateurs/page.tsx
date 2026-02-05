"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormateurs, useFormateurMutations, type Formateur } from "@/hooks/admin/useFormateurs";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  UserCog,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  GraduationCap,
  List,
  CalendarDays,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormateursPlanningTab } from "@/components/admin/formateurs/FormateursPlanningTab";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const isProfileComplete = (formateur: Formateur): boolean => {
  return !!(
    formateur.siret && formateur.siret.length === 14 &&
    formateur.telephone &&
    formateur.adresse &&
    formateur.code_postal &&
    formateur.ville &&
    formateur.specialites && formateur.specialites.length > 0
  );
};

const getProfileCompleteness = (formateur: Formateur): { complete: boolean; missing: string[] } => {
  const missing: string[] = [];
  if (!formateur.siret || formateur.siret.length !== 14) missing.push("SIRET");
  if (!formateur.telephone) missing.push("Téléphone");
  if (!formateur.adresse || !formateur.code_postal || !formateur.ville) missing.push("Adresse");
  if (!formateur.specialites || formateur.specialites.length === 0) missing.push("Spécialités");
  return { complete: missing.length === 0, missing };
};

export default function AdminFormateurs() {
  const router = useRouter();
  const { data: formateurs = [], isLoading } = useFormateurs();
  const { toggleActive, deleteFormateur } = useFormateurMutations();

  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [formateurToDelete, setFormateurToDelete] = useState<Formateur | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter formateurs
  const filteredFormateurs = useMemo(() => {
    return formateurs.filter((f) => {
      const matchesSearch =
        f.nom.toLowerCase().includes(search.toLowerCase()) ||
        f.prenom.toLowerCase().includes(search.toLowerCase()) ||
        f.email?.toLowerCase().includes(search.toLowerCase()) ||
        f.specialites?.some((s) => s.toLowerCase().includes(search.toLowerCase()));

      const matchesActive =
        filterActive === "all" ||
        (filterActive === "active" && f.active) ||
        (filterActive === "inactive" && !f.active);

      return matchesSearch && matchesActive;
    });
  }, [formateurs, search, filterActive]);

  // Stats
  const stats = useMemo(() => ({
    total: formateurs.length,
    actifs: formateurs.filter((f) => f.active).length,
    inactifs: formateurs.filter((f) => !f.active).length,
    profilsComplets: formateurs.filter((f) => isProfileComplete(f)).length,
  }), [formateurs]);

  const handleToggleActive = async (formateur: Formateur) => {
    await toggleActive.mutateAsync({ id: formateur.id, active: !formateur.active });
  };

  const handleDelete = async () => {
    if (!formateurToDelete) return;

    setDeleting(true);
    try {
      await deleteFormateur.mutateAsync(formateurToDelete.id);
      setFormateurToDelete(null);
    } catch (error) {
      console.error("Error deleting formateur:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        icon={UserCog}
        title="Formateurs"
        description="Gérez les formateurs et leurs profils"
      >
        <Button size="sm" asChild>
          <Link href="/admin/users">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Inviter via Utilisateurs</span>
            <span className="sm:hidden">Inviter</span>
          </Link>
        </Button>
      </AdminPageHeader>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 bg-secondary/30">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Actifs</p>
              <p className="text-2xl font-semibold text-green-600">{stats.actifs}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Inactifs</p>
              <p className="text-2xl font-semibold text-muted-foreground">{stats.inactifs}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Profils complets</p>
              <p className={`text-2xl font-semibold ${stats.profilsComplets === stats.total ? "text-green-600" : "text-amber-600"}`}>
                {stats.profilsComplets}/{stats.total}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs: Liste / Planning */}
      <Tabs defaultValue="liste" className="space-y-4">
        <TabsList>
          <TabsTrigger value="liste">
            <List className="h-4 w-4 mr-2" />
            Liste
          </TabsTrigger>
          <TabsTrigger value="planning">
            <CalendarDays className="h-4 w-4 mr-2" />
            Planning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="liste" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un formateur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterActive} onValueChange={setFilterActive}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="inactive">Inactifs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredFormateurs.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="Aucun formateur"
          description={search ? "Aucun formateur ne correspond à votre recherche" : "Invitez des formateurs via la page Utilisateurs"}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className={adminStyles.tableRowHeader}>
                  <TableHead className={adminStyles.tableHead}>Formateur</TableHead>
                  <TableHead className={adminStyles.tableHead}>Contact</TableHead>
                  <TableHead className={adminStyles.tableHead}>Spécialités</TableHead>
                  <TableHead className={adminStyles.tableHead}>Tarif</TableHead>
                  <TableHead className={adminStyles.tableHead}>Statut</TableHead>
                  <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFormateurs.map((formateur) => (
                  <TableRow
                    key={formateur.id}
                    className={adminStyles.tableRowClickable}
                    onClick={() => router.push(`/admin/formateurs/${formateur.id}`)}
                  >
                    <TableCell className={adminStyles.tableCell}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-medium text-primary">
                            {formateur.prenom[0]}{formateur.nom[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{formateur.prenom} {formateur.nom}</p>
                            {!isProfileComplete(formateur) && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 gap-1 text-xs">
                                      <AlertCircle className="h-3 w-3" />
                                      Incomplet
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="font-medium mb-1">Champs manquants :</p>
                                    <ul className="list-disc pl-4 text-xs">
                                      {getProfileCompleteness(formateur).missing.map(m => (
                                        <li key={m}>{m}</li>
                                      ))}
                                    </ul>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          {formateur.ville && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {formateur.ville}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      <div className="space-y-1">
                        {formateur.email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">{formateur.email}</span>
                          </div>
                        )}
                        {formateur.telephone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {formateur.telephone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      <div className="flex flex-wrap gap-1">
                        {formateur.specialites?.slice(0, 2).map((spec, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {formateur.specialites && formateur.specialites.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{formateur.specialites.length - 2}
                          </Badge>
                        )}
                        {(!formateur.specialites || formateur.specialites.length === 0) && (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      {formateur.tarif_journalier ? (
                        <span>{formateur.tarif_journalier}€/j</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      <Badge
                        variant="outline"
                        className={formateur.active
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : "bg-muted text-muted-foreground border-border/30"
                        }
                      >
                        {formateur.active ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Actif</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" /> Inactif</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className={`${adminStyles.tableCell} text-right`}>
                      <div
                        className="flex items-center justify-end gap-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className={adminStyles.tableActionButton}
                          onClick={() => router.push(`/admin/formateurs/${formateur.id}`)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`${adminStyles.tableActionButton} text-destructive`}
                          onClick={() => setFormateurToDelete(formateur)}
                          disabled={(formateur.sessions_count ?? 0) > 0}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredFormateurs.map((formateur) => (
              <Card
                key={formateur.id}
                className="border-0 bg-secondary/30 cursor-pointer"
                onClick={() => router.push(`/admin/formateurs/${formateur.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-primary">
                          {formateur.prenom[0]}{formateur.nom[0]}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{formateur.prenom} {formateur.nom}</p>
                        {formateur.email && (
                          <p className="text-xs text-muted-foreground truncate">{formateur.email}</p>
                        )}
                        {formateur.ville && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {formateur.ville}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={formateur.active
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-muted text-muted-foreground border-border/30"
                      }
                    >
                      {formateur.active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  {formateur.specialites && formateur.specialites.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {formateur.specialites.slice(0, 3).map((spec, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
        </TabsContent>

        <TabsContent value="planning">
          <FormateursPlanningTab />
        </TabsContent>
      </Tabs>

      {/* Delete Dialog */}
      <AlertDialog open={!!formateurToDelete} onOpenChange={() => setFormateurToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce formateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              {formateurToDelete && (
                <>
                  Vous êtes sur le point de supprimer{" "}
                  <strong>{formateurToDelete.prenom} {formateurToDelete.nom}</strong>.
                  {formateurToDelete.sessions_count && formateurToDelete.sessions_count > 0 && (
                    <span className="block mt-2 text-destructive">
                      Ce formateur est assigné à {formateurToDelete.sessions_count} session(s).
                      Veuillez d&apos;abord réassigner ces sessions.
                    </span>
                  )}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting || (formateurToDelete?.sessions_count ?? 0) > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
