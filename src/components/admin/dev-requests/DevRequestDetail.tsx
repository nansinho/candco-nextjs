"use client";

/**
 * @file DevRequestDetail.tsx
 * @description Vue détaillée d'une demande avec commentaires et historique
 */

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MentionTextarea, parseCommentWithMentions } from "./MentionTextarea";
import { ImageDropZone } from "./ImageDropZone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Clock,
  User,
  Trash2,
  Image as ImageIcon,
  History,
  MessageSquare,
  Archive,
  CheckCircle,
  Users,
  Pencil,
  RotateCcw,
  Undo2,
  Send,
  FileText,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DevRequest,
  DevRequestStatus,
  DevRequestPriority,
  STATUS_LABELS,
  PRIORITY_LABELS,
  PRIORITY_BADGE_COLORS,
  ACTIVE_COLUMNS,
  useDevRequestDetail,
  useDevRequestImages,
  useDevRequestComments,
  useDevRequestHistory,
  useUpdateDevRequest,
  useDeleteDevRequest,
  useAdminUsers,
  useAddDevRequestComment,
} from "@/hooks/admin/useDevRequests";

interface DevRequestDetailProps {
  request: DevRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DevRequestDetail({ request, open, onOpenChange }: DevRequestDetailProps) {
  const [activeTab, setActiveTab] = useState("comments");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [newComment, setNewComment] = useState("");
  const [commentImages, setCommentImages] = useState<File[]>([]);
  const [commentPreviews, setCommentPreviews] = useState<string[]>([]);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const { data: fullRequest } = useDevRequestDetail(request?.id || null);
  const { data: images } = useDevRequestImages(request?.id || null);
  const { data: comments } = useDevRequestComments(request?.id || null);
  const { data: history } = useDevRequestHistory(request?.id || null);
  const { data: adminUsers } = useAdminUsers();

  const updateRequest = useUpdateDevRequest();
  const deleteRequest = useDeleteDevRequest();
  const addComment = useAddDevRequestComment();

  const currentRequest = fullRequest || request;

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionRef.current) {
      descriptionRef.current.focus();
    }
  }, [isEditingDescription]);

  if (!currentRequest) return null;

  const creatorName = currentRequest.creator
    ? `${currentRequest.creator.first_name || ''} ${currentRequest.creator.last_name || ''}`.trim() || 'Admin'
    : 'Inconnu';

  const startEditingTitle = () => {
    setEditedTitle(currentRequest.title);
    setIsEditingTitle(true);
  };

  const saveTitle = () => {
    if (editedTitle.trim() && editedTitle.trim() !== currentRequest.title) {
      updateRequest.mutate({ id: currentRequest.id, title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const cancelEditingTitle = () => {
    setIsEditingTitle(false);
    setEditedTitle("");
  };

  const startEditingDescription = () => {
    setEditedDescription(currentRequest.description || "");
    setIsEditingDescription(true);
  };

  const saveDescription = () => {
    if (editedDescription !== currentRequest.description) {
      updateRequest.mutate({ id: currentRequest.id, description: editedDescription });
    }
    setIsEditingDescription(false);
  };

  const cancelEditingDescription = () => {
    setIsEditingDescription(false);
    setEditedDescription("");
  };

  const handleStatusChange = (status: DevRequestStatus) => {
    updateRequest.mutate({ id: currentRequest.id, status });
  };

  const handlePriorityChange = (priority: DevRequestPriority) => {
    updateRequest.mutate({ id: currentRequest.id, priority });
  };

  const handleAssigneeToggle = (userId: string, isChecked: boolean) => {
    const currentAssignees = currentRequest.assigned_to || [];
    const previousAssignees = [...currentAssignees];
    let newAssignees: string[];

    if (isChecked) {
      newAssignees = [...currentAssignees, userId];
    } else {
      newAssignees = currentAssignees.filter(id => id !== userId);
    }

    updateRequest.mutate({
      id: currentRequest.id,
      assigned_to: newAssignees,
      previousAssignedTo: previousAssignees,
    });
  };

  const handleArchive = () => {
    updateRequest.mutate({ id: currentRequest.id, status: 'archivee' });
    onOpenChange(false);
  };

  const handleRestore = (targetStatus: DevRequestStatus) => {
    updateRequest.mutate({ id: currentRequest.id, status: targetStatus });
  };

  const handleMarkResolved = () => {
    handleStatusChange('resolue');
  };

  const handleDelete = async () => {
    await deleteRequest.mutateAsync(currentRequest.id);
    onOpenChange(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment.mutate({
      request_id: currentRequest.id,
      content: newComment.trim(),
      images: commentImages.length > 0 ? commentImages : undefined,
    });
    setNewComment("");
    // Clear images
    commentPreviews.forEach(preview => {
      if (!preview.startsWith('pdf:')) {
        URL.revokeObjectURL(preview);
      }
    });
    setCommentImages([]);
    setCommentPreviews([]);
  };

  const availableStatuses: DevRequestStatus[] = [...ACTIVE_COLUMNS, 'resolue'];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[600px] p-0 flex flex-col">
        <SheetHeader className="p-4 sm:p-6 border-b shrink-0">
          <div className="flex items-start justify-between gap-4">
            {isEditingTitle ? (
              <Input
                ref={titleInputRef}
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") cancelEditingTitle();
                }}
                className="text-lg font-semibold"
              />
            ) : (
              <SheetTitle
                className="text-left pr-8 cursor-pointer hover:bg-muted/50 px-2 py-1 -mx-2 rounded transition-colors group flex items-center gap-2"
                onClick={startEditingTitle}
              >
                {currentRequest.title}
                <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50" />
              </SheetTitle>
            )}
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Select
              value={currentRequest.status}
              onValueChange={(v) => handleStatusChange(v as DevRequestStatus)}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((key) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    {STATUS_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={currentRequest.priority}
              onValueChange={(v) => handlePriorityChange(v as DevRequestPriority)}
            >
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    <Badge
                      variant="outline"
                      className={cn("text-xs", PRIORITY_BADGE_COLORS[key as DevRequestPriority])}
                    >
                      {label}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {currentRequest.status !== 'resolue' && currentRequest.status !== 'archivee' && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1 text-green-600 border-green-600/30 hover:bg-green-600/10"
                onClick={handleMarkResolved}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Résolue
              </Button>
            )}

            {currentRequest.status === 'resolue' && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => handleRestore('en_cours')}
                title="Remettre en cours"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Rouvrir
              </Button>
            )}

            {currentRequest.status === 'resolue' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
                onClick={handleArchive}
                title="Déplacer vers les archives"
              >
                <Archive className="h-3.5 w-3.5" />
                Archiver
              </Button>
            )}

            {currentRequest.status === 'archivee' && (
              <Select onValueChange={(v) => handleRestore(v as DevRequestStatus)}>
                <SelectTrigger className="w-[150px] h-8 text-xs gap-1">
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Restaurer vers...</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nouvelle">Nouvelle</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="a_trier">À tester</SelectItem>
                  <SelectItem value="resolue">Résolue</SelectItem>
                </SelectContent>
              </Select>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive" title="Mettre à la corbeille">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mettre à la corbeille ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette demande sera déplacée dans la corbeille pendant 30 jours.
                    Vous pourrez la restaurer depuis la section "Corbeille".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Mettre à la corbeille
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Multi-assignee selector */}
          <div className="pt-3 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Assigné à :</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {adminUsers?.map((admin: { id: string; first_name?: string; last_name?: string }) => {
                const name = `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || 'Admin';
                const initials = `${admin.first_name?.charAt(0) || ''}${admin.last_name?.charAt(0) || ''}`.toUpperCase() || 'A';
                const isAssigned = currentRequest.assigned_to.includes(admin.id);

                return (
                  <label
                    key={admin.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-colors",
                      isAssigned
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-muted/50 border-border/30 hover:bg-muted"
                    )}
                  >
                    <Checkbox
                      checked={isAssigned}
                      onCheckedChange={(checked) => handleAssigneeToggle(admin.id, checked === true)}
                      className="sr-only"
                    />
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{name}</span>
                    {isAssigned && <CheckCircle className="h-3 w-3 text-primary" />}
                  </label>
                );
              })}
              {(!adminUsers || adminUsers.length === 0) && (
                <span className="text-xs text-muted-foreground">Aucun administrateur disponible</span>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Par {creatorName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(currentRequest.created_at), 'dd MMM yyyy', { locale: fr })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(currentRequest.created_at), 'HH:mm', { locale: fr })}</span>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Description - editable */}
            <div className="group relative">
              {isEditingDescription ? (
                <div className="space-y-2">
                  <Textarea
                    ref={descriptionRef}
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="min-h-[120px]"
                    placeholder="Ajouter une description..."
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={cancelEditingDescription}>
                      Annuler
                    </Button>
                    <Button size="sm" onClick={saveDescription}>
                      Enregistrer
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="cursor-pointer hover:bg-muted/30 rounded-lg p-2 -m-2 transition-colors"
                  onClick={startEditingDescription}
                >
                  {currentRequest.description ? (
                    <p className="text-sm whitespace-pre-wrap">{currentRequest.description}</p>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">
                      Cliquez pour ajouter une description...
                    </p>
                  )}
                  <Pencil className="h-3 w-3 absolute top-2 right-2 opacity-0 group-hover:opacity-50 transition-opacity" />
                </div>
              )}
            </div>

            {/* Images */}
            {images && images.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ImageIcon className="h-4 w-4" />
                  <span>Images ({images.length})</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {images.map((image) => (
                    <a
                      key={image.id}
                      href={image.display_url || image.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-video relative rounded-lg overflow-hidden border hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={image.display_url || image.image_url}
                        alt={image.file_name || "Image"}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs for comments and history */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="comments" className="flex-1 gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Commentaires
                  {comments && comments.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {comments.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 gap-2">
                  <History className="h-4 w-4" />
                  Historique
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="mt-4 space-y-4">
                {/* Add comment form */}
                <div className="space-y-3">
                  <MentionTextarea
                    value={newComment}
                    onChange={setNewComment}
                    placeholder="Ajouter un commentaire... Tapez @ pour mentionner"
                    users={adminUsers || []}
                  />
                  <ImageDropZone
                    images={commentImages}
                    previews={commentPreviews}
                    onImagesChange={(images, previews) => {
                      setCommentImages(images);
                      setCommentPreviews(previews);
                    }}
                    maxImages={5}
                    compact
                    acceptPdf
                  />
                </div>
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || addComment.isPending}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {addComment.isPending ? "Envoi..." : "Envoyer"}
                </Button>

                {/* Comments list */}
                <div className="space-y-3">
                  {comments?.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {`${comment.user?.first_name?.[0] || ''}${comment.user?.last_name?.[0] || ''}`.toUpperCase() || '??'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {comment.user ? `${comment.user.first_name || ''} ${comment.user.last_name || ''}`.trim() || 'Utilisateur' : 'Utilisateur'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{parseCommentWithMentions(comment.content)}</p>

                      {/* Display comment images */}
                      {comment.images && comment.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {comment.images.map((img) => {
                            const isPdf = img.file_name?.toLowerCase().endsWith('.pdf');
                            const url = img.display_url || img.image_url;

                            if (isPdf) {
                              return (
                                <a
                                  key={img.id}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                  <FileText className="h-8 w-8 text-red-500 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{img.file_name || 'Document.pdf'}</p>
                                    <p className="text-xs text-muted-foreground">PDF</p>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                                </a>
                              );
                            }

                            return (
                              <a
                                key={img.id}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-lg overflow-hidden border hover:opacity-90 transition-opacity"
                              >
                                <img
                                  src={url}
                                  alt={img.file_name || "Image"}
                                  className="w-full h-24 object-cover"
                                />
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                  {(!comments || comments.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun commentaire
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <div className="space-y-2">
                  {history?.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 shrink-0" />
                      <div>
                        <span className="text-muted-foreground">
                          {item.user ? `${item.user.first_name || ''} ${item.user.last_name || ''}`.trim() || 'Système' : 'Système'}
                        </span>
                        {" - "}
                        <span>{item.action_type === 'created' ? 'a créé la demande' :
                          item.action_type === 'commented' ? 'a commenté' :
                          item.action_type === 'status_changed' ? `a changé le statut vers ${item.new_value}` :
                          item.action_type === 'priority_changed' ? `a changé la priorité vers ${item.new_value}` :
                          item.action_type === 'assigned' ? 'a assigné' :
                          item.action_type === 'image_added' ? item.new_value :
                          item.new_value}
                        </span>
                        <span className="text-xs text-muted-foreground block">
                          {format(new Date(item.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!history || history.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucun historique
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
