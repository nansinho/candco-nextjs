"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Hysteresis thresholds to prevent oscillation
const SHOW_THRESHOLD = 420;
const HIDE_THRESHOLD = 380;

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ticking = useRef(false);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      if (ticking.current) return;

      ticking.current = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        // Hysteresis: different thresholds for show/hide to prevent oscillation
        setIsVisible((prev) => {
          if (prev && scrollY < HIDE_THRESHOLD) return false;
          if (!prev && scrollY > SHOW_THRESHOLD) return true;
          return prev;
        });

        ticking.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Don't render until mounted
  if (!mounted) return null;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        // Base styles with GPU optimization
        "fixed right-6 bottom-24 z-50 w-12 h-12 rounded-full",
        "bg-background text-primary",
        "border-2 border-primary",
        "shadow-lg shadow-black/20",
        "flex items-center justify-center",
        "transform-gpu", // Force GPU rendering
        // Pure CSS animation
        "transition-[opacity,transform,background-color] duration-200 ease-out",
        isVisible
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-90 pointer-events-none",
        // Hover effects
        "hover:scale-110 hover:bg-primary/10 hover:shadow-xl hover:shadow-primary/20"
      )}
      style={{
        willChange: "opacity, transform",
      }}
      aria-label="Retour en haut"
      aria-hidden={!isVisible}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
