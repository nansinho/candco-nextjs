/**
 * Maps the various domaine values from produits_formation to standardized pole info.
 * The domaine field in the database has inconsistent naming (with/without code prefix, different dashes).
 * This normalizer handles all known variants.
 */

export interface PoleInfo {
  pole: string;
  pole_name: string;
  color: string;
}

const POLE_SECURITE: PoleInfo = {
  pole: "securite-prevention",
  pole_name: "Sécurité & Prévention",
  color: "pole-securite",
};

const POLE_ENFANCE: PoleInfo = {
  pole: "petite-enfance",
  pole_name: "Petite Enfance",
  color: "pole-petite-enfance",
};

const POLE_SANTE: PoleInfo = {
  pole: "sante",
  pole_name: "Santé",
  color: "pole-sante",
};

const POLE_ENTREPRENEURIAT: PoleInfo = {
  pole: "entrepreneuriat",
  pole_name: "Entrepreneuriat",
  color: "primary",
};

const DEFAULT_POLE: PoleInfo = {
  pole: "autre",
  pole_name: "Autre",
  color: "primary",
};

/**
 * Returns standardized pole info from a raw domaine string.
 */
export function getPoleFromDomaine(domaine: string | null | undefined): PoleInfo {
  if (!domaine) return DEFAULT_POLE;

  const lower = domaine.toLowerCase();

  if (lower.includes("sécurité") || lower.includes("securite") || lower.includes("spr")) {
    return POLE_SECURITE;
  }
  if (lower.includes("enfance") || lower.includes("pee") || lower.includes("éducation")) {
    return POLE_ENFANCE;
  }
  if (lower.includes("santé") || lower.includes("sante")) {
    return POLE_SANTE;
  }
  if (lower.includes("entrepreneur") || lower.includes("ent ")) {
    return POLE_ENTREPRENEURIAT;
  }

  return DEFAULT_POLE;
}

/**
 * Returns the domaine filter values for a given pole slug.
 * Used when filtering formations by pole on public pages.
 */
export function getDomaineFiltersForPole(poleSlug: string): string[] | null {
  switch (poleSlug) {
    case "securite-prevention":
      return ["sécurité", "securite", "spr"];
    case "petite-enfance":
      return ["enfance", "pee", "éducation"];
    case "sante":
      return ["santé", "sante"];
    case "entrepreneuriat":
      return ["entrepreneur", "ent"];
    default:
      return null;
  }
}

/** All known poles for site navigation */
export const ALL_POLES = [POLE_SECURITE, POLE_ENFANCE, POLE_SANTE, POLE_ENTREPRENEURIAT] as const;
