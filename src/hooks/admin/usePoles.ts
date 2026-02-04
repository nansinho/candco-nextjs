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
 * Mapping des couleurs CSS pour les badges
 */
export function getPoleBadgeClasses(color: string): string {
  // Si c'est une variable CSS comme "pole-securite"
  if (color.startsWith("pole-")) {
    return `bg-[hsl(var(--${color}))]/10 text-[hsl(var(--${color}))] border-[hsl(var(--${color}))]/20`;
  }
  // Fallback pour les couleurs Tailwind classiques
  const colorMap: Record<string, string> = {
    red: "bg-red-500/10 text-red-600 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    green: "bg-green-500/10 text-green-600 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    orange: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    yellow: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    pink: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    cyan: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  };
  return colorMap[color] || "bg-primary/10 text-primary border-primary/20";
}
