"use client";

/**
 * @file DevRequestsPageContent.tsx
 * @description Contenu de la page de gestion des demandes de développement
 * Ce composant est chargé dynamiquement avec ssr: false pour éviter les erreurs d'hydratation
 */

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Kanban,
  List,
  Filter,
  X,
  Code,
  Loader2,
} from "lucide-react";
import {
  useDevRequests,
  DevRequest,
  DevRequestPriority,
  PRIORITY_LABELS,
} from "@/hooks/admin/useDevRequests";
import { DevRequestKanban } from "./DevRequestKanban";
import { DevRequestDialog } from "./DevRequestDialog";
import { DevRequestDetail } from "./DevRequestDetail";

type ViewMode = "kanban" | "list";

export default function DevRequestsPageContent() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<DevRequestPriority | "all">("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DevRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: requests = [], isLoading } = useDevRequests(true);

  // Filter requests based on search and priority
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = request.title.toLowerCase().includes(query);
        const matchesDescription = request.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription) return false;
      }

      if (priorityFilter !== "all" && request.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [requests, searchQuery, priorityFilter]);

  const handleRequestClick = (request: DevRequest) => {
    setSelectedRequest(request);
    setDetailOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPriorityFilter("all");
  };

  const hasActiveFilters = searchQuery || priorityFilter !== "all";

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Code className="h-6 w-6" />
            Demandes de développement
          </h1>
          <p className="text-muted-foreground">
            Gérez les demandes d'évolution et de correction du site
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Nouvelle demande</span>
          <span className="sm:hidden">Nouvelle</span>
        </Button>
      </div>

      {/* Filters and view toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Priority filter */}
              <Select
                value={priorityFilter}
                onValueChange={(v) => setPriorityFilter(v as DevRequestPriority | "all")}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="shrink-0"
                >
                  <X className="h-4 w-4 mr-2" />
                  Effacer
                </Button>
              )}

              {/* View toggle */}
              <Tabs
                value={viewMode}
                onValueChange={(v) => setViewMode(v as ViewMode)}
                className="sm:ml-auto"
              >
                <TabsList>
                  <TabsTrigger value="kanban" className="gap-2 whitespace-nowrap">
                    <Kanban className="h-4 w-4" />
                    <span>Kanban</span>
                  </TabsTrigger>
                  <TabsTrigger value="list" className="gap-2 whitespace-nowrap">
                    <List className="h-4 w-4" />
                    <span>Liste</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : viewMode === "kanban" ? (
        <DevRequestKanban
          requests={filteredRequests}
          onRequestClick={handleRequestClick}
        />
      ) : (
        <Card>
          <CardContent className="p-0 sm:p-4">
            {/* Simple list view */}
            <div className="divide-y">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleRequestClick(request)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-medium">{request.title}</h3>
                      {request.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {request.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {PRIORITY_LABELS[request.priority]}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredRequests.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Aucune demande trouvée
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create dialog */}
      <DevRequestDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Detail panel */}
      <DevRequestDetail
        request={selectedRequest}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
