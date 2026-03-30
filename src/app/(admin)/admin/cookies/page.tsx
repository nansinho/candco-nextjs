"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Cookie,
  Save,
  Shield,
  Eye,
  BarChart3,
  Settings,
  Loader2,
  Users,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatsCard, StatsCardSkeleton } from "@/components/admin/StatsCard";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { useCookieConsentStats } from "@/hooks/admin/useCookieConsents";
import { useSettings, useSettingsMutations } from "@/hooks/admin/useSettings";
import { toast } from "sonner";
import { Json } from "@/types/database";

interface CookieConfig {
  id: string;
  name: string;
  category: "necessary" | "functional" | "analytics" | "marketing";
  description: string;
  duration: string;
  required: boolean;
}

interface BannerSettings {
  showBanner: boolean;
  requireConsent: boolean;
  rememberChoice: boolean;
  bannerText: string;
}

const defaultBannerSettings: BannerSettings = {
  showBanner: true,
  requireConsent: true,
  rememberChoice: true,
  bannerText:
    "Nous utilisons des cookies pour améliorer votre expérience sur notre site. En continuant à naviguer, vous acceptez notre utilisation des cookies.",
};

const defaultCookieConfig: CookieConfig[] = [
  {
    id: "1",
    name: "session_id",
    category: "necessary",
    description: "Cookie de session pour l'authentification",
    duration: "Session",
    required: true,
  },
  {
    id: "2",
    name: "csrf_token",
    category: "necessary",
    description: "Protection contre les attaques CSRF",
    duration: "Session",
    required: true,
  },
  {
    id: "3",
    name: "preferences",
    category: "functional",
    description: "Préférences utilisateur (thème, langue)",
    duration: "1 an",
    required: false,
  },
  {
    id: "4",
    name: "_ga",
    category: "analytics",
    description: "Google Analytics - Suivi des visiteurs",
    duration: "2 ans",
    required: false,
  },
  {
    id: "5",
    name: "_fbp",
    category: "marketing",
    description: "Facebook Pixel - Publicités ciblées",
    duration: "3 mois",
    required: false,
  },
];

const categoryConfig = {
  necessary: { label: "Nécessaires", color: "bg-green-500/15 text-green-500 border-0", icon: Shield },
  functional: { label: "Fonctionnels", color: "bg-blue-500/15 text-blue-500 border-0", icon: Settings },
  analytics: { label: "Analytiques", color: "bg-purple-500/15 text-purple-500 border-0", icon: BarChart3 },
  marketing: { label: "Marketing", color: "bg-amber-500/15 text-amber-500 border-0", icon: Eye },
};

export default function CookiesPage() {
  const { data: consentStats, isLoading: statsLoading } = useCookieConsentStats();
  const { data: allSettings, isLoading: settingsLoading } = useSettings();
  const { upsertSetting } = useSettingsMutations();

  const [bannerSettings, setBannerSettings] = useState<BannerSettings>(defaultBannerSettings);
  const [cookieConfig, setCookieConfig] = useState<CookieConfig[]>(defaultCookieConfig);

  useEffect(() => {
    if (allSettings) {
      if (allSettings.cookie_banner_settings) {
        setBannerSettings({
          ...defaultBannerSettings,
          ...(allSettings.cookie_banner_settings as Record<string, unknown>),
        } as BannerSettings);
      }
      if (allSettings.cookie_config) {
        setCookieConfig(allSettings.cookie_config as unknown as CookieConfig[]);
      }
    }
  }, [allSettings]);

  const handleSave = async () => {
    try {
      await Promise.all([
        upsertSetting.mutateAsync({
          key: "cookie_banner_settings",
          value: bannerSettings as unknown as Json,
        }),
        upsertSetting.mutateAsync({
          key: "cookie_config",
          value: cookieConfig as unknown as Json,
        }),
      ]);
      toast.success("Configuration cookies enregistrée");
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const isLoading = statsLoading || settingsLoading;

  return (
    <div className={adminStyles.pageLayout}>
      <AdminPageHeader
        icon={Cookie}
        title="Cookies RGPD"
        description="Configurez la politique de cookies et le bandeau de consentement"
      >
        <Button onClick={handleSave} disabled={upsertSetting.isPending}>
          {upsertSetting.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Enregistrer
        </Button>
      </AdminPageHeader>

      {/* Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Consentements"
              value={consentStats?.total ?? 0}
              description="Total enregistrés"
              icon={Users}
            />
            <StatsCard
              title="Cookies déclarés"
              value={cookieConfig.length}
              description="Configurés"
              icon={Cookie}
            />
            <StatsCard
              title="Fonctionnels"
              value={`${consentStats?.functionalRate ?? 0}%`}
              description="Taux d'acceptation"
              icon={Settings}
            />
            <StatsCard
              title="Analytics"
              value={`${consentStats?.analyticsRate ?? 0}%`}
              description="Taux d'acceptation"
              icon={BarChart3}
            />
          </>
        )}
      </div>

      {/* Banner Settings */}
      <Card className="border-0 bg-secondary/30">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className={adminStyles.cardTitle}>Paramètres du bandeau</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Configurez l&apos;affichage et le comportement du bandeau de consentement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
          {[
            { key: "showBanner" as const, label: "Afficher le bandeau", desc: "Afficher le bandeau de consentement aux nouveaux visiteurs" },
            { key: "requireConsent" as const, label: "Consentement obligatoire", desc: "Exiger une action avant de naviguer sur le site" },
            { key: "rememberChoice" as const, label: "Mémoriser le choix", desc: "Sauvegarder les préférences pour 6 mois" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className={adminStyles.formLabel}>{label}</Label>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch
                checked={bannerSettings[key]}
                onCheckedChange={(checked) =>
                  setBannerSettings({ ...bannerSettings, [key]: checked })
                }
              />
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="bannerText" className={adminStyles.formLabel}>Texte du bandeau</Label>
            <Textarea
              id="bannerText"
              value={bannerSettings.bannerText}
              onChange={(e) => setBannerSettings({ ...bannerSettings, bannerText: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cookies List */}
      <Card className="border-0 bg-secondary/30">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className={adminStyles.cardTitle}>Liste des cookies</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Cookies déclarés sur votre site
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className={adminStyles.tableWrapper}>
            <Table>
              <TableHeader>
                <TableRow className={adminStyles.tableRowHeader}>
                  <TableHead className={adminStyles.tableHead}>Nom</TableHead>
                  <TableHead className={adminStyles.tableHead}>Catégorie</TableHead>
                  <TableHead className={`${adminStyles.tableHead} hidden md:table-cell`}>Description</TableHead>
                  <TableHead className={adminStyles.tableHead}>Durée</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cookieConfig.map((cookie) => {
                  const catInfo = categoryConfig[cookie.category];
                  const CatIcon = catInfo.icon;
                  return (
                    <TableRow key={cookie.id} className={adminStyles.tableRow}>
                      <TableCell className={adminStyles.tableCell}>
                        <div className="flex items-center gap-2">
                          <code className="text-[11px] bg-muted/50 px-1.5 py-0.5 rounded">
                            {cookie.name}
                          </code>
                          {cookie.required && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 border-border/20">
                              Requis
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={adminStyles.tableCell}>
                        <Badge className={catInfo.color}>
                          <CatIcon className="h-3 w-3 mr-1" />
                          {catInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className={`${adminStyles.tableCellMuted} hidden md:table-cell max-w-xs truncate`}>
                        {cookie.description}
                      </TableCell>
                      <TableCell className={adminStyles.tableCellMuted}>
                        {cookie.duration}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
