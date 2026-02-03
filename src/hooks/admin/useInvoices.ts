"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface Invoice {
  id: string;
  number: string;
  client_id: string | null;
  formation_id: string | null;
  session_id: string | null;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  date: string;
  due_date: string;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  client_name?: string;
  formation_title?: string;
}

export interface CreateInvoiceInput {
  number: string;
  client_id?: string;
  formation_id?: string;
  session_id?: string;
  amount: number;
  status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  date: string;
  due_date: string;
  notes?: string;
}

export interface UpdateInvoiceInput {
  number?: string;
  client_id?: string;
  formation_id?: string;
  session_id?: string;
  amount?: number;
  status?: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  date?: string;
  due_date?: string;
  paid_at?: string | null;
  notes?: string | null;
}

interface RawInvoice {
  id: string;
  number: string;
  client_id: string | null;
  formation_id: string | null;
  session_id: string | null;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  date: string;
  due_date: string;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  clients: { nom: string } | null;
  formations: { title: string } | null;
}

async function fetchInvoices(): Promise<Invoice[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      clients:client_id(nom),
      formations:formation_id(title)
    `)
    .order("date", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return (data as RawInvoice[]).map((item) => ({
    ...item,
    client_name: item.clients?.nom || null,
    formation_title: item.formations?.title || null,
  }));
}

export function useInvoices() {
  return useQuery({
    queryKey: ["admin", "invoices"],
    queryFn: fetchInvoices,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useInvoiceMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const createInvoice = useMutation({
    mutationFn: async (input: CreateInvoiceInput) => {
      const { error, data } = await supabase
        .from("invoices")
        .insert({
          ...input,
          status: input.status || "draft",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] });
    },
  });

  const updateInvoice = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateInvoiceInput }) => {
      const { error } = await supabase
        .from("invoices")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] });
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] });
    },
  });

  const markAsPaid = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("invoices")
        .update({
          status: "paid",
          paid_at: new Date().toISOString()
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Invoice["status"] }) => {
      const updates: UpdateInvoiceInput = { status };
      if (status === "paid") {
        updates.paid_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from("invoices")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] });
    },
  });

  return { createInvoice, updateInvoice, deleteInvoice, markAsPaid, updateStatus };
}
