"use client";

/**
 * @file MobileMessagingView.tsx
 * @description Vue mobile de la messagerie style WhatsApp avec navigation liste/chat
 * @module Messaging/MobileMessagingView
 */

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  MessageSquare,
  GraduationCap,
  User,
  Users,
  Plus,
  Calendar,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import type { Message, Conversation, ViewMode, SenderRoleMap } from "./types";
import { motion, AnimatePresence } from "framer-motion";

type MobileView = "list" | "chat";

interface MobileMessagingViewProps {
  /** Mode d'affichage */
  viewMode: ViewMode;
  /** Liste des conversations */
  conversations: Conversation[];
  /** Conversation sélectionnée */
  selectedConversation: Conversation | null;
  /** Callback pour sélectionner une conversation */
  onSelectConversation: (conversation: Conversation | null) => void;
  /** Messages de la conversation sélectionnée */
  messages: Message[];
  /** Nouveau message en cours de saisie */
  newMessage: string;
  /** Callback pour changer le message */
  onNewMessageChange: (value: string) => void;
  /** Callback pour envoyer le message */
  onSendMessage: () => void;
  /** Envoi en cours */
  sending: boolean;
  /** Rôles des expéditeurs */
  senderRoles: SenderRoleMap;
  /** User ID courant */
  currentUserId?: string;
  /** Peut modérer (admin) */
  canModerate: boolean;
  /** Est superadmin */
  isSuperadmin: boolean;
  /** Callback pour nouvelle conversation */
  onNewConversation?: () => void;
  /** Callback pour éditer un message */
  onEditMessage: (messageId: string, content: string) => void;
  /** Callback pour supprimer un message */
  onDeleteMessage: (message: Message) => void;
  /** Callback pour supprimer la conversation */
  onDeleteConversation?: () => void;
}

