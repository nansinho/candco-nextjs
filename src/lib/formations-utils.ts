/**
 * @file formations-utils.ts
 * @description Fonctions utilitaires partagées pour les formations
 */

interface Category {
  id: string;
  name: string;
  slug: string;
  pole_id: string | null;
}

interface GroupedFormations<T> {
  category: Category | null;
  formations: T[];
}

/**
 * Récupère l'image d'une formation avec fallback intelligent
 */
export function getFormationImage(formation: {
  id: string;
  pole: string;
  image_url?: string | null;
}): string {
  // Image URL personnalisée
  if (formation.image_url) {
    return formation.image_url;
  }

  // Image par défaut du pôle
  const poleDefaultImages: Record<string, string> = {
    "petite-enfance": "/pole-childhood.jpg",
    "sante": "/pole-health.jpg",
    "securite-prevention": "/pole-security.jpg",
  };

  return poleDefaultImages[formation.pole] || "/pole-security.jpg";
}

/**
 * Mapping des couleurs de pôle vers les classes CSS
 */
export const poleColorClasses: Record<string, string> = {
  "securite-prevention": "pole-securite",
  "petite-enfance": "pole-petite-enfance",
  "sante": "pole-sante",
};

/**
 * Récupère la classe de couleur pour un pôle
 */
export function getPoleColorClass(poleId: string): string {
  return poleColorClasses[poleId] || "primary";
}

/**
 * Groupe des formations par catégorie
 */
export function groupFormationsByCategory<T extends { category_id: string | null }>(
  formations: T[],
  categories: Category[]
): GroupedFormations<T>[] {
  const formationsByCategory = formations.reduce((acc, formation) => {
    const categoryId = formation.category_id || "uncategorized";
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(formation);
    return acc;
  }, {} as Record<string, T[]>);

  const result: GroupedFormations<T>[] = [];

  // Catégories avec formations (dans l'ordre des catégories)
  categories.forEach((category) => {
    const catFormations = formationsByCategory[category.id];
    if (catFormations && catFormations.length > 0) {
      result.push({
        category,
        formations: catFormations,
      });
    }
  });

  // Formations sans catégorie à la fin
  const uncategorized = formationsByCategory["uncategorized"];
  if (uncategorized && uncategorized.length > 0) {
    result.push({
      category: null,
      formations: uncategorized,
    });
  }

  return result;
}
