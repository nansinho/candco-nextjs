"use client";

import { useState, useMemo } from "react";
import { useContacts, useContactMutations, type ContactSubmission } from "@/hooks/admin/useContacts";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  MessageSquare,
  Search,
  Trash2,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Check,
  CheckCheck,
  Eye,
} from "lucide-react";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminContacts() {
  const { data: contacts = [], isLoading } = useContacts();
  const { markAsRead, markAllAsRead, deleteContact } = useContactMutations();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [contactToDelete, setContactToDelete] = useState<ContactSubmission | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase();
      const matchesSearch =
        fullName.includes(search.toLowerCase()) ||
        contact.email.toLowerCase().includes(search.toLowerCase()) ||
        contact.subject.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "unread" && !contact.read) ||
        (filterStatus === "read" && contact.read && !contact.replied) ||
        (filterStatus === "replied" && contact.replied);

      return matchesSearch && matchesStatus;
    });
  }, [contacts, search, filterStatus]);

  // Stats
  const stats = useMemo(() => ({
    total: contacts.length,
    unread: contacts.filter((c) => !c.read).length,
    read: contacts.filter((c) => c.read && !c.replied).length,
    replied: contacts.filter((c) => c.replied).length,
  }), [contacts]);

  const handleViewContact = async (contact: ContactSubmission) => {
    setSelectedContact(contact);
    if (!contact.read) {
      await markAsRead.mutateAsync(contact.id);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead.mutateAsync();
  };

  const handleDelete = async () => {
    if (!contactToDelete) return;

    setDeleting(true);
    try {
      await deleteContact.mutateAsync(contactToDelete.id);
      setContactToDelete(null);
      if (selectedContact?.id === contactToDelete.id) {
        setSelectedContact(null);
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        icon={MessageSquare}
        title="Messages"
        description="Consultez les messages du formulaire de contact"
      >
        {stats.unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
          >
            {markAllAsRead.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="mr-2 h-4 w-4" />
            )}
            Tout marquer comme lu
          </Button>
        )}
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
              <p className="text-xs text-muted-foreground">Non lus</p>
              <p className="text-2xl font-semibold text-blue-500">{stats.unread}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Lus</p>
              <p className="text-2xl font-semibold text-muted-foreground">{stats.read}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Répondus</p>
              <p className="text-2xl font-semibold text-green-500">{stats.replied}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un message..."
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
            <SelectItem value="unread">Non lus</SelectItem>
            <SelectItem value="read">Lus</SelectItem>
            <SelectItem value="replied">Répondus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredContacts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Aucun message"
          description={search ? "Aucun message ne correspond à votre recherche" : "Aucun message reçu"}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className={adminStyles.tableRowHeader}>
                  <TableHead className={adminStyles.tableHead}>Expéditeur</TableHead>
                  <TableHead className={adminStyles.tableHead}>Sujet</TableHead>
                  <TableHead className={adminStyles.tableHead}>Date</TableHead>
                  <TableHead className={adminStyles.tableHead}>Statut</TableHead>
                  <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    className={`${adminStyles.tableRowClickable} ${!contact.read ? "bg-primary/5" : ""}`}
                    onClick={() => handleViewContact(contact)}
                  >
                    <TableCell className={adminStyles.tableCell}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {!contact.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          )}
                          <p className={`font-medium truncate ${!contact.read ? "text-foreground" : ""}`}>
                            {contact.first_name} {contact.last_name}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{contact.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      <p className="truncate max-w-[200px]">{contact.subject}</p>
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(parseISO(contact.created_at), { addSuffix: true, locale: fr })}
                      </div>
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      {contact.replied ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          <CheckCheck className="h-3 w-3 mr-1" /> Répondu
                        </Badge>
                      ) : contact.read ? (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border/30">
                          <Check className="h-3 w-3 mr-1" /> Lu
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                          Non lu
                        </Badge>
                      )}
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
                          onClick={() => handleViewContact(contact)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`${adminStyles.tableActionButton} text-destructive`}
                          onClick={() => setContactToDelete(contact)}
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
            {filteredContacts.map((contact) => (
              <Card
                key={contact.id}
                className={`border-0 bg-secondary/30 cursor-pointer ${!contact.read ? "ring-1 ring-blue-500/30" : ""}`}
                onClick={() => handleViewContact(contact)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!contact.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                        <p className="font-medium truncate">
                          {contact.first_name} {contact.last_name}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {contact.subject}
                      </p>
                    </div>
                    {contact.replied ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 shrink-0">
                        Répondu
                      </Badge>
                    ) : contact.read ? (
                      <Badge variant="outline" className="bg-muted text-muted-foreground border-border/30 shrink-0">
                        Lu
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 shrink-0">
                        Non lu
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(parseISO(contact.created_at), { addSuffix: true, locale: fr })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Contact Detail Sheet */}
      <Sheet open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selectedContact && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left">{selectedContact.subject}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Sender Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {selectedContact.first_name.charAt(0)}{selectedContact.last_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedContact.first_name} {selectedContact.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(selectedContact.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-sm">
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <Mail className="h-4 w-4" />
                      {selectedContact.email}
                    </a>
                    {selectedContact.phone && (
                      <a
                        href={`tel:${selectedContact.phone}`}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                      >
                        <Phone className="h-4 w-4" />
                        {selectedContact.phone}
                      </a>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div className="bg-secondary/30 rounded-lg p-4">
                  <p className="text-sm whitespace-pre-wrap">{selectedContact.message}</p>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  {selectedContact.replied ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCheck className="h-3 w-3 mr-1" /> Répondu
                      {selectedContact.replied_at && (
                        <span className="ml-1 opacity-70">
                          le {format(parseISO(selectedContact.replied_at), "d MMM", { locale: fr })}
                        </span>
                      )}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-border/30">
                      En attente de réponse
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => setContactToDelete(selectedContact)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>

                {/* Reply Button */}
                <Button className="w-full" asChild>
                  <a href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Répondre par email
                  </a>
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <AlertDialog open={!!contactToDelete} onOpenChange={() => setContactToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce message ?</AlertDialogTitle>
            <AlertDialogDescription>
              {contactToDelete && (
                <>
                  Vous êtes sur le point de supprimer le message de{" "}
                  <strong>{contactToDelete.first_name} {contactToDelete.last_name}</strong>.
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
