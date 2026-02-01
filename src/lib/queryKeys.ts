/**
 * @file queryKeys.ts
 * @description Centralized query key factory for React Query.
 * Provides consistent, type-safe query keys for cache management.
 */

export const queryKeys = {
  // ============================================
  // PUBLIC / FORMATIONS
  // ============================================
  formations: {
    all: ["formations"] as const,
    lists: () => [...queryKeys.formations.all, "list"] as const,
    list: (filters?: { pole?: string; category?: string }) =>
      [...queryKeys.formations.lists(), filters] as const,
    details: () => [...queryKeys.formations.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.formations.details(), id] as const,
    byPole: (poleId: string) => ["pole-formations", poleId] as const,
  },

  poles: {
    all: ["poles"] as const,
    counts: () => [...queryKeys.poles.all, "counts"] as const,
  },

  sessions: {
    all: ["sessions"] as const,
    public: () => [...queryKeys.sessions.all, "public"] as const,
    counts: () => [...queryKeys.sessions.all, "counts"] as const,
  },

  // ============================================
  // ADMIN
  // ============================================
  admin: {
    // Dashboard
    dashboard: {
      all: ["admin-dashboard"] as const,
      stats: () => [...queryKeys.admin.dashboard.all, "stats"] as const,
    },

    // Users
    users: {
      all: ["admin-users"] as const,
      list: (page?: number, search?: string) =>
        [...queryKeys.admin.users.all, page, search] as const,
      detail: (userId: string) =>
        [...queryKeys.admin.users.all, userId] as const,
      history: (userId: string, limit?: number) =>
        ["user-history", userId, limit] as const,
    },

    // Organizations
    organizations: {
      all: ["admin-organizations"] as const,
      forClients: () => ["admin-organizations-for-clients"] as const,
    },

    // Formations
    formations: {
      all: ["admin-formations"] as const,
      list: () => [...queryKeys.admin.formations.all, "list"] as const,
      detail: (id: string) => [...queryKeys.admin.formations.all, id] as const,
    },

    // Sessions
    sessions: {
      all: ["admin-sessions"] as const,
      list: () => [...queryKeys.admin.sessions.all, "list"] as const,
      detail: (id: string) => [...queryKeys.admin.sessions.all, id] as const,
      history: (sessionId: string) => ["session-history", sessionId] as const,
    },

    // Formateurs
    formateurs: {
      all: ["admin-formateurs"] as const,
      specialites: () => ["admin-formateur-specialites"] as const,
      disponibilites: () => ["admin-formateurs-disponibilites"] as const,
    },

    // Clients
    clients: {
      all: ["admin-clients"] as const,
      detail: (id: string) => [...queryKeys.admin.clients.all, id] as const,
      sessions: (id: string, options?: { includeChildren?: boolean }) =>
        ["client-sessions", id, options] as const,
      sessionCount: (id: string, includeChildren?: boolean) =>
        ["client-session-count", id, includeChildren] as const,
    },

    // Articles / Blog
    articles: {
      all: ["admin-articles"] as const,
      detail: (id: string) => [...queryKeys.admin.articles.all, id] as const,
    },

    // Planning
    planning: {
      all: ["admin-planning"] as const,
      formateurs: () => ["admin-planning-formateurs"] as const,
      sessions: (startDate?: string, endDate?: string) =>
        ["admin-planning-sessions", startDate, endDate] as const,
      disponibilites: (startDate?: string, endDate?: string) =>
        ["admin-planning-disponibilites", startDate, endDate] as const,
      recurrences: () => ["admin-planning-recurrences"] as const,
    },

    // Inscriptions
    inscriptions: {
      all: ["admin-inscriptions"] as const,
      list: () => [...queryKeys.admin.inscriptions.all, "list"] as const,
    },

    // Contacts
    contacts: {
      all: ["admin-contacts"] as const,
    },

    // Notifications
    notifications: {
      all: ["admin-notifications"] as const,
    },
  },

  // ============================================
  // FORMATEUR
  // ============================================
  formateur: {
    profile: (userId?: string) => ["formateur-for-user", userId] as const,

    sessions: {
      all: ["formateur-sessions"] as const,
      list: (userId?: string, filter?: string) =>
        [...queryKeys.formateur.sessions.all, userId, filter] as const,
    },

    documents: {
      all: ["formateur-documents"] as const,
      list: (formateurId?: string) =>
        [...queryKeys.formateur.documents.all, formateurId] as const,
    },

    disponibilites: {
      all: ["formateur-disponibilites"] as const,
      range: (userId?: string, startDate?: string, endDate?: string) =>
        [
          ...queryKeys.formateur.disponibilites.all,
          userId,
          startDate,
          endDate,
        ] as const,
    },

    agenda: {
      sessions: (userId?: string, startDate?: string, endDate?: string) =>
        ["agenda-sessions", userId, startDate, endDate] as const,
      disponibilites: (userId?: string, startDate?: string, endDate?: string) =>
        ["agenda-disponibilites", userId, startDate, endDate] as const,
      recurrences: (userId?: string) => ["agenda-recurrences", userId] as const,
    },
  },

  // ============================================
  // USER / APPRENANT
  // ============================================
  user: {
    profile: (userId?: string) => ["user-profile", userId] as const,
    inscriptions: (userId?: string) => ["user-inscriptions", userId] as const,
    documents: (userId?: string) => ["user-documents", userId] as const,
  },
} as const;

// Type helpers
export type QueryKeys = typeof queryKeys;
