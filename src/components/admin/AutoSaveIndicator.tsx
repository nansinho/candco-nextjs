"use client";

/**
 * @file AutoSaveIndicator.tsx
 * @description Visual indicator for auto-save status in forms
 */

import { Cloud, CloudOff, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AutoSaveStatus } from "@/hooks/useFormPersistence";

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  lastSavedAt: Date | null;
  className?: string;
}

export function AutoSaveIndicator({ status, lastSavedAt, className }: AutoSaveIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "saving":
        return {
          icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
          text: "Sauvegarde...",
          color: "text-muted-foreground",
        };
      case "saved":
        return {
          icon: <Check className="h-3.5 w-3.5" />,
          text: lastSavedAt
            ? `Sauvegardé à ${lastSavedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
            : "Sauvegardé",
          color: "text-green-600 dark:text-green-400",
        };
      case "error":
        return {
          icon: <CloudOff className="h-3.5 w-3.5" />,
          text: "Erreur de sauvegarde",
          color: "text-destructive",
        };
      default:
        return {
          icon: <Cloud className="h-3.5 w-3.5" />,
          text: "Brouillon local",
          color: "text-muted-foreground",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs transition-colors duration-200",
        config.color,
        className
      )}
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
}
