"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, MapPin, ArrowRight, ArrowLeft, Monitor, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface AvailableSession {
  id: string;
  start_date: string;
  end_date: string | null;
  lieu: string;
  format_type: string;
  places_disponibles: number;
  places_max: number;
}

interface StepSessionSelectionProps {
  sessions: AvailableSession[];
  selectedSessionId: string | null;
  onSelect: (sessionId: string) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function StepSessionSelection({
  sessions,
  selectedSessionId,
  onSelect,
  onNext,
  onBack,
  isLoading,
}: StepSessionSelectionProps) {
  // Group sessions by month
  const sessionsByMonth = useMemo(() => {
    const grouped: Record<string, AvailableSession[]> = {};
    sessions.forEach((session) => {
      const monthKey = format(parseISO(session.start_date), "yyyy-MM");
      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(session);
    });
    return grouped;
  }, [sessions]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Choisissez votre session</h3>
          <p className="text-sm text-muted-foreground">Chargement des sessions...</p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-secondary/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Choisissez votre session</h3>
        <p className="text-sm text-muted-foreground">
          Sélectionnez la date qui vous convient parmi les sessions disponibles
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12 bg-secondary/30 rounded-xl border border-dashed">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="font-medium mb-2">Aucune session disponible</p>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Contactez-nous pour organiser une session sur mesure ou être informé des prochaines dates
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-6">
            {Object.entries(sessionsByMonth).map(([month, monthSessions]) => (
              <div key={month}>
                <h4 className="font-medium text-sm text-muted-foreground mb-3 sticky top-0 bg-background py-1 capitalize">
                  {format(parseISO(`${month}-01`), "MMMM yyyy", { locale: fr })}
                </h4>
                <div className="space-y-2">
                  {monthSessions.map((session) => {
                    const isFull = session.places_disponibles <= 0;
                    const isSelected = selectedSessionId === session.id;
                    const placesRestantes = session.places_disponibles;

                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => !isFull && onSelect(session.id)}
                        disabled={isFull}
                        className={cn(
                          "w-full p-4 rounded-lg border text-left transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : isFull
                              ? "border-border bg-secondary/50 opacity-60 cursor-not-allowed"
                              : "border-border hover:border-primary/50 hover:shadow-sm"
                        )}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <p className="font-semibold">
                              {format(parseISO(session.start_date), "EEEE d MMMM", { locale: fr })}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {session.lieu || "À définir"}
                              </span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  session.format_type === "distanciel"
                                    ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                )}
                              >
                                {session.format_type === "distanciel" ? (
                                  <>
                                    <Monitor className="w-3 h-3 mr-1" />
                                    Distanciel
                                  </>
                                ) : (
                                  "Présentiel"
                                )}
                              </Badge>
                            </div>
                          </div>
                          <Badge
                            variant={isFull ? "destructive" : "secondary"}
                            className="shrink-0"
                          >
                            {isFull ? (
                              "Complet"
                            ) : (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {placesRestantes} place{placesRestantes > 1 ? "s" : ""}
                              </span>
                            )}
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedSessionId}
          className="flex-1"
        >
          Continuer
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
