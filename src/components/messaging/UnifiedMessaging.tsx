"use client";

/**
 * @file UnifiedMessaging.tsx
 * @description Composant de messagerie unifié pour admin et formateur
 * Design cohérent, fonctionnalités partagées, modération conditionnelle
 * Responsive: Vue mobile plein écran style WhatsApp
 * @module Messaging/UnifiedMessaging
 */

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
  MessageSquare,
  GraduationCap,
  User,
  Users,
  Plus,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ConversationList } from "./ConversationList";
import { MobileMessagingView } from "./MobileMessagingView";
import type { Message, Conversation, ViewMode, SenderRoleMap } from "./types";

interface UnifiedMessagingProps {
  /** Mode d'affichage */
  viewMode: ViewMode;
  /** ID de la session */
  sessionId: string;
  /** Données du formateur (pour enrichir les conversations) */
  formateur?: { id: string; nom: string; prenom: string } | null;
  /** Liste des inscriptions (pour enrichir les conversations) */
  inscriptions?: Array<{ id: string; nom: string; prenom: string }>;
  /** Callback pour nouvelle conversation */
  onNewMessage?: () => void;
  /** Clé de rafraîchissement */
  refreshKey?: number;
  /** ID de conversation à sélectionner */
  initialConversationId?: string | null;
  /** Conversation unique (mode formateur simple) */
  singleConversation?: Conversation | null;
  /** ID du formateur (pour le mode formateur) */
  formateurId?: string;
  /** Callback quand les messages sont marqués comme lus (admin) */
  onMessagesRead?: () => void;
}

