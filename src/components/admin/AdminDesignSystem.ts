/**
 * @file AdminDesignSystem.ts
 * @description Constantes de style partagées pour l'interface admin.
 * Assure la cohérence visuelle (style Cursor : titres fins, tableaux uniformes).
 * @module Admin/DesignSystem
 *
 * ============================================================
 * RÈGLE CRITIQUE : PAS DE BORDURES GRISES VISIBLES
 * ============================================================
 * Les composants UI (Dialog, Card, AlertDialog, Drawer, etc.)
 * NE DOIVENT PAS avoir de bordures grises visibles.
 *
 * Utiliser :
 * - border-0 pour pas de bordure
 * - bg-muted/30 hover:bg-muted/50 pour différencier les éléments
 * - border-transparent hover:border-primary/30 pour effet hover subtil
 * - border-border/20 MAXIMUM si bordure vraiment nécessaire
 *
 * JAMAIS : border, border-border/30, border-border/50
 * ============================================================
 */

export const adminStyles = {
  // ============================================================
  // LAYOUT DE PAGE
  // ============================================================
  pageLayout: "space-y-4 sm:space-y-6",
  pageLayoutCompact: "space-y-3 sm:space-y-4",

  // ============================================================
  // TITRES (style Cursor : fins, pas bold) - RESPONSIVE
  // ============================================================
  pageTitle: "text-xl sm:text-2xl font-medium tracking-tight",
  pageDescription: "text-xs sm:text-sm text-muted-foreground mt-0.5",
  cardTitle: "text-base sm:text-lg font-medium",
  sectionTitle: "text-sm sm:text-base font-medium",

  // ============================================================
  // PAGES DE DÉTAIL (avec bouton retour)
  // ============================================================
  detailHeader: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
  detailHeaderLeft: "flex items-center gap-3 sm:gap-4",
  backButton: "h-8 w-8 sm:h-9 sm:w-9",
  detailTitle: "text-lg sm:text-xl font-medium tracking-tight",
  detailSubtitle: "text-xs sm:text-sm text-muted-foreground",

  // ============================================================
  // TABLEAUX - polices compactes style SaaS
  // ============================================================
  tableHead: "text-muted-foreground font-normal text-[11px] sm:text-xs",
  tableRow: "border-b border-border/30 hover:bg-muted/30",
  tableRowClickable: "border-b border-border/30 hover:bg-muted/30 cursor-pointer transition-colors",
  tableRowHeader: "hover:bg-transparent border-b border-border/50",
  tableCell: "text-[11px] sm:text-xs",
  tableCellMuted: "text-[11px] sm:text-xs text-muted-foreground",

  // Table wrapper pour scroll horizontal
  tableWrapper: "overflow-x-auto",
  tableContainer: "min-w-[600px]",

  // Boutons d'action dans les tableaux
  tableActionButton: "h-6 w-6 sm:h-7 sm:w-7",
  tableActionButtonMobile: "h-8 w-8",
  tableActionsWrapper: "flex items-center justify-end gap-0",

  // ============================================================
  // TABS STANDARDISÉS - scrollable horizontalement sur mobile
  // ============================================================
  tabsList: "inline-flex w-max",
  tabsListWrapper: "relative w-full overflow-x-auto overflow-y-visible pb-2 -mb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
  tabsTrigger: "flex-shrink-0 flex items-center gap-2 whitespace-nowrap",
  tabsContent: "mt-4",

  // ============================================================
  // FILTRES ET RECHERCHE
  // ============================================================
  filterWrapper: "flex flex-col gap-4 sm:flex-row",
  searchInput: "pl-10",
  searchWrapper: "relative flex-1 max-w-md",
  selectFilter: "w-full sm:w-[150px] text-xs sm:text-sm h-9",
  selectFilterWide: "w-full sm:w-[180px] text-xs sm:text-sm h-9",

  // ============================================================
  // CARDS
  // ============================================================
  statsCard: "border-0 bg-secondary/30",
  contentCard: "border-0 bg-card",
  filterCard: "border-0 bg-secondary/30",
  detailCard: "border-0 bg-secondary/30 p-4 sm:p-6 rounded-lg",
  detailCardHeader: "flex items-center justify-between mb-4",

  // ============================================================
  // AVATARS STANDARDISÉS
  // ============================================================
  avatarSm: "h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0",
  avatarMd: "h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0",
  avatarLg: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0",
  avatarSquare: "h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0",
  avatarText: "text-xs font-medium text-primary",
  avatarTextSm: "text-[10px] font-medium text-primary",

  // ============================================================
  // LOADERS ET ÉTATS VIDES
  // ============================================================
  loaderWrapper: "flex items-center justify-center py-12",
  loaderIcon: "h-8 w-8 animate-spin text-primary",
  emptyStateWrapper: "py-8 sm:py-12",

  // ============================================================
  // DIALOGS / MODALS
  // ============================================================
  dialogContent: "max-h-[90vh] overflow-y-auto",
  dialogSpacing: "space-y-4 py-4",
  dialogFooter: "flex justify-end gap-2 pt-4",

  // ============================================================
  // BADGES DE RÔLE
  // ============================================================
  roleBadge: {
    admin: "bg-destructive/10 text-destructive border-destructive/20",
    org_manager: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    user: "bg-muted text-muted-foreground border-border/30",
  },

  // ============================================================
  // BOUTONS D'ACTION
  // ============================================================
  actionButton: {
    primary: "default" as const,
    secondary: "outline" as const,
    destructive: "ghost" as const,
    tableAction: "ghost" as const,
  },

  // ============================================================
  // FORMULAIRES
  // ============================================================
  formLabel: "text-sm font-medium",
  formInput: "h-10",
  formSpacing: "space-y-4",
  formFooter: "flex justify-end gap-2 pt-4",

  // ============================================================
  // PAGINATION
  // ============================================================
  paginationWrapper: "flex items-center justify-between px-2 py-4",
  paginationInfo: "text-sm text-muted-foreground",
  paginationButtons: "flex items-center gap-2",
} as const;

// ============================================================
// HELPERS EXPORTÉS
// ============================================================

// Table helpers
export const tableHeadClass = adminStyles.tableHead;
export const tableRowClass = adminStyles.tableRow;
export const tableRowClickableClass = adminStyles.tableRowClickable;
export const tableRowHeaderClass = adminStyles.tableRowHeader;
export const tableCellClass = adminStyles.tableCell;

// Layout helpers
export const pageLayoutClass = adminStyles.pageLayout;
export const loaderWrapperClass = adminStyles.loaderWrapper;

// Detail page helpers
export const detailHeaderClass = adminStyles.detailHeader;
export const backButtonClass = adminStyles.backButton;
