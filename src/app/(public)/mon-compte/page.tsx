"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  LogOut,
  Settings,
  Shield,
  GraduationCap,
  Calendar,
  FileText,
  Loader2,
  ChevronRight,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  civilite?: string;
}

interface UserRole {
  role: string;
}

const roleLabels: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Administrateur",
  org_manager: "Gestionnaire",
  moderator: "Modérateur",
  formateur: "Formateur",
  client_manager: "Client Manager",
  user: "Utilisateur",
};

const roleColors: Record<string, string> = {
  superadmin: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  admin: "bg-red-500/10 text-red-600 border-red-500/20",
  org_manager: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  moderator: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  formateur: "bg-green-500/10 text-green-600 border-green-500/20",
  client_manager: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  user: "bg-muted text-muted-foreground border-border/30",
};

export default function MonComptePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push("/auth");
          return;
        }

        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, avatar_url, civilite")
          .eq("id", session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email || "",
          first_name: profile?.first_name || session.user.user_metadata?.first_name,
          last_name: profile?.last_name || session.user.user_metadata?.last_name,
          avatar_url: profile?.avatar_url,
          civilite: profile?.civilite,
        });

        // Get user role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();

        setUserRole(roleData?.role || "user");
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [supabase, router]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
  };

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "?";
  };

  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) {
      return user.first_name;
    }
    return user?.email?.split("@")[0] || "Utilisateur";
  };

  const isAdmin = userRole && ["superadmin", "admin", "org_manager", "moderator"].includes(userRole);
  const isFormateur = userRole === "formateur";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <Avatar className="h-20 w-20 ring-4 ring-primary/20">
            <AvatarImage src={user.avatar_url} alt={getUserDisplayName()} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight">
              Bonjour, {getUserDisplayName()}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-muted-foreground">{user.email}</p>
              {userRole && (
                <Badge variant="outline" className={roleColors[userRole] || roleColors.user}>
                  {roleLabels[userRole] || userRole}
                </Badge>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut} disabled={signingOut}>
            {signingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </>
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Admin Access */}
          {isAdmin && (
            <Link href="/admin">
              <Card className="h-full border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Administration</p>
                    <p className="text-sm text-muted-foreground">Accéder au back-office</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Formateur Access */}
          {isFormateur && (
            <Link href="/formateur">
              <Card className="h-full border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-colors cursor-pointer group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Espace Formateur</p>
                    <p className="text-sm text-muted-foreground">Gérer vos sessions</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-green-600 transition-colors" />
                </CardContent>
              </Card>
            </Link>
          )}

          {/* My Formations */}
          <Card className="h-full hover:bg-muted/30 transition-colors cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Mes formations</p>
                <p className="text-sm text-muted-foreground">Inscriptions et historique</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </CardContent>
          </Card>

          {/* My Documents */}
          <Card className="h-full hover:bg-muted/30 transition-colors cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Mes documents</p>
                <p className="text-sm text-muted-foreground">Attestations et certificats</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="h-full hover:bg-muted/30 transition-colors cursor-pointer group">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center">
                <Settings className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Paramètres</p>
                <p className="text-sm text-muted-foreground">Modifier mon profil</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </CardContent>
          </Card>
        </div>

        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Informations personnelles</CardTitle>
            <CardDescription>Vos informations de profil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nom complet</p>
                <p className="font-medium">
                  {user.civilite && `${user.civilite} `}
                  {getUserDisplayName()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
