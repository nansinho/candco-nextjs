import * as React from "react";
import { cn } from "@/lib/utils";

interface HorizontalDragScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  showGradients?: boolean;
}

/**
 * A horizontal scrollable container that supports drag-to-scroll on desktop.
 * Works with mouse drag, trackpad, and touch.
 */
function HorizontalDragScrollInner(
  { children, className, showGradients = true, ...props }: HorizontalDragScrollProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  
  // Track drag state without causing re-renders
  const dragState = React.useRef({
    isPointerDown: false,
    startX: 0,
    startScrollLeft: 0,
    hasDragged: false,
  });

  // Check scroll position for gradient indicators
  const updateScrollIndicators = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollIndicators();
    
    // Use ResizeObserver to detect content/container size changes
    const resizeObserver = new ResizeObserver(updateScrollIndicators);
    resizeObserver.observe(el);
    
    // Also observe the first child if it exists (the actual scrollable content)
    const firstChild = el.firstElementChild;
    if (firstChild) {
      resizeObserver.observe(firstChild);
    }

    return () => resizeObserver.disconnect();
  }, [updateScrollIndicators]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only handle left mouse button or touch
    if (e.button !== 0) return;
    
    const el = containerRef.current;
    if (!el) return;

    dragState.current = {
      isPointerDown: true,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      hasDragged: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.isPointerDown) return;
    
    const el = containerRef.current;
    if (!el) return;

    const deltaX = e.clientX - dragState.current.startX;
    
    // Only start dragging after a threshold to distinguish from clicks
    if (Math.abs(deltaX) > 5) {
      if (!dragState.current.hasDragged) {
        dragState.current.hasDragged = true;
        setIsDragging(true);
        el.setPointerCapture(e.pointerId);
      }
      
      el.scrollLeft = dragState.current.startScrollLeft - deltaX;
      updateScrollIndicators();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current.hasDragged) {
      containerRef.current?.releasePointerCapture(e.pointerId);
      
      // Delay resetting isDragging to block the click event
      requestAnimationFrame(() => {
        setIsDragging(false);
      });
    }
    
    dragState.current.isPointerDown = false;
    dragState.current.hasDragged = false;
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerUp(e);
  };

  // Block clicks when we just finished dragging
  const handleClickCapture = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleScroll = () => {
    updateScrollIndicators();
  };

  return (
    <div ref={ref} className="relative">
      {/* Left gradient indicator */}
      {showGradients && canScrollLeft && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"
          aria-hidden="true"
        />
      )}
      
      <div
        ref={containerRef}
        className={cn(
          "overflow-x-auto overflow-y-visible",
          "select-none touch-pan-x",
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
          isDragging ? "cursor-grabbing" : "cursor-grab",
          className
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClickCapture={handleClickCapture}
        onScroll={handleScroll}
        {...props}
      >
        {children}
      </div>
      
      {/* Right gradient indicator */}
      {showGradients && canScrollRight && (
        <div 
          className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export const HorizontalDragScroll = React.forwardRef(HorizontalDragScrollInner);
HorizontalDragScroll.displayName = "HorizontalDragScroll";
