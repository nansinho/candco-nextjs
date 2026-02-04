"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Users, ArrowRight, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import type { RecentInscription } from "@/hooks/admin/useDashboardData";

interface RecentInscriptionsWidgetProps {
  inscriptions: RecentInscription[] | undefined;
  isLoading: boolean;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "confirmee":
      return <Badge className="bg-green-500/20 text-green-600 border-green-500/30 text-xs">Confirmée</Badge>;
    case "en_attente":
      return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 text-xs">En attente</Badge>;
    case "annulee":
      return <Badge className="bg-red-500/20 text-red-600 border-red-500/30 text-xs">Annulée</Badge>;
    default:
      return <Badge variant="secondary" className="text-xs">{status}</Badge>;
  }
}

export function RecentInscriptionsWidget({ inscriptions, isLoading }: RecentInscriptionsWidgetProps) {
  return (
    <Card className="border-0 bg-secondary/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6 sm:pb-2">
        <div>
          <CardTitle className={`flex items-center gap-2 ${adminStyles.cardTitle}`}>
            <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Dernières inscriptions
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Inscriptions récentes aux sessions
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
        <div className="space-y-2">
          {isLoading ? (
            // Skeleton loading state
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </>
          ) : inscriptions && inscriptions.length > 0 ? (
            // Inscriptions list
            inscriptions.map((inscription) => (
              <div
                key={inscription.id}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-foreground truncate">
                      {inscription.prenom} {inscription.nom}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(inscription.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {inscription.formation_title}
                  </p>
                </div>
                <div className="ml-2 shrink-0">
                  {getStatusBadge(inscription.status)}
                </div>
              </div>
            ))
          ) : (
            // Empty state
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Aucune inscription récente
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
