"use client";

/**
 * @file FormateursPlanningTab.tsx
 * @description Global planning view showing all formateurs' availability
 * Features: Week/month view, all formateurs in rows, days in columns, drag-select
 */

import { useState, useMemo, useCallback } from "react";
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay, isWithinInterval, min, max, startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Loader2,
  MousePointer2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useFormateurs, type Formateur } from "@/hooks/admin/useFormateurs";
import {
  useAllFormateursDisponibilites,
  useFormateurPlanningMutations,
  getDisponibiliteTypeInfo,
  type DisponibiliteType,
} from "@/hooks/admin/useFormateurPlanning";

type ViewMode = "semaine" | "mois";

const PERIODES = [
  { value: "journee", label: "Journée complète" },
  { value: "matin", label: "Matin" },
  { value: "apres_midi", label: "Après-midi" },
];

export function FormateursPlanningTab() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("semaine");
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Selection state for drag-select
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{ formateurId: string; date: Date } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ formateurId: string; date: Date } | null>(null);
  const [selectedCells, setSelectedCells] = useState<{ formateurId: string; userId: string; dates: Date[] } | null>(null);

  // Form state
  const [formType, setFormType] = useState<DisponibiliteType>("disponible");
  const [formPeriode, setFormPeriode] = useState<string>("journee");
  const [formNotes, setFormNotes] = useState("");

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    if (viewMode === "semaine") {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 }),
      };
    } else {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
      };
    }
  }, [currentDate, viewMode]);

  // Fetch formateurs and disponibilites
  const { data: formateurs = [], isLoading: formateursLoading } = useFormateurs();
  const { data: disponibilites = [], isLoading: dispoLoading } = useAllFormateursDisponibilites(
    format(dateRange.start, "yyyy-MM-dd"),
    format(dateRange.end, "yyyy-MM-dd")
  );

  const { bulkCreateDisponibilites } = useFormateurPlanningMutations();

  // Filter only active formateurs
  const activeFormateurs = useMemo(() => {
    return formateurs.filter(f => f.active);
  }, [formateurs]);

  // Generate days for the current view
  const days = useMemo(() => {
    const result: Date[] = [];
    let current = dateRange.start;
    while (current <= dateRange.end) {
      result.push(new Date(current));
      current = addDays(current, 1);
    }
    return result;
  }, [dateRange]);

  // Group disponibilites by formateur and date
  const dispoMap = useMemo(() => {
    const map = new Map<string, Map<string, typeof disponibilites[0]>>();
    disponibilites.forEach((d) => {
      const userId = d.user_id;
      if (!map.has(userId)) {
        map.set(userId, new Map());
      }
      map.get(userId)!.set(d.date, d);
    });
    return map;
  }, [disponibilites]);

  const navigate = (direction: "prev" | "next") => {
    if (viewMode === "semaine") {
      setCurrentDate((prev) => (direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1)));
    } else {
      setCurrentDate((prev) => (direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get disponibilite for a formateur on a specific date
  const getDispoForCell = (formateurId: string, userId: string | null, date: Date) => {
    const id = userId || formateurId;
    const dateStr = format(date, "yyyy-MM-dd");
    return dispoMap.get(id)?.get(dateStr) || null;
  };

  // Check if a cell is in current selection
  const isCellInSelection = useCallback((formateurId: string, date: Date) => {
    if (!isSelecting || !selectionStart || !selectionEnd) return false;
    if (selectionStart.formateurId !== formateurId) return false;

    const rangeStart = min([selectionStart.date, selectionEnd.date]);
    const rangeEnd = max([selectionStart.date, selectionEnd.date]);
    return isWithinInterval(date, { start: rangeStart, end: rangeEnd });
  }, [isSelecting, selectionStart, selectionEnd]);

  // Mouse handlers for drag-select
  const handleMouseDown = (formateur: Formateur, date: Date, hasExisting: boolean) => {
    if (hasExisting) return;

    setIsSelecting(true);
    setSelectionStart({ formateurId: formateur.id, date });
    setSelectionEnd({ formateurId: formateur.id, date });
  };

  const handleMouseEnter = (formateur: Formateur, date: Date) => {
    if (isSelecting && selectionStart && selectionStart.formateurId === formateur.id) {
      setSelectionEnd({ formateurId: formateur.id, date });
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selectionStart && selectionEnd && selectionStart.formateurId === selectionEnd.formateurId) {
      const formateur = activeFormateurs.find(f => f.id === selectionStart.formateurId);
      if (!formateur) return;

      const rangeStart = min([selectionStart.date, selectionEnd.date]);
      const rangeEnd = max([selectionStart.date, selectionEnd.date]);

      const dates: Date[] = [];
      let current = rangeStart;
      while (current <= rangeEnd) {
        const dispo = getDispoForCell(formateur.id, formateur.user_id, current);
        if (!dispo) {
          dates.push(new Date(current));
        }
        current = addDays(current, 1);
      }

      if (dates.length > 0) {
        setSelectedCells({
          formateurId: formateur.id,
          userId: formateur.user_id || formateur.id,
          dates,
        });
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

  const handleSave = async () => {
    if (!selectedCells || selectedCells.dates.length === 0) return;

    try {
      await bulkCreateDisponibilites.mutateAsync(
        selectedCells.dates.map((date) => ({
          user_id: selectedCells.userId,
          date: format(date, "yyyy-MM-dd"),
          type: formType,
          periode: formPeriode as "matin" | "apres_midi" | "journee",
          notes: formNotes || null,
        }))
      );
      toast.success(`${selectedCells.dates.length} disponibilité(s) ajoutée(s)`);
      setEditDialogOpen(false);
      setSelectedCells(null);
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const isLoading = formateursLoading || dispoLoading;

  const getInitials = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Aujourd'hui
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[200px] text-center text-sm font-medium">
              {viewMode === "semaine"
                ? `${format(dateRange.start, "d MMM", { locale: fr })} - ${format(dateRange.end, "d MMM yyyy", { locale: fr })}`
                : format(currentDate, "MMMM yyyy", { locale: fr })}
            </span>
            <Button variant="ghost" size="icon" onClick={() => navigate("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="semaine">Semaine</TabsTrigger>
              <TabsTrigger value="mois">Mois</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Legend */}
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
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Formation</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <MousePointer2 className="h-3 w-3" />
          <span>Glisser pour sélectionner plusieurs jours</span>
        </div>
      </div>

      {/* Planning Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : activeFormateurs.length === 0 ? (
        <Card className="border-0 bg-secondary/30">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Aucun formateur actif</p>
          </CardContent>
        </Card>
      ) : (
        <div
          className="overflow-x-auto select-none"
          onMouseLeave={() => isSelecting && handleMouseUp()}
          onMouseUp={handleMouseUp}
        >
          <table className="w-full border-collapse min-w-max">
            <thead>
              <tr>
                <th className="sticky left-0 bg-background z-10 p-2 text-left min-w-[200px] border-b">
                  Formateur
                </th>
                {days.map((day) => {
                  const isToday = isSameDay(day, new Date());
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <th
                      key={day.toISOString()}
                      className={cn(
                        "p-1 text-center min-w-[60px] border-b text-xs font-medium",
                        isToday && "bg-primary/10",
                        isWeekend && "bg-muted/30"
                      )}
                    >
                      <div>{format(day, "EEE", { locale: fr })}</div>
                      <div className={cn(
                        "text-lg",
                        isToday && "text-primary font-bold"
                      )}>
                        {format(day, "d")}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {activeFormateurs.map((formateur) => (
                <tr key={formateur.id} className="border-b hover:bg-muted/20">
                  <td
                    className="sticky left-0 bg-background z-10 p-2 cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/admin/formateurs/${formateur.id}`)}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10">
                          {getInitials(formateur.nom, formateur.prenom)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {formateur.prenom} {formateur.nom}
                        </p>
                        {formateur.specialites && formateur.specialites.length > 0 && (
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {formateur.specialites[0]}
                            {formateur.specialites.length > 1 && ` +${formateur.specialites.length - 1}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  {days.map((day) => {
                    const dispo = getDispoForCell(formateur.id, formateur.user_id, day);
                    const typeInfo = dispo ? getDisponibiliteTypeInfo(dispo.type as DisponibiliteType) : null;
                    const isToday = isSameDay(day, new Date());
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    const isInSelection = isCellInSelection(formateur.id, day);

                    return (
                      <td
                        key={day.toISOString()}
                        className={cn(
                          "p-1 text-center cursor-pointer transition-all border-l",
                          isToday && "bg-primary/5",
                          isWeekend && !dispo && "bg-muted/20",
                          dispo && typeInfo?.bgColor,
                          isInSelection && "ring-2 ring-blue-500 ring-inset bg-blue-500/20",
                          !dispo && "hover:bg-muted/40"
                        )}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleMouseDown(formateur, day, !!dispo);
                        }}
                        onMouseEnter={() => handleMouseEnter(formateur, day)}
                      >
                        {dispo && typeInfo && (
                          <div className="h-8 flex items-center justify-center">
                            <span className={cn("text-xs font-medium", typeInfo.textColor)}>
                              {dispo.type === "disponible" ? "D" : dispo.type === "partiel" ? "P" : "I"}
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) setSelectedCells(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCells && selectedCells.dates.length > 1
                ? `Ajouter ${selectedCells.dates.length} disponibilités`
                : "Ajouter une disponibilité"
              }
            </DialogTitle>
            <DialogDescription>
              {selectedCells && (() => {
                const formateur = activeFormateurs.find(f => f.id === selectedCells.formateurId);
                const sortedDates = [...selectedCells.dates].sort((a, b) => a.getTime() - b.getTime());
                const first = sortedDates[0];
                const last = sortedDates[sortedDates.length - 1];
                return (
                  <>
                    <span className="font-medium">{formateur?.prenom} {formateur?.nom}</span>
                    <br />
                    {selectedCells.dates.length === 1
                      ? format(first, "EEEE d MMMM yyyy", { locale: fr })
                      : `${format(first, "d MMM", { locale: fr })} - ${format(last, "d MMM yyyy", { locale: fr })}`
                    }
                  </>
                );
              })()}
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={bulkCreateDisponibilites.isPending}>
              {bulkCreateDisponibilites.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedCells && selectedCells.dates.length > 1
                ? `Ajouter ${selectedCells.dates.length} jours`
                : "Ajouter"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
