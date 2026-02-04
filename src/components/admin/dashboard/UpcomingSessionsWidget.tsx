"use client";

import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import type { UpcomingSession } from "@/hooks/admin/useDashboardData";

interface UpcomingSessionsWidgetProps {
  sessions: UpcomingSession[] | undefined;
  isLoading: boolean;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "confirmee":
      return <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">Confirmée</Badge>;
    case "planifiee":
      return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 text-xs">Planifiée</Badge>;
    default:
      return <Badge variant="secondary" className="text-xs">{status}</Badge>;
  }
}

function getPlacesBadge(inscrits: number, max: number) {
  if (inscrits >= max) {
    return <Badge className="bg-red-500/20 text-red-600 border-red-500/30 text-xs">Complet</Badge>;
  }
  const restantes = max - inscrits;
  if (restantes <= 2) {
    return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30 text-xs">{inscrits} inscrits / {max} places</Badge>;
  }
  return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-xs">{inscrits} inscrits / {max} places</Badge>;
}

export function UpcomingSessionsWidget({ sessions, isLoading }: UpcomingSessionsWidgetProps) {
  return (
    <Card className="lg:col-span-1 border-0 bg-secondary/30 min-w-0 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6 sm:pb-2">
        <div>
          <CardTitle className={`flex items-center gap-2 ${adminStyles.cardTitle}`}>
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Prochaines sessions
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Sessions planifiées à venir
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
          <Link href="/admin/sessions">
            <span className="hidden sm:inline">Voir tout</span>
            <ArrowRight className="sm:ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-3">
          {isLoading ? (
            // Skeleton loading state
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-background/50">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </>
          ) : sessions && sessions.length > 0 ? (
            // Sessions list
            sessions.map((session) => (
              <Link
                key={session.id}
                href={`/admin/sessions/${session.id}`}
                className="block p-4 rounded-xl bg-background/50 hover:bg-background transition-colors group"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {session.formation_title}
                    </h4>
                    {getStatusBadge(session.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(session.start_date), "d MMM yyyy", { locale: fr })}
                    </span>
                    {session.lieu && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {session.lieu}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {getPlacesBadge(session.inscriptions_count, session.places_max)}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            // Empty state
            <div className="text-center py-8">
              <Calendar className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Aucune session à venir
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href="/admin/sessions/new">
                  Créer une session
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
