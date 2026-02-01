"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShieldAlert,
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
  Lock,
  CheckCircle2,
} from "lucide-react";

interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  usersCount: number;
  permissions: string[];
  isSystem: boolean;
}

const demoRoles: Role[] = [
  {
    id: "1",
    name: "Super Admin",
    slug: "superadmin",
    description: "Accès complet à toutes les fonctionnalités",
    usersCount: 1,
    permissions: ["all"],
    isSystem: true,
  },
  {
    id: "2",
    name: "Administrateur",
    slug: "admin",
    description: "Gestion complète sauf paramètres système",
    usersCount: 3,
    permissions: ["formations", "users", "content", "settings"],
    isSystem: true,
  },
  {
    id: "3",
    name: "Gestionnaire d'organisme",
    slug: "org_manager",
    description: "Gestion des formations et sessions",
    usersCount: 5,
    permissions: ["formations", "sessions", "clients"],
    isSystem: true,
  },
  {
    id: "4",
    name: "Modérateur",
    slug: "moderator",
    description: "Modération du contenu et des messages",
    usersCount: 2,
    permissions: ["content", "messages"],
    isSystem: true,
  },
  {
    id: "5",
    name: "Formateur",
    slug: "trainer",
    description: "Accès aux formations assignées",
    usersCount: 12,
    permissions: ["view_formations", "manage_sessions"],
    isSystem: false,
  },
];

const allPermissions = [
  { id: "formations", label: "Formations", category: "Formations" },
  { id: "sessions", label: "Sessions", category: "Formations" },
  { id: "clients", label: "Clients", category: "Formations" },
  { id: "users", label: "Utilisateurs", category: "Administration" },
  { id: "content", label: "Contenu", category: "Contenu" },
  { id: "messages", label: "Messages", category: "Communication" },
  { id: "settings", label: "Paramètres", category: "Système" },
  { id: "all", label: "Tous les accès", category: "Système" },
];

export default function RolesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const filteredRoles = demoRoles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsers = demoRoles.reduce((sum, r) => sum + r.usersCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="h-6 w-6" />
            Rôles & Permissions
          </h1>
          <p className="text-muted-foreground">
            Gérez les rôles et leurs permissions
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau rôle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total rôles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoRoles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs assignés</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rôles système</CardTitle>
            <Lock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {demoRoles.filter((r) => r.isSystem).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un rôle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Roles List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des rôles</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Utilisateurs</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow
                    key={role.id}
                    className={`cursor-pointer hover:bg-muted/50 ${
                      selectedRole?.id === role.id ? "bg-muted/50" : ""
                    }`}
                    onClick={() => setSelectedRole(role)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {role.name}
                            {role.isSystem && (
                              <Lock className="h-3 w-3 text-amber-600" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {role.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {role.usersCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" disabled={role.isSystem}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          disabled={role.isSystem}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Permissions Panel */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedRole ? `Permissions : ${selectedRole.name}` : "Sélectionnez un rôle"}
            </CardTitle>
            <CardDescription>
              {selectedRole
                ? "Cochez les permissions à attribuer à ce rôle"
                : "Cliquez sur un rôle pour voir ses permissions"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedRole ? (
              <div className="space-y-4">
                {["Formations", "Administration", "Contenu", "Communication", "Système"].map(
                  (category) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {allPermissions
                          .filter((p) => p.category === category)
                          .map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={permission.id}
                                checked={
                                  selectedRole.permissions.includes("all") ||
                                  selectedRole.permissions.includes(permission.id)
                                }
                                disabled={selectedRole.isSystem}
                              />
                              <label
                                htmlFor={permission.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {permission.label}
                              </label>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                )}
                {selectedRole.isSystem && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Les rôles système ne peuvent pas être modifiés
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Sélectionnez un rôle pour gérer ses permissions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
