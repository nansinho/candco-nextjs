/**
 * @file swipe-hint.tsx
 * @description Composant réutilisable pour indiquer visuellement aux utilisateurs
 * qu'ils peuvent swiper horizontalement. S'affiche une seule fois puis disparaît.
 */

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeHintProps {
  /** Clé localStorage pour persister l'état "vu" */
  storageKey: string;
  /** Direction du swipe (horizontal par défaut) */
  direction?: "horizontal" | "vertical";
  /** Classes CSS additionnelles */
  className?: string;
  /** Callback quand le hint est dismissed */
  onDismiss?: () => void;
}

/**
 * Hook pour gérer l'état du hint de swipe
 * Retourne show (boolean) et dismiss (function)
 */
export function useSwipeHint(storageKey: string) {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem(storageKey);
  });

  const dismiss = useCallback(() => {
    setShow(false);
    localStorage.setItem(storageKey, "true");
  }, [storageKey]);

  // Auto-dismiss après 5 secondes
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      dismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [show, dismiss]);

  return { show, dismiss };
}

/**
 * Composant d'overlay avec flèches animées pour indiquer le swipe
 * Se positionne en absolute par rapport à son parent
 */
export function SwipeHint({
  storageKey,
  direction = "horizontal",
  className,
  onDismiss,
}: SwipeHintProps) {
  const { show, dismiss } = useSwipeHint(storageKey);

  useEffect(() => {
    if (!show && onDismiss) {
      onDismiss();
    }
  }, [show, onDismiss]);

  if (!show) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-1",
        className
      )}
    >
      {direction === "horizontal" && (
        <>
          <div className="animate-bounce-x-reverse">
            <ChevronLeft className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <div className="animate-bounce-x">
            <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Version inline du hint (sans positionnement absolu)
 * Pour afficher sous un carrousel par exemple
 */
export function SwipeHintInline({
  storageKey,
  className,
}: {
  storageKey: string;
  className?: string;
}) {
  const { show } = useSwipeHint(storageKey);

  if (!show) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse",
        className
      )}
    >
      <ChevronLeft className="h-3 w-3" />
      <span>Glissez</span>
      <ChevronRight className="h-3 w-3" />
    </div>
  );
}

export default SwipeHint;
