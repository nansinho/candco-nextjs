"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  display_order: number;
  active: boolean;
}

export interface FAQItem {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  keywords: string[] | null;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
  display_order: number;
  active: boolean;
}

export function useFAQCategories() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin-faq-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_categories")
        .select("*")
        .order("display_order");

      if (error) throw error;
      return data as FAQCategory[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFAQItems() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["admin-faq-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_items")
        .select("*")
        .order("display_order");

      if (error) throw error;
      return data as FAQItem[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useFAQMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Category mutations
  const createCategory = useMutation({
    mutationFn: async (category: Omit<FAQCategory, "id">) => {
      const { data, error } = await supabase
        .from("faq_categories")
        .insert(category)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq-categories"] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...category }: Partial<FAQCategory> & { id: string }) => {
      const { error } = await supabase
        .from("faq_categories")
        .update(category)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq-categories"] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faq_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq-categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin-faq-items"] });
    },
  });

  // Item mutations
  const createItem = useMutation({
    mutationFn: async (item: Omit<FAQItem, "id" | "view_count" | "helpful_count" | "not_helpful_count">) => {
      const { data, error } = await supabase
        .from("faq_items")
        .insert({ ...item, view_count: 0, helpful_count: 0, not_helpful_count: 0 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq-items"] });
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...item }: Partial<FAQItem> & { id: string }) => {
      const { error } = await supabase.from("faq_items").update(item).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq-items"] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faq_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq-items"] });
    },
  });

  const toggleItemActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("faq_items").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq-items"] });
    },
  });

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    createItem,
    updateItem,
    deleteItem,
    toggleItemActive,
  };
}
