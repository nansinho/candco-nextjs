"use client";

import { useState, useMemo } from "react";
import { useNotifications, useNotificationMutations, type AdminNotification } from "@/hooks/admin/useNotifications";
import { useUsers } from "@/hooks/admin/useUsers";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Search,
  Plus,
  Mail,
  Smartphone,
  Globe,
  CheckCircle2,
  Clock,
  Users,
  Send,
  MoreVertical,
  Trash2,
  Eye,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const typeConfig: Record<string, { label: string; icon: typeof Mail; color: string }> = {
  email: { label: "Email", icon: Mail, color: "bg-blue-500/15 text-blue-600" },
  push: { label: "Push", icon: Smartphone, color: "bg-purple-500/15 text-purple-600" },
  in_app: { label: "In-App", icon: Globe, color: "bg-green-500/15 text-green-600" },
  system: { label: "Système", icon: Bell, color: "bg-amber-500/15 text-amber-600" },
  info: { label: "Info", icon: Bell, color: "bg-cyan-500/15 text-cyan-600" },
};

export default function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: usersData } = useUsers();
  const users = usersData?.users ?? [];
  const { createNotification, markAsRead, deleteNotification } = useNotificationMutations();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);
  const [formData, setFormData] = useState({
    user_id: "",
    title: "",
    message: "",
    type: "info",
    link: "",
  });

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      const matchesSearch =
        notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (notif.message?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesType = typeFilter === "all" || notif.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [notifications, searchQuery, typeFilter]);

  const stats = useMemo(() => {
    const unread = notifications.filter((n) => !n.read_at).length;
    const read = notifications.filter((n) => n.read_at).length;
    const uniqueUsers = new Set(notifications.map((n) => n.user_id)).size;
    return { total: notifications.length, unread, read, uniqueUsers };
  }, [notifications]);

  const resetForm = () => {
    setFormData({
      user_id: "",
      title: "",
      message: "",
      type: "info",
      link: "",
    });
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.user_id) {
      toast.error("Le titre et l'utilisateur sont obligatoires");
      return;
    }
    try {
      await createNotification.mutateAsync({
        user_id: formData.user_id,
        title: formData.title,
        message: formData.message || undefined,
        type: formData.type,
        link: formData.link || undefined,
      });
      toast.success("Notification créée");
      setCreateDialogOpen(false);
      resetForm();
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  const handleView = (notification: AdminNotification) => {
    setSelectedNotification(notification);
    setViewDialogOpen(true);
  };

  const handleMarkAsRead = async (notification: AdminNotification) => {
    if (notification.read_at) return;
    try {
      await markAsRead.mutateAsync(notification.id);
      toast.success("Marquée comme lue");
    } catch {
      toast.error("Erreur");
    }
  };

  const handleDelete = async () => {
    if (!selectedNotification) return;
    try {
      await deleteNotification.mutateAsync(selectedNotification.id);
      toast.success("Notification supprimée");
      setDeleteDialogOpen(false);
      setSelectedNotification(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : userId.slice(0, 8) + "...";
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Bell}
        title="Notifications"
        description="Gérez et envoyez des notifications aux utilisateurs"
      >
        <Button onClick={() => setCreateDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle notification
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
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Non lues</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.unread}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lues</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.read}</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.uniqueUsers}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="border-0 bg-secondary/30">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une notification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="push">Push</SelectItem>
                <SelectItem value="in_app">In-App</SelectItem>
                <SelectItem value="system">Système</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Aucune notification"
          description={searchQuery ? "Aucune notification ne correspond à votre recherche" : "Créez votre première notification"}
        />
      ) : (
        <Card className="border-0 bg-secondary/30">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className={adminStyles.tableRowHeader}>
                  <TableHead className={adminStyles.tableHead}>Notification</TableHead>
                  <TableHead className={adminStyles.tableHead}>Type</TableHead>
                  <TableHead className={adminStyles.tableHead}>Destinataire</TableHead>
                  <TableHead className={adminStyles.tableHead}>Statut</TableHead>
                  <TableHead className={adminStyles.tableHead}>Date</TableHead>
                  <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((notification) => {
                  const typeInfo = typeConfig[notification.type] || typeConfig.info;
                  const TypeIcon = typeInfo.icon;
                  return (
                    <TableRow key={notification.id} className={adminStyles.tableRowClickable}>
                      <TableCell className={adminStyles.tableCell}>
                        <div className="font-medium">{notification.title}</div>
                        {notification.message && (
                          <div className="text-xs text-muted-foreground truncate max-w-xs">
                            {notification.message}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        <Badge className={typeInfo.color}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {typeInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        <span className="text-sm">{getUserName(notification.user_id)}</span>
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        {notification.read_at ? (
                          <Badge className="bg-green-500/15 text-green-600">
                            <CheckCheck className="h-3 w-3 mr-1" />
                            Lue
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/15 text-amber-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Non lue
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        <span className="text-sm">
                          {notification.created_at
                            ? new Date(notification.created_at).toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </span>
                      </TableCell>
                      <TableCell className={`${adminStyles.tableCell} text-right`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(notification)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir
                            </DropdownMenuItem>
                            {!notification.read_at && (
                              <DropdownMenuItem onClick={() => handleMarkAsRead(notification)}>
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Marquer comme lue
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedNotification(notification);
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
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle notification</DialogTitle>
            <DialogDescription>
              Envoyez une notification à un utilisateur
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user">Destinataire *</Label>
              <Select value={formData.user_id} onValueChange={(v) => setFormData({ ...formData, user_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                placeholder="Titre de la notification"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Contenu de la notification"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="in_app">In-App</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Lien (optionnel)</Label>
              <Input
                id="link"
                placeholder="/admin/formations/123"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={createNotification.isPending}>
              {createNotification.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedNotification?.title}</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground">Message</Label>
                <p className="mt-1">{selectedNotification.message || "Aucun message"}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <div className="mt-1">
                    <Badge className={typeConfig[selectedNotification.type]?.color || typeConfig.info.color}>
                      {typeConfig[selectedNotification.type]?.label || selectedNotification.type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Statut</Label>
                  <div className="mt-1">
                    {selectedNotification.read_at ? (
                      <Badge className="bg-green-500/15 text-green-600">Lue</Badge>
                    ) : (
                      <Badge className="bg-amber-500/15 text-amber-600">Non lue</Badge>
                    )}
                  </div>
                </div>
              </div>
              {selectedNotification.link && (
                <div>
                  <Label className="text-muted-foreground">Lien</Label>
                  <p className="mt-1 text-sm text-blue-600">{selectedNotification.link}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Date de création</Label>
                <p className="mt-1">
                  {selectedNotification.created_at
                    ? new Date(selectedNotification.created_at).toLocaleString("fr-FR")
                    : "-"}
                </p>
              </div>
              {selectedNotification.read_at && (
                <div>
                  <Label className="text-muted-foreground">Lu le</Label>
                  <p className="mt-1">{new Date(selectedNotification.read_at).toLocaleString("fr-FR")}</p>
                </div>
              )}
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
            <AlertDialogTitle>Supprimer cette notification ?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedNotification && (
                <>
                  La notification <strong>{selectedNotification.title}</strong> sera définitivement supprimée.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteNotification.isPending}
            >
              {deleteNotification.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
