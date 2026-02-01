"use client";

import { LucideIcon } from "lucide-react";
import { adminStyles } from "./AdminDesignSystem";

interface AdminPageHeaderProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function AdminPageHeader({
  icon: Icon,
  title,
  description,
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}
        <div>
          <h1 className={adminStyles.pageTitle}>{title}</h1>
          {description && (
            <p className={adminStyles.pageDescription}>{description}</p>
          )}
        </div>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
