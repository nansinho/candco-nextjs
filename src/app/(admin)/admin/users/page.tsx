"use client";

import { useState, useMemo, useEffect } from "react";
import {
  useUsers,
  useUserMutations,
  useOrganizations,
  type UserWithRole,
} from "@/hooks/admin/useUsers";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Users,
  Search,
  Trash2,
  Loader2,
  MoreVertical,
  Calendar,
  UserPlus,
  Mail,
  CheckCircle,
  XCircle,
  Camera,
  CameraOff,
  Building2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

const ROLES = [
  { value: "superadmin", label: "Super Admin", color: "bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-500 border-amber-500/30" },
  { value: "admin", label: "Admin", color: "bg-gradient-to-r from-red-500/20 to-red-600/10 text-red-500 border-red-500/30" },
  { value: "org_manager", label: "Org. Manager", color: "bg-gradient-to-r from-blue-500/20 to-blue-600/10 text-blue-500 border-blue-500/30" },
  { value: "moderator", label: "Modérateur", color: "bg-gradient-to-r from-purple-500/20 to-purple-600/10 text-purple-500 border-purple-500/30" },
  { value: "formateur", label: "Formateur", color: "bg-gradient-to-r from-green-500/20 to-green-600/10 text-green-500 border-green-500/30" },
  { value: "client_manager", label: "Client Manager", color: "bg-gradient-to-r from-cyan-500/20 to-cyan-600/10 text-cyan-500 border-cyan-500/30" },
  { value: "user", label: "Utilisateur", color: "bg-muted text-muted-foreground border-border/30" },
];

// Client role labels
const CLIENT_ROLES: Record<string, string> = {
  directeur_general: "Directeur Général",
  responsable_formation: "Resp. Formation",
  responsable_rh: "Resp. RH",
  assistant: "Assistant(e)",
  collaborateur: "Collaborateur",
  stagiaire: "Stagiaire",
};

function getRoleInfo(role: string) {
  return ROLES.find((r) => r.value === role) || ROLES[ROLES.length - 1];
}

function getUserInitials(user: UserWithRole): string {
  if (user.first_name && user.last_name) {
    return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
  }
  if (user.first_name) {
    return user.first_name.charAt(0).toUpperCase();
  }
  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }
  return "?";
}

function getUserDisplayName(user: UserWithRole): string {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  if (user.first_name) {
    return user.first_name;
  }
  return "Sans nom";
}

