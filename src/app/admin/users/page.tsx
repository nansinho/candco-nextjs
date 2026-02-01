"use client";

import { useState, useMemo } from "react";
import { useUsers, useUserMutations, type UserWithRole } from "@/hooks/admin/useUsers";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Search,
  Trash2,
  Loader2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCog,
  MoreVertical,
  Calendar,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const ROLES = [
  { value: "superadmin", label: "Super Admin", color: "bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-500 border-amber-500/30" },
  { value: "admin", label: "Admin", color: "bg-gradient-to-r from-red-500/20 to-red-600/10 text-red-500 border-red-500/30" },
  { value: "org_manager", label: "Org. Manager", color: "bg-gradient-to-r from-blue-500/20 to-blue-600/10 text-blue-500 border-blue-500/30" },
  { value: "moderator", label: "Modérateur", color: "bg-gradient-to-r from-purple-500/20 to-purple-600/10 text-purple-500 border-purple-500/30" },
  { value: "formateur", label: "Formateur", color: "bg-gradient-to-r from-green-500/20 to-green-600/10 text-green-500 border-green-500/30" },
  { value: "client_manager", label: "Client Manager", color: "bg-gradient-to-r from-cyan-500/20 to-cyan-600/10 text-cyan-500 border-cyan-500/30" },
  { value: "user", label: "Utilisateur", color: "bg-muted text-muted-foreground border-border/30" },
];

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
  return user.email || "Utilisateur";
}

export default function AdminUsers() {
  const { data: users = [], isLoading } = useUsers();
  const { updateRole, deleteUser } = useUserMutations();

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const displayName = getUserDisplayName(user).toLowerCase();
      const matchesSearch =
        displayName.includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());

      const matchesRole = filterRole === "all" || user.role === filterRole;

      return matchesSearch && matchesRole;
    });
  }, [users, search, filterRole]);

  // Stats
  const stats = useMemo(() => {
    const roleCounts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: users.length,
      admins: (roleCounts.superadmin || 0) + (roleCounts.admin || 0),
      formateurs: roleCounts.formateur || 0,
      users: roleCounts.user || 0,
    };
  }, [users]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    await updateRole.mutateAsync({ userId, role: newRole });
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      await deleteUser.mutateAsync(userToDelete.id);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        icon={Users}
        title="Utilisateurs"
        description="Gérez les utilisateurs et leurs rôles"
      />

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
              <p className="text-xs text-muted-foreground">Utilisateurs</p>
              <p className="text-2xl font-semibold text-muted-foreground">{stats.users}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un utilisateur..."
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
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className={adminStyles.tableRowHeader}>
                  <TableHead className={adminStyles.tableHead}>Utilisateur</TableHead>
                  <TableHead className={adminStyles.tableHead}>Rôle</TableHead>
                  <TableHead className={adminStyles.tableHead}>Inscription</TableHead>
                  <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const roleInfo = getRoleInfo(user.role);
                  return (
                    <TableRow key={user.id} className={adminStyles.tableRowClickable}>
                      <TableCell className={adminStyles.tableCell}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar_url || undefined} alt={getUserDisplayName(user)} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getUserInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{getUserDisplayName(user)}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email || "—"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-[140px] h-8">
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
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(parseISO(user.created_at), "d MMM yyyy", { locale: fr })}
                        </div>
                      </TableCell>
                      <TableCell className={`${adminStyles.tableCell} text-right`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`${adminStyles.tableActionButton} text-destructive`}
                          onClick={() => setUserToDelete(user)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filteredUsers.map((user) => {
              const roleInfo = getRoleInfo(user.role);
              return (
                <Card key={user.id} className="border-0 bg-secondary/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url || undefined} alt={getUserDisplayName(user)} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{getUserDisplayName(user)}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email || "—"}</p>
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
                        {format(parseISO(user.created_at), "d MMM yyyy", { locale: fr })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

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
