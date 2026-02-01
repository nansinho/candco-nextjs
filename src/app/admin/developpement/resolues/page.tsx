"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CheckCircle, Archive, Undo2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  useResolvedDevRequests,
  useArchiveDevRequest,
  useUpdateDevRequest,
  PRIORITY_LABELS,
  PRIORITY_BADGE_COLORS,
} from "@/hooks/admin/useDevRequests";
import { cn } from "@/lib/utils";

export default function ResoluesPage() {
  const [mounted, setMounted] = useState(false);
  const { data: requests = [], isLoading } = useResolvedDevRequests();
  const archiveRequest = useArchiveDevRequest();
  const updateRequest = useUpdateDevRequest();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleReopen = (id: string) => {
    updateRequest.mutate({ id, status: "en_cours", column_slug: "en_cours" });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Demandes résolues
          </h1>
          <p className="text-muted-foreground">
            {requests.length} demande(s) résolue(s) en attente d'archivage
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des demandes résolues</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune demande résolue
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Résolue le</TableHead>
                  <TableHead>Créateur</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.title}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", PRIORITY_BADGE_COLORS[request.priority])}
                      >
                        {PRIORITY_LABELS[request.priority]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.resolved_at
                        ? format(new Date(request.resolved_at), "dd MMM yyyy", { locale: fr })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {request.creator
                        ? `${request.creator.first_name || ""} ${request.creator.last_name || ""}`.trim() || "Inconnu"
                        : "Inconnu"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReopen(request.id)}
                        disabled={updateRequest.isPending}
                      >
                        <Undo2 className="h-4 w-4 mr-1" />
                        Rouvrir
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="secondary" size="sm">
                            <Archive className="h-4 w-4 mr-1" />
                            Archiver
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Archiver cette demande ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette demande sera déplacée vers les archives.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => archiveRequest.mutate(request.id)}
                            >
                              Archiver
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
