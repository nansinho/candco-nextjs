"use client";

import { motion } from "framer-motion";
import type { CaptchaIconGridProps } from "./types";
import { cn } from "@/lib/utils";

export function CaptchaIconGrid({
  icons,
  onIconClick,
  disabled = false,
}: CaptchaIconGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {icons.map((Icon, index) => (
        <motion.button
          key={index}
          type="button"
          whileHover={{ scale: disabled ? 1 : 1.05 }}
          whileTap={{ scale: disabled ? 1 : 0.95 }}
          onClick={() => !disabled && onIconClick(index)}
          disabled={disabled}
          className={cn(
            "aspect-square flex items-center justify-center",
            "rounded-xl border-2 border-border/50 bg-secondary/30",
            "transition-all duration-200",
            "hover:border-primary/50 hover:bg-secondary/50",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
        </motion.button>
      ))}
    </div>
  );
}
