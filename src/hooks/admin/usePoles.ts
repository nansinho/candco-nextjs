"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/queryKeys";

export interface Pole {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePoleInput {
  name: string;
  slug?: string;
  color: string;
  icon: string;
}

export interface UpdatePoleInput {
  name?: string;
  slug?: string;
  color?: string;
  icon?: string;
}

/**
 * Génère un slug à partir du nom
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Récupère tous les pôles
 */
async function fetchPoles(): Promise<Pole[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("poles")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching poles:", error);
    throw error;
  }

  return data || [];
}

/**
 * Récupère un pôle par son ID
 */
async function fetchPoleById(id: string): Promise<Pole | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("poles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching pole:", error);
    return null;
  }

  return data;
}

/**
 * Récupère un pôle par son slug
 */
async function fetchPoleBySlug(slug: string): Promise<Pole | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("poles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching pole by slug:", error);
    return null;
  }

  return data;
}

/**
 * Hook pour récupérer tous les pôles
 */
export function usePoles() {
  return useQuery({
    queryKey: queryKeys.poles.all,
    queryFn: fetchPoles,
    staleTime: 10 * 60 * 1000, // 10 minutes - les pôles changent rarement
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook pour récupérer un pôle par ID
 */
export function usePole(id: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.poles.detail(id || ""),
    queryFn: () => fetchPoleById(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook pour récupérer un pôle par slug
 */
export function usePoleBySlug(slug: string | null | undefined) {
  return useQuery({
    queryKey: ["pole-by-slug", slug],
    queryFn: () => fetchPoleBySlug(slug!),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Hook pour les mutations CRUD sur les pôles
 */
export function usePoleMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const createPole = useMutation({
    mutationFn: async (input: CreatePoleInput) => {
      const slug = input.slug || generateSlug(input.name);
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("poles")
        .insert({
          id: crypto.randomUUID(),
          name: input.name,
          slug,
          color: input.color,
          icon: input.icon,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.poles.all });
    },
  });

  const updatePole = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePoleInput }) => {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("poles")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.poles.all });
    },
  });

  const deletePole = useMutation({
    mutationFn: async (id: string) => {
      // Vérifier si des formations utilisent ce pôle
      const { data: formations } = await supabase
        .from("formations")
        .select("id")
        .eq("pole", (await fetchPoleById(id))?.slug)
        .limit(1);

      if (formations && formations.length > 0) {
        throw new Error("Ce pôle est utilisé par des formations. Veuillez d'abord réassigner ces formations.");
      }

      const { error } = await supabase
        .from("poles")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.poles.all });
    },
  });

  return { createPole, updatePole, deletePole };
}

/**
 * Helper pour déterminer si une couleur hex est claire
 */
function isLightColor(hex: string): boolean {
  if (!hex || !hex.startsWith("#")) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

/**
 * Retourne un style inline pour les badges avec couleur hex
 * À utiliser avec l'attribut style= sur les badges
 */
export function getPoleBadgeStyle(color: string): React.CSSProperties | undefined {
  if (color?.startsWith("#")) {
    return {
      backgroundColor: color,
      color: isLightColor(color) ? "#000" : "#fff",
      borderColor: color,
    };
  }
  return undefined;
}

/**
 * Mapping des couleurs CSS pour les badges - Fond SOLIDE comme l'ancien Lovable
 * @deprecated Utiliser getPoleBadgeStyle pour les couleurs hex
 */
export function getPoleBadgeClasses(color: string): string {
  // Si c'est une couleur hex, retourner une classe vide (utiliser getPoleBadgeStyle à la place)
  if (color?.startsWith("#")) {
    return "";
  }

  // Couleurs CSS variables avec fond SOLIDE
  const poleColorMap: Record<string, string> = {
    "pole-securite": "bg-pole-securite text-pole-securite-foreground",
    "pole-petite-enfance": "bg-pole-petite-enfance text-pole-petite-enfance-foreground",
    "pole-sante": "bg-pole-sante text-pole-sante-foreground",
  };

  if (poleColorMap[color]) {
    return poleColorMap[color];
  }

  // Fallback pour les couleurs Tailwind classiques avec fond solide
  const colorMap: Record<string, string> = {
    red: "bg-red-500 text-white",
    blue: "bg-blue-500 text-white",
    green: "bg-green-500 text-white",
    purple: "bg-purple-500 text-white",
    orange: "bg-orange-500 text-white",
    yellow: "bg-yellow-500 text-yellow-900",
    pink: "bg-pink-500 text-white",
    cyan: "bg-cyan-500 text-white",
  };
  return colorMap[color] || "bg-primary text-primary-foreground";
}
