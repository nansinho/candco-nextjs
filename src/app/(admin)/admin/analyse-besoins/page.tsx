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
  ClipboardList,
  Search,
  Plus,
  Download,
  Filter,
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

interface NeedsAnalysis {
  id: string;
  company: string;
  contact: string;
  email: string;
  employees: number;
  sector: string;
  status: "new" | "in_progress" | "completed" | "pending";
  createdAt: string;
  formations: string[];
}

const demoAnalyses: NeedsAnalysis[] = [
  {
    id: "1",
    company: "Entreprise ABC",
    contact: "Jean Dupont",
    email: "j.dupont@abc.fr",
    employees: 150,
    sector: "Industrie",
    status: "new",
    createdAt: "2024-01-20",
    formations: ["SST", "Incendie"],
  },
  {
    id: "2",
    company: "Société XYZ",
    contact: "Marie Martin",
    email: "m.martin@xyz.fr",
    employees: 45,
    sector: "Commerce",
    status: "in_progress",
    createdAt: "2024-01-18",
    formations: ["Gestes et postures", "SST"],
  },
  {
    id: "3",
    company: "Association DEF",
    contact: "Pierre Bernard",
    email: "p.bernard@def.org",
    employees: 25,
    sector: "Social",
    status: "completed",
    createdAt: "2024-01-15",
    formations: ["CAP AEPE"],
  },
  {
    id: "4",
    company: "Clinique Saint-Jean",
    contact: "Sophie Leroy",
    email: "s.leroy@clinique-sj.fr",
    employees: 200,
    sector: "Santé",
    status: "pending",
    createdAt: "2024-01-10",
    formations: ["AFGSU", "Hygiène"],
  },
];

const statusConfig = {
  new: { label: "Nouveau", color: "bg-blue-500/15 text-blue-600", icon: AlertCircle },
  in_progress: { label: "En cours", color: "bg-amber-500/15 text-amber-600", icon: Clock },
  completed: { label: "Terminé", color: "bg-green-500/15 text-green-600", icon: CheckCircle2 },
  pending: { label: "En attente", color: "bg-muted text-muted-foreground", icon: Clock },
};

export default function AnalyseBesoinsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredAnalyses = demoAnalyses.filter((analysis) => {
    const matchesSearch =
      analysis.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      analysis.contact.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || analysis.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Analyse des besoins
          </h1>
          <p className="text-muted-foreground">
            Gérez les demandes d'analyse des besoins en formation
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle analyse
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total demandes</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoAnalyses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouvelles</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {demoAnalyses.filter((a) => a.status === "new").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {demoAnalyses.filter((a) => a.status === "in_progress").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terminées</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {demoAnalyses.filter((a) => a.status === "completed").length}
            </div>
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
                placeholder="Rechercher par entreprise ou contact..."
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
                <SelectItem value="new">Nouveau</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
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
                <TableHead>Entreprise</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Secteur</TableHead>
                <TableHead>Effectif</TableHead>
                <TableHead>Formations souhaitées</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnalyses.map((analysis) => {
                const status = statusConfig[analysis.status];
                const StatusIcon = status.icon;
                return (
                  <TableRow key={analysis.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{analysis.company}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{analysis.contact}</div>
                        <div className="text-xs text-muted-foreground">{analysis.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{analysis.sector}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {analysis.employees}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {analysis.formations.map((f) => (
                          <Badge key={f} variant="outline" className="text-xs">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(analysis.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredAnalyses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune analyse trouvée
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
