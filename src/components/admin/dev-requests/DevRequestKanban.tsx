"use client";

/**
 * @file DevRequestKanban.tsx
 * @description Kanban board pour les demandes de développement
 */

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  CollisionDetection,
  UniqueIdentifier,
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

function groupByColumnSlug(requests: DevRequest[], columns: ColumnType[]): Record<string, DevRequest[]> {
  const grouped: Record<string, DevRequest[]> = {};

  columns.forEach((col) => {
    grouped[col.slug] = [];
  });

  requests.forEach((request) => {
    const columnSlug = request.column_slug || request.status;
    if (grouped[columnSlug]) {
      grouped[columnSlug].push(request);
    } else {
      const defaultColumn = columns.find(c => c.is_default);
      if (defaultColumn && grouped[defaultColumn.slug]) {
        grouped[defaultColumn.slug].push(request);
      } else if (grouped["nouvelle"]) {
        grouped["nouvelle"].push(request);
      }
    }
  });

  Object.keys(grouped).forEach((slug) => {
    grouped[slug].sort((a, b) => a.column_order - b.column_order);
  });

  return grouped;
}

const customCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  const rectCollisions = rectIntersection(args);
  if (rectCollisions.length > 0) {
    return rectCollisions;
  }

  return closestCenter(args);
};

