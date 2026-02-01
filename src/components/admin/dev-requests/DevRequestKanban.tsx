"use client";

/**
 * @file DevRequestKanban.tsx
 * @description Kanban board simplifié pour les demandes de développement
 * Réécrit pour éviter les boucles infinies React
 */

import { useState, useMemo, useCallback, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DevRequest,
  DevRequestStatus,
  DevRequestColumn as ColumnType,
  useDevRequestColumns,
  useUpdateDevRequestColumn,
  useDeleteDevRequestColumn,
  useBatchUpdateColumnOrder,
} from "@/hooks/admin/useDevRequests";
import { DevRequestColumn } from "./DevRequestColumn";
import { DevRequestCard } from "./DevRequestCard";
import { AddColumnButton } from "./AddColumnButton";

interface DevRequestKanbanProps {
  requests: DevRequest[];
  onRequestClick: (request: DevRequest) => void;
  showResolved?: boolean;
}

// Groupe les requêtes par colonne
function groupRequests(requests: DevRequest[], columns: ColumnType[]): Record<string, DevRequest[]> {
  const result: Record<string, DevRequest[]> = {};

  // Initialiser toutes les colonnes
  columns.forEach(col => {
    result[col.slug] = [];
  });

  // Distribuer les requêtes
  requests.forEach(request => {
    const slug = request.column_slug || request.status;
    if (result[slug]) {
      result[slug].push(request);
    } else if (result["nouvelle"]) {
      result["nouvelle"].push(request);
    }
  });

  // Trier par column_order
  Object.keys(result).forEach(slug => {
    result[slug].sort((a, b) => a.column_order - b.column_order);
  });

  return result;
}

export function DevRequestKanban({
  requests,
  onRequestClick,
  showResolved = false
}: DevRequestKanbanProps) {
  const { data: dbColumns = [] } = useDevRequestColumns();
  const updateColumn = useUpdateDevRequestColumn();
  const deleteColumn = useDeleteDevRequestColumn();
  const batchUpdate = useBatchUpdateColumnOrder();

  // État pour le drag en cours
  const [activeId, setActiveId] = useState<string | null>(null);

  // Ref pour éviter les doubles soumissions
  const isSubmitting = useRef(false);

  // Colonnes visibles
  const visibleColumns = useMemo(() => {
    if (dbColumns.length === 0) return [];
    return showResolved
      ? dbColumns
      : dbColumns.filter(c => !c.is_resolved);
  }, [dbColumns, showResolved]);

  // Grouper les requêtes par colonne (calculé à chaque render, pas de useEffect)
  const boardData = useMemo(() => {
    return groupRequests(requests, visibleColumns);
  }, [requests, visibleColumns]);

  // Trouver la requête active
  const activeRequest = useMemo(() => {
    if (!activeId) return null;
    return requests.find(r => r.id === activeId) || null;
  }, [activeId, requests]);

  // Configuration des sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Début du drag
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // Fin du drag
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over || isSubmitting.current) return;

    const draggedId = active.id as string;
    const draggedRequest = requests.find(r => r.id === draggedId);
    if (!draggedRequest) return;

    // Déterminer la colonne cible
    let targetColumn: string | null = null;

    const overData = over.data.current;
    if (overData?.type === "column") {
      targetColumn = overData.columnSlug as string;
    } else if (overData?.type === "card") {
      targetColumn = overData.columnSlug as string;
    } else {
      // L'ID pourrait être le slug de la colonne
      if (visibleColumns.some(c => c.slug === over.id)) {
        targetColumn = over.id as string;
      }
    }

    if (!targetColumn) return;

    const sourceColumn = draggedRequest.column_slug || draggedRequest.status;

    // Si pas de changement de colonne, ne rien faire
    if (sourceColumn === targetColumn) return;

    // Préparer les mises à jour
    isSubmitting.current = true;

    const updates: { id: string; column_order: number; column_slug?: string }[] = [];

    // Mettre à jour l'élément déplacé
    const targetCards = boardData[targetColumn] || [];
    updates.push({
      id: draggedId,
      column_order: targetCards.length,
      column_slug: targetColumn,
    });

    // Réordonner la colonne source
    const sourceCards = boardData[sourceColumn]?.filter(c => c.id !== draggedId) || [];
    sourceCards.forEach((card, index) => {
      if (card.column_order !== index) {
        updates.push({
          id: card.id,
          column_order: index,
        });
      }
    });

    if (updates.length > 0) {
      batchUpdate.mutate(updates, {
        onSettled: () => {
          isSubmitting.current = false;
        },
      });
    } else {
      isSubmitting.current = false;
    }
  }, [requests, visibleColumns, boardData, batchUpdate]);

  // Annulation du drag
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  // Callbacks pour les colonnes (mémorisés)
  const handleColumnRename = useCallback((columnId: string) => (newName: string) => {
    updateColumn.mutate({ id: columnId, name: newName });
  }, [updateColumn]);

  const handleColumnColorChange = useCallback((columnId: string) => (newColor: string) => {
    updateColumn.mutate({ id: columnId, color: newColor });
  }, [updateColumn]);

  const handleColumnDelete = useCallback((columnId: string) => () => {
    deleteColumn.mutate(columnId);
  }, [deleteColumn]);

  if (visibleColumns.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Chargement des colonnes...
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <ScrollArea className="w-full">
        <div className="flex gap-3 sm:gap-4 p-2 sm:p-4 min-w-max">
          {visibleColumns.map((column) => (
            <DevRequestColumn
              key={column.slug}
              columnSlug={column.slug}
              columnName={column.name}
              columnColor={column.color ?? undefined}
              isSystem={column.is_system}
              requests={boardData[column.slug] || []}
              onRequestClick={onRequestClick}
              isDragging={activeId !== null}
              onRename={!column.is_system ? handleColumnRename(column.id) : undefined}
              onColorChange={!column.is_system ? handleColumnColorChange(column.id) : undefined}
              onDelete={!column.is_system ? handleColumnDelete(column.id) : undefined}
            />
          ))}
          <AddColumnButton />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <DragOverlay dropAnimation={{ duration: 200, easing: "ease-out" }}>
        {activeRequest ? (
          <DevRequestCard
            request={activeRequest}
            onClick={() => {}}
            isDragOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
