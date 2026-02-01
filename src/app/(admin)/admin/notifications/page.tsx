"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bell,
  Search,
  Plus,
  Mail,
  Smartphone,
  Globe,
  CheckCircle2,
  Clock,
  Users,
  Send,
  Calendar,
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "email" | "push" | "in_app";
  status: "draft" | "scheduled" | "sent";
  recipients: number;
  scheduledAt?: string;
  sentAt?: string;
  openRate?: number;
}

const demoNotifications: Notification[] = [
  {
    id: "1",
    title: "Nouvelle session SST disponible",
    message: "Inscrivez-vous à notre prochaine session SST du 15 février.",
    type: "email",
    status: "sent",
    recipients: 150,
    sentAt: "2024-01-20",
    openRate: 68,
  },
  {
    id: "2",
    title: "Rappel formation",
    message: "Votre formation commence demain à 9h.",
    type: "push",
    status: "scheduled",
    recipients: 12,
    scheduledAt: "2024-01-25",
  },
  {
    id: "3",
    title: "Bienvenue sur C&Co",
    message: "Découvrez nos formations et commencez votre parcours.",
    type: "in_app",
    status: "sent",
    recipients: 45,
    sentAt: "2024-01-18",
    openRate: 92,
  },
  {
    id: "4",
    title: "Promotion janvier",
    message: "-20% sur toutes les formations jusqu'au 31 janvier.",
    type: "email",
    status: "draft",
    recipients: 0,
  },
];

const typeConfig = {
  email: { label: "Email", icon: Mail, color: "bg-blue-500/15 text-blue-600" },
  push: { label: "Push", icon: Smartphone, color: "bg-purple-500/15 text-purple-600" },
  in_app: { label: "In-App", icon: Globe, color: "bg-green-500/15 text-green-600" },
};

const statusConfig = {
  draft: { label: "Brouillon", color: "bg-muted text-muted-foreground" },
  scheduled: { label: "Programmé", color: "bg-amber-500/15 text-amber-600" },
  sent: { label: "Envoyé", color: "bg-green-500/15 text-green-600" },
};

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);

  const filteredNotifications = demoNotifications.filter((notif) =>
    notif.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSent = demoNotifications.filter((n) => n.status === "sent").length;
  const totalRecipients = demoNotifications
    .filter((n) => n.status === "sent")
    .reduce((sum, n) => sum + n.recipients, 0);
  const avgOpenRate =
    demoNotifications
      .filter((n) => n.openRate)
      .reduce((sum, n) => sum + (n.openRate || 0), 0) /
    demoNotifications.filter((n) => n.openRate).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Gérez et envoyez des notifications aux utilisateurs
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle notification
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total envoyées</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destinataires</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecipients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'ouverture</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {avgOpenRate.toFixed(0)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programmées</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {demoNotifications.filter((n) => n.status === "scheduled").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Notifications par email</p>
                <p className="text-sm text-muted-foreground">
                  Envoyer des emails aux utilisateurs
                </p>
              </div>
            </div>
            <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Notifications push</p>
                <p className="text-sm text-muted-foreground">
                  Envoyer des notifications push sur mobile
                </p>
              </div>
            </div>
            <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une notification..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notification</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Destinataires</TableHead>
                <TableHead>Taux d'ouverture</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.map((notif) => {
                const typeInfo = typeConfig[notif.type];
                const statusInfo = statusConfig[notif.status];
                const TypeIcon = typeInfo.icon;
                return (
                  <TableRow key={notif.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium">{notif.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-xs">
                        {notif.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={typeInfo.color}>
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {typeInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {notif.recipients}
                      </div>
                    </TableCell>
                    <TableCell>
                      {notif.openRate ? (
                        <span className="text-green-600">{notif.openRate}%</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {notif.sentAt
                          ? new Date(notif.sentAt).toLocaleDateString("fr-FR")
                          : notif.scheduledAt
                          ? new Date(notif.scheduledAt).toLocaleDateString("fr-FR")
                          : "-"}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredNotifications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucune notification trouvée
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
