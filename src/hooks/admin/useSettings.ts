"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Json } from "@/types/database";

export interface SiteSetting {
  id: string;
  key: string;
  value: Json;
  updated_at: string;
}

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  email: string;
  phone: string;
  address: string;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReport: boolean;
  newRegistration: boolean;
  newContact: boolean;
}

export interface AdvancedSettings {
  maintenanceMode: boolean;
  registrationsOpen: boolean;
  debugMode: boolean;
}

export const defaultGeneralSettings: GeneralSettings = {
  siteName: "C&Co Formation",
  siteDescription: "Organisme de formation professionnelle",
  email: "contact@candco-formation.fr",
  phone: "04 91 00 00 00",
  address: "123 rue de la Formation, 13001 Marseille",
};

export const defaultSeoSettings: SeoSettings = {
  metaTitle: "",
  metaDescription: "",
};

export const defaultNotificationSettings: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  weeklyReport: true,
  newRegistration: true,
  newContact: true,
};

export const defaultAdvancedSettings: AdvancedSettings = {
  maintenanceMode: false,
  registrationsOpen: true,
  debugMode: false,
};

async function fetchSettings(): Promise<Record<string, Json>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("*");

  if (error) throw error;

  const settingsMap: Record<string, Json> = {};
  for (const row of data || []) {
    settingsMap[row.key] = row.value;
  }
  return settingsMap;
}

export function useSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useSettingsMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const upsertSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Json }) => {
      const { error } = await supabase
        .from("site_settings")
        .upsert(
          { key, value, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
    },
  });

  return { upsertSetting };
}