export function UnifiedMessaging({
  viewMode,
  sessionId,
  formateur,
  inscriptions = [],
  onNewMessage,
  refreshKey,
  initialConversationId,
  singleConversation,
  formateurId,
  onMessagesRead,
}: UnifiedMessagingProps) {
  const { user, userRole } = useAuth();
  const isMobile = useIsMobile();
  const supabase = createClient();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [senderRoles, setSenderRoles] = useState<SenderRoleMap>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isInitialScrollRef = useRef(true);
  const lastMarkedConversationRef = useRef<string | null>(null);

  // Modération (admin seulement)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [deleteConversationDialogOpen, setDeleteConversationDialogOpen] = useState(false);

  const canModerate = viewMode === "admin" && (userRole === "admin" || userRole === "superadmin");
  const isSuperadmin = userRole === "superadmin";

  // Scroll to bottom dans le container (pas la page) - desktop uniquement
  useEffect(() => {
    if (!isMobile && messages.length > 0 && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: isInitialScrollRef.current ? "auto" : "smooth",
        });
      }
      isInitialScrollRef.current = false;
    }
  }, [messages, isMobile]);

  // Reset scroll flag on conversation change
  useEffect(() => {
    isInitialScrollRef.current = true;
  }, [selectedConversation?.id]);

  // Mode conversation unique (formateur simple)
  useEffect(() => {
    if (singleConversation) {
      setConversations([singleConversation]);
      setSelectedConversation(singleConversation);
      setLoading(false);
    }
  }, [singleConversation]);

  // Fetch conversations (mode multi-conv)
  useEffect(() => {
    if (!singleConversation) {
      fetchConversations();
    }
  }, [sessionId, refreshKey, singleConversation]);

  // Fetch messages when conversation selected (use ID to avoid infinite loop)
  useEffect(() => {
    const conversationId = selectedConversation?.id;
    if (!conversationId) return;

    fetchMessages(conversationId);

    // Éviter de marquer plusieurs fois la même conversation
    if (lastMarkedConversationRef.current !== conversationId) {
      lastMarkedConversationRef.current = conversationId;
      if (viewMode === "formateur") {
        markMessagesAsReadForFormateur(conversationId);
      } else if (viewMode === "admin") {
        markMessagesAsReadForAdmin(conversationId);
      }
    }
  }, [selectedConversation?.id, viewMode]);

  // Realtime messages
  useEffect(() => {
    const conversationId = selectedConversation?.id;
    if (!conversationId) return;

    const channel = supabase
      .channel(`unified-messages-${conversationId}-${viewMode}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "session_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
          );

          // Marquer lu si formateur et message admin
          if (viewMode === "formateur" && msg.sender_type === "admin") {
            markMessagesAsReadForFormateur(conversationId);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "session_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation?.id, viewMode, supabase]);

  const fetchConversations = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("session_conversations")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false });

      // Filtrer par formateur si mode formateur
      if (viewMode === "formateur" && formateurId) {
        query = query.eq("type", "formateur").eq("participant_id", formateurId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching conversations:", error);
        toast.error("Erreur lors du chargement des conversations");
        return;
      }

      // Enrichir avec noms et badges
      const enrichedConversations = (data || []).map((conv) => {
        let participant_name = "";
        const role_badges: Array<{ label: string; type: "formateur" | "apprenant" | "groupe" }> = [];

        if (conv.type === "formateur" && formateur) {
          participant_name = `${formateur.prenom} ${formateur.nom}`;
          role_badges.push({ label: "Formateur", type: "formateur" });
        } else if (conv.type === "apprenant") {
          const inscription = inscriptions.find((i) => i.id === conv.participant_id);
          if (inscription) {
            participant_name = `${inscription.prenom} ${inscription.nom}`;
            role_badges.push({ label: "Apprenant", type: "apprenant" });
          } else {
            participant_name = "Apprenant";
            role_badges.push({ label: "Apprenant", type: "apprenant" });
          }
        } else if (conv.type === "groupe") {
          participant_name = "Groupe d'apprenants";
          role_badges.push({ label: "Message groupé", type: "groupe" });
        }

        return { ...conv, participant_name, role_badges } as Conversation;
      });

      setConversations(enrichedConversations);

      // Sélection initiale - éviter re-set si même conversation pour éviter boucle infinie
      if (initialConversationId) {
        const targetConv = enrichedConversations.find((c) => c.id === initialConversationId);
        if (targetConv) {
          setSelectedConversation(prev => prev?.id === targetConv.id ? prev : targetConv);
        } else if (enrichedConversations.length > 0) {
          setSelectedConversation(prev => prev?.id === enrichedConversations[0].id ? prev : enrichedConversations[0]);
        }
      } else if (enrichedConversations.length > 0) {
        // Ne sélectionner que si aucune conversation n'est déjà sélectionnée
        setSelectedConversation(prev => {
          if (prev?.id) return prev; // Garder la sélection actuelle
          return enrichedConversations[0];
        });
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Erreur lors du chargement des conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("session_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      const messagesData = (data || []) as Message[];
      setMessages(messagesData);

      // Récupérer les rôles des admins via RPC (contourne RLS)
      const adminSenderIds = [
        ...new Set(
          messagesData
            .filter((m) => m.sender_type === "admin" && m.sender_id)
            .map((m) => m.sender_id as string)
        ),
      ];

      if (adminSenderIds.length > 0) {
        const roleMap: SenderRoleMap = {};

        await Promise.all(
          adminSenderIds.map(async (userId) => {
            const { data: role } = await supabase.rpc('get_highest_admin_role', {
              target_user_id: userId
            });
            if (role) {
              roleMap[userId] = role;
            }
          })
        );

        setSenderRoles(roleMap);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Marquer les messages admin comme lus (pour le formateur)
  const markMessagesAsReadForFormateur = async (conversationId: string) => {
    try {
      await supabase
        .from("session_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("sender_type", "admin")
        .is("read_at", null);
    } catch (error) {
      console.error("Error marking messages as read for formateur:", error);
    }
  };

  // Marquer les messages non-admin comme lus (pour l'admin)
  const markMessagesAsReadForAdmin = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from("session_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_type", "admin")
        .is("read_at", null);

      if (!error) {
        // Notifier le parent pour rafraîchir le compteur
        onMessagesRead?.();
      }
    } catch (error) {
      console.error("Error marking messages as read for admin:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const senderType = viewMode === "admin" ? "admin" : "formateur";

      const { data: insertedMessage, error } = await supabase
        .from("session_messages")
        .insert({
          conversation_id: selectedConversation.id,
          content: newMessage.trim(),
          sender_type: senderType,
        })
        .select("id, sender_name")
        .single();

      if (error) {
        console.error("Error sending message:", error);
        if (error.code === "42501") {
          toast.error("Accès refusé : vous n'avez pas les droits pour envoyer ce message");
        } else {
          toast.error("Erreur lors de l'envoi du message");
        }
        return;
      }

      // Notifier le formateur si admin envoie à un formateur
      if (viewMode === "admin" && selectedConversation.type === "formateur" && insertedMessage?.id) {
        supabase.functions
          .invoke("notify-formateur-message", {
            body: {
              messageId: insertedMessage.id,
              conversationId: selectedConversation.id,
              sessionId,
              senderName: insertedMessage.sender_name || "Admin",
              content: newMessage.trim(),
            },
          })
          .catch((err) => console.error("Error notifying formateur:", err));
      }

      setNewMessage("");
      fetchMessages(selectedConversation.id);
      toast.success("Message envoyé");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setSending(false);
    }
  };

  // === Modération (admin only) ===
  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!newContent.trim()) return;

    try {
      const { error } = await supabase
        .from("session_messages")
        .update({
          content: newContent.trim(),
          edited_at: new Date().toISOString(),
        })
        .eq("id", messageId);

      if (error) throw error;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, content: newContent.trim(), edited_at: new Date().toISOString() }
            : m
        )
      );
      setEditingMessageId(null);
      setEditingContent("");
      toast.success("Message modifié");
    } catch (error) {
      console.error("Error editing message:", error);
      toast.error("Erreur lors de la modification");
    }
  };

  const handleDeleteMessage = async (message: Message) => {
    try {
      const { error } = await supabase
        .from("session_messages")
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id,
        })
        .eq("id", message.id);

      if (error) throw error;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === message.id
            ? { ...m, deleted_at: new Date().toISOString(), deleted_by: user?.id || null }
            : m
        )
      );
      setDeleteDialogOpen(false);
      setMessageToDelete(null);
      toast.success("Message supprimé");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;

    try {
      const { error: messagesError } = await supabase
        .from("session_messages")
        .delete()
        .eq("conversation_id", selectedConversation.id);

      if (messagesError) throw messagesError;

      const { error: convError } = await supabase
        .from("session_conversations")
        .delete()
        .eq("id", selectedConversation.id);

      if (convError) throw convError;

      setConversations((prev) => prev.filter((c) => c.id !== selectedConversation.id));
      setSelectedConversation(null);
      setMessages([]);
      setDeleteConversationDialogOpen(false);
      toast.success("Conversation supprimée");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Erreur lors de la suppression de la conversation");
    }
  };

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

  // === Loading state ===
  if (loading) {
    return (
      <Card className="border-0 bg-card">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // === Empty state ===
  if (conversations.length === 0) {
    return (
      <Card className="border-0 bg-card">
        <CardContent className="p-6">
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className={cn(viewMode === "admin" && adminStyles.cardTitle, "mb-2")}>
              {viewMode === "admin" ? "Aucune conversation" : "Pas de messages"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {viewMode === "admin"
                ? "Commencez une nouvelle conversation avec le formateur ou les apprenants."
                : "L'administrateur n'a pas encore initié de conversation pour cette session."}
            </p>
            {viewMode === "admin" && onNewMessage && (
              <Button onClick={onNewMessage}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle conversation
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // === MOBILE VIEW ===
  if (isMobile) {
    return (
      <MobileMessagingView
        viewMode={viewMode}
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        messages={messages}
        newMessage={newMessage}
        onNewMessageChange={setNewMessage}
        onSendMessage={sendMessage}
        sending={sending}
        senderRoles={senderRoles}
        currentUserId={user?.id}
        canModerate={canModerate}
        isSuperadmin={isSuperadmin}
        onNewConversation={onNewMessage}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        onDeleteConversation={canModerate ? handleDeleteConversation : undefined}
      />
    );
  }

  // === DESKTOP VIEW ===
  return (
    <div className={cn("grid gap-4", viewMode === "admin" ? "lg:grid-cols-3" : "")}>
      {/* Liste des conversations (admin multi-conv) */}
      {viewMode === "admin" && (
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          onNewConversation={onNewMessage}
          viewMode={viewMode}
          className="lg:col-span-1"
        />
      )}

      {/* Zone de messages */}
      <Card className={cn("border-0 bg-card", viewMode === "admin" ? "lg:col-span-2" : "")}>
        <CardHeader className="pb-3 border-b border-border/30">
          {selectedConversation && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center",
                    viewMode === "formateur"
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : selectedConversation.type === "formateur"
                      ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"
                      : selectedConversation.type === "groupe"
                      ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                      : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                  )}
                >
                  {viewMode === "formateur" ? (
                    <ShieldCheck className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                  ) : (
                    getConversationIcon(selectedConversation.type)
                  )}
                </div>
                <div>
                  <CardTitle className={adminStyles.cardTitle}>
                    {viewMode === "formateur" ? "Administration" : selectedConversation.participant_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {viewMode === "formateur"
                      ? "Messages avec l'équipe administrative"
                      : selectedConversation.type === "formateur"
                      ? "Formateur de la session"
                      : selectedConversation.type === "groupe"
                      ? "Message envoyé à tous les apprenants"
                      : "Apprenant inscrit à la session"}
                  </p>
                </div>
              </div>
              {canModerate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteConversationDialogOpen(true)}
                  title="Supprimer la conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0 flex flex-col" style={{ height: "calc(100vh - 380px)", minHeight: "400px" }}>
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-3">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">Aucun message dans cette conversation</p>
                {viewMode === "formateur" && (
                  <p className="text-xs mt-2">Vous pouvez envoyer un message à l'administration</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwnMessage={message.sender_id === user?.id}
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
                    onEditSave={handleEditMessage}
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

          <MessageInput
            value={newMessage}
            onChange={setNewMessage}
            onSend={sendMessage}
            disabled={!selectedConversation}
            sending={sending}
          />
        </CardContent>
      </Card>

      {/* Dialog suppression message */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce message ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le message sera remplacé par &quot;Ce message a été supprimé&quot;. Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => messageToDelete && handleDeleteMessage(messageToDelete)}
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
              Tous les messages de cette conversation seront définitivement supprimés. Cette
              action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConversation}
            >
              Supprimer la conversation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
