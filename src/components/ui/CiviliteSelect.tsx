/**
 * @file CiviliteSelect.tsx
 * @description Composant réutilisable pour sélectionner la civilité (Madame/Monsieur)
 * Utilise un RadioGroup horizontal avec des boutons stylisés
 */

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CiviliteSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const civiliteOptions = [
  { value: "Mme", label: "Madame" },
  { value: "M.", label: "Monsieur" },
] as const;

export function CiviliteSelect({
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className,
}: CiviliteSelectProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className={cn(error && "text-destructive")}>
        Civilité {required && <span className="text-destructive">*</span>}
      </Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className="flex gap-3"
      >
        {civiliteOptions.map((option) => (
          <div key={option.value} className="flex-1">
            <RadioGroupItem
              value={option.value}
              id={`civilite-${option.value}`}
              className="peer sr-only"
            />
            <Label
              htmlFor={`civilite-${option.value}`}
              className={cn(
                "flex items-center justify-center px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium",
                "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5",
                "hover:border-primary/50",
                disabled && "opacity-50 cursor-not-allowed",
                error && "border-destructive/50"
              )}
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

export default CiviliteSelect;
