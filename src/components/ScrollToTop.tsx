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
        "fixed right-6 bottom-24 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl",
        "flex items-center justify-center",
        "transform-gpu",
        "transition-[opacity,transform] duration-200 ease-out",
        isVisible
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-90 pointer-events-none",
        "hover:scale-105"
      )}
      style={{
        backgroundColor: "#1F628E",
        color: "#fff",
        boxShadow: "0 4px 14px rgba(31,98,142,0.3)",
        willChange: "opacity, transform",
      }}
      aria-label="Retour en haut"
      aria-hidden={!isVisible}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
