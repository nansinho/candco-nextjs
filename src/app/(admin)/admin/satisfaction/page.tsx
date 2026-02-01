"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Star,
  Search,
  Download,
  TrendingUp,
  Users,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface SatisfactionSurvey {
  id: string;
  formation: string;
  session: string;
  date: string;
  responses: number;
  avgRating: number;
  nps: number;
  recommend: number;
}

const demoSurveys: SatisfactionSurvey[] = [
  {
    id: "1",
    formation: "SST Initial",
    session: "Session Janvier 2024",
    date: "2024-01-20",
    responses: 12,
    avgRating: 4.8,
    nps: 85,
    recommend: 100,
  },
  {
    id: "2",
    formation: "Incendie EPI",
    session: "Session Janvier 2024",
    date: "2024-01-18",
    responses: 8,
    avgRating: 4.5,
    nps: 75,
    recommend: 87,
  },
  {
    id: "3",
    formation: "CAP AEPE Module 1",
    session: "Session Décembre 2023",
    date: "2024-01-15",
    responses: 15,
    avgRating: 4.9,
    nps: 92,
    recommend: 100,
  },
  {
    id: "4",
    formation: "Gestes et postures",
    session: "Session Janvier 2024",
    date: "2024-01-10",
    responses: 20,
    avgRating: 4.2,
    nps: 65,
    recommend: 80,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : star - 0.5 <= rating
              ? "fill-amber-400/50 text-amber-400"
              : "text-muted-foreground"
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

function NPSBadge({ nps }: { nps: number }) {
  const color =
    nps >= 70
      ? "bg-green-500/15 text-green-600"
      : nps >= 30
      ? "bg-amber-500/15 text-amber-600"
      : "bg-destructive/15 text-destructive";

  return (
    <Badge className={color}>
      NPS: {nps}
    </Badge>
  );
}

export default function SatisfactionPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSurveys = demoSurveys.filter((survey) =>
    survey.formation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalResponses = demoSurveys.reduce((sum, s) => sum + s.responses, 0);
  const avgRating = demoSurveys.reduce((sum, s) => sum + s.avgRating, 0) / demoSurveys.length;
  const avgNPS = Math.round(demoSurveys.reduce((sum, s) => sum + s.nps, 0) / demoSurveys.length);
  const avgRecommend = Math.round(demoSurveys.reduce((sum, s) => sum + s.recommend, 0) / demoSurveys.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Star className="h-6 w-6" />
            Satisfaction
          </h1>
          <p className="text-muted-foreground">
            Suivez la satisfaction des stagiaires et les retours de formation
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter le rapport
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réponses totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
            <p className="text-xs text-muted-foreground">
              sur {demoSurveys.length} enquêtes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <Star className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}/5</div>
            <Progress value={avgRating * 20} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS moyen</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{avgNPS}</div>
            <p className="text-xs text-muted-foreground">
              {avgNPS >= 70 ? "Excellent" : avgNPS >= 30 ? "Bon" : "À améliorer"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommandation</CardTitle>
            <ThumbsUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{avgRecommend}%</div>
            <p className="text-xs text-muted-foreground">
              recommanderaient la formation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une formation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enquêtes de satisfaction</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Formation</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Réponses</TableHead>
                <TableHead>Note moyenne</TableHead>
                <TableHead>NPS</TableHead>
                <TableHead>Recommandation</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSurveys.map((survey) => (
                <TableRow key={survey.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{survey.formation}</TableCell>
                  <TableCell>{survey.session}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 text-muted-foreground" />
                      {survey.responses}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StarRating rating={survey.avgRating} />
                  </TableCell>
                  <TableCell>
                    <NPSBadge nps={survey.nps} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {survey.recommend >= 80 ? (
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <ThumbsDown className="h-4 w-4 text-amber-600" />
                      )}
                      <span>{survey.recommend}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(survey.date).toLocaleDateString("fr-FR")}
                  </TableCell>
                </TableRow>
              ))}
              {filteredSurveys.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune enquête trouvée
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
