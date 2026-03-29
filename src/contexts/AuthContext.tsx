"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Types
export type UserRole =
  | "superadmin"
  | "admin"
  | "org_manager"
  | "moderator"
  | "formateur"
  | "client_manager"
  | "user"
  | null;

export interface UserOrganization {
  id: string;
  organization_id: string;
  organization_name: string;
  role: "manager" | "viewer";
  is_primary: boolean;
}

export interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  telephone: string | null;
  entreprise: string | null;
  image_rights_consent: boolean | null;
  image_rights_consent_date: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  userRole: UserRole;
  userOrganizations: UserOrganization[];
  currentOrganizationId: string | null;
  setCurrentOrganizationId: (id: string | null) => void;
  // Simulation de rôle (admin uniquement)
  simulatedRole: UserRole;
  setSimulatedRole: (role: UserRole) => void;
  effectiveRole: UserRole;
  // Profil utilisateur
  userProfile: UserProfile | null;
  isFormateur: boolean;
  // Auth functions
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    civilite?: string
  ) => Promise<{ error: Error | null; data?: { user: User | null } }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache localStorage
const ROLE_CACHE_KEY = "auth_role_cache";
const ROLE_CACHE_EXPIRY_KEY = "auth_role_cache_expiry";
const ROLE_CACHE_USER_KEY = "auth_role_cache_user";
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes

const getCachedRole = (
  userId: string
): { role: UserRole; isAdmin: boolean } | null => {
  if (typeof window === "undefined") return null;
  try {
    const cachedUser = localStorage.getItem(ROLE_CACHE_USER_KEY);
    const cachedExpiry = localStorage.getItem(ROLE_CACHE_EXPIRY_KEY);
    const cachedRole = localStorage.getItem(ROLE_CACHE_KEY);

    if (!cachedUser || !cachedExpiry || !cachedRole) return null;
    if (cachedUser !== userId) return null;
    if (Date.now() > parseInt(cachedExpiry, 10)) {
      clearRoleCache();
      return null;
    }

    const role = cachedRole as UserRole;
    return { role, isAdmin: role === "admin" || role === "superadmin" };
  } catch {
    return null;
  }
};

const setCachedRole = (userId: string, role: UserRole) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ROLE_CACHE_USER_KEY, userId);
    localStorage.setItem(ROLE_CACHE_KEY, role || "user");
    localStorage.setItem(
      ROLE_CACHE_EXPIRY_KEY,
      String(Date.now() + CACHE_DURATION_MS)
    );
  } catch {
    // Ignore localStorage errors
  }
};

const clearRoleCache = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ROLE_CACHE_USER_KEY);
    localStorage.removeItem(ROLE_CACHE_KEY);
    localStorage.removeItem(ROLE_CACHE_EXPIRY_KEY);
  } catch {
    // Ignore localStorage errors
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>(
    []
  );
  const [currentOrganizationId, setCurrentOrganizationId] = useState<
    string | null
  >(null);
  const [simulatedRole, setSimulatedRole] = useState<UserRole>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isFormateur, setIsFormateur] = useState(false);

  const roleLoadedForUserRef = useRef<string | null>(null);
  const isCheckingRoleRef = useRef(false);

  // Rôle effectif : simulé ou réel
  const effectiveRole =
    (userRole === "admin" || userRole === "superadmin") && simulatedRole
      ? simulatedRole
      : userRole;

  const isFullyLoading = loading || roleLoading;

  const resetUserState = () => {
    setIsAdmin(false);
    setUserRole(null);
    setUserOrganizations([]);
    setCurrentOrganizationId(null);
    setSimulatedRole(null);
    setUserProfile(null);
    setIsFormateur(false);
  };

  const refreshUserProfile = useCallback(async () => {
    if (!user) return;

    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const { profile } = await res.json();
        if (profile) {
          setUserProfile({
            first_name: profile.first_name,
            last_name: profile.last_name,
            avatar_url: profile.avatar_url,
            telephone: null,
            entreprise: null,
            image_rights_consent: null,
            image_rights_consent_date: null,
          });
        }
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  }, [user]);

  const checkUserRoleAndOrganizations = async (
    userId: string
  ): Promise<void> => {
    if (isCheckingRoleRef.current) return;
    isCheckingRoleRef.current = true;

    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const { role: fetchedRole, profile } = res.ok
        ? await res.json()
        : { role: "user", profile: null };

      if (profile) {
        setUserProfile({
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          telephone: null,
          entreprise: null,
          image_rights_consent: null,
          image_rights_consent_date: null,
        });
      }

      const role = (fetchedRole as UserRole) || "user";
      setUserRole(role);
      setIsAdmin(role === "admin" || role === "superadmin");
      roleLoadedForUserRef.current = userId;
      setCachedRole(userId, role);
    } catch {
      setUserRole("user");
      setIsAdmin(false);
      roleLoadedForUserRef.current = userId;
    } finally {
      isCheckingRoleRef.current = false;
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const userId = session.user.id;

        const cachedData = getCachedRole(userId);
        if (cachedData) {
          setUserRole(cachedData.role);
          setIsAdmin(cachedData.isAdmin);
          roleLoadedForUserRef.current = userId;
        } else if (!isCheckingRoleRef.current) {
          setRoleLoading(true);
          checkUserRoleAndOrganizations(userId).finally(() => {
            setRoleLoading(false);
          });
        }
      } else {
        if (event === "SIGNED_OUT") {
          roleLoadedForUserRef.current = null;
          clearRoleCache();
          resetUserState();
        }
        setRoleLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const userId = session.user.id;

        const cachedData = getCachedRole(userId);
        if (cachedData) {
          setUserRole(cachedData.role);
          setIsAdmin(cachedData.isAdmin);
          roleLoadedForUserRef.current = userId;
        } else if (!isCheckingRoleRef.current) {
          setRoleLoading(true);
          await checkUserRoleAndOrganizations(userId);
          setRoleLoading(false);
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    civilite?: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          civilite: civilite,
        },
      },
    });

    return { error, data: data.user ? { user: data.user } : undefined };
  };

  const signOut = async () => {
    resetUserState();
    roleLoadedForUserRef.current = null;
    clearRoleCache();

    try {
      await supabase.auth.signOut({ scope: "global" });
    } catch (error) {
      console.error("Error during sign out:", error);
    }

    setUser(null);
    setSession(null);
    router.push("/");
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.functions.invoke(
        "request-password-reset",
        {
          body: { email },
        }
      );

      if (error) {
        return { error: new Error(error.message || "Erreur lors de l'envoi") };
      }

      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message || "Erreur lors de l'envoi") };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading: isFullyLoading,
        isAdmin,
        userRole,
        userOrganizations,
        currentOrganizationId,
        setCurrentOrganizationId,
        simulatedRole,
        setSimulatedRole,
        effectiveRole,
        userProfile,
        isFormateur,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
