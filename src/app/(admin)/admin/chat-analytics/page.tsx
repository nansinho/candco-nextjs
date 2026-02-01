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
  BarChart3,
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Download,
  RefreshCw,
  Calendar,
} from "lucide-react";

interface ConversationStats {
  date: string;
  conversations: number;
  messages: number;
  avgDuration: number;
  satisfaction: number;
  resolved: number;
}

const weeklyStats: ConversationStats[] = [
  { date: "2024-01-20", conversations: 45, messages: 180, avgDuration: 4.5, satisfaction: 92, resolved: 42 },
  { date: "2024-01-19", conversations: 38, messages: 152, avgDuration: 3.8, satisfaction: 88, resolved: 35 },
  { date: "2024-01-18", conversations: 52, messages: 210, avgDuration: 5.2, satisfaction: 95, resolved: 50 },
  { date: "2024-01-17", conversations: 41, messages: 165, avgDuration: 4.0, satisfaction: 90, resolved: 38 },
  { date: "2024-01-16", conversations: 35, messages: 140, avgDuration: 3.5, satisfaction: 85, resolved: 30 },
  { date: "2024-01-15", conversations: 48, messages: 195, avgDuration: 4.8, satisfaction: 91, resolved: 45 },
  { date: "2024-01-14", conversations: 30, messages: 120, avgDuration: 3.2, satisfaction: 87, resolved: 27 },
];

interface TopQuestion {
  question: string;
  count: number;
  resolved: boolean;
}

const topQuestions: TopQuestion[] = [
  { question: "Quelles formations proposez-vous ?", count: 125, resolved: true },
  { question: "Comment s'inscrire à une formation ?", count: 98, resolved: true },
  { question: "Quels sont les tarifs ?", count: 87, resolved: true },
  { question: "Les formations sont-elles certifiantes ?", count: 65, resolved: true },
  { question: "Puis-je obtenir un financement ?", count: 54, resolved: false },
];

export default function ChatAnalyticsPage() {
  const totalConversations = weeklyStats.reduce((sum, s) => sum + s.conversations, 0);
  const totalMessages = weeklyStats.reduce((sum, s) => sum + s.messages, 0);
  const avgSatisfaction = Math.round(
    weeklyStats.reduce((sum, s) => sum + s.satisfaction, 0) / weeklyStats.length
  );
  const avgDuration =
    weeklyStats.reduce((sum, s) => sum + s.avgDuration, 0) / weeklyStats.length;
  const resolutionRate = Math.round(
    (weeklyStats.reduce((sum, s) => sum + s.resolved, 0) / totalConversations) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics Chatbot
          </h1>
          <p className="text-muted-foreground">
            Analysez les performances de votre chatbot
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
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversations}</div>
            <p className="text-xs text-muted-foreground">7 derniers jours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalMessages}</div>
            <p className="text-xs text-muted-foreground">échangés</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durée moyenne</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {avgDuration.toFixed(1)} min
            </div>
            <p className="text-xs text-muted-foreground">par conversation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{avgSatisfaction}%</div>
            <Progress value={avgSatisfaction} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux résolution</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{resolutionRate}%</div>
            <Progress value={resolutionRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Daily Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques journalières</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Conversations</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Durée moy.</TableHead>
                <TableHead>Satisfaction</TableHead>
                <TableHead>Résolues</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeklyStats.map((stat) => (
                <TableRow key={stat.date}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(stat.date).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{stat.conversations}</Badge>
                  </TableCell>
                  <TableCell>{stat.messages}</TableCell>
                  <TableCell>{stat.avgDuration} min</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={stat.satisfaction} className="h-2 w-16" />
                      <span className="text-sm">{stat.satisfaction}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-500/15 text-green-600">
                      {stat.resolved} / {stat.conversations}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Questions les plus fréquentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Occurrences</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topQuestions.map((q, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{q.question}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{q.count}</Badge>
                  </TableCell>
                  <TableCell>
                    {q.resolved ? (
                      <Badge className="bg-green-500/15 text-green-600">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        Réponse auto
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/15 text-amber-600">
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        À améliorer
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