export function MobileMessagingView({
  viewMode,
  conversations,
  selectedConversation,
  onSelectConversation,
  messages,
  newMessage,
  onNewMessageChange,
  onSendMessage,
  sending,
  senderRoles,
  currentUserId,
  canModerate,
  isSuperadmin,
  onNewConversation,
  onEditMessage,
  onDeleteMessage,
  onDeleteConversation,
}: MobileMessagingViewProps) {
  const [mobileView, setMobileView] = useState<MobileView>(
    selectedConversation ? "chat" : "list"
  );
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [deleteConversationDialogOpen, setDeleteConversationDialogOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialScrollRef = useRef(true);

  // Scroll vers le bas quand les messages changent
  useEffect(() => {
    if (messages.length > 0 && mobileView === "chat") {
      messagesEndRef.current?.scrollIntoView({
        behavior: isInitialScrollRef.current ? "auto" : "smooth",
      });
      isInitialScrollRef.current = false;
    }
  }, [messages, mobileView]);

  // Reset scroll quand on change de conversation
  useEffect(() => {
    isInitialScrollRef.current = true;
  }, [selectedConversation?.id]);

  // Naviguer vers le chat quand une conversation est sélectionnée
  const handleSelectConversation = (conv: Conversation) => {
    onSelectConversation(conv);
    setMobileView("chat");
  };

  // Retour à la liste
  const handleBack = () => {
    setMobileView("list");
  };

  // Icône selon le type de conversation
  const getConversationIcon = (type: string) => {
    switch (type) {
      case "formateur":
        return <GraduationCap className="h-5 w-5" />;
      case "groupe":
        return <Users className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
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

  // Gestion de la suppression de message
  const handleDeleteMessageConfirm = () => {
    if (messageToDelete) {
      onDeleteMessage(messageToDelete);
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
  };

  // Gestion de la suppression de conversation
  const handleDeleteConversationConfirm = () => {
    if (onDeleteConversation) {
      onDeleteConversation();
      setDeleteConversationDialogOpen(false);
      setMobileView("list");
    }
  };

  // === EMPTY STATE ===
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4">
        <MessageSquare className="h-16 w-16 text-muted-foreground/30 mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {viewMode === "admin" ? "Aucune conversation" : "Pas de messages"}
        </h3>
        <p className="text-muted-foreground text-center text-sm mb-4">
          {viewMode === "admin"
            ? "Commencez une nouvelle conversation."
            : "L'administrateur n'a pas encore initié de conversation."}
        </p>
        {viewMode === "admin" && onNewConversation && (
          <Button onClick={onNewConversation} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle conversation
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {mobileView === "list" ? (
          // === VUE LISTE ===
          <motion.div
            key="list"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col h-full"
          >
            {/* Header liste */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-card">
              <h2 className="text-lg font-semibold">Messages</h2>
              {viewMode === "admin" && onNewConversation && (
                <Button size="sm" variant="ghost" onClick={onNewConversation}>
                  <Plus className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Liste des conversations */}
            <ScrollArea className="flex-1">
              <div className="divide-y divide-border/30">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 text-left",
                      "active:bg-accent/50 transition-colors",
                      "min-h-[72px]"
                    )}
                  >
                    {/* Avatar / Icône */}
                    <div
                      className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
                        viewMode === "formateur"
                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                          : getIconColors(conv.type)
                      )}
                    >
                      {viewMode === "formateur" ? (
                        <ShieldCheck className="h-6 w-6" />
                      ) : (
                        getConversationIcon(conv.type)
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">
                          {viewMode === "formateur"
                            ? "Administration"
                            : conv.participant_name || conv.formation_title || "Conversation"}
                        </span>
                        {(conv.unread_count ?? 0) > 0 && (
                          <Badge
                            variant="destructive"
                            className="h-5 min-w-[20px] px-1.5 text-xs shrink-0"
                          >
                            {conv.unread_count}
                          </Badge>
                        )}
                      </div>

                      {/* Date session ou dernier message */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        {conv.session?.start_date ? (
                          <>
                            <Calendar className="h-3 w-3" />
                            <span>
                              {format(new Date(conv.session.start_date), "dd MMM yyyy", { locale: fr })}
                            </span>
                          </>
                        ) : conv.last_message_date ? (
                          <span>
                            {format(new Date(conv.last_message_date), "dd/MM à HH:mm", { locale: fr })}
                          </span>
                        ) : null}
                      </div>

                      {/* Dernier message */}
                      {conv.last_message && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {conv.last_message}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        ) : (
          // === VUE CHAT ===
          <motion.div
            key="chat"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col h-full"
          >
            {/* Header chat compact */}
            <div className="flex items-center gap-3 px-2 py-2 border-b border-border/30 bg-card">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-10 w-10 shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              {selectedConversation && (
                <>
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                      viewMode === "formateur"
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                        : getIconColors(selectedConversation.type)
                    )}
                  >
                    {viewMode === "formateur" ? (
                      <ShieldCheck className="h-5 w-5" />
                    ) : (
                      getConversationIcon(selectedConversation.type)
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">
                      {viewMode === "formateur"
                        ? "Administration"
                        : selectedConversation.participant_name || "Conversation"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {viewMode === "formateur"
                        ? "Équipe administrative"
                        : selectedConversation.type === "formateur"
                        ? "Formateur"
                        : selectedConversation.type === "groupe"
                        ? "Message groupé"
                        : "Apprenant"}
                    </p>
                  </div>

                  {canModerate && onDeleteConversation && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-destructive shrink-0"
                      onClick={() => setDeleteConversationDialogOpen(true)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Zone des messages - flex-1 pour prendre tout l'espace */}
            <ScrollArea className="flex-1 px-3 py-2">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 opacity-30 mb-3" />
                  <p className="text-sm">Aucun message</p>
                  {viewMode === "formateur" && (
                    <p className="text-xs mt-1">
                      Envoyez un message à l'administration
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwnMessage={message.sender_id === currentUserId}
                      senderRoles={senderRoles}
                      viewMode={viewMode}
                      canModerate={canModerate}
                      isSuperadmin={isSuperadmin}
                      isEditing={editingMessageId === message.id}
                      editingContent={editingContent}
                      onEditStart={(id, content) => {
                        setEditingMessageId(id);
                        setEditingContent(content);
                      }}
                      onEditCancel={() => {
                        setEditingMessageId(null);
                        setEditingContent("");
                      }}
                      onEditSave={(id, content) => {
                        onEditMessage(id, content);
                        setEditingMessageId(null);
                        setEditingContent("");
                      }}
                      onEditContentChange={setEditingContent}
                      onDeleteRequest={(msg) => {
                        setMessageToDelete(msg);
                        setDeleteDialogOpen(true);
                      }}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Zone de saisie - fixe en bas */}
            <MessageInput
              value={newMessage}
              onChange={onNewMessageChange}
              onSend={onSendMessage}
              disabled={!selectedConversation}
              sending={sending}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog suppression message */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce message ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le message sera remplacé par &quot;Ce message a été supprimé&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteMessageConfirm}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog suppression conversation */}
      <AlertDialog
        open={deleteConversationDialogOpen}
        onOpenChange={setDeleteConversationDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette conversation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Tous les messages seront supprimés définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConversationConfirm}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
