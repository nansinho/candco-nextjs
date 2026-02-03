"use client";

import { Button } from "@/components/ui/button";
import { User, Building2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepTypeSelectionProps {
  value: "particulier" | "entreprise" | null;
  onChange: (type: "particulier" | "entreprise") => void;
  onNext: () => void;
}

export function StepTypeSelection({ value, onChange, onNext }: StepTypeSelectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Type d'inscription</h3>
        <p className="text-sm text-muted-foreground">
          Sélectionnez votre profil pour personnaliser votre parcours
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange("particulier")}
          className={cn(
            "p-6 rounded-xl border-2 text-left transition-all hover:shadow-md",
            value === "particulier"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/50"
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-primary" />
          </div>
          <h4 className="font-semibold mb-1">Particulier</h4>
          <p className="text-sm text-muted-foreground">
            Inscription individuelle pour vous-même
          </p>
        </button>

        <button
          type="button"
          onClick={() => onChange("entreprise")}
          className={cn(
            "p-6 rounded-xl border-2 text-left transition-all hover:shadow-md",
            value === "entreprise"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border hover:border-primary/50"
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <h4 className="font-semibold mb-1">Entreprise</h4>
          <p className="text-sm text-muted-foreground">
            Inscription pour un ou plusieurs collaborateurs
          </p>
        </button>
      </div>

      <Button onClick={onNext} disabled={!value} className="w-full">
        Continuer
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
