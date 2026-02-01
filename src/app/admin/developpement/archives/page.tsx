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
import { Archive, Undo2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  useArchivedDevRequests,
  useUpdateDevRequest,
  PRIORITY_LABELS,
  PRIORITY_BADGE_COLORS,
} from "@/hooks/admin/useDevRequests";
import { cn } from "@/lib/utils";

export default function ArchivesPage() {
  const [mounted, setMounted] = useState(false);
  const { data: requests = [], isLoading } = useArchivedDevRequests();
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

  const handleRestore = (id: string) => {
    updateRequest.mutate({ id, status: "resolue", column_slug: "resolue" });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Archive className="h-6 w-6" />
            Archives
          </h1>
          <p className="text-muted-foreground">
            {requests.length} demande(s) archivée(s)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des demandes archivées</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune demande archivée
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Archivée le</TableHead>
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
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(request.id)}
                        disabled={updateRequest.isPending}
                      >
                        <Undo2 className="h-4 w-4 mr-1" />
                        Désarchiver
                      </Button>
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
