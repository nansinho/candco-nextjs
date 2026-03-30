"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { InscriptionWizard } from "./InscriptionWizard";

interface InscriptionButtonProps {
  formation: {
    id: string;
    title: string;
    price?: string | null;
  };
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
  fullWidth?: boolean;
  mode?: "inscription" | "devis";
  label?: string;
}

export function InscriptionButton({
  formation,
  variant = "default",
  size = "default",
  className,
  fullWidth = true,
  mode = "inscription",
  label,
}: InscriptionButtonProps) {
  const [open, setOpen] = useState(false);

  const defaultLabel = mode === "devis" ? "Demander un devis" : "S'inscrire";

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={fullWidth ? `w-full ${className || ""}` : className}
      >
        {label || defaultLabel}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      <InscriptionWizard
        open={open}
        onOpenChange={setOpen}
        formation={formation}
        mode={mode}
      />
    </>
  );
}
