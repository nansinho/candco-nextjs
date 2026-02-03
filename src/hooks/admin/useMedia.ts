"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface MediaFile {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  alt_text: string | null;
  description: string | null;
  uploaded_by: string | null;
  created_at: string;
  // Computed
  url?: string;
}

async function fetchMedia(): Promise<MediaFile[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  // Build public URLs
  return data.map((file) => ({
    ...file,
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${file.file_path}`,
  }));
}

export function useMedia() {
  return useQuery({
    queryKey: ["admin", "media"],
    queryFn: fetchMedia,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useMediaMutations() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const uploadFile = useMutation({
    mutationFn: async ({ file, folder = "uploads" }: { file: File; folder?: string }) => {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Create record in media table
      const { error: insertError, data } = await supabase
        .from("media")
        .insert({
          name: file.name,
          file_path: `media/${filePath}`,
          file_type: file.type,
          file_size: file.size,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    },
  });

  const updateMedia = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; alt_text?: string; description?: string } }) => {
      const { error } = await supabase
        .from("media")
        .update(data)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    },
  });

  const deleteMedia = useMutation({
    mutationFn: async (id: string) => {
      // Get file path first
      const { data: file } = await supabase
        .from("media")
        .select("file_path")
        .eq("id", id)
        .single();

      if (file) {
        // Delete from storage
        const storagePath = file.file_path.replace("media/", "");
        await supabase.storage.from("media").remove([storagePath]);
      }

      // Delete record
      const { error } = await supabase
        .from("media")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
    },
  });

  return { uploadFile, updateMedia, deleteMedia };
}