export function DevRequestKanban({
  requests,
  onRequestClick,
  showResolved = false
}: DevRequestKanbanProps) {
  const batchUpdate = useBatchUpdateColumnOrder();

  const { data: dbColumns = [] } = useDevRequestColumns();
  const updateColumn = useUpdateDevRequestColumn();
  const deleteColumn = useDeleteDevRequestColumn();

  const [localBoard, setLocalBoard] = useState<Record<string, DevRequest[]>>(() =>
    groupByColumnSlug(requests, dbColumns)
  );

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [boardSnapshot, setBoardSnapshot] = useState<Record<string, DevRequest[]> | null>(null);

  useEffect(() => {
    if (!activeId) {
      setLocalBoard(groupByColumnSlug(requests, dbColumns));
    } else {
      setLocalBoard(prev => {
        const newBoard: Record<string, DevRequest[]> = {};

        Object.entries(prev).forEach(([columnSlug, cards]) => {
          newBoard[columnSlug] = cards.map(card => {
            const updatedCard = requests.find(r => r.id === card.id);
            return updatedCard || card;
          }).filter(card => {
            return requests.some(r => r.id === card.id);
          });
        });

        requests.forEach(request => {
          const existsInBoard = Object.values(newBoard).some(cards =>
            cards.some(c => c.id === request.id)
          );

          if (!existsInBoard) {
            const columnSlug = request.column_slug || request.status;
            if (!newBoard[columnSlug]) {
              newBoard[columnSlug] = [];
            }
            newBoard[columnSlug].push(request);
          }
        });

        return newBoard;
      });
    }
  }, [requests, activeId, dbColumns]);

  const visibleColumns = useMemo(() => {
    if (dbColumns.length === 0) return [];
    return showResolved
      ? dbColumns
      : dbColumns.filter(c => !c.is_resolved);
  }, [dbColumns, showResolved]);

  const activeRequest = useMemo(() => {
    if (!activeId) return null;
    for (const cards of Object.values(localBoard)) {
      const found = cards.find((r) => r.id === activeId);
      if (found) return found;
    }
    return null;
  }, [activeId, localBoard]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    setBoardSnapshot(JSON.parse(JSON.stringify(localBoard)));
  }, [localBoard]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeCardId = active.id as string;
    const overId = over.id;

    setLocalBoard((prev) => {
      const board = { ...prev };
      dbColumns.forEach(col => {
        if (!board[col.slug]) {
          board[col.slug] = [];
        }
      });

      let sourceColumn: DevRequestStatus | null = null;
      let cardIndex = -1;

      for (const [status, cards] of Object.entries(board)) {
        const idx = cards.findIndex((r) => r.id === activeCardId);
        if (idx !== -1) {
          sourceColumn = status as DevRequestStatus;
          cardIndex = idx;
          break;
        }
      }

      if (!sourceColumn || cardIndex === -1) return prev;

      let targetColumn: DevRequestStatus | undefined;
      let targetIndex: number = 0;

      const overData = over.data.current;

      if (overData?.type === "column") {
        targetColumn = overData.status as DevRequestStatus;
        targetIndex = board[targetColumn]?.length || 0;
      } else if (overData?.type === "card") {
        targetColumn = overData.status as DevRequestStatus;
        const overIndex = board[targetColumn]?.findIndex((r) => r.id === overId) ?? -1;
        targetIndex = overIndex !== -1 ? overIndex : (board[targetColumn]?.length || 0);
      } else if (dbColumns.some(c => c.slug === overId)) {
        targetColumn = overId as DevRequestStatus;
        targetIndex = board[targetColumn]?.length || 0;
      } else {
        for (const [status, cards] of Object.entries(board)) {
          const idx = cards.findIndex((r) => r.id === overId);
          if (idx !== -1) {
            targetColumn = status as DevRequestStatus;
            targetIndex = idx;
            break;
          }
        }
        if (!targetColumn) return prev;
      }

      if (!targetColumn) return prev;

      if (sourceColumn === targetColumn) {
        if (cardIndex === targetIndex || cardIndex === targetIndex - 1) {
          return prev;
        }
      }

      const newBoard = { ...board };

      if (!newBoard[targetColumn]) {
        newBoard[targetColumn] = [];
      }

      const sourceCards = [...board[sourceColumn]];
      const [movedCard] = sourceCards.splice(cardIndex, 1);
      newBoard[sourceColumn] = sourceCards;

      const targetCards = [...(newBoard[targetColumn] || [])].filter((r) => r.id !== activeCardId);

      let adjustedIndex = targetIndex;
      if (sourceColumn === targetColumn && cardIndex < targetIndex) {
        adjustedIndex = Math.max(0, targetIndex - 1);
      }
      adjustedIndex = Math.min(adjustedIndex, targetCards.length);

      targetCards.splice(adjustedIndex, 0, { ...movedCard, column_slug: targetColumn });
      newBoard[targetColumn] = targetCards;

      return newBoard;
    });
  }, [dbColumns]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    const currentBoard = { ...localBoard };

    if (!over) {
      if (boardSnapshot) {
        setLocalBoard(boardSnapshot);
      }
      setActiveId(null);
      setBoardSnapshot(null);
      return;
    }

    const activeCardId = active.id as string;

    let finalColumn: DevRequestStatus | null = null;
    let finalIndex = 0;

    for (const [status, cards] of Object.entries(currentBoard)) {
      const index = cards.findIndex((r) => r.id === activeCardId);
      if (index !== -1) {
        finalColumn = status as DevRequestStatus;
        finalIndex = index;
        break;
      }
    }

    if (!finalColumn) {
      setActiveId(null);
      setBoardSnapshot(null);
      return;
    }

    const originalRequest = requests.find((r) => r.id === activeCardId);
    if (!originalRequest) {
      setActiveId(null);
      setBoardSnapshot(null);
      return;
    }

    const columnSlugChanged = (originalRequest.column_slug || originalRequest.status) !== finalColumn;
    const orderChanged = originalRequest.column_order !== finalIndex;

    setActiveId(null);
    setBoardSnapshot(null);

    if (!columnSlugChanged && !orderChanged) {
      return;
    }

    const updates: { id: string; column_order: number; column_slug?: string }[] = [];

    currentBoard[finalColumn].forEach((card, index) => {
      const original = requests.find((r) => r.id === card.id);
      const originalColumnSlug = original ? (original.column_slug || original.status) : null;
      const needsColumnUpdate = originalColumnSlug !== finalColumn;
      const needsOrderUpdate = original && original.column_order !== index;

      if (needsColumnUpdate || needsOrderUpdate) {
        updates.push({
          id: card.id,
          column_order: index,
          column_slug: needsColumnUpdate ? finalColumn : undefined,
        });
      }
    });

    if (columnSlugChanged) {
      const sourceColumn = originalRequest.column_slug || originalRequest.status;
      currentBoard[sourceColumn]?.forEach((card, index) => {
        const original = requests.find((r) => r.id === card.id);
        if (original && original.column_order !== index) {
          if (!updates.some((u) => u.id === card.id)) {
            updates.push({
              id: card.id,
              column_order: index,
            });
          }
        }
      });
    }

    if (updates.length > 0) {
      // UN SEUL appel batch pour TOUTES les mises à jour
      // Évite les race conditions et la boucle infinie de React Query
      batchUpdate.mutate(updates);
    }
  }, [localBoard, requests, batchUpdate, boardSnapshot]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    if (boardSnapshot) {
      setLocalBoard(boardSnapshot);
    }
    setBoardSnapshot(null);
  }, [boardSnapshot]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      autoScroll={{
        layoutShiftCompensation: false,
        acceleration: 15,
        threshold: { x: 0.15, y: 0.15 },
      }}
    >
      <ScrollArea className="w-full">
        <div className="flex gap-3 sm:gap-4 p-2 sm:p-4 min-w-max">
          {visibleColumns.map((column) => (
            <DevRequestColumn
              key={column.slug}
              status={column.slug as DevRequestStatus}
              requests={localBoard[column.slug] || []}
              onRequestClick={onRequestClick}
              isActivelyDragging={activeId !== null}
              columnName={column.name}
              columnColor={column.color ?? undefined}
              isSystem={column.is_system}
              onRename={!column.is_system ? (newName) => updateColumn.mutate({ id: column.id, name: newName }) : undefined}
              onColorChange={!column.is_system ? (newColor) => updateColumn.mutate({ id: column.id, color: newColor }) : undefined}
              onDelete={!column.is_system ? () => deleteColumn.mutate(column.id) : undefined}
            />
          ))}

          <AddColumnButton />
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}
        style={{ zIndex: 9999 }}
      >
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
