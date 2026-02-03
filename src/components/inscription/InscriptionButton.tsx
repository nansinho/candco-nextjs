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
}

export function InscriptionButton({
  formation,
  variant = "default",
  size = "default",
  className,
  fullWidth = true,
}: InscriptionButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={fullWidth ? `w-full ${className || ""}` : className}
      >
        S'inscrire
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>

      <InscriptionWizard
        open={open}
        onOpenChange={setOpen}
        formation={formation}
      />
    </>
  );
}
