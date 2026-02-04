"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

// ============================================
// TYPES
// ============================================

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface Question {
  id: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "number" | "date" | "email" | "phone";
  label: string;
  required: boolean;
  options?: QuestionOption[];
  placeholder?: string;
  helpText?: string;
  conditionalLogic?: {
    questionId: string;
    operator: "equals" | "not_equals" | "contains";
    value: string;
  };
  allowOther?: boolean;
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface NeedsAnalysisTemplate {
  id: string;
  name: string;
  description: string | null;
  questions: Section[];
  formation_id: string | null;
  formation_name?: string | null;
  is_default: boolean | null;
  active: boolean | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Computed fields
  responses_count?: number;
  questions_count?: number;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  questions: Section[];
  formation_id?: string | null;
  is_default?: boolean;
  active?: boolean;
}

export interface UpdateTemplateInput extends Partial<CreateTemplateInput> {
  id: string;
}

// ============================================
// FETCH FUNCTIONS
// ============================================

async function fetchTemplates(): Promise<NeedsAnalysisTemplate[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("needs_analysis_templates")
    .select(`
      *,
      formations:formation_id(id, title)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  // Get response counts for each template
  const { data: responseCounts } = await supabase
    .from("needs_analysis_responses")
    .select("template_id");

  const countMap = new Map<string, number>();
  responseCounts?.forEach((r: { template_id: string }) => {
    countMap.set(r.template_id, (countMap.get(r.template_id) || 0) + 1);
  });

  return data.map((item: Record<string, unknown>) => {
    const questions = (item.questions as Section[]) || [];
    const questionsCount = questions.reduce((acc, section) => acc + (section.questions?.length || 0), 0);
    const itemId = item.id as string;

    return {
      ...item,
      questions,
      formation_name: (item.formations as { title: string } | null)?.title || null,
      responses_count: countMap.get(itemId) || 0,
      questions_count: questionsCount,
    };
  });
}

async function fetchTemplateById(id: string): Promise<NeedsAnalysisTemplate | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("needs_analysis_templates")
    .select(`
      *,
      formations:formation_id(id, title)
    `)
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return {
    ...data,
    questions: (data.questions as Section[]) || [],
    formation_name: (data.formations as { title: string } | null)?.title || null,
  };
}

// ============================================
// HOOKS
// ============================================

export function useNeedsAnalysisTemplates() {
  return useQuery({
    queryKey: ["admin", "needs-analysis-templates"],
    queryFn: fetchTemplates,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useNeedsAnalysisTemplate(id: string | null) {
  return useQuery({
    queryKey: ["admin", "needs-analysis-templates", id],
    queryFn: () => (id ? fetchTemplateById(id) : null),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useNeedsAnalysisTemplateMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const createTemplate = useMutation({
    mutationFn: async (input: CreateTemplateInput) => {
      const { data, error } = await supabase
        .from("needs_analysis_templates")
        .insert({
          name: input.name,
          description: input.description || null,
          questions: input.questions as unknown as Record<string, unknown>,
          formation_id: input.formation_id || null,
          is_default: input.is_default || false,
          active: input.active ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "needs-analysis-templates"] });
    },
  });

  const updateTemplate = useMutation({
    mutationFn: async (input: UpdateTemplateInput) => {
      const { id, ...updates } = input;
      const updateData: Record<string, unknown> = {};

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.questions !== undefined) updateData.questions = updates.questions as unknown as Record<string, unknown>;
      if (updates.formation_id !== undefined) updateData.formation_id = updates.formation_id;
      if (updates.is_default !== undefined) updateData.is_default = updates.is_default;
      if (updates.active !== undefined) updateData.active = updates.active;
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("needs_analysis_templates")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "needs-analysis-templates"] });
    },
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("needs_analysis_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "needs-analysis-templates"] });
    },
  });

  const duplicateTemplate = useMutation({
    mutationFn: async (id: string) => {
      // First, get the template to duplicate
      const { data: original, error: fetchError } = await supabase
        .from("needs_analysis_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Create a new template with copied data
      const { data, error } = await supabase
        .from("needs_analysis_templates")
        .insert({
          name: `${original.name} (copie)`,
          description: original.description,
          questions: original.questions,
          formation_id: original.formation_id,
          is_default: false, // Never duplicate as default
          active: false, // Start inactive
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "needs-analysis-templates"] });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("needs_analysis_templates")
        .update({ active, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "needs-analysis-templates"] });
    },
  });

  return {
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    toggleActive,
  };
}
