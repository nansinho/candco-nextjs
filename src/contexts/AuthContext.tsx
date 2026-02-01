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
import { User, Session } from "@supabase/supabase-js";
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
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

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
      const { data: profileData } = await supabase
        .from("profiles")
        .select(
          "first_name, last_name, avatar_url, telephone, entreprise, image_rights_consent, image_rights_consent_date"
        )
        .eq("id", user.id)
        .single();

      if (profileData) {
        setUserProfile(profileData);
      }
    } catch (error) {
      console.error("Error refreshing user profile:", error);
    }
  }, [user, supabase]);

  const checkUserRoleAndOrganizations = async (
    userId: string,
    retryCount = 0
  ): Promise<void> => {
    if (isCheckingRoleRef.current) return;

    isCheckingRoleRef.current = true;

    try {
      const [roleResult, orgsResult, profileResult, formateurResult] =
        await Promise.all([
          supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", userId)
            .maybeSingle(),
          supabase
            .from("user_organizations")
            .select(
              `
              id,
              organization_id,
              role,
              is_primary,
              organizations!inner(name)
            `
            )
            .eq("user_id", userId),
          supabase
            .from("profiles")
            .select(
              "first_name, last_name, avatar_url, telephone, entreprise, image_rights_consent, image_rights_consent_date"
            )
            .eq("id", userId)
            .single(),
          supabase
            .from("formateurs")
            .select("id")
            .eq("user_id", userId)
            .eq("active", true)
            .maybeSingle(),
        ]);

      const { data: roleData, error: roleError } = roleResult;
      const { data: orgsData, error: orgsError } = orgsResult;
      const { data: profileData } = profileResult;
      const { data: formateurData } = formateurResult;

      if (profileData) {
        setUserProfile(profileData);
      }

      setIsFormateur(!!formateurData);

      if (roleError) {
        console.error("Error checking user role:", roleError);

        if (retryCount < 1) {
          isCheckingRoleRef.current = false;
          await new Promise((resolve) => setTimeout(resolve, 200));
          return checkUserRoleAndOrganizations(userId, retryCount + 1);
        }

        if (!userRole) {
          setUserRole("user");
          setIsAdmin(false);
        }
        roleLoadedForUserRef.current = userId;
        isCheckingRoleRef.current = false;
        return;
      }

      const role = (roleData?.role as UserRole) || "user";
      setUserRole(role);
      setIsAdmin(role === "admin" || role === "superadmin");
      roleLoadedForUserRef.current = userId;

      setCachedRole(userId, role);

      if (role === "org_manager" && !orgsError && orgsData) {
        const organizations: UserOrganization[] = orgsData.map((org: any) => ({
          id: org.id,
          organization_id: org.organization_id,
          organization_name: org.organizations?.name || "Organisme inconnu",
          role: org.role as "manager" | "viewer",
          is_primary: org.is_primary,
        }));

        setUserOrganizations(organizations);

        const primaryOrg = organizations.find((org) => org.is_primary);
        setCurrentOrganizationId(
          primaryOrg?.organization_id ||
            organizations[0]?.organization_id ||
            null
        );
      } else {
        setUserOrganizations([]);
        setCurrentOrganizationId(null);
      }
    } catch (error) {
      console.error("Error checking user role:", error);

      if (retryCount < 1) {
        isCheckingRoleRef.current = false;
        await new Promise((resolve) => setTimeout(resolve, 200));
        return checkUserRoleAndOrganizations(userId, retryCount + 1);
      }

      if (!userRole) {
        setUserRole("user");
        setIsAdmin(false);
      }
      roleLoadedForUserRef.current = userId;
    } finally {
      isCheckingRoleRef.current = false;
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const userId = session.user.id;

        const cachedData = getCachedRole(userId);
        if (cachedData && roleLoadedForUserRef.current !== userId) {
          setUserRole(cachedData.role);
          setIsAdmin(cachedData.isAdmin);
        }

        if (
          roleLoadedForUserRef.current !== userId &&
          !isCheckingRoleRef.current
        ) {
          setRoleLoading(true);
          setTimeout(() => {
            checkUserRoleAndOrganizations(userId).finally(() => {
              setRoleLoading(false);
            });
          }, 0);
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

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const userId = session.user.id;

        const cachedData = getCachedRole(userId);
        if (cachedData) {
          setUserRole(cachedData.role);
          setIsAdmin(cachedData.isAdmin);
        }

        if (
          roleLoadedForUserRef.current !== userId &&
          !isCheckingRoleRef.current
        ) {
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
