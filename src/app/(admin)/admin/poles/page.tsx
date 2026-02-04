"use client";

import { useState, useMemo } from "react";
import { usePoles, usePoleMutations, type CreatePoleInput } from "@/hooks/admin/usePoles";
import { ColorPicker } from "@/components/ui/color-picker";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Layers,
  Search,
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  MoreVertical,
  Loader2,
  Shield,
  Baby,
  HeartPulse,
  BookOpen,
  Palette,
} from "lucide-react";
import { toast } from "sonner";

// Icônes disponibles pour les pôles
const availableIcons = [
  { name: "Shield", icon: Shield, label: "Bouclier (Sécurité)" },
  { name: "Baby", icon: Baby, label: "Bébé (Petite Enfance)" },
  { name: "HeartPulse", icon: HeartPulse, label: "Coeur (Santé)" },
  { name: "BookOpen", icon: BookOpen, label: "Livre (Formation)" },
  { name: "GraduationCap", icon: GraduationCap, label: "Diplôme" },
];

// Helper pour déterminer si une couleur est claire
function isLightColor(hex: string): boolean {
  if (!hex || !hex.startsWith("#")) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

// Style dynamique pour les badges avec couleur hex
function getPoleBadgeStyle(color: string) {
  if (color?.startsWith("#")) {
    return {
      backgroundColor: color,
      color: isLightColor(color) ? "#000" : "#fff",
      borderColor: color,
    };
  }
  // Fallback pour les anciennes valeurs
  return undefined;
}

// Mapping des noms de classes CSS vers les variables CSS
const CSS_CLASS_TO_COLOR: Record<string, string> = {
  "pole-securite": "hsl(var(--pole-securite))",
  "pole-petite-enfance": "hsl(var(--pole-petite-enfance))",
  "pole-sante": "hsl(var(--pole-sante))",
};

// Obtenir la couleur d'affichage (hex ou variable CSS)
function getDisplayColor(color: string): string {
  if (color?.startsWith("#")) {
    return color;
  }
  return CSS_CLASS_TO_COLOR[color] || "#6366f1";
}

function getIconComponent(iconName: string) {
  const found = availableIcons.find((i) => i.name === iconName);
  return found?.icon || BookOpen;
}

export default function PolesPage() {
  const { data: poles = [], isLoading } = usePoles();
  const { createPole, updatePole, deletePole } = usePoleMutations();

  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPole, setSelectedPole] = useState<typeof poles[0] | null>(null);
  const [formData, setFormData] = useState<Partial<CreatePoleInput>>({
    name: "",
    slug: "",
    color: "#2563eb",
    icon: "BookOpen",
  });

  const filteredPoles = useMemo(() => {
    return poles.filter((pole) =>
      pole.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pole.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [poles, searchQuery]);

  const stats = useMemo(() => ({
    total: poles.length,
  }), [poles]);

  const resetForm = () => {
    setFormData({ name: "", slug: "", color: "#2563eb", icon: "BookOpen" });
  };

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error("Le nom est obligatoire");
      return;
    }
    if (!formData.color) {
      toast.error("La couleur est obligatoire");
      return;
    }
    if (!formData.icon) {
      toast.error("L'icône est obligatoire");
      return;
    }
    try {
      await createPole.mutateAsync(formData as CreatePoleInput);
      toast.success("Pôle créé avec succès");
      setCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la création");
    }
  };

  const handleEdit = (pole: typeof poles[0]) => {
    setSelectedPole(pole);
    setFormData({
      name: pole.name,
      slug: pole.slug,
      color: pole.color,
      icon: pole.icon,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedPole) return;
    try {
      await updatePole.mutateAsync({
        id: selectedPole.id,
        data: formData,
      });
      toast.success("Pôle mis à jour");
      setEditDialogOpen(false);
      setSelectedPole(null);
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la mise à jour");
    }
  };

  const handleDelete = async () => {
    if (!selectedPole) return;
    try {
      await deletePole.mutateAsync(selectedPole.id);
      toast.success("Pôle supprimé");
      setDeleteDialogOpen(false);
      setSelectedPole(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression");
    }
  };

  const renderForm = () => (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom du pôle *</Label>
        <Input
          id="name"
          value={formData.name || ""}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ex: Sécurité & Prévention"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug (URL)</Label>
        <Input
          id="slug"
          value={formData.slug || ""}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="Auto-généré si vide"
        />
        <p className="text-xs text-muted-foreground">
          Laissez vide pour générer automatiquement à partir du nom
        </p>
      </div>

      <div className="space-y-2">
        <Label>Icône *</Label>
        <Select
          value={formData.icon}
          onValueChange={(value) => setFormData({ ...formData, icon: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choisir une icône" />
          </SelectTrigger>
          <SelectContent>
            {availableIcons.map((item) => {
              const IconComponent = item.icon;
              return (
                <SelectItem key={item.name} value={item.name}>
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <ColorPicker
          label="Couleur *"
          value={formData.color || "#2563eb"}
          onChange={(color) => setFormData({ ...formData, color })}
        />
      </div>

      {/* Prévisualisation */}
      {formData.name && formData.color && formData.icon && (
        <div className="space-y-2 pt-4 border-t">
          <Label>Aperçu</Label>
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
            {(() => {
              const IconComponent = getIconComponent(formData.icon);
              return <IconComponent className="h-6 w-6" style={{ color: formData.color }} />;
            })()}
            <div>
              <p className="font-medium">{formData.name}</p>
              <Badge variant="outline" style={getPoleBadgeStyle(formData.color)}>
                {formData.name}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Pôles de formation"
          description="Gérez vos pôles de formation"
          icon={Layers}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className={adminStyles.statsCard}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className={adminStyles.contentCard}>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Pôles de formation"
        description="Créez et gérez vos pôles de formation pour organiser votre catalogue"
        icon={Layers}
        action={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau pôle
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={adminStyles.statsCard}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total pôles</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={adminStyles.statsCard}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Formations</p>
                <p className="text-2xl font-bold">—</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={adminStyles.statsCard}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Palette className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Couleurs</p>
                <p className="text-2xl font-bold">Personnalisées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className={adminStyles.contentCard}>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un pôle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredPoles.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="Aucun pôle"
              description={
                searchQuery
                  ? "Aucun pôle ne correspond à votre recherche"
                  : "Commencez par créer votre premier pôle de formation"
              }
              action={
                !searchQuery && (
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer un pôle
                  </Button>
                )
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pôle</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Couleur</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPoles.map((pole) => {
                  const IconComponent = getIconComponent(pole.icon);
                  return (
                    <TableRow key={pole.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: pole.color?.startsWith("#") ? `${pole.color}20` : undefined }}
                          >
                            <IconComponent className="h-4 w-4" style={{ color: getDisplayColor(pole.color) }} />
                          </div>
                          <div>
                            <p className="font-medium">{pole.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {pole.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: getDisplayColor(pole.color) }}
                          />
                          <code className="text-xs text-muted-foreground">{pole.color}</code>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(pole)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedPole(pole);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
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
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un pôle</DialogTitle>
            <DialogDescription>
              Ajoutez un nouveau pôle de formation pour organiser votre catalogue.
            </DialogDescription>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={createPole.isPending}>
              {createPole.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le pôle</DialogTitle>
            <DialogDescription>
              Modifiez les informations du pôle de formation.
            </DialogDescription>
          </DialogHeader>
          {renderForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={updatePole.isPending}>
              {updatePole.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce pôle ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Si des formations sont associées à ce pôle,
              vous devrez d&apos;abord les réassigner à un autre pôle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePole.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
