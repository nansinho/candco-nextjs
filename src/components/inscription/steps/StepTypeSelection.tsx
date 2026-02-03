"use client";

import { Button } from "@/components/ui/button";
import { User, Building2, ArrowRight, Calendar, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayPicker, DateRange } from "react-day-picker";
import { fr } from "date-fns/locale";
import { format, differenceInDays } from "date-fns";
import "react-day-picker/style.css";

export interface ProposedDateRange {
  from: Date;
  to: Date;
}

interface StepTypeSelectionProps {
  value: "particulier" | "entreprise" | null;
  onChange: (type: "particulier" | "entreprise") => void;
  onNext: () => void;
  proposedDates: ProposedDateRange | null;
  onDatesChange: (dates: ProposedDateRange | null) => void;
}

export function StepTypeSelection({
  value,
  onChange,
  onNext,
  proposedDates,
  onDatesChange,
}: StepTypeSelectionProps) {
  const handleDateSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      // Limit to 14 days max
      const days = differenceInDays(range.to, range.from) + 1;
      if (days <= 14) {
        onDatesChange({ from: range.from, to: range.to });
      }
    } else if (range?.from && !range?.to) {
      // Single day selected, waiting for end date
      onDatesChange(null);
    } else {
      onDatesChange(null);
    }
  };

  const daysDiff = proposedDates
    ? differenceInDays(proposedDates.to, proposedDates.from) + 1
    : 0;

  return (
    <div className="space-y-5">
      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="font-semibold text-amber-700">Proposer vos dates</p>
            <p className="text-sm text-amber-600/80 mt-0.5">
              Nous vérifierons la disponibilité et vous recontacterons rapidement.
            </p>
          </div>
        </div>
      </div>

      {/* Date Selection */}
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Sélectionnez vos dates (1-14 jours)
        </h4>
        <div className="flex justify-center border rounded-xl p-2 bg-secondary/30">
          <DayPicker
            mode="range"
            selected={
              proposedDates
                ? { from: proposedDates.from, to: proposedDates.to }
                : undefined
            }
            onSelect={handleDateSelect}
            locale={fr}
            numberOfMonths={1}
            disabled={{ before: new Date() }}
            classNames={{
              root: "text-sm",
              day: "h-8 w-8 rounded-md",
              selected: "bg-primary text-primary-foreground",
              today: "font-bold text-primary",
            }}
          />
        </div>
        {proposedDates && (
          <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm font-medium text-primary">
              Période sélectionnée
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {format(proposedDates.from, "d MMMM yyyy", { locale: fr })} →{" "}
              {format(proposedDates.to, "d MMMM yyyy", { locale: fr })}{" "}
              <span className="text-primary font-medium">
                ({daysDiff} jour{daysDiff > 1 ? "s" : ""})
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Type Selection */}
      <div>
        <h4 className="text-sm font-medium mb-2">
          Type d'inscription <span className="text-destructive">*</span>
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange("particulier")}
            className={cn(
              "p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
              value === "particulier"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-semibold text-sm mb-0.5">Particulier</h4>
            <p className="text-xs text-muted-foreground">
              Inscription individuelle
            </p>
          </button>

          <button
            type="button"
            onClick={() => onChange("entreprise")}
            className={cn(
              "p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
              value === "entreprise"
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h4 className="font-semibold text-sm mb-0.5">Entreprise</h4>
            <p className="text-xs text-muted-foreground">
              Un ou plusieurs collaborateurs
            </p>
          </button>
        </div>
      </div>

      <Button onClick={onNext} disabled={!value} className="w-full">
        Continuer
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
