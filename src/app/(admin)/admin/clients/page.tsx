"use client";

/**
 * @file page.tsx
 * @description Liste des clients avec affichage hiérarchique siège → agences
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useClients,
  useClientMutations,
  groupClientsHierarchically,
  countBillableClients,
  countAgencies,
  FRENCH_REGIONS,
  type Client,
  type ClientType,
  type ClientWithChildren,
} from "@/hooks/admin/useClients";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  ChevronDown,
  ChevronRight,
  Building,
  GitBranch,
  Users,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Badge de type de client
function ClientTypeBadge({ type }: { type: ClientType }) {
  const config: Record<ClientType, { label: string; className: string; icon: React.ReactNode }> = {
    siege: {
      label: "Siège",
      className: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20",
      icon: <Building2 className="h-3 w-3 mr-1" />,
    },
    agence: {
      label: "Agence",
      className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
      icon: <Building className="h-3 w-3 mr-1" />,
    },
    filiale: {
      label: "Filiale",
      className: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
      icon: <GitBranch className="h-3 w-3 mr-1" />,
    },
    franchise: {
      label: "Franchise",
      className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20",
      icon: <Network className="h-3 w-3 mr-1" />,
    },
    standalone: {
      label: "Indépendant",
      className: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/20",
      icon: <Building2 className="h-3 w-3 mr-1" />,
    },
  };

  const { label, className, icon } = config[type] || config.standalone;

  return (
    <Badge variant="outline" className={cn("text-xs font-normal", className)}>
      {icon}
      {label}
    </Badge>
  );
}

// Ligne client dans le tableau
function ClientRow({
  client,
  index,
  isChild = false,
  onEdit,
  onDelete,
}: {
  client: Client;
  index: number;
  isChild?: boolean;
  onEdit: (id: string) => void;
  onDelete: (client: Client) => void;
}) {
  return (
    <TableRow
      className={cn(
        adminStyles.tableRowClickable,
        isChild && "bg-muted/20"
      )}
      onClick={() => onEdit(client.id)}
    >
      <TableCell className={`${adminStyles.tableCell} text-muted-foreground w-12`}>
        {isChild ? "↳" : index}
      </TableCell>
      <TableCell className={adminStyles.tableCell}>
        <div className={cn("flex items-center gap-3", isChild && "pl-4")}>
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
              client.client_type === "siege"
                ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                : client.client_type === "agence"
                ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                : "bg-primary/10 text-primary"
            )}
          >
            {client.client_type === "siege" ? (
              <Building2 className="h-5 w-5" />
            ) : client.client_type === "agence" ? (
              <Building className="h-5 w-5" />
            ) : (
              <Building2 className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate max-w-[200px]">{client.nom}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {client.ville && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {client.ville}
                </span>
              )}
              {isChild && client.region && (
                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                  {FRENCH_REGIONS[client.region] || client.region}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className={adminStyles.tableCell}>
        <ClientTypeBadge type={client.client_type} />
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
          className={
            client.active
              ? "bg-green-500/10 text-green-600 border-green-500/20"
              : "bg-muted text-muted-foreground border-border/30"
          }
        >
          {client.active ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" /> Actif
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" /> Inactif
            </>
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
            onClick={() => onEdit(client.id)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`${adminStyles.tableActionButton} text-destructive`}
            onClick={() => onDelete(client)}
            disabled={(client.sessions_count ?? 0) > 0}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// Groupe siège + agences
function SiegeWithAgencies({
  siege,
  index,
  onEdit,
  onDelete,
}: {
  siege: ClientWithChildren;
  index: number;
  onEdit: (id: string) => void;
  onDelete: (client: Client) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = siege.children.length > 0;

  if (!hasChildren) {
    return (
      <ClientRow
        client={siege}
        index={index}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <TableRow
        className={cn(
          adminStyles.tableRowClickable,
          isOpen && "bg-purple-500/5 border-l-2 border-l-purple-500"
        )}
      >
        <TableCell className={`${adminStyles.tableCell} text-muted-foreground w-12`}>
          <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </TableCell>
        <TableCell
          className={adminStyles.tableCell}
          onClick={() => onEdit(siege.id)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate max-w-[200px]">{siege.nom}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {siege.ville && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {siege.ville}
                  </span>
                )}
                <Badge variant="secondary" className="text-xs h-5 px-1.5 gap-1">
                  <Users className="h-3 w-3" />
                  {siege.children.length} agence{siege.children.length > 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className={adminStyles.tableCell}>
          <ClientTypeBadge type="siege" />
        </TableCell>
        <TableCell className={adminStyles.tableCell}>
          {siege.siret ? (
            <code className="text-xs bg-muted px-2 py-1 rounded">{siege.siret}</code>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </TableCell>
        <TableCell className={adminStyles.tableCell}>
          <div className="space-y-1">
            {siege.contact_nom || siege.contact_prenom ? (
              <p className="text-sm font-medium">
                {siege.contact_prenom} {siege.contact_nom}
              </p>
            ) : null}
            {siege.email && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{siege.email}</span>
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className={adminStyles.tableCell}>
          {(siege.sessions_count ?? 0) > 0 ? (
            <Badge variant="secondary" className="gap-1">
              <Calendar className="h-3 w-3" />
              {siege.sessions_count}
            </Badge>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </TableCell>
        <TableCell className={adminStyles.tableCell}>
          <Badge
            variant="outline"
            className={
              siege.active
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : "bg-muted text-muted-foreground border-border/30"
            }
          >
            {siege.active ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" /> Actif
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" /> Inactif
              </>
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
              onClick={() => onEdit(siege.id)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`${adminStyles.tableActionButton} text-destructive`}
              onClick={() => onDelete(siege)}
              disabled={(siege.sessions_count ?? 0) > 0 || siege.children.length > 0}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      <CollapsibleContent asChild>
        <>
          {siege.children.map((agency, i) => (
            <TableRow
              key={agency.id}
              className={cn(
                adminStyles.tableRowClickable,
                "bg-blue-500/5 border-l-2 border-l-blue-500/50"
              )}
              onClick={() => onEdit(agency.id)}
            >
              <TableCell className={`${adminStyles.tableCell} text-muted-foreground w-12 pl-8`}>
                ↳
              </TableCell>
              <TableCell className={adminStyles.tableCell}>
                <div className="flex items-center gap-3 pl-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Building className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate max-w-[180px] text-sm">{agency.nom}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {agency.ville && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {agency.ville}
                        </span>
                      )}
                      {agency.region && (
                        <Badge variant="outline" className="text-xs h-4 px-1 font-normal">
                          {FRENCH_REGIONS[agency.region] || agency.region}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className={adminStyles.tableCell}>
                <ClientTypeBadge type="agence" />
              </TableCell>
              <TableCell className={adminStyles.tableCell}>
                {agency.siret ? (
                  <code className="text-xs bg-muted px-2 py-1 rounded">{agency.siret}</code>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className={adminStyles.tableCell}>
                {agency.email && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate max-w-[100px]">{agency.email}</span>
                  </div>
                )}
              </TableCell>
              <TableCell className={adminStyles.tableCell}>
                {(agency.sessions_count ?? 0) > 0 ? (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {agency.sessions_count}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
              <TableCell className={adminStyles.tableCell}>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    agency.active
                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                      : "bg-muted text-muted-foreground border-border/30"
                  )}
                >
                  {agency.active ? "Actif" : "Inactif"}
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
                    onClick={() => onEdit(agency.id)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${adminStyles.tableActionButton} text-destructive`}
                    onClick={() => onDelete(agency)}
                    disabled={(agency.sessions_count ?? 0) > 0}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Carte client mobile
function MobileClientCard({
  client,
  isChild = false,
  children: childrenCount = 0,
  onClick,
}: {
  client: Client;
  isChild?: boolean;
  children?: number;
  onClick: () => void;
}) {
  return (
    <Card
      className={cn(
        "border-0 cursor-pointer transition-colors",
        isChild
          ? "bg-blue-500/5 border-l-2 border-l-blue-500/50 ml-4"
          : client.client_type === "siege"
          ? "bg-purple-500/5 border-l-2 border-l-purple-500"
          : "bg-secondary/30"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "rounded-lg flex items-center justify-center shrink-0",
                isChild ? "w-8 h-8" : "w-10 h-10",
                client.client_type === "siege"
                  ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                  : client.client_type === "agence"
                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                  : "bg-primary/10 text-primary"
              )}
            >
              {client.client_type === "siege" ? (
                <Building2 className={isChild ? "h-4 w-4" : "h-5 w-5"} />
              ) : client.client_type === "agence" ? (
                <Building className={isChild ? "h-4 w-4" : "h-5 w-5"} />
              ) : (
                <Building2 className={isChild ? "h-4 w-4" : "h-5 w-5"} />
              )}
            </div>
            <div className="min-w-0">
              <p className={cn("font-medium truncate", isChild ? "text-sm" : "")}>
                {client.nom}
              </p>
              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                {client.ville && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {client.ville}
                  </span>
                )}
                {childrenCount > 0 && (
                  <Badge variant="secondary" className="text-xs h-5 px-1.5 gap-1">
                    <Users className="h-3 w-3" />
                    {childrenCount}
                  </Badge>
                )}
              </div>
              {client.siret && (
                <code className="text-xs text-muted-foreground">{client.siret}</code>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ClientTypeBadge type={client.client_type} />
            <Badge
              variant="outline"
              className={
                client.active
                  ? "bg-green-500/10 text-green-600 border-green-500/20"
                  : "bg-muted text-muted-foreground border-border/30"
              }
            >
              {client.active ? "Actif" : "Inactif"}
            </Badge>
            {(client.sessions_count ?? 0) > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Calendar className="h-3 w-3" />
                {client.sessions_count}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminClients() {
  const router = useRouter();
  const { data: clients = [], isLoading } = useClients();
  const { deleteClient } = useClientMutations();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Group clients hierarchically
  const hierarchicalClients = useMemo(() => {
    return groupClientsHierarchically(clients);
  }, [clients]);

  // Filter clients
  const filteredHierarchy = useMemo(() => {
    return hierarchicalClients.filter((c) => {
      // Search in parent or children
      const matchesSearchParent =
        c.nom.toLowerCase().includes(search.toLowerCase()) ||
        c.siret?.includes(search) ||
        c.ville?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase());

      const matchesSearchChildren = c.children.some(
        (child) =>
          child.nom.toLowerCase().includes(search.toLowerCase()) ||
          child.siret?.includes(search) ||
          child.ville?.toLowerCase().includes(search.toLowerCase())
      );

      const matchesSearch = matchesSearchParent || matchesSearchChildren;

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && c.active) ||
        (filterStatus === "inactive" && !c.active);

      const matchesType =
        filterType === "all" ||
        c.client_type === filterType ||
        (filterType === "siege" && c.children.length > 0);

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [hierarchicalClients, search, filterStatus, filterType]);

  // Stats
  const stats = useMemo(
    () => ({
      total: clients.length,
      billable: countBillableClients(clients),
      agencies: countAgencies(clients),
      actifs: clients.filter((c) => c.active).length,
      sieges: clients.filter((c) => c.client_type === "siege").length,
      avecSessions: clients.filter((c) => (c.sessions_count ?? 0) > 0).length,
    }),
    [clients]
  );

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

  const handleEdit = (id: string) => {
    router.push(`/admin/clients/${id}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        icon={Building2}
        title="Clients"
        description="Gérez les entreprises clientes et leurs agences"
      >
        <Button size="sm" onClick={() => router.push("/admin/clients/new")}>
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Nouveau client</span>
          <span className="sm:hidden">Ajouter</span>
        </Button>
      </AdminPageHeader>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-0 bg-secondary/30">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Clients facturables</p>
              <p className="text-2xl font-semibold">{stats.billable}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-purple-500/10">
            <CardContent className="p-4">
              <p className="text-xs text-purple-600 dark:text-purple-400">Sièges sociaux</p>
              <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
                {stats.sieges}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-blue-500/10">
            <CardContent className="p-4">
              <p className="text-xs text-blue-600 dark:text-blue-400">Agences</p>
              <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                {stats.agencies}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-green-500/10">
            <CardContent className="p-4">
              <p className="text-xs text-green-600 dark:text-green-400">Actifs</p>
              <p className="text-2xl font-semibold text-green-600">{stats.actifs}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Avec sessions</p>
              <p className="text-2xl font-semibold">{stats.avecSessions}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total entrées</p>
              <p className="text-2xl font-semibold text-muted-foreground">{stats.total}</p>
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
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous types</SelectItem>
            <SelectItem value="siege">Sièges</SelectItem>
            <SelectItem value="agence">Agences</SelectItem>
            <SelectItem value="standalone">Indépendants</SelectItem>
          </SelectContent>
        </Select>
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
      ) : filteredHierarchy.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucun client"
          description={
            search ? "Aucun client ne correspond à votre recherche" : "Créez votre premier client"
          }
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
                  <TableHead className={`${adminStyles.tableHead} w-12`}>#</TableHead>
                  <TableHead className={adminStyles.tableHead}>Entreprise</TableHead>
                  <TableHead className={adminStyles.tableHead}>Type</TableHead>
                  <TableHead className={adminStyles.tableHead}>SIRET</TableHead>
                  <TableHead className={adminStyles.tableHead}>Contact</TableHead>
                  <TableHead className={adminStyles.tableHead}>Sessions</TableHead>
                  <TableHead className={adminStyles.tableHead}>Statut</TableHead>
                  <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHierarchy.map((client, index) => (
                  <SiegeWithAgencies
                    key={client.id}
                    siege={client}
                    index={index + 1}
                    onEdit={handleEdit}
                    onDelete={setClientToDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredHierarchy.map((client) => (
              <div key={client.id}>
                <MobileClientCard
                  client={client}
                  children={client.children.length}
                  onClick={() => handleEdit(client.id)}
                />
                {/* Show children on mobile */}
                {client.children.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {client.children.map((agency) => (
                      <MobileClientCard
                        key={agency.id}
                        client={agency}
                        isChild
                        onClick={() => handleEdit(agency.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
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
                  Vous êtes sur le point de supprimer <strong>{clientToDelete.nom}</strong>.
                  {(clientToDelete.sessions_count ?? 0) > 0 && (
                    <span className="block mt-2 text-destructive">
                      Ce client a {clientToDelete.sessions_count} inscription(s). Veuillez
                      d&apos;abord supprimer ces inscriptions.
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
