"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface CookieConsentStats {
  total: number;
  functionalAccepted: number;
  analyticsAccepted: number;
  functionalRate: number;
  analyticsRate: number;
}

async function fetchCookieConsentStats(): Promise<CookieConsentStats> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("cookie_consents")
    .select("functional, analytics");

  if (error) throw error;

  const rows = data || [];
  const total = rows.length;
  const functionalAccepted = rows.filter((r: { functional: boolean; analytics: boolean }) => r.functional).length;
  const analyticsAccepted = rows.filter((r: { functional: boolean; analytics: boolean }) => r.analytics).length;

  return {
    total,
    functionalAccepted,
    analyticsAccepted,
    functionalRate: total > 0 ? Math.round((functionalAccepted / total) * 100) : 0,
    analyticsRate: total > 0 ? Math.round((analyticsAccepted / total) * 100) : 0,
  };
}

export function useCookieConsentStats() {
  return useQuery({
    queryKey: ["admin", "cookie-consents", "stats"],
    queryFn: fetchCookieConsentStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}
