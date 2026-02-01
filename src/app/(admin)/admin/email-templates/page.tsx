"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Palette,
  Search,
  Plus,
  Mail,
  Copy,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: "transactional" | "marketing" | "notification";
  status: "active" | "draft";
  lastModified: string;
  usageCount: number;
}

const demoTemplates: EmailTemplate[] = [
  {
    id: "1",
    name: "Bienvenue",
    subject: "Bienvenue chez C&Co Formation !",
    category: "transactional",
    status: "active",
    lastModified: "2024-01-20",
    usageCount: 245,
  },
  {
    id: "2",
    name: "Confirmation inscription",
    subject: "Votre inscription à la formation {{formation}}",
    category: "transactional",
    status: "active",
    lastModified: "2024-01-18",
    usageCount: 180,
  },
  {
    id: "3",
    name: "Rappel formation",
    subject: "Rappel : Votre formation commence demain",
    category: "notification",
    status: "active",
    lastModified: "2024-01-15",
    usageCount: 320,
  },
  {
    id: "4",
    name: "Newsletter mensuelle",
    subject: "Les actualités de {{mois}} - C&Co Formation",
    category: "marketing",
    status: "active",
    lastModified: "2024-01-10",
    usageCount: 1250,
  },
  {
    id: "5",
    name: "Promotion spéciale",
    subject: "Offre exclusive : {{reduction}}% sur nos formations",
    category: "marketing",
    status: "draft",
    lastModified: "2024-01-08",
    usageCount: 0,
  },
  {
    id: "6",
    name: "Réinitialisation mot de passe",
    subject: "Réinitialisez votre mot de passe",
    category: "transactional",
    status: "active",
    lastModified: "2024-01-05",
    usageCount: 85,
  },
];

const categoryConfig = {
  transactional: { label: "Transactionnel", color: "bg-blue-500/15 text-blue-600" },
  marketing: { label: "Marketing", color: "bg-purple-500/15 text-purple-600" },
  notification: { label: "Notification", color: "bg-amber-500/15 text-amber-600" },
};

export default function EmailTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = demoTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = demoTemplates.filter((t) => t.status === "active").length;
  const totalUsage = demoTemplates.reduce((sum, t) => sum + t.usageCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Templates Email
          </h1>
          <p className="text-muted-foreground">
            Créez et gérez vos modèles d'emails
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total templates</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoTemplates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisations totales</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalUsage.toLocaleString()}
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
              placeholder="Rechercher un template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => {
          const categoryInfo = categoryConfig[template.category];
          return (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      {template.subject}
                    </p>
                  </div>
                  {template.status === "active" ? (
                    <Badge className="bg-green-500/15 text-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Actif
                    </Badge>
                  ) : (
                    <Badge className="bg-muted text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      Brouillon
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <Badge className={categoryInfo.color}>{categoryInfo.label}</Badge>
                  <span className="text-muted-foreground">
                    {template.usageCount} utilisations
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Modifié le {new Date(template.lastModified).toLocaleDateString("fr-FR")}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-3 w-3 mr-1" />
                    Aperçu
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun template trouvé
          </CardContent>
        </Card>
      )}
    </div>
  );
}
