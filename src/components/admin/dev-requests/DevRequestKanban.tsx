"use client";

/**
 * @file DevRequestKanban.tsx
 * @description Kanban board avec drag-and-drop fluide pour les demandes de développement
 */

import { useState, useMemo, useCallback, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DevRequest,
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

type BoardState = Record<string, DevRequest[]>;

// Groupe les requêtes par colonne
function groupRequests(requests: DevRequest[], columns: ColumnType[]): BoardState {
  const result: BoardState = {};

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

  // État local optimiste pour le drag (permet une UI fluide)
  const [localBoard, setLocalBoard] = useState<BoardState | null>(null);

  // Ref pour éviter les doubles soumissions
  const isSubmitting = useRef(false);

  // Colonnes visibles
  const visibleColumns = useMemo(() => {
    if (dbColumns.length === 0) return [];
    return showResolved
      ? dbColumns
      : dbColumns.filter(c => !c.is_resolved);
  }, [dbColumns, showResolved]);

  // Données du board (utilise l'état local pendant le drag, sinon les données serveur)
  const serverBoard = useMemo(() => {
    return groupRequests(requests, visibleColumns);
  }, [requests, visibleColumns]);

  const boardData = localBoard || serverBoard;

  // Trouver la requête active
  const activeRequest = useMemo(() => {
    if (!activeId) return null;
    return requests.find(r => r.id === activeId) || null;
  }, [activeId, requests]);

  // Trouver dans quelle colonne se trouve une carte
  const findColumnForCard = useCallback((cardId: string, board: BoardState): string | null => {
    for (const [columnSlug, cards] of Object.entries(board)) {
      if (cards.some(c => c.id === cardId)) {
        return columnSlug;
      }
    }
    return null;
  }, []);

  // Configuration des sensors avec activation rapide
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Début du drag
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // Initialiser l'état local avec les données serveur
    setLocalBoard({ ...serverBoard });
  }, [serverBoard]);

  // Pendant le drag (pour le réordonnancement en temps réel)
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !localBoard) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Trouver les colonnes source et destination
    const activeColumn = findColumnForCard(activeId, localBoard);

    // L'élément over peut être une carte ou une colonne
    let overColumn = findColumnForCard(overId, localBoard);
    if (!overColumn && visibleColumns.some(c => c.slug === overId)) {
      overColumn = overId;
    }

    if (!activeColumn || !overColumn) return;

    // Si même colonne et même carte, ignorer
    if (activeColumn === overColumn && activeId === overId) return;

    setLocalBoard(prev => {
      if (!prev) return prev;

      const activeCards = [...prev[activeColumn]];
      const overCards = activeColumn === overColumn ? activeCards : [...prev[overColumn]];

      const activeIndex = activeCards.findIndex(c => c.id === activeId);
      const overIndex = overCards.findIndex(c => c.id === overId);

      // Si on trouve pas l'index, c'est qu'on survole une colonne vide
      const insertIndex = overIndex >= 0 ? overIndex : overCards.length;

      if (activeColumn === overColumn) {
        // Réordonnancement dans la même colonne
        const newCards = arrayMove(activeCards, activeIndex, insertIndex);
        return {
          ...prev,
          [activeColumn]: newCards,
        };
      } else {
        // Déplacement entre colonnes
        const [movedCard] = activeCards.splice(activeIndex, 1);
        overCards.splice(insertIndex, 0, movedCard);

        return {
          ...prev,
          [activeColumn]: activeCards,
          [overColumn]: overCards,
        };
      }
    });
  }, [localBoard, findColumnForCard, visibleColumns]);

  // Fin du drag
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over || !localBoard || isSubmitting.current) {
      setLocalBoard(null);
      return;
    }

    const draggedId = active.id as string;

    // Préparer les mises à jour basées sur l'état local
    isSubmitting.current = true;

    const updates: { id: string; column_order: number; column_slug?: string }[] = [];

    // Parcourir toutes les colonnes et enregistrer les changements
    for (const [columnSlug, cards] of Object.entries(localBoard)) {
      cards.forEach((card, index) => {
        const originalCard = requests.find(r => r.id === card.id);
        const originalColumn = originalCard?.column_slug || originalCard?.status;

        // Vérifier si position ou colonne a changé
        const columnChanged = originalColumn !== columnSlug;
        const orderChanged = originalCard?.column_order !== index;

        if (columnChanged || orderChanged) {
          updates.push({
            id: card.id,
            column_order: index,
            ...(columnChanged && { column_slug: columnSlug }),
          });
        }
      });
    }

    if (updates.length > 0) {
      batchUpdate.mutate(updates, {
        onSettled: () => {
          isSubmitting.current = false;
          setLocalBoard(null);
        },
      });
    } else {
      isSubmitting.current = false;
      setLocalBoard(null);
    }
  }, [localBoard, requests, batchUpdate]);

  // Annulation du drag
  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setLocalBoard(null);
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
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
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

      <DragOverlay dropAnimation={{ duration: 150, easing: "ease-out" }}>
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
