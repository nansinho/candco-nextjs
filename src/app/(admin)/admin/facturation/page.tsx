"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "lucide-react";

// Types pour la facturation
interface Invoice {
  id: string;
  number: string;
  client: string;
  formation: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  date: string;
  dueDate: string;
}

// Données de démonstration
const demoInvoices: Invoice[] = [
  {
    id: "1",
    number: "FAC-2024-001",
    client: "Entreprise ABC",
    formation: "SST Initial",
    amount: 1500,
    status: "paid",
    date: "2024-01-15",
    dueDate: "2024-02-15",
  },
  {
    id: "2",
    number: "FAC-2024-002",
    client: "Société XYZ",
    formation: "Incendie EPI",
    amount: 2200,
    status: "sent",
    date: "2024-01-20",
    dueDate: "2024-02-20",
  },
  {
    id: "3",
    number: "FAC-2024-003",
    client: "Association DEF",
    formation: "CAP AEPE Module 1",
    amount: 3500,
    status: "overdue",
    date: "2024-01-05",
    dueDate: "2024-02-05",
  },
  {
    id: "4",
    number: "FAC-2024-004",
    client: "Mairie de Marseille",
    formation: "SST Recyclage",
    amount: 800,
    status: "draft",
    date: "2024-01-25",
    dueDate: "2024-02-25",
  },
];

const statusConfig = {
  draft: { label: "Brouillon", color: "bg-muted text-muted-foreground", icon: FileText },
  sent: { label: "Envoyée", color: "bg-blue-500/15 text-blue-600", icon: Clock },
  paid: { label: "Payée", color: "bg-green-500/15 text-green-600", icon: CheckCircle2 },
  overdue: { label: "En retard", color: "bg-destructive/15 text-destructive", icon: AlertCircle },
};

export default function FacturationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredInvoices = demoInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = filteredInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = filteredInvoices
    .filter((inv) => inv.status === "sent" || inv.status === "overdue")
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="h-6 w-6" />
            Facturation
          </h1>
          <p className="text-muted-foreground">
            Gérez vos factures et suivez les paiements
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle facture
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total facturé</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount.toLocaleString()} €</div>
            <p className="text-xs text-muted-foreground">
              {filteredInvoices.length} facture(s)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encaissé</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {paidAmount.toLocaleString()} €
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredInvoices.filter((i) => i.status === "paid").length} facture(s) payée(s)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {pendingAmount.toLocaleString()} €
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredInvoices.filter((i) => i.status === "sent" || i.status === "overdue").length} facture(s) en attente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
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
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Formation</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Échéance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const status = statusConfig[invoice.status];
                const StatusIcon = status.icon;
                return (
                  <TableRow key={invoice.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{invoice.number}</TableCell>
                    <TableCell>{invoice.client}</TableCell>
                    <TableCell>{invoice.formation}</TableCell>
                    <TableCell className="font-medium">{invoice.amount.toLocaleString()} €</TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(invoice.date).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString("fr-FR")}</TableCell>
                  </TableRow>
                );
              })}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune facture trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
