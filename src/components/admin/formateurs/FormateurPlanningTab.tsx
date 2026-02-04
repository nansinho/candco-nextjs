"use client";

/**
 * @file FormateurPlanningTab.tsx
 * @description Planning calendar component for formateur availability management
 */

import { useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useFormateurDisponibilites,
  useFormateurPlanningMutations,
  getDisponibiliteTypeInfo,
  type FormateurDisponibilite,
  type DisponibiliteType,
} from "@/hooks/admin/useFormateurPlanning";

interface FormateurPlanningTabProps {
  formateurId: string;
  formateurUserId: string | null;
}

interface DayCell {
  date: Date;
  disponibilite: FormateurDisponibilite | null;
}

const PERIODES = [
  { value: "journee", label: "Journée complète" },
  { value: "matin", label: "Matin" },
  { value: "apres_midi", label: "Après-midi" },
];

export function FormateurPlanningTab({ formateurId, formateurUserId }: FormateurPlanningTabProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDisponibilite, setEditingDisponibilite] = useState<FormateurDisponibilite | null>(null);

  // Form state
  const [formType, setFormType] = useState<DisponibiliteType>("disponible");
  const [formPeriode, setFormPeriode] = useState<string>("journee");
  const [formNotes, setFormNotes] = useState("");

  // Calculate week range
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const userId = formateurUserId || formateurId;

  // Fetch disponibilites
  const { data: disponibilites = [], isLoading } = useFormateurDisponibilites(
    userId,
    format(weekStart, "yyyy-MM-dd"),
    format(weekEnd, "yyyy-MM-dd")
  );

  const { createDisponibilite, updateDisponibilite, deleteDisponibilite } = useFormateurPlanningMutations();

  // Generate days for the week
  const weekDays = useMemo(() => {
    const days: DayCell[] = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const disponibilite = disponibilites.find((d) => d.date === dateStr) || null;
      days.push({ date, disponibilite });
    }
    return days;
  }, [weekStart, disponibilites]);

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate((prev) => (direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1)));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (day: DayCell) => {
    setSelectedDate(day.date);

    if (day.disponibilite) {
      // Edit existing
      setEditingDisponibilite(day.disponibilite);
      setFormType(day.disponibilite.type as DisponibiliteType);
      setFormPeriode(day.disponibilite.periode || "journee");
      setFormNotes(day.disponibilite.notes || "");
    } else {
      // Create new
      setEditingDisponibilite(null);
      setFormType("disponible");
      setFormPeriode("journee");
      setFormNotes("");
    }

    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedDate || !userId) return;

    try {
      if (editingDisponibilite) {
        // Update
        await updateDisponibilite.mutateAsync({
          id: editingDisponibilite.id,
          type: formType,
          periode: formPeriode as "matin" | "apres_midi" | "journee",
          notes: formNotes || null,
        });
        toast.success("Disponibilité mise à jour");
      } else {
        // Create
        await createDisponibilite.mutateAsync({
          user_id: userId,
          date: format(selectedDate, "yyyy-MM-dd"),
          type: formType,
          periode: formPeriode as "matin" | "apres_midi" | "journee",
          notes: formNotes || null,
        });
        toast.success("Disponibilité ajoutée");
      }

      setEditDialogOpen(false);
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async () => {
    if (!editingDisponibilite) return;

    try {
      await deleteDisponibilite.mutateAsync(editingDisponibilite.id);
      toast.success("Disponibilité supprimée");
      setEditDialogOpen(false);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const isPending = createDisponibilite.isPending || updateDisponibilite.isPending || deleteDisponibilite.isPending;

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <Card className="border-0 bg-secondary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Planning des disponibilités
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Aujourd'hui
              </Button>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={() => navigateWeek("prev")}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[200px] text-center text-sm font-medium">
                  {format(weekStart, "d MMM", { locale: fr })} - {format(weekEnd, "d MMM yyyy", { locale: fr })}
                </span>
                <Button variant="ghost" size="icon" onClick={() => navigateWeek("next")}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">Légende:</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span>Partiel</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Indisponible</span>
        </div>
      </div>

      {/* Calendar grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Day cells */}
          {weekDays.map((day) => {
            const isToday = isSameDay(day.date, new Date());
            const typeInfo = day.disponibilite
              ? getDisponibiliteTypeInfo(day.disponibilite.type as DisponibiliteType)
              : null;

            return (
              <Card
                key={day.date.toISOString()}
                className={cn(
                  "border cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                  isToday && "ring-2 ring-primary",
                  day.disponibilite && typeInfo?.bgColor
                )}
                onClick={() => handleDayClick(day)}
              >
                <CardContent className="p-3 min-h-[100px]">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        "text-sm font-medium",
                        isToday && "text-primary"
                      )}>
                        {format(day.date, "d")}
                      </span>
                      {!day.disponibilite && (
                        <Plus className="h-3 w-3 text-muted-foreground opacity-50" />
                      )}
                    </div>

                    {day.disponibilite && typeInfo && (
                      <div className="flex-1 flex flex-col justify-center">
                        <Badge
                          variant="outline"
                          className={cn("text-xs justify-center", typeInfo.textColor, typeInfo.borderColor)}
                        >
                          {typeInfo.label}
                        </Badge>
                        {day.disponibilite.periode && day.disponibilite.periode !== "journee" && (
                          <span className="text-xs text-muted-foreground text-center mt-1">
                            {day.disponibilite.periode === "matin" ? "Matin" : "Après-midi"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDisponibilite ? "Modifier" : "Ajouter"} la disponibilité
            </DialogTitle>
            <DialogDescription>
              {selectedDate && format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type de disponibilité</Label>
              <Select value={formType} onValueChange={(v) => setFormType(v as DisponibiliteType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Disponible
                    </div>
                  </SelectItem>
                  <SelectItem value="partiel">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      Partiellement disponible
                    </div>
                  </SelectItem>
                  <SelectItem value="indisponible">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Indisponible
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Période</Label>
              <Select value={formPeriode} onValueChange={setFormPeriode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes (optionnel)</Label>
              <Textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Ajouter une note..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div>
              {editingDisponibilite && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingDisponibilite ? "Mettre à jour" : "Ajouter"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
