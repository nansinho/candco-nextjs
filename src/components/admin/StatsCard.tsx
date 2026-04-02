"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  href?: string;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  iconColor = "#F8A991",
  iconBg,
  trend,
}: StatsCardProps) {
  const content = (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[13px] text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          {description && (
            <p className="text-xs text-gray-400">{description}</p>
          )}
          {trend && (
            <p className={`text-xs font-semibold ${trend.isPositive ? "text-emerald-600" : "text-red-500"}`}>
              {trend.isPositive ? "↗ +" : "↘ -"}{Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div
          className="h-12 w-12 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg || `${iconColor}18` }}
        >
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-transform hover:scale-[1.02] rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    </div>
  );
}
