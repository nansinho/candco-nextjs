"use client";

/**
 * @file ConversationList.tsx
 * @description Liste des conversations avec icônes et badges
 * @module Messaging/ConversationList
 */

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, User, Users, Plus, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import type { Conversation, ViewMode } from "./types";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation?: () => void;
  viewMode: ViewMode;
  className?: string;
}

export function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  onNewConversation,
  viewMode,
  className,
}: ConversationListProps) {
  const getConversationIcon = (type: string) => {
    switch (type) {
      case "formateur":
        return <GraduationCap className="h-4 w-4" />;
      case "groupe":
        return <Users className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getIconColors = (type: string) => {
    switch (type) {
      case "formateur":
        return "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400";
      case "groupe":
        return "bg-purple-500/15 text-purple-600 dark:text-purple-400";
      default:
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400";
    }
  };

  // Vue admin : liste compacte avec icônes
  if (viewMode === "admin") {
    return (
      <Card className={cn("border-0 bg-card", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className={adminStyles.cardTitle}>Conversations</CardTitle>
            {onNewConversation && (
              <Button size="sm" onClick={onNewConversation} className="gap-2">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="space-y-0.5 p-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv)}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors",
                    selectedConversation?.id === conv.id
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-secondary/50 border border-transparent"
                  )}
                >
                  <div
                    className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                      getIconColors(conv.type)
                    )}
                  >
                    {getConversationIcon(conv.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{conv.participant_name}</p>
                    <p className={cn(
                      "text-xs mt-0.5",
                      conv.type === "formateur"
                        ? "text-cyan-500"
                        : conv.type === "groupe"
                        ? "text-purple-500"
                        : "text-blue-500"
                    )}>
                      {conv.type === "formateur"
                        ? "Formateur"
                        : conv.type === "groupe"
                        ? "Message groupé"
                        : "Apprenant"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  // Vue formateur : liste avec détails de session
  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Conversations</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[450px]">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className={cn(
                "w-full p-4 text-left border-b border-border/30 hover:bg-accent/50 transition-colors",
                selectedConversation?.id === conv.id && "bg-accent"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate text-sm">
                      {conv.formation_title || "Session"}
                    </span>
                    {(conv.unread_count ?? 0) > 0 && (
                      <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3" />
                    {conv.session?.start_date &&
                      format(new Date(conv.session.start_date), "dd MMM yyyy", {
                        locale: fr,
                      })}
                  </div>
                  {conv.last_message && (
                    <p className="text-xs text-muted-foreground mt-2 truncate">
                      {conv.last_message}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </button>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
