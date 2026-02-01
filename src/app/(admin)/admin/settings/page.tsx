"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Save,
  Building2,
  Mail,
  Globe,
  Bell,
  Palette,
  Shield,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "C&Co Formation",
    siteDescription: "Organisme de formation professionnelle",
    email: "contact@candco-formation.fr",
    phone: "04 91 00 00 00",
    address: "123 rue de la Formation, 13001 Marseille",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: true,
    newRegistration: true,
    newContact: true,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Paramètres
          </h1>
          <p className="text-muted-foreground">
            Configurez les paramètres de votre application
          </p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Enregistrer
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Apparence</TabsTrigger>
          <TabsTrigger value="advanced">Avancé</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations de l'organisme
              </CardTitle>
              <CardDescription>
                Informations générales affichées sur le site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Nom de l'organisme</Label>
                  <Input
                    id="siteName"
                    value={generalSettings.siteName}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, siteName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email de contact</Label>
                  <Input
                    id="email"
                    type="email"
                    value={generalSettings.email}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={generalSettings.siteDescription}
                  onChange={(e) =>
                    setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={generalSettings.phone}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={generalSettings.address}
                    onChange={(e) =>
                      setGeneralSettings({ ...generalSettings, address: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                SEO & Métadonnées
              </CardTitle>
              <CardDescription>
                Paramètres pour le référencement naturel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Titre meta par défaut</Label>
                <Input
                  id="metaTitle"
                  placeholder="C&Co Formation - Organisme de formation professionnelle"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Description meta par défaut</Label>
                <Textarea
                  id="metaDescription"
                  placeholder="Découvrez nos formations professionnelles..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Préférences de notifications
              </CardTitle>
              <CardDescription>
                Configurez comment vous recevez les notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir les notifications par email
                  </p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir les notifications push dans le navigateur
                  </p>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, pushNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rapport hebdomadaire</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir un résumé hebdomadaire par email
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, weeklyReport: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nouvelles inscriptions</Label>
                  <p className="text-sm text-muted-foreground">
                    Être notifié des nouvelles inscriptions
                  </p>
                </div>
                <Switch
                  checked={notifications.newRegistration}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, newRegistration: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nouveaux contacts</Label>
                  <p className="text-sm text-muted-foreground">
                    Être notifié des nouveaux messages de contact
                  </p>
                </div>
                <Switch
                  checked={notifications.newContact}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, newContact: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Personnalisation
              </CardTitle>
              <CardDescription>
                Personnalisez l'apparence de votre interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Couleur principale</Label>
                <div className="flex gap-2">
                  {["#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#ec4899"].map((color) => (
                    <button
                      key={color}
                      className="h-8 w-8 rounded-full border-2 border-transparent hover:border-foreground transition-colors"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <Input id="logo" type="file" accept="image/*" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="favicon">Favicon</Label>
                <Input id="favicon" type="file" accept="image/*" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Paramètres avancés
              </CardTitle>
              <CardDescription>
                Configuration avancée de l'application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mode maintenance</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer le mode maintenance du site
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Inscriptions ouvertes</Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre les nouvelles inscriptions
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Debug mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Afficher les informations de debug
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Zone de danger</CardTitle>
              <CardDescription>
                Actions irréversibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Vider le cache</Label>
                  <p className="text-sm text-muted-foreground">
                    Supprimer tous les fichiers en cache
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Vider le cache
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Réinitialiser les paramètres</Label>
                  <p className="text-sm text-muted-foreground">
                    Remettre tous les paramètres par défaut
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
