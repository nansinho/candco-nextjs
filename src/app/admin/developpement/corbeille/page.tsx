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
import { Trash2, Undo2, Loader2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  useDeletedDevRequests,
  useRestoreDevRequest,
  usePermanentDeleteDevRequest,
  useEmptyTrash,
  PRIORITY_LABELS,
  PRIORITY_BADGE_COLORS,
} from "@/hooks/admin/useDevRequests";
import { cn } from "@/lib/utils";

export default function CorbeillePage() {
  const [mounted, setMounted] = useState(false);
  const { data: requests = [], isLoading } = useDeletedDevRequests();
  const restoreRequest = useRestoreDevRequest();
  const permanentDelete = usePermanentDeleteDevRequest();
  const emptyTrash = useEmptyTrash();

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

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trash2 className="h-6 w-6 text-destructive" />
            Corbeille
          </h1>
          <p className="text-muted-foreground">
            {requests.length} demande(s) supprimée(s) - Conservation 30 jours
          </p>
        </div>
        {requests.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Vider la corbeille
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Vider la corbeille ?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Toutes les demandes ({requests.length}) seront
                  supprimées définitivement.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => emptyTrash.mutate()}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Vider définitivement
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demandes supprimées</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              La corbeille est vide
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Supprimée le</TableHead>
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
                      {request.deleted_at
                        ? format(new Date(request.deleted_at), "dd MMM yyyy HH:mm", { locale: fr })
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
                        onClick={() => restoreRequest.mutate(request.id)}
                        disabled={restoreRequest.isPending}
                      >
                        <Undo2 className="h-4 w-4 mr-1" />
                        Restaurer
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Supprimer
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer définitivement ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. La demande sera supprimée
                              définitivement.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => permanentDelete.mutate(request.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Supprimer définitivement
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
