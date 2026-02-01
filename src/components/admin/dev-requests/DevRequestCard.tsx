"use client";

/**
 * @file DevRequestCard.tsx
 * @description Carte d'une demande pour le Kanban
 */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Image, Calendar, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  DevRequest,
  PRIORITY_LABELS,
  PRIORITY_BADGE_COLORS,
  PRIORITY_COLORS
} from "@/hooks/admin/useDevRequests";

interface DevRequestCardProps {
  request: DevRequest;
  onClick: () => void;
  isDragOverlay?: boolean;
  columnSlug?: string;
}

export function DevRequestCard({ request, onClick, isDragOverlay = false, columnSlug }: DevRequestCardProps) {
  const currentColumnSlug = columnSlug || request.column_slug || request.status;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: request.id,
    data: {
      type: "card",
      request,
      columnSlug: currentColumnSlug,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const creatorName = request.creator
    ? `${request.creator.first_name || ''} ${request.creator.last_name || ''}`.trim()
    : 'Inconnu';

  const initials = creatorName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  const handleCardClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick();
  };

  if (isDragOverlay) {
    return (
      <Card
        className={cn(
          "cursor-grabbing shadow-2xl scale-105 rotate-2 opacity-95",
          "border-t-0 border-r-0 border-b-0",
          PRIORITY_COLORS[request.priority],
          "ring-2 ring-primary"
        )}
      >
        <CardContent className="p-3 sm:p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground/60 shrink-0" />
              <Badge
                variant="outline"
                className={cn("text-xs shrink-0", PRIORITY_BADGE_COLORS[request.priority])}
              >
                {PRIORITY_LABELS[request.priority]}
              </Badge>
            </div>
          </div>
          <h4 className="font-medium text-sm line-clamp-2 leading-snug pl-6">
            {request.title}
          </h4>
          <div className="flex items-center justify-between pt-1 pl-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              {request.comments_count !== undefined && request.comments_count > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <MessageSquare className="h-3 w-3" />
                  <span>{request.comments_count}</span>
                </div>
              )}
              {request.images_count !== undefined && request.images_count > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <Image className="h-3 w-3" />
                  <span>{request.images_count}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(request.created_at), 'dd MMM', { locale: fr })}</span>
              </div>
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-secondary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "transition-all duration-150",
        "border-t-0 border-r-0 border-b-0",
        "hover:shadow-md hover:-translate-y-0.5",
        "select-none cursor-grab active:cursor-grabbing",
        PRIORITY_COLORS[request.priority],
        isDragging && "opacity-40 shadow-none scale-95 cursor-grabbing"
      )}
      onClick={handleCardClick}
      {...listeners}
    >
      <CardContent className="p-3 sm:p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground/60 shrink-0" />
            <Badge
              variant="outline"
              className={cn("text-xs shrink-0", PRIORITY_BADGE_COLORS[request.priority])}
            >
              {PRIORITY_LABELS[request.priority]}
            </Badge>
          </div>
        </div>

        <h4 className="font-medium text-sm line-clamp-2 leading-snug pl-6">
          {request.title}
        </h4>

        <div className="flex items-center justify-between pt-1 pl-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            {request.comments_count !== undefined && request.comments_count > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <MessageSquare className="h-3 w-3" />
                <span>{request.comments_count}</span>
              </div>
            )}
            {request.images_count !== undefined && request.images_count > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <Image className="h-3 w-3" />
                <span>{request.images_count}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(request.created_at), 'dd MMM', { locale: fr })}</span>
            </div>
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-secondary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
