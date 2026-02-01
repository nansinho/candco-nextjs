"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Shield,
  Key,
  Lock,
  Smartphone,
  Globe,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  MapPin,
} from "lucide-react";

interface LoginAttempt {
  id: string;
  email: string;
  ip: string;
  location: string;
  status: "success" | "failed" | "blocked";
  timestamp: string;
}

const demoLoginAttempts: LoginAttempt[] = [
  {
    id: "1",
    email: "admin@candco.fr",
    ip: "192.168.1.1",
    location: "Marseille, FR",
    status: "success",
    timestamp: "2024-01-20T14:30:00",
  },
  {
    id: "2",
    email: "test@example.com",
    ip: "45.33.32.156",
    location: "Unknown",
    status: "failed",
    timestamp: "2024-01-20T13:45:00",
  },
  {
    id: "3",
    email: "user@candco.fr",
    ip: "192.168.1.50",
    location: "Paris, FR",
    status: "success",
    timestamp: "2024-01-20T12:00:00",
  },
  {
    id: "4",
    email: "admin@candco.fr",
    ip: "185.220.101.1",
    location: "TOR Exit Node",
    status: "blocked",
    timestamp: "2024-01-20T10:30:00",
  },
];

const statusConfig = {
  success: { label: "Succès", color: "bg-green-500/15 text-green-600", icon: CheckCircle2 },
  failed: { label: "Échec", color: "bg-amber-500/15 text-amber-600", icon: XCircle },
  blocked: { label: "Bloqué", color: "bg-destructive/15 text-destructive", icon: AlertTriangle },
};

export default function SecurityPage() {
  const [settings, setSettings] = useState({
    twoFactor: true,
    sessionTimeout: true,
    ipWhitelist: false,
    bruteForceProtection: true,
    passwordPolicy: true,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Sécurité
          </h1>
          <p className="text-muted-foreground">
            Paramètres de sécurité et audit des connexions
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connexions (24h)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {demoLoginAttempts.filter((l) => l.status === "success").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Échecs</CardTitle>
            <XCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {demoLoginAttempts.filter((l) => l.status === "failed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloqués</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {demoLoginAttempts.filter((l) => l.status === "blocked").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">2FA activé</CardTitle>
            <Smartphone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">85%</div>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Paramètres de sécurité
          </CardTitle>
          <CardDescription>
            Configurez les mesures de sécurité de votre application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <Label>Authentification à deux facteurs (2FA)</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Exiger la 2FA pour tous les comptes admin
              </p>
            </div>
            <Switch
              checked={settings.twoFactor}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, twoFactor: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label>Expiration de session</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Déconnecter automatiquement après 30 minutes d'inactivité
              </p>
            </div>
            <Switch
              checked={settings.sessionTimeout}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, sessionTimeout: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Label>Liste blanche IP</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Restreindre l'accès admin à certaines adresses IP
              </p>
            </div>
            <Switch
              checked={settings.ipWhitelist}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, ipWhitelist: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <Label>Protection brute force</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Bloquer les IP après 5 tentatives échouées
              </p>
            </div>
            <Switch
              checked={settings.bruteForceProtection}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, bruteForceProtection: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <Label>Politique de mot de passe stricte</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Exiger 12 caractères minimum avec majuscules, chiffres et symboles
              </p>
            </div>
            <Switch
              checked={settings.passwordPolicy}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, passwordPolicy: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Login Attempts */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des connexions</CardTitle>
          <CardDescription>
            Dernières tentatives de connexion (24 heures)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Adresse IP</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoLoginAttempts.map((attempt) => {
                const statusInfo = statusConfig[attempt.status];
                const StatusIcon = statusInfo.icon;
                return (
                  <TableRow key={attempt.id}>
                    <TableCell className="font-medium">{attempt.email}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {attempt.ip}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {attempt.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusInfo.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(attempt.timestamp).toLocaleString("fr-FR")}
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
