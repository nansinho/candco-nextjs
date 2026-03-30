"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Settings,
  Save,
  Building2,
  Globe,
  Bell,
  Shield,
  Loader2,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import {
  useSettings,
  useSettingsMutations,
  defaultGeneralSettings,
  defaultSeoSettings,
  defaultNotificationSettings,
  defaultAdvancedSettings,
  type GeneralSettings,
  type SeoSettings,
  type NotificationSettings,
  type AdvancedSettings,
} from "@/hooks/admin/useSettings";
import { toast } from "sonner";
import { Json } from "@/types/database";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const { upsertSetting } = useSettingsMutations();

  const [general, setGeneral] = useState<GeneralSettings>(defaultGeneralSettings);
  const [seo, setSeo] = useState<SeoSettings>(defaultSeoSettings);
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotificationSettings);
  const [advanced, setAdvanced] = useState<AdvancedSettings>(defaultAdvancedSettings);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (settings) {
      if (settings.general) setGeneral({ ...defaultGeneralSettings, ...(settings.general as Record<string, unknown>) } as GeneralSettings);
      if (settings.seo) setSeo({ ...defaultSeoSettings, ...(settings.seo as Record<string, unknown>) } as SeoSettings);
      if (settings.notifications) setNotifications({ ...defaultNotificationSettings, ...(settings.notifications as Record<string, unknown>) } as NotificationSettings);
      if (settings.advanced) setAdvanced({ ...defaultAdvancedSettings, ...(settings.advanced as Record<string, unknown>) } as AdvancedSettings);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await Promise.all([
        upsertSetting.mutateAsync({ key: "general", value: general as unknown as Json }),
        upsertSetting.mutateAsync({ key: "seo", value: seo as unknown as Json }),
        upsertSetting.mutateAsync({ key: "notifications", value: notifications as unknown as Json }),
        upsertSetting.mutateAsync({ key: "advanced", value: advanced as unknown as Json }),
      ]);
      toast.success("Paramètres enregistrés");
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  if (isLoading) {
    return (
      <div className={adminStyles.pageLayout}>
        <AdminPageHeader
          icon={Settings}
          title="Paramètres"
          description="Configurez les paramètres de votre application"
        />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={adminStyles.pageLayout}>
      <AdminPageHeader
        icon={Settings}
        title="Paramètres"
        description="Configurez les paramètres de votre application"
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className={adminStyles.tabsListWrapper}>
          <TabsList className={adminStyles.tabsList}>
            <TabsTrigger value="general" className={adminStyles.tabsTrigger}>
              <Building2 className="h-4 w-4" />
              <span>Général</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className={adminStyles.tabsTrigger}>
              <Globe className="h-4 w-4" />
              <span>SEO</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className={adminStyles.tabsTrigger}>
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className={adminStyles.tabsTrigger}>
              <Shield className="h-4 w-4" />
              <span>Avancé</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className={adminStyles.cardTitle}>
                Informations de l&apos;organisme
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Informations générales affichées sur le site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className={adminStyles.formLabel}>Nom de l&apos;organisme</Label>
                  <Input
                    id="siteName"
                    className={adminStyles.formInput}
                    value={general.siteName}
                    onChange={(e) => setGeneral({ ...general, siteName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className={adminStyles.formLabel}>Email de contact</Label>
                  <Input
                    id="email"
                    type="email"
                    className={adminStyles.formInput}
                    value={general.email}
                    onChange={(e) => setGeneral({ ...general, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className={adminStyles.formLabel}>Description</Label>
                <Textarea
                  id="description"
                  value={general.siteDescription}
                  onChange={(e) => setGeneral({ ...general, siteDescription: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone" className={adminStyles.formLabel}>Téléphone</Label>
                  <Input
                    id="phone"
                    className={adminStyles.formInput}
                    value={general.phone}
                    onChange={(e) => setGeneral({ ...general, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className={adminStyles.formLabel}>Adresse</Label>
                  <Input
                    id="address"
                    className={adminStyles.formInput}
                    value={general.address}
                    onChange={(e) => setGeneral({ ...general, address: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo" className="space-y-4">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className={adminStyles.cardTitle}>
                SEO & Métadonnées
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Paramètres pour le référencement naturel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-2">
                <Label htmlFor="metaTitle" className={adminStyles.formLabel}>Titre meta par défaut</Label>
                <Input
                  id="metaTitle"
                  className={adminStyles.formInput}
                  placeholder="C&Co Formation - Organisme de formation professionnelle"
                  value={seo.metaTitle}
                  onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription" className={adminStyles.formLabel}>Description meta par défaut</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="Découvrez nos formations professionnelles..."
                  value={seo.metaDescription}
                  onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className={adminStyles.cardTitle}>
                Préférences de notifications
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configurez comment vous recevez les notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
              {[
                { key: "emailNotifications" as const, label: "Notifications par email", desc: "Recevoir les notifications par email" },
                { key: "pushNotifications" as const, label: "Notifications push", desc: "Recevoir les notifications push dans le navigateur" },
                { key: "weeklyReport" as const, label: "Rapport hebdomadaire", desc: "Recevoir un résumé hebdomadaire par email" },
                { key: "newRegistration" as const, label: "Nouvelles inscriptions", desc: "Être notifié des nouvelles inscriptions" },
                { key: "newContact" as const, label: "Nouveaux contacts", desc: "Être notifié des nouveaux messages de contact" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className={adminStyles.formLabel}>{label}</Label>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={notifications[key]}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, [key]: checked })
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-4">
          <Card className="border-0 bg-secondary/30">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className={adminStyles.cardTitle}>
                Paramètres avancés
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configuration avancée de l&apos;application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className={adminStyles.formLabel}>Mode maintenance</Label>
                  <p className="text-xs text-muted-foreground">Activer le mode maintenance du site</p>
                </div>
                <Switch
                  checked={advanced.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setAdvanced({ ...advanced, maintenanceMode: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className={adminStyles.formLabel}>Inscriptions ouvertes</Label>
                  <p className="text-xs text-muted-foreground">Permettre les nouvelles inscriptions</p>
                </div>
                <Switch
                  checked={advanced.registrationsOpen}
                  onCheckedChange={(checked) =>
                    setAdvanced({ ...advanced, registrationsOpen: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className={adminStyles.formLabel}>Debug mode</Label>
                  <p className="text-xs text-muted-foreground">Afficher les informations de debug</p>
                </div>
                <Switch
                  checked={advanced.debugMode}
                  onCheckedChange={(checked) =>
                    setAdvanced({ ...advanced, debugMode: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-destructive/5">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className={`${adminStyles.cardTitle} text-destructive`}>Zone de danger</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Actions irréversibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className={adminStyles.formLabel}>Vider le cache</Label>
                  <p className="text-xs text-muted-foreground">Supprimer tous les fichiers en cache</p>
                </div>
                <Button variant="destructive" size="sm">Vider le cache</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
