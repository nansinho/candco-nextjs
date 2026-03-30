/**
 * Source unique de vérité pour les rôles utilisateur.
 * Labels, couleurs de badges (flat + gradient).
 */

export const roleLabels: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Admin",
  org_manager: "Manager",
  moderator: "Modérateur",
  formateur: "Formateur",
  client_manager: "Client",
  user: "Utilisateur",
};

/** Badge flat — Header, mon-compte, messaging, etc. */
export const roleColors: Record<string, string> = {
  superadmin: "bg-red-500/10 text-red-600 border-red-500/20",
  admin: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  org_manager: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  moderator: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  formateur: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  client_manager: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  user: "bg-muted text-muted-foreground border-border/30",
};

/** Badge gradient premium — AdminHeader */
export const roleColorsGradient: Record<string, string> = {
  superadmin: "bg-gradient-to-r from-red-500/20 to-red-600/10 text-red-500 border-red-500/30 shadow-red-500/10",
  admin: "bg-gradient-to-r from-orange-500/20 to-orange-600/10 text-orange-500 border-orange-500/30 shadow-orange-500/10",
  org_manager: "bg-gradient-to-r from-blue-500/20 to-blue-600/10 text-blue-500 border-blue-500/30 shadow-blue-500/10",
  moderator: "bg-gradient-to-r from-purple-500/20 to-purple-600/10 text-purple-500 border-purple-500/30 shadow-purple-500/10",
  formateur: "bg-gradient-to-r from-cyan-500/20 to-cyan-600/10 text-cyan-500 border-cyan-500/30 shadow-cyan-500/10",
  client_manager: "bg-gradient-to-r from-teal-500/20 to-teal-600/10 text-teal-500 border-teal-500/30 shadow-teal-500/10",
  user: "bg-muted text-muted-foreground border-border/30",
};
