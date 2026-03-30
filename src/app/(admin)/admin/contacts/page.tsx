"use client";

import { useState, useMemo } from "react";
import { normalizeText } from "@/lib/utils";
import { useContactSubmissions, useContactMutations, type ContactSubmission } from "@/hooks/admin/useContacts";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatsCard, StatsCardSkeleton } from "@/components/admin/StatsCard";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  Mail,
  Search,
  Eye,
  CheckCircle,
  Reply,
  Trash2,
  MoreHorizontal,
  MailOpen,
  Clock,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";

function getStatusBadge(contact: ContactSubmission) {
  if (contact.replied) {
    return <Badge className="bg-green-500/15 text-green-500 border-0 text-[10px]">Répondu</Badge>;
  }
  if (contact.read) {
    return <Badge className="bg-blue-500/15 text-blue-500 border-0 text-[10px]">Lu</Badge>;
  }
  return <Badge className="bg-amber-500/15 text-amber-500 border-0 text-[10px]">Non lu</Badge>;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ContactsPage() {
  const { data: contacts, isLoading } = useContactSubmissions();
  const { markAsRead, markAsReplied, deleteContact } = useContactMutations();

  const [search, setSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (!contacts) return { total: 0, unread: 0, pending: 0 };
    return {
      total: contacts.length,
      unread: contacts.filter((c) => !c.read).length,
      pending: contacts.filter((c) => c.read && !c.replied).length,
    };
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    if (!contacts) return [];
    if (!search) return contacts;
    const normalized = normalizeText(search);
    return contacts.filter(
      (c) =>
        normalizeText(`${c.first_name} ${c.last_name}`).includes(normalized) ||
        normalizeText(c.email).includes(normalized) ||
        normalizeText(c.subject).includes(normalized)
    );
  }, [contacts, search]);

  const handleView = (contact: ContactSubmission) => {
    setSelectedContact(contact);
    if (!contact.read) {
      markAsRead.mutate(contact.id);
    }
  };

  const handleMarkReplied = (id: string) => {
    markAsReplied.mutate(id, {
      onSuccess: () => toast.success("Marqué comme répondu"),
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteContact.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Contact supprimé");
        setDeleteId(null);
        if (selectedContact?.id === deleteId) setSelectedContact(null);
      },
    });
  };

  return (
    <div className={adminStyles.pageLayout}>
      <AdminPageHeader
        icon={Mail}
        title="Demandes de contact"
        description="Gérez les soumissions du formulaire de contact"
      />

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Total"
              value={stats.total}
              description="Demandes reçues"
              icon={Inbox}
            />
            <StatsCard
              title="Non lus"
              value={stats.unread}
              description="En attente de lecture"
              icon={Mail}
            />
            <StatsCard
              title="En attente"
              value={stats.pending}
              description="Lus mais pas répondus"
              icon={Clock}
            />
          </>
        )}
      </div>

      {/* Search */}
      <Card className="border-0 bg-secondary/30">
        <div className="p-4">
          <div className={adminStyles.searchWrapper}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou sujet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={adminStyles.searchInput}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="border-0 bg-secondary/30">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="Aucune demande de contact"
            description={search ? "Aucun résultat pour cette recherche" : "Les soumissions du formulaire de contact apparaîtront ici"}
          />
        ) : (
          <div className={adminStyles.tableWrapper}>
            <Table>
              <TableHeader>
                <TableRow className={adminStyles.tableRowHeader}>
                  <TableHead className={adminStyles.tableHead}>Date</TableHead>
                  <TableHead className={adminStyles.tableHead}>Nom</TableHead>
                  <TableHead className={`${adminStyles.tableHead} hidden md:table-cell`}>Email</TableHead>
                  <TableHead className={`${adminStyles.tableHead} hidden lg:table-cell`}>Sujet</TableHead>
                  <TableHead className={adminStyles.tableHead}>Statut</TableHead>
                  <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow
                    key={contact.id}
                    className={adminStyles.tableRowClickable}
                    onClick={() => handleView(contact)}
                  >
                    <TableCell className={adminStyles.tableCellMuted}>
                      {formatDate(contact.created_at)}
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      <div className="flex items-center gap-2">
                        {!contact.read && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                        <span className={!contact.read ? "font-medium" : ""}>
                          {contact.first_name} {contact.last_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={`${adminStyles.tableCellMuted} hidden md:table-cell`}>
                      {contact.email}
                    </TableCell>
                    <TableCell className={`${adminStyles.tableCell} hidden lg:table-cell max-w-[200px] truncate`}>
                      {contact.subject}
                    </TableCell>
                    <TableCell>{getStatusBadge(contact)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className={adminStyles.tableActionButton}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-border/20">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleView(contact); }}>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir le message
                          </DropdownMenuItem>
                          {!contact.read && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); markAsRead.mutate(contact.id); }}>
                              <MailOpen className="h-4 w-4 mr-2" />
                              Marquer comme lu
                            </DropdownMenuItem>
                          )}
                          {!contact.replied && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleMarkReplied(contact.id); }}>
                              <Reply className="h-4 w-4 mr-2" />
                              Marquer comme répondu
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => { e.stopPropagation(); setDeleteId(contact.id); }}
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
        )}
      </Card>

      {/* View Contact Dialog */}
      <Dialog open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContact(null)}>
        <DialogContent className="border-border/20 max-w-lg">
          <DialogHeader>
            <DialogTitle className={adminStyles.cardTitle}>
              {selectedContact?.subject}
            </DialogTitle>
            <DialogDescription className="text-xs">
              De {selectedContact?.first_name} {selectedContact?.last_name} — {selectedContact?.created_at && formatDate(selectedContact.created_at)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="text-sm">{selectedContact?.email}</p>
              </div>
              {selectedContact?.phone && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Téléphone</p>
                  <p className="text-sm">{selectedContact.phone}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Message</p>
              <div className="bg-muted/30 rounded-lg p-3 text-sm whitespace-pre-wrap">
                {selectedContact?.message}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedContact && getStatusBadge(selectedContact)}
              {selectedContact?.replied_at && (
                <span className="text-xs text-muted-foreground">
                  Répondu le {formatDate(selectedContact.replied_at)}
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            {selectedContact && !selectedContact.replied && (
              <Button
                size="sm"
                onClick={() => {
                  handleMarkReplied(selectedContact.id);
                  setSelectedContact({ ...selectedContact, replied: true, replied_at: new Date().toISOString() });
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marquer comme répondu
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="border-border/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce contact ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le message sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
