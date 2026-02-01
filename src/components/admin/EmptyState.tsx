"use client";

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "py-8" : "py-12 sm:py-16"
      }`}
    >
      <div
        className={`rounded-full bg-muted flex items-center justify-center mb-4 ${
          compact ? "h-12 w-12" : "h-16 w-16"
        }`}
      >
        <Icon
          className={`text-muted-foreground ${compact ? "h-6 w-6" : "h-8 w-8"}`}
        />
      </div>
      <h3
        className={`font-medium mb-1 ${compact ? "text-sm" : "text-base sm:text-lg"}`}
      >
        {title}
      </h3>
      {description && (
        <p
          className={`text-muted-foreground max-w-sm ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
