"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, FileText, Code, CheckCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, useNotificationMutations } from "@/hooks/admin/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { data: notifications = [], isLoading } = useNotifications();
  const { markAsRead, markAllAsRead } = useNotificationMutations();

  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const recentNotifications = notifications.slice(0, 15);

  // Compter par type
  const devCount = notifications.filter(
    (n) => (n.type === "system" || n.type === "push") && !n.read_at
  ).length;
  const demandesCount = notifications.filter(
    (n) => (n.type === "info" || n.type === "email") && !n.read_at
  ).length;

  const handleMarkAllAsRead = () => {
    if (user?.id) {
      markAllAsRead.mutate(user.id);
    }
  };

  const handleNotificationClick = (notification: {
    id: string;
    link: string | null;
    read_at: string | null;
  }) => {
    if (!notification.read_at) {
      markAsRead.mutate(notification.id);
    }
    if (notification.link) {
      setOpen(false);
      router.push(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "system":
      case "push":
        return <Code className="h-4 w-4 text-blue-500" />;
      case "email":
      case "info":
      default:
        return <FileText className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center text-[10px] bg-red-500 text-white border-0"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[450px] p-0">
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-lg">Notifications</SheetTitle>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} non lues
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                Tout marquer comme lu
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Compteurs par catégorie */}
        <div className="flex gap-3 p-4 border-b border-border bg-secondary/30">
          <div className="flex-1 text-center p-3 bg-background rounded-xl border border-border/50">
            <Code className="h-5 w-5 mx-auto mb-1.5 text-blue-500" />
            <div className="text-2xl font-bold">{devCount}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Système
            </div>
          </div>
          <div className="flex-1 text-center p-3 bg-background rounded-xl border border-border/50">
            <FileText className="h-5 w-5 mx-auto mb-1.5 text-amber-500" />
            <div className="text-2xl font-bold">{demandesCount}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">
              Demandes
            </div>
          </div>
        </div>

        {/* Section "RÉCENTES" */}
        <div className="px-4 py-3 border-b border-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Récentes
          </span>
        </div>

        {/* Liste des notifications */}
        <ScrollArea className="h-[calc(100vh-320px)]">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Chargement...
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Aucune notification
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Les nouvelles notifications apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-4 hover:bg-secondary/50 cursor-pointer transition-colors",
                    !notification.read_at && "bg-primary/5"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mt-0.5 p-2 rounded-full bg-secondary">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm leading-tight",
                        !notification.read_at ? "font-medium" : "text-muted-foreground"
                      )}
                    >
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground/70 mt-1.5">
                      {notification.created_at
                        ? formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: fr,
                          })
                        : ""}
                    </p>
                  </div>
                  {!notification.read_at && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
          <Button
            variant="outline"
            className="w-full h-10 text-sm font-medium"
            onClick={() => {
              setOpen(false);
              router.push("/admin/notifications");
            }}
          >
            Voir toutes les notifications
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
