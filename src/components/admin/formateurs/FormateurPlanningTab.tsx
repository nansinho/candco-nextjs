"use client";

/**
 * @file FormateurPlanningTab.tsx
 * @description Planning calendar component for formateur availability management
 * Features: Week view, drag-select for date ranges, create/edit/delete disponibilités
 */

import { useState, useMemo, useCallback } from "react";
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay, isWithinInterval, min, max } from "date-fns";
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
  MousePointer2,
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDisponibilite, setEditingDisponibilite] = useState<FormateurDisponibilite | null>(null);

  // Selection state for drag-select
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

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

  const {
    createDisponibilite,
    updateDisponibilite,
    deleteDisponibilite,
    bulkCreateDisponibilites
  } = useFormateurPlanningMutations();

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

  // Check if a date is within current selection range
  const isDateInSelection = useCallback((date: Date) => {
    if (!selectionStart || !selectionEnd) return false;
    const rangeStart = min([selectionStart, selectionEnd]);
    const rangeEnd = max([selectionStart, selectionEnd]);
    return isWithinInterval(date, { start: rangeStart, end: rangeEnd });
  }, [selectionStart, selectionEnd]);

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate((prev) => (direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1)));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Single click on a day (with existing disponibilité)
  const handleDayClick = (day: DayCell) => {
    // If already has disponibilite, edit it
    if (day.disponibilite) {
      setSelectedDates([day.date]);
      setEditingDisponibilite(day.disponibilite);
      setFormType(day.disponibilite.type as DisponibiliteType);
      setFormPeriode(day.disponibilite.periode || "journee");
      setFormNotes(day.disponibilite.notes || "");
      setEditDialogOpen(true);
    }
  };

  // Mouse down - start selection
  const handleMouseDown = (day: DayCell, e: React.MouseEvent) => {
    // Don't start selection if clicking on existing disponibilite
    if (day.disponibilite) return;

    e.preventDefault();
    setIsSelecting(true);
    setSelectionStart(day.date);
    setSelectionEnd(day.date);
  };

  // Mouse enter during selection
  const handleMouseEnter = (day: DayCell) => {
    if (isSelecting && selectionStart) {
      setSelectionEnd(day.date);
    }
  };

  // Mouse up - end selection
  const handleMouseUp = () => {
    if (isSelecting && selectionStart && selectionEnd) {
      // Calculate all selected dates
      const rangeStart = min([selectionStart, selectionEnd]);
      const rangeEnd = max([selectionStart, selectionEnd]);

      const dates: Date[] = [];
      let current = rangeStart;
      while (current <= rangeEnd) {
        // Only add dates that don't have existing disponibilite
        const dateStr = format(current, "yyyy-MM-dd");
        const hasExisting = disponibilites.some((d) => d.date === dateStr);
        if (!hasExisting) {
          dates.push(new Date(current));
        }
        current = addDays(current, 1);
      }

      if (dates.length > 0) {
        setSelectedDates(dates);
        setEditingDisponibilite(null);
        setFormType("disponible");
        setFormPeriode("journee");
        setFormNotes("");
        setEditDialogOpen(true);
      }
    }

    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  // Handle mouse leave from grid
  const handleMouseLeave = () => {
    if (isSelecting) {
      handleMouseUp();
    }
  };

  const handleSave = async () => {
    if (selectedDates.length === 0 || !userId) return;

    try {
      if (editingDisponibilite) {
        // Update single existing disponibilite
        await updateDisponibilite.mutateAsync({
          id: editingDisponibilite.id,
          type: formType,
          periode: formPeriode as "matin" | "apres_midi" | "journee",
          notes: formNotes || null,
        });
        toast.success("Disponibilité mise à jour");
      } else if (selectedDates.length === 1) {
        // Create single disponibilite
        await createDisponibilite.mutateAsync({
          user_id: userId,
          date: format(selectedDates[0], "yyyy-MM-dd"),
          type: formType,
          periode: formPeriode as "matin" | "apres_midi" | "journee",
          notes: formNotes || null,
        });
        toast.success("Disponibilité ajoutée");
      } else {
        // Bulk create for multiple dates
        await bulkCreateDisponibilites.mutateAsync(
          selectedDates.map((date) => ({
            user_id: userId,
            date: format(date, "yyyy-MM-dd"),
            type: formType,
            periode: formPeriode as "matin" | "apres_midi" | "journee",
            notes: formNotes || null,
          }))
        );
        toast.success(`${selectedDates.length} disponibilités ajoutées`);
      }

      setEditDialogOpen(false);
      setSelectedDates([]);
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
      setSelectedDates([]);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const isPending = createDisponibilite.isPending || updateDisponibilite.isPending || deleteDisponibilite.isPending || bulkCreateDisponibilites.isPending;

  // Format selected dates for dialog description
  const getSelectionDescription = () => {
    if (selectedDates.length === 0) return "";
    if (selectedDates.length === 1) {
      return format(selectedDates[0], "EEEE d MMMM yyyy", { locale: fr });
    }
    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    const first = sortedDates[0];
    const last = sortedDates[sortedDates.length - 1];
    return `${format(first, "d MMM", { locale: fr })} - ${format(last, "d MMM yyyy", { locale: fr })} (${selectedDates.length} jours)`;
  };

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <Card className="border-0 bg-secondary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
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

      {/* Legend and instructions */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-4">
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
        <div className="flex items-center gap-1 text-muted-foreground">
          <MousePointer2 className="h-3 w-3" />
          <span>Glisser pour sélectionner plusieurs jours</span>
        </div>
      </div>

      {/* Calendar grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div
          className="grid grid-cols-7 gap-2 select-none"
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
        >
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
            const isInSelection = isSelecting && isDateInSelection(day.date) && !day.disponibilite;

            return (
              <Card
                key={day.date.toISOString()}
                className={cn(
                  "border cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                  isToday && "ring-2 ring-primary",
                  day.disponibilite && typeInfo?.bgColor,
                  isInSelection && "ring-2 ring-blue-500 bg-blue-500/20"
                )}
                onClick={() => handleDayClick(day)}
                onMouseDown={(e) => handleMouseDown(day, e)}
                onMouseEnter={() => handleMouseEnter(day)}
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

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) setSelectedDates([]);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDisponibilite
                ? "Modifier la disponibilité"
                : selectedDates.length > 1
                  ? `Ajouter ${selectedDates.length} disponibilités`
                  : "Ajouter une disponibilité"
              }
            </DialogTitle>
            <DialogDescription>
              {getSelectionDescription()}
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
                {editingDisponibilite
                  ? "Mettre à jour"
                  : selectedDates.length > 1
                    ? `Ajouter ${selectedDates.length} jours`
                    : "Ajouter"
                }
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
