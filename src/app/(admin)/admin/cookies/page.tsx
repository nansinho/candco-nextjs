"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Plus,
  Edit,
  Trash2,
  Shield,
  Eye,
  BarChart3,
  Settings,
  CheckCircle2,
} from "lucide-react";

interface CookieConfig {
  id: string;
  name: string;
  category: "necessary" | "functional" | "analytics" | "marketing";
  description: string;
  duration: string;
  required: boolean;
}

const demoCookies: CookieConfig[] = [
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
  necessary: { label: "Nécessaires", color: "bg-green-500/15 text-green-600", icon: Shield },
  functional: { label: "Fonctionnels", color: "bg-blue-500/15 text-blue-600", icon: Settings },
  analytics: { label: "Analytiques", color: "bg-purple-500/15 text-purple-600", icon: BarChart3 },
  marketing: { label: "Marketing", color: "bg-amber-500/15 text-amber-600", icon: Eye },
};

export default function CookiesPage() {
  const [settings, setSettings] = useState({
    showBanner: true,
    requireConsent: true,
    rememberChoice: true,
    analyticsEnabled: true,
    marketingEnabled: false,
  });

  const [bannerText, setBannerText] = useState(
    "Nous utilisons des cookies pour améliorer votre expérience sur notre site. En continuant à naviguer, vous acceptez notre utilisation des cookies."
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Cookie className="h-6 w-6" />
            Gestion des Cookies RGPD
          </h1>
          <p className="text-muted-foreground">
            Configurez la politique de cookies et le bandeau de consentement
          </p>
        </div>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Enregistrer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cookies configurés</CardTitle>
            <Cookie className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoCookies.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'acceptation</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">78%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics acceptés</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">65%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marketing acceptés</CardTitle>
            <Eye className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">42%</div>
          </CardContent>
        </Card>
      </div>

      {/* Banner Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres du bandeau</CardTitle>
          <CardDescription>
            Configurez l'affichage et le comportement du bandeau de consentement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Afficher le bandeau</Label>
              <p className="text-sm text-muted-foreground">
                Afficher le bandeau de consentement aux nouveaux visiteurs
              </p>
            </div>
            <Switch
              checked={settings.showBanner}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, showBanner: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Consentement obligatoire</Label>
              <p className="text-sm text-muted-foreground">
                Exiger une action avant de naviguer sur le site
              </p>
            </div>
            <Switch
              checked={settings.requireConsent}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, requireConsent: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Mémoriser le choix</Label>
              <p className="text-sm text-muted-foreground">
                Sauvegarder les préférences pour 6 mois
              </p>
            </div>
            <Switch
              checked={settings.rememberChoice}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, rememberChoice: checked })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bannerText">Texte du bandeau</Label>
            <Textarea
              id="bannerText"
              value={bannerText}
              onChange={(e) => setBannerText(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cookies List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Liste des cookies</CardTitle>
            <CardDescription>
              Gérez les cookies déclarés sur votre site
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoCookies.map((cookie) => {
                const categoryInfo = categoryConfig[cookie.category];
                const CategoryIcon = categoryInfo.icon;
                return (
                  <TableRow key={cookie.id}>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {cookie.name}
                      </code>
                      {cookie.required && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Requis
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={categoryInfo.color}>
                        <CategoryIcon className="h-3 w-3 mr-1" />
                        {categoryInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {cookie.description}
                    </TableCell>
                    <TableCell>{cookie.duration}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          disabled={cookie.required}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
