/**
 * Badge styles for admin components
 * Pattern: bg-color/10 border-color/20 text-color
 */

export const badgeBase = {
  size: "text-xs",
  sizeCompact: "text-[10px] sm:text-xs",
  withIcon: "gap-1",
  iconSize: "h-3 w-3",
  iconSizeCompact: "h-2.5 w-2.5 sm:h-3 sm:w-3",
} as const;

export const badgeStyles = {
  // Roles
  superadmin: "bg-red-500/10 text-red-600 border border-red-500/20",
  admin: "bg-orange-500/10 text-orange-600 border border-orange-500/20",
  org_manager: "bg-violet-500/10 text-violet-600 border border-violet-500/20",
  moderator: "bg-purple-500/10 text-purple-600 border border-purple-500/20",
  user: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  formateur: "bg-cyan-500/10 text-cyan-600 border border-cyan-500/20",

  // Generic status
  success: "bg-green-500/10 text-green-600 border border-green-500/20",
  warning: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
  error: "bg-destructive/10 text-destructive border border-destructive/20",
  info: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  muted: "bg-muted/50 text-muted-foreground border border-muted-foreground/20",

  // Form field status
  filled: "bg-green-500/10 text-green-600 border border-green-500/20",
  missing: "bg-orange-500/10 text-orange-600 border border-orange-500/20",
  validated: "bg-blue-500/10 text-blue-600 border border-blue-500/20",

  // Publication
  active: "bg-green-500/10 text-green-600 border border-green-500/20",
  inactive: "bg-muted/50 text-muted-foreground border border-muted-foreground/20",
  published: "bg-green-500/10 text-green-600 border border-green-500/20",
  draft: "bg-muted/50 text-muted-foreground border border-muted-foreground/20",

  // Priority (Kanban)
  urgente: "bg-red-500/10 text-red-600 border border-red-500/20",
  haute: "bg-orange-500/10 text-orange-600 border border-orange-500/20",
  moyenne: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
  basse: "bg-green-500/10 text-green-600 border border-green-500/20",

  // Poles
  poleSecurite: "bg-orange-500/80 text-white border border-orange-600/20",
  polePetiteEnfance: "bg-purple-500/80 text-white border border-purple-600/20",
  poleSante: "bg-blue-500/80 text-white border border-blue-600/20",
} as const;

export type BadgeStyleKey = keyof typeof badgeStyles;

export const getPoleStyle = (poleId: string): string => {
  switch (poleId) {
    case "securite-prevention":
      return badgeStyles.poleSecurite;
    case "petite-enfance":
      return badgeStyles.polePetiteEnfance;
    case "sante":
      return badgeStyles.poleSante;
    default:
      return badgeStyles.muted;
  }
};
