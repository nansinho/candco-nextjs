"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Briefcase,
  Download,
  Upload,
  Calendar,
  Users,
  GraduationCap,
  Euro,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

interface BPFEntry {
  id: string;
  year: number;
  category: string;
  totalHours: number;
  totalTrainees: number;
  totalRevenue: number;
  status: "draft" | "in_progress" | "submitted" | "validated";
  deadline: string;
}

const demoBPFEntries: BPFEntry[] = [
  {
    id: "1",
    year: 2024,
    category: "Actions de formation",
    totalHours: 2450,
    totalTrainees: 180,
    totalRevenue: 125000,
    status: "in_progress",
    deadline: "2024-04-30",
  },
  {
    id: "2",
    year: 2024,
    category: "Bilans de compétences",
    totalHours: 320,
    totalTrainees: 16,
    totalRevenue: 24000,
    status: "draft",
    deadline: "2024-04-30",
  },
  {
    id: "3",
    year: 2024,
    category: "VAE",
    totalHours: 180,
    totalTrainees: 9,
    totalRevenue: 13500,
    status: "draft",
    deadline: "2024-04-30",
  },
  {
    id: "4",
    year: 2023,
    category: "Actions de formation",
    totalHours: 2180,
    totalTrainees: 165,
    totalRevenue: 112000,
    status: "validated",
    deadline: "2023-04-30",
  },
];

const statusConfig = {
  draft: { label: "Brouillon", color: "bg-muted text-muted-foreground", icon: FileText },
  in_progress: { label: "En cours", color: "bg-amber-500/15 text-amber-600", icon: Clock },
  submitted: { label: "Soumis", color: "bg-blue-500/15 text-blue-600", icon: Upload },
  validated: { label: "Validé", color: "bg-green-500/15 text-green-600", icon: CheckCircle2 },
};

export default function BPFPage() {
  const [selectedYear, setSelectedYear] = useState<string>("2024");

  const filteredEntries = demoBPFEntries.filter(
    (entry) => entry.year.toString() === selectedYear
  );

  const currentYearEntries = demoBPFEntries.filter((e) => e.year === 2024);
  const totalHours = currentYearEntries.reduce((sum, e) => sum + e.totalHours, 0);
  const totalTrainees = currentYearEntries.reduce((sum, e) => sum + e.totalTrainees, 0);
  const totalRevenue = currentYearEntries.reduce((sum, e) => sum + e.totalRevenue, 0);

  const progressPercent = Math.round(
    (currentYearEntries.filter((e) => e.status !== "draft").length /
      currentYearEntries.length) *
      100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Bilan Pédagogique et Financier
          </h1>
          <p className="text-muted-foreground">
            Préparez et suivez votre BPF annuel
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Importer données
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exporter BPF
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      <Card className="border-amber-500 bg-amber-500/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-700">
                Date limite de dépôt : 30 avril 2024
              </p>
              <p className="text-sm text-amber-600">
                Il vous reste 90 jours pour finaliser votre BPF
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heures de formation</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toLocaleString()}h</div>
            <p className="text-xs text-muted-foreground">dispensées en 2024</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stagiaires formés</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalTrainees}</div>
            <p className="text-xs text-muted-foreground">personnes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <Euro className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalRevenue.toLocaleString()} €
            </div>
            <p className="text-xs text-muted-foreground">formation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progression</CardTitle>
            <GraduationCap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{progressPercent}%</div>
            <Progress value={progressPercent} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Year Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* BPF Table */}
      <Card>
        <CardHeader>
          <CardTitle>Détail par catégorie</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Catégorie</TableHead>
                <TableHead>Heures</TableHead>
                <TableHead>Stagiaires</TableHead>
                <TableHead>CA Formation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => {
                const statusInfo = statusConfig[entry.status];
                const StatusIcon = statusInfo.icon;
                return (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {entry.totalHours.toLocaleString()}h
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {entry.totalTrainees}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Euro className="h-3 w-3 text-muted-foreground" />
                        {entry.totalRevenue.toLocaleString()} €
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Modifier
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucune donnée pour cette année
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
