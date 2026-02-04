"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useFormations, useFormationMutations, type FormationWithData } from "@/hooks/admin/useFormations";
import { usePoles } from "@/hooks/admin/usePoles";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GraduationCap,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Loader2,
} from "lucide-react";

export default function AdminFormations() {
  const router = useRouter();
  const { data: formations = [], isLoading } = useFormations();
  const { data: polesData = [] } = usePoles();
  const { deleteFormation, toggleActive } = useFormationMutations();

  const [search, setSearch] = useState("");
  const [filterPole, setFilterPole] = useState("all");
  const [filterActive, setFilterActive] = useState("all");

  // Couleurs hardcodées pour les pôles - correspondant au site vitrine
  const POLE_COLORS: Record<string, { bg: string; text: string }> = {
    "petite-enfance": { bg: "#8B5CF6", text: "#fff" },  // Violet
    "securite": { bg: "#F97316", text: "#fff" },        // Orange
    "sante": { bg: "#10B981", text: "#fff" },           // Vert
  };

  // Créer un mapping dynamique des couleurs de pôles depuis la DB
  // avec fallback sur les couleurs hardcodées
  const poleColors = useMemo(() => {
    const colors: Record<string, { classes: string; style: React.CSSProperties }> = {};

    // D'abord ajouter les couleurs hardcodées comme base
    Object.entries(POLE_COLORS).forEach(([slug, color]) => {
      colors[slug] = {
        classes: "",
        style: { backgroundColor: color.bg, color: color.text, borderColor: color.bg },
      };
    });

    // Ensuite override avec les couleurs de la DB si disponibles
    polesData.forEach((pole) => {
      if (pole.color?.startsWith("#")) {
        const isLight = (hex: string) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return (r * 299 + g * 587 + b * 114) / 1000 > 128;
        };
        colors[pole.slug] = {
          classes: "",
          style: {
            backgroundColor: pole.color,
            color: isLight(pole.color) ? "#000" : "#fff",
            borderColor: pole.color
          },
        };
      }
    });
    return colors;
  }, [polesData]);

  // Get unique poles from formations (pour le filtre)
  const poles = useMemo(() => {
    const uniquePoles = new Map<string, string>();
    formations.forEach((f) => {
      if (f.pole && !uniquePoles.has(f.pole)) {
        uniquePoles.set(f.pole, f.pole_name || f.pole);
      }
    });
    return Array.from(uniquePoles.entries());
  }, [formations]);

  // Filter formations
  const filteredFormations = useMemo(() => {
    return formations.filter((formation) => {
      const matchesSearch = formation.title.toLowerCase().includes(search.toLowerCase());
      const matchesPole = filterPole === "all" || formation.pole === filterPole;
      const matchesActive =
        filterActive === "all" ||
        (filterActive === "active" && formation.active) ||
        (filterActive === "inactive" && !formation.active);
      return matchesSearch && matchesPole && matchesActive;
    });
  }, [formations, search, filterPole, filterActive]);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) return;
    await deleteFormation.mutateAsync(id);
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    await toggleActive.mutateAsync({ id, active });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminPageHeader
        icon={GraduationCap}
        title="Formations"
        description="Gérez le catalogue des formations"
      >
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Nouvelle formation</span>
          <span className="sm:hidden">Ajouter</span>
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
              <p className="text-2xl font-semibold">{formations.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Actives</p>
              <p className="text-2xl font-semibold text-emerald-600">
                {formations.filter((f) => f.active).length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Inactives</p>
              <p className="text-2xl font-semibold text-muted-foreground">
                {formations.filter((f) => !f.active).length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-secondary/30">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Avec sessions</p>
              <p className="text-2xl font-semibold text-blue-600">
                {formations.filter((f) => f.sessions_count > 0).length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une formation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterPole} onValueChange={setFilterPole}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Pôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les pôles</SelectItem>
            {poles.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterActive} onValueChange={setFilterActive}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actives</SelectItem>
            <SelectItem value="inactive">Inactives</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredFormations.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Aucune formation trouvée"
          description={search || filterPole !== "all" || filterActive !== "all"
            ? "Modifiez vos filtres pour voir plus de résultats"
            : "Créez votre première formation"}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className={adminStyles.tableRowHeader}>
                  <TableHead className={adminStyles.tableHead}>#</TableHead>
                  <TableHead className={adminStyles.tableHead}>Formation</TableHead>
                  <TableHead className={adminStyles.tableHead}>Pôle</TableHead>
                  <TableHead className={adminStyles.tableHead}>Durée</TableHead>
                  <TableHead className={adminStyles.tableHead}>Prix</TableHead>
                  <TableHead className={adminStyles.tableHead}>Sessions</TableHead>
                  <TableHead className={adminStyles.tableHead}>Active</TableHead>
                  <TableHead className={`${adminStyles.tableHead} text-right`}>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFormations.map((formation, index) => (
                  <TableRow
                    key={formation.id}
                    className={`${adminStyles.tableRowClickable} ${!formation.active ? "opacity-60" : ""}`}
                    onClick={() => router.push(`/admin/formations/${formation.id}`)}
                  >
                    <TableCell className={`${adminStyles.tableCell} text-muted-foreground`}>
                      {index + 1}
                    </TableCell>
                    <TableCell className={`${adminStyles.tableCell} font-medium max-w-[250px]`}>
                      <span className="truncate block">{formation.title}</span>
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={poleColors[formation.pole]?.style || { backgroundColor: "#6366f1", color: "#fff" }}
                      >
                        {formation.pole_name}
                      </span>
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {formation.duration || "-"}
                      </div>
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      {formation.price ? `${formation.price}€` : "-"}
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {formation.sessions_count}
                      </div>
                    </TableCell>
                    <TableCell className={adminStyles.tableCell}>
                      <Switch
                        checked={formation.active}
                        onCheckedChange={(checked) => handleToggleActive(formation.id, checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
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
                          onClick={() => window.open(`/formations/${formation.pole}/${formation.slug}`, "_blank")}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={adminStyles.tableActionButton}
                          onClick={() => router.push(`/admin/formations/${formation.id}/edit`)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`${adminStyles.tableActionButton} text-destructive`}
                          onClick={() => handleDelete(formation.id)}
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
            {filteredFormations.map((formation) => (
              <Card
                key={formation.id}
                className={`border-0 bg-secondary/30 cursor-pointer ${!formation.active ? "opacity-60" : ""}`}
                onClick={() => router.push(`/admin/formations/${formation.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{formation.title}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                          style={poleColors[formation.pole]?.style || { backgroundColor: "#6366f1", color: "#fff" }}
                        >
                          {formation.pole_name}
                        </span>
                        {formation.duration && (
                          <span className="text-xs text-muted-foreground">
                            {formation.duration}
                          </span>
                        )}
                        {formation.price && (
                          <span className="text-xs text-muted-foreground">
                            {formation.price}€
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formation.sessions_count} session(s)
                      </div>
                    </div>
                    <Switch
                      checked={formation.active}
                      onCheckedChange={(checked) => handleToggleActive(formation.id, checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
