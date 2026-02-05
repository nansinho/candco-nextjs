"use client";

/**
 * @file SessionMessagesPanel.tsx
 * @description Reusable messaging panel for session conversations
 * Supports different conversation types: general, formateur, participant
 */

import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  GraduationCap,
  User,
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useSessionConversation } from "@/hooks/admin/useSessionConversation";
import { useSessionMessages, useSessionMessageMutations } from "@/hooks/admin/useSessionMessages";
import { toast } from "sonner";

interface SessionMessagesPanelProps {
  sessionId: string;
  conversationType: "general" | "formateur" | "admin" | "participant";
  title?: string;
  placeholder?: string;
  senderName?: string;
}

export function SessionMessagesPanel({
  sessionId,
  conversationType,
  title = "Messages",
  placeholder = "Écrire un message...",
  senderName = "Admin",
}: SessionMessagesPanelProps) {
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get or create conversation for this type
  const {
    data: conversation,
    isLoading: conversationLoading,
    error: conversationError,
    refetch: refetchConversation,
  } = useSessionConversation(sessionId, conversationType);

  // Fetch messages for this conversation
  const { data: messages = [], isLoading: messagesLoading } = useSessionMessages(
    conversation?.id
  );

  const { sendMessage } = useSessionMessageMutations();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !conversation?.id) return;

    try {
      await sendMessage.mutateAsync({
        conversationId: conversation.id,
        content: messageInput,
        senderId: "admin",
        senderType: "admin",
        senderName: senderName,
      });
      setMessageInput("");
    } catch {
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  const getIconForType = () => {
    switch (conversationType) {
      case "formateur":
        return <GraduationCap className="h-4 w-4 text-primary" />;
      case "general":
        return <Users className="h-4 w-4 text-primary" />;
      default:
        return <User className="h-4 w-4 text-primary" />;
    }
  };

  const getSenderIcon = (senderType: string) => {
    if (senderType === "formateur") {
      return <GraduationCap className="h-4 w-4 text-purple-500" />;
    } else if (senderType === "participant") {
      return <User className="h-4 w-4 text-blue-500" />;
    }
    return <Users className="h-4 w-4 text-primary" />;
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Card className="border-0 bg-secondary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {getIconForType()}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px] px-6">
          {conversationError || (!conversation && !conversationLoading) ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <p className="text-destructive font-medium">Erreur de chargement</p>
              <p className="text-sm text-muted-foreground mt-1">
                Impossible de charger la conversation
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Vérifiez la console pour plus de détails
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => refetchConversation()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          ) : conversationLoading || messagesLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
              <p className="text-muted-foreground">Chargement des messages...</p>
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10">
                      {message.sender_name ? getInitials(message.sender_name) : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">
                        {message.sender_name || "Utilisateur"}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(parseISO(message.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun message</p>
              <p className="text-xs text-muted-foreground mt-1">
                Envoyez un message pour démarrer la conversation
              </p>
            </div>
          )}
        </ScrollArea>
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              className="flex-1"
              placeholder={placeholder}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
              disabled={!conversation || conversationLoading}
            />
            <Button
              className="shrink-0"
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || sendMessage.isPending || !conversation}
            >
              {sendMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
