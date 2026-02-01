"use client";

/**
 * @file DevRequestColumn.tsx
 * @description Colonne simplifiée du Kanban pour les demandes
 */

import { useState, memo } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { DevRequest, STATUS_LABELS, DevRequestStatus } from "@/hooks/admin/useDevRequests";
import { DevRequestCard } from "./DevRequestCard";

interface DevRequestColumnProps {
  columnSlug: string;
  columnName: string;
  columnColor?: string;
  isSystem: boolean;
  requests: DevRequest[];
  onRequestClick: (request: DevRequest) => void;
  isDragging?: boolean;
  onRename?: (newName: string) => void;
  onDelete?: () => void;
  onColorChange?: (color: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  nouvelle: "bg-blue-500",
  a_trier: "bg-purple-500",
  en_cours: "bg-amber-500",
  prioritaire: "bg-destructive",
  resolue: "bg-green-500",
  archivee: "bg-muted-foreground",
};

const COLUMN_COLORS = [
  { name: "Bleu", value: "blue", class: "bg-blue-500" },
  { name: "Violet", value: "purple", class: "bg-purple-500" },
  { name: "Ambre", value: "amber", class: "bg-amber-500" },
  { name: "Vert", value: "green", class: "bg-green-500" },
  { name: "Rouge", value: "red", class: "bg-destructive" },
  { name: "Gris", value: "gray", class: "bg-muted-foreground" },
];

function DevRequestColumnInner({
  columnSlug,
  columnName,
  columnColor,
  isSystem,
  requests,
  onRequestClick,
  isDragging = false,
  onRename,
  onDelete,
  onColorChange,
}: DevRequestColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(columnName);

  const { setNodeRef, isOver } = useDroppable({
    id: columnSlug,
    data: {
      type: "column",
      columnSlug,
    },
  });

  const requestIds = requests.map(r => r.id);
  const isEmpty = requests.length === 0;

  // Déterminer la couleur
  const colorClass = columnColor
    ? COLUMN_COLORS.find(c => c.value === columnColor)?.class || STATUS_COLORS[columnSlug] || "bg-muted-foreground"
    : STATUS_COLORS[columnSlug] || "bg-muted-foreground";

  const handleRename = () => {
    if (onRename && editName.trim() && editName !== columnName) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setEditName(columnName);
      setIsEditing(false);
    }
  };

  return (
    <Card
      className={cn(
        "flex flex-col shrink-0 transition-all duration-200 h-fit border-0",
        isEmpty
          ? "min-w-[180px] w-[180px] sm:min-w-[200px] sm:w-[200px] bg-muted/20 shadow-none"
          : "min-w-[280px] w-[280px] sm:min-w-[300px] sm:w-[320px]",
        isOver && "ring-2 ring-primary/50 bg-primary/5"
      )}
    >
      <CardHeader className={cn(
        "border-b py-2.5 px-3",
        isEmpty && "border-b-transparent"
      )}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", colorClass)} />

            {isEditing ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={handleKeyDown}
                className="h-6 text-sm font-medium py-0 px-1"
                autoFocus
              />
            ) : (
              <CardTitle
                className="text-sm font-medium truncate cursor-default"
                onDoubleClick={() => onRename && setIsEditing(true)}
              >
                {columnName}
              </CardTitle>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Badge variant="secondary" className="text-xs tabular-nums">
              {requests.length}
            </Badge>

            {!isSystem && (onRename || onDelete || onColorChange) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {onRename && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Renommer
                    </DropdownMenuItem>
                  )}
                  {onColorChange && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Palette className="h-4 w-4 mr-2" />
                          Couleur
                        </DropdownMenuItem>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" className="w-32">
                        {COLUMN_COLORS.map((color) => (
                          <DropdownMenuItem
                            key={color.value}
                            onClick={() => onColorChange(color.value)}
                          >
                            <div className={cn("w-3 h-3 rounded-full mr-2", color.class)} />
                            {color.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-2">
        <div
          ref={setNodeRef}
          className={cn(
            "flex flex-col gap-2 transition-all duration-200 rounded-lg touch-none min-h-[60px]",
            isEmpty && "items-center justify-center",
            isOver && "bg-primary/10"
          )}
        >
          <SortableContext items={requestIds} strategy={verticalListSortingStrategy}>
            {isEmpty ? (
              <span className={cn(
                "text-xs text-muted-foreground",
                isOver && "text-primary font-medium"
              )}>
                {isOver ? "Déposer ici" : "Aucune demande"}
              </span>
            ) : (
              requests.map((request) => (
                <DevRequestCard
                  key={request.id}
                  request={request}
                  onClick={() => onRequestClick(request)}
                  columnSlug={columnSlug}
                />
              ))
            )}
          </SortableContext>
        </div>
      </CardContent>
    </Card>
  );
}

// Mémoiser le composant pour éviter les re-renders inutiles
export const DevRequestColumn = memo(DevRequestColumnInner);
