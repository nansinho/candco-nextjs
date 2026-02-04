/**
 * Utilitaire centralisé pour les couleurs des pôles de formation.
 *
 * Les couleurs sont définies dans globals.css comme variables CSS:
 * - --pole-securite: Rouge/Orange
 * - --pole-petite-enfance: Teal/Turquoise
 * - --pole-sante: Bleu
 *
 * Ce fichier fournit des fonctions pour utiliser ces couleurs de manière cohérente
 * dans toute l'application (admin, public, blog, etc.)
 */

// Mapping slug de formation → variable CSS
export const POLE_SLUG_TO_CSS_VAR: Record<string, string> = {
  "petite-enfance": "--pole-petite-enfance",
  "securite-prevention": "--pole-securite",
  "sante": "--pole-sante",
};

// Mapping nom de classe legacy (DB) → variable CSS
export const POLE_CLASS_TO_CSS_VAR: Record<string, string> = {
  "pole-petite-enfance": "--pole-petite-enfance",
  "pole-securite": "--pole-securite",
  "pole-sante": "--pole-sante",
};

/**
 * Obtient la couleur CSS pour un slug de pôle (pour les styles inline)
 * @param slug - Le slug du pôle (ex: "petite-enfance", "securite-prevention", "sante")
 * @returns La couleur CSS au format hsl(var(--pole-xxx))
 */
export function getPoleColor(slug: string): string {
  const cssVar = POLE_SLUG_TO_CSS_VAR[slug];
  return cssVar ? `hsl(var(${cssVar}))` : "hsl(var(--muted))";
}

/**
 * Obtient la couleur CSS à partir d'une valeur de couleur (hex ou classe legacy)
 * @param color - La valeur de couleur (hex comme "#A92323" ou classe comme "pole-securite")
 * @returns La couleur CSS utilisable en style inline
 */
export function getDisplayColor(color: string): string {
  if (!color) return "hsl(var(--muted))";

  // Si c'est déjà un hex, le retourner tel quel
  if (color.startsWith("#")) {
    return color;
  }

  // Si c'est une classe legacy, convertir en variable CSS
  const cssVar = POLE_CLASS_TO_CSS_VAR[color];
  return cssVar ? `hsl(var(${cssVar}))` : "hsl(var(--muted))";
}

/**
 * Obtient les classes Tailwind pour un badge de pôle
 * @param slug - Le slug du pôle
 * @returns Les classes Tailwind pour le background et le texte
 */
export function getPoleColorClass(slug: string): string {
  const map: Record<string, string> = {
    "petite-enfance": "bg-pole-petite-enfance text-pole-petite-enfance-foreground",
    "securite-prevention": "bg-pole-securite text-pole-securite-foreground",
    "sante": "bg-pole-sante text-pole-sante-foreground",
  };
  return map[slug] || "bg-muted text-muted-foreground";
}

/**
 * Obtient le style inline pour un badge de pôle
 * @param slug - Le slug du pôle
 * @returns Un objet de style React avec backgroundColor et color
 */
export function getPoleStyle(slug: string): React.CSSProperties {
  return {
    backgroundColor: getPoleColor(slug),
    color: "#fff",
  };
}
