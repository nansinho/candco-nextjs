"use client";

/**
 * @file MessageBubble.tsx
 * @description Bulle de message avec badges, couleurs et modération
 * @module Messaging/MessageBubble
 */

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { badgeStyles } from "@/components/admin/badgeStyles";
import type { Message, SenderRoleMap, ViewMode } from "./types";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  senderRoles: SenderRoleMap;
  viewMode: ViewMode;
  canModerate: boolean;
  /** Superadmin peut supprimer tous les messages */
  isSuperadmin?: boolean;
  isEditing: boolean;
  editingContent: string;
  onEditStart: (messageId: string, content: string) => void;
  onEditCancel: () => void;
  onEditSave: (messageId: string, content: string) => void;
  onEditContentChange: (content: string) => void;
  onDeleteRequest: (message: Message) => void;
}

export function MessageBubble({
  message,
  isOwnMessage,
  senderRoles,
  viewMode,
  canModerate,
  isSuperadmin = false,
  isEditing,
  editingContent,
  onEditStart,
  onEditCancel,
  onEditSave,
  onEditContentChange,
  onDeleteRequest,
}: MessageBubbleProps) {
  const isDeleted = !!message.deleted_at;
  // Chaque utilisateur peut modifier son propre message
  const canEditThis = isOwnMessage && !isDeleted;
  // Chaque utilisateur peut supprimer son propre message, superadmin peut supprimer tous les messages
  const canDeleteThis = (isOwnMessage || isSuperadmin) && !isDeleted;
  // Afficher le menu si l'utilisateur peut modifier ou supprimer (pas seulement en mode admin)
  const showModeration = (canEditThis || canDeleteThis) && !isDeleted;

  // Badge selon le rôle
  const getBadgeInfo = () => {
    if (message.sender_type === "admin") {
      const role = message.sender_id ? senderRoles[message.sender_id] : null;
      if (role === "superadmin") {
        return { label: "Superadmin", className: badgeStyles.superadmin };
      }
      return { label: "Admin", className: badgeStyles.admin };
    }
    if (message.sender_type === "formateur") {
      return { label: "Formateur", className: badgeStyles.formateur };
    }
    return { label: "Apprenant", className: badgeStyles.info };
  };

  // Couleur de bulle selon le rôle (alignée avec badgeStyles)
  const getBubbleColor = () => {
    if (message.sender_type === "admin") {
      const role = message.sender_id ? senderRoles[message.sender_id] : null;
      if (role === "superadmin") {
        // Superadmin: rouge (cohérent avec badgeStyles.superadmin)
        return isOwnMessage ? "bg-red-500/15" : "bg-red-500/10";
      }
      // Admin: orange (cohérent avec badgeStyles.admin)
      return isOwnMessage ? "bg-orange-500/15" : "bg-orange-500/10";
    }
    if (message.sender_type === "formateur") {
      // Formateur: cyan (cohérent avec badgeStyles.formateur)
      return isOwnMessage ? "bg-cyan-500/15" : "bg-cyan-500/10";
    }
    // Apprenant: bleu (cohérent avec badgeStyles.info)
    return isOwnMessage ? "bg-blue-500/15" : "bg-blue-500/10";
  };

  const badgeInfo = getBadgeInfo();

  return (
    <div
      className={cn(
        "py-2 px-3 rounded-xl transition-colors group relative",
        // Bulles : max 75%
        "max-w-[85%] sm:max-w-[75%]",
        isOwnMessage ? "ml-auto" : "mr-auto",
        isDeleted ? "bg-muted/30" : getBubbleColor()
      )}
    >
      {/* Header: Name + Badge + Time */}
      <div
        className={cn(
          "flex items-center gap-2 mb-1",
          isOwnMessage && "justify-end"
        )}
      >
        {isOwnMessage ? (
          <>
            <span className="text-xs text-muted-foreground">
              {format(new Date(message.created_at), "HH:mm", { locale: fr })}
              {message.edited_at && !isDeleted && (
                <span className="ml-1 italic">(modifié)</span>
              )}
            </span>
            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border-transparent",
                badgeInfo.className
              )}
            >
              {badgeInfo.label}
            </span>
            <span className="font-medium text-sm">
              {message.sender_name || "Moi"}{" "}
              <span className="text-muted-foreground font-normal">(vous)</span>
            </span>
          </>
        ) : (
          <>
            <span className="font-medium text-sm">
              {message.sender_name ||
                (message.sender_type === "admin" ? "Admin" : "Inconnu")}
            </span>
            <span
              className={cn(
                "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border-transparent",
                badgeInfo.className
              )}
            >
              {badgeInfo.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(message.created_at), "HH:mm", { locale: fr })}
              {message.edited_at && !isDeleted && (
                <span className="ml-1 italic">(modifié)</span>
              )}
            </span>
          </>
        )}

        {/* Menu d'actions (admin seulement) */}
        {showModeration && !isEditing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isOwnMessage ? "end" : "start"}>
              {canEditThis && (
                <DropdownMenuItem
                  onClick={() => onEditStart(message.id, message.content)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
              )}
              {canEditThis && canDeleteThis && <DropdownMenuSeparator />}
              {canDeleteThis && (
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDeleteRequest(message)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      {isDeleted ? (
        <p className="text-sm text-muted-foreground italic">
          Ce message a été supprimé
        </p>
      ) : isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editingContent}
            onChange={(e) => onEditContentChange(e.target.value)}
            className="text-sm min-h-[60px]"
            autoFocus
          />
          <div className="flex gap-1 justify-end">
            <Button size="sm" variant="ghost" onClick={onEditCancel}>
              <X className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              onClick={() => onEditSave(message.id, editingContent)}
              disabled={!editingContent.trim()}
            >
              <Check className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <p className={cn("text-sm text-foreground", isOwnMessage && "text-right")}>
          {message.content}
        </p>
      )}
    </div>
  );
}
