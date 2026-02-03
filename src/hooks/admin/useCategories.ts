"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface Category {
  id: string;
  name: string;
  slug: string;
  pole_id: string | null;
  count: number | null;
  created_at: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  pole_id?: string;
}

async function fetchCategories(): Promise<Category[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export function useCategories() {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function useCategoryMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const createCategory = useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const slug = input.slug || generateSlug(input.name);
      const { error, data } = await supabase
        .from("categories")
        .insert({ ...input, slug })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateCategoryInput> }) => {
      const { error } = await supabase
        .from("categories")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });

  return { createCategory, updateCategory, deleteCategory };
}
