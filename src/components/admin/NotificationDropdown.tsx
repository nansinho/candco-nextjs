"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, FileText, Code, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const recentNotifications = notifications.slice(0, 8);

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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
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
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Tout lu
            </Button>
          )}
        </div>

        {/* Compteurs par catégorie */}
        <div className="flex gap-2 p-3 border-b border-border bg-secondary/30">
          <div className="flex-1 text-center p-2 bg-background rounded-lg border border-border/50">
            <Code className="h-4 w-4 mx-auto mb-1 text-blue-500" />
            <div className="text-lg font-bold">{devCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Dev
            </div>
          </div>
          <div className="flex-1 text-center p-2 bg-background rounded-lg border border-border/50">
            <FileText className="h-4 w-4 mx-auto mb-1 text-amber-500" />
            <div className="text-lg font-bold">{demandesCount}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
              Demandes
            </div>
          </div>
        </div>

        {/* Section "RÉCENTES" */}
        <div className="px-3 py-2 border-b border-border">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Récentes
          </span>
        </div>

        {/* Liste des notifications */}
        <ScrollArea className="h-[280px]">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Chargement...
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                Aucune notification
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-3 hover:bg-secondary/50 cursor-pointer transition-colors",
                    !notification.read_at && "bg-primary/5"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="mt-0.5 p-1.5 rounded-full bg-secondary">
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
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {notification.created_at
                        ? formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: fr,
                          })
                        : ""}
                    </p>
                  </div>
                  {!notification.read_at && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            className="w-full h-9 text-sm font-medium"
            onClick={() => {
              setOpen(false);
              router.push("/admin/notifications");
            }}
          >
            Voir le tableau de bord
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
