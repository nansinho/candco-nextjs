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
  trend?: { value: number; isPositive: boolean };
}

export function StatsCard({ title, value, description, icon: Icon, href, iconColor = "#1f628e", trend }: StatsCardProps) {
  const content = (
    <div className="rounded-xl border border-[#cbd8e3]/50 bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 w-full">
      <div className="flex items-center justify-between mb-2">
        <div
          className="h-8 w-8 flex items-center justify-center rounded-lg"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: iconColor }} />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${trend.isPositive ? "text-emerald-500 bg-emerald-500/10" : "text-red-400 bg-red-400/10"}`}>
            {trend.isPositive ? "↗" : "↘"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="text-xl font-bold text-[#0e2438]">{value}</p>
      <p className="text-xs text-[#5a7a8f] mt-0.5">{description || title}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }
  return content;
}

export function StatsCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#cbd8e3]/50 bg-white p-3 w-full">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-6 w-12 mt-2" />
      <Skeleton className="h-3 w-20 mt-1" />
    </div>
  );
}
