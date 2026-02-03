"use client";

import { useState, useMemo } from "react";
import { useInvoices, useInvoiceMutations, type Invoice, type CreateInvoiceInput } from "@/hooks/admin/useInvoices";
import { useClients } from "@/hooks/admin/useClients";
import { useFormations } from "@/hooks/admin/useFormations";
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
  Receipt,
  Search,
  Plus,
  Download,
  Filter,
  Euro,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CreditCard,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<Invoice["status"], { label: string; color: string; icon: typeof FileText }> = {
  draft: { label: "Brouillon", color: "bg-muted text-muted-foreground", icon: FileText },
  sent: { label: "Envoyée", color: "bg-blue-500/15 text-blue-600", icon: Clock },
  paid: { label: "Payée", color: "bg-green-500/15 text-green-600", icon: CheckCircle2 },
  overdue: { label: "En retard", color: "bg-destructive/15 text-destructive", icon: AlertCircle },
  cancelled: { label: "Annulée", color: "bg-muted text-muted-foreground", icon: XCircle },
};

export default function FacturationPage() {
  const { data: invoices = [], isLoading } = useInvoices();
  const { data: clients = [] } = useClients();
  const { data: formations = [] } = useFormations();
  const { createInvoice, updateInvoice, deleteInvoice, updateStatus } = useInvoiceMutations();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<Partial<CreateInvoiceInput>>({
    number: "",
    client_id: "",
    formation_id: "",
    amount: 0,
    status: "draft",
    date: new Date().toISOString().split("T")[0],
    due_date: "",
    notes: "",
  });

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (invoice.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paid = invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.amount, 0);
    const pending = invoices
      .filter((inv) => inv.status === "sent" || inv.status === "overdue")
      .reduce((sum, inv) => sum + inv.amount, 0);
    const overdue = invoices.filter((inv) => inv.status === "overdue").length;
    return { total, paid, pending, overdue };
  }, [invoices]);

  const resetForm = () => {
    setFormData({
      number: "",
      client_id: "",
      formation_id: "",
      amount: 0,
      status: "draft",
      date: new Date().toISOString().split("T")[0],
      due_date: "",
      notes: "",
    });
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const count = invoices.filter((i) => i.number.includes(year.toString())).length + 1;
    return `FAC-${year}-${count.toString().padStart(3, "0")}`;
  };

  const handleCreate = async () => {
    if (!formData.number || !formData.amount || !formData.date || !formData.due_date) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    try {
      await createInvoice.mutateAsync(formData as CreateInvoiceInput);
      toast.success("Facture créée");
      setCreateDialogOpen(false);
      resetForm();
    } catch {
      toast.error("Erreur lors de la création");
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setFormData({
      number: invoice.number,
      client_id: invoice.client_id || "",
      formation_id: invoice.formation_id || "",
      amount: invoice.amount,
      status: invoice.status,
      date: invoice.date,
      due_date: invoice.due_date,
      notes: invoice.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedInvoice) return;
    try {
      await updateInvoice.mutateAsync({
        id: selectedInvoice.id,
        data: formData,
      });
      toast.success("Facture mise à jour");
      setEditDialogOpen(false);
      setSelectedInvoice(null);
      resetForm();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async () => {
    if (!selectedInvoice) return;
    try {
      await deleteInvoice.mutateAsync(selectedInvoice.id);
      toast.success("Facture supprimée");
      setDeleteDialogOpen(false);
      setSelectedInvoice(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    try {
      await updateStatus.mutateAsync({ id: invoice.id, status: "paid" });
      toast.success("Facture marquée comme payée");
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleExport = () => {
    const headers = [
      "Numéro",
      "Client",
      "Formation",
      "Montant",
      "Statut",
      "Date",
      "Échéance",
      "Notes",
    ];
    const rows = invoices.map((i) => [
      i.number,
      i.client_name || "",
      i.formation_title || "",
      i.amount.toString(),
      statusConfig[i.status].label,
      new Date(i.date).toLocaleDateString("fr-FR"),
      new Date(i.due_date).toLocaleDateString("fr-FR"),
      i.notes || "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `factures_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Export téléchargé");
  };

  const renderForm = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="number">Numéro de facture *</Label>
          <div className="flex gap-2">
            <Input
              id="number"
              placeholder="FAC-2024-001"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setFormData({ ...formData, number: generateInvoiceNumber() })}
              title="Générer automatiquement"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Montant (€) *</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="client">Client</Label>
        <Select value={formData.client_id} onValueChange={(v) => setFormData({ ...formData, client_id: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Aucun client</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.company_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="formation">Formation</Label>
        <Select value={formData.formation_id} onValueChange={(v) => setFormData({ ...formData, formation_id: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une formation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Aucune formation</SelectItem>
            {formations.map((formation) => (
              <SelectItem key={formation.id} value={formation.id}>
                {formation.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="due_date">Échéance *</Label>
          <Input
            id="due_date"
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Statut</Label>
        <Select
          value={formData.status}
          onValueChange={(v) => setFormData({ ...formData, status: v as Invoice["status"] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="sent">Envoyée</SelectItem>
            <SelectItem value="paid">Payée</SelectItem>
            <SelectItem value="overdue">En retard</SelectItem>
            <SelectItem value="cancelled">Annulée</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Notes additionnelles..."
          value={formData.notes || ""}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        icon={Receipt}
        title="Facturation"
        description="Gérez vos factures et suivez les paiements"
      >
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setFormData((prev) => ({ ...prev, number: generateInvoiceNumber() }));
              setCreateDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle facture
          </Button>
        </div>
      </AdminPageHeader>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-0 bg-secondary/30">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total facturé</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()} €</div>
              <p className="text-xs text-muted-foreground">{invoices.length} facture(s)</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Encaissé</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.paid.toLocaleString()} €</div>
              <p className="text-xs text-muted-foreground">
                {invoices.filter((i) => i.status === "paid").length} payée(s)
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.pending.toLocaleString()} €</div>
              <p className="text-xs text-muted-foreground">
                {invoices.filter((i) => i.status === "sent" || i.status === "overdue").length} en cours
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En retard</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground">facture(s) en retard</p>
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
                placeholder="Rechercher par numéro ou client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="sent">Envoyée</SelectItem>
                <SelectItem value="paid">Payée</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
                <SelectItem value="cancelled">Annulée</SelectItem>
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
      ) : filteredInvoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Aucune facture"
          description={searchQuery ? "Aucune facture ne correspond à votre recherche" : "Créez votre première facture"}
        />
      ) : (
        <Card className="border-0 bg-secondary/30">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className={adminStyles.tableRowHeader}>
                  <TableHead className={adminStyles.tableHead}>Numéro</TableHead>
                  <TableHead className={adminStyles.tableHead}>Client</TableHead>
                  <TableHead className={adminStyles.tableHead}>Formation</TableHead>
                  <TableHead className={adminStyles.tableHead}>Montant</TableHead>
                  <TableHead className={adminStyles.tableHead}>Statut</TableHead>
                  <TableHead className={adminStyles.tableHead}>Date</TableHead>
                  <TableHead className={adminStyles.tableHead}>Échéance</TableHead>
                  <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const status = statusConfig[invoice.status];
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={invoice.id} className={adminStyles.tableRowClickable}>
                      <TableCell className={`${adminStyles.tableCell} font-medium`}>
                        {invoice.number}
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        {invoice.client_name || "-"}
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        {invoice.formation_title || "-"}
                      </TableCell>
                      <TableCell className={`${adminStyles.tableCell} font-medium`}>
                        {invoice.amount.toLocaleString()} €
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        <Badge className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        {new Date(invoice.date).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        {new Date(invoice.due_date).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className={`${adminStyles.tableCell} text-right`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setViewDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Voir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                              <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice)}>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Marquer payée
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedInvoice(invoice);
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle facture</DialogTitle>
            <DialogDescription>Créez une nouvelle facture</DialogDescription>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={createInvoice.isPending}>
              {createInvoice.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier la facture</DialogTitle>
            <DialogDescription>Modifiez les informations de la facture</DialogDescription>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={updateInvoice.isPending}>
              {updateInvoice.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Facture {selectedInvoice?.number}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Montant</Label>
                  <p className="mt-1 text-xl font-bold">{selectedInvoice.amount.toLocaleString()} €</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Statut</Label>
                  <div className="mt-1">
                    <Badge className={statusConfig[selectedInvoice.status].color}>
                      {statusConfig[selectedInvoice.status].label}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Client</Label>
                <p className="mt-1">{selectedInvoice.client_name || "Non spécifié"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Formation</Label>
                <p className="mt-1">{selectedInvoice.formation_title || "Non spécifiée"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Date d'émission</Label>
                  <p className="mt-1">{new Date(selectedInvoice.date).toLocaleDateString("fr-FR")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Échéance</Label>
                  <p className="mt-1">{new Date(selectedInvoice.due_date).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
              {selectedInvoice.paid_at && (
                <div>
                  <Label className="text-muted-foreground">Payée le</Label>
                  <p className="mt-1">{new Date(selectedInvoice.paid_at).toLocaleDateString("fr-FR")}</p>
                </div>
              )}
              {selectedInvoice.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="mt-1 text-sm">{selectedInvoice.notes}</p>
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
            <AlertDialogTitle>Supprimer cette facture ?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedInvoice && (
                <>
                  La facture <strong>{selectedInvoice.number}</strong> de{" "}
                  <strong>{selectedInvoice.amount.toLocaleString()} €</strong> sera définitivement supprimée.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteInvoice.isPending}
            >
              {deleteInvoice.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
