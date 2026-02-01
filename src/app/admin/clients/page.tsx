"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useClients, useClientMutations, type Client } from "@/hooks/admin/useClients";
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
  Building2,
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
  Calendar,
  Globe,
} from "lucide-react";

export default function AdminClients() {
  const router = useRouter();
  const { data: clients = [], isLoading } = useClients();
  const { deleteClient, toggleActive } = useClientMutations();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        c.nom.toLowerCase().includes(search.toLowerCase()) ||
        c.siret?.includes(search) ||
        c.ville?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && c.active) ||
        (filterStatus === "inactive" && !c.active);

      return matchesSearch && matchesStatus;
    });
  }, [clients, search, filterStatus]);

  // Stats
  const stats = useMemo(() => ({
    total: clients.length,
    actifs: clients.filter((c) => c.active).length,
    inactifs: clients.filter((c) => !c.active).length,
    avecSessions: clients.filter((c) => (c.sessions_count ?? 0) > 0).length,
  }), [clients]);

  const handleDelete = async () => {
    if (!clientToDelete) return;

    setDeleting(true);
    try {
      await deleteClient.mutateAsync(clientToDelete.id);
      setClientToDelete(null);
    } catch (error) {
      console.error("Error deleting client:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        icon={Building2}
        title="Clients"
        description="Gérez les entreprises clientes et leurs inscriptions"
      >
        <Button size="sm" onClick={() => router.push("/admin/clients/new")}>
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Nouveau client</span>
          <span className="sm:hidden">Ajouter</span>
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
              <p className="text-xs text-muted-foreground">Avec inscriptions</p>
              <p className="text-2xl font-semibold text-blue-600">{stats.avecSessions}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
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
      ) : filteredClients.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucun client"
          description={search ? "Aucun client ne correspond à votre recherche" : "Créez votre premier client"}
          action={
            !search && (
              <Button onClick={() => router.push("/admin/clients/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Nouveau client
              </Button>
            )
          }
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className={adminStyles.tableRowHeader}>
                  <TableHead className={adminStyles.tableHead}>#</TableHead>
                  <TableHead className={adminStyles.tableHead}>Entreprise</TableHead>
                  <TableHead className={adminStyles.tableHead}>SIRET</TableHead>
                  <TableHead className={adminStyles.tableHead}>Contact</TableHead>
                  <TableHead className={adminStyles.tableHead}>Sessions</TableHead>
                  <TableHead className={adminStyles.tableHead}>Statut</TableHead>
                  <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client, index) => (
                  <TableRow
                    key={client.id}
                    className={adminStyles.tableRowClickable}
                    onClick={() => router.push(`/admin/clients/${client.id}`)}
                  >
                    <TableCell className={`${adminStyles.tableCell} text-muted-foreground`}>
                      {index + 1}
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[200px]">{client.nom}</p>
                          {client.ville && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {client.ville}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      {client.siret ? (
                        <code className="text-xs bg-muted px-2 py-1 rounded">{client.siret}</code>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      <div className="space-y-1">
                        {client.contact_nom || client.contact_prenom ? (
                          <p className="text-sm font-medium">
                            {client.contact_prenom} {client.contact_nom}
                          </p>
                        ) : null}
                        {client.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">{client.email}</span>
                          </div>
                        )}
                        {client.telephone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {client.telephone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      {(client.sessions_count ?? 0) > 0 ? (
                        <Badge variant="secondary" className="gap-1">
                          <Calendar className="h-3 w-3" />
                          {client.sessions_count}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      <Badge
                        variant="outline"
                        className={client.active
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : "bg-muted text-muted-foreground border-border/30"
                        }
                      >
                        {client.active ? (
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
                          onClick={() => router.push(`/admin/clients/${client.id}`)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`${adminStyles.tableActionButton} text-destructive`}
                          onClick={() => setClientToDelete(client)}
                          disabled={(client.sessions_count ?? 0) > 0}
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
            {filteredClients.map((client) => (
              <Card
                key={client.id}
                className="border-0 bg-secondary/30 cursor-pointer"
                onClick={() => router.push(`/admin/clients/${client.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{client.nom}</p>
                        {client.ville && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {client.ville}
                          </p>
                        )}
                        {client.siret && (
                          <code className="text-xs text-muted-foreground">{client.siret}</code>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant="outline"
                        className={client.active
                          ? "bg-green-500/10 text-green-600 border-green-500/20"
                          : "bg-muted text-muted-foreground border-border/30"
                        }
                      >
                        {client.active ? "Actif" : "Inactif"}
                      </Badge>
                      {(client.sessions_count ?? 0) > 0 && (
                        <Badge variant="secondary" className="gap-1">
                          <Calendar className="h-3 w-3" />
                          {client.sessions_count} sessions
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription>
              {clientToDelete && (
                <>
                  Vous êtes sur le point de supprimer{" "}
                  <strong>{clientToDelete.nom}</strong>.
                  {(clientToDelete.sessions_count ?? 0) > 0 && (
                    <span className="block mt-2 text-destructive">
                      Ce client a {clientToDelete.sessions_count} inscription(s).
                      Veuillez d&apos;abord supprimer ces inscriptions.
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
              disabled={deleting || (clientToDelete?.sessions_count ?? 0) > 0}
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