export default function AdminUsers() {
  // State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);

  // Hooks
  const { data, isLoading, refetch } = useUsers(page, debouncedSearch);
  const { data: organizations = [] } = useOrganizations();
  const { updateRole, deleteUser, inviteUser, resendVerificationEmail, confirmEmailManually } = useUserMutations();

  const users = data?.users || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / 50);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Filter users by role (client-side for role filter)
  const filteredUsers = useMemo(() => {
    if (filterRole === "all") return users;
    return users.filter((user) => user.role === filterRole);
  }, [users, filterRole]);

  // Stats
  const stats = useMemo(() => {
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalCount,
      admins: (roleCounts.superadmin || 0) + (roleCounts.admin || 0),
      formateurs: roleCounts.formateur || 0,
      unverified: users.filter((u) => !u.email_verified).length,
    };
  }, [users, totalCount]);

  // Handlers
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateRole.mutateAsync({ userId, role: newRole });
      toast.success("Rôle mis à jour");
    } catch {
      toast.error("Erreur lors de la mise à jour du rôle");
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await deleteUser.mutateAsync(userToDelete.id);
      setUserToDelete(null);
      toast.success("Utilisateur supprimé");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    try {
      await inviteUser.mutateAsync({
        email: inviteEmail,
        role: inviteRole,
        organizationIds: inviteRole === "org_manager" ? selectedOrganizations : undefined,
      });
      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("user");
      setSelectedOrganizations([]);
      toast.success("Invitation envoyée");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'invitation");
    }
  };

  const handleResendVerification = async (user: UserWithRole) => {
    if (!user.email) return;
    try {
      await resendVerificationEmail.mutateAsync({ email: user.email, userId: user.id });
      toast.success("Email de vérification renvoyé");
    } catch {
      toast.error("Erreur lors de l'envoi");
    }
  };

  const handleConfirmEmail = async (userId: string) => {
    try {
      await confirmEmailManually.mutateAsync({ userId });
      toast.success("Email confirmé manuellement");
    } catch {
      toast.error("Erreur lors de la confirmation");
    }
  };

  // Render primary client badge
  const renderClientBadge = (user: UserWithRole) => {
    if (!user.clients || user.clients.length === 0) return <span className="text-muted-foreground">—</span>;

    const primaryClient = user.clients.find((c) => c.is_primary) || user.clients[0];
    const otherClients = user.clients.filter((c) => c !== primaryClient);

    return (
      <div className="flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 text-left hover:underline">
              <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
              <span className="truncate max-w-[120px] text-sm">{primaryClient.name}</span>
              {otherClients.length > 0 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  +{otherClients.length}
                </Badge>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <h4 className="font-medium text-sm mb-2">Entreprises</h4>
            <div className="space-y-2">
              {user.clients.map((client) => (
                <div key={client.id} className="flex items-start gap-2 text-sm">
                  {client.is_primary && <CheckCircle className="h-3 w-3 text-green-500 mt-0.5" />}
                  {!client.is_primary && <Building2 className="h-3 w-3 text-muted-foreground mt-0.5" />}
                  <div className="min-w-0">
                    <p className="font-medium truncate">{client.name}</p>
                    {client.client_role && (
                      <p className="text-xs text-muted-foreground">
                        {CLIENT_ROLES[client.client_role] || client.client_role}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  // Render poste (client role)
  const renderPoste = (user: UserWithRole) => {
    if (!user.clients || user.clients.length === 0) return <span className="text-muted-foreground">—</span>;
    const primaryClient = user.clients.find((c) => c.is_primary) || user.clients[0];
    if (!primaryClient.client_role) return <span className="text-muted-foreground">—</span>;
    return (
      <Badge variant="outline" className="text-[10px] font-normal">
        {CLIENT_ROLES[primaryClient.client_role] || primaryClient.client_role}
      </Badge>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        icon={Users}
        title="Utilisateurs"
        description="Gérez les utilisateurs et leurs rôles"
      >
        <Button onClick={() => setInviteDialogOpen(true)} size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Inviter
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
              <p className="text-xs text-muted-foreground">Admins</p>
              <p className="text-2xl font-semibold text-red-500">{stats.admins}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Formateurs</p>
              <p className="text-2xl font-semibold text-green-500">{stats.formateurs}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Non confirmés</p>
              <p className="text-2xl font-semibold text-orange-500">{stats.unverified}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            {ROLES.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun utilisateur"
          description={search ? "Aucun utilisateur ne correspond à votre recherche" : "Aucun utilisateur inscrit"}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className={adminStyles.tableRowHeader}>
                  <TableHead className={`${adminStyles.tableHead} w-12`}>#</TableHead>
                  <TableHead className={adminStyles.tableHead}>Utilisateur</TableHead>
                  <TableHead className={adminStyles.tableHead}>Email</TableHead>
                  <TableHead className={adminStyles.tableHead}>Rôle</TableHead>
                  <TableHead className={adminStyles.tableHead}>Client</TableHead>
                  <TableHead className={adminStyles.tableHead}>Poste</TableHead>
                  <TableHead className={`${adminStyles.tableHead} w-16 text-center`}>Image</TableHead>
                  <TableHead className={adminStyles.tableHead}>Inscription</TableHead>
                  <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user, index) => {
                  const roleInfo = getRoleInfo(user.role);
                  const rowNumber = (page - 1) * 50 + index + 1;

                  return (
                    <TableRow key={user.id} className={adminStyles.tableRowClickable}>
                      <TableCell className={`${adminStyles.tableCell} text-muted-foreground text-xs`}>
                        {rowNumber}
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || undefined} alt={getUserDisplayName(user)} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getUserInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium truncate max-w-[140px]">
                            {getUserDisplayName(user)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        <div className="flex items-center gap-2">
                          <span className="text-sm truncate max-w-[160px]">{user.email || "—"}</span>
                          {user.email && !user.email_verified && (
                            <Badge className="bg-orange-500/10 text-orange-600 border border-orange-500/20 text-[10px]">
                              Non confirmé
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-[130px] h-7 text-xs">
                            <Badge variant="outline" className={`${roleInfo.color} text-[10px]`}>
                              {roleInfo.label}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                <Badge variant="outline" className={`${role.color} text-[10px]`}>
                                  {role.label}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        {renderClientBadge(user)}
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        {renderPoste(user)}
                      </TableCell>
                      <TableCell className={`${adminStyles.tableCell} text-center`}>
                        {user.image_rights_consent === true && (
                          <Camera className="h-4 w-4 text-green-500 mx-auto" />
                        )}
                        {user.image_rights_consent === false && (
                          <CameraOff className="h-4 w-4 text-red-500 mx-auto" />
                        )}
                        {user.image_rights_consent === null && (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(parseISO(user.created_at), "dd/MM/yy", { locale: fr })}
                        </div>
                      </TableCell>
                      <TableCell className={`${adminStyles.tableCell} text-right`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {user.email && !user.email_verified && (
                              <>
                                <DropdownMenuItem onClick={() => handleResendVerification(user)}>
                                  <Mail className="h-4 w-4 mr-2" />
                                  Renvoyer vérification
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleConfirmEmail(user.id)}>
                                  <ShieldCheck className="h-4 w-4 mr-2" />
                                  Confirmer manuellement
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setUserToDelete(user)}
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

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filteredUsers.map((user, index) => {
              const roleInfo = getRoleInfo(user.role);
              const rowNumber = (page - 1) * 50 + index + 1;

              return (
                <Card key={user.id} className="border-0 bg-secondary/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs text-muted-foreground w-5">{rowNumber}</span>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url || undefined} alt={getUserDisplayName(user)} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{getUserDisplayName(user)}</p>
                          <div className="flex items-center gap-1">
                            <p className="text-xs text-muted-foreground truncate">{user.email || "—"}</p>
                            {user.email && !user.email_verified && (
                              <XCircle className="h-3 w-3 text-orange-500 shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {ROLES.map((role) => (
                            <DropdownMenuItem
                              key={role.value}
                              onClick={() => handleRoleChange(user.id, role.value)}
                            >
                              <Badge variant="outline" className={`${role.color} text-[10px] mr-2`}>
                                {role.label}
                              </Badge>
                              {user.role === role.value && "✓"}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          {user.email && !user.email_verified && (
                            <DropdownMenuItem onClick={() => handleResendVerification(user)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Renvoyer vérification
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setUserToDelete(user)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline" className={`${roleInfo.color} text-[10px]`}>
                        {roleInfo.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(user.created_at), "dd/MM/yy", { locale: fr })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} sur {totalPages} ({totalCount} utilisateurs)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inviter un utilisateur</DialogTitle>
            <DialogDescription>
              Envoyez une invitation par email pour créer un nouveau compte.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="email@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Rôle</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {inviteRole === "org_manager" && organizations.length > 0 && (
              <div className="space-y-2">
                <Label>Organisations</Label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                  {organizations.map((org) => (
                    <div key={org.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`org-${org.id}`}
                        checked={selectedOrganizations.includes(org.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedOrganizations([...selectedOrganizations, org.id]);
                          } else {
                            setSelectedOrganizations(selectedOrganizations.filter((id) => id !== org.id));
                          }
                        }}
                      />
                      <label htmlFor={`org-${org.id}`} className="text-sm cursor-pointer">
                        {org.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail || inviteUser.isPending}>
              {inviteUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer l'invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete && (
                <>
                  Vous êtes sur le point de supprimer{" "}
                  <strong>{getUserDisplayName(userToDelete)}</strong>.
                  Cette action est irréversible.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
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
