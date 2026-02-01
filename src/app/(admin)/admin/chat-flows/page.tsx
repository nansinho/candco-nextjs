"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  MessageCircle,
  Search,
  Plus,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  GitBranch,
  MessageSquare,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface ChatFlow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  status: "active" | "inactive" | "draft";
  messagesCount: number;
  conversationsCount: number;
  lastModified: string;
}

const demoFlows: ChatFlow[] = [
  {
    id: "1",
    name: "Accueil visiteur",
    description: "Message de bienvenue et proposition d'aide",
    trigger: "Page d'accueil",
    status: "active",
    messagesCount: 5,
    conversationsCount: 1250,
    lastModified: "2024-01-20",
  },
  {
    id: "2",
    name: "Demande de renseignements",
    description: "Collecte des informations de contact",
    trigger: "Clic sur 'Contact'",
    status: "active",
    messagesCount: 8,
    conversationsCount: 450,
    lastModified: "2024-01-18",
  },
  {
    id: "3",
    name: "FAQ automatique",
    description: "Réponses aux questions fréquentes",
    trigger: "Mot-clé détecté",
    status: "active",
    messagesCount: 15,
    conversationsCount: 820,
    lastModified: "2024-01-15",
  },
  {
    id: "4",
    name: "Inscription formation",
    description: "Guidage vers l'inscription à une formation",
    trigger: "Page formation",
    status: "inactive",
    messagesCount: 10,
    conversationsCount: 280,
    lastModified: "2024-01-10",
  },
  {
    id: "5",
    name: "Support technique",
    description: "Transfert vers un agent humain",
    trigger: "Demande de support",
    status: "draft",
    messagesCount: 3,
    conversationsCount: 0,
    lastModified: "2024-01-08",
  },
];

const statusConfig = {
  active: { label: "Actif", color: "bg-green-500/15 text-green-600", icon: Play },
  inactive: { label: "Inactif", color: "bg-muted text-muted-foreground", icon: Pause },
  draft: { label: "Brouillon", color: "bg-amber-500/15 text-amber-600", icon: Clock },
};

export default function ChatFlowsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFlows = demoFlows.filter(
    (flow) =>
      flow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flow.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFlows = demoFlows.filter((f) => f.status === "active").length;
  const totalConversations = demoFlows.reduce((sum, f) => sum + f.conversationsCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Flux Chatbot
          </h1>
          <p className="text-muted-foreground">
            Configurez les scénarios de conversation du chatbot
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau flux
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total flux</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoFlows.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeFlows}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalConversations.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages totaux</CardTitle>
            <MessageCircle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {demoFlows.reduce((sum, f) => sum + f.messagesCount, 0)}
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
              placeholder="Rechercher un flux..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Flows List */}
      <div className="grid gap-4">
        {filteredFlows.map((flow) => {
          const statusInfo = statusConfig[flow.status];
          const StatusIcon = statusInfo.icon;
          return (
            <Card key={flow.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <GitBranch className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{flow.name}</h3>
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{flow.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Déclencheur : {flow.trigger}</span>
                        <span>•</span>
                        <span>{flow.messagesCount} messages</span>
                        <span>•</span>
                        <span>{flow.conversationsCount} conversations</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={flow.status === "active"}
                      disabled={flow.status === "draft"}
                    />
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Copy className="h-4 w-4" />
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

      {filteredFlows.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Aucun flux trouvé
          </CardContent>
        </Card>
      )}
    </div>
  );
}
