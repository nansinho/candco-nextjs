"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Zap,
  Search,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Mail,
  Bell,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  status: "active" | "inactive" | "draft";
  executionsCount: number;
  lastExecuted?: string;
}

const demoRules: AutomationRule[] = [
  {
    id: "1",
    name: "Email de bienvenue",
    description: "Envoie un email de bienvenue aux nouveaux inscrits",
    trigger: "Nouvelle inscription",
    action: "Envoyer email 'Bienvenue'",
    status: "active",
    executionsCount: 245,
    lastExecuted: "2024-01-20",
  },
  {
    id: "2",
    name: "Rappel formation J-7",
    description: "Rappel automatique 7 jours avant la formation",
    trigger: "7 jours avant formation",
    action: "Envoyer email + notification",
    status: "active",
    executionsCount: 180,
    lastExecuted: "2024-01-19",
  },
  {
    id: "3",
    name: "Rappel formation J-1",
    description: "Rappel la veille de la formation",
    trigger: "1 jour avant formation",
    action: "Envoyer SMS + notification",
    status: "active",
    executionsCount: 165,
    lastExecuted: "2024-01-20",
  },
  {
    id: "4",
    name: "Enquête satisfaction",
    description: "Envoie une enquête après la formation",
    trigger: "Fin de formation",
    action: "Envoyer email enquête",
    status: "active",
    executionsCount: 120,
    lastExecuted: "2024-01-18",
  },
  {
    id: "5",
    name: "Relance inscription",
    description: "Relance les inscriptions non finalisées",
    trigger: "Panier abandonné (24h)",
    action: "Envoyer email relance",
    status: "inactive",
    executionsCount: 45,
    lastExecuted: "2024-01-15",
  },
  {
    id: "6",
    name: "Notification admin",
    description: "Alerte admin pour nouvelle demande",
    trigger: "Nouvelle demande contact",
    action: "Notification admin",
    status: "draft",
    executionsCount: 0,
  },
];

const statusConfig = {
  active: { label: "Actif", color: "bg-green-500/15 text-green-600" },
  inactive: { label: "Inactif", color: "bg-muted text-muted-foreground" },
  draft: { label: "Brouillon", color: "bg-amber-500/15 text-amber-600" },
};

export default function AutomationPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRules = demoRules.filter(
    (rule) =>
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeRules = demoRules.filter((r) => r.status === "active").length;
  const totalExecutions = demoRules.reduce((sum, r) => sum + r.executionsCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Automatisations
          </h1>
          <p className="text-muted-foreground">
            Configurez les règles d'automatisation
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle règle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total règles</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoRules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actives</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeRules}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exécutions totales</CardTitle>
            <Play className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalExecutions.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails envoyés</CardTitle>
            <Mail className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(totalExecutions * 0.8)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une règle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Rules List */}
      <div className="grid gap-4">
        {filteredRules.map((rule) => {
          const statusInfo = statusConfig[rule.status];
          return (
            <Card key={rule.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{rule.name}</h3>
                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rule.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {rule.trigger}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <Badge variant="outline" className="gap-1">
                          {rule.action.includes("email") ? (
                            <Mail className="h-3 w-3" />
                          ) : (
                            <Bell className="h-3 w-3" />
                          )}
                          {rule.action}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{rule.executionsCount} exécutions</div>
                      {rule.lastExecuted && (
                        <div className="text-muted-foreground text-xs">
                          Dernière : {new Date(rule.lastExecuted).toLocaleDateString("fr-FR")}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Switch
                      checked={rule.status === "active"}
                      disabled={rule.status === "draft"}
                    />
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredRules.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucune règle trouvée
          </CardContent>
        </Card>
      )}
    </div>
  );
}
