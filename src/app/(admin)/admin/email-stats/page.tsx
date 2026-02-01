"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Mail,
  Send,
  CheckCircle2,
  XCircle,
  MousePointer,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  sentAt: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
}

const demoCampaigns: EmailCampaign[] = [
  {
    id: "1",
    name: "Newsletter Janvier",
    subject: "Les nouveautés de janvier 2024",
    sentAt: "2024-01-20",
    sent: 1250,
    delivered: 1230,
    opened: 820,
    clicked: 245,
    bounced: 20,
  },
  {
    id: "2",
    name: "Rappel inscription",
    subject: "N'oubliez pas de finaliser votre inscription",
    sentAt: "2024-01-18",
    sent: 450,
    delivered: 445,
    opened: 380,
    clicked: 156,
    bounced: 5,
  },
  {
    id: "3",
    name: "Promotion hiver",
    subject: "-20% sur toutes les formations",
    sentAt: "2024-01-15",
    sent: 2100,
    delivered: 2050,
    opened: 1450,
    clicked: 520,
    bounced: 50,
  },
  {
    id: "4",
    name: "Bienvenue",
    subject: "Bienvenue chez C&Co Formation",
    sentAt: "2024-01-10",
    sent: 85,
    delivered: 84,
    opened: 72,
    clicked: 45,
    bounced: 1,
  },
];

export default function EmailStatsPage() {
  const totalSent = demoCampaigns.reduce((sum, c) => sum + c.sent, 0);
  const totalDelivered = demoCampaigns.reduce((sum, c) => sum + c.delivered, 0);
  const totalOpened = demoCampaigns.reduce((sum, c) => sum + c.opened, 0);
  const totalClicked = demoCampaigns.reduce((sum, c) => sum + c.clicked, 0);

  const deliveryRate = ((totalDelivered / totalSent) * 100).toFixed(1);
  const openRate = ((totalOpened / totalDelivered) * 100).toFixed(1);
  const clickRate = ((totalClicked / totalOpened) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Statistiques Email
          </h1>
          <p className="text-muted-foreground">
            Analysez les performances de vos campagnes email
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails envoyés</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {demoCampaigns.length} campagnes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de livraison</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deliveryRate}%</div>
            <Progress value={parseFloat(deliveryRate)} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'ouverture</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{openRate}%</div>
            <Progress value={parseFloat(openRate)} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de clic</CardTitle>
            <MousePointer className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{clickRate}%</div>
            <Progress value={parseFloat(clickRate)} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Aperçu des performances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  Délivrés
                </span>
                <span className="font-medium">{totalDelivered.toLocaleString()}</span>
              </div>
              <Progress value={(totalDelivered / totalSent) * 100} className="h-2 bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  Ouverts
                </span>
                <span className="font-medium">{totalOpened.toLocaleString()}</span>
              </div>
              <Progress value={(totalOpened / totalDelivered) * 100} className="h-2 bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500" />
                  Cliqués
                </span>
                <span className="font-medium">{totalClicked.toLocaleString()}</span>
              </div>
              <Progress value={(totalClicked / totalOpened) * 100} className="h-2 bg-muted" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campagnes récentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campagne</TableHead>
                <TableHead>Envoyés</TableHead>
                <TableHead>Délivrés</TableHead>
                <TableHead>Ouverts</TableHead>
                <TableHead>Cliqués</TableHead>
                <TableHead>Rebonds</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoCampaigns.map((campaign) => {
                const campaignOpenRate = ((campaign.opened / campaign.delivered) * 100).toFixed(0);
                const campaignClickRate = ((campaign.clicked / campaign.opened) * 100).toFixed(0);
                return (
                  <TableRow key={campaign.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="font-medium">{campaign.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-xs">
                        {campaign.subject}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Send className="h-3 w-3 text-muted-foreground" />
                        {campaign.sent}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/15 text-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {campaign.delivered}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{campaign.opened}</span>
                        <Badge variant="outline" className="text-xs">
                          {campaignOpenRate}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{campaign.clicked}</span>
                        <Badge variant="outline" className="text-xs">
                          {campaignClickRate}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {campaign.bounced > 0 ? (
                        <Badge className="bg-destructive/15 text-destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          {campaign.bounced}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {new Date(campaign.sentAt).toLocaleDateString("fr-FR")}
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
