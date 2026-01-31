/**
 * @file mobile-scroll-container.tsx
 * @description Composant réutilisable pour gérer le défilement horizontal des tableaux/grilles sur mobile.
 * Utilise ScrollArea pour un défilement fluide avec indicateur de scroll visible.
 *
 * PATTERN GLOBAL pour les tableaux mobiles:
 * - Toujours envelopper les grilles/tableaux avec ce composant
 * - Définir minWidth pour forcer la largeur minimale du contenu
 * - La scrollbar horizontale apparaît automatiquement sur mobile
 *
 * @example
 * <MobileScrollContainer minWidth="800px">
 *   <Table>...</Table>
 * </MobileScrollContainer>
 */

import * as React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MobileScrollContainerProps {
  /** Contenu à rendre scrollable */
  children: React.ReactNode;
  /** Largeur minimale du contenu (ex: "600px", "800px") */
  minWidth?: string;
  /** Classes CSS additionnelles pour le wrapper externe */
  className?: string;
  /** Classes CSS additionnelles pour le contenu interne */
  contentClassName?: string;
  /** Si true, affiche toujours la scrollbar (pas seulement au survol) */
  alwaysShowScrollbar?: boolean;
}

/**
 * Conteneur de défilement horizontal pour mobile.
 * Encapsule le contenu dans un ScrollArea avec scrollbar horizontale visible.
 *
 * Utilisation recommandée:
 * - Tableaux de données avec plusieurs colonnes
 * - Grilles de planning (semaine, mois, année)
 * - Tout contenu qui dépasse la largeur mobile
 */
export function MobileScrollContainer({
  children,
  minWidth = "600px",
  className,
  contentClassName,
  alwaysShowScrollbar = false,
}: MobileScrollContainerProps) {
  return (
    <ScrollArea
      className={cn("w-full", className)}
      type={alwaysShowScrollbar ? "always" : "auto"}
    >
      <div
        className={cn(contentClassName)}
        style={{ minWidth }}
      >
        {children}
      </div>
      <ScrollBar
        orientation="horizontal"
        className={cn(
          "h-2.5",
          alwaysShowScrollbar && "opacity-100"
        )}
      />
    </ScrollArea>
  );
}

/**
 * Version avec indicateur visuel de scroll.
 * Affiche une ombre/gradient sur les bords pour indiquer qu'il y a du contenu à scroller.
 */
interface MobileScrollContainerWithIndicatorProps extends MobileScrollContainerProps {
  /** Affiche un indicateur visuel de scroll sur les côtés */
  showScrollIndicator?: boolean;
}

export function MobileScrollContainerWithIndicator({
  children,
  minWidth = "600px",
  className,
  contentClassName,
  alwaysShowScrollbar = false,
  showScrollIndicator = true,
}: MobileScrollContainerWithIndicatorProps) {
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const checkScroll = React.useCallback(() => {
    if (!scrollRef.current) return;
    const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return;

    const { scrollLeft, scrollWidth, clientWidth } = viewport;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  React.useEffect(() => {
    const viewport = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!viewport) return;

    // Check initial scroll state
    checkScroll();

    // Listen to scroll events
    viewport.addEventListener('scroll', checkScroll);

    // Listen to resize
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(viewport);

    return () => {
      viewport.removeEventListener('scroll', checkScroll);
      resizeObserver.disconnect();
    };
  }, [checkScroll]);

  return (
    <div className={cn("relative", className)}>
      {/* Indicateur gauche */}
      {showScrollIndicator && canScrollLeft && (
        <div
          className="absolute left-0 top-0 bottom-2.5 w-8 bg-gradient-to-r from-background/80 to-transparent pointer-events-none z-10"
          aria-hidden="true"
        />
      )}

      {/* Indicateur droite */}
      {showScrollIndicator && canScrollRight && (
        <div
          className="absolute right-0 top-0 bottom-2.5 w-8 bg-gradient-to-l from-background/80 to-transparent pointer-events-none z-10"
          aria-hidden="true"
        />
      )}

      <ScrollArea
        ref={scrollRef}
        className="w-full"
        type={alwaysShowScrollbar ? "always" : "auto"}
      >
        <div
          className={cn(contentClassName)}
          style={{ minWidth }}
        >
          {children}
        </div>
        <ScrollBar
          orientation="horizontal"
          className={cn(
            "h-2.5",
            alwaysShowScrollbar && "opacity-100"
          )}
        />
      </ScrollArea>
    </div>
  );
}

export type { MobileScrollContainerProps, MobileScrollContainerWithIndicatorProps };
